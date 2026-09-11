import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Star,
  MapPin,
  Calendar,
  Clock,
  Video,
  Building2,
  GraduationCap,
  Award,
  Globe,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';

export const DoctorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorApi.getDoctorById(id || ''),
    enabled: !!id,
  });

  const doctor = response?.data;

  if (isLoading) {
    return <LoadingSkeleton type="doctor" count={1} />;
  }

  if (isError || !doctor) {
    return (
      <ErrorState
        title="Doctor Profile Not Found"
        message="We could not locate this physician's records."
        onRetry={() => navigate('/app/doctors')}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/app/doctors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Doctors</span>
      </button>

      {/* Main Profile Header */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-slate-100 dark:ring-slate-800 shadow-md shrink-0 transition-colors"
            />
            <div className="space-y-1">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-0.5 rounded-full transition-colors">
                {doctor.specialization}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 transition-colors">{doctor.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">
                {doctor.qualification} • {doctor.experienceYears} Years Clinical Experience
              </p>
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-0.5 rounded-md transition-colors">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 dark:text-amber-400" />
                  <span>{doctor.rating}</span>
                  <span className="text-slate-400 dark:text-slate-500 font-normal">({doctor.reviewCount} verified reviews)</span>
                </div>
                <span className="text-xs text-emerald-700 dark:text-emerald-500 font-semibold flex items-center gap-1 transition-colors">
                  <ShieldCheck className="w-4 h-4" /> Board Certified
                </span>
              </div>
            </div>
          </div>

          <div className="w-full sm:w-auto p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-center sm:text-right space-y-1 transition-colors">
            <span className="text-[11px] uppercase font-bold text-slate-400 dark:text-slate-500 block transition-colors">Consultation Fee</span>
            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 transition-colors">${doctor.consultationFee}</span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 transition-colors">Includes 24-hr follow-up chat</p>
          </div>
        </div>

        {/* Bio & Clinical Summary */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-2 transition-colors">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider transition-colors">About Doctor</h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">{doctor.about || doctor.bio}</p>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6 transition-colors">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 transition-colors">
              <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Hospital Affiliation</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 transition-colors">{doctor.hospitalAffiliation}</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 transition-colors">
              <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Location</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 transition-colors">{doctor.location}</p>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1 transition-colors">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 transition-colors">
              <Globe className="w-4 h-4 text-teal-600 dark:text-teal-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Languages Spoken</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-slate-100 transition-colors">{doctor.languages.join(', ')}</p>
          </div>
        </div>

        {/* Available Consultation Formats & Next Slot */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">Formats:</span>
            {doctor.consultationTypes.map((t) => (
              <Badge key={t} variant="teal" size="sm">
                {t === 'VIDEO' ? 'Telehealth Video Call' : 'In-Person Consultation'}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-slate-400 dark:text-slate-500 block transition-colors">Next Available Slot</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-500 transition-colors">{doctor.nextAvailableSlot}</span>
            </div>
            <Button
              variant="primary"
              onClick={() => navigate('/app/doctors')}
              leftIcon={<Calendar className="w-4 h-4" />}
            >
              Book Appointment
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
