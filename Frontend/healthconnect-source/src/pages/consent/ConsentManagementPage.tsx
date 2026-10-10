import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Calendar, Clock, Hospital, Building2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useNfcDemoState } from '../../lib/useNfcDemoState';
import { revokeConsent, updateConsent, REGULAR_SCOPES } from '../../lib/nfcDemo';
import { Modal } from '../../components/common/Modal';

export const ConsentManagementPage: React.FC = () => {
  const { state, error: loadError, refresh } = useNfcDemoState();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [scopes, setScopes] = useState<string[]>([]);
  const [expiry, setExpiry] = useState('');
  const consents = state?.consents ?? [];
  const handleRevoke = (id: string) => {
    if (!confirm('Revoke this consent? The provider will lose demo access to your records.')) return;
    try { revokeConsent(id); setNotice('Consent revoked. Existing demo access was invalidated.'); setError(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to revoke consent.'); }
  };
  const edit = (id: string) => {
    const consent = consents.find(item => item.id === id)!;
    setEditing(id);
    setScopes(consent.scopes.filter(scope => REGULAR_SCOPES.includes(scope)));
    const end = new Date(); end.setMonth(end.getMonth() + 6);
    setExpiry(Date.parse(consent.expiry) > Date.now() ? consent.expiry : end.toISOString().slice(0, 10));
    setError('');
  };
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    try { updateConsent(editing!, scopes, expiry); setEditing(null); setNotice('Demo access permissions saved.'); setError(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to save consent.'); }
  };
  if (loadError) return <Card className="p-6"><p role="alert">{loadError}</p><Button onClick={refresh}>Retry</Button></Card>;
  if (!state) return <p role="status">Loading consent...</p>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {notice && <p role="status" className="p-3 rounded-xl bg-teal-50 text-teal-800 text-sm">{notice}</p>}
      {error && !editing && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm">{error}</p>}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Consent Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review and manage which healthcare providers and facilities have access to your medical information.
        </p>
      </div>

      <div className="space-y-4">
        {consents.map((consent) => (
          <Card key={consent.id} className="p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{consent.provider}</h3>
                    {consent.status === 'ACTIVE' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Active</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">{consent.status === 'REVOKED' ? 'Revoked' : 'Expired'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mt-1">
                    <Building2 className="w-4 h-4" />
                    <span>{consent.facility}</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">Access Scope</p>
                  <div className="flex flex-wrap gap-2">
                    {consent.scopes.map(scope => (
                      <span key={scope} className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Granted: {consent.dateGranted}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires: {consent.expiry}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => edit(consent.id)}>Manage Access</Button>
              {consent.status === 'ACTIVE' && (
                <div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    onClick={() => handleRevoke(consent.id)}
                    leftIcon={<ShieldAlert className="w-4 h-4" />}
                  >
                    Revoke Access
                  </Button>
                </div>
              )}
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Manage Provider Access" maxWidth="md">
        <form onSubmit={save} className="space-y-4">
          <p className="text-sm text-slate-500">Grant only the scopes this provider needs. Every change invalidates previous demo scans.</p>
          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          <fieldset className="space-y-2"><legend className="font-bold text-sm mb-2">Access scopes</legend>
            {REGULAR_SCOPES.map(scope => <label key={scope} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={scopes.includes(scope)} onChange={event => setScopes(event.target.checked ? [...scopes, scope] : scopes.filter(value => value !== scope))} />
              {scope}
            </label>)}
          </fieldset>
          <label className="block text-sm font-bold">Consent expires
            <input type="date" required value={expiry} onChange={event => setExpiry(event.target.value)} className="block w-full rounded-xl border border-slate-300 p-2 mt-2 dark:bg-slate-900" />
          </label>
          <Button type="submit">Save Access Permissions</Button>
        </form>
      </Modal>
    </div>
  );
};
