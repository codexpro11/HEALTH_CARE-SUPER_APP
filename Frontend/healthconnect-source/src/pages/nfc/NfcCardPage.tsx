import React, { useState } from 'react';
import { CreditCard, Power, Ban, RefreshCcw, Wifi, ShieldCheck, Activity } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

export const NfcCardPage: React.FC = () => {
  const [nfcStatus, setNfcStatus] = useState<'ACTIVE' | 'REVOKED' | 'EXPIRED'>('ACTIVE');
  const [isSimulatingWrite, setIsSimulatingWrite] = useState(false);
  const cardId = 'HC-8472-••••-9123';
  const issueDate = '2025-10-15';
  const lastUsed = '2026-09-08 14:30';

  const handleSimulateWrite = () => {
    setIsSimulatingWrite(true);
    setTimeout(() => {
      setIsSimulatingWrite(false);
      alert('NFC Card provisioned successfully (Simulated)');
    }, 1500);
  };

  const handleRevoke = () => {
    if (confirm('Are you sure you want to revoke this NFC card? It will immediately stop working.')) {
      setNfcStatus('REVOKED');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          My HealthConnect NFC Card
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your NFC card contains a secure identifier that helps authorized healthcare providers request access to your HealthConnect records.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Virtual Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-700 p-6 sm:p-8 text-white shadow-xl min-h-[220px] flex flex-col justify-between">
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-teal-900 opacity-30 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-teal-100" />
                <span className="font-black tracking-tight text-lg">HealthConnect</span>
              </div>
              <Wifi className={`w-8 h-8 ${nfcStatus === 'ACTIVE' ? 'text-white' : 'text-slate-300 opacity-50'}`} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="space-y-1">
                <p className="text-teal-100 text-[10px] uppercase tracking-widest font-bold">Secure Patient Identifier</p>
                <p className="font-mono text-xl sm:text-2xl tracking-widest font-medium drop-shadow-sm">{cardId}</p>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-teal-100 text-[10px] uppercase tracking-widest font-bold">Status</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {nfcStatus === 'ACTIVE' && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                        <span className="font-bold text-sm tracking-wide text-emerald-50">ACTIVE</span>
                      </>
                    )}
                    {nfcStatus === 'REVOKED' && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="font-bold text-sm tracking-wide text-rose-100">REVOKED</span>
                      </>
                    )}
                    {nfcStatus === 'EXPIRED' && (
                      <>
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                        <span className="font-bold text-sm tracking-wide text-amber-100">EXPIRED</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-teal-100 text-[10px] uppercase tracking-widest font-bold">Issued</p>
                  <p className="font-medium text-sm text-teal-50">{issueDate}</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Card Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Last Used</span>
                <span className="text-slate-900 dark:text-slate-100 font-semibold">{lastUsed}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Card Identifier</span>
                <span className="text-slate-900 dark:text-slate-100 font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{cardId}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Security</span>
                <span className="text-emerald-600 dark:text-emerald-500 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Securely linked
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Card Actions</h3>
            
            <div className="space-y-3">
              {nfcStatus === 'REVOKED' && (
                <Button 
                  variant="primary" 
                  className="w-full justify-center" 
                  leftIcon={<CreditCard className="w-4 h-4" />}
                  onClick={() => setNfcStatus('ACTIVE')}
                >
                  Activate New Card
                </Button>
              )}
              
              {nfcStatus === 'ACTIVE' && (
                <Button 
                  variant="secondary" 
                  className="w-full justify-center text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-200 dark:hover:border-rose-800/50" 
                  leftIcon={<Ban className="w-4 h-4" />}
                  onClick={handleRevoke}
                >
                  Revoke Card
                </Button>
              )}

              <Button 
                variant="outline" 
                className="w-full justify-center" 
                leftIcon={<RefreshCcw className="w-4 h-4" />}
              >
                Request Replacement
              </Button>
            </div>
          </Card>

          <Card className="p-4 sm:p-5 space-y-4 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30">
            <div className="flex items-center gap-2">
              <Power className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300">Developer / Testing</h3>
            </div>
            <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 leading-relaxed">
              Use this tool to simulate writing the secure patient identifier to a physical NFC card using WebNFC (where supported).
            </p>
            <Button 
              variant="primary"
              className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white border-transparent"
              leftIcon={<Wifi className="w-4 h-4" />}
              onClick={handleSimulateWrite}
              disabled={isSimulatingWrite}
            >
              {isSimulatingWrite ? 'Writing to NFC...' : 'Simulate Write to NFC Card'}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
