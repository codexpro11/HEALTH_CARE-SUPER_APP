import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { EmergencyPage } from './emergency/EmergencyPage';

export const emergencyChanges = [
  ['SOS request', 'Temporary memory state and delayed timer', 'Account-scoped request, reload persistence and duplicate submission guard'],
  ['Location', 'Fixed example coordinates and address', 'Device coordinates with capture time and accuracy, or explicit manual location'],
  ['Status', 'Invented ambulance, arrival time and hospital assignment', 'Pending demo request; no invented dispatch or delivery confirmation'],
  ['Cancellation', 'Immediate reset without saved history', 'Confirmation, reason and durable cancellation history'],
  ['Notifications', 'Unrelated fixture messages and permanent red dot', 'Events from SOS actions, accurate unread count and saved read status'],
  ['Browser alerts', 'No browser permission workflow', 'Explicit opt-in, generic alert text, permission feedback and a test action'],
];
export function EmergencyComparisonPage() {
  return <div className="space-y-6">
    <div><p className="text-xs font-bold uppercase text-teal-700">HealthConnect � Phase 5</p>
      <h1 className="text-2xl font-black mt-2">Emergency & Notifications: Before &amp; After</h1>
      <p className="text-sm text-slate-500 mt-2">Three required phases follow: Android, Quality and Deployment. Live dispatch and FCM integration remain open.</p></div>
    <Card className="overflow-x-auto"><table className="w-full text-sm min-w-[650px]"><thead><tr><th className="p-4 text-left">Feature</th><th className="p-4 text-left">Before Phase 5</th><th className="p-4 text-left text-teal-700">After</th></tr></thead>
      <tbody>{emergencyChanges.map(([feature, before, after]) => <tr key={feature} className="border-t align-top"><th className="p-4 text-left">{feature}</th><td className="p-4 text-slate-500">{before}</td><td className="p-4">{after}</td></tr>)}</tbody></table></Card>
    <div className="flex flex-wrap gap-4 text-sm underline text-teal-700 dark:text-teal-300"><Link to="/app/emergency">Emergency workspace</Link><Link to="/app/notifications">Notification inbox</Link><Link to="/app/compare/services">Phase 4 services comparison</Link><Link to="/app/compare/records">Phase 3 records comparison</Link><Link to="/app/progress">Complete roadmap</Link></div>
    <section className="rounded-2xl border p-4 sm:p-6"><p className="font-bold text-teal-700 mb-5">After � Interactive workspace</p><EmergencyPage /></section>
  </div>;
}
