// ── Import / Export ─────────────────────────────────

function parseScheduleData(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) return null;

  const hasTab = lines.some(l => l.includes('\t'));
  const delimiter = hasTab ? '\t' : ',';

  let startIdx = 0;
  const firstCols = lines[0].split(delimiter).map(c => c.trim().toLowerCase());
  const headerWords = ['date', 'conductor', 'vip', 'дата', 'провідник', 'chef'];
  if (firstCols.some(c => headerWords.some(h => c.includes(h)))) {
    startIdx = 1;
  }

  const result = [];
  let currentGroup = null;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(delimiter).map(c => c.trim());
    const rawDate = cols[0] || '';
    const conductor = cols[1] || '';
    const vip = cols[2] || '';

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
      r4c: false,
      r4v: false
    });
  }
  return result.length ? result : null;
}

function parseRosterData(text) {
  const names = text.split(/[\r\n,]+/)
    .map(n => n.trim())
    .filter(n => n.length > 0);
  const seen = new Set();
  return names.filter(n => {
    const k = n.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
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
  btn.innerHTML = '&#10003;';
  btn.style.color = 'var(--green)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, duration || 1500);
}

// ── Schedule import ────────────────────────────────
document.getElementById('importScheduleBtn').addEventListener('click', () => {
  showImportModal('schedule').then(result => {
    if (!result) return;
    const parsed = parseScheduleData(result.data);
    if (!parsed || !parsed.length) {
      flashButton(document.getElementById('importScheduleBtn'), 'importError');
      return;
    }
    pushUndo();
    if (result.mode === 'replace') {
      rows.length = 0;
      parsed.forEach(r => rows.push(r));
    } else {
      parsed.forEach(r => rows.push(r));
    }
    saveData();
    syncRosterFromTable();
    saveRoster();
    renderTable();
    renderRoster();
    flashButton(document.getElementById('importScheduleBtn'), 'importSuccess');
  });
});

// ── Roster import ──────────────────────────────────
document.getElementById('importRosterBtn').addEventListener('click', () => {
  showImportModal('roster').then(result => {
    if (!result) return;
    const names = parseRosterData(result.data);
    if (!names.length) {
      flashButton(document.getElementById('importRosterBtn'), 'importError');
      return;
    }
    if (result.mode === 'replace') {
      Object.keys(roster).forEach(k => delete roster[k]);
    }
    names.forEach(name => addToRoster(name));
    saveRoster();
    renderRoster();
    flashIconButton(document.getElementById('importRosterBtn'), 'importSuccess');
  });
});

// ── Roster export (clipboard) ──────────────────────
document.getElementById('rosterExportBtn').addEventListener('click', () => {
  const names = Object.values(roster).map(r => r.display).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  if (!names.length) return;
  copyToClipboard(names.join('\n')).then(() => {
    const btn = document.getElementById('rosterExportBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '&#10003;';
    btn.style.color = 'var(--green)';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
  });
});

// ── Schedule download (CSV) ────────────────────────
function buildScheduleCsv() {
  const header = [t('date'), t('conductor'), t('vip')].join(',');
  const seenGroups = new Set();
  const body = rows.map(r => {
    const showDate = !seenGroups.has(r.group);
    seenGroups.add(r.group);
    // Wrap fields in quotes to handle commas in names
    return [showDate ? r.date : '', r.conductor, r.vip]
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
  const names = Object.values(roster).map(r => r.display).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );
  if (!names.length) return;
  downloadFile('roster.txt', names.join('\n'), 'text/plain;charset=utf-8');
  const btn = document.getElementById('downloadRosterBtn');
  const orig = btn.innerHTML;
  btn.innerHTML = '&#10003;';
  btn.style.color = 'var(--green)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
});
