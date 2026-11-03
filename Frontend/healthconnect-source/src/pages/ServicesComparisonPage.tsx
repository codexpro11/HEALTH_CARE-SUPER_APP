import React from 'react';
import { Link } from 'react-router-dom';
import { BeforeDiagnosticListPage } from './diagnostics/BeforeDiagnosticListPage';
import { DiagnosticListPage } from './diagnostics/DiagnosticListPage';
import { isDemoMode } from '../lib/demo';
import { Card } from '../components/common/Card';

export const healthcareChanges = [
  ['Diagnostic booking', 'Fixed first center and 9 AM; no collection address', 'Choose an eligible center, time and collection method; home address required'],
  ['Booking management', 'Bookings saved but no history screen', 'Account-scoped history, status filters and confirmed cancellation'],
  ['Pharmacy checkout', 'Prescription medicines could be ordered without a document', 'Select an uploaded prescription reference; pharmacist review remains pending'],
  ['Order management', 'Order history and tracking only', 'Status filters, cancellation history and consistent price totals'],
  ['Hospitals', 'Name search and emergency filter', 'Search specialties, filter ICU and distance, sort by distance or rating'],
  ['Blood banks', 'Search and blood group chips', 'Add 24-hour and distance filters, nearest first, reset filters'],
  ['Availability', 'Sample bed data described as real time; invented ambulance ETA', 'Sample data identified; confirm with the facility; no capacity or dispatch guarantee'],
];

export function ServicesComparisonPage() {
  if (!isDemoMode) return <Card><h1 className="text-xl font-bold">Comparison available in demo mode</h1><Link to="/app/diagnostics" className="text-teal-700 underline">Open diagnostics</Link></Card>;
  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">HealthConnect · Phase 4</p>
      <h1 className="text-2xl font-black mt-2">Healthcare Services: Before &amp; After</h1>
      <p className="text-sm text-slate-500 mt-2">The previous diagnostics screen is preserved on the left. Use the updated screen on the right to search, book and manage demo tests.</p>
      <p className="font-semibold text-teal-800 dark:text-teal-200 mt-2">Current phase: 4 · Four required phases follow (5-8) · Phase 9 optional</p></div>
    <div className="grid xl:grid-cols-2 gap-5">
      <section className="min-w-0 rounded-2xl border overflow-hidden"><div className="p-4 bg-slate-100 dark:bg-slate-800"><h2 className="font-bold">Before · Phase 3 services</h2><p className="text-xs mt-1">Preserved screen · read-only</p></div>
        <div className="h-[760px] overflow-auto p-4 bg-slate-50 dark:bg-slate-950" aria-label="Previous diagnostics interface"><div ref={node => { if (node) node.inert = true; }}><BeforeDiagnosticListPage /></div></div></section>
      <section className="min-w-0 rounded-2xl border border-teal-300 overflow-hidden"><div className="p-4 bg-teal-50 dark:bg-teal-950"><h2 className="font-bold">After · Phase 4 services</h2><p className="text-xs mt-1">Interactive demo · changes saved in this browser</p></div>
        <div className="h-[760px] overflow-auto p-4 bg-slate-50 dark:bg-slate-950"><DiagnosticListPage /></div></section>
    </div>
    <Card className="overflow-x-auto"><table className="w-full text-sm min-w-[650px]"><thead><tr><th className="p-3 text-left">Feature</th><th className="p-3 text-left">Before</th><th className="p-3 text-left text-teal-700">After</th></tr></thead>
      <tbody>{healthcareChanges.map(([feature, before, after]) => <tr key={feature} className="border-t align-top"><th className="p-3 text-left">{feature}</th><td className="p-3 text-slate-500">{before}</td><td className="p-3">{after}</td></tr>)}</tbody></table></Card>
    <div className="flex flex-wrap gap-4 text-sm text-teal-700 underline"><Link to="/app/diagnostics">Full diagnostics workspace</Link><Link to="/app/pharmacy">Pharmacy</Link><Link to="/app/hospitals">Hospitals</Link><Link to="/app/blood-banks">Blood banks</Link><Link to="/app/compare/records">Phase 3 records comparison</Link><Link to="/app/progress">Complete roadmap</Link></div>
  </div>;
}
