import { describe, it, expect } from 'vitest';
import { onRequest as createShare } from '../functions/api/share.js';
import { onRequest as readShare } from '../functions/api/share/[id].js';
import { isPagesDevHost } from '../functions/api/_share.js';

const SECRET = 'test-secret';

function memoryKv() {
  const store = new Map();
  return {
    store,
    async get(key) { return store.has(key) ? store.get(key) : null; },
    async put(key, value) { store.set(key, value); }
  };
}

function createRequest(host) {
  return new Request(`https://${host}/api/share`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: `https://${host}` },
    body: JSON.stringify({ version: 1, rows: [] })
  });
}

function create(host, env) {
  return createShare({ request: createRequest(host), env });
}

describe('isPagesDevHost', () => {
  it('matches pages.dev hosts only', () => {
    expect(isPagesDevHost('project.pages.dev')).toBe(true);
    expect(isPagesDevHost('abc123.project.pages.dev')).toBe(true);
    expect(isPagesDevHost('PROJECT.PAGES.DEV')).toBe(true);
    expect(isPagesDevHost('project.pages.dev.')).toBe(true);
    expect(isPagesDevHost('pages.dev.example.com')).toBe(false);
    expect(isPagesDevHost('mypages.dev')).toBe(false);
    expect(isPagesDevHost('localhost')).toBe(false);
    expect(isPagesDevHost('')).toBe(false);
  });
});

describe('POST /api/share host check', () => {
  for (const host of ['project.pages.dev', 'abc123.project.pages.dev']) {
    it(`refuses creation on ${host}`, async () => {
      const env = { SHARES: memoryKv(), SHARE_SIGNING_KEY: SECRET };
      const res = await create(host, env);
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.error).toMatch(/cannot be created/);
      expect(body.hostNotAllowed).toBe(true);
      expect(env.SHARES.store.size).toBe(0);
    });
  }

  for (const host of ['example.com', 'pages.dev.example.com', 'localhost:8788', '127.0.0.1:8788']) {
    it(`allows creation on ${host}`, async () => {
      const env = { SHARES: memoryKv(), SHARE_SIGNING_KEY: SECRET };
      const res = await create(host, env);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.id).toMatch(/^s[a-f0-9]{32}\.[a-f0-9]{24}$/);
      expect(env.SHARES.store.size).toBe(1);
    });
  }
});

describe('GET /api/share/:id on pages.dev', () => {
  it('still reads links that already exist', async () => {
    const env = { SHARES: memoryKv(), SHARE_SIGNING_KEY: SECRET };
    const created = await (await create('example.com', env)).json();

    for (const host of ['project.pages.dev', 'abc123.project.pages.dev']) {
      const request = new Request(`https://${host}/api/share/${created.id}`);
      const res = await readShare({ request, env, params: { id: created.id } });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ version: 1, rows: [] });
    }
  });
});
