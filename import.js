// ── Import / Export ─────────────────────────────────

// Split a CSV/TSV line respecting quoted fields with embedded delimiters
function splitCsvLine(line, delimiter) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

// Drop the BOM a downloaded CSV (or a file saved by some editors) starts with.
function stripBom(text) {
  return text.replace(/^﻿/, '');
}

// splitCsvLine already resolves CSV quoting, so a field only needs trimming.
// A field that still starts and ends with a quote after splitting held
// literal quotes (written as """Ace""" in the file) and keeps them.
function cleanField(s) {
  return s.trim();
}

// Lower-case, drop apostrophes and split into words, so header labels match
// by whole word: "Chef de train" has the word "chef", "Viper" has no "vip".
function headerWords(cell) {
  return cell.toLowerCase()
    .replace(/['ʼ’`]/g, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);
}

function headerCell(cell) {
  return headerWords(cell).join(' ');
}

// Schedule header labels. Whole labels are what the CSV download writes in
// each UI language; header words also catch hand-made headers such as
// "Train date" or "VIP passenger".
const SCHEDULE_DATE_WORDS = new Set(['date', 'дата']);
const SCHEDULE_HEADER_WORDS = new Set(['date', 'дата', 'conductor', 'провідник', 'chef', 'vip', 'r4c', 'r4v', 'leftc', 'leftv']);
const SCHEDULE_HEADER_LABELS = new Set(['date', 'дата', 'conductor', 'провідник', 'vip']);
Object.values(TRANSLATIONS).forEach(tr => {
  ['date', 'conductor', 'vip'].forEach(k => {
    if (typeof tr[k] !== 'string') return;
    SCHEDULE_HEADER_LABELS.add(headerCell(tr[k]));
    const words = headerWords(tr[k]);
    if (k === 'date' && words.length === 1) SCHEDULE_DATE_WORDS.add(words[0]);
  });
});

// A data row starts with a date or with nothing (a sub-row), so the first
// line is a header only when:
// - its first cell is a text label, not a date: it has a date word, or at
//   least two cells have header words ("Day,Conductor,VIP");
// - or its first cell is empty and the next two cells are whole labels
//   (",Conductor,VIP").
// A headerless first row with a player such as "Viper", "Update" or "Chef"
// is kept.
function isScheduleHeader(cols) {
  const first = cols[0] || '';
  if (/^\d/.test(first)) return false;
  if (!first) {
    return cols.length >= 3 &&
      SCHEDULE_HEADER_LABELS.has(headerCell(cols[1])) &&
      SCHEDULE_HEADER_LABELS.has(headerCell(cols[2]));
  }
  if (headerWords(first).some(w => SCHEDULE_DATE_WORDS.has(w))) return true;
  const labelled = cols.filter(c => headerWords(c).some(w => SCHEDULE_HEADER_WORDS.has(w)));
  return labelled.length >= 2;
}

// Words of a roster name-column label (apostrophes dropped: Ім'я -> імя).
const ROSTER_NAME_WORDS = new Set([
  'name', 'names', 'nickname', 'nick', 'member', 'members', 'player', 'players',
  'імя', 'нік', 'нікнейм', 'учасник', 'гравець', 'имя', 'ник', 'никнейм', 'игрок',
  'nom', 'pseudo', 'joueur', 'membre'
]);
// Other words that may sit in that label: "Name (in game)", "Ім'я гравця".
const ROSTER_LABEL_FILLER = new Set(['in', 'game', 'ingame', 'of', 'гравця', 'учасника', 'игрока', 'du', 'de', 'la']);
// Single words that are plausible nicknames on their own.
const ROSTER_AMBIGUOUS_LABELS = new Set(['nick', 'player', 'member', 'нік', 'ник', 'pseudo', 'joueur', 'membre']);
const ROSTER_SET_MARKS = new Set(['1', 'true', 'yes', 'y', 'x']);

// The first line is a header when its first cell is a name label ("Name",
// "Player name", "Ім'я") and either
// - another cell is an R4/LEFT column label, as in the app's own export
//   "Name, R4, LEFT" (a first row such as "Nick, r4" is read the same way);
// - or the label is not a plausible nickname on its own and no other cell
//   holds a set mark (1, yes, x...).
// So "Alice, r4", "Nick, 1" and a lone "Nick" are members and are kept.
function isRosterHeader(cols) {
  const words = headerWords(cols[0] || '');
  if (!words.length) return false;
  if (!words.some(w => ROSTER_NAME_WORDS.has(w))) return false;
  if (!words.every(w => ROSTER_NAME_WORDS.has(w) || ROSTER_LABEL_FILLER.has(w))) return false;
  const rest = cols.slice(1).map(c => c.toLowerCase());
  if (rest.some(c => c.includes('r4') || c.includes('left'))) return true;
  const ambiguous = words.length === 1 && ROSTER_AMBIGUOUS_LABELS.has(words[0]);
  return !ambiguous && !rest.some(c => ROSTER_SET_MARKS.has(c));
}

// Try parsing as JSON share file (from share modal download)
function tryParseShareJson(text) {
  try {
    const obj = JSON.parse(stripBom(text));
    if (obj && Array.isArray(obj.rows)) return obj;
  } catch {}
  return null;
}

function parseScheduleData(text) {
  // Check if it's a JSON share file
  const json = tryParseShareJson(text);
  if (json) {
    return json.rows.map(r => ({
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

  const lines = stripBom(text).split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return null;

  const hasTab = lines.some(l => l.includes('\t'));
  const delimiter = hasTab ? '\t' : ',';

  const startIdx = isScheduleHeader(splitCsvLine(lines[0], delimiter).map(cleanField)) ? 1 : 0;

  const result = [];
  let currentGroup = null;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], delimiter).map(cleanField);
    const rawDate = cols[0] || '';
    const conductor = cols[1] || '';
    const vip = cols[2] || '';
    const r4c = !!(cols[3] && cols[3].trim());
    const r4v = !!(cols[4] && cols[4].trim());
    const leftc = !!(cols[5] && cols[5].trim());
    const leftv = !!(cols[6] && cols[6].trim());

    const date = rawDate ? normalizeDate(rawDate) : '';

    if (date || !currentGroup) {
      currentGroup = uid();
    }

    result.push({
      id: uid(),
      group: currentGroup,
      date: date,
      conductor: conductor,
      vip: vip,
      r4c: r4c,
      r4v: r4v,
      leftc: leftc,
      leftv: leftv
    });
  }
  return result.length ? result : null;
}

function parseRosterData(text) {
  const lines = stripBom(text).split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];

  const hasTab = lines.some(l => l.includes('\t'));
  const hasStructuredCsv = !hasTab && lines.length > 1 &&
    lines.some(l => splitCsvLine(l, ',').length > 1);

  if (hasTab || hasStructuredCsv) {
    const delimiter = hasTab ? '\t' : ',';
    const startIdx = isRosterHeader(splitCsvLine(lines[0], delimiter).map(cleanField)) ? 1 : 0;

    const entries = [];
    const seen = new Map();
    for (let i = startIdx; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i], delimiter).map(cleanField);
      const name = (cols[0] || '').trim();
      if (!name) continue;
      const key = nameKey(name);
      if (!key) continue;
      const r4Raw = (cols[1] || '').trim().toLowerCase();
      const hasR4 = ['1', 'true', 'yes', 'y', 'x', 'r4'].includes(r4Raw);
      const leftRaw = (cols[2] || '').trim().toLowerCase();
      const hasLeft = ['1', 'true', 'yes', 'y', 'x', 'left'].includes(leftRaw);
      if (seen.has(key)) {
        seen.get(key).r4 = seen.get(key).r4 || hasR4;
        seen.get(key).left = seen.get(key).left || hasLeft;
        continue;
      }
      const entry = { name, r4: hasR4, left: hasLeft };
      seen.set(key, entry);
      entries.push(entry);
    }
    return entries;
  }

  const names = stripBom(text).split(/[\r\n,]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0);
  const seen = new Set();
  return names.reduce((result, name) => {
    const key = nameKey(name);
    if (!key || seen.has(key)) return result;
    seen.add(key);
    result.push({ name, r4: false, left: false });
    return result;
  }, []);
}

