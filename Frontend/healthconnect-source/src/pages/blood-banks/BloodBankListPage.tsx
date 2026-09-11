import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Droplet, MapPin, Phone, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { bloodBankApi } from '../../api/bloodBankApi';
import { BloodBankCard } from '../../components/blood-banks/BloodBankCard';
import { SearchBar } from '../../components/common/SearchBar';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const BloodBankListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['blood-banks', { search, selectedBloodGroup }],
    queryFn: () =>
      bloodBankApi.getBloodBanks({
        searchQuery: search,
        bloodGroup: selectedBloodGroup === 'ALL' ? undefined : selectedBloodGroup,
      }),
  });

  const bloodBanks = response?.data || [];

  const bloodGroups = ['ALL', 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Blood Banks & Units Inventory
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Live blood bank inventory telemetry, donor centers, and emergency plasma reserve matching.
        </p>
      </div>

      {/* Blood Group Quick Filter Chips */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Filter by Required Blood Group
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {bloodGroups.map((group) => (
            <button
              key={group}
              onClick={() => setSelectedBloodGroup(group)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedBloodGroup === group
                  ? 'bg-rose-600 text-white shadow-xs scale-105'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {group === 'ALL' ? 'All Groups' : group}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search blood bank by facility or area..."
        />
      </div>

      {/* Blood Banks Grid */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : isError ? (
        <ErrorState message="Could not retrieve blood bank inventory." onRetry={() => refetch()} />
      ) : bloodBanks.length === 0 ? (
        <EmptyState
          icon={Droplet}
          title="No Blood Banks Found"
          description="There are no blood donor facilities matching your search filter."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {bloodBanks.map((bb) => (
            <BloodBankCard
              key={bb.id}
              bloodBank={bb}
              selectedGroup={selectedBloodGroup === 'ALL' ? undefined : selectedBloodGroup}
              onCall={(phone) => (window.location.href = `tel:${phone}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
