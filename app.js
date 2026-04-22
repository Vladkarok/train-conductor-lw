// ── i18n ──────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    title: 'Alliance Train Schedule',
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
    addNewestRow: 'Add newest row',
    addPastRow: 'Add past row',
    occToggle: 'Occurrences',
    occStats: 'Statistics',
    occNoData: 'No repeated names',
    occCond: 'Cond',
    occVip: 'VIP',
    roster: 'Roster',
    rosterAdd: 'Add name...',
    rosterEmpty: 'No members yet',
    r4Toggle: 'Toggle R4',
    r4ThisCell: 'Mark R4 — this cell',
    r4AllCells: 'Mark R4 — all "{name}"',
    r4Remove: 'Unmark R4 — this cell',
    r4RemoveAll: 'Unmark R4 — all "{name}"',
    rosterMarkR4: 'Mark R4',
    rosterUnmarkR4: 'Unmark R4',
    leftBadge: 'LEFT',
    leftThisCell: 'Mark Left — this cell',
    leftAllCells: 'Mark Left — all "{name}"',
    leftRemove: 'Unmark Left — this cell',
    leftRemoveAll: 'Unmark Left — all "{name}"',
    rosterMarkLeft: 'Mark Left',
    rosterUnmarkLeft: 'Unmark Left',
    rosterHighlight: 'Highlight in schedule',
    rosterUnhighlight: 'Clear highlight',
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
    shareDesc: 'Create and copy a short link to share your schedule and roster:',
    shareIncludeRoster: 'Include roster',
    shareCopy: 'Copy',
    shareCopied: 'Copied!',
    shareClose: 'Close',
    shareSize: 'Payload size: {size} characters',
    shareLoaded: 'Loaded shared data!',
    shareLoadConfirm: 'This link contains shared data. Load it? (replaces current data)',
    shareYes: 'Load',
    shareNo: 'Cancel',
    shareWarn: 'Short-link sharing is unavailable right now. Use "Download .json" instead.',
    shareDownload: 'Download .json',
    shareCreating: 'Creating...',
    shareError: 'Could not create share link',
    shareMissing: 'This share link is missing or has expired.',
    shareLinkPlaceholder: 'Link will appear here after you press Copy',
    editCellTitle: 'Edit {field}',
    editCellSave: 'Save',
    editCellCancel: 'Cancel',
    downloadSchedule: 'Download CSV',
    downloadRoster: 'Download roster',
    hintsTips: 'Tips',
    hintsDismiss: 'Got it',
    hintR4: 'Right-click (long-press on mobile) a name for marks, highlight, or rename',
    hintRename: 'Click a name in Roster to rename it everywhere',
    hintNotes: 'Add notes after a name: Smith (Birthday) — notes are preserved, name still matches',
    hintDrag: 'Drag the highlighted occurrence rows to slide the window',
    hintDateFill: 'Click a date cell to auto-fill sequential dates',
    hintKeyboard: 'Click a cell to edit in a popup; Ctrl+Z / Y for undo-redo',
    hintSubRow: 'Top + adds a newest row, bottom + adds an older past row, and row + adds a sub-row',
    rename: 'Rename',
    renameAll: 'Rename "{name}" everywhere',
    renamePrompt: 'New name for "{name}":',
    resetBtn: 'Reset',
    resetTitle: 'Reset all data',
    resetDesc: 'This will permanently delete all schedule rows, roster, and settings. This cannot be undone.',
    resetConfirmText: 'Type RESET to confirm:',
    resetConfirm: 'Reset everything',
    resetCancel: 'Cancel',
    themeToLight: 'Switch to light theme',
    themeToDark: 'Switch to dark theme',
  },
  ua: {
    title: 'Розклад поїздів альянсу',
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
    addNewestRow: 'Додати новий верхній рядок',
    addPastRow: 'Додати старий нижній рядок',
    occToggle: 'Повторення',
    occStats: 'Статистика',
    occNoData: 'Немає повторів',
    occCond: 'Пров',
    occVip: 'VIP',
    roster: 'Склад',
    rosterAdd: 'Додати нікнейм...',
    rosterEmpty: 'Поки немає гравців',
    r4Toggle: 'Позначити R4',
    r4ThisCell: 'Позначити R4 — ця клітинка',
    r4AllCells: 'Позначити R4 — усі "{name}"',
    r4Remove: 'Зняти R4 — ця клітинка',
    r4RemoveAll: 'Зняти R4 — усі "{name}"',
    rosterMarkR4: 'Позначити R4',
    rosterUnmarkR4: 'Зняти R4',
    leftBadge: 'LEFT',
    leftThisCell: 'Позначити Вийшов — ця клітинка',
    leftAllCells: 'Позначити Вийшов — усі "{name}"',
    leftRemove: 'Зняти Вийшов — ця клітинка',
    leftRemoveAll: 'Зняти Вийшов — усі "{name}"',
    rosterMarkLeft: 'Позначити Вийшов',
    rosterUnmarkLeft: 'Зняти Вийшов',
    rosterHighlight: 'Підсвітити в розкладі',
    rosterUnhighlight: 'Зняти підсвітку',
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
    shareDesc: 'Створіть і скопіюйте коротке посилання для передачі розкладу та складу:',
    shareIncludeRoster: 'Включити склад',
    shareCopy: 'Копіювати',
    shareCopied: 'Скопійовано!',
    shareClose: 'Закрити',
    shareSize: 'Розмір даних: {size} символів',
    shareLoaded: 'Дані завантажено!',
    shareLoadConfirm: 'Це посилання містить дані. Завантажити? (замінить поточні)',
    shareYes: 'Завантажити',
    shareNo: 'Скасувати',
    shareWarn: 'Короткі посилання зараз недоступні. Використовуйте "Завантажити .json".',
    shareDownload: 'Завантажити .json',
    shareCreating: 'Створення...',
    shareError: 'Не вдалося створити посилання',
    shareMissing: 'Це посилання відсутнє або вже закінчилося.',
    shareLinkPlaceholder: 'Посилання з’явиться тут після натискання Копіювати',
    editCellTitle: 'Редагувати: {field}',
    editCellSave: 'Зберегти',
    editCellCancel: 'Скасувати',
    downloadSchedule: 'Завантажити CSV',
    downloadRoster: 'Завантажити склад',
    hintsTips: 'Підказки',
    hintsDismiss: 'Зрозуміло',
    hintR4: 'ПКМ (довге натискання) на імені для позначок, підсвітки або перейменування',
    hintRename: 'Клікніть на ім\'я в Складі щоб перейменувати всюди',
    hintNotes: 'Додайте нотатку після імені: Smith (День народження) — нотатки зберігаються, ім\'я розпізнається',
    hintDrag: 'Перетягніть підсвічені рядки повторень для переміщення вікна',
    hintDateFill: 'Клікніть на дату для автозаповнення послідовних дат',
    hintKeyboard: 'Клацніть клітинку — відкриється вікно редагування; Ctrl+Z / Y для скасування',
    hintSubRow: 'Верхній + додає новий верхній рядок, нижній + додає старий рядок, а + біля рядка додає під-рядок',
    rename: 'Перейменувати',
    renameAll: 'Перейменувати "{name}" всюди',
    renamePrompt: 'Нове ім\'я для "{name}":',
    resetBtn: 'Скинути',
    resetTitle: 'Скинути всі дані',
    resetDesc: 'Це видалить всі рядки розкладу, склад та налаштування назавжди. Цю дію не можна скасувати.',
    resetConfirmText: 'Введіть RESET для підтвердження:',
    resetConfirm: 'Скинути все',
    resetCancel: 'Скасувати',
    themeToLight: 'Перемкнути на світлу тему',
    themeToDark: 'Перемкнути на темну тему',
  },
  fr: {
    title: 'Horaire de train d\'alliance',
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
    addNewestRow: 'Ajouter la ligne la plus récente',
    addPastRow: 'Ajouter une ligne plus ancienne',
    occToggle: 'Occurrences',
    occStats: 'Statistiques',
    occNoData: 'Aucun nom répété',
    occCond: 'Cond',
    occVip: 'VIP',
    roster: 'Effectif',
    rosterAdd: 'Ajouter un nom...',
    rosterEmpty: 'Aucun membre',
    r4Toggle: 'Basculer R4',
    r4ThisCell: 'Marquer R4 — cette cellule',
    r4AllCells: 'Marquer R4 — tous "{name}"',
    r4Remove: 'Retirer R4 — cette cellule',
    r4RemoveAll: 'Retirer R4 — tous "{name}"',
    rosterMarkR4: 'Marquer R4',
    rosterUnmarkR4: 'Retirer R4',
    leftBadge: 'LEFT',
    leftThisCell: 'Marquer parti — cette cellule',
    leftAllCells: 'Marquer parti — tous "{name}"',
    leftRemove: 'Retirer parti — cette cellule',
    leftRemoveAll: 'Retirer parti — tous "{name}"',
    rosterMarkLeft: 'Marquer parti',
    rosterUnmarkLeft: 'Retirer parti',
    rosterHighlight: 'Surligner dans le planning',
    rosterUnhighlight: 'Effacer le surlignage',
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
    shareDesc: 'Créez et copiez un lien court pour partager votre programme et effectif :',
    shareIncludeRoster: "Inclure l'effectif",
    shareCopy: 'Copier',
    shareCopied: 'Copié !',
    shareClose: 'Fermer',
    shareSize: 'Taille des données : {size} caractères',
    shareLoaded: 'Données chargées !',
    shareLoadConfirm: 'Ce lien contient des données. Les charger ? (remplace les données actuelles)',
    shareYes: 'Charger',
    shareNo: 'Annuler',
    shareWarn: 'Le partage par lien court est indisponible pour le moment. Utilisez « Télécharger .json ».',
    shareDownload: 'Télécharger .json',
    shareCreating: 'Création...',
    shareError: 'Impossible de créer le lien de partage',
    shareMissing: 'Ce lien de partage est introuvable ou a expiré.',
    shareLinkPlaceholder: 'Le lien apparaîtra ici après avoir cliqué sur Copier',
    editCellTitle: 'Modifier : {field}',
    editCellSave: 'Enregistrer',
    editCellCancel: 'Annuler',
    downloadSchedule: 'Télécharger CSV',
    downloadRoster: "Télécharger l'effectif",
    hintsTips: 'Astuces',
    hintsDismiss: 'Compris',
    hintR4: 'Clic droit (appui long) sur un nom pour les marques, le surlignage ou renommer',
    hintRename: "Cliquez sur un nom dans l'Effectif pour le renommer partout",
    hintNotes: 'Ajoutez une note après le nom : Smith (Anniversaire) — les notes sont conservées',
    hintDrag: "Faites glisser les lignes surlignées pour déplacer la fenêtre",
    hintDateFill: 'Cliquez sur une date pour remplir automatiquement',
    hintKeyboard: 'Cliquez sur une cellule pour ouvrir la fenêtre d\'édition ; Ctrl+Z / Y pour annuler',
    hintSubRow: 'Le + du haut ajoute une ligne récente, le + du bas ajoute une ligne plus ancienne, et le + d\'une ligne ajoute une sous-ligne',
    rename: 'Renommer',
    renameAll: 'Renommer "{name}" partout',
    renamePrompt: 'Nouveau nom pour "{name}" :',
    resetBtn: 'Réinitialiser',
    resetTitle: 'Réinitialiser toutes les données',
    resetDesc: 'Cela supprimera définitivement toutes les lignes, l\'effectif et les paramètres. Cette action est irréversible.',
    resetConfirmText: 'Tapez RESET pour confirmer :',
    resetConfirm: 'Tout réinitialiser',
    resetCancel: 'Annuler',
    themeToLight: 'Passer au thème clair',
    themeToDark: 'Passer au thème sombre',
  },
};

