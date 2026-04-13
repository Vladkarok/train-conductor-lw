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

// Strip CSV quotes: "value" → value, "" → "
function unquote(s) {
  s = s.trim();
  if (s.length >= 2 && s[0] === '"' && s[s.length - 1] === '"') {
    s = s.slice(1, -1).replace(/""/g, '"');
  }
  return s;
}

// Try parsing as JSON share file (from share modal download)
function tryParseShareJson(text) {
  try {
    const obj = JSON.parse(text);
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

  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return null;

  const hasTab = lines.some(l => l.includes('\t'));
  const delimiter = hasTab ? '\t' : ',';

  let startIdx = 0;
  const firstCols = splitCsvLine(lines[0], delimiter).map(c => unquote(c).toLowerCase());
  const headerWords = ['date', 'conductor', 'vip', 'дата', 'провідник', 'chef'];
  if (firstCols.some(c => headerWords.some(h => c.includes(h)))) {
    startIdx = 1;
  }

  const result = [];
  let currentGroup = null;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i], delimiter).map(c => unquote(c));
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
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return [];

  const hasTab = lines.some(l => l.includes('\t'));
  const hasStructuredCsv = !hasTab && lines.length > 1 &&
    lines.some(l => splitCsvLine(l, ',').length > 1);

  if (hasTab || hasStructuredCsv) {
    const delimiter = hasTab ? '\t' : ',';
    let startIdx = 0;
    const firstCols = splitCsvLine(lines[0], delimiter).map(c => unquote(c).toLowerCase());
    const firstCol = firstCols[0] || '';
    const secondCol = firstCols[1] || '';
    const thirdCol = firstCols[2] || '';
    const hasHeader = ['name', 'member', 'nickname', 'nick', 'ім', 'ник', 'player']
      .some(h => firstCol.includes(h)) ||
      secondCol.includes('r4') ||
      secondCol.includes('left') ||
      thirdCol.includes('r4') ||
      thirdCol.includes('left');
    if (hasHeader) startIdx = 1;

    const entries = [];
    const seen = new Map();
    for (let i = startIdx; i < lines.length; i++) {
      const cols = splitCsvLine(lines[i], delimiter).map(c => unquote(c));
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

  const names = text.split(/[\r\n,]+/)
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

function flashIconButton(btn, msgKey, duration) {
  const orig = btn.innerHTML;
  const isSuccess = /success|copied|loaded/i.test(msgKey);
  btn.innerHTML = isSuccess ? '&#10003;' : '&#10005;';
  btn.style.color = isSuccess ? 'var(--green)' : 'var(--danger)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, duration || 1500);
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

function appendScheduleRows(parsed) {
  if (!rows.length) {
    rows.push(...parsed);
    return;
  }

  const combinedGroups = splitGroups(rows).concat(splitGroups(parsed)).map((group, order) => ({
    group,
    order,
    ts: groupTimestamp(group)
  }));

  combinedGroups.sort((a, b) => {
    if (a.ts === null && b.ts === null) return a.order - b.order;
    if (a.ts === null) return 1;
    if (b.ts === null) return -1;
    if (a.ts !== b.ts) return b.ts - a.ts;
    return a.order - b.order;
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
      flashIconButton(document.getElementById('importScheduleBtn'), 'importError');
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

    // Restore roster from JSON share if present
    if (jsonData && jsonData.roster) {
      if (result.mode === 'replace') {
        Object.keys(roster).forEach(k => delete roster[k]);
      }
      Object.keys(jsonData.roster).forEach(k => { roster[k] = jsonData.roster[k]; });
    }
    syncRosterFromTable({ resetMissingMarks: result.mode === 'replace' && !(jsonData && jsonData.roster) });
    saveRoster();
    renderTable();
    renderRoster();
    flashIconButton(document.getElementById('importScheduleBtn'), 'importSuccess');
  });
});

// ── Roster import ──────────────────────────────────
document.getElementById('importRosterBtn').addEventListener('click', () => {
  showImportModal('roster').then(result => {
    if (!result) return;
    const entries = parseRosterData(result.data);
    if (!entries.length) {
      flashIconButton(document.getElementById('importRosterBtn'), 'importError');
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
    flashIconButton(document.getElementById('importRosterBtn'), 'importSuccess');
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
