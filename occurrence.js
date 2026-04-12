// ── Occurrence state ────────────────────────────────
const OCC_KEY = 'schedule_occ';
const occ = Object.assign(
  { enabled: false, windowSize: 7, windowStart: 0 },
  JSON.parse(localStorage.getItem(OCC_KEY) || '{}')
);
function saveOcc() { localStorage.setItem(OCC_KEY, JSON.stringify(occ)); }

// ── Occurrence helpers ─────────────────────────────────
function getOrderedGroups() {
  const groups = [];
  let idx = 0;
  while (idx < rows.length) {
    const g = rows[idx].group;
    const indices = [];
    let c = idx;
    while (c < rows.length && rows[c].group === g) { indices.push(c); c++; }
    groups.push({ group: g, indices });
    idx = c;
  }
  return groups;
}

function getOccWindow() {
  const groups = getOrderedGroups();
  const total = groups.length;
  const size = Math.min(occ.windowSize, total);
  occ.windowStart = Math.max(0, Math.min(occ.windowStart, total - size));
  const active = groups.slice(occ.windowStart, occ.windowStart + size);
  const windowIndices = new Set();
  active.forEach(g => g.indices.forEach(i => windowIndices.add(i)));
  return { groups, total, size, active, windowIndices };
}

function buildCounts(activeGroups, field) {
  const counts = new Map();
  activeGroups.forEach(g => {
    g.indices.forEach(i => {
      const val = nameKey(rows[i][field]);
      if (!val) return;
      counts.set(val, (counts.get(val) || 0) + 1);
    });
  });
  return counts;
}

function buildGeneralCounts(activeGroups) {
  const counts = new Map();
  activeGroups.forEach(g => {
    g.indices.forEach(i => {
      const c = nameKey(rows[i].conductor);
      const v = nameKey(rows[i].vip);
      if (c) counts.set(c, (counts.get(c) || 0) + 1);
      if (v) counts.set(v, (counts.get(v) || 0) + 1);
    });
  });
  return counts;
}

function occClass(value, counts) {
  if (!counts || !value) return '';
  const n = counts.get(nameKey(value)) || 0;
  if (n < 2) return '';
  return 'occ-' + Math.min(n, 5);
}

function renderOccStats(generalCounts, cCounts, vCounts) {
  const panel = document.getElementById('occStats');
  const body = document.getElementById('occStatsBody');
  document.getElementById('occStatsTitle').textContent = t('occStats');
  panel.classList.toggle('visible', occ.enabled);
  if (!occ.enabled) return;

  const nameMap = new Map();
  const addName = (val) => {
    if (!val) return;
    const k = nameKey(val);
    if (k && !nameMap.has(k)) nameMap.set(k, extractName(val));
  };
  rows.forEach(r => { addName(r.conductor); addName(r.vip); });

  const entries = [];
  for (const [key, display] of nameMap) {
    const total = generalCounts.get(key) || 0;
    if (total < 2) continue;
    const cN = cCounts.get(key) || 0;
    const vN = vCounts.get(key) || 0;
    entries.push({ display, total, cN, vN, cls: 'occ-' + Math.min(total, 5) });
  }
  entries.sort((a, b) => b.total - a.total || a.display.localeCompare(b.display));

  if (!entries.length) {
    body.innerHTML = `<div class="occ-stats-empty">${escapeHtml(t('occNoData'))}</div>`;
    return;
  }

  const cLabel = t('occCond');
  const vLabel = t('occVip');
  body.innerHTML = entries.map(e =>
    `<div class="occ-stats-row">` +
      `<span class="occ-stats-name ${e.cls}">${escapeHtml(e.display)}</span>` +
      `<span class="occ-stats-counts">` +
        `<span class="occ-stats-total ${e.cls}">${e.total}</span>` +
        (e.cN ? `<span class="occ-stats-badge cond">${cLabel} ${e.cN}</span>` : '') +
        (e.vN ? `<span class="occ-stats-badge vip">${vLabel} ${e.vN}</span>` : '') +
      `</span>` +
    `</div>`
  ).join('');
}

