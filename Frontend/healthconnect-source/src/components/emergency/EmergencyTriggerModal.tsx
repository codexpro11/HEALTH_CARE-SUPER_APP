import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Siren } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { emergencyTypes, validateSos, type SosInput } from '../../lib/emergencyRules';
import { isDemoMode } from '../../lib/demo';

export function EmergencyTriggerModal() {
  const { isTriggerModalOpen, setIsTriggerModalOpen, triggerSOS, isActive, busy, error } = useEmergencyStore();
  const [input, setInput] = useState<SosInput>({ clientRequestId: '', emergencyType: emergencyTypes[0], address: '', locationSource: 'MANUAL' });
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [formError, setFormError] = useState('');
  const attempt = useRef(0);
  const navigate = useNavigate();
  useEffect(() => {
    attempt.current++;
    setLocating(false);
    setLocationMessage('');
    setFormError('');
    if (isTriggerModalOpen) setInput({ clientRequestId: crypto.randomUUID(), emergencyType: emergencyTypes[0], address: '', locationSource: 'MANUAL' });
    return () => { attempt.current++; };
  }, [isTriggerModalOpen]);
  const locate = () => {
    const token = ++attempt.current;
    if (!navigator.geolocation || !window.isSecureContext) {
      setLocationMessage('Device location is unavailable. Enter an address or landmark below.');
      return;
    }
    setLocating(true);
    setLocationMessage('Waiting for device location. You can also enter a manual location.');
    navigator.geolocation.getCurrentPosition(position => {
      if (token !== attempt.current) return;
      setInput(current => ({ ...current, latitude: position.coords.latitude, longitude: position.coords.longitude, accuracyMeters: position.coords.accuracy, locationCapturedAt: new Date(position.timestamp).toISOString(), locationSource: 'GPS' }));
      setLocationMessage('Device location captured. Accuracy: about ' + Math.round(position.coords.accuracy) + ' m. Add an address or landmark below.');
      setLocating(false);
    }, failure => {
      if (token !== attempt.current) return;
      setLocating(false);
      setLocationMessage((failure.code === 1 ? 'Location permission denied.' : failure.code === 3 ? 'Location request timed out.' : 'Device location unavailable.') + ' Enter an address or landmark below.');
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  };
  const manual = () => {
    attempt.current++;
    setLocating(false);
    setInput(current => ({ ...current, locationSource: 'MANUAL', latitude: undefined, longitude: undefined, accuracyMeters: undefined, locationCapturedAt: undefined }));
    setLocationMessage('Manual location selected. No device coordinates will be saved.');
  };
  const confirm = async () => {
    if (isActive) { setIsTriggerModalOpen(false); navigate('/app/emergency'); return; }
    const invalid = validateSos(input);
    setFormError(invalid ?? '');
    if (!invalid && await triggerSOS(input)) navigate('/app/emergency');
  };
  return <Modal isOpen={isTriggerModalOpen} onClose={() => { if (!busy) setIsTriggerModalOpen(false); }} title={isDemoMode ? 'Create a demo SOS request' : 'Confirm emergency request'} maxWidth="md">
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-rose-50 text-rose-900 dark:bg-rose-950 dark:text-rose-200 text-sm space-y-2">
        <p className="font-bold">{isDemoMode ? 'Demo only - no emergency services are contacted.' : 'A request does not confirm ambulance dispatch.'}</p>
        <a href="tel:112" className="font-bold underline">Call 112 in India for emergency assistance</a>
      </div>
      {isActive ? <p>A request is already active for your account. Open it to view the saved status.</p> : <>
        <label className="block text-sm font-semibold">Emergency type
          <select className="block w-full rounded-lg border p-3 mt-2 dark:bg-slate-900" value={input.emergencyType} onChange={e => setInput(current => ({ ...current, emergencyType: e.target.value }))}>
            {emergencyTypes.map(type => <option key={type}>{type}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={locate} isLoading={locating} disabled={busy} leftIcon={<MapPin className="w-4 h-4" />}>Use device location</Button>
          <Button variant="ghost" onClick={manual} disabled={busy}>Use manual location</Button>
        </div>
        {locationMessage && <p role="status" className="text-sm text-slate-500">{locationMessage}</p>}
        {input.locationSource === 'GPS' && <p className="text-xs font-mono">{input.latitude?.toFixed(5)}, {input.longitude?.toFixed(5)}</p>}
        <label className="block text-sm font-semibold">Location or landmark
          <textarea className="block w-full rounded-lg border p-3 mt-2 dark:bg-slate-900" rows={3} maxLength={500} value={input.address} onChange={e => setInput(current => ({ ...current, address: e.target.value }))} placeholder="Building, street, area and city" />
        </label>
        <p className="text-xs text-slate-500">Location is saved only when you confirm. Your saved emergency contact is not automatically notified.</p>
      </>}
      {(formError || error) && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{formError || error}</p>}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" disabled={busy} onClick={() => setIsTriggerModalOpen(false)}>Close</Button>
        <Button variant="danger" isLoading={busy} disabled={locating} onClick={confirm} leftIcon={<Siren className="w-4 h-4" />}>{isActive ? 'View active request' : isDemoMode ? 'Confirm demo SOS' : 'Confirm SOS request'}</Button>
      </div>
    </div>
  </Modal>;
}