function buildRosterText() {
  const entries = Object.values(roster)
    .slice()
    .sort((a, b) => a.display.localeCompare(b.display, undefined, { sensitivity: 'base' }));
  if (!entries.length) return '';
  const header = ['Name', 'R4', 'LEFT'].join('\t');
  const body = entries.map(entry =>
    [`"${entry.display.replace(/"/g, '""')}"`, entry.r4 ? '1' : '', entry.left ? '1' : ''].join('\t')
  ).join('\n');
  return header + '\n' + body;
}

// ── Import modal ───────────────────────────────────
let importType = 'schedule';

function showImportModal(type) {
  importType = type;
  const overlay = document.getElementById('importModalOverlay');
  const textarea = document.getElementById('importTextarea');
  const fileInput = document.getElementById('importFileInput');
  const fileNameEl = document.getElementById('importFileName');

  document.getElementById('importModalTitle').textContent =
    type === 'schedule' ? t('importScheduleTitle') : t('importRosterTitle');
  document.getElementById('importModalDesc').textContent = t('importDesc');
  document.getElementById('importModeReplace').textContent = t('importReplace');
  document.getElementById('importModeAppend').textContent = t('importAppend');
  document.getElementById('importModalConfirm').textContent = t('importConfirm');
  document.getElementById('importModalCancel').textContent = t('importCancel');
  document.getElementById('importFileText').textContent = t('importFileText');
  textarea.placeholder = type === 'schedule'
    ? t('importSchedulePlaceholder')
    : t('importRosterPlaceholder');
  textarea.value = '';
  fileInput.value = '';
  fileNameEl.textContent = '';
  document.querySelector('input[name="importMode"][value="replace"]').checked = true;

  overlay.classList.add('visible');
  textarea.focus();
  const releaseFocus = trapFocus(overlay);

  return new Promise((resolve) => {
    function getResult() {
      const data = textarea.value.trim();
      const mode = document.querySelector('input[name="importMode"]:checked').value;
      return data ? { data, mode } : null;
    }

    function cleanup() {
      overlay.classList.remove('visible');
      document.getElementById('importModalConfirm').removeEventListener('click', onConfirm);
      document.getElementById('importModalCancel').removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      document.removeEventListener('keydown', onKey);
      fileInput.removeEventListener('change', onFile);
      releaseFocus();
    }

    function onConfirm() { cleanup(); resolve(getResult()); }
    function onCancel() { cleanup(); resolve(null); }
    function onOverlay(e) { if (e.target === overlay) { cleanup(); resolve(null); } }
    function onKey(e) {
      if (e.key === 'Escape') { cleanup(); resolve(null); }
    }
    function onFile() {
      const file = fileInput.files[0];
      if (!file) return;
      fileNameEl.textContent = file.name;
      const reader = new FileReader();
      reader.onload = (ev) => { textarea.value = ev.target.result; };
      reader.readAsText(file);
    }

    document.getElementById('importModalConfirm').addEventListener('click', onConfirm);
    document.getElementById('importModalCancel').addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
    document.addEventListener('keydown', onKey);
    fileInput.addEventListener('change', onFile);
  });
}

