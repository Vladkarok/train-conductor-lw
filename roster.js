// ── Roster ──────────────────────────────────────────
const ROSTER_KEY = 'schedule_roster';
const ROSTER_VIS_KEY = 'schedule_roster_vis';
const ROSTER_HIGHLIGHT_KEY = 'schedule_roster_highlight';
let roster = {};
let rosterVisible = false;
let highlightedRosterKey = localStorage.getItem(ROSTER_HIGHLIGHT_KEY) || '';

function normalizeRosterEntry(entry) {
  if (!entry) return entry;
  if (entry.r4 === undefined) entry.r4 = false;
  if (entry.left === undefined) entry.left = false;
  return entry;
}

function loadRoster() {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (raw) roster = JSON.parse(raw);
  } catch {}
  Object.keys(roster).forEach(k => normalizeRosterEntry(roster[k]));
  // Migrate legacy keys that contain notes (e.g. "alice (backup)" → "alice")
  let migrated = false;
  Object.keys(roster).forEach(k => {
    const nk = nameKey(roster[k].display);
    if (nk && nk !== k) {
      if (roster[nk]) {
        roster[nk].r4 = roster[nk].r4 || roster[k].r4;
        roster[nk].left = roster[nk].left || roster[k].left;
      } else {
        roster[nk] = { display: extractName(roster[k].display), r4: roster[k].r4, left: roster[k].left };
      }
      delete roster[k];
      migrated = true;
    }
  });
  if (migrated) saveRoster();
  rosterVisible = localStorage.getItem(ROSTER_VIS_KEY) === '1';
  document.getElementById('rosterToggle').classList.toggle('active', rosterVisible);
  renderRoster();
}
function saveRoster() { localStorage.setItem(ROSTER_KEY, JSON.stringify(roster)); }
function saveHighlightedRosterKey() {
  if (highlightedRosterKey) {
    localStorage.setItem(ROSTER_HIGHLIGHT_KEY, highlightedRosterKey);
  } else {
    localStorage.removeItem(ROSTER_HIGHLIGHT_KEY);
  }
}

function addToRoster(name) {
  if (!name) return;
  const baseName = extractName(name);
  const key = baseName.toLowerCase();
  if (!key) return;
  if (!roster[key]) {
    roster[key] = { display: baseName, r4: false, left: false };
    saveRoster();
  }
}

function syncRosterMarksForKey(key) {
  if (!key || !roster[key]) return false;
  const nextR4 = rows.some(r => {
    const c = nameKey(r.conductor);
    const v = nameKey(r.vip);
    return (c === key && r.r4c) || (v === key && r.r4v);
  });
  const nextLeft = rows.some(r => {
    const c = nameKey(r.conductor);
    const v = nameKey(r.vip);
    return (c === key && r.leftc) || (v === key && r.leftv);
  });
  const changed = roster[key].r4 !== nextR4 || roster[key].left !== nextLeft;
  roster[key].r4 = nextR4;
  roster[key].left = nextLeft;
  return changed;
}

function syncRosterFromTable() {
  const r4Keys = new Set();
  const leftKeys = new Set();
  rows.forEach(r => {
    if (r.conductor) {
      addToRoster(r.conductor);
      if (r.r4c) {
        const key = nameKey(r.conductor);
        if (key) r4Keys.add(key);
      }
      if (r.leftc) {
        const key = nameKey(r.conductor);
        if (key) leftKeys.add(key);
      }
    }
    if (r.vip) {
      addToRoster(r.vip);
      if (r.r4v) {
        const key = nameKey(r.vip);
        if (key) r4Keys.add(key);
      }
      if (r.leftv) {
        const key = nameKey(r.vip);
        if (key) leftKeys.add(key);
      }
    }
  });

  let changed = false;
  r4Keys.forEach(key => {
    if (roster[key] && !roster[key].r4) {
      roster[key].r4 = true;
      changed = true;
    }
  });
  leftKeys.forEach(key => {
    if (roster[key] && !roster[key].left) {
      roster[key].left = true;
      changed = true;
    }
  });

  if (changed) saveRoster();
}

