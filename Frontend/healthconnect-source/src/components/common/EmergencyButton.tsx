import React from 'react';
import { Siren } from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';

interface EmergencyButtonProps {
  variant?: 'pill' | 'floating' | 'banner' | 'compact';
  className?: string;
}

export const EmergencyButton: React.FC<EmergencyButtonProps> = ({
  variant = 'pill',
  className = '',
}) => {
  const { isActive, setIsTriggerModalOpen, stage } = useEmergencyStore();

  if (variant === 'floating') {
    return (
      <button
        onClick={() => setIsTriggerModalOpen(true)}
        className={`fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 flex items-center gap-2.5 px-4 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-full shadow-lg hover:shadow-rose-500/30 transition-all transform hover:scale-105 active:scale-95 group ${
          isActive ? 'ring-4 ring-rose-400 animate-pulse' : ''
        } ${className}`}
        aria-label="Emergency SOS"
      >
        <div className="relative">
          <Siren className="w-5 h-5 text-white animate-bounce" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
        </div>
        <span className="font-bold text-sm tracking-wide">
          {isActive ? 'SOS ACTIVE' : 'EMERGENCY SOS'}
        </span>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setIsTriggerModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-xs transition-colors ${
          isActive ? 'ring-2 ring-rose-400 animate-pulse' : ''
        } ${className}`}
        aria-label="Emergency SOS"
      >
        <Siren className="w-3.5 h-3.5 text-white" />
        <span>{isActive ? 'SOS ACTIVE' : 'SOS'}</span>
      </button>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={`w-full bg-gradient-to-r from-rose-600 to-red-700 text-white px-4 py-2.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Siren className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <p className="font-bold text-sm">Need immediate emergency medical response?</p>
            <p className="text-xs text-rose-100">
              One-tap GPS dispatch connects you to nearest trauma centers and ambulances.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsTriggerModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2 bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-transform active:scale-95 shrink-0"
        >
          {isActive ? 'View Live Dispatch' : 'Activate SOS'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsTriggerModalOpen(true)}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs tracking-wider text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-xs transition-all active:scale-95 ${
        isActive ? 'ring-2 ring-rose-500 bg-rose-600 text-white hover:bg-rose-700' : ''
      } ${className}`}
    >
      <Siren className="w-4 h-4 text-rose-600 animate-pulse" />
      <span>{isActive ? 'SOS IN PROGRESS' : 'EMERGENCY SOS'}</span>
    </button>
  );
};
