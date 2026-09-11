import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const InsuranceClaimsPage: React.FC = () => {
  const navigate = useNavigate();

  const claims = [
    {
      id: 'CLM-98213',
      hospital: 'Central City Hospital',
      date: '2026-08-15',
      amount: 4500,
      approvedAmount: 4500,
      status: 'APPROVED',
      type: 'Cashless'
    },
    {
      id: 'CLM-98401',
      hospital: 'Wellness Clinic',
      date: '2026-09-02',
      amount: 320,
      approvedAmount: 0,
      status: 'UNDER_REVIEW',
      type: 'Reimbursement'
    },
    {
      id: 'CLM-97102',
      hospital: 'MetroCare Diagnostics',
      date: '2026-05-10',
      amount: 850,
      approvedAmount: 600,
      status: 'PARTIALLY_APPROVED',
      type: 'Reimbursement'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'SETTLED':
        return <Badge variant="emerald" size="sm" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {status}</Badge>;
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return <Badge variant="amber" size="sm" className="flex items-center gap-1"><Clock className="w-3 h-3"/> {status.replace('_', ' ')}</Badge>;
      case 'PARTIALLY_APPROVED':
        return <Badge variant="indigo" size="sm" className="flex items-center gap-1"><AlertCircle className="w-3 h-3"/> PARTIAL</Badge>;
      case 'REJECTED':
        return <Badge variant="rose" size="sm" className="flex items-center gap-1"><XCircle className="w-3 h-3"/> {status}</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/insurance')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500 dark:text-slate-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Insurance Claims
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Track the status of your cashless and reimbursement claims.
            </p>
          </div>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
          New Claim
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Claim ID</th>
                <th className="px-4 py-3">Hospital / Facility</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Claimed Amount</th>
                <th className="px-4 py-3 text-right">Approved</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-4 py-4 font-mono font-medium text-slate-900 dark:text-slate-100">{claim.id}</td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300">{claim.hospital}</td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{claim.date}</td>
                  <td className="px-4 py-4 text-slate-500 dark:text-slate-400">{claim.type}</td>
                  <td className="px-4 py-4 text-right font-medium text-slate-900 dark:text-slate-100">${claim.amount}</td>
                  <td className="px-4 py-4 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {claim.approvedAmount > 0 ? `$${claim.approvedAmount}` : '-'}
                  </td>
                  <td className="px-4 py-4">{getStatusBadge(claim.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
