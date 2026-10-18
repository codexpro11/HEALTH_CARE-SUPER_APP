import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';

const browser = await chromium.launch({ executablePath: process.env.TEST_BROWSER_PATH || undefined });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, timezoneId: 'Asia/Kolkata' });
const page = await context.newPage();
const errors = [], requests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (request.url().includes('/api/v1/')) requests.push(request.url()); });
const root = (process.env.TEST_APP_URL || 'http://127.0.0.1:4173/').replace(/\/$/, '');
const hash = process.env.TEST_HASH_ROUTER === 'true' ? '/#' : '';
const go = route => page.goto(root + hash + route, { waitUntil: 'domcontentloaded' });
function pdf() {
  const content = 'BT /F1 12 Tf 20 80 Td (HealthConnect QA document) Tj ET';
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 200 120] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Length ' + Buffer.byteLength(content) + ' >>\nstream\n' + content + '\nendstream',
  ];
  let text = '%PDF-1.4\n'; const offsets = [0];
  for (let i = 0; i < objects.length; i++) { offsets.push(Buffer.byteLength(text)); text += (i + 1) + ' 0 obj\n' + objects[i] + '\nendobj\n'; }
  const xref = Buffer.byteLength(text);
  text += 'xref\n0 6\n0000000000 65535 f \n' + offsets.slice(1).map(offset => String(offset).padStart(10, '0') + ' 00000 n \n').join('');
  text += 'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
  return Buffer.from(text);
}
const documentBytes = pdf();
const login = async email => {
  await page.getByLabel('Email Address', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/app/dashboard');
};
const addPolicy = async (name, number, sum) => {
  await page.getByRole('button', { name: 'Add Policy', exact: true }).click();
  await page.getByLabel('Insurance Provider', { exact: true }).fill('QA Insurance');
  await page.getByLabel('Plan Name', { exact: true }).fill(name);
  await page.getByLabel('Policy Number', { exact: true }).fill(number);
  await page.getByLabel('Member ID', { exact: true }).fill('PRIVATE-MEMBER-7004');
  await page.getByLabel('Sum Insured', { exact: true }).fill(sum);
  await page.getByLabel('Policy Start Date', { exact: true }).fill('2026-01-01');
  await page.getByLabel('Policy End Date', { exact: true }).fill('2028-12-31');
};
const draft = async (policyId, hospital, amount) => {
  await page.getByRole('button', { name: 'New Claim', exact: true }).click();
  await page.getByLabel('Claim Policy', { exact: true }).selectOption(policyId);
  await page.getByLabel('Hospital or Facility', { exact: true }).fill(hospital);
  await page.getByLabel('Claim Amount (INR)', { exact: true }).fill(amount);
  await page.getByLabel('Service Date', { exact: true }).fill('2026-10-10');
  await page.getByLabel('Claim Description', { exact: true }).fill('Sample inpatient expenses for frontend insurance testing.');
};
const submit = async () => {
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Submit Demo Claim', exact: true }).click();
  await page.getByText('SUBMITTED', { exact: true }).first().waitFor();
};
const provider = async () => {
  await page.getByRole('button', { name: 'Role: PATIENT' }).click();
  await page.getByRole('button', { name: 'DOCTOR', exact: true }).click();
  await page.waitForURL('**/provider/nfc-scanner');
  await page.getByRole('button', { name: '[ Start NFC Scan ]', exact: true }).click();
  await page.waitForURL('**/provider/nfc/summary/PT-1002');
};
const patient = async () => {
  await page.getByRole('button', { name: 'Return to Patient Demo' }).click();
  await page.waitForURL('**/app/dashboard');
};
await mkdir('test-results', { recursive: true });
try {
  await go('/app/insurance');
  await page.getByRole('button', { name: 'Sign In', exact: true }).waitFor();
  await login('insurance.qa@healthconnect.example');
  await go('/app/insurance');
  await addPolicy('QA Family Care', 'PRIVATE-POLICY-1004', '0');
  await page.getByRole('button', { name: 'Save Policy', exact: true }).click();
  await page.getByText('Enter a positive sum insured with up to two decimal places.').waitFor();
  assert.equal(await page.getByLabel('Plan Name', { exact: true }).inputValue(), 'QA Family Care');
  await page.getByLabel('Sum Insured', { exact: true }).fill('250000');
  await page.getByLabel('Coverage Notes', { exact: true }).fill('Sample inpatient and diagnostic cover.');
  await page.getByRole('button', { name: 'Save Policy', exact: true }).click();
  await page.waitForURL('**/app/insurance/pol-*');
  const policyRoute = new URL(page.url()).hash ? new URL(page.url()).hash.slice(1) : new URL(page.url()).pathname;
  const policyId = policyRoute.split('/').at(-1);
  await page.getByRole('heading', { name: 'QA Family Care', exact: true }).waitFor();
  assert.equal((await page.locator('body').innerText()).includes('PRIVATE-POLICY-1004'), false);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'QA Family Care', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit Policy', exact: true }).click();
  await page.getByLabel('Plan Name', { exact: true }).fill('QA Family Care Updated');
  await page.getByRole('button', { name: 'Save Policy', exact: true }).click();
  await page.getByRole('heading', { name: 'QA Family Care Updated', exact: true }).waitFor();

  await page.getByLabel('Attach a document', { exact: true }).setInputFiles({ name: 'unsupported.txt', mimeType: 'text/plain', buffer: Buffer.from('Not a supported document') });
  await page.getByRole('button', { name: 'Upload Document', exact: true }).click();
  await page.getByText('Use a matching PDF, JPG, or PNG file.').waitFor();
  await page.getByLabel('Attach a document', { exact: true }).setInputFiles({ name: 'qa-policy.pdf', mimeType: 'application/pdf', buffer: documentBytes });
  await page.getByRole('button', { name: 'Upload Document', exact: true }).click();
  await page.getByRole('button', { name: 'Preview qa-policy.pdf', exact: true }).waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Preview qa-policy.pdf', exact: true }).click();
  await page.locator('iframe[title="qa-policy.pdf"]').waitFor();
  await page.screenshot({ path: 'test-results/insurance-policy-preview.png', fullPage: true });
  await page.getByRole('button', { name: 'Close modal', exact: true }).click();
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download qa-policy.pdf', exact: true }).click()]);
  assert.equal(download.suggestedFilename(), 'qa-policy.pdf');
  assert.deepEqual(await readFile(await download.path()), documentBytes);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Remove qa-policy.pdf', exact: true }).click();
  await page.getByText('Document removed.').waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.getByRole('button', { name: 'Preview qa-policy.pdf', exact: true }).count(), 0);

  await go('/app/insurance');
  await addPolicy('Duplicate Must Fail', 'PRIVATE-POLICY-1004', '100000');
  await page.getByRole('button', { name: 'Save Policy', exact: true }).click();
  await page.getByText('This provider and policy number already exist in your account.').waitFor();
  await page.getByRole('button', { name: 'Close modal', exact: true }).click();
  await go('/app/insurance/claims');
  await draft(policyId, 'QA Care Hospital', '300000');
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
  await page.getByText('Enter a positive claim amount within the policy sum insured.').waitFor();
  await page.getByLabel('Claim Amount (INR)', { exact: true }).fill('5000');
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
  await page.getByRole('heading', { name: 'Insurance Claim Details', exact: true }).waitFor();
  const claimRoute = new URL(page.url()).hash ? new URL(page.url()).hash.slice(1) : new URL(page.url()).pathname;
  await page.getByRole('button', { name: 'Edit Draft', exact: true }).click();
  await page.getByLabel('Claim Description', { exact: true }).fill('Updated sample inpatient expenses for the claim demo.');
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByText('Updated sample inpatient expenses for the claim demo.', { exact: true }).waitFor();
  await page.getByLabel('Attach a document', { exact: true }).setInputFiles({ name: 'qa-claim.pdf', mimeType: 'application/pdf', buffer: documentBytes });
  await page.getByRole('button', { name: 'Upload Document', exact: true }).click();
  await page.getByRole('button', { name: 'Preview qa-claim.pdf', exact: true }).waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await submit();
  assert.equal(await page.getByRole('button', { name: 'Edit Draft', exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Remove qa-claim.pdf', exact: true }).count(), 0);
  await page.getByRole('button', { name: 'Simulate Review', exact: true }).click();
  await page.getByRole('button', { name: 'Simulate Partial Approval', exact: true }).click();
  await page.getByLabel('Approved Amount', { exact: true }).fill('5000');
  await page.getByRole('button', { name: 'Apply Demo Decision', exact: true }).click();
  await page.getByText('Partial approval must be positive and below the claimed amount.').first().waitFor();
  await page.getByLabel('Approved Amount', { exact: true }).fill('2500');
  await page.getByRole('button', { name: 'Apply Demo Decision', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('button', { name: 'Simulate Settlement', exact: true }).click();
  await page.getByText('SETTLED', { exact: true }).first().waitFor();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.getByText('SETTLED', { exact: true }).first().waitFor();
  await page.screenshot({ path: 'test-results/insurance-claim-settled.png', fullPage: true });

  await go(policyRoute);
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete Policy', exact: true }).click();
  await page.getByText('Policies with claims cannot be deleted. You can cancel the policy instead.').waitFor();
  await page.getByRole('button', { name: 'Edit Policy', exact: true }).click();
  await page.getByLabel('Currency', { exact: true }).selectOption('USD');
  await page.getByRole('button', { name: 'Save Policy', exact: true }).click();
  await page.getByText('Currency cannot be changed after claims have been created for this policy.').waitFor();
  await page.getByRole('button', { name: 'Close modal', exact: true }).click();

  await go('/app/insurance/claims');
  await draft(policyId, 'QA Rejection Hospital', '1000');
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
  await submit();
  await page.getByRole('button', { name: 'Simulate Review', exact: true }).click();
  await page.getByRole('button', { name: 'Simulate Rejection', exact: true }).click();
  await page.getByLabel('Rejection Reason', { exact: true }).fill('no');
  await page.getByRole('button', { name: 'Apply Demo Decision', exact: true }).click();
  await page.getByText('Enter a rejection reason of 5 to 500 characters.').first().waitFor();
  await page.getByLabel('Rejection Reason', { exact: true }).fill('Sample policy exclusion for demonstration');
  await page.getByRole('button', { name: 'Apply Demo Decision', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByText('REJECTED', { exact: true }).first().waitFor();

  await go('/app/insurance/claims');
  await draft(policyId, 'QA Delete Draft Hospital', '1000');
  await page.getByRole('button', { name: 'Save Draft', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete Draft', exact: true }).click();
  await page.waitForURL('**/app/insurance/claims');
  await page.getByLabel('Search Claims', { exact: true }).fill('QA Delete Draft Hospital');
  await page.getByText('No claims match these filters.').waitFor();

  await provider();
  await page.getByText('QA Insurance � QA Family Care Updated', { exact: true }).waitFor();
  const summary = await page.locator('body').innerText();
  assert.equal(summary.includes('PRIVATE-POLICY-1004'), false);
  assert.equal(summary.includes('qa-claim.pdf'), false);
  await go(policyRoute);
  await page.waitForURL('**/provider/nfc-scanner');
  await patient();
  await go('/app/consent');
  await page.getByRole('button', { name: 'Manage Access', exact: true }).first().click();
  await page.getByRole('dialog').getByLabel('Insurance', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Save Access Permissions', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await provider();
  assert.equal(await page.getByRole('heading', { name: 'Insurance Information', exact: true }).count(), 0);
  await patient();

  await page.getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByRole('button', { name: 'Sign In', exact: true }).waitFor();
  await login('insurance.other@healthconnect.example');
  await go(policyRoute);
  await page.getByRole('heading', { name: 'Policy unavailable', exact: true }).waitFor();
  await go(claimRoute);
  await page.getByRole('heading', { name: 'Claim unavailable', exact: true }).waitFor();
  await go('/app/insurance');
  await page.setViewportSize({ width: 390, height: 844 });
  await addPolicy('QA Temporary Mobile Policy', 'TEMP-POLICY-2004', '100000');
  await page.getByRole('button', { name: 'Save Policy', exact: true }).click();
  await page.getByRole('heading', { name: 'QA Temporary Mobile Policy', exact: true }).waitFor();
  await page.screenshot({ path: 'test-results/insurance-policy-mobile.png', fullPage: true });
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete Policy', exact: true }).click();
  await page.waitForURL('**/app/insurance');
  await page.reload({ waitUntil: 'domcontentloaded' });
  assert.equal(await page.getByText('QA Temporary Mobile Policy', { exact: true }).count(), 0);
  await go('/app/settings');
  await page.getByLabel('Preview scenario').selectOption('error');
  await go('/app/insurance');
  await page.getByText('Failed to load insurance. Choose the Success preview scenario and retry.').waitFor();
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await go('/app/settings');
  await page.getByLabel('Preview scenario').selectOption('empty');
  await go('/app/insurance');
  await page.getByRole('heading', { name: 'No Insurance Policies', exact: true }).waitFor();
  await go('/app/settings');
  await page.getByLabel('Preview scenario').selectOption('success');
  await go('/app/insurance');
  await page.getByRole('heading', { name: 'SecureHealth Insurance', exact: true }).waitFor();
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  assert.deepEqual(requests, [], 'Demo insurance must not call backend APIs');
  console.log('Insurance browser checks passed: policy validation/edit/duplicate/delete persistence, PDF upload/preview/exact download/removal, claim validation/submission/partial/rejection/settlement/draft deletion, immutable submitted documents, policy currency/reference guards, scoped NFC summaries, role/account boundaries, mobile form and empty/error recovery.');
} finally {
  await page.screenshot({ path: 'test-results/insurance-final-state.png', fullPage: true }).catch(() => {});
  await browser.close();
}
