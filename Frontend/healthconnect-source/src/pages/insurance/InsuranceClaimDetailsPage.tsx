import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ClaimForm } from '../../components/insurance/InsuranceForms';
import { InsuranceDocuments } from '../../components/insurance/InsuranceDocuments';
import { InsuranceStatus } from '../../components/insurance/InsuranceStatus';
import { useInsuranceDemo } from '../../lib/useInsuranceDemo';
import { transitionClaim, deleteDraftClaim, formatMoney, maskIdentifier } from '../../lib/insuranceDemo';
import type { ClaimStatus } from '../../lib/insuranceRules';

export const InsuranceClaimDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, error: loadError, refresh } = useInsuranceDemo();
  const [editing, setEditing] = useState(false);
  const [decision, setDecision] = useState<ClaimStatus | ''>('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (loadError) return <Card className="p-6 space-y-4"><p role="alert">{loadError}</p><Button onClick={refresh}>Retry</Button></Card>;
  if (!state) return <p role="status">Loading claim...</p>;
  const claim = state.claims.find(item => item.id === id);
  if (!claim) return <Card className="p-6 space-y-4"><h1 className="text-xl font-bold">Claim unavailable</h1><p>No claim with this identifier exists in your demo account.</p><Button onClick={() => navigate('/app/insurance/claims')}>Back to Claims</Button></Card>;
  const policy = state.policies.find(item => item.id === claim.policyId);
  const change = (status: ClaimStatus) => {
    if (busy) return; setBusy(true); setError('');
    try { transitionClaim(claim.id, status, status === 'PARTIALLY_APPROVED' ? Number(amount) : undefined, reason); setDecision(''); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Claim status was not changed.'); }
    finally { setBusy(false); }
  };
  const submit = () => { if (confirm('Submit this demo claim? Its fields and documents become read-only. Nothing is sent to an insurer.')) change('SUBMITTED'); };
  const remove = async () => {
    if (busy || !confirm('Delete this draft and its documents?')) return;
    setBusy(true); setError('');
    try { await deleteDraftClaim(claim.id); navigate('/app/insurance/claims'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Draft could not be deleted.'); }
    finally { setBusy(false); }
  };
  return <div className="space-y-6 max-w-4xl mx-auto">
    <button onClick={() => navigate('/app/insurance/claims')} className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400"><ArrowLeft className="w-4 h-4" />Back to Claims</button>
    <div className="flex flex-wrap justify-between items-start gap-3"><div><h1 className="text-xl font-black">Insurance Claim Details</h1><p className="text-xs font-mono text-slate-500 mt-2 break-all">{claim.id}</p></div><InsuranceStatus status={claim.status} /></div>
    <p className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs">Demo workflow only. Submission, review, approval and settlement are simulated.</p>
    {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm">{error}</p>}
    <Card className="p-5 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
        <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Hospital / Facility</p><p>{claim.hospital}</p></div>
        <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Policy</p><p>{policy?.provider} � {policy?.plan}</p><p className="font-mono text-xs mt-1">{policy ? maskIdentifier(policy.policyNumber) : 'Unavailable'}</p></div>
        <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Service Date</p><p>{claim.date} � {claim.type}</p></div>
        <div><p className="text-xs font-bold text-slate-500 uppercase mb-1">Claimed / Approved</p><p>{formatMoney(claim.amount, policy?.currency ?? 'USD')} / {formatMoney(claim.approvedAmount, policy?.currency ?? 'USD')}</p></div>
      </div>
      <div><h2 className="text-sm font-bold mb-2">Claim Description</h2><p className="text-sm whitespace-pre-wrap">{claim.description}</p></div>
      {claim.rejectionReason && <p className="text-sm text-rose-700"><strong>Rejection reason:</strong> {claim.rejectionReason}</p>}
      {claim.status === 'DRAFT' && <div className="flex flex-wrap gap-2">
        <Button onClick={submit} disabled={busy}>Submit Demo Claim</Button><Button variant="outline" onClick={() => setEditing(true)} disabled={busy}>Edit Draft</Button><Button variant="outline" onClick={remove} disabled={busy}>Delete Draft</Button>
      </div>}
      {claim.status === 'SUBMITTED' && <Button onClick={() => change('UNDER_REVIEW')} disabled={busy}>Simulate Review</Button>}
      {claim.status === 'UNDER_REVIEW' && <div className="space-y-3">
        <p className="text-xs text-slate-500">Choose a sample review result. These controls do not represent an insurer decision.</p>
        <div className="flex flex-wrap gap-2"><Button onClick={() => change('APPROVED')} disabled={busy}>Simulate Full Approval</Button>
          <Button variant="outline" onClick={() => { setError(''); setDecision('PARTIALLY_APPROVED'); }}>Simulate Partial Approval</Button>
          <Button variant="outline" onClick={() => { setError(''); setDecision('REJECTED'); }}>Simulate Rejection</Button></div>
      </div>}
      {['APPROVED', 'PARTIALLY_APPROVED'].includes(claim.status) && <Button onClick={() => change('SETTLED')} disabled={busy}>Simulate Settlement</Button>}
    </Card>
    <InsuranceDocuments kind="claim" parentId={claim.id} documents={claim.documents} editable={claim.status === 'DRAFT'} />
    <Card className="p-5 space-y-4"><h2 className="text-lg font-bold">Claim Timeline</h2>
      <ol className="space-y-4">{claim.history.map((event, index) => <li key={index} className="border-l-2 border-teal-200 pl-4">
        <InsuranceStatus status={event.status} /><p className="text-xs text-slate-500 mt-2">{new Date(event.at).toLocaleString()}</p><p className="text-sm mt-1">{event.note}</p>
      </li>)}</ol>
    </Card>
    <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Draft Claim" maxWidth="lg">
      {editing && claim.status === 'DRAFT' && <ClaimForm claim={claim} policies={state.policies} onSaved={() => setEditing(false)} />}
    </Modal>
    <Modal isOpen={!!decision} onClose={() => setDecision('')} title={decision === 'REJECTED' ? 'Simulate Claim Rejection' : 'Simulate Partial Approval'} maxWidth="md">
      <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (decision) change(decision); }}>
        {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
        {decision === 'PARTIALLY_APPROVED' ? <Input label="Approved Amount" type="number" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} /> :
          <Input label="Rejection Reason" required maxLength={500} value={reason} onChange={event => setReason(event.target.value)} />}
        <Button type="submit" disabled={busy}>Apply Demo Decision</Button>
      </form>
    </Modal>
  </div>;
};
