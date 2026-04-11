// ── i18n ──────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    title: 'Schedule',
    date: 'Date',
    conductor: 'Conductor',
    vip: 'VIP',
    export: 'Copy to Clipboard',
    copied: 'Copied!',
    datePlaceholder: 'DD.MM.YYYY',
    github: 'View on GitHub',
    fillHint: 'Fill all dates',
    fillDatesTitle: 'Fill dates?',
    fillDatesDesc: 'Auto-fill all rows with sequential dates:',
    fillDatesConfirm: 'Fill dates',
    fillDatesCancel: 'Cancel',
    undoTooltip: 'Undo (Ctrl+Z)',
    redoTooltip: 'Redo (Ctrl+Y)',
    addSubRow: 'Add sub-row',
    occToggle: 'Occurrences',
    occStats: 'Statistics',
    occNoData: 'No repeated names',
    occCond: 'Cond',
    occVip: 'VIP',
    roster: 'Roster',
    rosterAdd: 'Add name...',
    rosterEmpty: 'No members yet',
    r4Toggle: 'Toggle R4',
    r4ThisCell: 'This cell only',
    r4AllCells: 'All "{name}" cells',
    r4Remove: 'Remove R4',
    r4RemoveAll: 'Remove from all "{name}"',
    importSchedule: 'Import Schedule',
    importRoster: 'Import Roster',
    importScheduleTitle: 'Import Schedule',
    importRosterTitle: 'Import Roster',
    importDesc: 'Paste data or upload a file:',
    importReplace: 'Replace existing',
    importAppend: 'Append to existing',
    importConfirm: 'Import',
    importCancel: 'Cancel',
    importFileText: 'Choose file...',
    importSchedulePlaceholder: 'Date\tConductor\tVIP\n01.01.2025\tJohn\tJane',
    importRosterPlaceholder: 'One name per line or comma-separated',
    importSuccess: 'Imported!',
    importError: 'Could not parse data',
    importEmpty: 'No data to import',
    rosterExport: 'Copy roster',
    rosterCopied: 'Copied!',
    share: 'Share',
    shareTitle: 'Share',
    shareDesc: 'Copy this link to share your schedule and roster:',
    shareIncludeRoster: 'Include roster',
    shareCopy: 'Copy',
    shareCopied: 'Copied!',
    shareClose: 'Close',
    shareSize: '{size} characters in URL',
    shareLoaded: 'Loaded shared data!',
    shareLoadConfirm: 'This link contains shared data. Load it? (replaces current data)',
    shareYes: 'Load',
    shareNo: 'Cancel',
    hintsTips: 'Tips',
    hintsDismiss: 'Got it',
    hintR4: 'Right-click (long-press on mobile) a name for R4 marking',
    hintDrag: 'Drag the highlighted occurrence rows to slide the window',
    hintDateFill: 'Click a date cell to auto-fill sequential dates',
    hintKeyboard: 'Tab / Enter / Arrow keys to navigate; Ctrl+Z / Y for undo-redo',
    hintSubRow: 'Click + next to a row to add a sub-row under it',
  },
  ua: {
    title: 'Розклад',
    date: 'Дата',
    conductor: 'Провідник',
    vip: 'VIP',
    export: 'Копіювати',
    copied: 'Скопійовано!',
    datePlaceholder: 'ДД.ММ.РРРР',
    github: 'Переглянути на GitHub',
    fillHint: 'Заповнити дати',
    fillDatesTitle: 'Заповнити дати?',
    fillDatesDesc: 'Автозаповнення всіх рядків послідовними датами:',
    fillDatesConfirm: 'Заповнити',
    fillDatesCancel: 'Скасувати',
    undoTooltip: 'Скасувати (Ctrl+Z)',
    redoTooltip: 'Повторити (Ctrl+Y)',
    addSubRow: 'Додати під-рядок',
    occToggle: 'Повторення',
    occStats: 'Статистика',
    occNoData: 'Немає повторів',
    occCond: 'Пров',
    occVip: 'VIP',
    roster: 'Склад',
    rosterAdd: 'Додати нікнейм...',
    rosterEmpty: 'Поки немає гравців',
    r4Toggle: 'Позначити R4',
    r4ThisCell: 'Тільки ця клітинка',
    r4AllCells: 'Усі клітинки "{name}"',
    r4Remove: 'Зняти R4',
    r4RemoveAll: 'Зняти з усіх "{name}"',
    importSchedule: 'Імпорт розкладу',
    importRoster: 'Імпорт складу',
    importScheduleTitle: 'Імпорт розкладу',
    importRosterTitle: 'Імпорт складу',
    importDesc: 'Вставте дані або завантажте файл:',
    importReplace: 'Замінити наявні',
    importAppend: 'Додати до наявних',
    importConfirm: 'Імпортувати',
    importCancel: 'Скасувати',
    importFileText: 'Обрати файл...',
    importSchedulePlaceholder: 'Дата\tПровідник\tVIP\n01.01.2025\tJohn\tJane',
    importRosterPlaceholder: 'По одному імені на рядок або через кому',
    importSuccess: 'Імпортовано!',
    importError: 'Не вдалось обробити дані',
    importEmpty: 'Немає даних для імпорту',
    rosterExport: 'Копіювати склад',
    rosterCopied: 'Скопійовано!',
    share: 'Поділитись',
    shareTitle: 'Поділитись',
    shareDesc: 'Скопіюйте посилання для передачі розкладу та складу:',
    shareIncludeRoster: 'Включити склад',
    shareCopy: 'Копіювати',
    shareCopied: 'Скопійовано!',
    shareClose: 'Закрити',
    shareSize: '{size} символів в URL',
    shareLoaded: 'Дані завантажено!',
    shareLoadConfirm: 'Це посилання містить дані. Завантажити? (замінить поточні)',
    shareYes: 'Завантажити',
    shareNo: 'Скасувати',
    hintsTips: 'Підказки',
    hintsDismiss: 'Зрозуміло',
    hintR4: 'ПКМ (довге натискання на мобільному) на імені для позначки R4',
    hintDrag: 'Перетягніть підсвічені рядки повторень для переміщення вікна',
    hintDateFill: 'Клікніть на дату для автозаповнення послідовних дат',
    hintKeyboard: 'Tab / Enter / Стрілки для навігації; Ctrl+Z / Y для скасування',
    hintSubRow: 'Натисніть + біля рядка щоб додати під-рядок',
  },
  fr: {
    title: 'Programme',
    date: 'Date',
    conductor: 'Chef de train',
    vip: 'VIP',
    export: 'Copier',
    copied: 'Copié !',
    datePlaceholder: 'JJ.MM.AAAA',
    github: 'Voir sur GitHub',
    fillHint: 'Remplir les dates',
    fillDatesTitle: 'Remplir les dates ?',
    fillDatesDesc: 'Remplir automatiquement toutes les lignes avec des dates séquentielles :',
    fillDatesConfirm: 'Remplir',
    fillDatesCancel: 'Annuler',
    undoTooltip: 'Annuler (Ctrl+Z)',
    redoTooltip: 'Rétablir (Ctrl+Y)',
    addSubRow: 'Ajouter sous-ligne',
    occToggle: 'Occurrences',
    occStats: 'Statistiques',
    occNoData: 'Aucun nom répété',
    occCond: 'Cond',
    occVip: 'VIP',
    roster: 'Effectif',
    rosterAdd: 'Ajouter un nom...',
    rosterEmpty: 'Aucun membre',
    r4Toggle: 'Basculer R4',
    r4ThisCell: 'Cette cellule seulement',
    r4AllCells: 'Toutes les cellules "{name}"',
    r4Remove: 'Retirer R4',
    r4RemoveAll: 'Retirer de tous "{name}"',
    importSchedule: 'Importer programme',
    importRoster: 'Importer effectif',
    importScheduleTitle: 'Importer le programme',
    importRosterTitle: "Importer l'effectif",
    importDesc: 'Collez les données ou téléchargez un fichier :',
    importReplace: 'Remplacer existant',
    importAppend: 'Ajouter aux existants',
    importConfirm: 'Importer',
    importCancel: 'Annuler',
    importFileText: 'Choisir un fichier...',
    importSchedulePlaceholder: 'Date\tChef de train\tVIP\n01.01.2025\tJohn\tJane',
    importRosterPlaceholder: 'Un nom par ligne ou séparés par des virgules',
    importSuccess: 'Importé !',
    importError: 'Impossible de traiter les données',
    importEmpty: 'Aucune donnée à importer',
    rosterExport: "Copier l'effectif",
    rosterCopied: 'Copié !',
    share: 'Partager',
    shareTitle: 'Partager',
    shareDesc: 'Copiez ce lien pour partager votre programme et effectif :',
    shareIncludeRoster: "Inclure l'effectif",
    shareCopy: 'Copier',
    shareCopied: 'Copié !',
    shareClose: 'Fermer',
    shareSize: '{size} caractères dans l\'URL',
    shareLoaded: 'Données chargées !',
    shareLoadConfirm: 'Ce lien contient des données. Les charger ? (remplace les données actuelles)',
    shareYes: 'Charger',
    shareNo: 'Annuler',
    hintsTips: 'Astuces',
    hintsDismiss: 'Compris',
    hintR4: 'Clic droit (appui long sur mobile) sur un nom pour marquer R4',
    hintDrag: "Faites glisser les lignes surlignées pour déplacer la fenêtre",
    hintDateFill: 'Cliquez sur une date pour remplir automatiquement',
    hintKeyboard: 'Tab / Entrée / Flèches pour naviguer ; Ctrl+Z / Y pour annuler',
    hintSubRow: 'Cliquez + à côté d\'une ligne pour ajouter une sous-ligne',
  },
};

