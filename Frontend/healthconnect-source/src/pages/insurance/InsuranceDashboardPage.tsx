import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, CheckCircle2, Clock, ShieldAlert, Plus, CreditCard } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const InsuranceDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const policies = [
    {
      id: 'pol-1234',
      provider: 'SecureHealth Insurance',
      plan: 'Comprehensive Family Care',
      policyNumber: 'XXXX-XXXX-9482',
      memberId: 'MEM-XXXX-712',
      coverage: 500000,
      status: 'ACTIVE',
      expiry: '2027-05-31'
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Health Insurance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your health insurance policies, coverage details, and claims.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/app/insurance/claims')}>
            View Claims
          </Button>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            Add Policy
          </Button>
        </div>
      </div>

      {policies.length === 0 ? (
        <Card className="p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Active Insurance</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Link your health insurance policy to easily manage claims and enable cashless hospital visits.
            </p>
          </div>
          <Button variant="primary">Link Insurance Policy</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {policies.map(policy => (
            <Card key={policy.id} className="overflow-hidden hover:border-teal-300 dark:hover:border-teal-700 transition-colors">
              <div className="p-5 sm:p-6 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border-b border-teal-100 dark:border-teal-900/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{policy.provider}</h3>
                    <p className="text-sm font-medium text-teal-700 dark:text-teal-400">{policy.plan}</p>
                  </div>
                </div>
                {policy.status === 'ACTIVE' && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Active
                  </div>
                )}
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Policy Number</p>
                  <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{policy.policyNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Member ID</p>
                  <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{policy.memberId}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Sum Insured</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">${policy.coverage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Valid Until</p>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {policy.expiry}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <Button variant="outline" size="sm" leftIcon={<FileText className="w-4 h-4" />}>
                  Download Card
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate(`/app/insurance/${policy.id}`)}>
                  View Coverage Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
