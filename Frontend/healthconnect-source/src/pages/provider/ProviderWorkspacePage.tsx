import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Users, FileText, Pill, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { mockDoctors } from '../../data/mockData';
import { isDemoMode } from '../../lib/demo';
import { NFC_CHANGED } from '../../lib/nfcDemo';
import { allowedProviderTransitions } from '../../lib/providerRules';
import { changeProviderAppointment, getProviderAppointments, providerRecords, PROVIDER_CHANGED,
  saveProviderConsultation, selectDemoDoctor, selectedDemoDoctor } from '../../lib/providerDemo';
import type { Appointment, AppointmentStatus } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

type View = 'dashboard' | 'appointments' | 'patients' | 'records' | 'prescriptions';
const titles: Record<View, string> = {
  dashboard: 'Doctor Workspace', appointments: 'Provider Appointments', patients: 'My Patients',
  records: 'Authorized Medical Records', prescriptions: 'Consultation Prescriptions',
};
const inputClass = 'block w-full rounded-xl border border-slate-300 bg-white dark:bg-slate-900 dark:border-slate-700 p-3 mt-2 text-sm';
const statusLabel = (value: string) => value.replaceAll('_', ' ');
const failureMessage = (failure: unknown) => failure instanceof Error ? failure.message : 'Unable to save changes.';

