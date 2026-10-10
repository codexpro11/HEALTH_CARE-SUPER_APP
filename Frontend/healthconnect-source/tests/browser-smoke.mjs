import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch();
const context = await browser.newContext({ timezoneId: 'Asia/Kolkata', viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors = [];
const apiRequests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (request.url().includes('/api/v1/')) apiRequests.push(request.url()); });
await mkdir('test-results', { recursive: true });
try {
  for (let attempt = 0; ; attempt++) {
    try { await page.goto('http://127.0.0.1:4173/login'); break; }
    catch (error) {
      if (attempt >= 30) throw error;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/app/dashboard');
  await page.goto('http://127.0.0.1:4173/app/profile');
  await page.getByLabel('Full Name', { exact: true }).fill('Demo Browser Patient');
  await page.getByRole('button', { name: 'Save Profile Changes' }).click();
  await page.getByText('Demo profile saved in this browser.').waitFor();
  await page.reload();
  assert.equal(await page.getByLabel('Full Name', { exact: true }).inputValue(), 'Demo Browser Patient');

  await page.goto('http://127.0.0.1:4173/app/doctors?search=Evelyn');
  await page.getByRole('button', { name: 'Book', exact: true }).first().waitFor();
  assert.equal(await page.getByRole('button', { name: 'Book', exact: true }).count(), 1);
  await page.getByRole('button', { name: 'Book', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm & Schedule' }).click();
  await page.waitForURL('**/app/appointments');
  await page.getByRole('button', { name: 'Cancel', exact: true }).first().click();
  await page.getByRole('button', { name: 'Yes, Cancel', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });

  for (const route of ['diagnostics', 'pharmacy', 'medical-records', 'prescriptions', 'hospitals', 'blood-banks', 'notifications']) {
    await page.goto('http://127.0.0.1:4173/app/' + route);
    await page.locator('main h1').first().waitFor();
  }

  await page.goto('http://127.0.0.1:4173/app/medical-records');
  await page.getByRole('button', { name: 'Add a record', exact: true }).click();
  await page.getByLabel('Document title').fill('Smoke CBC Report');
  await page.locator('#record-file').setInputFiles({
    name: 'smoke-report.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n%%EOF'),
  });
  await page.getByRole('button', { name: 'Save record', exact: true }).click();
  await page.getByText('Smoke CBC Report', { exact: true }).first().waitFor();
  await page.getByRole('button', { name: 'View', exact: true }).first().click();
  await page.locator('iframe[title="Smoke CBC Report"]').waitFor();
  await page.screenshot({ path: 'test-results/medical-record-preview.png' });
  const [recordDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download file', exact: true }).click(),
  ]);
  assert.equal(recordDownload.suggestedFilename(), 'smoke-report.pdf');
  await page.getByRole('button', { name: 'Close modal' }).click();
  await page.reload();
  await page.getByText('Smoke CBC Report', { exact: true }).waitFor();

  await page.goto('http://127.0.0.1:4173/app/settings');
  const sms = page.getByLabel('SMS', { exact: true });
  await sms.check();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await page.reload();
  assert.equal(await page.getByLabel('SMS', { exact: true }).isChecked(), true);
  await page.getByLabel('Preview scenario').selectOption('error');
  await page.goto('http://127.0.0.1:4173/app/doctors');
  await page.getByText('Failed to load doctors catalog.').waitFor();
  await page.goto('http://127.0.0.1:4173/app/settings');
  await page.getByLabel('Preview scenario').selectOption('empty');
  await page.goto('http://127.0.0.1:4173/app/doctors');
  await page.getByText('No Doctors Found', { exact: true }).waitFor();
  await page.goto('http://127.0.0.1:4173/app/settings');
  await page.getByLabel('Preview scenario').selectOption('success');
  await page.goto('http://127.0.0.1:4173/app/doctors');
  await page.getByRole('button', { name: 'Book', exact: true }).first().waitFor();
  await page.screenshot({ path: 'test-results/desktop-doctors.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/mobile-doctors.png', fullPage: true });
  assert.deepEqual(errors, [], 'Uncaught browser errors');
  assert.deepEqual(apiRequests, [], 'Demo must not contact backend APIs');
  console.log('Browser smoke passed: login, profile persistence, doctor filtering, booking/cancellation, patient pages, saved settings, failure/empty recovery and mobile layout.');
} finally {
  await page.screenshot({ path: 'test-results/final-state.png', fullPage: true }).catch(() => {});
  await browser.close();
}
