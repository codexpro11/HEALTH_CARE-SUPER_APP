import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, FileText, Paperclip, Upload } from 'lucide-react';
import { medicalRecordApi } from '../../api/medicalRecordApi';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { MedicalRecordCard } from '../../components/medical-records/MedicalRecordCard';
import { Modal } from '../../components/common/Modal';
import { Select } from '../../components/common/Select';
import { localDate } from '../../lib/frontend';
import { validateRecordAttachment } from '../../lib/recordAttachments';
import { MedicalRecord, MedicalRecordType } from '../../types';
import { Link } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { RecordSharing } from '../../components/medical-records/RecordSharing';
import { RecordActivityPanel } from '../../components/medical-records/RecordActivityPanel';
import { initialRecordFilters, selectRecords, groupRecordTimeline, validateRecordMetadata, type RecordFilters } from '../../lib/medicalRecordRules';

const hasAttachment = (record: MedicalRecord) => Boolean(record.fileUrl || record.originalFileName);

export const MedicalRecordListPage: React.FC = () => {
  const [filters, setFilters] = useState<RecordFilters>(initialRecordFilters);
  const [layout, setLayout] = useState<'CARDS' | 'TIMELINE'>('CARDS');
  const [tab, setTab] = useState<'LIBRARY' | 'ACTIVITY'>('LIBRARY');
  const [archiveRecord, setArchiveRecord] = useState<MedicalRecord | null>(null);
  const [notice, setNotice] = useState('');
  const [privacy, setPrivacy] = useState<MedicalRecord['confidentialityLevel']>('STANDARD');
  const setFilter = <K extends keyof RecordFilters>(key: K, value: RecordFilters[K]) => setFilters(current => ({ ...current, [key]: value }));
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
    queryKey: ['medical-records'],
    queryFn: () => medicalRecordApi.getRecords(),
  });
  const allRecords = response?.data || [];
  const dateError = filters.from && filters.to && filters.from > filters.to ? 'The start date must be on or before the end date.' : '';
  const records = dateError ? [] : selectRecords(allRecords, filters);
  const activeRecords = allRecords.filter(record => record.status !== 'ARCHIVED');
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['medical-records'] });
    queryClient.invalidateQueries({ queryKey: ['record-activity'] });
  };
  const archiveMutation = useMutation({
    mutationFn: (record: MedicalRecord) => medicalRecordApi.setArchived(record.id, record.status !== 'ARCHIVED'),
    onSuccess: ({ data }) => { invalidate(); setArchiveRecord(null); setNotice(data.status === 'ARCHIVED' ? 'Record archived. It is excluded from provider summaries.' : 'Record restored to your library.'); },
    onError: (error: Error) => setActionError(error.message || 'The document status could not be updated.'),
  });
  const openRecord = (record: MedicalRecord) => {
    setActionError('');
    try { medicalRecordApi.logActivity(record, 'VIEWED'); queryClient.invalidateQueries({ queryKey: ['record-activity'] }); }
    catch { setActionError('The record opened, but its activity could not be saved.'); }
    setViewRecord(record);
  };

  const uploadMutation = useMutation({
    mutationFn: ({ record, file }: { record: Partial<MedicalRecord>; file: File }) =>
      medicalRecordApi.uploadRecord(record, file),
    onSuccess: () => {
      invalidate();
      setFilters(initialRecordFilters);
      setNotice('Record added to your library.');
      setIsUploadOpen(false);
      setTitle('');
      setSummary('');
      setSelectedFile(null);
      setAttachmentError('');
      setDate(localDate());
      setDoctorName('');
      setProvider('');
      setPrivacy('STANDARD');
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
    const metadataError = validateRecordMetadata({ title, date, recordType, summary, confidentialityLevel: privacy }, localDate());
    if (metadataError) {
      setActionError(metadataError);
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
        confidentialityLevel: privacy,
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
      try { medicalRecordApi.logActivity(record, 'DOWNLOADED'); queryClient.invalidateQueries({ queryKey: ['record-activity'] }); }
      catch { setActionError('The file downloaded, but its activity could not be saved.'); }
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
    { id: 'CONSULTATION_NOTE', label: 'Consultation Notes' },
    { id: 'CLINICAL_NOTE', label: 'Clinical Notes' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest font-bold text-teal-700 mb-2">Phase 3 · Your health documents</p>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Find a report, follow your health timeline, and review who can access your summaries.
          </p>
        </div>
        <Button variant="primary" leftIcon={<Upload className="w-4 h-4" />} onClick={() => {
          setActionError('');
          setIsUploadOpen(true);
        }}>
          Add a record
        </Button>
      </div>

      {notice && <p role="status" className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{notice}</p>}
      {!isLoading && !isError && <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Record overview">
        {[
          ['Active records', activeRecords.length],
          ['Attachments', activeRecords.filter(record => hasAttachment(record)).length],
          ['Restricted / confidential', activeRecords.filter(record => record.confidentialityLevel !== 'STANDARD').length],
          ['Archived', allRecords.filter(record => record.status === 'ARCHIVED').length],
        ].map(([label, value]) => <Card key={label} padding="sm"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-900 dark:text-slate-100">{value}</p></Card>)}
      </div>}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2" role="group" aria-label="Record sections">
          <Button variant={tab === 'LIBRARY' ? 'primary' : 'ghost'} aria-pressed={tab === 'LIBRARY'} onClick={() => setTab('LIBRARY')}>Record library</Button>
          <Button variant={tab === 'ACTIVITY' ? 'primary' : 'ghost'} aria-pressed={tab === 'ACTIVITY'} onClick={() => setTab('ACTIVITY')}>Access & activity</Button>
        </div>
        <Link to="/app/consent" className="text-sm font-semibold text-teal-700 underline">Manage sharing</Link>
      </div>

      {actionError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {actionError}
        </div>
      )}

      {tab === 'ACTIVITY' ? <RecordActivityPanel /> : <>
      <Card className="space-y-4" padding="sm">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2"><Input label="Search records" placeholder="Title, clinician, facility or tag" value={filters.search} onChange={event => setFilter('search', event.target.value)} /></div>
          <Select label="Sort records" value={filters.sort} onChange={event => setFilter('sort', event.target.value as RecordFilters['sort'])} options={[
            { value: 'NEWEST', label: 'Newest first' }, { value: 'OLDEST', label: 'Oldest first' }, { value: 'TITLE', label: 'Title A-Z' },
          ]} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="From date" type="date" value={filters.from} onChange={event => setFilter('from', event.target.value)} />
          <Input label="To date" type="date" value={filters.to} onChange={event => setFilter('to', event.target.value)} />
          <Select label="Record visibility" value={filters.status} onChange={event => setFilter('status', event.target.value as RecordFilters['status'])} options={[
            { value: 'ACTIVE', label: 'Active library' }, { value: 'ARCHIVED', label: 'Archived records' }, { value: 'ALL', label: 'All records' },
          ]} />
        </div>
        {dateError && <p role="alert" className="text-sm text-rose-700">{dateError}</p>}
      </Card>
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none" role="group" aria-label="Record categories">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setFilter('type', category.id)}
            aria-pressed={filters.type === category.id}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              filters.type === category.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-xs text-slate-500">{isLoading ? 'Loading records...' : isError ? 'Records unavailable' : `${records.length} matching record${records.length === 1 ? '' : 's'}`}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Record layout">
          <Button variant="ghost" size="sm" onClick={() => setFilters(initialRecordFilters)}>Clear filters</Button>
          <Button size="sm" variant={layout === 'CARDS' ? 'secondary' : 'ghost'} aria-pressed={layout === 'CARDS'} onClick={() => setLayout('CARDS')}>Cards</Button>
          <Button size="sm" variant={layout === 'TIMELINE' ? 'secondary' : 'ghost'} aria-pressed={layout === 'TIMELINE'} onClick={() => setLayout('TIMELINE')}>Timeline</Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton type="list" count={4} />
      ) : isError ? (
        <ErrorState message="Could not fetch medical records." onRetry={() => refetch()} />
      ) : records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={allRecords.length ? 'No matching records' : 'Your record library is empty'}
          description={allRecords.length ? 'Try another search, date range or category.' : 'Add your first PDF or image document.'}
          actionLabel={allRecords.length ? 'Clear filters' : 'Add a record'}
          onAction={() => allRecords.length ? setFilters(initialRecordFilters) : setIsUploadOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {layout === 'TIMELINE' ? groupRecordTimeline(records).map(([month, items]) => <section key={month} className="space-y-3 border-l-2 border-teal-200 pl-4 sm:pl-6" aria-label={month}>
            <h2 className="text-sm font-bold text-teal-800 dark:text-teal-200">{month === 'Undated' ? month : new Date(month + '-01T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
            {items.map(record => <MedicalRecordCard key={record.id} record={record} onView={openRecord} onDownload={handleDownload} onArchive={setArchiveRecord} isUpdating={archiveMutation.isPending} />)}
          </section>) : records.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              onView={openRecord}
              onDownload={handleDownload}
              onArchive={setArchiveRecord}
              isUpdating={archiveMutation.isPending}
            />
          ))}
        </div>
      )}
      </>}

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
            <RecordSharing record={viewRecord} />

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
            {actionError && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{actionError}</p>}
            <Input
              label="Document title"
              placeholder="e.g. Complete blood count report"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={200}
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
              <Input label="Document date" type="date" max={localDate()} value={date} onChange={(event) => setDate(event.target.value)} required />
            </div>
            <Select label="Document privacy" value={privacy} onChange={event => setPrivacy(event.target.value as MedicalRecord['confidentialityLevel'])} options={[
              { value: 'STANDARD', label: 'Standard - summary can follow consent' },
              { value: 'RESTRICTED', label: 'Restricted - excluded from demo sharing' },
              { value: 'CONFIDENTIAL', label: 'Confidential - excluded from demo sharing' },
            ]} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Clinician (optional)" placeholder="Doctor name" value={doctorName} onChange={(event) => setDoctorName(event.target.value)} />
              <Input label="Clinic or facility (optional)" placeholder="Facility name" value={provider} onChange={(event) => setProvider(event.target.value)} />
            </div>
            <div>
              <label htmlFor="record-notes" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Notes or findings (optional)</label>
              <textarea
                id="record-notes"
                rows={3}
                maxLength={10000}
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
              <Button type="button" variant="outline" disabled={uploadMutation.isPending} onClick={() => setIsUploadOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={uploadMutation.isPending}>Save record</Button>
            </div>
          </form>
        </Modal>
      )}
      {archiveRecord && <Modal isOpen onClose={() => !archiveMutation.isPending && setArchiveRecord(null)} title={archiveRecord.status === 'ARCHIVED' ? 'Restore this record?' : 'Archive this record?'} maxWidth="md">
        <p className="text-sm text-slate-600">{archiveRecord.status === 'ARCHIVED' ? 'This record will return to your active library. Standard summaries will follow current provider consent.' : 'This record leaves the active library and provider summaries. Its attachment is kept, and you can restore it later.'}</p>
        <p className="mt-3 text-sm font-bold">{archiveRecord.title}</p>
        {actionError && <p role="alert" className="mt-3 text-sm text-rose-700">{actionError}</p>}
        <div className="flex justify-end gap-2 mt-5"><Button variant="outline" disabled={archiveMutation.isPending} onClick={() => { setArchiveRecord(null); setActionError(''); }}>Cancel</Button>
          <Button isLoading={archiveMutation.isPending} onClick={() => { setActionError(''); archiveMutation.mutate(archiveRecord); }}>{archiveRecord.status === 'ARCHIVED' ? 'Restore record' : 'Archive record'}</Button></div>
      </Modal>}
    </div>
  );
};
