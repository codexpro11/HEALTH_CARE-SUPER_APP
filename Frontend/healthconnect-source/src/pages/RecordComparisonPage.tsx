import React from 'react';
import { Link } from 'react-router-dom';
import { BeforeMedicalRecordListPage } from './medical-records/BeforeMedicalRecordListPage';
import { MedicalRecordListPage } from './medical-records/MedicalRecordListPage';
import { Card } from '../components/common/Card';
import { isDemoMode } from '../lib/demo';

export function RecordComparisonPage() {
  if (!isDemoMode) return <Card><h1 className="text-xl font-bold">Comparison available in demo mode</h1><p className="mt-2 text-sm">Open your medical records to work with the connected backend.</p><Link to="/app/medical-records" className="mt-3 inline-block text-teal-700 underline">Medical Records</Link></Card>;
  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">HealthConnect � Phase 3</p>
      <h1 className="text-2xl font-black mt-2">Before &amp; After Preview</h1>
      <p className="mt-2 text-sm text-slate-500">The left panel preserves the previous medical-record interface with its original sample records. The right panel is the working Phase 3 demo: search, switch to Timeline, open a record, or try Archive.</p>
      <p className="mt-2 text-sm font-semibold text-teal-800 dark:text-teal-200">Historical preview: Phase 3 � Five required phases follow (4-8) � Phase 9 optional</p>
    </div>
    <div className="grid lg:grid-cols-2 gap-5">
      <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800"><h2 className="font-bold text-sm">Before � Phase 2 interface</h2><p className="text-xs text-slate-500 mt-1">Preserved preview � read-only</p></div>
        <div className="h-[820px] overflow-auto p-4 bg-slate-50 dark:bg-slate-950" aria-label="Previous record interface">
          <div ref={node => { if (node) node.inert = true; }}><BeforeMedicalRecordListPage /></div>
        </div>
      </section>
      <section className="min-w-0 overflow-hidden rounded-2xl border border-teal-300 dark:border-teal-800">
        <div className="px-5 py-3 bg-teal-50 dark:bg-teal-950"><h2 className="font-bold text-sm text-teal-900 dark:text-teal-100">After � Phase 3 medical records</h2><p className="text-xs text-teal-700 mt-1">Interactive demo � your browser changes persist</p></div>
        <div className="h-[820px] overflow-auto p-4 bg-slate-50 dark:bg-slate-950"><MedicalRecordListPage /></div>
      </section>
    </div>
    <div className="flex flex-wrap gap-5 text-sm font-semibold"><Link to="/app/medical-records" className="text-teal-700 underline">Open full record workspace</Link><Link to="/app/progress" className="text-teal-700 underline">View complete roadmap &amp; changes</Link></div>
  </div>;
}

