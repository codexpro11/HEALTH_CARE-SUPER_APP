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
import { selectHospitals } from '../../lib/healthcareRules';
import { isDemoMode } from '../../lib/demo';

export const HospitalListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [icuOnly, setIcuOnly] = useState(false);
  const [distance, setDistance] = useState('ALL');
  const [sort, setSort] = useState('DISTANCE');

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => hospitalApi.getHospitals(),
  });

  const hospitals = selectHospitals(response?.data || [], { search, emergencyOnly, icuOnly, sort, maxDistance: distance === 'ALL' ? undefined : Number(distance) });

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
          Find hospitals by specialty, distance, emergency services and listed ICU availability.
        </p>
      </div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{isDemoMode ? 'Sample hospital and bed data; no live capacity feed or bed reservation.' : 'Listed capacity may change.'} Contact the facility to confirm availability before travel.</p>

      {/* Real-time Metropolitan Bed Telemetry Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Matching Hospitals
          </span>
          <span className="text-xl font-black text-slate-900">{hospitals.length} Centers</span>
        </div>

        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-rose-700 block">
            Listed Emergency Beds
          </span>
          <span className="text-xl font-black text-rose-700">{totalEmergencyAvailable} Beds</span>
        </div>

        <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-teal-700 block">Listed ICU Beds</span>
          <span className="text-xl font-black text-teal-800">{totalIcuAvailable} Beds</span>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            Availability source
          </span>
          <span className="text-sm font-bold text-slate-800">{isDemoMode ? 'Demo sample' : 'Provider listing'}</span>
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
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <label className="flex gap-2 items-center"><input type="checkbox" checked={icuOnly} onChange={event => setIcuOnly(event.target.checked)} /> Listed ICU beds available</label>
        <label>Distance <select className="rounded-lg border p-2 bg-white dark:bg-slate-900" value={distance} onChange={event => setDistance(event.target.value)}><option value="ALL">Any distance</option><option value="5">Within 5 km</option><option value="10">Within 10 km</option><option value="25">Within 25 km</option></select></label>
        <label>Sort <select className="rounded-lg border p-2 bg-white dark:bg-slate-900" value={sort} onChange={event => setSort(event.target.value)}><option value="DISTANCE">Nearest first</option><option value="RATING">Highest rating</option></select></label>
        <button className="underline text-teal-700" onClick={() => { setSearch(''); setEmergencyOnly(false); setIcuOnly(false); setDistance('ALL'); setSort('DISTANCE'); }}>Reset filters</button>
      </div>
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