export function ProviderWorkspacePage({ view = 'dashboard' }: { view?: View }) {
  const { user } = useAuth();
  const { id } = useParams();
  const [doctorId, setDoctorId] = useState(() => selectedDemoDoctor().id);
  const [queue, setQueue] = useState<Appointment[]>([]);
  const [loadedFor, setLoadedFor] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [notes, setNotes] = useState('');
  const [prescription, setPrescription] = useState('');
  const [, refreshAccess] = useState(0);
  const accountKey = (user?.id ?? '') + '|' + doctorId;
  const appointments = loadedFor === accountKey ? queue : [];
  const selected = id ? appointments.find(item => item.id === id) : undefined;
  const doctor = mockDoctors.find(item => item.id === doctorId) ?? mockDoctors[0];

  const refresh = () => {
    try {
      const list = getProviderAppointments(doctorId);
      setQueue(list);
      setLoadedFor(accountKey);
      setError('');
    } catch (failure) {
      setQueue([]);
      setLoadedFor(accountKey);
      setError(failureMessage(failure));
    }
  };
  useEffect(() => {
    if (isDemoMode && user?.role === 'DOCTOR') refresh();
    const changed = () => { refreshAccess(value => value + 1); if (user?.role === 'DOCTOR') refresh(); };
    window.addEventListener(PROVIDER_CHANGED, changed);
    window.addEventListener(NFC_CHANGED, changed);
    window.addEventListener('storage', changed);
    window.addEventListener('focus', changed);
    // Recheck expiry while a protected record view is open.
    const timer = view === 'records' ? window.setInterval(() => refreshAccess(value => value + 1), 1000) : undefined;
    return () => {
      window.removeEventListener(PROVIDER_CHANGED, changed);
      window.removeEventListener(NFC_CHANGED, changed);
      window.removeEventListener('storage', changed);
      window.removeEventListener('focus', changed);
      window.clearInterval(timer);
    };
  }, [accountKey, user?.role, view]);

  useEffect(() => {
    setNotes(selected?.consultation?.notes ?? '');
    setPrescription(selected?.consultation?.prescription ?? '');
    setNotice('');
  }, [id, accountKey, selected?.consultation?.updatedAt]);

  const perform = (operation: () => void, message: string) => {
    try { operation(); refresh(); setNotice(message); setError(''); }
    catch (failure) { setError(failureMessage(failure)); setNotice(''); }
  };
  const changeStatus = (next: AppointmentStatus) => {
    if (!selected) return;
    if (['CANCELLED', 'NO_SHOW', 'COMPLETED'].includes(next) &&
      !window.confirm('Mark this demo appointment ' + statusLabel(next).toLowerCase() +
        (next === 'COMPLETED' ? '? The consultation will become read-only.' : '?'))) return;
    perform(() => changeProviderAppointment(doctorId, selected.id, next, { notes, prescription }),
      'Demo appointment updated to ' + statusLabel(next).toLowerCase() + '.');
  };

  if (!isDemoMode) return <Card className="p-6 space-y-3"><h1 className="text-xl font-bold">Provider integration pending</h1>
    <p>The provider API must be connected before these workflows can operate on live appointments.</p></Card>;
  if (user?.role !== 'DOCTOR') return <Card className="p-6 space-y-3"><h1 className="text-xl font-bold">Doctor access required</h1>
    <p>Clinical notes, prescriptions and appointment management are available to the Doctor persona.</p>
    <Link to="/provider/nfc-scanner" className="text-teal-700 underline">Open authorized NFC scanner</Link></Card>;

  const filtered = appointments.filter(item => (filter === 'ALL' || item.status === filter) &&
    (item.patientName + ' ' + item.id + ' ' + item.reasonForVisit).toLowerCase().includes(search.toLowerCase()));
  let recordError = '';
  let records: ReturnType<typeof providerRecords> = [];
  if (view === 'records') {
    try { records = providerRecords(doctorId); }
    catch (failure) { recordError = failureMessage(failure); }
  }
  const cards = [
    { name: 'Appointments', count: appointments.length, icon: Calendar, path: 'appointments' },
    { name: 'Active consultations', count: appointments.filter(item => item.status === 'IN_PROGRESS').length, icon: FileText, path: 'appointments' },
    { name: 'Patients', count: new Set(appointments.map(item => item.patientId)).size, icon: Users, path: 'patients' },
    { name: 'Completed visits', count: appointments.filter(item => item.status === 'COMPLETED').length, icon: ShieldCheck, path: 'appointments' },
  ];

  return <div className="space-y-6 max-w-6xl mx-auto">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs uppercase tracking-wider font-bold text-teal-700 dark:text-teal-300">Phase 2 · Provider frontend</p>
        <h1 className="text-2xl font-black mt-1">{titles[view]}</h1>
        <p className="text-sm text-slate-500 mt-2">One account, paired patient and doctor personas. All clinical data here is simulated.</p></div>
      <Link to="/provider/progress" className="text-sm font-semibold text-teal-700 underline">View phases &amp; side-by-side changes</Link>
    </div>
    <Card className="p-4">
      <label className="text-sm font-bold">Demo doctor
        <select aria-label="Demo doctor" value={doctorId} className={inputClass} onChange={event => {
          try { selectDemoDoctor(event.target.value); setDoctorId(event.target.value); setNotice(''); setError(''); }
          catch (failure) { setError(failureMessage(failure)); }
        }}>{mockDoctors.map(item => <option key={item.id} value={item.id}>{item.name} · {item.specialization}</option>)}</select>
      </label>
      <p className="text-xs text-slate-500 mt-2">{doctor.hospitalAffiliation}. Selecting a persona does not grant access to another account.</p>
    </Card>
    {notice && <p role="status" className="rounded-xl p-3 bg-teal-50 text-teal-800">{notice}</p>}
    {error && <Card className="p-4"><p role="alert" className="text-rose-700 mb-3">{error}</p><Button variant="outline" onClick={refresh}>Retry</Button></Card>}

    {view === 'dashboard' && <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">{cards.map(({ name, count, icon: Icon, path }) =>
        <Link key={name} to={'/provider/' + path}><Card className="p-5 hover:border-teal-400">
          <Icon className="w-5 h-5 text-teal-600 mb-4" /><p className="text-3xl font-black">{count}</p>
          <p className="text-sm text-slate-500 mt-2">{name}</p></Card></Link>)}</div>
      <Card className="p-6 space-y-4"><h2 className="text-lg font-bold">Continue a consultation</h2>
        <p className="text-sm text-slate-500">Open an assigned appointment, start the demo consultation, save notes, and complete the visit.</p>
        <div className="flex flex-wrap gap-3"><Link to="/provider/appointments"><Button>View appointments <ArrowRight className="w-4 h-4" /></Button></Link>
          <Link to="/provider/nfc-scanner"><Button variant="outline">Scan patient NFC</Button></Link></div></Card>
    </>}

    {view === 'appointments' && !id && <>
      <Card className="p-4 grid sm:grid-cols-2 gap-4">
        <label className="text-sm font-bold">Search appointments<input aria-label="Search appointments" value={search} onChange={e => setSearch(e.target.value)} className={inputClass} placeholder="Patient, ID or reason" /></label>
        <label className="text-sm font-bold">Appointment status<select aria-label="Appointment status" value={filter} onChange={e => setFilter(e.target.value)} className={inputClass}>
          {['ALL', 'BOOKED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map(status =>
            <option key={status} value={status}>{statusLabel(status)}</option>)}</select></label>
      </Card>
      <div className="space-y-3">{filtered.map(item => <Link key={item.id} to={'/provider/appointments/' + item.id} className="block">
        <Card className="p-5 flex flex-wrap items-center justify-between gap-4 hover:border-teal-400">
          <div><h2 className="font-bold">{item.patientName}</h2><p className="text-sm text-slate-500 mt-1">{item.appointmentDate} · {item.appointmentTime} · {statusLabel(item.consultationType)}</p>
            <p className="text-xs text-slate-500 mt-2">{item.reasonForVisit}</p></div>
          <div className="text-right"><span className="text-xs font-bold rounded-full bg-teal-50 text-teal-800 px-3 py-1">{statusLabel(item.status)}</span>
            <p className="text-xs text-teal-700 mt-3">Open appointment →</p></div></Card></Link>)}
        {!filtered.length && !error && <Card className="p-6"><p>No appointments match this doctor or filter. Book a visit from the Patient Demo to add one.</p></Card>}
      </div>
    </>}

    {view === 'appointments' && id && !selected && !error && <Card className="p-6"><h2 className="font-bold">Appointment unavailable</h2>
      <p className="text-sm mt-2">This ID is not assigned to the current demo doctor and account.</p><Link to="/provider/appointments" className="underline text-teal-700">Return to appointments</Link></Card>}

    {view === 'appointments' && selected && <>
      <Link to="/provider/appointments" className="text-sm underline text-teal-700">← All appointments</Link>
      <Card className="p-6 space-y-4"><div className="flex flex-wrap justify-between gap-3">
        <div><h2 className="text-xl font-bold">{selected.patientName}</h2><p className="text-sm text-slate-500">{selected.appointmentDate} · {selected.appointmentTime}</p></div>
        <span className="text-sm font-bold">{statusLabel(selected.status)}</span></div>
        <p className="text-sm">{selected.reasonForVisit}</p>
        <div className="flex flex-wrap gap-2">{allowedProviderTransitions(selected.status).filter(next => next !== 'COMPLETED').map(next =>
          <Button key={next} variant={next === 'CANCELLED' ? 'danger' : 'outline'} onClick={() => changeStatus(next)}>
            {next === 'IN_PROGRESS' ? 'Start Consultation' : next === 'CONFIRMED' ? 'Confirm Appointment' : next === 'NO_SHOW' ? 'Mark No-show' : 'Cancel Appointment'}
          </Button>)}</div>
      </Card>
      <Card className="p-6 space-y-4"><h2 className="text-lg font-bold">Consultation notes</h2>
        <p className="text-sm text-slate-500">Start the consultation to edit. Completion saves the latest notes and locks the visit.</p>
        <form className="space-y-4" onSubmit={event => { event.preventDefault(); perform(() =>
          saveProviderConsultation(doctorId, selected.id, notes, prescription), 'Consultation draft saved in this browser.'); }}>
          <label className="block text-sm font-bold">Clinical notes<textarea aria-label="Clinical notes" required minLength={10} maxLength={10000} rows={5}
            disabled={selected.status !== 'IN_PROGRESS'} value={notes} onChange={e => setNotes(e.target.value)} className={inputClass} /></label>
          <label className="block text-sm font-bold">Demo prescription draft (optional)<textarea aria-label="Demo prescription draft (optional)" maxLength={4000} rows={3}
            disabled={selected.status !== 'IN_PROGRESS'} value={prescription} onChange={e => setPrescription(e.target.value)} className={inputClass} /></label>
          <p className="text-xs text-amber-800 dark:text-amber-300">Demo text only. This is not a signed prescription and cannot be used to dispense medication.</p>
          {selected.status === 'IN_PROGRESS' && <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="outline">Save Consultation Draft</Button>
            <Button type="button" onClick={() => changeStatus('COMPLETED')}>Complete Demo Consultation</Button></div>}
        </form>
        <div className="space-y-2">{selected.providerTimeline?.map((event, index) =>
          <p key={index} className="text-xs text-slate-500">{statusLabel(event.status)} · {new Date(event.at).toLocaleString()}</p>)}</div>
      </Card>
    </>}

    {view === 'patients' && <div className="space-y-3">
      {[...new Set(appointments.map(item => item.patientId))].map(patientId => {
        const visits = appointments.filter(item => item.patientId === patientId);
        return <Card key={patientId} className="p-5 space-y-3"><h2 className="font-bold">{visits[0].patientName}</h2>
          <p className="text-sm text-slate-500">{visits.length} assigned demo visits. Medical records require separate patient consent.</p>
          <Link to="/provider/appointments" className="text-teal-700 underline text-sm">View appointments</Link></Card>;
      })}
      {!appointments.length && !error && <Card className="p-6">No patients assigned to this demo doctor.</Card>}
    </div>}

    {view === 'records' && <>
      {recordError ? <Card className="p-6 space-y-3"><h2 className="font-bold">Patient access required</h2><p role="alert" className="text-sm">{recordError}</p>
        <Link to="/provider/nfc-scanner" className="text-teal-700 underline">Open NFC scanner</Link></Card> : <>
        <p className="text-sm text-teal-700">Showing standard record summaries within the current consent scopes. Private attachments remain excluded.</p>
        {records.map(record => <Card key={record.id} className="p-5 space-y-2"><h2 className="font-bold">{record.title}</h2>
          <p className="text-xs text-slate-500">{statusLabel(record.recordType)} · {record.date}</p><p className="text-sm">{record.summary}</p></Card>)}
        {!records.length && <Card className="p-6">No standard record summaries are allowed by the current consent scopes.</Card>}
      </>}
    </>}

    {view === 'prescriptions' && <>
      <p className="text-sm text-amber-800 dark:text-amber-300">Demo prescription text from this doctor's consultations. No medication is issued or transmitted.</p>
      {appointments.filter(item => item.consultation?.prescription).map(item =>
        <Card key={item.id} className="p-5 space-y-3"><div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{item.patientName}</h2>
          <span className="text-xs font-semibold">{item.status === 'COMPLETED' ? 'Completed demo visit' : 'Draft'}</span></div>
          <p className="whitespace-pre-wrap text-sm">{item.consultation?.prescription}</p>
          <Link to={'/provider/appointments/' + item.id} className="text-sm underline text-teal-700">View consultation</Link></Card>)}
      {!appointments.some(item => item.consultation?.prescription) && !error && <Card className="p-6"><Pill className="w-5 h-5 text-teal-600 mb-3" />No prescription drafts yet. Save one during an active demo consultation.</Card>}
    </>}
  </div>;
}
