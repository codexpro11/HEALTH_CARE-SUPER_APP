import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import type { MedicalRecord } from '../../types';
import { isDemoMode } from '../../lib/demo';
import { useNfcDemoState } from '../../lib/useNfcDemoState';
import { recordScope, sharingProviders } from '../../lib/medicalRecordRules';

export function RecordSharing({ record, compact = false }: { record: MedicalRecord; compact?: boolean }) {
  if (!isDemoMode) return compact ? null : <p className="text-sm text-slate-500">Provider access must be confirmed by the connected backend.</p>;
  return <DemoRecordSharing record={record} compact={compact} />;
}
function DemoRecordSharing({ record, compact }: { record: MedicalRecord; compact: boolean }) {
  const { state, error } = useNfcDemoState();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);
  const providers = sharingProviders(record, state?.consents ?? [], now);
  if (error) return <span className="text-xs text-rose-700">Sharing status unavailable</span>;
  if (!state) return <span className="text-xs text-slate-500">Checking sharing...</span>;
  if (compact) return <span className="inline-flex items-center gap-1 text-xs text-slate-500">
    {providers.length ? <ShieldCheck className="h-3.5 w-3.5 text-teal-600" /> : <ShieldAlert className="h-3.5 w-3.5" />}
    {providers.length ? `Summary allowed for ${providers.length} provider${providers.length === 1 ? '' : 's'}` : 'Summary not shared'}
  </span>;
  return <section aria-label="Record sharing" className="rounded-xl border border-teal-200 bg-teal-50 p-4 dark:bg-teal-950 dark:border-teal-900">
    <h2 className="font-bold text-sm text-teal-900 dark:text-teal-100">Who can access this summary?</h2>
    <p className="text-sm mt-2 text-slate-700 dark:text-slate-300">{providers.length ? providers.join(', ') :
      record.status === 'ARCHIVED' ? 'Archived records are excluded from provider summaries.' :
      record.confidentialityLevel !== 'STANDARD' ? 'This privacy level excludes the record from provider demo summaries.' :
      'No active provider consent includes this record.'}</p>
    <p className="text-xs mt-2 text-slate-600 dark:text-slate-400">Scope: {recordScope(record.recordType) ?? 'Unavailable'}. A fresh standard NFC scan is required. Attachments remain in your patient workspace.</p>
    <Link to="/app/consent" className="mt-3 inline-block text-sm font-semibold underline text-teal-800 dark:text-teal-200">Manage provider access</Link>
  </section>;
}
