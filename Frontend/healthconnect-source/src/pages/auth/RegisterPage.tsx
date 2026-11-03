import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Calendar, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { localDate } from '../../lib/frontend';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY'>('PREFER_NOT_TO_SAY');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!fullName || !email || !phoneNumber || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (!dateOfBirth || dateOfBirth > localDate()) {
      setFormError('Enter a valid date of birth.');
      return;
    }
    if (phoneNumber.replace(/\D/g, '').length < 7) {
      setFormError('Enter a valid phone number.');
      return;
    }
    if (!termsAccepted) {
      setFormError('You must accept the terms and privacy notice to continue.');
      return;
    }

    const success = await register({
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
      role: 'PATIENT',
      termsAccepted,
    });

    if (success) {
      navigate('/app/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create your account</h2>
        <p className="text-xs text-slate-500 mt-1">
          Join HealthConnect to manage healthcare, telemedicine, and records
        </p>
      </div>

      {(formError || error) && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{formError || error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Full Legal Name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Sarah Jenkins"
          leftIcon={<User className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (555) 000-0000"
            leftIcon={<Phone className="w-4 h-4" />}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Date of Birth"
            max={localDate()}
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
            required
          />

          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value as any)}
            options={[
              { value: 'FEMALE', label: 'Female' },
              { value: 'MALE', label: 'Male' },
              { value: 'OTHER', label: 'Other' },
              { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
            ]}
          />

          <p className="text-xs text-slate-500">New accounts start as patients. Provider access is assigned separately.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
          />
          <span>
            I agree to the{' '}
            <Link to="/demo-notice" className="text-teal-600 font-semibold underline">demo use notice</Link>{' '}
            and acknowledge the{' '}
            <Link to="/demo-notice" className="text-teal-600 font-semibold underline">demo privacy notice</Link>.
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-2.5 font-bold shadow-sm"
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Complete Registration
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700">
          Sign in
        </Link>
      </div>
    </div>
  );
};
