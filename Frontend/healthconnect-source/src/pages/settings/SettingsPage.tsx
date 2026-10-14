import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { isDemoMode, readStored, writeStored, settingsKey, getDemoScenario, clearDemoData } from '../../lib/demo';
import type { DemoScenario } from '../../lib/request';
import { errorMessage } from '../../lib/request';
import type { UserRole } from '../../types';

interface Preferences { email: boolean; sms: boolean; push: boolean; }
const defaults: Preferences = { email: true, sms: false, push: true };

export const SettingsPage: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const key = settingsKey(user?.id ?? 'guest');
  const [preferences, setPreferences] = useState(() => readStored(key, defaults));
  const [scenario, setScenario] = useState<DemoScenario>(getDemoScenario);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const handleSave = () => {
    setMessage('');
    setError('');
    try {
      writeStored(key, preferences);
      setMessage('Preferences saved in this browser. Delivery of messages is not enabled by these switches.');
    } catch (failure) { setError(errorMessage(failure)); }
  };

  const changeScenario = (value: DemoScenario) => {
    try {
      writeStored('hc_demo_scenario', value);
      setScenario(value);
      setError('');
      void queryClient.resetQueries();
    } catch (failure) { setError(errorMessage(failure)); }
  };

  const resetDemo = () => {
    if (!window.confirm('Reset the sample session, preferences and demo records in this browser?')) return;
    try {
      clearDemoData();
      window.location.assign('/login');
    } catch (failure) { setError(errorMessage(failure)); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
      {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}
      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Notification preferences</h2>
        <p className="text-sm text-slate-500">These preferences are stored on this device.</p>
        {(['email', 'sms', 'push'] as const).map(channel => (
          <label key={channel} className="flex items-center justify-between gap-3 py-2">
            <span>{channel === 'sms' ? 'SMS' : channel === 'email' ? 'Email' : 'Push notifications'}</span>
            <input type="checkbox" checked={preferences[channel]} onChange={event => {
              setMessage('');
              setPreferences(current => ({ ...current, [channel]: event.target.checked }));
            }} />
          </label>
        ))}
        <Button onClick={handleSave}>Save preferences</Button>
      </Card>
      {isDemoMode && <Card className="p-6 space-y-4">
        <h2 className="font-semibold">Demo preview</h2>
        <p className="text-sm text-slate-500">Bookings and records use fictional browser data. No API calls or payments are made.</p>
        <label className="block space-y-2">
          <span>Preview scenario</span>
          <select className="block w-full rounded-lg border p-2 dark:bg-slate-900" value={scenario} onChange={event => changeScenario(event.target.value as DemoScenario)}>
            <option value="success">Success</option>
            <option value="error">Request failure</option>
            <option value="empty">Empty lists</option>
          </select>
        </label>
        <label className="block space-y-2">
          <span>Demo role</span>
          <select className="block w-full rounded-lg border p-2 dark:bg-slate-900" value={role} onChange={event => switchRole(event.target.value as UserRole)}>
            {['PATIENT', 'DOCTOR', 'HOSPITAL', 'ADMIN'].map(value => <option key={value}>{value}</option>)}
          </select>
        </label>
        <Button variant="outline" onClick={resetDemo}>Reset demo data</Button>
      </Card>}
    </div>
  );
};
