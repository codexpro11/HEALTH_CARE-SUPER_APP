import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Activity, AlertTriangle, Phone, FileText, Pill, ShieldAlert } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';

export const ProviderNfcSummaryPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/provider/nfc-scanner')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>New Scan</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-800/50">
          <ShieldCheck className="w-4 h-4" />
          <span>Authorized Access</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3 space-y-6">
          <Card className="p-6 text-center space-y-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-teal-50 dark:from-teal-900/20 to-transparent"></div>
            <img
              src="https://ui-avatars.com/api/?name=Sarah+Johnson&background=0f172a&color=fff&size=128"
              alt="Patient"
              className="w-24 h-24 rounded-full mx-auto ring-4 ring-white dark:ring-slate-900 shadow-md relative z-10"
            />
            <div className="relative z-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Sarah Johnson</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">32 Yrs • Female</p>
              <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-2">ID: {id}</p>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-500" /> Critical Vitals
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block mb-1">Blood Group</span>
                <span className="text-xl font-black text-rose-700 dark:text-rose-300">O+</span>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block mb-1">Allergies</span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-300">Penicillin</span>
              </div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Emergency Contact</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Mark Johnson (Husband)</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">+1 555-0198</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="w-full md:w-2/3 space-y-6">
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Provider</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Authenticated</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Hospital</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Verified</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">NFC Credential</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Valid</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Consent</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Active</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Granted Access Scopes
              </h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Basic Profile</span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Medical Summary</span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <Pill className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Prescriptions</span>
                </div>
              </div>
              
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Diagnostic Reports</span>
                </div>
              </div>

              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 hover:border-teal-300 dark:hover:border-teal-700 transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">Insurance</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
