import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.HEALTHCONNECT_TEST_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, timezoneId: 'Asia/Kolkata', geolocation: { latitude: 18.5204, longitude: 73.8567, accuracy: 30 } });
if (process.env.HEALTHCONNECT_DIST) {
  const dist = path.resolve(process.env.HEALTHCONNECT_DIST);
  await context.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) return route.abort();
    let file = path.resolve(dist, '.' + url.pathname);
    if (file !== dist && !file.startsWith(dist + path.sep)) return route.abort();
    try { if (!(await stat(file)).isFile()) file = path.join(dist, 'index.html'); }
    catch { file = path.join(dist, 'index.html'); }
    const contentType = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(file)];
    await route.fulfill({ path: file, contentType });
  });
}
const page = await context.newPage();
const errors = [], apiRequests = [];
page.on('pageerror', error => errors.push(error.message));
page.on('request', request => { if (request.url().includes('/api/v1/')) apiRequests.push(request.url()); });
const root = process.env.HEALTHCONNECT_TEST_RESULTS || 'test-results/phase5';
await mkdir(root, { recursive: true });
const goto = route => page.goto(base + route);
const screenshot = name => page.screenshot({ path: root + '/' + name + '.png', fullPage: true });
const login = async email => {
  await goto('/login');
  await page.getByLabel('Email Address', { exact: true }).fill(email);
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.waitForURL('**/app/dashboard');
};
try {
  await goto('/app/emergency');
  await page.waitForURL('**/login');
  await login('phase5.browser@example.test');
  await goto('/app/emergency');
  await page.getByRole('button', { name: 'Create demo SOS', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Use device location', exact: true }).click();
  await dialog.getByRole('status').filter({ hasText: /denied|unavailable|timed out/ }).waitFor();
  await dialog.getByRole('button', { name: 'Confirm demo SOS', exact: true }).click();
  await dialog.getByRole('alert').filter({ hasText: '10-500' }).waitFor();
  await dialog.getByLabel('Location or landmark', { exact: true }).fill('123 Phase Five Sample Road, Pune');
  await dialog.getByRole('button', { name: 'Confirm demo SOS', exact: true }).click();
  await page.getByRole('heading', { name: 'Active demo request', exact: true }).waitFor();
  await screenshot('01-active-request');
  assert.equal(await page.getByText('123 Phase Five Sample Road, Pune', { exact: true }).count(), 2);
  await page.reload();
  await page.getByRole('heading', { name: 'Active demo request', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Cancel request', exact: true }).click();
  await page.getByRole('button', { name: 'Keep request', exact: true }).click();
  await page.getByRole('heading', { name: 'Active demo request', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Cancel request', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm cancellation', exact: true }).click();
  await page.getByRole('heading', { name: 'No active request', exact: true }).waitFor();
  await page.getByLabel('History status').selectOption('CANCELLED');
  await page.locator('span').filter({ hasText: /^CANCELLED$/ }).waitFor();
  await page.reload();
  await page.locator('span').filter({ hasText: /^CANCELLED$/ }).waitFor();
  await screenshot('02-cancelled-history');
  await goto('/app/notifications');
  await page.getByRole('button', { name: 'Unread (2)', exact: true }).click();
  await page.getByLabel('Search notifications', { exact: true }).fill('saved');
  assert.equal(await page.locator('article').count(), 1);
  await page.getByRole('button', { name: 'Mark as read', exact: true }).click();
  await page.getByRole('heading', { name: 'No notifications in this view', exact: true }).waitFor();
  await page.getByLabel('Search notifications', { exact: true }).fill('');
  await page.getByRole('button', { name: 'Mark all as read', exact: true }).click();
  await page.getByRole('button', { name: 'Unread (0)', exact: true }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Unread (0)', exact: true }).waitFor();
  await page.getByRole('link', { name: 'Notifications', exact: true }).last().waitFor();
  await page.getByRole('button', { name: 'All (2)', exact: true }).click();
  await page.getByRole('link', { name: 'View related item', exact: true }).first().click();
  await page.waitForURL('**/app/emergency');

  await context.grantPermissions(['geolocation', 'notifications'], { origin: base });
  await page.getByRole('button', { name: 'Create demo SOS', exact: true }).click();
  await dialog.getByRole('button', { name: 'Use device location', exact: true }).click();
  await dialog.getByRole('status').filter({ hasText: 'Device location captured' }).waitFor();
  await dialog.getByLabel('Location or landmark', { exact: true }).fill('456 GPS Sample Road, Pune');
  await dialog.getByRole('button', { name: 'Confirm demo SOS', exact: true }).click();
  await page.getByText(/18\.52040, 73\.85670/).waitFor();
  await goto('/app/notifications');
  await page.getByRole('button', { name: 'Enable browser alerts', exact: true }).click();
  await page.getByRole('button', { name: 'Disable browser alerts', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Send test alert', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Test alert requested' }).or(page.getByRole('alert').filter({ hasText: /permission|notification|supported/i })).waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Disable browser alerts', exact: true }).click();
  await page.getByRole('button', { name: 'Enable browser alerts', exact: true }).waitFor();
  await screenshot('03-notifications');

  await page.setViewportSize({ width: 390, height: 844 });
  await goto('/app/emergency');
  await page.getByRole('heading', { name: 'Active demo request', exact: true }).waitFor();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await screenshot('04-mobile-emergency');
  await goto('/app/notifications');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await screenshot('05-mobile-inbox');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await goto('/app/compare');
  await page.getByRole('heading', { name: 'Emergency & Notifications: Before & After', exact: true }).waitFor();
  await screenshot('06-comparison');
  for (const route of ['nfc', 'insurance', 'medical-records', 'diagnostics', 'pharmacy', 'compare/services', 'compare/records', 'progress']) {
    await goto('/app/' + route);
    await page.locator('main h1').first().waitFor();
  }
  await page.getByRole('button', { name: 'Sign out', exact: true }).first().click();
  await page.waitForURL('**/login');
  await login('phase5.other@example.test');
  await goto('/app/emergency');
  await page.getByRole('heading', { name: 'No active request', exact: true }).waitFor();
  assert.equal(await page.getByText('456 GPS Sample Road, Pune', { exact: true }).count(), 0);
  await goto('/app/notifications');
  await page.getByRole('button', { name: 'All (0)', exact: true }).waitFor();
  await goto('/app/settings');
  await page.getByLabel('Demo role').selectOption('DOCTOR');
  await page.waitForURL('**/provider/nfc-scanner');
  await goto('/app/emergency');
  await page.waitForURL('**/provider/nfc-scanner');
  assert.equal(await page.getByText('456 GPS Sample Road, Pune', { exact: true }).count(), 0);
  assert.deepEqual(errors, []);
  assert.deepEqual(apiRequests, []);
  console.log('PASS: Phase 5 location denial/manual/GPS, request/cancellation persistence, inbox/read counts/filtering, browser alerts, mobile, previous modules, account and role isolation. No runtime errors or live API calls.');
} catch (error) {
  await screenshot('failure');
  await writeFile(root + '/failure.txt', await page.locator('body').innerText());
  throw error;
} finally { await browser.close(); }