const LANG_KEY = 'schedule_lang';
const DATA_KEY = 'schedule_data';
let currentLang = localStorage.getItem(LANG_KEY) || 'en';

function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.en[key] || key; }

function applyLang() {
  document.documentElement.lang = currentLang === 'ua' ? 'uk' : currentLang;
  document.title = t('title');
  document.getElementById('title').textContent = t('title');
  document.getElementById('exportBtn').title = t('export');
  document.getElementById('thDate').textContent = t('date');
  document.getElementById('thConductor').textContent = t('conductor');
  document.getElementById('thVip').textContent = t('vip');
  document.getElementById('labelGithub').textContent = t('github');
  document.getElementById('undoBtn').title = t('undoTooltip');
  document.getElementById('redoBtn').title = t('redoTooltip');
  document.getElementById('modalTitle').textContent = t('fillDatesTitle');
  document.getElementById('modalDesc').textContent = t('fillDatesDesc');
  document.getElementById('modalConfirm').textContent = t('fillDatesConfirm');
  document.getElementById('modalCancel').textContent = t('fillDatesCancel');
  document.getElementById('occToggle').textContent = t('occToggle');
  document.getElementById('occStatsTitle').textContent = t('occStats');
  document.getElementById('rosterToggle').textContent = t('roster');
  document.getElementById('rosterTitle').textContent = t('roster');
  document.getElementById('rosterInput').placeholder = t('rosterAdd');
  document.getElementById('importScheduleBtn').textContent = t('importSchedule');
  document.getElementById('importRosterBtn').textContent = t('importRoster');
  document.getElementById('shareBtn').textContent = t('share');
  document.getElementById('hintsToggle').title = t('hintsTips');
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  renderTable();
  renderRoster();
}

