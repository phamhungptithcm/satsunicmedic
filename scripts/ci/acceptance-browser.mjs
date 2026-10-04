import { chromium } from 'playwright';
import { verifyUiPerformance } from './ui-performance-browser.mjs';
import { DIRECTORY_VERSION } from '../../packages/contracts/dist/directory.js';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { once } from 'node:events';
import { createServer } from 'node:net';

// Dedicated local build. Synthetic API failures/empty results are not live auth evidence.
const origin = 'http://127.0.0.1:4387';
const directory = '.ai/local/acceptance';
mkdirSync(directory, { recursive: true });
const probe = createServer();
await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(4387, '127.0.0.1', resolve); });
await new Promise((resolve, reject) => probe.close(error => error ? reject(error) : resolve()));
const server = spawn('pnpm', ['--filter', '@hs/web', 'exec', 'next', 'start', '--hostname', '127.0.0.1', '--port', '4387'], {
  env: { ...process.env, DISCOVERY_MODE_ENABLED: 'true' }, stdio: 'ignore', detached: true,
});
let browser;
const checks = [], errors = [];
const checked = label => { checks.push(label); console.log(label); };
let page;
try {
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null) throw new Error('Acceptance server exited before readiness');
    try { if ((await fetch(origin, { signal: AbortSignal.timeout(1000) })).ok) break; } catch { /* bounded startup retry */ }
    if (i === 89) throw new Error('Acceptance server readiness timeout');
    await new Promise(r => setTimeout(r, 1000));
  }
  browser = await chromium.launch({ headless: true, args: ['--enable-unsafe-swiftshader'] });
  await verifyUiPerformance(browser, origin, directory);
  checked('cache reuse and delayed-operation progress');
  page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(60_000);
  page.on('pageerror', error => errors.push(error.message));
  let directoryFails = true;
  await page.route('**/api/v1/**', async route => {
    if (route.request().url().includes('/facilities/search')) return route.fulfill({ status: directoryFails ? 503 : 200, contentType: 'application/json', body: JSON.stringify(directoryFails ? { message: 'Synthetic unavailable' } : { items: [], nextCursor: null, version: DIRECTORY_VERSION }) });
    return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ message: 'Synthetic unauthenticated' }) });
  });
  let failModel = true;
  await page.route('**/kham-pha/toan-than/asset/**', route => failModel ? route.abort() : route.continue());
  await page.goto(`${origin}/kham-pha/toan-than`);
  await page.getByRole('heading', { name: 'Chưa tải được mô hình', exact: true }).waitFor();
  failModel = false;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  checked('model load failure and explicit retry');
  assert.match(await page.title(), /HumanScope|Khám phá|cơ thể/i);
  await page.locator('button[aria-label="Phóng to"]:enabled').waitFor();
  checked('built anatomy loads');
  const search = page.getByLabel('Tìm cấu trúc Việt hoặc Anh', { exact: true });
  await search.fill('zzzznotanatomy');
  await page.getByText('Chưa tìm thấy cấu trúc phù hợp.', { exact: true }).waitFor();
  await search.fill('');
  await page.getByRole('button', { name: 'Bên trong', exact: true }).click();
  await page.getByRole('status').filter({ hasText: /^Đang xem:/ }).waitFor({ timeout: 180_000 });
  checked('whole-body interior finishes loading');
  await page.getByRole('button', { name: 'Ẩn cơ', exact: true }).click();
  await page.getByRole('button', { name: 'Hiện cơ', exact: true }).click();
  checked('search recovery and hide/show muscles');
  await page.getByRole('button', { name: 'Tim heart', exact: true }).click();
  await page.locator('button[aria-label="Xem riêng"]:enabled').waitFor();
  await page.getByText('Máu đi qua tim', { exact: true }).click();
  const level = page.getByRole('combobox', { name: 'Mức học', exact: true });
  for (const value of ['general', 'medical', 'specialist']) {
    await level.selectOption(value);
    assert.equal(await level.inputValue(), value);
  }
  await page.getByRole('button', { name: 'Ẩn cấu trúc', exact: true }).click();
  await page.getByRole('button', { name: 'Khám phá cơ chế mạch vành' }).click();
  await page.locator('[data-model-status="ready"]').waitFor();
  await page.getByRole('button', { name: 'Hiện mô hình bài học', exact: true }).click();
  await page.getByRole('button', { name: 'Trở về cấu trúc đang xem', exact: true }).click();
  await page.getByRole('button', { name: 'Hiện cấu trúc', exact: true }).waitFor();
  checked('three audiences, shared simulation and retained selection visibility');
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    await page.screenshot({ path: `${directory}/anatomy-${width}.png`, fullPage: true });
  }
  checked('desktop/mobile no horizontal overflow');
  for (const [path, heading] of [['/hoc-tap', 'Học và ôn tập'], ['/giang-day', 'Bài giảng của bạn'], ['/co-so-y-te', 'Cơ sở y tế']]) {
    await page.goto(origin + path);
    await page.getByRole('heading', { name: heading, exact: true }).waitFor();
    assert.equal(await page.locator('nextjs-portal').count(), 0);
    checked(`entry ${path}`);
  }
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByText('Chưa tải được danh sách. Bạn có thể thử lại.', { exact: true }).waitFor();
  directoryFails = false;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByRole('heading', { name: 'Chưa tìm thấy cơ sở phù hợp', exact: true }).waitFor();
  await page.getByLabel('Tên cơ sở hoặc địa chỉ').fill('Synthetic clinic');
  await page.getByRole('button', { name: 'Tìm cơ sở', exact: true }).click();
  await page.waitForURL(/q=Synthetic/);
  await page.getByRole('button', { name: 'Xóa bộ lọc', exact: true }).click();
  await page.waitForURL(`${origin}/co-so-y-te`);
  checked('directory failure retry, empty result and URL filter reset');
  assert.deepEqual(errors, []);
  writeFileSync(`${directory}/browser-results.json`, JSON.stringify({ status: 'PASSED', checks, errors, limits: ['Synthetic API, no live Google auth or class writes', 'Chromium software WebGL; no physical device or medical certification'] }, null, 2));
  console.log(JSON.stringify({ checks }));
} catch (error) {
  await page?.screenshot({ path: `${directory}/browser-failure.png`, timeout: 5000 }).catch(() => {});
  writeFileSync(`${directory}/browser-results.json`, JSON.stringify({ status: 'FAILED', checks, errors, error: String(error) }, null, 2));
  throw error;
} finally {
  await browser?.close();
  if (server.exitCode === null) {
    const closed = once(server, 'exit');
    try { process.kill(-server.pid, 'SIGTERM'); } catch { /* already stopped */ }
    const timer = setTimeout(() => { try { process.kill(-server.pid, 'SIGKILL'); } catch { /* already stopped */ } }, 5000);
    await closed;
    clearTimeout(timer);
  }
}
