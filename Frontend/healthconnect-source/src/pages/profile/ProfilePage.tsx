import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  HeartPulse,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || 'Sarah Jenkins');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '+1 (555) 342-8819');
  const [bloodGroup, setBloodGroup] = useState(user?.bloodGroup || 'O+');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '1992-04-18');
  const [allergies, setAllergies] = useState(user?.allergies?.join(', ') || 'Penicillin, Shellfish');
  const [chronicConditions, setChronicConditions] = useState(
    user?.chronicConditions?.join(', ') || 'Mild Asthma'
  );

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || 'David Jenkins');
  const [emergencyPhone, setEmergencyPhone] = useState(
    user?.emergencyContact?.phone || '+1 (555) 901-4432'
  );
  const [emergencyRelation, setEmergencyRelation] = useState(
    user?.emergencyContact?.relationship || 'Spouse'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      fullName,
      phoneNumber,
      bloodGroup,
      dateOfBirth,
      allergies: allergies.split(',').map((s) => s.trim()).filter(Boolean),
      chronicConditions: chronicConditions.split(',').map((s) => s.trim()).filter(Boolean),
      emergencyContact: {
        name: emergencyName,
        phone: emergencyPhone,
        relationship: emergencyRelation,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Patient Clinical Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review legal identity, baseline vitals, critical allergies, and verified emergency contacts.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Profile changes successfully synchronized with your clinical record.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Details Card */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-teal-600" />
            <span>Identity & Demographics</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              value={user?.email || 'patient@hc.io'}
              disabled
              helperText="Managed by authentication provider"
            />
            <Input
              label="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Clinical Baseline & Vitals */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Clinical Vitals & Medical Baseline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Blood Group"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              options={[
                { value: 'O+', label: 'O+' },
                { value: 'O-', label: 'O-' },
                { value: 'A+', label: 'A+' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B-', label: 'B-' },
                { value: 'AB+', label: 'AB+' },
                { value: 'AB-', label: 'AB-' },
              ]}
            />
            <div className="sm:col-span-2">
              <Input
                label="Known Drug / Food Allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Comma separated: Penicillin, Peanuts..."
                helperText="Critical for doctor contraindication checks"
              />
            </div>
          </div>

          <div>
            <Input
              label="Chronic Conditions & Diagnostics"
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              placeholder="e.g. Hypertension, Asthma, Type 2 Diabetes"
            />
          </div>
        </Card>

        {/* Emergency Contacts */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>Designated Emergency Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Contact Full Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              required
            />
            <Input
              label="Contact Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              required
            />
            <Input
              label="Relationship"
              value={emergencyRelation}
              onChange={(e) => setEmergencyRelation(e.target.value)}
              required
            />
          </div>
        </Card>

        {/* Insurance Information */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Health Insurance Coverage</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Provider</span>
              <span className="font-extrabold text-slate-900 text-sm">BlueCross BlueShield</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Policy ID</span>
              <span className="font-extrabold text-slate-900 text-sm">BCBS-9021-998</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase font-bold text-[10px]">Coverage</span>
              <span className="font-extrabold text-emerald-700 text-sm">Active (Co-pay 100%)</span>
            </div>
          </div>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
