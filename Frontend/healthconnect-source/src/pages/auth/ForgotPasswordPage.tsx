import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { sendPasswordResetEmail } from 'firebase/auth';
import { getFirebaseAuth } from '../../firebase/config';
import { isDemoMode } from '../../lib/demo';
import { errorMessage } from '../../lib/request';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);
    try {
      if (!isDemoMode) await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      setSubmitted(true);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reset your password</h2>
        <p className="text-xs text-slate-500 mt-1">
          Enter your email to request a password reset link
        </p>
      </div>

      {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
      {submitted ? (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-sm text-emerald-900">{isDemoMode ? 'Demo reset preview' : 'Reset request received'}</h3>
          <p className="text-xs text-emerald-700 leading-relaxed">
            {isDemoMode ? 'This is a preview. No email was sent.' : <>If an account is associated with <strong>{email}</strong>, you will receive a password reset link.</>}
          </p>
          <Link to="/login" className="inline-block mt-2">
            <Button variant="primary" size="sm">
              Return to Login
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Registered Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@domain.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 font-bold shadow-sm"
            isLoading={isLoading}
          >
            Send Reset Instructions
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};
