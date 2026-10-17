import type { BloodBank, CartItem, DiagnosticBooking, DiagnosticCenter, DiagnosticTest, Hospital, MedicalRecord, Medicine, OrderStatus } from '../types';
import { validateBooking, validateCheckout } from './frontend';

export interface DiagnosticBookingRequest {
  centerId: string; testId: string; collectionType: 'HOME_COLLECTION' | 'CENTER_VISIT';
  scheduledDate: string; scheduledTime: string; patientAddress?: string;
}
// Illustrative demo windows; live capacity must come from the provider.
export const demoCollectionTimes = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];

export function validateDiagnosticRequest(request: DiagnosticBookingRequest, test: DiagnosticTest | undefined,
  center: DiagnosticCenter | undefined, bookings: DiagnosticBooking[], now = new Date()): string | null {
  if (!test || !center || !center.availableTests.some(item => item.id === request.testId)) return 'Choose a center that offers this test.';
  if (!['HOME_COLLECTION', 'CENTER_VISIT'].includes(request.collectionType)) return 'Choose a collection method.';
  const invalid = validateBooking(request.scheduledDate, request.scheduledTime, now);
  if (invalid) return invalid;
  if (!demoCollectionTimes.includes(request.scheduledTime)) return 'Choose an available demo collection time.';
  if (request.collectionType === 'HOME_COLLECTION') {
    if (!test.isHomeCollectionAvailable) return 'This test requires a center visit.';
    if ((request.patientAddress?.trim().length ?? 0) < 10) return 'Enter a complete home collection address.';
  }
  if (bookings.some(item => item.status !== 'CANCELLED' && item.testId === request.testId &&
    item.scheduledDate === request.scheduledDate && item.scheduledTime === request.scheduledTime)) return 'You already have this test booked at that time.';
  return null;
}

export function quoteCart(items: CartItem[]) {
  const subtotal = Math.round(items.reduce((sum, item) => sum + (item.medicine.discountPrice ?? item.medicine.price) * item.quantity, 0) * 100) / 100;
  const deliveryFee = subtotal === 0 || subtotal > 30 ? 0 : 4.99;
  return { subtotal, deliveryFee, total: Math.round((subtotal + deliveryFee) * 100) / 100 };
}

export function canonicalCart(items: CartItem[], catalog: Medicine[]): CartItem[] {
  const ids = new Set<string>();
  return items.map(item => {
    const medicine = catalog.find(candidate => candidate.id === item.medicine.id);
    if (!medicine || ids.has(medicine.id)) throw new Error('The cart contains an unavailable or duplicate medicine. Refresh the catalog.');
    ids.add(medicine.id);
    return { medicine, quantity: item.quantity };
  });
}

export function prescriptionRecords(records: MedicalRecord[], patientId?: string) {
  return records.filter(record => record.recordType === 'PRESCRIPTION' && record.status !== 'ARCHIVED' &&
    !!record.originalFileName && (!patientId || record.patientId === patientId));
}

export function validatePharmacyRequest(items: CartItem[], address: string, prescriptionId?: string, records: MedicalRecord[] = []): string | null {
  const invalid = validateCheckout(items, address);
  if (invalid) return invalid;
  if (items.some(item => item.medicine.requiresPrescription) && !prescriptionRecords(records).some(record => record.id === prescriptionId)) {
    return 'Select an uploaded prescription document for pharmacy review.';
  }
  return null;
}

export function canCancelOrder(status: OrderStatus) {
  return ['CREATED', 'PAYMENT_PENDING', 'CONFIRMED', 'PHARMACY_PROCESSING'].includes(status);
}

export interface HospitalFilters { search?: string; emergencyOnly?: boolean; icuOnly?: boolean; maxDistance?: number; sort?: string; }
export function selectHospitals(hospitals: Hospital[], filters: HospitalFilters = {}) {
  const query = filters.search?.trim().toLowerCase() ?? '';
  return hospitals.filter(hospital => (!query || [hospital.name, hospital.address, ...hospital.specializations].some(value => value.toLowerCase().includes(query))) &&
    (!filters.emergencyOnly || hospital.hasEmergency) && (!filters.icuOnly || (hospital.hasICU && hospital.bedAvailability.icuAvailable > 0)) &&
    (filters.maxDistance === undefined || hospital.distanceKm <= filters.maxDistance))
    .sort((a, b) => filters.sort === 'RATING' ? b.rating - a.rating || a.distanceKm - b.distanceKm : a.distanceKm - b.distanceKm);
}

export interface BloodBankFilters { search?: string; bloodGroup?: string; openOnly?: boolean; maxDistance?: number; }
export function selectBloodBanks(banks: BloodBank[], filters: BloodBankFilters = {}) {
  const query = filters.search?.trim().toLowerCase() ?? '';
  return banks.filter(bank => (!query || [bank.name, bank.address].some(value => value.toLowerCase().includes(query))) &&
    (!filters.openOnly || bank.isOpen24x7) && (filters.maxDistance === undefined || bank.distanceKm <= filters.maxDistance) &&
    (!filters.bloodGroup || filters.bloodGroup === 'ALL' || bank.inventory.some(item => item.bloodGroup === filters.bloodGroup && item.unitsAvailable > 0 && item.status !== 'UNAVAILABLE')))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}