function syncOccUi(w) {
  document.getElementById('occToggle').classList.toggle('active', occ.enabled);
  document.getElementById('occToggle').textContent = t('occToggle');
  document.getElementById('occExtras').classList.toggle('visible', occ.enabled);
  document.getElementById('occWindow').value = String(occ.windowSize);
  document.getElementById('occUp').disabled = !occ.enabled || occ.windowStart <= 0;
  document.getElementById('occDown').disabled = !occ.enabled || occ.windowStart >= w.total - w.size;
}

// ── Occurrence controls ─────────────────────────────
document.getElementById('occToggle').addEventListener('click', () => {
  occ.enabled = !occ.enabled;
  occ.windowStart = 0;
  saveOcc();
  syncOccUi(occ.enabled ? getOccWindow() : { total: 0, size: 0 });
  renderTable();
});

document.getElementById('occWindow').addEventListener('change', (e) => {
  occ.windowSize = parseInt(e.target.value);
  occ.windowStart = 0;
  saveOcc();
  renderTable();
});

document.getElementById('occUp').addEventListener('click', () => {
  if (occ.windowStart > 0) { occ.windowStart--; saveOcc(); renderTable(); }
});

document.getElementById('occDown').addEventListener('click', () => {
  const w = getOccWindow();
  if (occ.windowStart < w.total - w.size) { occ.windowStart++; saveOcc(); renderTable(); }
});

// ── Occurrence window drag ──────────────────────────
(function() {
  let dragging = false, startY = 0, startWinStart = 0, rowHeight = 0;
  let longPressTimer = null, touchReady = false;
  const LONG_PRESS_MS = 350;
  const MOVE_THRESHOLD = 8;

  function getAvgRowHeight() {
    const trs = tbody.querySelectorAll('tr.in-window');
    if (!trs.length) return 36;
    const first = trs[0].getBoundingClientRect();
    const last = trs[trs.length - 1].getBoundingClientRect();
    return (last.bottom - first.top) / trs.length;
  }

  function startDrag(y) {
    dragging = true;
    startY = y;
    startWinStart = occ.windowStart;
    rowHeight = getAvgRowHeight();
    document.body.classList.remove('occ-drag-ready');
    document.body.classList.add('occ-dragging');
  }

  function moveDrag(y) {
    const dy = y - startY;
    const delta = Math.round(dy / rowHeight);
    const w = getOccWindow();
    const maxStart = w.total - w.size;
    const newStart = Math.max(0, Math.min(startWinStart + delta, maxStart));
    if (newStart !== occ.windowStart) {
      occ.windowStart = newStart;
      renderTable();
    }
  }

  function endDrag() {
    dragging = false;
    touchReady = false;
    clearTimeout(longPressTimer);
    document.body.classList.remove('occ-dragging', 'occ-drag-ready');
    saveOcc();
  }

  // Mouse (desktop): instant drag
  tbody.addEventListener('mousedown', (e) => {
    if (!occ.enabled) return;
    const tr = e.target.closest('tr.in-window');
    if (!tr) return;
    if (e.target.closest('button') || e.target.closest('input')) return;
    startDrag(e.clientY);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    moveDrag(e.clientY);
  });

  document.addEventListener('mouseup', () => {
    if (dragging) endDrag();
  });

  // Touch (mobile): long-press → drag
  let touchStartY = 0, touchStartX = 0;

  tbody.addEventListener('touchstart', (e) => {
    if (!occ.enabled) return;
    const tr = e.target.closest('tr.in-window');
    if (!tr) return;
    if (e.target.closest('button') || e.target.closest('input')) return;

    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
    touchReady = false;

    longPressTimer = setTimeout(() => {
      touchReady = true;
      document.body.classList.add('occ-drag-ready');
      if (navigator.vibrate) navigator.vibrate(30);
    }, LONG_PRESS_MS);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const t = e.touches[0];
    if (longPressTimer && !touchReady) {
      const dx = Math.abs(t.clientX - touchStartX);
      const dy = Math.abs(t.clientY - touchStartY);
      if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      return;
    }
    if (touchReady && !dragging) {
      startDrag(t.clientY);
      e.preventDefault();
    }
    if (dragging) {
      moveDrag(t.clientY);
      e.preventDefault();
    }
  }, { passive: false });

  document.addEventListener('touchend', () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    if (dragging || touchReady) endDrag();
  });

  document.addEventListener('touchcancel', () => {
    clearTimeout(longPressTimer);
    longPressTimer = null;
    if (dragging || touchReady) endDrag();
  });
})();
