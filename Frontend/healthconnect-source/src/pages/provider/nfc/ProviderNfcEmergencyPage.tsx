import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Siren, AlertTriangle } from 'lucide-react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { nfcApi } from '../../../services/nfcApi';

export const ProviderNfcEmergencyPage: React.FC = () => {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const handleOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsRequesting(true);
    
    try {
      // Simulate backend authorization
      const response = await nfcApi.requestEmergencyAccess({
        nfcPayload: 'EMERGENCY-OVERRIDE',
        providerId: 'provider-1',
        reason
      });
      
      setIsRequesting(false);
      navigate(`/provider/nfc/summary/${response.patientId}`);
    } catch (error) {
      setIsRequesting(false);
      alert('Emergency access request failed.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-2xl mx-auto space-y-8">
      <div className="w-full">
        <button
          onClick={() => navigate('/provider/nfc-scanner')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scanner</span>
        </button>
      </div>

      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400 mx-auto">
          <Siren className="w-10 h-10 animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Emergency Override
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Emergency access grants immediate read-only permission to critical patient vitals, allergies, and emergency contacts without requiring explicit consent.
        </p>
      </div>

      <Card className="w-full p-6 border-rose-200 dark:border-rose-900/50">
        <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-300 rounded-xl mb-6">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="font-bold">This action is strictly audited.</p>
            <p className="opacity-90 leading-relaxed">
              All emergency override requests are logged, monitored, and subject to post-incident review by the hospital administration.
            </p>
          </div>
        </div>

        <form onSubmit={handleOverride} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Reason for Emergency Access <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="reason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Unconscious patient brought in via ambulance, requires immediate medical history for treatment."
              className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder:text-slate-400 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:focus:ring-rose-500/50 focus:border-rose-500 min-h-[120px] resize-none transition-colors"
            />
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full justify-center bg-rose-600 hover:bg-rose-700 border-transparent text-white"
            disabled={!reason.trim() || isRequesting}
          >
            {isRequesting ? 'Authorizing...' : 'Authorize Emergency Access'}
          </Button>
        </form>
      </Card>
    </div>
  );
};