// ── Data ──────────────────────────────────────────────
let rows = [];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function newRow(group) {
  return { id: uid(), group: group || uid(), date: '', conductor: '', vip: '', r4c: false, r4v: false };
}

function cloneRows(r) { return JSON.parse(JSON.stringify(r)); }

function saveData() { localStorage.setItem(DATA_KEY, JSON.stringify(rows)); }

function loadData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      rows = JSON.parse(raw);
      // Migrate old data
      rows.forEach(r => {
        if (!r.group) r.group = r.id;
        if (r.r4c === undefined) r.r4c = false;
        if (r.r4v === undefined) r.r4v = false;
      });
      return;
    }
  } catch {}
  rows = [newRow()];
}

// Get all rows in the same group
function getGroup(group) {
  return rows.filter(r => r.group === group);
}

// Get index of first row in a group
function groupStartIndex(group) {
  return rows.findIndex(r => r.group === group);
}

// ── Undo / Redo ──────────────────────────────────────
const undoStack = [];
const redoStack = [];
const MAX_HISTORY = 50;

function pushUndo() {
  undoStack.push(cloneRows(rows));
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
  updateUndoRedoButtons();
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(cloneRows(rows));
  rows = undoStack.pop();
  saveData();
  renderTable();
  updateUndoRedoButtons();
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(cloneRows(rows));
  rows = redoStack.pop();
  saveData();
  renderTable();
  updateUndoRedoButtons();
}

