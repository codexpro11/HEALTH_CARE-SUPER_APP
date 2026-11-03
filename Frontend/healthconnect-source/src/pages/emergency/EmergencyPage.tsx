import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MapPin, Siren, Phone, History } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { emergencyApi } from '../../api/emergencyApi';
import { useAuth } from '../../auth/AuthContext';
import { isDemoMode } from '../../lib/demo';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ErrorState } from '../../components/common/ErrorState';

export function EmergencyPage() {
  const { user } = useAuth();
  const { activeRequest, busy, error, owner, restore, setIsTriggerModalOpen, cancelEmergency } = useEmergencyStore();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [reason, setReason] = useState('Created in error');
  const [filter, setFilter] = useState('ALL');
  const client = useQueryClient();
  const history = useQuery({ queryKey: ['emergency-history', user?.id], queryFn: emergencyApi.getHistory, refetchInterval: isDemoMode ? false : 15000 });
  const request = owner === user?.id ? activeRequest : null;
  const items = (history.data?.data ?? []).filter(item => filter === 'ALL' || item.status === filter);
  const contact = user?.emergencyContact;
  const contactPhone = contact?.phone?.replace(/[^+0-9]/g, '');
  const cancel = async () => {
    if (await cancelEmergency(reason)) {
      setConfirmCancel(false);
      client.invalidateQueries({ queryKey: ['emergency-history'] });
    }
  };
  return <div className="max-w-5xl mx-auto space-y-6">
    <div className="flex flex-wrap justify-between items-start gap-4">
      <div><p className="text-xs font-bold uppercase tracking-wider text-rose-600">Phase 5 · Emergency & notifications</p>
        <h1 className="text-2xl font-black mt-2 flex items-center gap-2"><Siren className="text-rose-600" />Emergency assistance</h1>
        <p className="text-sm text-slate-500 mt-2">Save a request, check its status and keep your location details together.</p></div>
      <Link to="/app/notifications" className="text-teal-700 dark:text-teal-300 underline text-sm">Open notification inbox</Link>
    </div>
    <Card className="p-5 border-rose-200 bg-rose-50 dark:bg-rose-950 dark:border-rose-900">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div><h2 className="font-bold text-rose-900 dark:text-rose-200">{isDemoMode ? 'Demo workspace - no dispatch or contact alerts' : 'For urgent assistance, call emergency services directly'}</h2>
          <p className="text-sm mt-1">{isDemoMode ? 'Requests remain in this browser. No ambulance, hospital bed or arrival time is assigned.' : 'An app request is not a confirmed response. Use the phone link for direct assistance.'}</p></div>
        <a href="tel:112" className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-white font-bold"><Phone className="w-4 h-4" />Call 112 · India</a>
      </div>
      <a href="https://112.gov.in/" target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs underline">India Emergency Response Support System</a>
    </Card>
    {error && <ErrorState message={error} onRetry={() => user && restore(user.id)} />}
    {busy && !request && <p role="status" className="text-sm text-slate-500">Loading emergency request.</p>}
    {request ? <Card className="p-6 space-y-5 border-rose-200">
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-bold">Active {isDemoMode ? 'demo ' : ''}request</h2><p className="text-xs text-slate-500 break-all mt-1">{request.id}</p></div>
        <span className="h-fit rounded-full bg-amber-100 text-amber-900 text-xs font-bold px-3 py-2">{request.status}</span></div>
      <div className="grid sm:grid-cols-2 gap-5 text-sm">
        <div><p className="text-slate-500">Request type</p><p className="font-semibold mt-1">{request.emergencyType}</p><p className="text-xs text-slate-500 mt-2">{new Date(request.createdAt).toLocaleString()}</p></div>
        <div><p className="text-slate-500 flex items-center gap-1"><MapPin className="w-4 h-4" />Saved location · {request.locationSource ?? 'not specified'}</p><p className="font-semibold mt-1 break-words">{request.address}</p>
          {request.latitude !== undefined && request.longitude !== undefined && <p className="text-xs mt-2">{request.latitude.toFixed(5)}, {request.longitude.toFixed(5)} · accuracy about {Math.round(request.accuracyMeters ?? 0)} m{request.locationCapturedAt && ' · captured ' + new Date(request.locationCapturedAt).toLocaleTimeString()}</p>}</div>
      </div>
      <p className="text-sm text-slate-500">{isDemoMode ? 'Awaiting a real service integration. This demo does not progress to dispatched or arrived.' : 'Status is the last server response. Refresh to retrieve changes.'}</p>
      <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => user && restore(user.id)}>Refresh status</Button>
        {request.status === 'PENDING' && <Button variant="danger" disabled={busy} onClick={() => setConfirmCancel(true)}>Cancel request</Button>}</div>
    </Card> : <Card className="p-8 text-center space-y-4">
      <Siren className="w-12 h-12 text-rose-600 mx-auto" /><h2 className="text-xl font-bold">No active request</h2>
      <p className="text-sm text-slate-500">Use device location or enter an address and confirm before saving.</p>
      <Button variant="danger" size="lg" disabled={busy || !!error} onClick={() => setIsTriggerModalOpen(true)}>{isDemoMode ? 'Create demo SOS' : 'Create SOS request'}</Button>
    </Card>}
    <div className="grid sm:grid-cols-2 gap-4">
      <Card className="p-5 space-y-2"><h2 className="font-bold">Emergency contact</h2>
        {contactPhone ? <><p className="text-sm">{contact?.name} · {contact?.relationship}</p>{isDemoMode ? <p className="text-xs text-slate-500">Sample contact details. No automatic message is sent.</p> : <a href={'tel:' + contactPhone} className="inline-block text-teal-700 dark:text-teal-300 underline">Call saved contact</a>}</> : <p className="text-sm text-slate-500">Add a contact to your profile for quick access.</p>}
        <Link to="/app/profile" className="inline-block text-sm underline text-teal-700 dark:text-teal-300">Edit contact</Link></Card>
      <Card className="p-5 space-y-2"><h2 className="font-bold">Find healthcare services</h2><p className="text-sm text-slate-500">Directory entries are sample data in demo mode. Confirm availability directly.</p>
        <Link to="/app/hospitals" className="inline-block text-teal-700 dark:text-teal-300 underline text-sm">Hospital directory</Link></Card>
    </div>
    <Card className="p-5 space-y-4"><div className="flex flex-wrap justify-between gap-3 items-center"><h2 className="font-bold flex items-center gap-2"><History className="w-4 h-4" />Request history</h2>
      <label className="text-sm">History status <select className="border rounded-lg p-2 dark:bg-slate-900" value={filter} onChange={e => setFilter(e.target.value)}>{['ALL', 'PENDING', 'DISPATCHED', 'EN_ROUTE', 'ARRIVED', 'RESOLVED', 'CANCELLED'].map(value => <option key={value}>{value}</option>)}</select></label></div>
      {history.isError ? <ErrorState message={history.error.message} onRetry={() => history.refetch()} /> : history.isLoading ? <p role="status">Loading history.</p> : items.length === 0 ? <p className="text-sm text-slate-500">No requests match this view.</p> : items.map(item => <div key={item.id} className="border-t pt-4 text-sm space-y-1">
        <div className="flex flex-wrap justify-between gap-2"><span className="font-bold">{item.emergencyType}</span><span className="text-xs font-semibold">{item.status}</span></div>
        <p className="break-words">{item.address}</p><p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
        {item.cancelledAt && <p className="text-xs text-slate-500">Cancelled {new Date(item.cancelledAt).toLocaleString()} · {item.cancellationReason}</p>}
      </div>)}
    </Card>
    <Modal isOpen={confirmCancel} onClose={() => { if (!busy) setConfirmCancel(false); }} title="Cancel this request?">
      <div className="space-y-4"><p className="text-sm">{isDemoMode ? 'This cancels only the local demo request.' : 'Cancellation must be confirmed by the service. It does not end a phone call or cancel help requested separately.'}</p>
        <label className="block text-sm">Cancellation reason<select className="block border rounded-lg p-3 mt-2 w-full dark:bg-slate-900" value={reason} onChange={e => setReason(e.target.value)}><option>Created in error</option><option>Assistance requested by phone</option><option>No longer needed</option></select></label>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => setConfirmCancel(false)}>Keep request</Button><Button variant="danger" isLoading={busy} onClick={cancel}>Confirm cancellation</Button></div>
      </div>
    </Modal>
  </div>;
}
