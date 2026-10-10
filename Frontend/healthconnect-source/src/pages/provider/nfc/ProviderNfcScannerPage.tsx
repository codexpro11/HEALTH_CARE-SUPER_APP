import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, Smartphone, CheckCircle2, XCircle, AlertCircle, Loader2, Ban } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { nfcApi } from '../../../services/nfcApi';
import { currentCredential, NfcAccessDenied } from '../../../lib/nfcDemo';

export const ProviderNfcScannerPage: React.FC = () => {
  const navigate = useNavigate();
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SCANNING' | 'CARD_DETECTED' | 'VERIFYING' | 'AUTHORIZED' | 'DENIED' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState('');

  const [scenario, setScenario] = useState('authorized');
  const [busy, setBusy] = useState(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const active = React.useRef(true);
  const handleSimulateScan = async () => {
    if (busy) return;
    setBusy(true); setErrorMessage(''); setScanStatus('SCANNING');
    const pause = () => new Promise(resolve => setTimeout(resolve, 250));
    try {
      await pause(); if (!active.current) return; setScanStatus('CARD_DETECTED');
      await pause(); if (!active.current) return; setScanStatus('VERIFYING');
      const card = currentCredential();
      const response = await nfcApi.requestAccess({
        nfcPayload: scenario === 'unknown-card' ? 'HC-NFC:unknown' : card.id,
        providerId: 'provider-1',
        hospitalId: scenario === 'wrong-hospital' ? 'hospital-wellness' : 'hospital-central',
        membershipActive: scenario !== 'unlinked-provider',
      });
      if (!active.current) return;
      setScanStatus('AUTHORIZED');
      navigate('/provider/nfc/summary/' + response.patientId);
    } catch (failure) {
      if (!active.current) return;
      setErrorMessage(failure instanceof Error ? failure.message : 'Unable to scan the demo card.');
      setScanStatus(failure instanceof NfcAccessDenied ? 'DENIED' : 'ERROR');
    } finally { if (active.current) setBusy(false); }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          NFC Patient Scanner
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Simulate scanning the card for this account's patient persona
        </p>
      </div>

      <Card className="w-full max-w-sm p-8 flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
        {scanStatus === 'IDLE' && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-teal-50 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Scan className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">Ready to scan</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hold card near the NFC reader</p>
            </div>
          </div>
        )}

        {scanStatus === 'SCANNING' && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
              <Smartphone className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-indigo-900 dark:text-indigo-100 text-lg">Scanning...</p>
              <p className="text-sm text-indigo-700/70 dark:text-indigo-400/70">Keep the card steady</p>
            </div>
          </div>
        )}

        {scanStatus === 'CARD_DETECTED' && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-100 text-lg">Card Detected</p>
              <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">Reading secure payload...</p>
            </div>
          </div>
        )}

        {scanStatus === 'VERIFYING' && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Loader2 className="w-10 h-10 animate-spin" />
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-lg">Verifying Access</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Checking demo card, facility and patient consent...</p>
            </div>
          </div>
        )}

        {scanStatus === 'AUTHORIZED' && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-100 text-lg">Authorized</p>
              <p className="text-sm text-emerald-700/70 dark:text-emerald-400/70">Redirecting to patient summary...</p>
            </div>
          </div>
        )}

        {scanStatus === 'DENIED' && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Ban className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-100 text-lg">Access denied</p>
              <p className="text-sm text-rose-700/70 dark:text-rose-400/70">
                {errorMessage || "Your account is not authorized to access this patient's records."}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setScanStatus('IDLE')}>
              Try Again
            </Button>
          </div>
        )}

        {scanStatus === 'ERROR' && (
          <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-100 text-lg">Scanner Error</p>
              <p className="text-sm text-rose-700/70 dark:text-rose-400/70">{errorMessage || 'An unknown error occurred.'}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setScanStatus('IDLE')}>
              Try Again
            </Button>
          </div>
        )}
      </Card>

      <div className="flex flex-col items-center gap-4">
        <label className="text-sm font-bold">Demo reader scenario
          <select value={scenario} disabled={busy} onChange={event => setScenario(event.target.value)} className="block mt-2 p-2 border rounded-xl bg-white dark:bg-slate-900">
            <option value="authorized">Authorized hospital</option><option value="wrong-hospital">Wrong hospital</option>
            <option value="unlinked-provider">Provider without hospital association</option><option value="unknown-card">Unknown or replaced card</option>
          </select>
        </label>
        <Button 
          variant="primary" 
          size="lg" 
          className="w-full sm:w-auto min-w-[200px] justify-center"
          onClick={handleSimulateScan}
          disabled={scanStatus !== 'IDLE' && scanStatus !== 'ERROR' && scanStatus !== 'DENIED'}
        >
          [ Start NFC Scan ]
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/provider/nfc/emergency')}>
          Emergency Override Access
        </Button>
      </div>
    </div>
  );
};
