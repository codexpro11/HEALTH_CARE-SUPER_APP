import React from 'react';
import {
  Siren,
  Phone,
  MapPin,
  Clock,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Navigation,
  Radio,
  User,
  RotateCcw,
} from 'lucide-react';
import { useEmergencyStore } from '../../stores/emergencyStore';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const EmergencyPage: React.FC = () => {
  const {
    isActive,
    stage,
    activeRequest,
    simulatedEtaSeconds,
    triggerSOS,
    cancelEmergency,
    setIsTriggerModalOpen,
  } = useEmergencyStore();

  const etaMinutes = Math.ceil(simulatedEtaSeconds / 60);

  const handleStartEmergency = () => {
    setIsTriggerModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5 transition-colors">
          <Siren className="w-6 h-6 text-rose-600 dark:text-rose-500 animate-pulse" />
          <span>Emergency Medical Services (EMS) Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Instant high-priority dispatch connecting GPS beacons with Advanced Life Support (ALS) ambulances and emergency departments.
        </p>
      </div>

      {!isActive ? (
        /* Idle State - Huge SOS Button & Readiness Guidelines */
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-rose-50 via-white to-red-50/40 dark:from-rose-950/40 dark:via-slate-900 dark:to-red-950/20 border-rose-200 dark:border-rose-900/50 text-center p-8 sm:p-12 space-y-6 transition-colors">
            <div className="max-w-md mx-auto space-y-3">
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-widest bg-rose-100/70 dark:bg-rose-900/40 px-3 py-1 rounded-full transition-colors">
                High-Priority Emergency System
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 transition-colors">
                Need Urgent Emergency Medical Assistance?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                Pressing the SOS button instantly notifies nearby municipal emergency responders, shares your real-time coordinates, and alerts your saved emergency contact.
              </p>
            </div>

            {/* Huge SOS Trigger */}
            <div className="flex justify-center py-4">
              <button
                onClick={handleStartEmergency}
                className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 text-white flex flex-col items-center justify-center shadow-2xl hover:shadow-rose-500/50 dark:hover:shadow-rose-900/50 ring-8 ring-rose-200 dark:ring-rose-900/30 active:scale-95 transition-all group"
              >
                <Siren className="w-16 h-16 mb-2 group-hover:scale-110 transition-transform animate-bounce" />
                <span className="text-2xl sm:text-3xl font-black tracking-widest">SOS</span>
                <span className="text-[11px] uppercase tracking-widest font-bold text-rose-200 mt-1">
                  1-Tap Dispatch
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-rose-100 dark:border-rose-900/30 transition-colors">
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                <span>Auto-GPS Triangulation</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Radio className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                <span>Direct 911/EMS Radio Bridge</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <Building2 className="w-4 h-4 text-rose-600 dark:text-rose-500" />
                <span>Pre-reserved ICU Trauma Bed</span>
              </div>
            </div>
          </Card>

          {/* Quick Direct Municipal Emergency Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between transition-colors">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">National Emergency</span>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">911</p>
              </div>
              <a
                href="tel:911"
                className="p-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between transition-colors">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Poison Control</span>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">1-800-222-1222</p>
              </div>
              <a
                href="tel:18002221222"
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between transition-colors">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Suicide & Crisis</span>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">988</p>
              </div>
              <a
                href="tel:988"
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* Active SOS Dispatch Monitor */
        <div className="space-y-6">
          {/* Active Status Banner */}
          <div className="bg-rose-600 text-white rounded-3xl p-6 sm:p-8 shadow-lg space-y-4 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Siren className="w-6 h-6 animate-spin text-white" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">
                    Stage: {stage}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black mt-1">
                    Emergency Unit Dispatched
                  </h2>
                  <p className="text-xs text-rose-100">
                    Condition: <strong>{activeRequest?.emergencyType || 'Critical Distress'}</strong>
                  </p>
                </div>
              </div>

              {/* ETA Display */}
              <div className="p-4 bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-500 rounded-2xl text-center shadow-md shrink-0 sm:min-w-[140px] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Estimated Arrival
                </span>
                <span className="text-3xl font-black tracking-tight">{etaMinutes} min</span>
              </div>
            </div>

            {/* Telemetry Progress Bar */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs text-rose-100 font-medium">
                <span>Dispatch Assigned</span>
                <span>En Route to Coordinates</span>
                <span>Arriving at Scene</span>
              </div>
              <div className="w-full bg-rose-900/40 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-white h-full transition-all duration-1000 ease-out"
                  style={{
                    width:
                      stage === 'LOCATING'
                        ? '25%'
                        : stage === 'DISPATCHING'
                        ? '50%'
                        : stage === 'LIVE_TRACKING'
                        ? '80%'
                        : '100%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Grid of Unit and Hospital Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Paramedic Unit Card */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Assigned Paramedic Unit</h3>
                </div>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                  ALS Advanced Life Support
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Unit Identifier:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {activeRequest?.ambulance?.vehicleNumber || 'AMB-UNIT-402'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Lead Paramedic:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {activeRequest?.ambulance?.paramedicName || 'Marcus Sterling, NREMT-P'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">GPS Telemetry:</span>
                  <span className="font-mono text-teal-700 dark:text-teal-400 font-semibold">
                    {activeRequest?.latitude?.toFixed(4) || '37.7749'}, {activeRequest?.longitude?.toFixed(4) || '-122.4194'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Speed / Transit:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {activeRequest?.ambulance?.currentSpeedKmh || 42} km/h • Siren clearance active
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <a
                  href={`tel:${activeRequest?.ambulance?.paramedicContact || '5550198811'}`}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Paramedic</span>
                </a>
              </div>
            </Card>

            {/* Receiving Emergency Room & Contact Status */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Receiving Trauma Center</h3>
                </div>
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded">
                  Trauma Level 1
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Hospital:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {activeRequest?.ambulance?.assignedHospital || 'City General Trauma Center'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Distance:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">2.8 km away</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Emergency Bed Status:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">1 Bed Held on Standby</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Next-of-Kin Contact:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">David Jenkins (SMS Sent)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                  onClick={cancelEmergency}
                >
                  Cancel SOS Request
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
