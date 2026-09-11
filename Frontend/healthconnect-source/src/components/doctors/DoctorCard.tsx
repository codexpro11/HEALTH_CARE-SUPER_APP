import React from 'react';
import { Star, MapPin, Calendar, Clock, Video, Building2 } from 'lucide-react';
import { Doctor } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface DoctorCardProps {
  doctor: Doctor;
  onBookAppointment?: (doctor: Doctor) => void;
  onViewProfile?: (doctor: Doctor) => void;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  doctor,
  onBookAppointment,
  onViewProfile,
}) => {
  return (
    <Card className="hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between h-full group">
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-4">
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-xs shrink-0 transition-colors"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-md transition-colors">
                {doctor.specialization}
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-md transition-colors">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 dark:text-amber-400" />
                <span>{doctor.rating}</span>
                <span className="text-slate-400 dark:text-slate-500 font-normal">({doctor.reviewCount})</span>
              </div>
            </div>

            <h3
              onClick={() => onViewProfile?.(doctor)}
              className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 truncate hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              {doctor.name}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">{doctor.qualification}</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 transition-colors">
              {doctor.experienceYears} years experience
            </p>
          </div>
        </div>

        {/* Location & Hospital */}
        <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 transition-colors">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-colors" />
            <span className="truncate">{doctor.hospitalAffiliation}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-colors" />
            <span className="truncate">{doctor.location}</span>
          </div>
        </div>

        {/* Consultation Types & Next Slot */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {doctor.consultationTypes.map((type) => (
            <Badge key={type} variant="slate" size="sm">
              {type === 'VIDEO' ? (
                <span className="flex items-center gap-1">
                  <Video className="w-3 h-3 text-teal-600 dark:text-teal-400 transition-colors" /> Video
                </span>
              ) : (
                'In-Person'
              )}
            </Badge>
          ))}
          <div className="ml-auto flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded font-medium transition-colors">
            <Clock className="w-3 h-3" />
            <span>{doctor.nextAvailableSlot}</span>
          </div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 transition-colors">
        <div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block transition-colors">Fee</span>
          <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 transition-colors">
            ${doctor.consultationFee}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile?.(doctor)}
          >
            Profile
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
            onClick={() => onBookAppointment?.(doctor)}
          >
            Book
          </Button>
        </div>
      </div>
    </Card>
  );
};
