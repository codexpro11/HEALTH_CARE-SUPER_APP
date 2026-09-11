import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Pill, ShoppingBag, ShieldCheck, Download, ExternalLink, ArrowRight } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { Prescription } from '../../types';
import { PrescriptionCard } from '../../components/prescriptions/PrescriptionCard';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const PrescriptionListPage: React.FC = () => {
  const [filter, setFilter] = useState<'ACTIVE' | 'FULFILLED' | 'ALL'>('ACTIVE');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['prescriptions', filter],
    queryFn: () =>
      medicalRecordApi.getPrescriptions(filter === 'ALL' ? undefined : (filter as any)),
  });

  const prescriptions = response?.data || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
            Digital Prescriptions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Digitally signed e-prescriptions with dosage directions, refill counts, and direct pharmacy transfer.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<ShoppingBag className="w-4 h-4" />}
          onClick={() => navigate('/app/pharmacy')}
        >
          Order Medications
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            filter === 'ACTIVE'
              ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Active Prescriptions
        </button>
        <button
          onClick={() => setFilter('FULFILLED')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            filter === 'FULFILLED'
              ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          Fulfilled History
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all ${
            filter === 'ALL'
              ? 'border-teal-600 text-teal-700 dark:border-teal-500 dark:text-teal-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          All Prescriptions
        </button>
      </div>

      {/* Prescriptions List */}
      {isLoading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : isError ? (
        <ErrorState message="Failed to load prescriptions." onRetry={() => refetch()} />
      ) : prescriptions.length === 0 ? (
        <EmptyState
          icon={Pill}
          title="No Prescriptions Found"
          description="You currently have no prescriptions under this filter view."
        />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <PrescriptionCard
              key={rx.id}
              prescription={rx}
              onViewDetails={(p) => setSelectedRx(p)}
              onDownload={(p) => alert(`Downloading verified prescription PDF #${p.prescriptionNumber}...`)}
            />
          ))}
        </div>
      )}

      {/* Prescription Details Modal */}
      {selectedRx && (
        <Modal
          isOpen={!!selectedRx}
          onClose={() => setSelectedRx(null)}
          title={`Prescription ${selectedRx.prescriptionNumber}`}
          subtitle={`Issued by ${selectedRx.doctorName} • Valid until ${selectedRx.validUntil}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-xs text-slate-700 dark:text-slate-300 transition-colors">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 transition-colors">Diagnosis:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 transition-colors">{selectedRx.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 transition-colors">Clinical Facility:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 transition-colors">{selectedRx.clinicOrHospital}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500 dark:text-slate-400 transition-colors">Digital Signature Hash:</span>
                <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400 transition-colors">
                  {selectedRx.digitalSignatureId}
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 transition-colors">
                Medications & Regimen
              </h4>
              <div className="space-y-2">
                {selectedRx.medications.map((m) => (
                  <div key={m.id} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-1 transition-colors">
                    <div className="flex justify-between font-bold text-slate-900 dark:text-slate-100 transition-colors">
                      <span>{m.name} {m.dosage}</span>
                      <span className="text-teal-700 dark:text-teal-400 transition-colors">Remaining Refills: {m.remainingRefills}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 transition-colors">Instructions: {m.instructions} ({m.duration})</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => alert('Downloading official prescription PDF...')}
              >
                Export PDF
              </Button>
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSelectedRx(null);
                  navigate('/app/pharmacy');
                }}
              >
                Send to Pharmacy
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
