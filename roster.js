// ── Roster ──────────────────────────────────────────
const ROSTER_KEY = 'schedule_roster';
const ROSTER_VIS_KEY = 'schedule_roster_vis';
let roster = {};
let rosterVisible = false;

function loadRoster() {
  try {
    const raw = localStorage.getItem(ROSTER_KEY);
    if (raw) roster = JSON.parse(raw);
  } catch {}
  // Migrate legacy keys that contain notes (e.g. "alice (backup)" → "alice")
  let migrated = false;
  Object.keys(roster).forEach(k => {
    const nk = nameKey(roster[k].display);
    if (nk && nk !== k) {
      if (roster[nk]) {
        roster[nk].r4 = roster[nk].r4 || roster[k].r4;
      } else {
        roster[nk] = { display: extractName(roster[k].display), r4: roster[k].r4 };
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

function addToRoster(name) {
  if (!name) return;
  const baseName = extractName(name);
  const key = baseName.toLowerCase();
  if (!key) return;
  if (!roster[key]) {
    roster[key] = { display: baseName, r4: false };
    saveRoster();
  }
}

function syncRosterFromTable() {
  rows.forEach(r => {
    if (r.conductor) addToRoster(r.conductor);
    if (r.vip) addToRoster(r.vip);
  });
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
    return { key, display: val.display, r4: val.r4, cond: s.cond, vip: s.vip, total: s.cond + s.vip };
  });

  entries.sort((a, b) => {
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
      (e.r4 ? `<span class="roster-r4-toggle active">R4</span>` : '') +
      `<span class="roster-name${e.total === 0 ? ' zero' : ''}" data-key="${e.key}" title="${escapeHtml(e.display)}">${escapeHtml(e.display)}</span>` +
      `<span class="roster-counts">` +
        `<span class="roster-total${e.total === 0 ? ' zero' : ''}">${e.total}</span>` +
        (e.cond ? `<span class="occ-stats-badge cond">${cLabel} ${e.cond}</span>` : '') +
        (e.vip ? `<span class="occ-stats-badge vip">${vLabel} ${e.vip}</span>` : '') +
      `</span>` +
      `<button class="roster-remove" data-key="${e.key}" title="Remove">&times;</button>` +
    `</div>`
  ).join('');
}

// ── R4 context menu ──────────────────────────────────
(function() {
  let menu = null;

  function closeMenu() {
    if (menu) { menu.remove(); menu = null; }
  }

  function setR4(index, field, value) {
    const r4Key = field === 'conductor' ? 'r4c' : 'r4v';
    pushUndo();
    rows[index][r4Key] = value;
    const key = nameKey(rows[index][field]);
    if (key && roster[key]) {
      roster[key].r4 = rows.some(r => {
        const c = nameKey(r.conductor);
        const v = nameKey(r.vip);
        return (c === key && r.r4c) || (v === key && r.r4v);
      });
      saveRoster();
    }
    saveData();
    renderTable();
    renderRoster();
  }

  function setR4All(name, field, value) {
    const key = nameKey(name);
    pushUndo();
    rows.forEach(r => {
      if (field === 'conductor' && nameKey(r.conductor) === key) r.r4c = value;
      if (field === 'vip' && nameKey(r.vip) === key) r.r4v = value;
    });
    rows.forEach(r => {
      if (field !== 'conductor' && nameKey(r.conductor) === key) r.r4c = value;
      if (field !== 'vip' && nameKey(r.vip) === key) r.r4v = value;
    });
    if (roster[key]) { roster[key].r4 = value; saveRoster(); }
    saveData();
    renderTable();
    renderRoster();
  }

  function showR4Menu(x, y, index, field) {
    closeMenu();
    const row = rows[index];
    const name = field === 'conductor' ? row.conductor : row.vip;
    if (!name || !name.trim()) return;

    const r4Key = field === 'conductor' ? 'r4c' : 'r4v';
    const hasR4 = row[r4Key];

    menu = document.createElement('div');
    menu.className = 'r4-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    if (hasR4) {
      const btnThis = document.createElement('button');
      btnThis.textContent = t('r4Remove');
      btnThis.addEventListener('click', () => { closeMenu(); setR4(index, field, false); });
      menu.appendChild(btnThis);

      const divider = document.createElement('div');
      divider.className = 'r4-menu-divider';
      menu.appendChild(divider);

      const btnAll = document.createElement('button');
      btnAll.textContent = t('r4RemoveAll').replace('{name}', name.trim());
      btnAll.addEventListener('click', () => { closeMenu(); setR4All(name, field, false); });
      menu.appendChild(btnAll);
    } else {
      const btnThis = document.createElement('button');
      btnThis.textContent = t('r4ThisCell');
      btnThis.addEventListener('click', () => { closeMenu(); setR4(index, field, true); });
      menu.appendChild(btnThis);

      const divider = document.createElement('div');
      divider.className = 'r4-menu-divider';
      menu.appendChild(divider);

      const btnAll = document.createElement('button');
      btnAll.textContent = t('r4AllCells').replace('{name}', name.trim());
      btnAll.addEventListener('click', () => { closeMenu(); setR4All(name, field, true); });
      menu.appendChild(btnAll);
    }

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
    showR4Menu(e.clientX, e.clientY, index, field);
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
      showR4Menu(r4StartX, r4StartY, index, field);
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

  // R4 badge — no click action, use right-click/long-press instead
  const r4Btn = e.target.closest('.roster-r4-toggle');
  if (r4Btn) return;

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

// ── Roster R4 context menu (right-click / long-press) ──
(function() {
  const body = document.getElementById('rosterBody');
  let longPressTimer = null;

  function showRosterR4Menu(x, y, key) {
    if (!roster[key]) return;
    const hasR4 = roster[key].r4;
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
    showRosterR4Menu(e.clientX, e.clientY, key);
  });

  // Long-press for mobile
  body.addEventListener('touchstart', (e) => {
    const key = getRowKey(e.target);
    if (!key) return;
    longPressTimer = setTimeout(() => {
      const touch = e.touches[0];
      showRosterR4Menu(touch.clientX, touch.clientY, key);
    }, 500);
  });
  body.addEventListener('touchend', () => clearTimeout(longPressTimer));
  body.addEventListener('touchmove', () => clearTimeout(longPressTimer));
})();
