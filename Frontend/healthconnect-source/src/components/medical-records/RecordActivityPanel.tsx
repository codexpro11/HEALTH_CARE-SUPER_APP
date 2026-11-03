import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { isDemoMode } from '../../lib/demo';
import { useNfcDemoState } from '../../lib/useNfcDemoState';
import { Card } from '../common/Card';
import { ErrorState } from '../common/ErrorState';

export function RecordActivityPanel() {
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['record-activity'], queryFn: medicalRecordApi.getActivity });
  return <div className="space-y-5">
    <Card>
      <h2 className="font-bold flex items-center gap-2"><History className="h-4 w-4 text-teal-600" />Your document activity</h2>
      <p className="text-xs text-slate-500 mt-1">{isDemoMode ? 'Recent activity from this demo account, saved in this browser.' : 'Activity returned by your connected backend.'}</p>
      {isLoading ? <p role="status" className="mt-5 text-sm">Loading document activity...</p> : isError ?
        <ErrorState message="Document activity could not be loaded." onRetry={() => refetch()} /> :
        !data?.data.length ? <p className="mt-5 text-sm text-slate-500">No document activity yet. Open or add a record to begin.</p> :
        <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{data.data.map(item => <li key={item.id} className="py-3 flex flex-col sm:flex-row sm:justify-between gap-1">
          <div><p className="text-sm font-semibold">{item.title}</p><p className="text-xs text-teal-700 dark:text-teal-300 mt-1">{item.action.toLowerCase()}</p></div>
          <time dateTime={item.timestamp} className="text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</time>
        </li>)}</ol>}
    </Card>
    {isDemoMode && <NfcRequestHistory />}
  </div>;
}
function NfcRequestHistory() {
  const { state, error, refresh } = useNfcDemoState();
  return <Card>
    <h2 className="font-bold">Provider access requests</h2>
    <p className="text-xs text-slate-500 mt-1">NFC scan attempts in this demo account. A granted scan is an access request, not proof a document was opened.</p>
    {error ? <ErrorState message={error} onRetry={refresh} /> : !state ? <p role="status" className="mt-4 text-sm">Loading requests...</p> :
      !state.history.length ? <p className="mt-5 text-sm text-slate-500">No provider scan requests yet.</p> :
      <ol className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{state.history.map(item => <li key={item.id} className="py-3 space-y-1">
        <div className="flex flex-wrap justify-between gap-2"><p className="font-semibold text-sm">{item.accessType === 'EMERGENCY' ? 'Emergency' : 'Standard'} scan <span className={item.outcome === 'GRANTED' ? 'text-teal-700' : 'text-rose-700'}>{item.outcome.toLowerCase()}</span></p>
          <time className="text-xs text-slate-500" dateTime={item.timestamp}>{new Date(item.timestamp).toLocaleString()}</time></div>
        <p className="text-xs text-slate-600 dark:text-slate-400">{item.reason}</p>
        {!!item.scopes.length && <p className="text-xs text-slate-500">{item.scopes.join(' · ')}</p>}
      </li>)}</ol>}
  </Card>;
}
