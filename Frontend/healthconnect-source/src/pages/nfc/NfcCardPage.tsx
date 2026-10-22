import React, { useEffect, useState } from 'react';
import { AlertTriangle, Ban, CalendarClock, CreditCard, ShieldCheck, Wifi } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import type { NfcCredential } from '../../services/nfcApi';
import { nfcApi } from '../../services/nfcApi';

function formatDate(value: string | null): string {
  if (!value) return 'Never';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export const NfcCardPage: React.FC = () => {
  const [credentials, setCredentials] = useState<NfcCredential[]>([]);
  const [credentialId, setCredentialId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    nfcApi.getMyCredentials()
      .then(items => {
        if (isCurrent) setCredentials(items);
      })
      .catch(failure => {
        if (isCurrent) setError(failure instanceof Error ? failure.message : 'Could not load your NFC cards.');
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, []);

  const handleIssue = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsIssuing(true);
    try {
      const credential = await nfcApi.issueCredential(credentialId.trim());
      setCredentials(current => [credential, ...current]);
      setCredentialId('');
      setNotice('NFC card issued and mapped to your account.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not issue this NFC card.');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleRevoke = async (credential: NfcCredential) => {
    if (!window.confirm(`Revoke the NFC card ending in ${credential.credentialId.slice(-4)}? It will no longer be active.`)) return;
    setError(null);
    setNotice(null);
    setRevokingId(credential.id);
    try {
      const updated = await nfcApi.revokeCredential(credential.id);
      setCredentials(current => current.map(item => item.id === updated.id ? updated : item));
      setNotice('NFC card revoked.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not revoke this NFC card.');
    } finally {
      setRevokingId(null);
    }
  };

  const activeCount = credentials.filter(item => item.status === 'ACTIVE').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          NFC Credentials
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Issue a card by mapping its physical NFC tag UID to your patient account, or revoke a card you no longer use.
        </p>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="space-y-4" aria-labelledby="mapped-cards-heading">
          <div className="flex items-center justify-between">
            <h2 id="mapped-cards-heading" className="text-base font-bold text-slate-900 dark:text-slate-100">
              Mapped NFC cards
            </h2>
            {!isLoading && (
              <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                {activeCount} active
              </span>
            )}
          </div>

          {isLoading ? (
            <Card className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading your NFC cards…</Card>
          ) : credentials.length === 0 ? (
            <Card className="p-6 text-center">
              <Wifi className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-800 dark:text-slate-200">No NFC cards mapped</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter a physical card UID to issue and map your first card.</p>
            </Card>
          ) : (
            credentials.map(credential => (
              <Card key={credential.id} className="p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="rounded-xl bg-teal-50 p-2.5 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">{credential.credentialId}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          credential.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : credential.status === 'REVOKED'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        }`}>
                          {credential.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> Issued {formatDate(credential.issuedAt)}</span>
                        <span>Last used {formatDate(credential.lastUsedAt)}</span>
                      </div>
                    </div>
                  </div>
                  {credential.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-rose-600 dark:text-rose-400"
                      leftIcon={<Ban className="h-4 w-4" />}
                      isLoading={revokingId === credential.id}
                      disabled={revokingId !== null}
                      onClick={() => void handleRevoke(credential)}
                    >
                      Revoke card
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Issue / map card</h2>
            </div>
            <form className="space-y-4" onSubmit={event => void handleIssue(event)}>
              <Input
                label="Physical NFC tag UID"
                value={credentialId}
                onChange={event => setCredentialId(event.target.value)}
                placeholder="04:A1:B2:C3"
                autoComplete="off"
                required
                minLength={8}
                maxLength={29}
                pattern="([0-9a-fA-F]{2}[:-]?){4,10}"
                helperText="Enter the UID read from the physical card (4–10 bytes, with or without separators)."
              />
              <Button
                type="submit"
                className="w-full justify-center"
                leftIcon={<ShieldCheck className="h-4 w-4" />}
                isLoading={isIssuing}
                disabled={isLoading || !credentialId.trim()}
              >
                Issue &amp; map card
              </Button>
            </form>
            <p className="mt-4 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              This maps the tag UID to your account; it does not write data to the physical card. NFC tag UIDs can be copied, so they must not be treated as a secret or used alone to authorize access.
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
};