function updateUndoRedoButtons() {
  document.getElementById('undoBtn').disabled = undoStack.length === 0;
  document.getElementById('redoBtn').disabled = redoStack.length === 0;
}

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault();
    redo();
  }
});

// ── Date helpers ─────────────────────────────────────
function normalizeDate(val) {
  const cleaned = val.replace(/[-/]/g, '.');
  const match = cleaned.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (match) {
    return match[1].padStart(2, '0') + '.' + match[2].padStart(2, '0') + '.' + match[3];
  }
  return val;
}

function parseDate(str) {
  const m = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  if (d.getDate() !== +m[1] || d.getMonth() !== +m[2] - 1) return null;
  return d;
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

function addDays(date, n) {
  const r = new Date(date);
  r.setDate(r.getDate() + n);
  return r;
}

// ── Date auto-fill ───────────────────────────────────
function getGroupLeaders() {
  const seen = new Set();
  const leaders = [];
  rows.forEach((r, i) => {
    if (!seen.has(r.group)) {
      seen.add(r.group);
      leaders.push(i);
    }
  });
  return leaders;
}

function computeDateFill(index, dateStr) {
  const baseDate = parseDate(dateStr);
  if (!baseDate) return null;
  const leaders = getGroupLeaders();
  const baseGroupIdx = leaders.indexOf(groupStartIndex(rows[index].group));
  if (baseGroupIdx === -1) return null;
  const result = [];
  leaders.forEach((leaderIdx, gi) => {
    const offset = gi - baseGroupIdx;
    result.push({ leaderIdx, date: formatDate(addDays(baseDate, offset)) });
  });
  return result;
}

function showFillModal(index, dateStr) {
  const fills = computeDateFill(index, dateStr);
  if (!fills) return Promise.resolve(null);

  const preview = document.getElementById('modalPreview');
  const baseGroup = rows[index].group;

  const sourceIdx = fills.findIndex(f => rows[f.leaderIdx].group === baseGroup);
  let startShow = Math.max(0, sourceIdx - 3);
  let endShow = Math.min(fills.length, sourceIdx + 5);
  let html = '';
  if (startShow > 0) html += '...<br>';
  for (let i = startShow; i < endShow; i++) {
    const f = fills[i];
    const isSource = rows[f.leaderIdx].group === baseGroup;
    const dateHtml = isSource ? `<span>${f.date}</span> &#9664;` : f.date;
    html += `Row ${i + 1}: ${dateHtml}<br>`;
  }
  if (endShow < fills.length) html += '...';
  preview.innerHTML = html;

  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('visible');

  return new Promise((resolve) => {
    function cleanup() {
      overlay.classList.remove('visible');
      document.getElementById('modalConfirm').removeEventListener('click', onConfirm);
      document.getElementById('modalCancel').removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      document.removeEventListener('keydown', onKey);
    }
    function onConfirm() { cleanup(); resolve(fills); }
    function onCancel() { cleanup(); resolve(null); }
    function onOverlay(e) { if (e.target === overlay) { cleanup(); resolve(null); } }
    function onKey(e) { if (e.key === 'Escape') { cleanup(); resolve(null); } else if (e.key === 'Enter') { cleanup(); resolve(fills); } }

    document.getElementById('modalConfirm').addEventListener('click', onConfirm);
    document.getElementById('modalCancel').addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
    document.addEventListener('keydown', onKey);
  });
}

// ── Rendering ────────────────────────────────────────
const FIELDS = ['date', 'conductor', 'vip'];
const tbody = document.getElementById('tableBody');

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function renderTable() {
  const w = occ.enabled ? getOccWindow() : null;
  const gCounts = w ? buildGeneralCounts(w.active) : null;
  const cCounts = w ? buildCounts(w.active, 'conductor') : null;
  const vCounts = w ? buildCounts(w.active, 'vip') : null;

  let winFirst = -1, winLast = -1;
  if (w) {
    const allWin = [...w.windowIndices];
    winFirst = Math.min(...allWin);
    winLast = Math.max(...allWin);
  }

  function rowClasses(idx, extra) {
    const cls = extra ? [extra] : [];
    if (w && w.windowIndices.has(idx)) {
      cls.push('in-window');
      if (idx === winFirst) cls.push('window-top');
      if (idx === winLast) cls.push('window-bottom');
    }
    return cls.length ? ` class="${cls.join(' ')}"` : '';
  }

  function inWin(idx) { return w && w.windowIndices.has(idx); }

  function cellHtml(value, placeholder, isR4, counts) {
    const r4Tag = isR4 ? '<span class="r4-badge">R4</span>' : '';
    if (!value) return `<span class="placeholder">${escapeHtml(placeholder)}</span>`;
    if (counts) {
      const cls = occClass(value, counts);
      const safe = escapeHtml(value);
      return (cls ? `<span class="${cls}">${safe}</span>` : safe) + r4Tag;
    }
    return escapeHtml(value) + r4Tag;
  }

  let html = '';
  let i = 0;
  while (i < rows.length) {
    const row = rows[i];
    const group = row.group;
    const groupRows = [];
    let j = i;
    while (j < rows.length && rows[j].group === group) {
      groupRows.push(j);
      j++;
    }
    const span = groupRows.length;

    const dateVal = row.date;
    const datePh = t('datePlaceholder');
    const dateDisplay = dateVal
      ? escapeHtml(dateVal)
      : `<span class="placeholder">${escapeHtml(datePh)}</span>`;

    html += `<tr${rowClasses(i)} data-id="${row.id}">`;
    html += `<td${span > 1 ? ` rowspan="${span}"` : ''}><div class="cell" data-field="date" data-index="${i}">${dateDisplay}</div></td>`;
    html += `<td><div class="cell${row.r4c ? ' cell-r4' : ''}" data-field="conductor" data-index="${i}">${cellHtml(row.conductor, t('conductor'), row.r4c, inWin(i) ? gCounts : null)}</div></td>`;
    html += `<td><div class="cell${row.r4v ? ' cell-r4' : ''}" data-field="vip" data-index="${i}">${cellHtml(row.vip, t('vip'), row.r4v, inWin(i) ? gCounts : null)}</div></td>`;
    html += `<td><div class="row-actions">`;
    html += `<button class="btn-subrow" data-index="${i}" title="${t('addSubRow')}"><svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 0 1 0-2h5V2a1 1 0 0 1 1-1z"/></svg></button>`;
    html += `<button class="btn-delete" data-index="${i}" title="Delete">&times;</button>`;
    html += `</div></td></tr>`;

    for (let k = 1; k < span; k++) {
      const si = groupRows[k];
      const sr = rows[si];
      html += `<tr${rowClasses(si, 'subrow')} data-id="${sr.id}">`;
      html += `<td><div class="cell${sr.r4c ? ' cell-r4' : ''}" data-field="conductor" data-index="${si}">${cellHtml(sr.conductor, t('conductor'), sr.r4c, inWin(si) ? gCounts : null)}</div></td>`;
      html += `<td><div class="cell${sr.r4v ? ' cell-r4' : ''}" data-field="vip" data-index="${si}">${cellHtml(sr.vip, t('vip'), sr.r4v, inWin(si) ? gCounts : null)}</div></td>`;
      html += `<td><div class="row-actions">`;
      html += `<button class="btn-subrow" data-index="${si}" title="${t('addSubRow')}"><svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 0 1 0-2h5V2a1 1 0 0 1 1-1z"/></svg></button>`;
      html += `<button class="btn-delete" data-index="${si}" title="Delete">&times;</button>`;
      html += `</div></td></tr>`;
    }
    i = j;
  }
  tbody.innerHTML = html;
  if (occ.enabled) syncOccUi(getOccWindow());
  renderOccStats(gCounts, cCounts, vCounts);
}

// ── Fill hint tooltip ──────────────────────────────────
let activeHint = null;

function dismissHint() {
  if (activeHint) {
    activeHint.classList.remove('visible');
    setTimeout(() => { if (activeHint && !activeHint.classList.contains('visible')) activeHint.remove(); }, 200);
    activeHint = null;
  }
}

function showFillHint(cell, index) {
  dismissHint();
  const uniqueGroups = new Set(rows.map(r => r.group)).size;
  if (uniqueGroups < 2) return;
  const dateStr = rows[index].date;
  if (!dateStr || !parseDate(dateStr)) return;

  const hint = document.createElement('div');
  hint.className = 'fill-hint';
  hint.textContent = t('fillHint');
  cell.appendChild(hint);
  activeHint = hint;

  requestAnimationFrame(() => hint.classList.add('visible'));

  hint.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissHint();
    showFillModal(index, dateStr).then(fills => {
      if (fills) {
        pushUndo();
        fills.forEach(f => {
          const group = rows[f.leaderIdx].group;
          rows.forEach(r => { if (r.group === group) r.date = f.date; });
        });
        saveData();
        renderTable();
      }
    });
  });
}

