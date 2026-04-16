import { describe, it, expect } from 'vitest';
import {
  createShareId,
  isValidShareId,
  isPendingShareId,
  createShareToken,
  resolveShareToken,
  hasShareSigningKeys,
  parseStoredShare,
  SHARE_TTL_SECONDS
} from '../functions/api/_share.js';

const SECRET = 'test-secret';

function hex(len) {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[i % 16];
  return out;
}

describe('createShareId', () => {
  it('produces an s-prefixed 33-char id', () => {
    const id = createShareId();
    expect(id).toMatch(/^s[a-f0-9]{32}$/);
  });

  it('yields unique ids across calls', () => {
    const ids = new Set();
    for (let i = 0; i < 32; i++) ids.add(createShareId());
    expect(ids.size).toBe(32);
  });

  it('embeds a recent timestamp in the first 8 hex chars', () => {
    const id = createShareId();
    const ts = parseInt(id.slice(1, 9), 16);
    const now = Math.floor(Date.now() / 1000);
    expect(Math.abs(now - ts)).toBeLessThan(5);
  });
});

describe('isValidShareId', () => {
  it('accepts legacy unsigned 32-hex ids', () => {
    expect(isValidShareId(hex(32))).toBe(true);
  });

  it('rejects s-prefixed ids (those are signed-token bodies, not bare ids)', () => {
    expect(isValidShareId('s' + hex(32))).toBe(false);
  });

  it('rejects non-hex and wrong lengths', () => {
    expect(isValidShareId(hex(31))).toBe(false);
    expect(isValidShareId(hex(33))).toBe(false);
    expect(isValidShareId('zzzz' + hex(28))).toBe(false);
    expect(isValidShareId('')).toBe(false);
    expect(isValidShareId(null)).toBe(false);
    expect(isValidShareId(undefined)).toBe(false);
  });
});

describe('isPendingShareId', () => {
  it('returns true for a freshly-minted id', () => {
    const id = createShareId();
    expect(isPendingShareId(id)).toBe(true);
  });

  it('returns false for an id whose embedded timestamp is far in the past', () => {
    // Timestamp from 2020-01-01 ≈ 0x5e0be100
    const id = 's5e0be100' + hex(24);
    expect(isPendingShareId(id)).toBe(false);
  });

  it('returns false for bare (unprefixed) legacy ids', () => {
    expect(isPendingShareId(hex(32))).toBe(false);
  });

  it('returns false for malformed values', () => {
    expect(isPendingShareId(null)).toBe(false);
    expect(isPendingShareId('')).toBe(false);
    expect(isPendingShareId('s' + hex(31))).toBe(false);
  });
});

describe('hasShareSigningKeys', () => {
  it('returns false for empty / non-string values', () => {
    expect(hasShareSigningKeys('')).toBe(false);
    expect(hasShareSigningKeys('   ')).toBe(false);
    expect(hasShareSigningKeys(null)).toBe(false);
    expect(hasShareSigningKeys(undefined)).toBe(false);
  });

  it('returns true for a single key', () => {
    expect(hasShareSigningKeys('abc')).toBe(true);
  });

  it('returns true for comma- and newline-separated key lists', () => {
    expect(hasShareSigningKeys('k1,k2,k3')).toBe(true);
    expect(hasShareSigningKeys('k1\nk2')).toBe(true);
  });
});

describe('createShareToken / resolveShareToken round trip', () => {
  it('signs with a 24-hex signature', async () => {
    const id = createShareId();
    const token = await createShareToken(id, SECRET);
    const [tokId, sig] = token.split('.');
    expect(tokId).toBe(id);
    expect(sig).toMatch(/^[a-f0-9]{24}$/);
  });

  it('verifies a freshly-signed token', async () => {
    const id = createShareId();
    const token = await createShareToken(id, SECRET);
    const resolved = await resolveShareToken(token, SECRET);
    expect(resolved).toEqual({ valid: true, id, signed: true });
  });

  it('rejects a token signed with a different key', async () => {
    const id = createShareId();
    const token = await createShareToken(id, SECRET);
    const resolved = await resolveShareToken(token, 'other-secret');
    expect(resolved.valid).toBe(false);
  });

  it('accepts the first matching key when multiple are configured', async () => {
    const id = createShareId();
    const token = await createShareToken(id, 'old-key');
    const resolved = await resolveShareToken(token, 'new-key\nold-key');
    expect(resolved).toEqual({ valid: true, id, signed: true });
  });

  it('accepts a legacy 12-hex signature during the rotation window', async () => {
    // Reconstruct a legacy signature by importing the same key and manually
    // truncating to 12 hex chars.
    const id = createShareId();
    const keyData = new TextEncoder().encode(SECRET);
    const cryptoKey = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sigBytes = new Uint8Array(
      await crypto.subtle.sign('HMAC', cryptoKey, new TextEncoder().encode(id))
    );
    const legacySig = Array.from(sigBytes.slice(0, 6))
      .map(b => b.toString(16).padStart(2, '0')).join('');
    const legacyToken = `${id}.${legacySig}`;

    const resolved = await resolveShareToken(legacyToken, SECRET);
    expect(resolved).toEqual({ valid: true, id, signed: true });
  });

  it('rejects signatures of unsupported lengths (e.g. 16 hex)', async () => {
    const id = createShareId();
    const resolved = await resolveShareToken(`${id}.${hex(16)}`, SECRET);
    expect(resolved.valid).toBe(false);
  });

  it('resolves a bare legacy 32-hex id without a signature', async () => {
    const legacy = hex(32);
    const resolved = await resolveShareToken(legacy, SECRET);
    expect(resolved).toEqual({ valid: true, id: legacy, signed: false });
  });

  it('rejects garbage token values', async () => {
    for (const bad of ['', null, undefined, 'not-a-token', 'abc.def']) {
      const r = await resolveShareToken(bad, SECRET);
      expect(r.valid).toBe(false);
    }
  });
});

