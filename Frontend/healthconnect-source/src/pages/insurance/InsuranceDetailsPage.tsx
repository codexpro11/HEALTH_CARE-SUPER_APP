import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Umbrella, Info } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PolicyForm } from '../../components/insurance/InsuranceForms';
import { InsuranceDocuments } from '../../components/insurance/InsuranceDocuments';
import { InsuranceStatus } from '../../components/insurance/InsuranceStatus';
import { useInsuranceDemo } from '../../lib/useInsuranceDemo';
import { deletePolicy, effectivePolicyStatus, maskIdentifier, formatMoney } from '../../lib/insuranceDemo';

export const InsuranceDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, error: loadError, refresh } = useInsuranceDemo();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (loadError) return <Card className="p-6 space-y-4"><p role="alert">{loadError}</p><Button onClick={refresh}>Retry</Button></Card>;
  if (!state) return <p role="status">Loading policy...</p>;
  const policy = state.policies.find(item => item.id === id);
  if (!policy) return <Card className="p-6 space-y-4"><h1 className="text-xl font-bold">Policy unavailable</h1><p>No policy with this identifier exists in your demo account.</p><Button onClick={() => navigate('/app/insurance')}>Back to Insurance</Button></Card>;
  const remove = async () => {
    if (busy || !confirm('Delete this policy and its documents from the demo?')) return;
    setBusy(true); setError('');
    try { await deletePolicy(policy.id); navigate('/app/insurance'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Policy could not be deleted.'); }
    finally { setBusy(false); }
  };
  const downloadSummary = () => {
    const text = ['HealthConnect — Demo Policy Summary', policy.provider, policy.plan,
      'Policy: ' + maskIdentifier(policy.policyNumber), 'Member: ' + maskIdentifier(policy.memberId),
      'Sum insured: ' + formatMoney(policy.coverage, policy.currency), 'Period: ' + policy.startDate + ' to ' + policy.endDate,
      'Status: ' + effectivePolicyStatus(policy), 'Sample information; not an insurer-issued card.'].join('\n');
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'healthconnect-policy-summary.txt'; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <div className="space-y-6 max-w-4xl mx-auto">
    <button onClick={() => navigate('/app/insurance')} className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 dark:text-teal-400"><ArrowLeft className="w-4 h-4" />Back to Insurance</button>
    <div className="flex gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs"><Info className="w-4 h-4 shrink-0" /><p>Demo policy information. Coverage and claim eligibility have not been verified by an insurer.</p></div>
    {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 text-rose-800 text-sm">{error}</p>}
    <Card className="overflow-hidden">
      <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-4 items-center"><div className="w-14 h-14 rounded-xl bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center"><Umbrella className="w-7 h-7 text-teal-600" /></div><div><h1 className="text-xl font-black">{policy.plan}</h1><p className="text-sm text-slate-500">{policy.provider}</p></div></div>
        <InsuranceStatus status={effectivePolicyStatus(policy)} />
      </div>
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Policy No.</p><p className="font-mono break-all">{maskIdentifier(policy.policyNumber)}</p></div>
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Member ID</p><p className="font-mono break-all">{maskIdentifier(policy.memberId)}</p></div>
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Valid From</p><p>{policy.startDate}</p></div>
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Valid Till</p><p>{policy.endDate}</p></div>
      </div>
      <p className="px-6 pb-4 text-sm font-bold">Sum insured: {formatMoney(policy.coverage, policy.currency)}</p>
      <div className="px-6 pb-6 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setEditing(true)} disabled={busy}>Edit Policy</Button>
        <Button variant="outline" onClick={downloadSummary}>Download Demo Summary</Button>
        <Button variant="outline" onClick={remove} disabled={busy}>Delete Policy</Button>
      </div>
    </Card>
    <div><h2 className="text-lg font-bold mb-4">Coverage Details</h2>
      {policy.coverages.length === 0 ? <Card className="p-5 text-sm text-slate-500">No coverage details supplied. Attach a policy document or add coverage notes.</Card> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{policy.coverages.map((item, index) => <Card key={index} className="p-4 space-y-3">
          <h3 className="font-bold">{item.name}</h3><p className="text-xs text-slate-500 whitespace-pre-wrap">{item.description}</p><p className="text-sm font-semibold text-teal-700 dark:text-teal-400 border-t border-slate-100 dark:border-slate-800 pt-3">{item.limit}</p>
        </Card>)}</div>}
    </div>
    <InsuranceDocuments kind="policy" parentId={policy.id} documents={policy.documents} />
    <Modal isOpen={editing} onClose={() => setEditing(false)} title="Edit Insurance Policy" maxWidth="lg">
      {editing && <PolicyForm policy={policy} onSaved={() => setEditing(false)} />}
    </Modal>
  </div>;
};