document.addEventListener('click', (e) => {
  if (activeHint && !e.target.closest('.fill-hint') && !e.target.closest('.cell[data-field="date"]')) {
    dismissHint();
  }
});

// ── Cell editing ─────────────────────────────────────
let activeInput = null;

function startEdit(cell) {
  if (cell.querySelector('input')) return;
  dismissHint();

  const field = cell.dataset.field;
  const index = parseInt(cell.dataset.index);
  const value = rows[index][field];

  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.placeholder = field === 'date' ? t('datePlaceholder') : t(field);

  cell.innerHTML = '';
  cell.appendChild(input);
  input.focus();
  input.select();
  activeInput = input;

  let committed = false;

  function commit() {
    if (committed) return;
    committed = true;
    activeInput = null;

    const oldVal = rows[index][field];
    let val = input.value.trim();
    if (field === 'date' && val) val = normalizeDate(val);

    if (val === oldVal) { renderTable(); return; }

    pushUndo();
    rows[index][field] = val;
    if (field === 'date') {
      const group = rows[index].group;
      rows.forEach(r => { if (r.group === group) r.date = val; });
    }
    // Auto-add to roster + R4 auto-detect
    if ((field === 'conductor' || field === 'vip') && val) {
      addToRoster(val);
      const rKey = val.trim().toLowerCase();
      const r4Field = field === 'conductor' ? 'r4c' : 'r4v';
      if (roster[rKey] && roster[rKey].r4) {
        rows[index][r4Field] = true;
      }
      renderRoster();
    }
    saveData();
    renderTable();
  }

  input.addEventListener('blur', commit);

  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      commit();
      moveTo(index, field, 'down');
    } else if (ev.key === 'Tab') {
      ev.preventDefault();
      commit();
      moveTo(index, field, ev.shiftKey ? 'left' : 'right');
    } else if (ev.key === 'Escape') {
      committed = true;
      activeInput = null;
      renderTable();
    } else if (ev.key === 'ArrowDown' && !ev.shiftKey) {
      ev.preventDefault();
      commit();
      moveTo(index, field, 'down');
    } else if (ev.key === 'ArrowUp' && !ev.shiftKey) {
      ev.preventDefault();
      commit();
      moveTo(index, field, 'up');
    }
  });
}

