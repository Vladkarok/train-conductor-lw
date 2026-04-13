const SHARE_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAX_PAYLOAD_BYTES = 256 * 1024;
const MAX_ROWS = 2000;
const MAX_ROSTER_ENTRIES = 2000;
const MAX_TEXT_LENGTH = 160;

export { SHARE_TTL_SECONDS };

export function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    }
  });
}

export function methodNotAllowed(allow) {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: {
      Allow: allow,
      'cache-control': 'no-store'
    }
  });
}

export function missingBindingResponse() {
  return jsonResponse({
    error: 'Cloudflare KV binding "SHARES" is not configured for this Pages project.'
  }, 500);
}

export function createShareId() {
  return crypto.randomUUID().replace(/-/g, '');
}

export function isValidShareId(value) {
  return typeof value === 'string' && /^[a-f0-9]{32}$/i.test(value);
}

export function validateShareCreateRequest(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!/^application\/json\b/i.test(contentType)) {
    return { error: 'Share requests must use application/json.', status: 415 };
  }

  const fetchSite = (request.headers.get('sec-fetch-site') || '').toLowerCase();
  if (fetchSite && !['same-origin', 'same-site', 'none'].includes(fetchSite)) {
    return { error: 'Cross-site share creation is not allowed.', status: 403 };
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      const requestOrigin = new URL(request.url).origin;
      if (new URL(origin).origin !== requestOrigin) {
        return { error: 'Cross-origin share creation is not allowed.', status: 403 };
      }
    } catch {
      return { error: 'Invalid Origin header.', status: 400 };
    }
  }

  return null;
}

export async function parseShareRequest(request) {
  const raw = await request.text();
  const byteLength = new TextEncoder().encode(raw).length;

  if (!raw.trim()) {
    return { error: 'Request body is empty.', status: 400 };
  }
  if (byteLength > MAX_PAYLOAD_BYTES) {
    return { error: 'Share payload is too large.', status: 413 };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: 'Invalid JSON payload.', status: 400 };
  }

  const payload = sanitizeSharePayload(parsed);
  if (!payload) {
    return { error: 'Invalid share payload.', status: 400 };
  }

  return { payload };
}

export function parseStoredShare(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.payload && Array.isArray(parsed.payload.rows)) {
      return parsed.payload;
    }
    if (parsed && Array.isArray(parsed.rows)) {
      return sanitizeSharePayload(parsed);
    }
  } catch {}
  return null;
}

function sanitizeSharePayload(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.rows)) {
    return null;
  }
  if (value.rows.length > MAX_ROWS) {
    return null;
  }

  const rows = value.rows.map(sanitizeRow).filter(Boolean);
  if (rows.length !== value.rows.length) {
    return null;
  }

  const payload = { rows };

  if (value.roster !== undefined) {
    const roster = sanitizeRoster(value.roster);
    if (!roster) {
      return null;
    }
    payload.roster = roster;
  }

  return payload;
}

function sanitizeRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return null;
  }

  return {
    id: sanitizeText(row.id, 40),
    group: sanitizeText(row.group, 40),
    date: sanitizeText(row.date, 20),
    conductor: sanitizeText(row.conductor, MAX_TEXT_LENGTH),
    vip: sanitizeText(row.vip, MAX_TEXT_LENGTH),
    r4c: !!row.r4c,
    r4v: !!row.r4v,
    leftc: !!row.leftc,
    leftv: !!row.leftv
  };
}

function sanitizeRoster(roster) {
  if (!roster || typeof roster !== 'object' || Array.isArray(roster)) {
    return null;
  }

  const keys = Object.keys(roster);
  if (keys.length > MAX_ROSTER_ENTRIES) {
    return null;
  }

  const clean = {};
  for (const key of keys) {
    const entry = roster[key];
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return null;
    }
    const safeKey = sanitizeKey(key);
    if (!safeKey) {
      return null;
    }
    clean[safeKey] = {
      display: sanitizeText(entry.display, MAX_TEXT_LENGTH),
      r4: !!entry.r4,
      left: !!entry.left
    };
  }

  return clean;
}

function sanitizeKey(value) {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().slice(0, 80);
}

function sanitizeText(value, maxLength) {
  return typeof value === 'string' ? value.slice(0, maxLength) : '';
}
