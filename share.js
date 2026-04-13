// ── Share via short links / JSON fallback ──────────
const SHORT_SHARE_HASH_PREFIX = '#s=';
const SHARE_API_PATH = '/api/share';
let cachedShareFingerprint = '';
let cachedShareUrl = '';

function buildSharePayload(includeRoster) {
  const payload = { rows: rows };
  if (includeRoster) payload.roster = roster;
  return payload;
}

function getSharePageBase() {
  return window.location.origin !== 'null'
    ? window.location.origin + window.location.pathname
    : window.location.href.split('#')[0];
}

function buildShortShareUrl(id) {
  return getSharePageBase() + SHORT_SHARE_HASH_PREFIX + encodeURIComponent(id);
}

function clearShareHash() {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

function getShortShareId(hash) {
  if (!hash || !hash.startsWith(SHORT_SHARE_HASH_PREFIX)) return '';
  try {
    return decodeURIComponent(hash.slice(SHORT_SHARE_HASH_PREFIX.length)).trim();
  } catch {
    return '';
  }
}

function normalizeSharedRows(rawRows) {
  return rawRows.map(r => ({
    id: r.id || uid(),
    group: r.group || uid(),
    date: r.date || '',
    conductor: r.conductor || '',
    vip: r.vip || '',
    r4c: !!r.r4c,
    r4v: !!r.r4v,
    leftc: !!r.leftc,
    leftv: !!r.leftv
  }));
}

function applySharedPayload(payload) {
  pushUndo();

  rows.length = 0;
  const loaded = normalizeSharedRows(payload.rows || []);
  ensureNewestFirst(loaded);
  loaded.forEach(r => rows.push(r));
  saveData();

  Object.keys(roster).forEach(k => delete roster[k]);
  if (payload.roster && typeof payload.roster === 'object') {
    Object.keys(payload.roster).forEach(k => {
      roster[k] = payload.roster[k];
    });
  }
  saveRoster();
  highlightedRosterKey = '';
  saveHighlightedRosterKey();

  syncRosterFromTable();
  renderTable();
  renderRoster();
  flashButton(document.getElementById('shareBtn'), 'shareLoaded');
}

async function fetchSharedPayload(id) {
  const res = await fetch(`${SHARE_API_PATH}/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' }
  });
  const data = await res.json().catch(() => null);
  if (res.status === 404) return { missing: true };
  if (!res.ok) throw new Error((data && data.error) || t('shareError'));
  if (!data || !Array.isArray(data.rows)) throw new Error(t('shareError'));
  return { payload: data };
}

// ── Load from URL on page open ─────────────────────
async function loadFromUrl() {
  const shareId = getShortShareId(window.location.hash);
  if (!shareId) return;

  let payload = null;
  try {
    const result = await fetchSharedPayload(shareId);
    if (result.missing) {
      clearShareHash();
      alert(t('shareMissing'));
      return;
    }
    payload = result.payload;
  } catch (err) {
    clearShareHash();
    alert((err && err.message) || t('shareError'));
    return;
  }

  if (!payload || !payload.rows) return;

  const accepted = await showShareConfirm();
  if (!accepted) {
    clearShareHash();
    return;
  }

  applySharedPayload(payload);
  clearShareHash();
}

// ── Confirm modal ──────────────────────────────────
function showShareConfirm() {
  return new Promise(resolve => {
    const div = document.createElement('div');
    div.className = 'modal-overlay visible';
    div.id = 'shareConfirmOverlay';
    div.innerHTML = `
      <div class="modal">
        <h3>${escapeHtml(t('shareTitle'))}</h3>
        <p>${escapeHtml(t('shareLoadConfirm'))}</p>
        <div class="modal-actions">
          <button class="btn-cancel" id="shareConfirmNo">${escapeHtml(t('shareNo'))}</button>
          <button class="btn" id="shareConfirmYes">${escapeHtml(t('shareYes'))}</button>
        </div>
      </div>`;
    document.body.appendChild(div);

    function cleanup(result) {
      document.removeEventListener('keydown', onKey);
      div.remove();
      resolve(result);
    }

    function onKey(e) {
      if (e.key === 'Escape') cleanup(false);
    }

    div.querySelector('#shareConfirmYes').addEventListener('click', () => cleanup(true));
    div.querySelector('#shareConfirmNo').addEventListener('click', () => cleanup(false));
    div.addEventListener('click', e => { if (e.target === div) cleanup(false); });
    document.addEventListener('keydown', onKey);
  });
}

function getShareSnapshot() {
  const includeRoster = document.getElementById('shareIncludeRoster').checked;
  const payload = buildSharePayload(includeRoster);
  const json = JSON.stringify(payload);
  return { payload, json, fingerprint: json };
}

function clearCachedShare() {
  cachedShareFingerprint = '';
  cachedShareUrl = '';
}

function setShareWarn(message) {
  const warn = document.getElementById('shareWarn');
  if (message) {
    warn.textContent = message;
    warn.classList.add('visible');
  } else {
    warn.textContent = '';
    warn.classList.remove('visible');
  }
}

function updateShareInfo() {
  const snapshot = getShareSnapshot();
  document.getElementById('shareLinkInput').placeholder = t('shareLinkPlaceholder');
  document.getElementById('shareLinkInput').value =
    cachedShareFingerprint === snapshot.fingerprint ? cachedShareUrl : '';
  document.getElementById('shareSize').textContent =
    t('shareSize').replace('{size}', snapshot.json.length.toLocaleString());
  setShareWarn('');
}

async function createShortShareLink(snapshot) {
  if (cachedShareUrl && cachedShareFingerprint === snapshot.fingerprint) {
    return cachedShareUrl;
  }

  const res = await fetch(SHARE_API_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: snapshot.json
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) || t('shareWarn'));
  }
  if (!data || !data.id) {
    throw new Error(t('shareError'));
  }

  cachedShareFingerprint = snapshot.fingerprint;
  cachedShareUrl = buildShortShareUrl(data.id);
  return cachedShareUrl;
}

// ── Share modal ────────────────────────────────────
function openShareModal() {
  const overlay = document.getElementById('shareModalOverlay');
  const copyBtn = document.getElementById('shareCopyBtn');
  const downloadBtn = document.getElementById('shareDownloadBtn');
  const closeBtn = document.getElementById('shareModalClose');
  const includeRoster = document.getElementById('shareIncludeRoster');

  document.getElementById('shareModalTitle').textContent = t('shareTitle');
  document.getElementById('shareModalDesc').textContent = t('shareDesc');
  document.getElementById('shareIncludeRosterLabel').textContent = t('shareIncludeRoster');
  copyBtn.textContent = t('shareCopy');
  downloadBtn.textContent = t('shareDownload');
  closeBtn.textContent = t('shareClose');

  clearCachedShare();
  updateShareInfo();
  overlay.classList.add('visible');

  function cleanup() {
    overlay.classList.remove('visible');
    copyBtn.disabled = false;
    copyBtn.classList.remove('btn-success');
    copyBtn.textContent = t('shareCopy');
    copyBtn.removeEventListener('click', onCopy);
    downloadBtn.removeEventListener('click', onDownload);
    closeBtn.removeEventListener('click', onClose);
    includeRoster.removeEventListener('change', onChange);
    overlay.removeEventListener('click', onOverlay);
    document.removeEventListener('keydown', onKey);
  }

  async function onCopy() {
    const input = document.getElementById('shareLinkInput');
    copyBtn.disabled = true;
    copyBtn.classList.remove('btn-success');
    copyBtn.textContent = t('shareCreating');
    setShareWarn('');

    try {
      const url = await createShortShareLink(getShareSnapshot());
      input.value = url;
      await copyToClipboard(url);
      copyBtn.textContent = t('shareCopied');
      copyBtn.classList.add('btn-success');
      setTimeout(() => {
        copyBtn.classList.remove('btn-success');
        copyBtn.textContent = t('shareCopy');
        copyBtn.disabled = false;
      }, 1500);
    } catch (err) {
      copyBtn.textContent = t('shareCopy');
      copyBtn.disabled = false;
      setShareWarn((err && err.message) || t('shareError'));
    }
  }

  function onDownload() {
    const payload = buildSharePayload(includeRoster.checked);
    const json = JSON.stringify(payload, null, 2);
    downloadFile('schedule-share.json', json, 'application/json');
  }

  function onChange() {
    clearCachedShare();
    updateShareInfo();
  }
  function onClose() { cleanup(); }
  function onOverlay(e) { if (e.target === overlay) cleanup(); }
  function onKey(e) { if (e.key === 'Escape') cleanup(); }

  copyBtn.addEventListener('click', onCopy);
  downloadBtn.addEventListener('click', onDownload);
  closeBtn.addEventListener('click', onClose);
  includeRoster.addEventListener('change', onChange);
  overlay.addEventListener('click', onOverlay);
  document.addEventListener('keydown', onKey);
}

document.getElementById('shareBtn').addEventListener('click', openShareModal);
