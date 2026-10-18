import test from 'node:test';
import assert from 'node:assert/strict';
import { mockDiagnosticTests, mockDiagnosticCenters, mockMedicines, mockHospitals, mockBloodBanks, mockMedicalRecords } from '../data/mockData';
import { canonicalCart, canCancelOrder, prescriptionRecords, quoteCart, selectBloodBanks, selectHospitals, validateDiagnosticRequest, validatePharmacyRequest } from './healthcareRules';
import { readDiagnosticBookings, readPharmacyOrders, saveDiagnosticBookings, savePharmacyOrders } from './healthcareDemo';
import { clearDemoSession, demoUser, saveDemoSession } from './demo';
import type { DiagnosticBookingRequest, } from './healthcareRules';

const now = new Date(2026, 9, 15, 8);
const testItem = mockDiagnosticTests[0];
const center = mockDiagnosticCenters[0];
const request: DiagnosticBookingRequest = { centerId: center.id, testId: testItem.id, collectionType: 'CENTER_VISIT', scheduledDate: '2026-10-16', scheduledTime: '09:00 AM' };

test('diagnostics rejects unknown or unsupported centers instead of substituting a fixture', () => {
  assert.ok(validateDiagnosticRequest(request, testItem, undefined, [], now));
  assert.ok(validateDiagnosticRequest(request, undefined, center, [], now));
  assert.ok(validateDiagnosticRequest(request, testItem, { ...center, availableTests: [] }, [], now));
  assert.equal(validateDiagnosticRequest(request, testItem, center, [], now), null);
});
test('home collection requires test eligibility and a complete address; center visits do not', () => {
  const home = { ...request, collectionType: 'HOME_COLLECTION' as const };
  assert.ok(validateDiagnosticRequest(home, { ...testItem, isHomeCollectionAvailable: false }, center, [], now));
  assert.ok(validateDiagnosticRequest(home, { ...testItem, isHomeCollectionAvailable: true }, center, [], now));
  assert.equal(validateDiagnosticRequest({ ...home, patientAddress: '123 Sample Road, Pune' }, { ...testItem, isHomeCollectionAvailable: true }, center, [], now), null);
});
test('diagnostics rejects elapsed dates, invalid calendar dates and unavailable demo times', () => {
  for (const values of [{ scheduledDate: '2026-10-14' }, { scheduledDate: '2026-02-30' }, { scheduledTime: '10:00 AM' }]) {
    assert.ok(validateDiagnosticRequest({ ...request, ...values }, testItem, center, [], now));
  }
});
test('an active duplicate test slot is blocked; a cancelled booking allows rebooking', () => {
  const booking = { ...request, id: 'b1', bookingRef: 'B1', centerName: center.name, testName: testItem.name, status: 'BOOKED' as const, price: 10, createdAt: now.toISOString() };
  assert.ok(validateDiagnosticRequest(request, testItem, center, [booking], now));
  assert.equal(validateDiagnosticRequest(request, testItem, center, [{ ...booking, status: 'CANCELLED' }], now), null);
});
test('cart uses catalog medicine data and rejects unknown and duplicate IDs', () => {
  const medicine = mockMedicines[0];
  const cart = canonicalCart([{ medicine: { ...medicine, price: 0, requiresPrescription: false }, quantity: 1 }], mockMedicines);
  assert.equal(cart[0].medicine.price, medicine.price);
  assert.equal(cart[0].medicine.requiresPrescription, medicine.requiresPrescription);
  assert.throws(() => canonicalCart([{ medicine: { ...medicine, id: 'unknown' }, quantity: 1 }], mockMedicines));
  assert.throws(() => canonicalCart([{ medicine, quantity: 1 }, { medicine, quantity: 1 }], mockMedicines));
});
test('prescription checkout requires an uploaded unarchived prescription for the current patient', () => {
  const medicine = { ...mockMedicines[0], requiresPrescription: true, inStock: true, stockCount: 5 };
  const record = { ...mockMedicalRecords[0], id: 'rx', recordType: 'PRESCRIPTION' as const, patientId: 'patient-a', originalFileName: 'rx.pdf', status: 'PENDING' as const };
  const address = '123 Sample Road, Pune';
  assert.ok(validatePharmacyRequest([{ medicine, quantity: 1 }], address));
  assert.equal(validatePharmacyRequest([{ medicine, quantity: 1 }], address, record.id, [record]), null);
  assert.ok(validatePharmacyRequest([{ medicine, quantity: 1 }], address, record.id, [{ ...record, status: 'ARCHIVED' }]));
  assert.deepEqual(prescriptionRecords([record], 'patient-b'), []);
  assert.deepEqual(prescriptionRecords([{ ...record, originalFileName: undefined }]), []);
});
test('checkout validates stock and address even when a prescription is selected', () => {
  const medicine = { ...mockMedicines[0], requiresPrescription: false, inStock: true, stockCount: 2 };
  assert.ok(validatePharmacyRequest([{ medicine, quantity: 3 }], '123 Sample Road, Pune'));
  assert.ok(validatePharmacyRequest([{ medicine, quantity: 1.5 }], '123 Sample Road, Pune'));
  assert.ok(validatePharmacyRequest([{ medicine, quantity: 1 }], ''));
});
test('cart totals share one delivery boundary and preserve a zero discount price', () => {
  assert.deepEqual(quoteCart([]), { subtotal: 0, deliveryFee: 0, total: 0 });
  assert.equal(quoteCart([{ medicine: { ...mockMedicines[0], price: 10, discountPrice: 0 }, quantity: 1 }]).subtotal, 0);
  assert.equal(quoteCart([{ medicine: { ...mockMedicines[0], price: 30, discountPrice: undefined }, quantity: 1 }]).total, 34.99);
  assert.equal(quoteCart([{ medicine: { ...mockMedicines[0], price: 30.01, discountPrice: undefined }, quantity: 1 }]).deliveryFee, 0);
});
test('only unshipped order statuses permit cancellation', () => {
  assert.equal(canCancelOrder('PHARMACY_PROCESSING'), true);
  for (const status of ['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED'] as const) assert.equal(canCancelOrder(status), false);
});
test('hospital search includes specialties and combines ICU, distance and emergency filters', () => {
  const hospital = mockHospitals[0];
  assert.ok(selectHospitals([hospital], { search: hospital.specializations[0] }).length);
  assert.deepEqual(selectHospitals([hospital], { maxDistance: 0 }), []);
  assert.deepEqual(selectHospitals([{ ...hospital, hasICU: false }], { icuOnly: true }), []);
  assert.deepEqual(selectHospitals([{ ...hospital, hasEmergency: false }], { emergencyOnly: true }), []);
  const nearest = selectHospitals(mockHospitals);
  assert.ok(nearest.every((item, index) => index === 0 || item.distanceKm >= nearest[index - 1].distanceKm));
});
test('blood bank filters require positive listed units, requested group and 24-hour opening', () => {
  const bank = mockBloodBanks[0];
  assert.deepEqual(selectBloodBanks([{ ...bank, inventory: [{ bloodGroup: 'O-', unitsAvailable: 0, status: 'UNAVAILABLE' }] }], { bloodGroup: 'O-' }), []);
  assert.deepEqual(selectBloodBanks([{ ...bank, isOpen24x7: false }], { openOnly: true }), []);
  assert.deepEqual(selectBloodBanks([bank], { maxDistance: 0 }), []);
});
test('service state is patient-account scoped, denies providers and reports corrupt or failed storage', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) };
  Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: { ...storage, getItem: () => null, removeItem: () => {} }, configurable: true });
  saveDemoSession({ ...demoUser('phase4.a@example.test'), role: 'PATIENT' });
  const order = { ...readPharmacyOrders()[0], id: 'private-order' };
  savePharmacyOrders([order]); saveDiagnosticBookings([]);
  assert.equal(readPharmacyOrders()[0].id, 'private-order');
  assert.deepEqual(readDiagnosticBookings(), []);
  saveDemoSession({ ...demoUser('phase4.b@example.test'), role: 'PATIENT' });
  assert.equal(readPharmacyOrders().some(item => item.id === 'private-order'), false);
  values.set('hc_diag_bookings:demo:phase4.b@example.test', '{broken');
  assert.throws(readDiagnosticBookings, /could not be read/);
  saveDemoSession({ ...demoUser('phase4.b@example.test'), role: 'DOCTOR' });
  assert.throws(readPharmacyOrders, /patient/);
  clearDemoSession(); assert.throws(readDiagnosticBookings, /patient/);
  saveDemoSession({ ...demoUser('phase4.a@example.test'), role: 'PATIENT' });
  storage.setItem = () => { throw new Error('quota'); };
  assert.throws(() => saveDiagnosticBookings([]), /could not be saved/);
});
