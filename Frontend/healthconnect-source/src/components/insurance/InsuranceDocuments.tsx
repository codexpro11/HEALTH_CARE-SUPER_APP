import React, { useEffect, useRef, useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { readInsuranceDocument, removeInsuranceDocument, uploadInsuranceDocument } from '../../lib/insuranceDemo';
import type { DocumentKind, InsuranceDocument } from '../../lib/insuranceDemo';

export function InsuranceDocuments({ kind, parentId, documents, editable = true }: {
  kind: DocumentKind; parentId: string; documents: InsuranceDocument[]; editable?: boolean;
}) {
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ id: string; url: string; name: string; type: string } | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url); }, [preview?.url]);
  const run = async (action: () => Promise<void>) => {
    if (busy) return; setBusy(true); setError(''); setNotice('');
    try { await action(); }
    catch (failure) { if (mounted.current) setError(failure instanceof Error ? failure.message : 'Document action failed.'); }
    finally { if (mounted.current) setBusy(false); }
  };
  const upload = () => run(async () => {
    const file = input.current?.files?.[0];
    if (!file) throw new Error('Choose a PDF, JPG, or PNG file to attach.');
    await uploadInsuranceDocument(kind, parentId, file);
    if (mounted.current) { setNotice('Document saved in this demo browser.'); if (input.current) input.current.value = ''; }
  });
  const view = (id: string) => run(async () => {
    const { document, blob } = await readInsuranceDocument(kind, parentId, id);
    if (!mounted.current) return;
    setPreview({ id: document.id, url: URL.createObjectURL(blob), name: document.name, type: document.type });
  });
  const download = (id: string) => run(async () => {
    const { document, blob } = await readInsuranceDocument(kind, parentId, id);
    if (!mounted.current) return;
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement('a');
    anchor.href = url; anchor.download = document.name; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice('Download started.');
  });
  const remove = (id: string) => {
    if (!confirm('Remove this document from the demo?')) return;
    run(async () => { await removeInsuranceDocument(kind, parentId, id); if (mounted.current) setNotice('Document removed.'); });
  };
  return <Card className="p-5 space-y-4">
    <h2 className="text-lg font-bold">{kind === 'policy' ? 'Policy Documents' : 'Claim Documents'}</h2>
    <p className="text-xs text-slate-500">PDF, JPG or PNG up to 10 MB. Files stay in this browser and are not sent to an insurer.</p>
    {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
    {notice && <p role="status" className="text-sm text-teal-700">{notice}</p>}
    {editable && <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <label className="block flex-1 text-xs font-bold text-slate-600 dark:text-slate-300">Attach a document
        <input ref={input} type="file" accept=".pdf,.jpg,.jpeg,.png" disabled={busy} className="block w-full mt-2 text-sm" />
      </label>
      <Button onClick={upload} disabled={busy}>{busy ? 'Working...' : 'Upload Document'}</Button>
    </div>}
    {!editable && <p className="text-xs text-slate-500">Submitted claim documents are read-only.</p>}
    {documents.length === 0 ? <p className="text-sm text-slate-500">No documents attached.</p> :
      <ul className="space-y-3">{documents.map(document => <li key={document.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-sm font-semibold break-all">{document.name}</p>
        <p className="text-xs text-slate-500">{(document.size / 1024).toFixed(1)} KB � {document.uploadedAt.slice(0, 10)}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => view(document.id)} disabled={busy} aria-label={'Preview ' + document.name}>Preview</Button>
          <Button variant="outline" size="sm" onClick={() => download(document.id)} disabled={busy} aria-label={'Download ' + document.name}>Download</Button>
          {editable && <Button variant="outline" size="sm" onClick={() => remove(document.id)} disabled={busy} aria-label={'Remove ' + document.name}>Remove</Button>}
        </div>
      </li>)}</ul>}
    <Modal isOpen={!!preview} onClose={() => setPreview(null)} title={preview?.name ?? 'Document Preview'} maxWidth="lg">
      {error && <p role="alert" className="text-sm text-rose-700 mb-3">{error}</p>}
      {preview?.type === 'application/pdf' && <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-xs text-slate-500">PDF preview uses your browser's viewer. Download if it is unavailable.</p>
        <Button variant="outline" size="sm" onClick={() => download(preview.id)} disabled={busy}>Download Document</Button>
      </div>}
      {preview && (preview.type === 'application/pdf' ?
        <iframe title={preview.name} src={preview.url} className="w-full h-[60vh] border-0" /> :
        <img src={preview.url} alt={preview.name} className="max-h-[60vh] mx-auto object-contain" />)}
    </Modal>
  </Card>;
}

