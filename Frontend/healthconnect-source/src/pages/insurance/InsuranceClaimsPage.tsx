import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ClaimForm } from '../../components/insurance/InsuranceForms';
import { InsuranceStatus } from '../../components/insurance/InsuranceStatus';
import { useInsuranceDemo } from '../../lib/useInsuranceDemo';
import { formatMoney } from '../../lib/insuranceDemo';

export const InsuranceClaimsPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, error, refresh } = useInsuranceDemo();
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  if (error) return <Card className="p-6 space-y-4"><h1 className="text-xl font-bold">Insurance Claims</h1><p role="alert">{error}</p><Button onClick={refresh}>Retry</Button></Card>;
  if (!state) return <p role="status">Loading claims...</p>;
  const claims = state.claims.filter(claim => (status === 'ALL' || claim.status === status) &&
    (claim.id + ' ' + claim.hospital).toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="space-y-6 max-w-5xl mx-auto">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4"><button aria-label="Back to Insurance" onClick={() => navigate('/app/insurance')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft className="w-5 h-5" /></button>
        <div><h1 className="text-xl sm:text-2xl font-black">Insurance Claims</h1><p className="text-xs text-slate-500 mt-1">Draft, submit and track sample cashless or reimbursement claims.</p></div>
      </div>
      <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setAdding(true)} disabled={state.policies.length === 0}>New Claim</Button>
    </div>
    {state.policies.length === 0 && <Card className="p-5"><p className="text-sm">Add an insurance policy before creating a claim.</p><Button className="mt-3" onClick={() => navigate('/app/insurance')}>View Policies</Button></Card>}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Input label="Search Claims" value={search} onChange={event => setSearch(event.target.value)} placeholder="Claim ID or hospital" />
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Filter Claim Status
        <select aria-label="Filter Claim Status" className="block w-full mt-2 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-sm" value={status} onChange={event => setStatus(event.target.value)}>
          {['ALL', 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'SETTLED'].map(value => <option key={value} value={value}>{value.replaceAll('_', ' ')}</option>)}
        </select>
      </label>
    </div>
    <Card className="overflow-hidden">
      {claims.length === 0 ? <p className="p-8 text-sm text-slate-500 text-center">No claims match these filters.</p> : <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 border-b border-slate-100 dark:border-slate-800"><tr>
            {['Claim ID', 'Hospital / Facility', 'Date', 'Type', 'Claimed Amount', 'Approved', 'Status', 'Details'].map(label => <th key={label} className="px-4 py-3">{label}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{claims.map(claim => {
            const policy = state.policies.find(item => item.id === claim.policyId);
            return <tr key={claim.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
              <td className="px-4 py-4 font-mono text-xs max-w-40 break-all">{claim.id}</td><td className="px-4 py-4">{claim.hospital}</td>
              <td className="px-4 py-4 whitespace-nowrap text-slate-500">{claim.date}</td><td className="px-4 py-4">{claim.type}</td>
              <td className="px-4 py-4 whitespace-nowrap font-semibold">{formatMoney(claim.amount, policy?.currency ?? 'USD')}</td>
              <td className="px-4 py-4 whitespace-nowrap text-emerald-600">{claim.approvedAmount > 0 ? formatMoney(claim.approvedAmount, policy?.currency ?? 'USD') : '—'}</td>
              <td className="px-4 py-4 whitespace-nowrap"><InsuranceStatus status={claim.status} /></td>
              <td className="px-4 py-4"><Button size="sm" variant="outline" onClick={() => navigate('/app/insurance/claims/' + claim.id)} aria-label={'View claim at ' + claim.hospital}>View Claim</Button></td>
            </tr>;
          })}</tbody>
        </table>
      </div>}
    </Card>
    <Modal isOpen={adding} onClose={() => setAdding(false)} title="New Insurance Claim" maxWidth="lg">
      {adding && <ClaimForm policies={state.policies} onSaved={claim => { setAdding(false); navigate('/app/insurance/claims/' + claim.id); }} />}
    </Modal>
  </div>;
};
