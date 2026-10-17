import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Microscope,
  Clock,
  Home,
  AlertCircle,
  CheckCircle2,
  Calendar,
  MapPin,
  Check,
} from 'lucide-react';
import { dateAfterDays, localDate, validateBooking } from '../../lib/frontend';
import { errorMessage } from '../../lib/request';
import { isDemoMode } from '../../lib/demo';
import { demoCollectionTimes, type DiagnosticBookingRequest } from '../../lib/healthcareRules';
import { DiagnosticBookingHistory } from '../../components/diagnostics/DiagnosticBookingHistory';
import { diagnosticApi } from '../../api/diagnosticApi';
import { DiagnosticTest } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export const DiagnosticListPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedTest, setSelectedTest] = useState<DiagnosticTest | null>(null);
  const [bookingDate, setBookingDate] = useState(() => dateAfterDays(1));
  const [isHomeCollection, setIsHomeCollection] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [view, setView] = useState<'tests' | 'bookings'>('tests');
  const [search, setSearch] = useState('');
  const [centerId, setCenterId] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00 AM');
  const [address, setAddress] = useState('');
  const centersQuery = useQuery({ queryKey: ['diagnostic-centers'], queryFn: () => diagnosticApi.getDiagnosticCenters() });
  const centers = (centersQuery.data?.data ?? []).filter(center => center.availableTests.some(test => test.id === selectedTest?.id));

  const queryClient = useQueryClient();

  const { data: response, isLoading, isError, refetch } = useQuery({
    queryKey: ['diagnostic-tests', selectedCategory, search],
    queryFn: () =>
      diagnosticApi.getTests(selectedCategory === 'ALL' ? undefined : selectedCategory, search),
  });

  const tests = response?.data || [];

  const bookTestMutation = useMutation({
    mutationFn: (data: DiagnosticBookingRequest) => diagnosticApi.createBooking(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diagnostic-bookings'] });
      setBookingSuccess(true);
    },
  });

  const categories = [
    { id: 'ALL', label: 'All Test Panels' },
    { id: 'Cardiology', label: 'Cardiac & Lipid' },
    { id: 'Diabetes & Metabolic', label: 'Diabetes & Metabolic' },
    { id: 'Endocrinology', label: 'Thyroid & Diabetes' },
    { id: 'General Hematology', label: 'Hematology & CBC' },
    { id: 'Radiology & Imaging', label: 'Radiology & Imaging' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
          Clinical Diagnostics & Lab Tests
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Find a test, choose a diagnostic center and collection time, and manage your bookings.
        </p>
      </div>

      <p className="rounded-xl border border-teal-200 bg-teal-50 p-3 text-sm text-teal-900">{isDemoMode ? 'Sample catalog and collection windows. Demo bookings do not contact a laboratory or generate a report.' : 'Collection and report availability require confirmation from the diagnostic provider.'}</p>
      <div className="flex gap-2"><Button variant={view === 'tests' ? 'primary' : 'outline'} onClick={() => setView('tests')}>Find tests</Button><Button variant={view === 'bookings' ? 'primary' : 'outline'} onClick={() => setView('bookings')}>My bookings</Button></div>
      {view === 'bookings' ? <DiagnosticBookingHistory /> : <>
      <Input label="Search tests" value={search} onChange={event => setSearch(event.target.value)} placeholder="Test name or description" />
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tests Grid */}
      {isLoading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : isError ? (
        <ErrorState message="Could not load diagnostic catalog." onRetry={() => refetch()} />
      ) : tests.length === 0 ? (
        <EmptyState
          icon={Microscope}
          title="No Lab Tests Found"
          description="There are currently no diagnostic packages listed in this category."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <Card
              key={test.id}
              className="hover:border-teal-300 dark:hover:border-teal-700 transition-all flex flex-col justify-between h-full"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded uppercase transition-colors">
                    {test.category}
                  </span>
                  {test.isHomeCollectionAvailable && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded transition-colors">
                      <Home className="w-3 h-3" /> Home Collection
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">{test.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed transition-colors">{test.description}</p>

                {/* Turnaround and fasting info */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1.5 text-xs text-slate-600 dark:text-slate-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-500" />
                    <span>Report delivered in: <strong className="dark:text-slate-200">{test.turnaroundTime}</strong></span>
                  </div>
                  {test.fastingRequired && (
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                      <span>{test.fastingHours} hrs overnight fasting required</span>
                    </div>
                  )}
                </div>

                {/* Included parameters preview */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 transition-colors">
                    Includes {test.parametersCount ?? 'multiple'} parameters
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(test.parametersSample ?? []).map((param) => (
                      <span
                        key={param}
                        className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium transition-colors"
                      >
                        {param}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Booking Button */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-semibold transition-colors">Test Fee</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100 transition-colors">${(test.discountedPrice ?? test.price).toFixed(2)}</span>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedTest(test);
                    setIsHomeCollection(test.isHomeCollectionAvailable);
                    setBookingDate(dateAfterDays(1));
                    setBookingError(null);
                    setCenterId(''); setBookingTime('09:00 AM'); setAddress(''); setBookingSuccess(false);
                    bookTestMutation.reset();
                  }}
                >
                  Book Test
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      </>}

      {/* Booking Test Modal */}
      {selectedTest && (
        <Modal
          isOpen={!!selectedTest}
          onClose={() => { if (!bookTestMutation.isPending) setSelectedTest(null); }}
          title={`Schedule Lab Test: ${selectedTest.name}`}
          subtitle={`Turnaround: ${selectedTest.turnaroundTime}  Fee: $${selectedTest.price}`}
          maxWidth="md"
        >
          {bookingSuccess ? (
            <div className="py-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-500 mx-auto animate-bounce transition-colors" />
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 transition-colors">Lab Test Scheduled!</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs mx-auto transition-colors">
                {isDemoMode ? 'Your demo booking is saved. No laboratory has been contacted and no visit has been arranged.' : 'Your request is saved. Check the booking status for provider confirmation.'}
              </p>
              <Button onClick={() => { setBookingSuccess(false); setSelectedTest(null); setView('bookings'); }}>View my bookings</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {(bookingError || bookTestMutation.isError) && <p role="alert" className="text-sm text-rose-700">{bookingError || errorMessage(bookTestMutation.error)}</p>}
              <Input
                label="Sample Collection Date"
                type="date"
                value={bookingDate}
                min={localDate()}
                onChange={(e) => setBookingDate(e.target.value)}
                required
                disabled={bookTestMutation.isPending}
              />
              {centersQuery.isLoading ? <p>Loading diagnostic centers.</p> : centersQuery.isError ? <ErrorState message={errorMessage(centersQuery.error)} onRetry={() => centersQuery.refetch()} /> :
                <label className="block text-sm">Diagnostic center<select className="w-full rounded-xl border p-2.5 bg-white dark:bg-slate-900 mt-1" value={centerId} disabled={bookTestMutation.isPending} onChange={event => setCenterId(event.target.value)}>
                  <option value="">Choose a center</option>{centers.map(center => <option key={center.id} value={center.id}>{center.name} � {center.distanceKm} km</option>)}
                </select>{centers.length === 0 && <span className="text-rose-700">No center offers this test.</span>}</label>}
              {centers.find(center => center.id === centerId) && <p className="text-xs text-slate-500">{centers.find(center => center.id === centerId)?.address}<br />{centers.find(center => center.id === centerId)?.openingHours}</p>}
              <Input label={isDemoMode ? 'Demo collection time (AM/PM)' : 'Requested collection time (AM/PM)'} value={bookingTime} onChange={event => setBookingTime(event.target.value)} list="collection-times" disabled={bookTestMutation.isPending} />
              <datalist id="collection-times">{demoCollectionTimes.map(time => <option key={time}>{time}</option>)}</datalist>
              {isHomeCollection && <Input label="Home collection address" value={address} onChange={event => setAddress(event.target.value)} disabled={bookTestMutation.isPending} required />}
              <p className="text-xs text-slate-500">{selectedTest.preparationNotes}</p>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 transition-colors">
                  Sample Collection Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!selectedTest.isHomeCollectionAvailable || bookTestMutation.isPending}
                    onClick={() => setIsHomeCollection(true)}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      isHomeCollection
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 ring-1 ring-teal-600 dark:ring-teal-500 dark:border-teal-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Home className="w-4 h-4 mb-1 text-teal-600 dark:text-teal-500 transition-colors" />
                    <span>Home Sample Visit</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal transition-colors">
                      Phlebotomist arrives at home
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsHomeCollection(false)}
                    disabled={bookTestMutation.isPending}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      !isHomeCollection
                        ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 ring-1 ring-teal-600 dark:ring-teal-500 dark:border-teal-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Microscope className="w-4 h-4 mb-1 text-teal-600 dark:text-teal-500 transition-colors" />
                    <span>In-Lab Visit</span>
                    <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal transition-colors">
                      Walk in to nearest center
                    </span>
                  </button>
                </div>
              </div>

              {selectedTest.fastingRequired && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2 transition-colors">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    Note: Fasting for {selectedTest.fastingHours} hours prior to sample collection is required for diagnostic accuracy.
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 transition-colors">
                <Button variant="outline" disabled={bookTestMutation.isPending} onClick={() => setSelectedTest(null)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  isLoading={bookTestMutation.isPending}
                  disabled={!centerId || centersQuery.isError || centers.length === 0}
                  onClick={() => {
                    const invalid = validateBooking(bookingDate, bookingTime) || (!centerId ? 'Choose a diagnostic center.' : null) || (isHomeCollection && address.trim().length < 10 ? 'Enter a complete home collection address.' : null);
                    setBookingError(invalid);
                    if (invalid || bookTestMutation.isPending) return;
                    bookTestMutation.mutate({ centerId, testId: selectedTest.id, scheduledDate: bookingDate, scheduledTime: bookingTime, collectionType: isHomeCollection ? 'HOME_COLLECTION' : 'CENTER_VISIT', patientAddress: isHomeCollection ? address.trim() : undefined });
                  }}
                >
                  Confirm Test Booking
                </Button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};
