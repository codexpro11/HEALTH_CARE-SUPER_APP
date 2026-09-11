import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, CheckCircle2, Info, Umbrella } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const InsuranceDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for demo until backend is connected
  const policy = {
    id: 'pol-1234',
    provider: 'SecureHealth Insurance',
    plan: 'Comprehensive Family Care',
    policyNumber: 'XXXX-XXXX-9482',
    memberId: 'MEM-XXXX-712',
    coverage: 500000,
    status: 'ACTIVE',
    startDate: '2024-06-01',
    endDate: '2027-05-31',
    coverages: [
      { name: 'In-Patient Hospitalization', limit: 'Up to Sum Insured', description: 'Room rent, ICU, nursing, surgeon fees, etc.' },
      { name: 'Room Rent Limit', limit: 'Single Private Room', description: 'Up to 1% of Sum Insured per day' },
      { name: 'ICU Charges', limit: 'No Limit', description: 'Actual expenses covered' },
      { name: 'Pre & Post Hospitalization', limit: '60 Days / 90 Days', description: 'Medical expenses before and after admission' },
      { name: 'Day Care Procedures', limit: 'All Procedures', description: 'Treatments requiring less than 24 hours hospitalization' },
      { name: 'Ambulance Cover', limit: '$500 per hospitalization', description: 'Road ambulance charges' }
    ]
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/app/insurance')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Insurance</span>
      </button>

      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-lg text-xs font-medium">
        <Info className="w-4 h-4 shrink-0" />
        <span>This is a sample policy overview. Actual coverage limits are determined by the backend integration.</span>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/50 rounded-xl flex items-center justify-center shrink-0 text-teal-600 dark:text-teal-400">
              <Umbrella className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{policy.plan}</h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{policy.provider}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Policy No.</p>
            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{policy.policyNumber}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Member ID</p>
            <p className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">{policy.memberId}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Valid From</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{policy.startDate}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Valid Till</p>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{policy.endDate}</p>
          </div>
        </div>
      </Card>

      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 pt-2">Coverage Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {policy.coverages.map((item, idx) => (
          <Card key={idx} className="p-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100">{item.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-sm font-semibold text-teal-700 dark:text-teal-400">{item.limit}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
