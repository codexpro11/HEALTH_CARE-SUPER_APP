import test from 'node:test';
import assert from 'node:assert/strict';
import { mockDoctors, mockMedicines } from '../data/mockData';
import { availableTimes, dateAfterDays, demoSchedule, filterDoctors, localDate, validateBooking, validateCheckout } from './frontend';
import { executeRequest, errorMessage } from './request';
import { validateRecordAttachment } from './recordAttachments';
import { demoUser, getDemoSession, saveDemoSession, saveDemoProfile, clearDemoSession, settingsKey, readStored, writeStored } from './demo';

const now = new Date(2026, 9, 9, 12, 0);

test('dates use local calendar days and reject past, elapsed and invalid slots', () => {
  assert.equal(localDate(now), '2026-10-09');
  assert.equal(dateAfterDays(1, now), '2026-10-10');
  assert.equal(validateBooking('2026-10-10', '09:00 AM', now), null);
  assert.ok(validateBooking('2026-10-08', '09:00 AM', now));
  assert.ok(validateBooking('2026-10-09', '11:00 AM', now));
  assert.ok(validateBooking('2026-02-30', '09:00 AM', now));
  assert.ok(validateBooking('2026-10-10', '13:00 PM', now));
  assert.ok(validateBooking('', '', now));
});

test('doctor search accepts the UI search field and specialty aliases', () => {
  assert.equal(filterDoctors(mockDoctors, { search: 'Evelyn' }).length, 1);
  assert.equal(filterDoctors(mockDoctors, { specialization: 'Cardiology' })[0].specialization, 'Cardiologist');
  assert.equal(filterDoctors(mockDoctors, { search: 'no-such-doctor' }).length, 0);
});

test('demo availability advances with the calendar and excludes past times', () => {
  const doctor = demoSchedule(mockDoctors[0], now);
  assert.ok(doctor.timeSlots.some(slot => slot.date > localDate(now)));
  assert.ok(availableTimes(doctor, localDate(now), now).every(time => !validateBooking(localDate(now), time, now)));
  assert.deepEqual(availableTimes(doctor, '2026-11-01', now), []);
  assert.deepEqual(availableTimes({ ...doctor, timeSlots: [], availableSlots: undefined }, '2026-10-10', now), []);
});

test('checkout blocks empty carts, short addresses, fractional and over-stock quantities', () => {
  const medicine = mockMedicines[0];
  const address = '123 Main Street, Pune';
  assert.ok(validateCheckout([], address));
  assert.ok(validateCheckout([{ medicine, quantity: 1 }], ' '));
  assert.ok(validateCheckout([{ medicine, quantity: 1.5 }], address));
  assert.ok(validateCheckout([{ medicine, quantity: medicine.stockCount + 1 }], address));
  assert.equal(validateCheckout([{ medicine: { ...medicine, inStock: true, stockCount: 10 }, quantity: 1 }], address), null);
});

test('demo success does not call the live service', async () => {
  let called = false;
  const result = await executeRequest(async () => { called = true; throw new Error('network'); }, () => ['sample'], { demo: true, scenario: 'success', message: 'Preview' });
  assert.equal(called, false);
  assert.deepEqual(result.data, ['sample']);
});

test('demo error does not run mutation side effects; empty scenario produces empty lists', async () => {
  let wrote = false;
  await assert.rejects(executeRequest(async () => { throw new Error('network'); }, () => { wrote = true; return {}; }, { demo: true, scenario: 'error', message: 'Preview' }), /Demo failure/);
  assert.equal(wrote, false);
  const empty = await executeRequest(async () => { throw new Error('network'); }, () => ['sample'], { demo: true, scenario: 'empty', message: 'Preview' });
  assert.deepEqual(empty.data, []);
});

test('live failures and unsuccessful 200 responses never fall back to demo data', async () => {
  let fallback = false;
  const mock = () => { fallback = true; return {}; };
  await assert.rejects(executeRequest(async () => { throw { response: { status: 409 } }; }, mock, { demo: false, scenario: 'success', message: 'Live' }), /slot is no longer available/);
  await assert.rejects(executeRequest(async () => ({ data: { success: false, data: {}, message: 'Booking rejected', timestamp: '' } }), mock, { demo: false, scenario: 'success', message: 'Live' }), /Booking rejected/);
  assert.equal(fallback, false);
  assert.equal(errorMessage({ response: { data: { error: { message: 'Permission denied' } } } }), 'Permission denied');
});

function memoryStorage() {
  const entries = new Map<string, string>();
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => { entries.set(key, value); },
    removeItem: (key: string) => { entries.delete(key); },
    clear: () => entries.clear(),
  };
}

test('demo profiles and preferences survive refresh and stay isolated by account', () => {
  Object.defineProperty(globalThis, 'localStorage', { value: memoryStorage(), configurable: true });
  Object.defineProperty(globalThis, 'sessionStorage', { value: memoryStorage(), configurable: true });
  const first = demoUser('FIRST@example.com');
  saveDemoSession(first);
  saveDemoProfile({ ...first, fullName: 'Updated Patient', allergies: [] });
  assert.equal(getDemoSession()?.fullName, 'Updated Patient');
  assert.equal(demoUser(' first@example.com ').fullName, 'Updated Patient');
  const second = demoUser('second@example.com');
  assert.notEqual(second.id, first.id);
  writeStored(settingsKey(first.id), { sms: false });
  assert.deepEqual(readStored(settingsKey(second.id), { sms: true }), { sms: true });
  clearDemoSession();
  assert.equal(getDemoSession(), null);
  saveDemoSession(first, false);
  assert.ok(getDemoSession());
  assert.equal(localStorage.getItem('hc_demo_session'), null);
  clearDemoSession();
  assert.equal(getDemoSession(), null);
});

test('storage failures report that changes were not saved', () => {
  Object.defineProperty(globalThis, 'localStorage', { value: { setItem() { throw new Error('quota'); } }, configurable: true });
  assert.throws(() => writeStored('hc_preferences', {}), /could not be saved/);
});


test('medical record attachments accept matching PDF and image files up to 10 MB', () => {
  assert.equal(validateRecordAttachment({ name: 'report.pdf', type: 'application/pdf', size: 1024 }), null);
  assert.equal(validateRecordAttachment({ name: 'scan.JPG', type: 'image/jpeg', size: 1024 }), null);
  assert.equal(validateRecordAttachment({ name: 'image.png', type: 'image/png', size: 1024 }), null);
  assert.match(validateRecordAttachment(null) || '', /Choose a PDF/);
  assert.match(validateRecordAttachment({ name: 'empty.pdf', type: 'application/pdf', size: 0 }) || '', /empty/);
  assert.match(validateRecordAttachment({ name: 'large.pdf', type: 'application/pdf', size: 10 * 1024 * 1024 + 1 }) || '', /10 MB/);
  assert.match(validateRecordAttachment({ name: 'report.pdf', type: 'image/png', size: 10 }) || '', /matching/);
  assert.match(validateRecordAttachment({ name: 'scan.dcm', type: 'application/dicom', size: 10 }) || '', /matching/);
});
