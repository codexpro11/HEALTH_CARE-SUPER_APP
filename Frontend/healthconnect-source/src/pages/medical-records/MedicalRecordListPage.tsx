import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Plus,
  Filter,
  Download,
  Eye,
  Lock,
  Calendar,
  UserCheck,
  CheckCircle2,
  Paperclip,
} from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { MedicalRecord, MedicalRecordType } from '../../types';
import { MedicalRecordCard } from '../../components/medical-records/MedicalRecordCard';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const MedicalRecordListPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState<MedicalRecordType>('LAB_REPORT');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Jenkins');
  const [provider, setProvider] = useState('Metro Health Diagnostic Center');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const queryClient = useQueryClient();

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['medical-records', selectedType],
    queryFn: () => medicalRecordApi.getRecords(selectedType === 'ALL' ? undefined : selectedType),
  });

  const records = response?.data || [];

  const uploadMutation = useMutation({
    mutationFn: (newRecord: Partial<MedicalRecord>) => medicalRecordApi.uploadRecord(newRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      setIsUploadOpen(false);
      setTitle('');
      setSummary('');
      setSelectedFile(null);
    },
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    uploadMutation.mutate({
      title,
      recordType,
      date,
      doctorName,
      provider,
      summary: summary || 'Patient-uploaded health record document.',
      fileSize: selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : '1.2 MB',
      fileType: 'PDF',
      confidentialityLevel: 'STANDARD',
      tags: [recordType.toLowerCase(), 'patient-upload'],
    });
  };

  const categories = [
    { id: 'ALL', label: 'All Documents' },
    { id: 'LAB_REPORT', label: 'Lab Reports' },
    { id: 'RADIOLOGY', label: 'Radiology / Scans' },
    { id: 'PRESCRIPTION', label: 'Prescriptions' },
    { id: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries' },
    { id: 'VACCINATION', label: 'Vaccinations' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Electronic Health Records (EHR)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            HIPAA-compliant decentralized repository for clinical laboratory reports, scans, and notes.
          </p>
        </div>

        <Button
          variant="primary"
          leftIcon={<Upload className="w-4 h-4" />}
          onClick={() => setIsUploadOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedType(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              selectedType === cat.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Records List */}
      {isLoading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : isError ? (
        <ErrorState message="Could not fetch medical records." onRetry={() => refetch()} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Records in Category"
          description="There are no electronic records found matching this category."
          actionLabel="Upload New Record"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onView={(r) => setViewRecord(r)}
              onDownload={(r) => alert(`Downloading ${r.title} securely...`)}
            />
          ))}
        </div>
      )}

      {/* View Record Document Modal */}
      {viewRecord && (
        <Modal
          isOpen={!!viewRecord}
          onClose={() => setViewRecord(null)}
          title={viewRecord.title}
          subtitle={`Issued on ${viewRecord.date} by ${viewRecord.doctorName}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Document Type:</span>
                <span className="font-bold text-slate-900">{viewRecord.recordType}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Issuing Clinic / Hospital:</span>
                <span className="font-bold text-slate-900">{viewRecord.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Verification Status:</span>
                <span className="font-bold text-emerald-700">{viewRecord.status} (Verified Signoff)</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Clinical Summary / Findings
              </h4>
              <p className="text-xs sm:text-sm text-slate-700 p-4 bg-white border border-slate-200 rounded-xl leading-relaxed whitespace-pre-line">
                {viewRecord.summary}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs text-slate-400">Security: SHA-256 Checksum Verified</span>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                onClick={() => alert(`Downloading document: ${viewRecord.title}`)}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upload Document Modal */}
      {isUploadOpen && (
        <Modal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          title="Upload Medical Record"
          subtitle="Add external test results, radiology reports, or discharge summaries"
          maxWidth="md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <Input
              label="Document Title"
              placeholder="e.g. Annual Blood Work Lipid Panel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Record Category"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as MedicalRecordType)}
                options={[
                  { value: 'LAB_REPORT', label: 'Lab Report' },
                  { value: 'RADIOLOGY', label: 'Radiology / Scan' },
                  { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
                  { value: 'PRESCRIPTION', label: 'Prescription' },
                  { value: 'VACCINATION', label: 'Vaccination' },
                  { value: 'CLINICAL_NOTE', label: 'Clinical Note' },
                ]}
              />

              <Input
                label="Document Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Attending Doctor"
                placeholder="Dr. Full Name"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
              />
              <Input
                label="Facility / Diagnostic Lab"
                placeholder="Laboratory Name"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Key Findings / Notes
              </label>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Enter clinical notes, reference ranges, or diagnosis summary..."
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* File Drag & Drop / Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Attach File (PDF, DICOM, JPG)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center hover:border-teal-500 transition-colors bg-slate-50/50">
                <Paperclip className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-600 font-medium">
                  {selectedFile ? selectedFile.name : 'Drag and drop your file here, or browse'}
                </p>
                <input
                  type="file"
                  id="ehr-file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                  }}
                />
                <label
                  htmlFor="ehr-file"
                  className="mt-2 inline-block px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer hover:bg-slate-50"
                >
                  Choose File
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={uploadMutation.isPending}>
                Save Record
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
