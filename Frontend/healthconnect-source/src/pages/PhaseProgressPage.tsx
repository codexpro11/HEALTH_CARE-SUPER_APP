import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Card } from '../components/common/Card';
import { emergencyChanges } from './EmergencyComparisonPage';

const phases = [
  ['0', 'Project setup', 'Repository and web/backend setup exist; native Android setup remains to be verified.'],
  ['1', 'Backend foundation', 'Firebase and user/profile code exist; deployed authorization needs end-to-end verification.'],
  ['2', 'Patient + Doctor', 'Patient booking demo and provider consultation demo implemented. Live provider APIs and server double-booking controls remain.'],
  ['3', 'Medical records', 'Frontend demo milestone implemented. Live storage, consent and server audit integration remain.'],
  ['4', 'Healthcare services', 'Diagnostic center/time selection, booking history/cancellation, prescription document selection, order cancellation and directory filters implemented in the frontend demo. Live capacity, pharmacist verification, fulfillment and backend integration remain.'],
  ['5', 'Emergency + Notifications - current', 'Persistent account-scoped SOS, device/manual location, confirmed cancellation, inbox and browser alerts implemented. Live dispatch and FCM remain.'],
  ['6', 'Android completion', 'Native Android screens and device workflows remain.'],
  ['7', 'Quality', 'Frontend checks are incremental. Full API/security/integration and device checks remain.'],
  ['8', 'Deployment', 'Frontend demo is hosted. Spring Boot, PostgreSQL and production configuration remain.'],
  ['9', 'Advanced - optional', 'Caching, realtime, video, payments and other advanced services after core phases are stable.'],
];
export function PhaseProgressPage() {
  const { role } = useAuth();
  const home = role === 'PATIENT' ? '/app/dashboard' : '/provider/dashboard';
  return <div className="max-w-6xl mx-auto space-y-6">
    <div><p className="text-xs font-bold uppercase tracking-wider text-teal-700">HealthConnect roadmap</p>
      <h1 className="text-2xl font-black mt-2">Phases &amp; Side-by-side Changes</h1>
      <p className="text-sm text-slate-500 mt-2">Continuing the original application and roadmap. Demo progress and end-to-end completion are tracked separately.</p></div>
    <div className="grid sm:grid-cols-3 gap-4">
      <Card className="p-5"><p className="text-sm text-slate-500">Current numbered phase</p><p className="text-3xl font-black mt-2">5</p><p className="text-sm mt-2">Emergency and Notifications: frontend milestone</p></Card>
      <Card className="p-5"><p className="text-sm text-slate-500">Required phases after Phase 5</p><p className="text-3xl font-black mt-2">3</p><p className="text-sm mt-2">Phases 6-8 still need end-to-end completion</p></Card>
      <Card className="p-5"><p className="text-sm text-slate-500">Optional advanced phase</p><p className="text-3xl font-black mt-2">1</p><p className="text-sm mt-2">Phase 9, after the core application is stable</p></Card>
    </div>
    <p className="text-sm text-slate-500">Phase 5 remains open for live dispatch, backend and FCM integration. Earlier phases also retain verification gaps. Three counts the required numbered phases after the current milestone.</p>
    <Card className="overflow-hidden">
      {role === 'PATIENT' && <div className="px-5 pt-5"><Link to="/app/compare" className="text-teal-700 font-bold underline">Open the visual Before &amp; After Preview</Link></div>}
      <div className="p-5"><h2 className="text-lg font-bold">Before / After this milestone</h2><p className="text-sm text-slate-500 mt-1">These are implemented frontend changes. Clinical actions remain simulated.</p></div>
      <div className="overflow-x-auto"><table className="w-full text-sm min-w-[650px]">
        <thead className="bg-slate-100 dark:bg-slate-800"><tr><th className="p-4 text-left">Feature</th><th className="p-4 text-left">Before</th><th className="p-4 text-left text-teal-700 dark:text-teal-300">After</th></tr></thead>
        <tbody>{emergencyChanges.map(([feature, before, after]) => <tr key={feature} className="border-t border-slate-200 dark:border-slate-800 align-top">
          <th className="p-4 text-left font-semibold">{feature}</th><td className="p-4 text-slate-500">{before}</td><td className="p-4">{after}</td></tr>)}</tbody>
      </table></div>
    </Card>
    <Card className="p-5 space-y-4"><h2 className="text-lg font-bold">Original ten-phase roadmap</h2>
      {phases.map(([number, name, status]) => <div key={number} className={'rounded-xl p-4 border ' + (number === '5' ? 'border-teal-500 bg-teal-50 dark:bg-teal-950' : 'border-slate-200 dark:border-slate-800')}>
        <h3 className="font-bold">Phase {number} · {name}</h3><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{status}</p></div>)}
    </Card>
    <Card className="p-5 space-y-3"><h2 className="font-bold">Try the complete demo flow</h2>
      <p className="text-sm">Use the Patient Demo to book Dr. Evelyn Reed. Switch to the Doctor persona, choose Evelyn, and open Appointments. Start the consultation, save notes and a prescription draft, then complete it. Return to the patient appointment to view the completed summary.</p>
      <p className="text-sm">For protected records, copy the patient's NFC payload, obtain a standard scan in the provider NFC scanner, then open Medical Records. Consent revocation, replacement, expiry or a role/account change removes that access.</p>
      <Link className="inline-block text-teal-700 underline" to={home}>Return to workspace</Link>
    </Card>
  </div>;
}
