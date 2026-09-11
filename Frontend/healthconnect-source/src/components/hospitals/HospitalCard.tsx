import React from 'react';
import { Building2, MapPin, Phone, Siren, Bed, Star, Navigation } from 'lucide-react';
import { Hospital } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface HospitalCardProps {
  hospital: Hospital;
  onCallEmergency?: (phone: string) => void;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({ hospital, onCallEmergency }) => {
  return (
    <Card className="hover:border-slate-300 transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              <MapPin className="w-3 h-3 text-teal-600" />
              {hospital.distanceKm} km away
            </span>
            {hospital.hasEmergency && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                <Siren className="w-3 h-3 text-rose-600" />
                Emergency 24/7
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">{hospital.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{hospital.address}</p>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded shrink-0">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
          <span>{hospital.rating}</span>
        </div>
      </div>

      {/* Real-time Bed Availability Grid */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
        <div className="p-1.5 bg-white rounded-lg border border-slate-200/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">ICU Beds</span>
          <span className="text-sm font-extrabold text-slate-900">
            {hospital.bedAvailability.icuAvailable}
          </span>
          <span className="text-[10px] text-slate-400">/{hospital.bedAvailability.icuTotal}</span>
        </div>

        <div className="p-1.5 bg-white rounded-lg border border-slate-200/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Emergency</span>
          <span className="text-sm font-extrabold text-rose-600">
            {hospital.bedAvailability.emergencyAvailable}
          </span>
          <span className="text-[10px] text-slate-400">/{hospital.bedAvailability.emergencyTotal}</span>
        </div>

        <div className="p-1.5 bg-white rounded-lg border border-slate-200/70">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">General</span>
          <span className="text-sm font-extrabold text-slate-900">
            {hospital.bedAvailability.generalAvailable}
          </span>
          <span className="text-[10px] text-slate-400">/{hospital.bedAvailability.generalTotal}</span>
        </div>
      </div>

      {/* Specializations */}
      <div className="flex flex-wrap items-center gap-1.5">
        {hospital.specializations.map((spec) => (
          <Badge key={spec} variant="slate" size="sm">
            {spec}
          </Badge>
        ))}
      </div>

      {/* Footer Contact and Directions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <a
            href={`tel:${hospital.emergencyPhone}`}
            onClick={(e) => {
              if (onCallEmergency) {
                e.preventDefault();
                onCallEmergency(hospital.emergencyPhone);
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-rose-600" />
            <span>Emergency: {hospital.emergencyPhone}</span>
          </a>
        </div>

        <a
          href={hospital.directionsUrl || `https://maps.google.com/?q=${encodeURIComponent(hospital.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 p-1.5 hover:bg-teal-50 rounded-lg transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </a>
      </div>
    </Card>
  );
};
