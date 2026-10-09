import type { Doctor, DoctorFilter, CartItem } from '../types';

export function localDate(date = new Date()): string {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function dateAfterDays(days: number, now = new Date()): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return localDate(date);
}

export function validateBooking(date: string, time: string, now = new Date()): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Choose a valid appointment date.';
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match || +match[1] < 1 || +match[1] > 12 || +match[2] > 59) return 'Choose a valid time slot.';
  const [year, month, day] = date.split('-').map(Number);
  const hour = (+match[1] % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
  const selected = new Date(year, month - 1, day, hour, +match[2]);
  if (localDate(selected) !== date) return 'Choose a valid appointment date.';
  if (selected <= now) return 'Choose a future appointment date and time.';
  return null;
}

export function availableTimes(doctor: Doctor, date: string, now = new Date()): string[] {
  const datedSlots = doctor.timeSlots.filter(slot => slot.date === date);
  // Undated slots are supported for API contracts which supply a daily schedule.
  const times = datedSlots.length
    ? datedSlots.filter(slot => slot.available).map(slot => slot.time)
    : doctor.timeSlots.length === 0 ? (doctor.availableSlots ?? []) : [];
  return [...new Set(times)].filter(time => !validateBooking(date, time, now));
}

const specialtyAliases: Record<string, string> = {
  cardiology: 'cardiologist', dermatology: 'dermatologist', pediatrics: 'pediatrician',
  neurology: 'neurologist', 'orthopedic surgery': 'orthopedic surgeon', 'general medicine': 'general physician',
};

export function filterDoctors(doctors: Doctor[], filter?: DoctorFilter): Doctor[] {
  const query = (filter?.searchQuery ?? filter?.search ?? '').trim().toLowerCase();
  const specialization = filter?.specialization?.toLowerCase();
  return doctors.filter(doctor => {
    if (query && ![doctor.name, doctor.specialization, doctor.location, doctor.hospitalAffiliation].some(value => value.toLowerCase().includes(query))) return false;
    if (specialization && specialization !== 'all' && doctor.specialization.toLowerCase() !== (specialtyAliases[specialization] ?? specialization)) return false;
    if (filter?.consultationType && !doctor.consultationTypes.includes(filter.consultationType)) return false;
    if (filter?.minRating && doctor.rating < filter.minRating) return false;
    if (filter?.maxFee !== undefined && doctor.consultationFee > filter.maxFee) return false;
    if (filter?.experienceYears && doctor.experienceYears < filter.experienceYears) return false;
    return true;
  });
}

export function validateCheckout(items: CartItem[], address: string): string | null {
  if (!items.length) return 'Your cart is empty. Add a medicine before checking out.';
  if (address.trim().length < 10) return 'Enter a complete delivery address.';
  if (items.some(item => !Number.isInteger(item.quantity) || item.quantity < 1 || !item.medicine.inStock || item.quantity > item.medicine.stockCount)) return 'Check the available stock and quantities in your cart.';
  return null;
}

export function demoSchedule(doctor: Doctor, now = new Date()): Doctor {
  const times = [...new Set(doctor.timeSlots.map(slot => slot.time).concat(doctor.availableSlots ?? []))];
  const slots: Doctor['timeSlots'] = [];
  for (let offset = 0; offset < 14; offset++) {
    const date = dateAfterDays(offset, now);
    const weekday = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
    if (!doctor.availableDays.includes(weekday)) continue;
    times.forEach((time, index) => slots.push({
      id: doctor.id + ':' + date + ':' + index, date, time, available: !validateBooking(date, time, now),
    }));
  }
  const first = slots.find(slot => slot.available);
  return { ...doctor, timeSlots: slots, availableSlots: times, nextAvailableSlot: first ? first.date + ', ' + first.time : 'No available slots' };
}
