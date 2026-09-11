import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, Lock } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/login" className="inline-flex items-center gap-2.5 mb-3 group">
          <div className="w-11 h-11 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md group-hover:bg-teal-700 transition-colors">
            <Activity className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-black text-2xl text-slate-900 tracking-tight block">
              HealthConnect
            </span>
            <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider block">
              Unified Clinical Platform
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 border border-slate-200/80 rounded-3xl shadow-sm space-y-6">
          <Outlet />
        </div>

        {/* Security & HIPAA Compliance Footer Note */}
        <div className="mt-6 text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit TLS Encryption • HIPAA Compliant Patient Portal</span>
          </div>
          <p className="text-[11px] text-slate-400">
            © 2026 HealthConnect Systems Inc. All clinical data protected under privacy laws.
          </p>
        </div>
      </div>
    </div>
  );
};