function moveTo(rowIndex, field, direction) {
  let ri = rowIndex;
  let fi = FIELDS.indexOf(field);

  switch (direction) {
    case 'right':
      fi++;
      if (fi >= FIELDS.length) { fi = 0; ri++; }
      break;
    case 'left':
      fi--;
      if (fi < 0) { fi = FIELDS.length - 1; ri--; }
      break;
    case 'down': ri++; break;
    case 'up': ri--; break;
  }

  if (ri < 0 || ri >= rows.length) return;

  requestAnimationFrame(() => {
    const target = document.querySelector(`.cell[data-index="${ri}"][data-field="${FIELDS[fi]}"]`);
    if (target) startEdit(target);
  });
}

// ── Event delegation ─────────────────────────────────
tbody.addEventListener('click', (e) => {
  if (e.target.closest('.fill-hint')) return;

  const subBtn = e.target.closest('.btn-subrow');
  if (subBtn) {
    const index = parseInt(subBtn.dataset.index);
    const group = rows[index].group;
    pushUndo();
    const sub = { id: uid(), group: group, date: '', conductor: '', vip: '' };
    rows.splice(index + 1, 0, sub);
    saveData();
    renderTable();
    requestAnimationFrame(() => {
      const conductorCell = document.querySelector(`.cell[data-index="${index + 1}"][data-field="conductor"]`);
      if (conductorCell) startEdit(conductorCell);
    });
    return;
  }

  const deleteBtn = e.target.closest('.btn-delete');
  if (deleteBtn) {
    const index = parseInt(deleteBtn.dataset.index);
    pushUndo();
    const group = rows[index].group;
    const groupMembers = getGroup(group);

    if (groupMembers.length > 1 && rows[index] === groupMembers[0]) {
      const nextInGroup = groupMembers[1];
      nextInGroup.date = rows[index].date;
    }

    rows.splice(index, 1);
    if (rows.length === 0) rows.push(newRow());
    saveData();
    renderTable();
    return;
  }

  const cell = e.target.closest('.cell');
  if (!cell) return;

  const field = cell.dataset.field;
  const index = parseInt(cell.dataset.index);

  const uniqueGroups = new Set(rows.map(r => r.group)).size;

  if (field === 'date' && uniqueGroups > 1 && rows[index].date && parseDate(rows[index].date)) {
    if (activeHint && activeHint.parentElement === cell) {
      dismissHint();
      startEdit(cell);
    } else {
      showFillHint(cell, index);
    }
    return;
  }

  startEdit(cell);
});

// ── Add row ──────────────────────────────────────────
function addNewRow() {
  pushUndo();
  rows.push(newRow());
  saveData();
  renderTable();
  requestAnimationFrame(() => {
    const lastDateCell = document.querySelector(`.cell[data-index="${rows.length - 1}"][data-field="date"]`);
    if (lastDateCell) startEdit(lastDateCell);
  });
}

document.getElementById('addRowInline').addEventListener('click', addNewRow);

// ── Export ────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  const header = [t('date'), t('conductor'), t('vip')].join('\t');
  const seenGroups = new Set();
  const body = rows.map(r => {
    const showDate = !seenGroups.has(r.group);
    seenGroups.add(r.group);
    return [showDate ? r.date : '', r.conductor, r.vip].join('\t');
  }).join('\n');
  const text = header + '\n' + body;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('exportBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '&#10003;';
    btn.style.color = 'var(--green)';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
  });
});

// ── Language switcher ────────────────────────────────
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentLang = btn.dataset.lang;
    localStorage.setItem(LANG_KEY, currentLang);
    applyLang();
  });
});
