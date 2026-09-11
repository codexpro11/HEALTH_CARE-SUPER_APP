import React, { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Server,
  Database,
  ShieldCheck,
  Smartphone,
  Download,
  Trash2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const SettingsPage: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleClearCache = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Settings & Integrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure security protocols, alert channels, and monitor Spring Boot REST API connectivity.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      {/* Backend Integration Diagnostics Panel (Spring Boot REST API) */}
      <Card className="p-6 border-teal-200 bg-teal-50/30 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-teal-100">
          <div className="flex items-center gap-2.5">
            <Server className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Backend REST API Integration Status
              </h3>
              <p className="text-xs text-slate-500">
                Java 21+ Spring Boot Enterprise Backend Bridge
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            API Bridge Active (Development Fallback Enabled)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-white border border-teal-100 rounded-xl space-y-1">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Base Endpoint</span>
            <span className="font-mono text-slate-800 text-xs break-all">{apiBaseUrl}</span>
          </div>

          <div className="p-3 bg-white border border-teal-100 rounded-xl space-y-1">
            <span className="text-slate-400 block font-bold text-[10px] uppercase">Authentication Flow</span>
            <span className="text-slate-800 text-xs font-semibold">
              JWT Bearer with Auto-Refresh Interceptor
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500">
          All endpoints in HealthConnect are constructed to communicate with your separate Spring Boot backend. When unreachable, the application smoothly engages client-side clinical fallbacks to ensure full offline review and test capability.
        </p>
      </Card>

      {/* Communication Preferences */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-600" />
          <span>Notification & Dispatch Channels</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900">Critical SMS Alerts</p>
              <p className="text-[11px] text-slate-500">
                Receive instant SMS notifications for appointment changes and emergency responses.
              </p>
            </div>
            <input
              type="checkbox"
              checked={smsNotifs}
              onChange={(e) => setSmsNotifs(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900">Email Clinical Reports</p>
              <p className="text-[11px] text-slate-500">
                Receive PDF e-prescriptions and verified diagnostic reports via encrypted email.
              </p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900">In-App Push Notifications</p>
              <p className="text-[11px] text-slate-500">
                Live doctor video room ready notifications and medication reminders.
              </p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifs}
              onChange={(e) => setPushNotifs(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
          </label>
        </div>
      </Card>

      {/* Security & Data Privacy Card */}
      <Card className="p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-600" />
          <span>Security & HIPAA Governance</span>
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-slate-900">Two-Factor Authentication (2FA)</p>
              <p className="text-[11px] text-slate-500">
                Require biometric or SMS verification for sensitive medical record access.
              </p>
            </div>
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={(e) => setTwoFactorAuth(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
            />
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-slate-200 gap-3">
            <div>
              <p className="text-xs font-bold text-slate-900">Export Clinical Data Archive</p>
              <p className="text-[11px] text-slate-500">
                Download all medical records, consultation notes, and prescriptions in standard FHIR JSON format.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={() => alert('Preparing HIPAA compliant patient data archive...')}
            >
              Export
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/40 gap-3">
            <div>
              <p className="text-xs font-bold text-rose-900">Reset Local Session & Cache</p>
              <p className="text-[11px] text-rose-700">
                Clear all active demo state, cart contents, and stored tokens from browser memory.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-300 text-rose-700 hover:bg-rose-100"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={handleClearCache}
            >
              Reset Cache
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end pt-2">
        <Button variant="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </div>
    </div>
  );
};
