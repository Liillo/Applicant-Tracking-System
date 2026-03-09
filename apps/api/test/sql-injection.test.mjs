import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../server.js';

let server;
let baseUrl;
let dbReachable = false;
let dbErrorText = '';

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;

  const probe = await fetch(`${baseUrl}/api/departments`);
  dbReachable = probe.status !== 500;
  if (!dbReachable) {
    dbErrorText = await probe.text();
  }
});

test.after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test('health endpoint stays available', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'ok');
});

test('login is not bypassed by SQL injection payloads', async (t) => {
  if (!dbReachable) {
    t.skip(`Skipping DB-backed assertion: ${dbErrorText || 'database unavailable'}`);
    return;
  }

  const payload = {
    email: "' OR '1'='1' --",
    password: "' OR '1'='1' --",
  };

  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  assert.equal(res.status, 401);
  const body = await res.json();
  assert.ok(!body.token, 'token should never be issued for injection payload');
});

test('public job search handles SQL injection strings safely', async (t) => {
  if (!dbReachable) {
    t.skip(`Skipping DB-backed assertion: ${dbErrorText || 'database unavailable'}`);
    return;
  }

  const attack = encodeURIComponent("' OR 1=1 --");
  const res = await fetch(`${baseUrl}/api/jobs?search=${attack}`);
  const text = await res.text();

  assert.equal(res.status, 200);
  assert.doesNotMatch(text.toLowerCase(), /sql|syntax error|postgres|sqlite/);
});

test('job by id does not treat SQL injection payload as executable query', async (t) => {
  if (!dbReachable) {
    t.skip(`Skipping DB-backed assertion: ${dbErrorText || 'database unavailable'}`);
    return;
  }

  const attackId = encodeURIComponent("' OR '1'='1");
  const res = await fetch(`${baseUrl}/api/jobs/${attackId}`);

  assert.equal(res.status, 404);
  const body = await res.json();
  assert.equal(body.error, 'Job not found');
});