const LANG_KEY = 'schedule_lang';
const DATA_KEY = 'schedule_data';
const THEME_KEY = 'schedule_theme';
let currentLang = localStorage.getItem(LANG_KEY) || 'en';
let currentTheme = 'dark';

function t(key) { return TRANSLATIONS[currentLang][key] || TRANSLATIONS.en[key] || key; }

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme() {
  document.documentElement.dataset.theme = currentTheme;
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;
  const label = currentTheme === 'light' ? t('themeToDark') : t('themeToLight');
  themeBtn.title = label;
  themeBtn.setAttribute('aria-label', label);
}

function loadTheme() {
  currentTheme = getPreferredTheme();
  applyTheme();
}

function toggleTheme() {
  currentTheme = currentTheme === 'light' ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, currentTheme);
  applyTheme();
}

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
  document.getElementById('importScheduleBtn').title = t('importSchedule');
  document.getElementById('importRosterBtn').title = t('importRoster');
  document.getElementById('shareBtn').textContent = t('share');
  document.getElementById('addRowInline').title = t('addNewestRow');
  document.getElementById('addPastRowBtn').title = t('addPastRow');
  document.getElementById('hintsToggle').title = t('hintsTips');
  document.getElementById('resetBtn').textContent = t('resetBtn');
  document.getElementById('resetModalTitle').textContent = t('resetTitle');
  document.getElementById('resetModalDesc').textContent = t('resetDesc');
  document.getElementById('resetModalConfirmText').innerHTML = t('resetConfirmText').replace('RESET', '<strong>RESET</strong>');
  document.getElementById('resetModalConfirm').textContent = t('resetConfirm');
  document.getElementById('resetModalCancel').textContent = t('resetCancel');
  applyTheme();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });
  renderTable();
  renderRoster();
}

