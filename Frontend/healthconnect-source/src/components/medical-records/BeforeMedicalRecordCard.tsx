import React from 'react';
import { FileText, Download, Eye, Lock, ShieldCheck, Calendar, UserCheck } from 'lucide-react';
import { MedicalRecord } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface MedicalRecordCardProps {
  record: MedicalRecord;
  onView?: (record: MedicalRecord) => void;
  onDownload?: (record: MedicalRecord) => void;
}

export const BeforeMedicalRecordCard: React.FC<MedicalRecordCardProps> = ({
  record,
  onView,
  onDownload,
}) => {
  const confidentialityBadge = {
    STANDARD: { label: 'Standard Protected', variant: 'slate' as const },
    RESTRICTED: { label: 'Restricted Access', variant: 'amber' as const },
    CONFIDENTIAL: { label: 'Confidential (EHR)', variant: 'rose' as const },
  }[record.confidentialityLevel];

  return (
    <Card className="hover:border-teal-200 transition-all space-y-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                {record.recordType.replace(/_/g, ' ')}
              </span>
              <Badge variant={confidentialityBadge.variant} size="sm">
                <Lock className="w-2.5 h-2.5 mr-1" />
                {confidentialityBadge.label}
              </Badge>
            </div>
            <h4 className="text-base font-bold text-slate-900 mt-0.5">{record.title}</h4>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {record.date}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                {record.doctorName}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{record.status}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
        {record.summary}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5 flex-wrap">
          {record.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
            >
              #{tag}
            </span>
          ))}
          {record.fileSize && (
            <span className="text-[11px] text-slate-400 font-medium">({record.fileSize})</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            onClick={() => onView?.(record)}
          >
            View
          </Button>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            disabled={!record.fileUrl && !record.originalFileName}
            onClick={() => onDownload?.(record)}
          >
            Download
          </Button>
        </div>
      </div>
    </Card>
  );
};