describe('parseStoredShare', () => {
  it('returns null for empty / malformed inputs', () => {
    expect(parseStoredShare('')).toBe(null);
    expect(parseStoredShare(null)).toBe(null);
    expect(parseStoredShare('not json')).toBe(null);
  });

  it('unwraps the stored envelope shape', () => {
    const stored = JSON.stringify({
      createdAt: '2025-01-01T00:00:00.000Z',
      payload: { rows: [] }
    });
    expect(parseStoredShare(stored)).toEqual({ rows: [] });
  });

  it('accepts the bare legacy shape and sanitizes it', () => {
    const bare = JSON.stringify({
      rows: [{
        id: 'abc', group: 'g1', date: '2025-04-16',
        conductor: 'Alice', vip: 'Bob',
        r4c: true, r4v: false, leftc: false, leftv: true
      }]
    });
    const parsed = parseStoredShare(bare);
    expect(parsed).toBeTruthy();
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]).toMatchObject({
      id: 'abc', conductor: 'Alice', vip: 'Bob',
      r4c: true, r4v: false, leftc: false, leftv: true
    });
  });

  it('rejects shapes with too many rows (sanitization fail path)', () => {
    const rows = Array.from({ length: 3000 }, (_, i) => ({
      id: String(i), group: 'g', date: '', conductor: '', vip: '',
      r4c: false, r4v: false, leftc: false, leftv: false
    }));
    const stored = JSON.stringify({ rows });
    expect(parseStoredShare(stored)).toBe(null);
  });
});

describe('parseStoredShare schema version (bare-legacy path)', () => {
  function bare(extra) {
    return JSON.stringify({ rows: [], ...extra });
  }

  it('defaults to version 0 when field absent', () => {
    const parsed = parseStoredShare(bare({}));
    expect(parsed).toBeTruthy();
    expect(parsed.version).toBe(0);
  });

  it('preserves a valid integer version', () => {
    const parsed = parseStoredShare(bare({ version: 1 }));
    expect(parsed).toEqual({ rows: [], version: 1 });
  });

  it('accepts boundary values 0 and 99', () => {
    expect(parseStoredShare(bare({ version: 0 })).version).toBe(0);
    expect(parseStoredShare(bare({ version: 99 })).version).toBe(99);
  });

  it('rejects out-of-range versions', () => {
    expect(parseStoredShare(bare({ version: -1 }))).toBe(null);
    expect(parseStoredShare(bare({ version: 100 }))).toBe(null);
  });

  it('rejects non-integer version values', () => {
    expect(parseStoredShare(bare({ version: 1.5 }))).toBe(null);
    expect(parseStoredShare(bare({ version: '1' }))).toBe(null);
    expect(parseStoredShare(bare({ version: true }))).toBe(null);
    expect(parseStoredShare(bare({ version: null }))).toBe(null);
    expect(parseStoredShare(bare({ version: NaN }))).toBe(null);
  });
});

describe('parseStoredShare envelope path (trust-stored contract)', () => {
  // Envelope shape is produced by the server and NOT re-sanitized on read,
  // so arbitrary version values pass through. This encodes that contract
  // so a future regression (e.g. adding validation on the envelope path
  // without versioning KV entries) is caught.
  it('passes version through unchanged on the envelope path', () => {
    const stored = JSON.stringify({
      createdAt: '2025-01-01T00:00:00.000Z',
      payload: { rows: [], version: 7 }
    });
    expect(parseStoredShare(stored)).toEqual({ rows: [], version: 7 });
  });

  it('tolerates envelope payloads with no version field', () => {
    const stored = JSON.stringify({
      createdAt: '2025-01-01T00:00:00.000Z',
      payload: { rows: [] }
    });
    const parsed = parseStoredShare(stored);
    expect(parsed).toEqual({ rows: [] });
    expect(parsed.version).toBeUndefined();
  });
});

describe('SHARE_TTL_SECONDS', () => {
  it('is 30 days', () => {
    expect(SHARE_TTL_SECONDS).toBe(60 * 60 * 24 * 30);
  });
});
