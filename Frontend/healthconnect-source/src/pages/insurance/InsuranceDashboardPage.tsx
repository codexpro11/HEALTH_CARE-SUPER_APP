import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Clock } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PolicyForm } from '../../components/insurance/InsuranceForms';
import { InsuranceStatus } from '../../components/insurance/InsuranceStatus';
import { useInsuranceDemo } from '../../lib/useInsuranceDemo';
import { maskIdentifier, formatMoney, effectivePolicyStatus } from '../../lib/insuranceDemo';

export const InsuranceDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, error, refresh } = useInsuranceDemo();
  const [adding, setAdding] = useState(false);
  if (error) return <Card className="p-6 space-y-4"><h1 className="text-xl font-bold">Health Insurance</h1><p role="alert">{error}</p><Button onClick={refresh}>Retry</Button></Card>;
  if (!state) return <p role="status">Loading insurance...</p>;
  return <div className="space-y-6 max-w-5xl mx-auto">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Health Insurance</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Manage policies, coverage documents and demo claims.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => navigate('/app/insurance/claims')}>View Claims</Button>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)}>Add Policy</Button>
      </div>
    </div>
    {state.policies.length === 0 ? <Card className="p-8 text-center space-y-4">
      <Shield className="w-12 h-12 mx-auto text-slate-300" />
      <h2 className="text-lg font-bold">No Insurance Policies</h2>
      <p className="text-sm text-slate-500">Add a sample policy to try coverage documents and claims.</p>
      <Button onClick={() => setAdding(true)}>Link Insurance Policy</Button>
    </Card> : <div className="space-y-4">{state.policies.map(policy => <Card key={policy.id} className="overflow-hidden hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
      <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-b border-teal-100 dark:border-teal-900/50 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center shrink-0"><Shield className="w-6 h-6 text-teal-600" /></div>
          <div><h2 className="text-lg font-bold">{policy.provider}</h2><p className="text-sm font-medium text-teal-700 dark:text-teal-400">{policy.plan}</p></div>
        </div>
        <InsuranceStatus status={effectivePolicyStatus(policy)} />
      </div>
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Policy Number</p><p className="font-mono text-sm">{maskIdentifier(policy.policyNumber)}</p></div>
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Member ID</p><p className="font-mono text-sm">{maskIdentifier(policy.memberId)}</p></div>
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Sum Insured</p><p className="text-sm font-bold">{formatMoney(policy.coverage, policy.currency)}</p></div>
        <div><p className="text-xs font-bold uppercase text-slate-500 mb-1">Valid Until</p><p className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />{policy.endDate}</p></div>
      </div>
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-end gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/app/insurance/' + policy.id)}>View Documents ({policy.documents.length})</Button>
        <Button size="sm" onClick={() => navigate('/app/insurance/' + policy.id)}>View Coverage Details</Button>
      </div>
    </Card>)}</div>}
    <Modal isOpen={adding} onClose={() => setAdding(false)} title="Add Insurance Policy" maxWidth="lg">
      {adding && <PolicyForm onSaved={policy => { setAdding(false); navigate('/app/insurance/' + policy.id); }} />}
    </Modal>
  </div>;
};