// ── Name extraction (strip notes) ────────────────────
// "Smith (sick)" → "Smith", "Alice [backup]" → "Alice", "Bob {note}" → "Bob"
// "Dave "why"" → "Dave", but "O'Connor" stays "O'Connor" (no space before quote)
function extractName(val) {
  if (!val) return '';
  return val
    .replace(/\s*[\(\[\{].*$/, '')
    .replace(/\s+["""'''"'].*/g, '')
    .trim();
}
function nameKey(val) { return extractName(val).toLowerCase(); }

// ── Clipboard helper ─────────────────────────────────
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return fallbackCopy(text);
}

function fallbackCopy(text) {
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
    } catch (e) { reject(e); }
    finally { ta.remove(); }
  });
}

// ── File download helper ─────────────────────────────
function downloadFile(filename, content, mime) {
  const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 100);
}

// ── Global rename ────────────────────────────────────
function renamePlayer(oldName, newName) {
  if (!oldName || !newName || oldName === newName) return;
  const oldKey = nameKey(oldName);
  const newKey = nameKey(newName);

  pushUndo();
  // Update all schedule cells — preserve trailing notes
  rows.forEach(r => {
    if (nameKey(r.conductor) === oldKey) {
      const suffix = r.conductor.slice(extractName(r.conductor).length);
      r.conductor = newName.trim() + suffix;
    }
    if (nameKey(r.vip) === oldKey) {
      const suffix = r.vip.slice(extractName(r.vip).length);
      r.vip = newName.trim() + suffix;
    }
  });
  saveData();

  // Update roster entry — merge if target exists
  if (roster[oldKey]) {
    const oldEntry = roster[oldKey];
    if (oldKey !== newKey) {
      if (roster[newKey]) {
        // Merge: keep R4 if either had it
        roster[newKey].r4 = roster[newKey].r4 || oldEntry.r4;
        roster[newKey].left = roster[newKey].left || oldEntry.left;
      } else {
        roster[newKey] = { display: newName.trim(), r4: oldEntry.r4, left: oldEntry.left };
      }
      delete roster[oldKey];
    } else {
      oldEntry.display = newName.trim();
    }
    saveRoster();
  }

  // Reconcile marks after rename: the old key has no more cells, the new key
  // may have merged cells from other sources. Recompute both.
  let markChanged = false;
  if (roster[oldKey] && syncRosterMarksForKey(oldKey)) markChanged = true;
  if (roster[newKey] && syncRosterMarksForKey(newKey)) markChanged = true;
  if (markChanged) saveRoster();

  // Migrate highlight key to follow the rename so the visual marker is
  // never orphaned. Clear if the new key no longer exists in the roster.
  if (highlightedRosterKey === oldKey) {
    highlightedRosterKey = roster[newKey] ? newKey : '';
    saveHighlightedRosterKey();
  }

  renderTable();
  renderRoster();
}

function toggleR4Player(name) {
  const key = nameKey(name);
  if (!roster[key]) return;
  const newVal = !roster[key].r4;
  pushUndo();
  roster[key].r4 = newVal;
  // Propagate to all cells
  rows.forEach(r => {
    if (nameKey(r.conductor) === key) r.r4c = newVal;
    if (nameKey(r.vip) === key) r.r4v = newVal;
  });
  saveRoster();
  saveData();
  renderTable();
  renderRoster();
}

function toggleLeftPlayer(name) {
  const key = nameKey(name);
  if (!roster[key]) return;
  const newVal = !roster[key].left;
  pushUndo();
  roster[key].left = newVal;
  rows.forEach(r => {
    if (nameKey(r.conductor) === key) r.leftc = newVal;
    if (nameKey(r.vip) === key) r.leftv = newVal;
  });
  saveRoster();
  saveData();
  renderTable();
  renderRoster();
}

// ── Data ──────────────────────────────────────────────
let rows = [];

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function newRow(group) {
  return {
    id: uid(),
    group: group || uid(),
    date: '',
    conductor: '',
    vip: '',
    r4c: false,
    r4v: false,
    leftc: false,
    leftv: false
  };
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
        if (r.leftc === undefined) r.leftc = false;
        if (r.leftv === undefined) r.leftv = false;
      });
      // Migrate order: if dates are ascending (oldest first), reverse to newest first
      ensureNewestFirst(rows);
      return;
    }
  } catch {}
  rows = [newRow()];
}

function ensureNewestFirst(arr) {
  const dates = arr.filter(r => r.date).map(r => parseDate(r.date)).filter(Boolean);
  if (dates.length < 2 || dates[0] >= dates[dates.length - 1]) return;
  // Reverse groups as units, preserving sub-row order within each group
  const groups = [];
  let current = [];
  let currentGroup = null;
  arr.forEach(r => {
    if (r.group !== currentGroup) {
      if (current.length) groups.push(current);
      current = [r];
      currentGroup = r.group;
    } else {
      current.push(r);
    }
  });
  if (current.length) groups.push(current);
  groups.reverse();
  // Within each group, ensure the row with a date (leader) stays first
  groups.forEach(g => {
    const leaderIdx = g.findIndex(r => r.date);
    if (leaderIdx > 0) {
      const [leader] = g.splice(leaderIdx, 1);
      g.unshift(leader);
    }
  });
  arr.length = 0;
  groups.forEach(g => g.forEach(r => arr.push(r)));
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

// Snapshots are stored as JSON strings. Parsing lazily on apply avoids
// keeping a deep-cloned object graph in memory for every history step.
function makeSnapshot() {
  return JSON.stringify({ rows: rows, roster: roster });
}

function applySnapshot(snap) {
  const parsed = typeof snap === 'string'
    ? JSON.parse(snap)
    : snap; // tolerate legacy object snapshots if any remain mid-session
  rows.length = 0;
  parsed.rows.forEach(r => rows.push(r));
  // Restore roster
  Object.keys(roster).forEach(k => delete roster[k]);
  Object.keys(parsed.roster).forEach(k => { roster[k] = parsed.roster[k]; });
  saveData();
  saveRoster();
  renderTable();
  renderRoster();
}

function pushUndo() {
  undoStack.push(makeSnapshot());
  if (undoStack.length > MAX_HISTORY) undoStack.shift();
  redoStack.length = 0;
  updateUndoRedoButtons();
}

function undo() {
  if (undoStack.length === 0) return;
  redoStack.push(makeSnapshot());
  applySnapshot(undoStack.pop());
  updateUndoRedoButtons();
}

function redo() {
  if (redoStack.length === 0) return;
  undoStack.push(makeSnapshot());
  applySnapshot(redoStack.pop());
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

function getEdgeGroupDate(edge) {
  const leaders = getGroupLeaders();
  if (!leaders.length) return null;
  const ordered = edge === 'bottom' ? leaders.slice().reverse() : leaders;
  for (const leaderIdx of ordered) {
    const parsed = parseDate(rows[leaderIdx].date);
    if (parsed) return parsed;
  }
  return null;
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
    const offset = baseGroupIdx - gi;
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
  const releaseFocus = trapFocus(overlay);

  return new Promise((resolve) => {
    function cleanup() {
      overlay.classList.remove('visible');
      document.getElementById('modalConfirm').removeEventListener('click', onConfirm);
      document.getElementById('modalCancel').removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      document.removeEventListener('keydown', onKey);
      releaseFocus();
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

// escapeHtml does not escape quotes; use this for attribute values.
function escapeAttr(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Modal focus trap ────────────────────────────────
// Keeps keyboard focus within the overlay while it is open, and restores
// focus to the previously-active element when released.
const FOCUS_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(root) {
  return Array.from(root.querySelectorAll(FOCUS_SELECTOR)).filter(el => {
    if (el.offsetParent === null && el !== document.activeElement) return false;
    return !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true';
  });
}

function trapFocus(overlay) {
  const previousActive = document.activeElement;
  const focusable = getFocusable(overlay);
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (first && !overlay.contains(document.activeElement)) first.focus();

  function onKey(e) {
    if (e.key !== 'Tab') return;
    const list = getFocusable(overlay);
    if (!list.length) { e.preventDefault(); return; }
    const f = list[0];
    const l = list[list.length - 1];
    if (e.shiftKey && document.activeElement === f) {
      e.preventDefault();
      l.focus();
    } else if (!e.shiftKey && document.activeElement === l) {
      e.preventDefault();
      f.focus();
    }
  }
  overlay.addEventListener('keydown', onKey);

  return function release() {
    overlay.removeEventListener('keydown', onKey);
    if (previousActive && typeof previousActive.focus === 'function') {
      try { previousActive.focus(); } catch {}
    }
  };
}

// Per-render cache of the HTML string for each <tr> segment. Used by the diff
// path in renderTable() to avoid rebuilding untouched rows on every mutation.
let lastRenderSegments = [];

function renderTable() {
  const w = occ.enabled ? getOccWindow() : null;
  const gCounts = w ? buildGeneralCounts(w.active) : null;
  const cCounts = w ? buildCounts(w.active, 'conductor') : null;
  const vCounts = w ? buildCounts(w.active, 'vip') : null;

  let winFirst = -1, winLast = -1, gripInserted = false;
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

  function cellHtml(value, placeholder, marks, counts) {
    const isHighlighted = typeof highlightedRosterKey !== 'undefined' &&
      highlightedRosterKey &&
      nameKey(value) === highlightedRosterKey;
    const markTags =
      (marks.r4 ? '<span class="r4-badge">R4</span>' : '') +
      (marks.left ? `<span class="left-badge">${escapeHtml(t('leftBadge'))}</span>` : '');
    if (!value) return `<span class="placeholder">${escapeHtml(placeholder)}</span>`;
    if (counts) {
      const cls = [
        occClass(value, counts),
        marks.left ? 'left-name' : '',
        isHighlighted ? 'highlighted-name' : ''
      ].filter(Boolean).join(' ');
      const safe = escapeHtml(value);
      return (cls ? `<span class="${cls}">${safe}</span>` : safe) + markTags;
    }
    const nameClasses = [marks.left ? 'left-name' : '', isHighlighted ? 'highlighted-name' : '']
      .filter(Boolean).join(' ');
    return (nameClasses ? `<span class="${nameClasses}">${escapeHtml(value)}</span>` : escapeHtml(value)) + markTags;
  }

  const segments = [];
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

    let leader = `<tr${rowClasses(i)} data-id="${escapeAttr(row.id)}">`;
      leader += `<td${span > 1 ? ` rowspan="${span}"` : ''}><div class="cell" data-field="date" data-index="${i}">${dateDisplay}</div></td>`;
      leader += `<td><div class="cell${row.r4c ? ' cell-r4' : ''}${row.leftc ? ' cell-left' : ''}${typeof highlightedRosterKey !== 'undefined' && highlightedRosterKey && nameKey(row.conductor) === highlightedRosterKey ? ' cell-highlighted-name' : ''}" data-field="conductor" data-index="${i}">${cellHtml(row.conductor, t('conductor'), { r4: row.r4c, left: row.leftc }, inWin(i) ? gCounts : null)}</div></td>`;
      leader += `<td><div class="cell${row.r4v ? ' cell-r4' : ''}${row.leftv ? ' cell-left' : ''}${typeof highlightedRosterKey !== 'undefined' && highlightedRosterKey && nameKey(row.vip) === highlightedRosterKey ? ' cell-highlighted-name' : ''}" data-field="vip" data-index="${i}">${cellHtml(row.vip, t('vip'), { r4: row.r4v, left: row.leftv }, inWin(i) ? gCounts : null)}</div></td>`;
    leader += `<td><div class="row-actions">`;
    leader += `<button class="btn-subrow" data-index="${i}" title="${escapeAttr(t('addSubRow'))}"><svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 0 1 0-2h5V2a1 1 0 0 1 1-1z"/></svg></button>`;
    leader += `<button class="btn-delete" data-index="${i}" title="Delete">&times;</button>`;
    leader += `</div></td></tr>`;
    segments.push(leader);

    for (let k = 1; k < span; k++) {
      const si = groupRows[k];
      const sr = rows[si];
      let sub = `<tr${rowClasses(si, 'subrow')} data-id="${escapeAttr(sr.id)}">`;
      sub += `<td><div class="cell${sr.r4c ? ' cell-r4' : ''}${sr.leftc ? ' cell-left' : ''}${typeof highlightedRosterKey !== 'undefined' && highlightedRosterKey && nameKey(sr.conductor) === highlightedRosterKey ? ' cell-highlighted-name' : ''}" data-field="conductor" data-index="${si}">${cellHtml(sr.conductor, t('conductor'), { r4: sr.r4c, left: sr.leftc }, inWin(si) ? gCounts : null)}</div></td>`;
      sub += `<td><div class="cell${sr.r4v ? ' cell-r4' : ''}${sr.leftv ? ' cell-left' : ''}${typeof highlightedRosterKey !== 'undefined' && highlightedRosterKey && nameKey(sr.vip) === highlightedRosterKey ? ' cell-highlighted-name' : ''}" data-field="vip" data-index="${si}">${cellHtml(sr.vip, t('vip'), { r4: sr.r4v, left: sr.leftv }, inWin(si) ? gCounts : null)}</div></td>`;
      sub += `<td><div class="row-actions">`;
      sub += `<button class="btn-subrow" data-index="${si}" title="${escapeAttr(t('addSubRow'))}"><svg width="12" height="12" viewBox="0 0 16 16"><path d="M8 1a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2H9v5a1 1 0 1 1-2 0V9H2a1 1 0 0 1 0-2h5V2a1 1 0 0 1 1-1z"/></svg></button>`;
      sub += `<button class="btn-delete" data-index="${si}" title="Delete">&times;</button>`;
      sub += `</div></td></tr>`;
      segments.push(sub);
    }
    // Insert drag grip after last window row
    const groupIndices = groupRows;
    if (w && groupIndices.some(gi => gi === winLast) && !gripInserted) {
      segments.push(`<tr class="occ-grip-row"><td colspan="4"><div class="occ-grip" title="Drag to move window"><span class="occ-grip-dot"></span><span class="occ-grip-dot"></span><span class="occ-grip-dot"></span></div></td></tr>`);
      gripInserted = true;
    }
    i = j;
  }

  // Diff path: if segment count matches, swap only the rows whose HTML changed.
  // Otherwise fall back to a full innerHTML replace (structural change).
  const prev = lastRenderSegments;
  const children = tbody.children;
  if (prev.length === segments.length && children.length === segments.length) {
    const tmp = document.createElement('tbody');
    for (let k = 0; k < segments.length; k++) {
      if (segments[k] !== prev[k]) {
        tmp.innerHTML = segments[k];
        const fresh = tmp.firstElementChild;
        if (fresh) tbody.replaceChild(fresh, children[k]);
      }
    }
  } else {
    tbody.innerHTML = segments.join('');
  }
  lastRenderSegments = segments;

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
// Cells open a modal popup (matching the style of other app modals) that
// edits one value at a time. No inline editor, no keyboard grid navigation
// — intentionally simple. Modeled after the roster rename flow.
function openCellEditor(index, field) {
  if (!rows[index]) return;
  dismissHint();

  // Capture the row identity by id — the numeric index can shift if undo/redo
  // or any other mutation reorders rows while the modal is open.
  const rowId = rows[index].id;
  const fieldLabel = t(field);
  const currentValue = rows[index][field] || '';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay visible cell-edit-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <h3 class="cell-edit-title"></h3>
      <input type="text" class="cell-edit-input" />
      <div class="modal-actions">
        <button class="btn-cancel cell-edit-cancel" type="button"></button>
        <button class="btn cell-edit-save" type="button"></button>
      </div>
    </div>
  `;
  const heading = overlay.querySelector('.cell-edit-title');
  heading.textContent = t('editCellTitle').replace('{field}', fieldLabel);
  const input = overlay.querySelector('.cell-edit-input');
  input.value = currentValue;
  input.placeholder = field === 'date' ? t('datePlaceholder') : fieldLabel;
  const cancelBtn = overlay.querySelector('.cell-edit-cancel');
  cancelBtn.textContent = t('editCellCancel');
  const saveBtn = overlay.querySelector('.cell-edit-save');
  saveBtn.textContent = t('editCellSave');

  document.body.appendChild(overlay);
  const releaseFocus = trapFocus(overlay);
  // Defer focus so the overlay's fade-in doesn't race with the trap's first-focus.
  requestAnimationFrame(() => { input.focus(); input.select(); });

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    document.removeEventListener('keydown', onKey, true);
    releaseFocus();
    overlay.remove();
  }

  function commit() {
    if (closed) return;
    // Re-resolve the index from the captured row id — the row may have moved
    // if the array was mutated while the modal was open.
    const liveIndex = rows.findIndex(r => r.id === rowId);
    if (liveIndex === -1) { close(); return; }
    const oldVal = rows[liveIndex][field];
    let val = input.value.trim();
    if (field === 'date' && val) val = normalizeDate(val);

    if (val === oldVal) { close(); return; }

    pushUndo();
    rows[liveIndex][field] = val;
    if (field === 'date') {
      const group = rows[liveIndex].group;
      rows.forEach(r => { if (r.group === group) r.date = val; });
    }
    // Auto-add to roster + mark auto-detect, but preserve cell-specific marks
    // when the underlying player key did not actually change (e.g. notes edited).
    if (field === 'conductor' || field === 'vip') {
      const r4Field = field === 'conductor' ? 'r4c' : 'r4v';
      const leftField = field === 'conductor' ? 'leftc' : 'leftv';
      const prevR4 = rows[liveIndex][r4Field];
      const prevLeft = rows[liveIndex][leftField];
      const oldKey = nameKey(oldVal);
      const nextKey = nameKey(val);

      rows[liveIndex][r4Field] = false;
      rows[liveIndex][leftField] = false;
      if (val) {
        addToRoster(val);
        if (nextKey && nextKey === oldKey) {
          rows[liveIndex][r4Field] = prevR4;
          rows[liveIndex][leftField] = prevLeft;
        } else if (roster[nextKey]) {
          if (roster[nextKey].r4) rows[liveIndex][r4Field] = true;
          if (roster[nextKey].left) rows[liveIndex][leftField] = true;
        }
      }
      let rosterChanged = false;
      [oldKey, nextKey].filter(Boolean).filter((k, i, arr) => arr.indexOf(k) === i).forEach(k => {
        if (roster[k] && syncRosterMarksForKey(k)) rosterChanged = true;
      });
      if (rosterChanged) saveRoster();
      renderRoster();
    }
    saveData();
    renderTable();
    close();
  }

  function onKey(e) {
    // Swallow undo/redo while the modal is open — letting them through would
    // mutate the rows array under us and could invalidate the captured row id.
    if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z' || e.key === 'y' || e.key === 'Y')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
      // If focus is on Cancel, Enter should cancel — matching button semantics.
      if (document.activeElement === cancelBtn) {
        e.preventDefault();
        close();
        return;
      }
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  }
  // Capture phase so we run before the global undo/redo handler.
  document.addEventListener('keydown', onKey, true);
  saveBtn.addEventListener('click', commit);
  cancelBtn.addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
}

// ── Event delegation ─────────────────────────────────
tbody.addEventListener('click', (e) => {
  if (e.target.closest('.fill-hint')) return;

  const subBtn = e.target.closest('.btn-subrow');
  if (subBtn) {
    const index = parseInt(subBtn.dataset.index);
    const group = rows[index].group;
    pushUndo();
    const sub = {
      id: uid(),
      group: group,
      date: '',
      conductor: '',
      vip: '',
      r4c: false,
      r4v: false,
      leftc: false,
      leftv: false
    };
    rows.splice(index + 1, 0, sub);
    saveData();
    renderTable();
    openCellEditor(index + 1, 'conductor');
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

    // Capture affected keys before splice so we can reconcile roster marks after.
    const affectedKeys = [nameKey(rows[index].conductor), nameKey(rows[index].vip)]
      .filter((k, i, arr) => k && arr.indexOf(k) === i);

    rows.splice(index, 1);
    if (rows.length === 0) rows.push(newRow());
    saveData();

    let rosterChanged = false;
    affectedKeys.forEach(k => {
      if (roster[k] && syncRosterMarksForKey(k)) rosterChanged = true;
    });
    if (rosterChanged) {
      saveRoster();
      renderRoster();
    }

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
      openCellEditor(index, field);
    } else {
      showFillHint(cell, index);
    }
    return;
  }

  openCellEditor(index, field);
});

// ── Add row ──────────────────────────────────────────
function addNewRow() {
  pushUndo();
  const row = newRow();
  const newestDate = getEdgeGroupDate('top');
  if (newestDate) {
    row.date = formatDate(addDays(newestDate, 1));
  }
  rows.unshift(row);
  saveData();
  renderTable();
  openCellEditor(0, row.date ? 'conductor' : 'date');
}

document.getElementById('addRowInline').addEventListener('click', addNewRow);

function addPastRow() {
  pushUndo();
  const row = newRow();
  const oldestDate = getEdgeGroupDate('bottom');
  if (oldestDate) {
    row.date = formatDate(addDays(oldestDate, -1));
  }
  rows.push(row);
  saveData();
  renderTable();
  openCellEditor(rows.length - 1, row.date ? 'conductor' : 'date');
}

document.getElementById('addPastRowBtn').addEventListener('click', addPastRow);

// ── Export ────────────────────────────────────────────
document.getElementById('exportBtn').addEventListener('click', () => {
  const header = [t('date'), t('conductor'), t('vip'), 'R4C', 'R4V', 'LEFTC', 'LEFTV'].join('\t');
  const seenGroups = new Set();
  const body = rows.map(r => {
    const showDate = !seenGroups.has(r.group);
    seenGroups.add(r.group);
    return [
      showDate ? r.date : '',
      r.conductor,
      r.vip,
      r.r4c ? '1' : '',
      r.r4v ? '1' : '',
      r.leftc ? '1' : '',
      r.leftv ? '1' : ''
    ].join('\t');
  }).join('\n');
  const text = header + '\n' + body;

  copyToClipboard(text).then(() => {
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
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// ── Reset all data ──────────────────────────────────
(function initReset() {
  const overlay = document.getElementById('resetModalOverlay');
  const input = document.getElementById('resetConfirmInput');
  const confirmBtn = document.getElementById('resetModalConfirm');
  let releaseFocus = null;

  function openResetModal() {
    input.value = '';
    confirmBtn.disabled = true;
    overlay.classList.add('visible');
    setTimeout(() => input.focus(), 100);
    releaseFocus = trapFocus(overlay);
  }

  function closeResetModal() {
    overlay.classList.remove('visible');
    input.value = '';
    confirmBtn.disabled = true;
    if (releaseFocus) { releaseFocus(); releaseFocus = null; }
  }

  document.getElementById('resetBtn').addEventListener('click', openResetModal);
  document.getElementById('resetModalCancel').addEventListener('click', closeResetModal);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeResetModal();
  });

  input.addEventListener('input', () => {
    confirmBtn.disabled = input.value.trim() !== 'RESET';
  });

  confirmBtn.addEventListener('click', () => {
    if (input.value.trim() !== 'RESET') return;
    const keys = [
      'schedule_data', 'schedule_roster', 'schedule_occ',
      'schedule_lang', 'schedule_roster_vis', 'schedule_hints_seen',
      'schedule_theme', 'schedule_roster_highlight'
    ];
    keys.forEach(k => localStorage.removeItem(k));
    location.reload();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('visible')) closeResetModal();
    if (e.key === 'Enter' && overlay.classList.contains('visible') && !confirmBtn.disabled) {
      confirmBtn.click();
    }
  });
})();