function getRosterStats() {
  const stats = {};
  Object.keys(roster).forEach(k => { stats[k] = { cond: 0, vip: 0 }; });
  rows.forEach(r => {
    const c = nameKey(r.conductor);
    const v = nameKey(r.vip);
    if (c && stats[c] !== undefined) stats[c].cond++;
    if (v && stats[v] !== undefined) stats[v].vip++;
  });
  return stats;
}

function renderRoster() {
  const panel = document.getElementById('rosterPanel');
  const body = document.getElementById('rosterBody');
  panel.classList.toggle('visible', rosterVisible);
  if (!rosterVisible) return;

  const stats = getRosterStats();
  const entries = Object.entries(roster).map(([key, val]) => {
    const s = stats[key] || { cond: 0, vip: 0 };
    return {
      key,
      display: val.display,
      r4: !!val.r4,
      left: !!val.left,
      cond: s.cond,
      vip: s.vip,
      total: s.cond + s.vip
    };
  });

  entries.sort((a, b) => {
    if (a.left !== b.left) return a.left ? 1 : -1;
    if (a.r4 !== b.r4) return a.r4 ? -1 : 1;
    if (a.total !== b.total) return b.total - a.total;
    return a.display.localeCompare(b.display);
  });

  if (!entries.length) {
    body.innerHTML = `<div class="roster-empty">${escapeHtml(t('rosterEmpty'))}</div>`;
    return;
  }

  const cLabel = t('occCond');
  const vLabel = t('occVip');
  body.innerHTML = entries.map(e =>
    `<div class="roster-row" data-key="${e.key}">` +
      ((e.r4 || e.left) ? `<span class="roster-marks">` +
        (e.r4 ? `<span class="roster-mark-badge roster-r4-toggle active">R4</span>` : '') +
        (e.left ? `<span class="roster-mark-badge roster-left-toggle active">${escapeHtml(t('leftBadge'))}</span>` : '') +
      `</span>` : '') +
      `<span class="roster-name${e.total === 0 ? ' zero' : ''}${e.left ? ' left' : ''}${e.key === highlightedRosterKey ? ' highlighted' : ''}" data-key="${e.key}" title="${escapeHtml(e.display)}">${escapeHtml(e.display)}</span>` +
      `<span class="roster-counts">` +
        `<span class="roster-total${e.total === 0 ? ' zero' : ''}">${e.total}</span>` +
        (e.cond ? `<span class="occ-stats-badge cond">${cLabel} ${e.cond}</span>` : '') +
        (e.vip ? `<span class="occ-stats-badge vip">${vLabel} ${e.vip}</span>` : '') +
      `</span>` +
      `<button class="roster-remove" data-key="${e.key}" title="Remove">&times;</button>` +
    `</div>`
  ).join('');
}

