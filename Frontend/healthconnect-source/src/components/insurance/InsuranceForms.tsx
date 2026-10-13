import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { savePolicy, saveClaim, calendarDate } from '../../lib/insuranceDemo';
import type { InsurancePolicy, InsuranceClaim, Currency, PolicyStatus } from '../../lib/insuranceRules';

const fieldClass = 'block w-full mt-2 p-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900';
export function PolicyForm({ policy, onSaved }: { policy?: InsurancePolicy; onSaved: (policy: InsurancePolicy) => void }) {
  const initialNotes = policy?.coverages.find(item => item.name === 'Patient-entered coverage notes')?.description ?? '';
  const nextYear = new Date(); nextYear.setFullYear(nextYear.getFullYear() + 1);
  const [form, setForm] = useState({
    provider: policy?.provider ?? '', plan: policy?.plan ?? '', policyNumber: policy?.policyNumber ?? '',
    memberId: policy?.memberId ?? '', coverage: String(policy?.coverage ?? ''), currency: policy?.currency ?? 'INR' as Currency,
    status: policy?.status ?? 'ACTIVE' as PolicyStatus, startDate: policy?.startDate ?? calendarDate(),
    endDate: policy?.endDate ?? calendarDate(nextYear), coverageNotes: initialNotes,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (field: string, value: string) => setForm(current => ({ ...current, [field]: value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    try {
      const saved = savePolicy({ ...form, coverage: Number(form.coverage),
        coverageNotes: policy && !policy.coverages.some(item => item.name === 'Patient-entered coverage notes') && form.coverageNotes === initialNotes ? undefined : form.coverageNotes }, policy?.id);
      onSaved(saved);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Policy was not saved.'); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
    <p className="text-xs text-slate-500">Use sample information. This demo does not verify or link an insurer account.</p>
    {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm">{error}</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Insurance Provider" required maxLength={120} value={form.provider} onChange={event => change('provider', event.target.value)} />
      <Input label="Plan Name" required maxLength={160} value={form.plan} onChange={event => change('plan', event.target.value)} />
      <Input label="Policy Number" required maxLength={100} value={form.policyNumber} onChange={event => change('policyNumber', event.target.value)} />
      <Input label="Member ID" required maxLength={100} value={form.memberId} onChange={event => change('memberId', event.target.value)} />
      <Input label="Sum Insured" type="number" required step="0.01" value={form.coverage} onChange={event => change('coverage', event.target.value)} />
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Currency
        <select aria-label="Currency" className={fieldClass} value={form.currency} onChange={event => change('currency', event.target.value)}>
          <option value="INR">INR — Indian Rupee</option><option value="USD">USD — US Dollar</option>
        </select>
      </label>
      <Input label="Policy Start Date" type="date" required value={form.startDate} onChange={event => change('startDate', event.target.value)} />
      <Input label="Policy End Date" type="date" required value={form.endDate} onChange={event => change('endDate', event.target.value)} />
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Policy Status
        <select aria-label="Policy Status" className={fieldClass} value={form.status} onChange={event => change('status', event.target.value)}>
          <option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="CANCELLED">Cancelled</option>
          {form.status === 'EXPIRED' && <option value="EXPIRED">Expired</option>}
        </select>
      </label>
    </div>
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Coverage Notes
      <textarea aria-label="Coverage Notes" className={fieldClass} rows={3} maxLength={2000} value={form.coverageNotes} onChange={event => change('coverageNotes', event.target.value)} placeholder="Optional sample coverage details from your policy." />
    </label>
    <Button type="submit" disabled={busy}>{busy ? 'Saving...' : 'Save Policy'}</Button>
  </form>;
}

export function ClaimForm({ policies, claim, onSaved }: { policies: InsurancePolicy[]; claim?: InsuranceClaim; onSaved: (claim: InsuranceClaim) => void }) {
  const [form, setForm] = useState({
    policyId: claim?.policyId ?? policies[0]?.id ?? '', hospital: claim?.hospital ?? '',
    amount: String(claim?.amount ?? ''), date: claim?.date ?? calendarDate(),
    type: claim?.type ?? 'Reimbursement' as InsuranceClaim['type'], description: claim?.description ?? '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (field: string, value: string) => setForm(current => ({ ...current, [field]: value }));
  const selected = policies.find(policy => policy.id === form.policyId);
  const submit = (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    try { onSaved(saveClaim({ ...form, amount: Number(form.amount) }, claim?.id)); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Draft was not saved.'); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
    <p className="text-xs text-slate-500">Save a draft, attach supporting documents, then submit it to the demo workflow.</p>
    {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm">{error}</p>}
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Claim Policy
      <select aria-label="Claim Policy" className={fieldClass} required value={form.policyId} onChange={event => setForm(current => ({ ...current, policyId: event.target.value, amount: '' }))}>
        <option value="">Select a policy</option>
        {policies.map(policy => <option key={policy.id} value={policy.id}>{policy.provider} — {policy.plan} ({policy.currency})</option>)}
      </select>
    </label>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Hospital or Facility" required maxLength={160} value={form.hospital} onChange={event => change('hospital', event.target.value)} />
      <Input label={'Claim Amount' + (selected ? ' (' + selected.currency + ')' : '')} type="number" required step="0.01" value={form.amount} onChange={event => change('amount', event.target.value)} />
      <Input label="Service Date" type="date" required value={form.date} onChange={event => change('date', event.target.value)} />
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Claim Type
        <select aria-label="Claim Type" className={fieldClass} value={form.type} onChange={event => change('type', event.target.value)}>
          <option value="Reimbursement">Reimbursement</option><option value="Cashless">Cashless</option>
        </select>
      </label>
    </div>
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Claim Description
      <textarea aria-label="Claim Description" className={fieldClass} required rows={3} maxLength={2000} value={form.description} onChange={event => change('description', event.target.value)} />
    </label>
    <Button type="submit" disabled={busy || policies.length === 0}>{busy ? 'Saving...' : 'Save Draft'}</Button>
  </form>;
}
