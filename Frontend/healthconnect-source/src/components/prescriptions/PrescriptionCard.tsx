import React from 'react';
import { Pill, Download, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { Prescription } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

export interface PrescriptionCardProps {
  prescription: Prescription;
  onDownload?: (rx: Prescription) => void;
  onViewDetails?: (rx: Prescription) => void;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  prescription,
  onDownload,
  onViewDetails,
}) => {
  return (
    <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0 transition-colors">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wider transition-colors">
                {prescription.prescriptionNumber}
              </span>
              <StatusBadge status={prescription.status} />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 transition-colors">
              Prescribed by {prescription.doctorName}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{prescription.clinicOrHospital}</p>
          </div>
        </div>

        <div className="text-right text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="flex items-center gap-1 justify-end font-medium text-slate-700 dark:text-slate-300 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Issued: {prescription.dateIssued}</span>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 transition-colors">Valid until: {prescription.validUntil}</span>
        </div>
      </div>

      {prescription.diagnosis && (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl text-xs text-slate-700 dark:text-slate-300 transition-colors">
          <span className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">Diagnosis: </span>
          <span>{prescription.diagnosis}</span>
        </div>
      )}

      {/* Medications List */}
      <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 transition-colors">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">
          Prescribed Medications ({prescription.medications.length})
        </span>
        <div className="space-y-2">
          {prescription.medications.map((med) => (
            <div
              key={med.id}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs transition-colors"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm transition-colors">{med.name}</span>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold text-[11px] transition-colors">
                  {med.dosage}
                </span>
                <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium transition-colors">{med.frequency} • {med.duration}</p>
                <p className="text-slate-500 dark:text-slate-500 text-[11px] mt-0.5 italic transition-colors">{med.instructions}</p>
              </div>
              {typeof med.remainingRefills === 'number' && (
                <div className="text-right shrink-0">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block transition-colors">Refills</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm transition-colors">
                    {med.remainingRefills}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Digital Signature & Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 transition-colors">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
          <span>Digitally Signed: {prescription.digitalSignatureId.slice(0, 16)}...</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails?.(prescription)}
          >
            Details
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => onDownload?.(prescription)}
          >
            PDF Export
          </Button>
        </div>
      </div>
    </Card>
  );
};
