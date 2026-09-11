import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Filter,
  Calendar,
  Clock,
  Video,
  Building2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { doctorApi } from '../../api/doctorApi';
import { appointmentApi } from '../../api/appointmentApi';
import { Doctor } from '../../types';
import { DoctorCard } from '../../components/doctors/DoctorCard';
import { SearchBar } from '../../components/common/SearchBar';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const DoctorListPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('ALL');
  const [consultationType, setConsultationType] = useState('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'fee'>('rating');

  // Booking Modal State
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('2026-09-12');
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingType, setBookingType] = useState<'VIDEO' | 'IN_PERSON'>('VIDEO');
  const [bookingReason, setBookingReason] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['doctors', { search, specialization, consultationType, sortBy }],
    queryFn: () =>
      doctorApi.getDoctors({
        search,
        specialization: specialization === 'ALL' ? undefined : specialization,
        consultationType: consultationType === 'ALL' ? undefined : consultationType,
      }),
  });

  const doctors = (response?.data || []).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
    if (sortBy === 'fee') return a.consultationFee - b.consultationFee;
    return 0;
  });

  const bookMutation = useMutation({
    mutationFn: (variables: {
      doctorId: string;
      appointmentDate: string;
      appointmentTime: string;
      consultationType: 'VIDEO' | 'IN_PERSON';
      reasonForVisit: string;
    }) => appointmentApi.bookAppointment(variables),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setSelectedDoctor(null);
        navigate('/app/appointments');
      }, 1500);
    },
  });

  const handleOpenBooking = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setBookingSlot(doctor.availableSlots?.[0] || doctor.timeSlots?.[0]?.time || '10:00 AM');
    setBookingType(doctor.consultationTypes.includes('VIDEO') ? 'VIDEO' : 'IN_PERSON');
    setBookingReason('');
    setBookingSuccess(false);
  };

  const handleConfirmBooking = () => {
    if (!selectedDoctor || !bookingSlot) return;
    bookMutation.mutate({
      doctorId: selectedDoctor.id,
      appointmentDate: bookingDate,
      appointmentTime: bookingSlot,
      consultationType: bookingType,
      reasonForVisit: bookingReason || 'Routine clinical review',
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
          Find Doctors & Specialists
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Search vetted board-certified physicians, review qualifications, and book video or clinic appointments.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by doctor name, specialization, or clinic..."
            />
          </div>

          <div className="md:col-span-3">
            <Select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Specializations' },
                { value: 'Cardiology', label: 'Cardiology' },
                { value: 'Dermatology', label: 'Dermatology' },
                { value: 'Pediatrics', label: 'Pediatrics' },
                { value: 'Neurology', label: 'Neurology' },
                { value: 'Orthopedic Surgery', label: 'Orthopedic Surgery' },
                { value: 'General Medicine', label: 'General Medicine' },
              ]}
            />
          </div>

          <div className="md:col-span-2">
            <Select
              value={consultationType}
              onChange={(e) => setConsultationType(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Types' },
                { value: 'VIDEO', label: 'Video Call' },
                { value: 'IN_PERSON', label: 'In-Clinic' },
              ]}
            />
          </div>

          <div className="md:col-span-2">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              options={[
                { value: 'rating', label: 'Top Rated' },
                { value: 'experience', label: 'Most Experience' },
                { value: 'fee', label: 'Lowest Fee' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 transition-colors">
            Available Specialists ({doctors.length})
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 transition-colors">Instant online booking</span>
        </div>

        {isLoading ? (
          <LoadingSkeleton type="doctor" count={6} />
        ) : isError ? (
          <ErrorState message="Failed to load doctors catalog." onRetry={() => refetch()} />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Doctors Found"
            description="We could not find any healthcare providers matching your filter criteria. Try resetting filters."
            actionLabel="Reset Filters"
            onAction={() => {
              setSearch('');
              setSpecialization('ALL');
              setConsultationType('ALL');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                onBookAppointment={handleOpenBooking}
                onViewProfile={(doc) => navigate(`/app/doctors/${doc.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <Modal
          isOpen={!!selectedDoctor}
          onClose={() => setSelectedDoctor(null)}
          title={`Book with ${selectedDoctor.name}`}
          subtitle={`${selectedDoctor.specialization} • Fee: $${selectedDoctor.consultationFee}`}
          maxWidth="md"
        >
          {bookingSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-500 mx-auto animate-bounce transition-colors" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">Appointment Confirmed!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto transition-colors">
                Your consultation has been reserved. Redirecting to your appointments portal...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Consultation Format Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 transition-colors">
                  Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingType('VIDEO')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                      bookingType === 'VIDEO'
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 ring-1 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Video className="w-4 h-4 text-teal-600 dark:text-teal-500" />
                    <span>Telehealth Video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingType('IN_PERSON')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold transition-all ${
                      bookingType === 'IN_PERSON'
                        ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 ring-1 ring-teal-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-500" />
                    <span>In-Clinic Visit</span>
                  </button>
                </div>
              </div>

              {/* Date & Slot selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Select Date"
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />

                <Select
                  label="Available Time Slot"
                  value={bookingSlot}
                  onChange={(e) => setBookingSlot(e.target.value)}
                  options={selectedDoctor.availableSlots.map((slot) => ({
                    value: slot,
                    label: slot,
                  }))}
                />
              </div>

              {/* Reason input */}
              <Input
                label="Reason for Visit / Symptoms"
                placeholder="e.g. Mild shortness of breath, periodic palpitations..."
                value={bookingReason}
                onChange={(e) => setBookingReason(e.target.value)}
              />

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-400 transition-colors">
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">${selectedDoctor.consultationFee}.00</span>
                </div>
                <div className="flex justify-between text-teal-700 dark:text-teal-400 font-semibold transition-colors">
                  <span>HIPAA & Digital Consent:</span>
                  <span>Covered</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDoctor(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  isLoading={bookMutation.isPending}
                  onClick={handleConfirmBooking}
                >
                  Confirm & Schedule
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
