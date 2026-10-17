import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Microscope } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { diagnosticApi } from '../../api/diagnosticApi';
import type { DiagnosticBooking } from '../../types';
import { errorMessage } from '../../lib/request';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import { ErrorState } from '../common/ErrorState';
import { LoadingSkeleton } from '../common/LoadingSkeleton';

export function DiagnosticBookingHistory() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [status, setStatus] = useState('ALL');
  const [selected, setSelected] = useState<DiagnosticBooking | null>(null);
  const query = useQuery({ queryKey: ['diagnostic-bookings', user?.id], queryFn: () => diagnosticApi.getBookings() });
  const cancel = useMutation({ mutationFn: (id: string) => diagnosticApi.cancelBooking(id), onSuccess: () => {
    client.invalidateQueries({ queryKey: ['diagnostic-bookings'] }); setSelected(null);
  } });
  const bookings = (query.data?.data ?? []).filter(item => status === 'ALL' || item.status === status);
  return <div className="space-y-4">
    <label className="block text-sm max-w-sm">Booking status<select className="block w-full border rounded-xl p-2.5 mt-1 bg-white dark:bg-slate-900" value={status} onChange={event => setStatus(event.target.value)}>
      {['ALL', 'BOOKED', 'SAMPLE_COLLECTION', 'PROCESSING', 'REPORT_READY', 'DELIVERED', 'CANCELLED'].map(value => <option key={value}>{value}</option>)}
    </select></label>
    {query.isLoading ? <LoadingSkeleton type="list" count={2} /> : query.isError ? <ErrorState message={errorMessage(query.error)} onRetry={() => query.refetch()} /> : !bookings.length ?
      <EmptyState icon={Microscope} title="No matching bookings" description="Book a test or change the status filter." /> :
      bookings.map(booking => <Card key={booking.id} className="space-y-3">
        <div className="flex flex-wrap justify-between gap-2"><h2 className="font-bold">{booking.testName}</h2><span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded-full px-3 py-1">{booking.status.replaceAll('_', ' ')}</span></div>
        <p className="text-sm">{booking.centerName}</p><p className="text-sm text-slate-500">{booking.scheduledDate} at {booking.scheduledTime} � {booking.collectionType === 'HOME_COLLECTION' ? 'Home collection' : 'Center visit'}</p>
        {booking.patientAddress && <p className="text-sm">{booking.patientAddress}</p>}
        <div className="flex flex-wrap justify-between gap-3 items-center"><p className="text-xs text-slate-500">{booking.bookingRef} � ${booking.price.toFixed(2)}</p>
          {booking.status === 'BOOKED' && <Button variant="outline" size="sm" onClick={() => { cancel.reset(); setSelected(booking); }}>Cancel booking</Button>}</div>
      </Card>)}
    <Modal isOpen={!!selected} onClose={() => { if (!cancel.isPending) setSelected(null); }} title="Cancel diagnostic booking?">
      <p className="text-sm mb-4">Cancel {selected?.testName} on {selected?.scheduledDate}? The booking will remain in your history.</p>
      {cancel.isError && <p role="alert" className="text-rose-700 mb-3">{errorMessage(cancel.error)}</p>}
      <div className="flex justify-end gap-2"><Button variant="outline" disabled={cancel.isPending} onClick={() => setSelected(null)}>Keep booking</Button><Button isLoading={cancel.isPending} onClick={() => selected && !cancel.isPending && cancel.mutate(selected.id)}>Confirm cancellation</Button></div>
    </Modal>
  </div>;
}
