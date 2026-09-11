import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, MapPin, Siren, Bed, Phone, Star } from 'lucide-react';
import { hospitalApi } from '../../api/hospitalApi';
import { Hospital } from '../../types';
import { HospitalCard } from '../../components/hospitals/HospitalCard';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const HospitalListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['hospitals', { search, emergencyOnly }],
    queryFn: () =>
      hospitalApi.getHospitals({
        search,
        emergencyOnly: emergencyOnly ? true : undefined,
      }),
  });

  const hospitals = response?.data || [];

  // Aggregated real-time bed statistics
  const totalIcuAvailable = hospitals.reduce((acc, h) => acc + h.bedAvailability.icuAvailable, 0);
  const totalEmergencyAvailable = hospitals.reduce(
    (acc, h) => acc + h.bedAvailability.emergencyAvailable,
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Hospitals & Trauma Centers
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Real-time municipal emergency bed tracking, ICU availability telemetry, and accredited medical centers.
        </p>
      </div>

      {/* Real-time Metropolitan Bed Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Connected Hospitals
          </span>
          <span className="text-xl font-black text-slate-900">{hospitals.length} Centers</span>
        </div>

        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">
            Emergency Beds Open
          </span>
          <span className="text-xl font-black text-rose-700">{totalEmergencyAvailable} Beds</span>
        </div>

        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-teal-700 block">ICU Beds Open</span>
          <span className="text-xl font-black text-teal-800">{totalIcuAvailable} Beds</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Avg Ambulance ETA
          </span>
          <span className="text-xl font-black text-slate-800">6.4 Minutes</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="w-full sm:w-96">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search hospitals by name, specialty, or area..."
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer self-start sm:self-center select-none">
          <input
            type="checkbox"
            checked={emergencyOnly}
            onChange={(e) => setEmergencyOnly(e.target.checked)}
            className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
          />
          <span className="flex items-center gap-1.5 text-rose-700">
            <Siren className="w-3.5 h-3.5" /> Show 24/7 Emergency Facilities Only
          </span>
        </label>
      </div>

      {/* Hospital Cards Grid */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : isError ? (
        <ErrorState message="Failed to load hospital network data." onRetry={() => refetch()} />
      ) : hospitals.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No Hospitals Found"
          description="No healthcare centers matched your search query."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onCallEmergency={(phone) => (window.location.href = `tel:${phone}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