function flashButton(btn, msgKey, duration) {
  const orig = btn.textContent;
  btn.textContent = t(msgKey);
  btn.classList.add('btn-success');
  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('btn-success');
  }, duration || 1500);
}

// opts: { success: boolean, duration?: number }
function flashIconButton(btn, opts) {
  const success = !!(opts && opts.success);
  const duration = (opts && opts.duration) || 1500;
  const orig = btn.innerHTML;
  btn.innerHTML = success ? '&#10003;' : '&#10005;';
  btn.style.color = success ? 'var(--green)' : 'var(--danger)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, duration);
}

function splitGroups(arr) {
  const groups = [];
  let current = [];
  let currentGroup = null;
  arr.forEach(row => {
    if (row.group !== currentGroup) {
      if (current.length) groups.push(current);
      current = [row];
      currentGroup = row.group;
    } else {
      current.push(row);
    }
  });
  if (current.length) groups.push(current);
  return groups;
}

function groupTimestamp(group) {
  const dated = group.map(r => parseDate(r.date)).filter(Boolean);
  if (!dated.length) return null;
  return dated[0].getTime();
}

function findAppendInsertIndex(groups, ts) {
  if (ts === null) return groups.length;

  let lastDatedIndex = -1;
  for (let i = 0; i < groups.length; i++) {
    if (groups[i].ts !== null) {
      lastDatedIndex = i;
      if (groups[i].ts < ts) {
        return i;
      }
    }
  }

  return lastDatedIndex + 1;
}

function appendScheduleRows(parsed) {
  if (!rows.length) {
    rows.push(...parsed);
    return;
  }

  const combinedGroups = splitGroups(rows).map(group => ({
    group,
    ts: groupTimestamp(group)
  }));

  splitGroups(parsed).forEach(group => {
    const entry = { group, ts: groupTimestamp(group) };
    const insertIndex = findAppendInsertIndex(combinedGroups, entry.ts);
    combinedGroups.splice(insertIndex, 0, entry);
  });

  rows.length = 0;
  combinedGroups.forEach(entry => entry.group.forEach(row => rows.push(row)));
}