// ── Player mark context menu ─────────────────────────
(function() {
  let menu = null;

  function closeMenu() {
    if (menu) { menu.remove(); menu = null; }
  }

  function getRowMarkKey(field, mark) {
    return field === 'conductor' ? mark + 'c' : mark + 'v';
  }

  function setMark(index, field, mark, value) {
    const markKey = getRowMarkKey(field, mark);
    pushUndo();
    rows[index][markKey] = value;
    const key = nameKey(rows[index][field]);
    if (key && roster[key] && syncRosterMarksForKey(key)) {
      saveRoster();
    }
    saveData();
    renderTable();
    renderRoster();
  }

  function setMarkAll(name, mark, value) {
    const key = nameKey(name);
    pushUndo();
    rows.forEach(r => {
      if (nameKey(r.conductor) === key) r[mark + 'c'] = value;
      if (nameKey(r.vip) === key) r[mark + 'v'] = value;
    });
    if (roster[key] && syncRosterMarksForKey(key)) saveRoster();
    saveData();
    renderTable();
    renderRoster();
  }

  function appendMarkActions(mark, keys, index, field, name) {
    const markKey = getRowMarkKey(field, mark);
    const hasMark = rows[index][markKey];

    const btnThis = document.createElement('button');
    btnThis.textContent = t(hasMark ? keys.removeCell : keys.addCell);
    btnThis.addEventListener('click', () => {
      closeMenu();
      setMark(index, field, mark, !hasMark);
    });
    menu.appendChild(btnThis);

    const divider = document.createElement('div');
    divider.className = 'r4-menu-divider';
    menu.appendChild(divider);

    const btnAll = document.createElement('button');
    btnAll.textContent = t(hasMark ? keys.removeAll : keys.addAll).replace('{name}', name.trim());
    btnAll.addEventListener('click', () => {
      closeMenu();
      setMarkAll(name, mark, !hasMark);
    });
    menu.appendChild(btnAll);
  }

  function showPlayerMenu(x, y, index, field) {
    closeMenu();
    const row = rows[index];
    const name = field === 'conductor' ? row.conductor : row.vip;
    if (!name || !name.trim()) return;

    menu = document.createElement('div');
    menu.className = 'r4-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    appendMarkActions('r4', { addCell: 'r4ThisCell', addAll: 'r4AllCells', removeCell: 'r4Remove', removeAll: 'r4RemoveAll' }, index, field, name);

    const leftDivider = document.createElement('div');
    leftDivider.className = 'r4-menu-divider';
    menu.appendChild(leftDivider);

    appendMarkActions('left', { addCell: 'leftThisCell', addAll: 'leftAllCells', removeCell: 'leftRemove', removeAll: 'leftRemoveAll' }, index, field, name);

    // Rename option
    const divRename = document.createElement('div');
    divRename.className = 'r4-menu-divider';
    menu.appendChild(divRename);

    const btnRename = document.createElement('button');
    btnRename.textContent = t('renameAll').replace('{name}', name.trim());
    btnRename.addEventListener('click', () => {
      closeMenu();
      const newName = prompt(t('renamePrompt').replace('{name}', name.trim()), name.trim());
      if (newName && newName.trim() && newName.trim() !== name.trim()) {
        renamePlayer(name.trim(), newName.trim());
      }
    });
    menu.appendChild(btnRename);

    document.body.appendChild(menu);

    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (x - rect.width) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (y - rect.height) + 'px';
  }

  // Desktop: right-click
  tbody.addEventListener('contextmenu', (e) => {
    const cell = e.target.closest('.cell[data-field="conductor"], .cell[data-field="vip"]');
    if (!cell) return;
    const index = parseInt(cell.dataset.index);
    const field = cell.dataset.field;
    const name = rows[index][field];
    if (!name || !name.trim()) return;
    e.preventDefault();
    showPlayerMenu(e.clientX, e.clientY, index, field);
  });

  // Mobile: long-press (500ms)
  let r4Timer = null, r4StartX = 0, r4StartY = 0;
  const R4_HOLD_MS = 500;
  const R4_MOVE_THRESHOLD = 10;

  tbody.addEventListener('touchstart', (e) => {
    const cell = e.target.closest('.cell[data-field="conductor"], .cell[data-field="vip"]');
    if (!cell) return;
    if (e.target.closest('input') || e.target.closest('button')) return;
    const index = parseInt(cell.dataset.index);
    const field = cell.dataset.field;
    const name = rows[index][field];
    if (!name || !name.trim()) return;

    r4StartX = e.touches[0].clientX;
    r4StartY = e.touches[0].clientY;

    r4Timer = setTimeout(() => {
      r4Timer = null;
      if (navigator.vibrate) navigator.vibrate(30);
      showPlayerMenu(r4StartX, r4StartY, index, field);
    }, R4_HOLD_MS);
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!r4Timer) return;
    const dx = Math.abs(e.touches[0].clientX - r4StartX);
    const dy = Math.abs(e.touches[0].clientY - r4StartY);
    if (dx > R4_MOVE_THRESHOLD || dy > R4_MOVE_THRESHOLD) {
      clearTimeout(r4Timer);
      r4Timer = null;
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (r4Timer) { clearTimeout(r4Timer); r4Timer = null; }
  });

  document.addEventListener('click', (e) => {
    if (menu && !menu.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
})();

// ── Roster controls ─────────────────────────────────
document.getElementById('rosterToggle').addEventListener('click', () => {
  rosterVisible = !rosterVisible;
  localStorage.setItem(ROSTER_VIS_KEY, rosterVisible ? '1' : '0');
  document.getElementById('rosterToggle').classList.toggle('active', rosterVisible);
  renderRoster();
});

document.getElementById('rosterAddBtn').addEventListener('click', () => {
  const input = document.getElementById('rosterInput');
  const name = input.value.trim();
  if (name) {
    addToRoster(name);
    input.value = '';
    renderRoster();
  }
});

document.getElementById('rosterInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    document.getElementById('rosterAddBtn').click();
  }
});

document.getElementById('rosterBody').addEventListener('click', (e) => {
  // Remove
  const removeBtn = e.target.closest('.roster-remove');
  if (removeBtn) {
    const key = removeBtn.dataset.key;
    pushUndo();
    delete roster[key];
    saveRoster();
    renderRoster();
    return;
  }

  // Mark badges — no click action, use right-click/long-press instead
  if (e.target.closest('.roster-mark-badge')) return;

  // Click name → rename
  const nameEl = e.target.closest('.roster-name');
  if (nameEl) {
    const key = nameEl.dataset.key;
    if (!roster[key]) return;
    const oldName = roster[key].display;
    const newName = prompt(t('renamePrompt').replace('{name}', oldName), oldName);
    if (newName && newName.trim() && newName.trim() !== oldName) {
      renamePlayer(oldName, newName.trim());
    }
  }
});

// ── Roster mark context menu (right-click / long-press) ──
(function() {
  const body = document.getElementById('rosterBody');
  let longPressTimer = null;

  function toggleRosterHighlight(key) {
    highlightedRosterKey = highlightedRosterKey === key ? '' : key;
    saveHighlightedRosterKey();
    renderTable();
    renderRoster();
  }

  function showRosterMarkMenu(x, y, key) {
    if (!roster[key]) return;
    const hasR4 = roster[key].r4;
    const hasLeft = roster[key].left;
    const isHighlighted = highlightedRosterKey === key;
    const name = roster[key].display;

    // Reuse the existing R4 menu infrastructure
    const existing = document.querySelector('.r4-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'r4-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    const btn = document.createElement('button');
    btn.textContent = hasR4 ? t('rosterUnmarkR4') : t('rosterMarkR4');
    btn.addEventListener('click', () => {
      menu.remove();
      toggleR4Player(name);
    });
    menu.appendChild(btn);

    const divider = document.createElement('div');
    divider.className = 'r4-menu-divider';
    menu.appendChild(divider);

    const leftBtn = document.createElement('button');
    leftBtn.textContent = hasLeft ? t('rosterUnmarkLeft') : t('rosterMarkLeft');
    leftBtn.addEventListener('click', () => {
      menu.remove();
      toggleLeftPlayer(name);
    });
    menu.appendChild(leftBtn);

    const divider2 = document.createElement('div');
    divider2.className = 'r4-menu-divider';
    menu.appendChild(divider2);

    const highlightBtn = document.createElement('button');
    highlightBtn.textContent = isHighlighted ? t('rosterUnhighlight') : t('rosterHighlight');
    highlightBtn.addEventListener('click', () => {
      menu.remove();
      toggleRosterHighlight(key);
    });
    menu.appendChild(highlightBtn);

    document.body.appendChild(menu);

    // Clamp to viewport
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) menu.style.left = (window.innerWidth - rect.width - 8) + 'px';
    if (rect.bottom > window.innerHeight) menu.style.top = (window.innerHeight - rect.height - 8) + 'px';

    const close = (e) => {
      if (!menu.contains(e.target)) { menu.remove(); document.removeEventListener('click', close); }
    };
    setTimeout(() => document.addEventListener('click', close), 10);
  }

  function getRowKey(target) {
    const row = target.closest('.roster-row');
    return row ? row.dataset.key : null;
  }

  body.addEventListener('contextmenu', (e) => {
    const key = getRowKey(e.target);
    if (!key) return;
    e.preventDefault();
    showRosterMarkMenu(e.clientX, e.clientY, key);
  });

  // Long-press for mobile
  body.addEventListener('touchstart', (e) => {
    const key = getRowKey(e.target);
    if (!key) return;
    longPressTimer = setTimeout(() => {
      const touch = e.touches[0];
      showRosterMarkMenu(touch.clientX, touch.clientY, key);
    }, 500);
  });
  body.addEventListener('touchend', () => clearTimeout(longPressTimer));
  body.addEventListener('touchmove', () => clearTimeout(longPressTimer));
})();
