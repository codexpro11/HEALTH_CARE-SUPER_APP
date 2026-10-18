import React, { useEffect, useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { readEmergencyState, saveEmergencyState, emergencyChangeEvent } from '../../lib/emergencyDemo';
import { isDemoMode, getDemoSession } from '../../lib/demo';
import { errorMessage } from '../../lib/request';
import { useAuth } from '../../auth/AuthContext';

export function BrowserAlertSettings() {
  const { user } = useAuth();
  const supported = typeof Notification !== 'undefined' && window.isSecureContext;
  const [permission, setPermission] = useState(supported ? Notification.permission : 'unsupported');
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!isDemoMode) return;
    const sync = () => { try { setEnabled(readEmergencyState().browserAlerts); } catch (failure) { setError(errorMessage(failure)); } };
    sync();
    window.addEventListener(emergencyChangeEvent, sync);
    return () => window.removeEventListener(emergencyChangeEvent, sync);
  }, [user?.id]);
  const enable = async () => {
    const owner = user?.id;
    setBusy(true); setError(''); setMessage('');
    try {
      if (!supported) throw new Error('Browser alerts are unavailable here. Your inbox still works.');
      const result = await Notification.requestPermission();
      if (currentDemoOwner() !== owner) return;
      setPermission(result);
      if (result !== 'granted') { setMessage('Permission was not granted. Use your inbox, or change this site permission in browser settings.'); return; }
      saveEmergencyState({ ...readEmergencyState(), browserAlerts: true });
      setEnabled(true);
      setMessage('Browser alert preference saved. Your browser and system settings control delivery while this app is open.');
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  const disable = () => {
    try {
      saveEmergencyState({ ...readEmergencyState(), browserAlerts: false });
      setEnabled(false); setError(''); setMessage('Browser alerts disabled for this account. Inbox updates remain available.');
    } catch (failure) { setError(errorMessage(failure)); }
  };
  const test = () => {
    setError(''); setMessage('');
    setPermission(supported ? Notification.permission : 'unsupported');
    try {
      if (!supported || Notification.permission !== 'granted') throw new Error('Browser permission is required.');
      new Notification('HealthConnect', { body: 'Test alert. No medical or location details are included.', tag: 'healthconnect-test' });
      setMessage('Test alert requested from your browser. System notification settings can suppress it.');
    } catch (failure) { setError(errorMessage(failure)); }
  };
  return <Card className="p-5 space-y-3"><h2 className="font-bold">Browser alerts</h2>
    <p className="text-sm text-slate-500">{isDemoMode ? 'Optional alerts on this device while the app is open. Inbox updates work without permission. Background push, SMS and email are not enabled.' : 'Your inbox retrieves account updates while the app is open. Background notifications are not yet enabled.'}</p>
    <p className="text-xs">Browser permission: {permission} � Account alerts: {enabled ? 'enabled' : 'disabled'}</p>
    {isDemoMode && <div className="flex flex-wrap gap-2">{enabled ? <Button variant="outline" onClick={disable}>Disable browser alerts</Button> : <Button variant="outline" disabled={!supported || busy} isLoading={busy} onClick={enable}>Enable browser alerts</Button>}
      {enabled && <Button variant="ghost" onClick={test}>Send test alert</Button>}</div>}
    {message && <p role="status" className="text-sm text-teal-700 dark:text-teal-300">{message}</p>}
    {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
  </Card>;
}
function currentDemoOwner() { return getDemoSession()?.id; }