// ── Schedule import ────────────────────────────────
document.getElementById('importScheduleBtn').addEventListener('click', () => {
  showImportModal('schedule').then(result => {
    if (!result) return;
    const parsed = parseScheduleData(result.data);
    if (!parsed || !parsed.length) {
      flashIconButton(document.getElementById('importScheduleBtn'), { success: false });
      return;
    }
    // Check if JSON share file included roster
    const jsonData = tryParseShareJson(result.data);

    pushUndo();
    ensureNewestFirst(parsed);
    if (result.mode === 'replace') {
      rows.length = 0;
      parsed.forEach(r => rows.push(r));
    } else {
      appendScheduleRows(parsed);
    }
    saveData();

    // Restore roster from JSON share if present. Sanitize each entry —
    // a hand-edited or older file may have entries that are missing
    // `display` or are not objects at all, and an unchecked copy would
    // later crash renderRoster() when it sorts by a.display.
    if (jsonData && jsonData.roster && typeof jsonData.roster === 'object' && !Array.isArray(jsonData.roster)) {
      if (result.mode === 'replace') {
        Object.keys(roster).forEach(k => delete roster[k]);
      }
      Object.keys(jsonData.roster).forEach(k => {
        const entry = jsonData.roster[k];
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
        const safeKey = typeof k === 'string' ? k.trim().toLowerCase().slice(0, 80) : '';
        if (!safeKey) return;
        const display = typeof entry.display === 'string' && entry.display
          ? entry.display.slice(0, 200)
          : safeKey;
        roster[safeKey] = {
          display,
          r4: !!entry.r4,
          left: !!entry.left
        };
      });
    }
    syncRosterFromTable({ resetMissingMarks: result.mode === 'replace' && !(jsonData && jsonData.roster) });
    saveRoster();
    renderTable();
    renderRoster();
    flashIconButton(document.getElementById('importScheduleBtn'), { success: true });
  });
});

// ── Roster import ──────────────────────────────────
document.getElementById('importRosterBtn').addEventListener('click', () => {
  showImportModal('roster').then(result => {
    if (!result) return;
    const entries = parseRosterData(result.data);
    if (!entries.length) {
      flashIconButton(document.getElementById('importRosterBtn'), { success: false });
      return;
    }
    if (result.mode === 'replace') {
      Object.keys(roster).forEach(k => delete roster[k]);
    }
    entries.forEach(entry => {
      addToRoster(entry.name);
      const key = nameKey(entry.name);
      if (key && roster[key]) {
        if (entry.r4) roster[key].r4 = true;
        if (entry.left) roster[key].left = true;
      }
    });
    saveRoster();
    renderRoster();
    flashIconButton(document.getElementById('importRosterBtn'), { success: true });
  });
});

// ── Roster export (clipboard) ──────────────────────
document.getElementById('rosterExportBtn').addEventListener('click', () => {
  const text = buildRosterText();
  if (!text.trim()) return;
  copyToClipboard(text).then(() => {
    const btn = document.getElementById('rosterExportBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '&#10003;';
    btn.style.color = 'var(--green)';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
  });
});

// ── Schedule download (CSV) ────────────────────────
function buildScheduleCsv() {
  const header = [t('date'), t('conductor'), t('vip'), 'R4C', 'R4V', 'LEFTC', 'LEFTV'].join(',');
  const seenGroups = new Set();
  const body = rows.map(r => {
    const showDate = !seenGroups.has(r.group);
    seenGroups.add(r.group);
    // Wrap fields in quotes to handle commas in names
    return [showDate ? r.date : '', r.conductor, r.vip, r.r4c ? '1' : '', r.r4v ? '1' : '', r.leftc ? '1' : '', r.leftv ? '1' : '']
      .map(v => '"' + v.replace(/"/g, '""') + '"').join(',');
  }).join('\n');
  return header + '\n' + body;
}

document.getElementById('downloadScheduleBtn').addEventListener('click', () => {
  const csv = buildScheduleCsv();
  downloadFile('schedule.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8');
  const btn = document.getElementById('downloadScheduleBtn');
  const orig = btn.innerHTML;
  btn.innerHTML = '&#10003;';
  btn.style.color = 'var(--green)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
});

// ── Roster download (TXT) ──────────────────────────
document.getElementById('downloadRosterBtn').addEventListener('click', () => {
  const text = buildRosterText();
  if (!text.trim()) return;
  downloadFile('roster.txt', text, 'text/plain;charset=utf-8');
  const btn = document.getElementById('downloadRosterBtn');
  const orig = btn.innerHTML;
  btn.innerHTML = '&#10003;';
  btn.style.color = 'var(--green)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
});
