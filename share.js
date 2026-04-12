// ── Share via URL ──────────────────────────────────

function buildSharePayload(includeRoster) {
  const payload = { rows: rows };
  if (includeRoster) payload.roster = roster;
  return payload;
}

function encodeShareUrl(payload) {
  const json = JSON.stringify(payload);
  const compressed = LZString.compressToEncodedURIComponent(json);
  const base = window.location.origin !== 'null'
    ? window.location.origin + window.location.pathname
    : window.location.href.split('#')[0];
  return base + '#d=' + compressed;
}

function decodeShareHash(hash) {
  if (!hash || !hash.startsWith('#d=')) return null;
  try {
    const compressed = hash.slice(3);
    const json = LZString.decompressFromEncodedURIComponent(compressed);
    if (!json) return null;
    return JSON.parse(json);
  } catch { return null; }
}

// ── Load from URL on page open ─────────────────────
function loadFromUrl() {
  const payload = decodeShareHash(window.location.hash);
  if (!payload || !payload.rows) return;

  // Show confirmation modal
  showShareConfirm().then(accepted => {
    if (!accepted) {
      // Clear hash without reload
      history.replaceState(null, '', window.location.pathname);
      return;
    }

    pushUndo();

    // Load rows
    rows.length = 0;
    const loaded = payload.rows.map(r => ({
      id: r.id || uid(),
      group: r.group || uid(),
      date: r.date || '',
      conductor: r.conductor || '',
      vip: r.vip || '',
      r4c: !!r.r4c,
      r4v: !!r.r4v
    }));
    ensureNewestFirst(loaded);
    loaded.forEach(r => rows.push(r));
    saveData();

    // Load roster if present
    if (payload.roster) {
      Object.keys(roster).forEach(k => delete roster[k]);
      Object.keys(payload.roster).forEach(k => {
        roster[k] = payload.roster[k];
      });
      saveRoster();
    }

    syncRosterFromTable();
    renderTable();
    renderRoster();

    // Clear hash without reload
    history.replaceState(null, '', window.location.pathname);

    // Flash feedback
    flashButton(document.getElementById('shareBtn'), 'shareLoaded');
  });
}

// ── Confirm modal (reuse pattern) ──────────────────
function showShareConfirm() {
  return new Promise(resolve => {
    const overlay = document.getElementById('shareConfirmOverlay');
    if (!overlay) {
      // Create confirm overlay dynamically
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
        div.remove();
        resolve(result);
      }

      div.querySelector('#shareConfirmYes').addEventListener('click', () => cleanup(true));
      div.querySelector('#shareConfirmNo').addEventListener('click', () => cleanup(false));
      div.addEventListener('click', e => { if (e.target === div) cleanup(false); });
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { document.removeEventListener('keydown', esc); cleanup(false); }
      });
    }
  });
}

// ── Share modal ────────────────────────────────────
const SHARE_WARN_THRESHOLD = 4000;

function updateShareLink() {
  const includeRoster = document.getElementById('shareIncludeRoster').checked;
  const payload = buildSharePayload(includeRoster);
  const url = encodeShareUrl(payload);
  document.getElementById('shareLinkInput').value = url;
  document.getElementById('shareSize').textContent =
    t('shareSize').replace('{size}', url.length.toLocaleString());

  const warn = document.getElementById('shareWarn');
  if (url.length > SHARE_WARN_THRESHOLD) {
    warn.textContent = t('shareWarn').replace('{size}', url.length.toLocaleString());
    warn.classList.add('visible');
  } else {
    warn.classList.remove('visible');
  }
}

function openShareModal() {
  const overlay = document.getElementById('shareModalOverlay');
  document.getElementById('shareModalTitle').textContent = t('shareTitle');
  document.getElementById('shareModalDesc').textContent = t('shareDesc');
  document.getElementById('shareIncludeRosterLabel').textContent = t('shareIncludeRoster');
  document.getElementById('shareCopyBtn').textContent = t('shareCopy');
  document.getElementById('shareDownloadBtn').textContent = t('shareDownload');
  document.getElementById('shareModalClose').textContent = t('shareClose');

  updateShareLink();
  overlay.classList.add('visible');

  function cleanup() {
    overlay.classList.remove('visible');
    document.getElementById('shareCopyBtn').removeEventListener('click', onCopy);
    document.getElementById('shareDownloadBtn').removeEventListener('click', onDownload);
    document.getElementById('shareModalClose').removeEventListener('click', onClose);
    document.getElementById('shareIncludeRoster').removeEventListener('change', onChange);
    overlay.removeEventListener('click', onOverlay);
    document.removeEventListener('keydown', onKey);
  }

  function onCopy() {
    const input = document.getElementById('shareLinkInput');
    copyToClipboard(input.value).then(() => {
      const btn = document.getElementById('shareCopyBtn');
      btn.textContent = t('shareCopied');
      btn.classList.add('btn-success');
      setTimeout(() => {
        btn.textContent = t('shareCopy');
        btn.classList.remove('btn-success');
      }, 1500);
    });
  }

  function onDownload() {
    const includeRoster = document.getElementById('shareIncludeRoster').checked;
    const payload = buildSharePayload(includeRoster);
    const json = JSON.stringify(payload, null, 2);
    downloadFile('schedule-share.json', json, 'application/json');
  }

  function onChange() { updateShareLink(); }
  function onClose() { cleanup(); }
  function onOverlay(e) { if (e.target === overlay) cleanup(); }
  function onKey(e) { if (e.key === 'Escape') cleanup(); }

  document.getElementById('shareCopyBtn').addEventListener('click', onCopy);
  document.getElementById('shareDownloadBtn').addEventListener('click', onDownload);
  document.getElementById('shareModalClose').addEventListener('click', onClose);
  document.getElementById('shareIncludeRoster').addEventListener('change', onChange);
  overlay.addEventListener('click', onOverlay);
  document.addEventListener('keydown', onKey);
}

document.getElementById('shareBtn').addEventListener('click', openShareModal);
