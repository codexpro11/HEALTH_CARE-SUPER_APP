import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowLeft, ShieldCheck, Phone, FileText, ShieldAlert } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { useAuth } from '../../../auth/AuthContext';
import { currentNfcAccess, NFC_CHANGED, type DemoGrant } from '../../../lib/nfcDemo';

export const ProviderNfcSummaryPage: React.FC = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [grant, setGrant] = useState<DemoGrant | null>(() => currentNfcAccess(id));
  useEffect(() => {
    const refresh = () => setGrant(currentNfcAccess(id));
    refresh();
    window.addEventListener(NFC_CHANGED, refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    const current = currentNfcAccess(id);
    const timer = current ? setTimeout(refresh, Math.max(0, current.expiresAt - Date.now()) + 20) : undefined;
    return () => {
      window.removeEventListener(NFC_CHANGED, refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      clearTimeout(timer);
    };
  }, [id]);

  if (!grant) return <Card className="p-6 space-y-4 max-w-xl mx-auto">
    <ShieldAlert className="w-8 h-8 text-rose-600" />
    <h1 className="text-xl font-bold">Patient access denied</h1>
    <p role="alert" className="text-sm text-slate-600 dark:text-slate-300">Scan an active card with valid demo authorization. Access may have expired or been revoked. No patient details are shown.</p>
    <Button onClick={() => navigate('/provider/nfc-scanner')}>Return to Scanner</Button>
  </Card>;

  const has = (scope: string) => grant.scopes.includes(scope);
  const clinical = has('Medical Summary');
  const age = user?.dateOfBirth ? Math.floor((Date.now() - Date.parse(user.dateOfBirth)) / (365.25 * 86400000)) : null;
  return <div className="space-y-6 max-w-5xl mx-auto">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button onClick={() => navigate('/provider/nfc-scanner')} className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 dark:text-teal-300"><ArrowLeft className="w-4 h-4" />New Scan</button>
      <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold">{grant.emergency ? 'Emergency Access' : 'Authorized Access'} · Demo</span>
    </div>
    <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Patient Access Summary</h1>
    <p className="text-xs text-slate-500">Access expires at {new Date(grant.expiresAt).toLocaleTimeString()}. Card or consent changes invalidate this view.</p>
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 space-y-6">
        <Card className="p-6 text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-3xl font-black text-teal-700">{user?.fullName.slice(0, 1)}</div>
          <h2 className="text-xl font-black">{user?.fullName}</h2>
          <p className="text-sm text-slate-500">{age !== null && Number.isFinite(age) ? age + ' Yrs' : 'Age not supplied'} · {user?.gender?.replaceAll('_', ' ') ?? 'Not supplied'}</p>
          <p className="text-xs font-mono text-slate-400">ID: {grant.patientId}</p>
        </Card>
        {(clinical || has('Blood Group') || has('Critical Allergies') || has('Emergency Contacts')) && <Card className="p-5 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-rose-500" />Critical Information</h3>
          {(clinical || has('Blood Group')) && <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20"><p className="text-xs font-bold text-rose-600">Blood Group</p><p className="text-xl font-black">{user?.bloodGroup ?? 'Not supplied'}</p></div>}
          {(clinical || has('Critical Allergies')) && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs font-bold text-amber-700">Allergies</p><p>{user?.allergies?.join(', ') || 'No allergy information supplied'}</p></div>}
          {(clinical || has('Emergency Contacts')) && <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"><Phone className="w-4 h-4 mb-2" /><p className="text-xs font-bold text-slate-500">Emergency Contact</p><p>{user?.emergencyContact?.name ?? 'Not supplied'}</p><p className="text-sm">{user?.emergencyContact?.phone ?? ''}</p></div>}
        </Card>}
      </div>
      <div className="w-full md:w-2/3 space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            {['Provider role checked', 'Demo hospital verified', 'Active NFC credential', grant.emergency ? 'Emergency reason recorded' : 'Patient consent checked'].map(label => <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex gap-2"><ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />{label}</div>)}
          </div>
          <h3 className="font-bold text-lg">Granted Access Scopes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{grant.scopes.map(scope => <div key={scope} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-teal-600" /><span className="font-bold">{scope}</span></div>)}</div>
        </Card>
        {clinical && <Card className="p-6 space-y-3"><h3 className="font-bold flex gap-2"><FileText className="w-5 h-5 text-teal-600" />Medical Summary</h3><p className="text-sm">{user?.chronicConditions?.join(', ') || 'No condition information supplied'}</p></Card>}
        {has('Current Medications') && <Card className="p-6"><h3 className="font-bold">Current Medications</h3><p className="text-sm text-slate-500 mt-2">No medication information supplied for this demo profile.</p></Card>}
        {has('Insurance') && <Card className="p-6 space-y-3"><h3 className="font-bold">Insurance Information</h3><p>SecureHealth Insurance · Comprehensive Family Care</p><p className="text-sm font-mono">XXXX-XXXX-9482 · Sample policy</p></Card>}
      </div>
    </div>
  </div>;
};
