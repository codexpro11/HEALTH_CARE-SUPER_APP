import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Paperclip, Upload } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { BeforeMedicalRecordCard as MedicalRecordCard } from '../../components/medical-records/BeforeMedicalRecordCard';
import { mockMedicalRecords } from '../../data/mockData';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { localDate } from '../../lib/frontend';
import { validateRecordAttachment } from '../../lib/recordAttachments';
import { MedicalRecord, MedicalRecordType } from '../../types';

const hasAttachment = (record: MedicalRecord) => Boolean(record.fileUrl || record.originalFileName);

export const BeforeMedicalRecordListPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [viewRecord, setViewRecord] = useState<MedicalRecord | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [recordType, setRecordType] = useState<MedicalRecordType>('LAB_REPORT');
  const [doctorName, setDoctorName] = useState('');
  const [provider, setProvider] = useState('');
  const [date, setDate] = useState(localDate());
  const [summary, setSummary] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [actionError, setActionError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const queryClient = useQueryClient();
  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['before-medical-records', selectedType],
    queryFn: async () => ({ data: selectedType === 'ALL' ? mockMedicalRecords : mockMedicalRecords.filter(record => record.recordType === selectedType) }),
  });
  const records = response?.data || [];

  const uploadMutation = useMutation({
    mutationFn: ({ record, file }: { record: Partial<MedicalRecord>; file: File }) =>
      medicalRecordApi.uploadRecord(record, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      setIsUploadOpen(false);
      setTitle('');
      setSummary('');
      setSelectedFile(null);
      setAttachmentError('');
      setDate(localDate());
    },
    onError: (error: Error) => setActionError(error.message || 'The record could not be uploaded.'),
  });

  useEffect(() => {
    let active = true;
    let objectUrl = '';
    setPreviewUrl('');
    setPreviewError('');
    if (!viewRecord || !hasAttachment(viewRecord)) {
      setIsPreviewLoading(false);
      return;
    }
    setIsPreviewLoading(true);
    medicalRecordApi.getAttachment(viewRecord)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      })
      .catch((error: Error) => {
        if (active) setPreviewError(error.message || 'The attached file could not be opened.');
      })
      .finally(() => {
        if (active) setIsPreviewLoading(false);
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [viewRecord]);

  const handleUploadSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const fileError = validateRecordAttachment(selectedFile);
    setAttachmentError(fileError || '');
    if (fileError || !selectedFile) return;
    if (!title.trim()) {
      setActionError('Add a title for this record.');
      return;
    }
    setActionError('');
    uploadMutation.mutate({
      file: selectedFile,
      record: {
        title: title.trim(),
        recordType,
        date,
        doctorName: doctorName.trim() || 'Not provided',
        provider: provider.trim() || 'Not provided',
        summary: summary.trim() || 'Patient-uploaded health record document.',
        fileSize: (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB',
        fileType: selectedFile.type,
        fileMimeType: selectedFile.type,
        originalFileName: selectedFile.name,
        confidentialityLevel: 'STANDARD',
        tags: [recordType.toLowerCase(), 'patient-upload'],
      },
    });
  };

  const handleDownload = async (record: MedicalRecord) => {
    try {
      setActionError('');
      const blob = await medicalRecordApi.getAttachment(record);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = record.originalFileName || record.title;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setActionError((error as Error).message || 'The attached file could not be downloaded.');
    }
  };

  const categories = [
    { id: 'ALL', label: 'All Records' },
    { id: 'LAB_REPORT', label: 'Lab Reports' },
    { id: 'RADIOLOGY', label: 'Radiology / Scans' },
    { id: 'PRESCRIPTION', label: 'Prescriptions' },
    { id: 'DISCHARGE_SUMMARY', label: 'Discharge Summaries' },
    { id: 'VACCINATION', label: 'Vaccinations' },
    { id: 'DIAGNOSTIC_REPORT', label: 'Diagnostic Reports' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep reports, prescriptions, scans, and other patient documents together.
          </p>
        </div>
        <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />} onClick={() => {
          setActionError('');
          setIsUploadOpen(true);
        }}>
          Add a record
        </Button>
      </div>

      {actionError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {actionError}
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setSelectedType(category.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              selectedType === category.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : isError ? (
        <ErrorState message="Could not fetch medical records." onRetry={() => refetch()} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Records in Category"
          description="Add a record with a PDF or image attachment to keep it in this list."
          actionLabel="Add a record"
          onAction={() => setIsUploadOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onView={setViewRecord}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}

      {viewRecord && (
        <Modal
          isOpen
          onClose={() => setViewRecord(null)}
          title={viewRecord.title}
          subtitle={`Dated ${viewRecord.date} • ${viewRecord.provider || 'Provider not specified'}`}
          maxWidth="xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div><span className="text-slate-500">Category: </span><strong>{viewRecord.recordType.replace(/_/g, ' ')}</strong></div>
              <div><span className="text-slate-500">Clinician: </span><strong>{viewRecord.doctorName || 'Not specified'}</strong></div>
              <div><span className="text-slate-500">Status: </span><strong>{viewRecord.status}</strong></div>
              <div><span className="text-slate-500">File: </span><strong>{viewRecord.originalFileName || 'No attachment'}</strong></div>
            </div>

            <section>
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Notes and findings</h2>
              <p className="whitespace-pre-line rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
                {viewRecord.summary || 'No notes were added.'}
              </p>
            </section>

            {hasAttachment(viewRecord) && (
              <section aria-label="Document preview" className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {isPreviewLoading && <div className="p-8 text-center text-sm text-slate-500">Loading document preview.</div>}
                {previewError && <div role="alert" className="p-4 text-sm text-rose-700">{previewError}</div>}
                {previewUrl && viewRecord.fileMimeType?.startsWith('image/') && (
                  <img src={previewUrl} alt={viewRecord.title} className="mx-auto max-h-[60vh] max-w-full object-contain" />
                )}
                {previewUrl && viewRecord.fileMimeType === 'application/pdf' && (
                  <iframe title={viewRecord.title} src={previewUrl} className="h-[60vh] w-full" />
                )}
                {previewUrl && !['application/pdf', 'image/jpeg', 'image/png'].includes(viewRecord.fileMimeType || '') && (
                  <div className="p-4 text-sm text-slate-600">Preview is unavailable for this file type. Download the file to open it.</div>
                )}
              </section>
            )}

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-500">
                {hasAttachment(viewRecord) ? 'Attachment available' : 'No document is attached to this record.'}
              </span>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Download className="w-3.5 h-3.5" />}
                disabled={!hasAttachment(viewRecord)}
                onClick={() => handleDownload(viewRecord)}
              >
                Download file
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {isUploadOpen && (
        <Modal
          isOpen
          onClose={() => setIsUploadOpen(false)}
          title="Add a medical record"
          subtitle="Attach a PDF or image of a report, prescription, scan, or vaccination record."
          maxWidth="md"
        >
          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <Input
              label="Document title"
              placeholder="e.g. Complete blood count report"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Record category"
                value={recordType}
                onChange={(event) => setRecordType(event.target.value as MedicalRecordType)}
                options={[
                  { value: 'LAB_REPORT', label: 'Lab report' },
                  { value: 'DIAGNOSTIC_REPORT', label: 'Diagnostic report' },
                  { value: 'RADIOLOGY', label: 'Radiology or scan' },
                  { value: 'PRESCRIPTION', label: 'Prescription' },
                  { value: 'DISCHARGE_SUMMARY', label: 'Discharge summary' },
                  { value: 'VACCINATION', label: 'Vaccination' },
                  { value: 'CLINICAL_NOTE', label: 'Clinical note' },
                ]}
              />
              <Input label="Document date" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Clinician (optional)" placeholder="Doctor name" value={doctorName} onChange={(event) => setDoctorName(event.target.value)} />
              <Input label="Clinic or facility (optional)" placeholder="Facility name" value={provider} onChange={(event) => setProvider(event.target.value)} />
            </div>
            <div>
              <label htmlFor="record-notes" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Notes or findings (optional)</label>
              <textarea
                id="record-notes"
                rows={3}
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Add a short note to help identify this document."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label htmlFor="record-file" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">File attachment</label>
              <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                <Paperclip className="mx-auto mb-2 h-6 w-6 text-slate-400" />
                <input
                  id="record-file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setSelectedFile(file);
                    setAttachmentError(validateRecordAttachment(file) || '');
                  }}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:text-xs file:font-bold file:text-slate-700"
                />
                <p className="mt-2 text-xs text-slate-500">PDF, JPG, or PNG · up to 10 MB</p>
                {selectedFile && <p className="mt-1 text-xs text-slate-600">{selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                {attachmentError && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{attachmentError}</p>}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <Button type="button" variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={uploadMutation.isPending}>Save record</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

