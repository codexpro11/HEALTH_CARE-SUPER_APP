import React, { useState } from 'react';
import { Siren, MapPin, AlertCircle, PhoneCall, ShieldAlert, Loader2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { useNavigate } from 'react-router-dom';

export const EmergencyTriggerModal: React.FC = () => {
  const { isTriggerModalOpen, setIsTriggerModalOpen, triggerSOS, isActive, stage } =
    useEmergencyStore();
  const [emergencyType, setEmergencyType] = useState('Severe Cardiac / Chest Distress');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleActivate = async () => {
    setIsSubmitting(true);
    await triggerSOS(emergencyType);
    setIsSubmitting(false);
    navigate('/app/emergency');
  };

  const emergencyOptions = [
    'Severe Cardiac / Chest Distress',
    'Sudden Breathing Difficulty / Asthma',
    'Severe Trauma / Accident / Fall',
    'Unconscious / Stroke Symptoms',
    'Acute Poisoning / Allergic Reaction',
    'Other Critical Distress',
  ];

  return (
    <Modal
      isOpen={isTriggerModalOpen}
      onClose={() => setIsTriggerModalOpen(false)}
      maxWidth="md"
      title="EMERGENCY DISPATCH PROTOCOL"
    >
      <div className="space-y-4 text-left">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-900">
            <p className="font-bold">Life-Threatening Emergency Notice</p>
            <p className="mt-0.5 text-rose-700">
              Activating SOS broadcasts GPS telemetry to municipal ambulance networks and alerts nearby ICU facilities immediately.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Select Medical Condition
          </label>
          <div className="space-y-1.5">
            {emergencyOptions.map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                  emergencyType === opt
                    ? 'border-rose-300 bg-rose-50/70 text-rose-950 font-bold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="emergency-type"
                  checked={emergencyType === opt}
                  onChange={() => setEmergencyType(opt)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>Broadcasting from: <strong>742 Evergreen Terrace, Metro City</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Estimated nearest paramedic arrival: ~5-7 minutes</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="outline"
            className="w-1/3"
            onClick={() => setIsTriggerModalOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            className="w-2/3 py-3 font-bold text-sm bg-rose-600 hover:bg-rose-700 shadow-lg"
            isLoading={isSubmitting}
            leftIcon={<Siren className="w-4 h-4 animate-bounce" />}
            onClick={handleActivate}
          >
            {isActive ? 'Go to Live Tracking' : 'CONFIRM SOS DISPATCH'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
