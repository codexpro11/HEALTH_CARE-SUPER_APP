import React from 'react';
import { ShieldCheck, ShieldAlert, Calendar, Clock, Hospital, Building2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const ConsentManagementPage: React.FC = () => {
  const consents = [
    {
      id: 'c-1',
      provider: 'Dr. John Smith',
      facility: 'Central City Hospital',
      scopes: ['Medical Summary', 'Prescriptions', 'Diagnostic Reports'],
      dateGranted: '2026-09-01',
      expiry: '2027-09-01',
      status: 'ACTIVE',
    },
    {
      id: 'c-2',
      provider: 'Emergency Access',
      facility: 'MetroCare Emergency Response',
      scopes: ['Critical Allergies', 'Blood Group', 'Current Medications', 'Emergency Contacts'],
      dateGranted: '2026-08-15',
      expiry: 'PERMANENT',
      status: 'ACTIVE',
    },
    {
      id: 'c-3',
      provider: 'Dr. Sarah Connor',
      facility: 'Wellness Clinic',
      scopes: ['Medical Summary', 'Diagnostics'],
      dateGranted: '2025-01-10',
      expiry: '2026-01-10',
      status: 'EXPIRED',
    }
  ];

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this consent? The provider will immediately lose access to your records.')) {
      alert(`Consent ${id} revoked.`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
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
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">Expired</span>
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

              {consent.status === 'ACTIVE' && (
                <div className="shrink-0">
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
          </Card>
        ))}
      </div>
    </div>
  );
};
