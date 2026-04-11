// ── Hints / Tips ───────────────────────────────────
const HINTS_SEEN_KEY = 'schedule_hints_seen';
const HINT_KEYS = ['hintR4', 'hintDrag', 'hintDateFill', 'hintKeyboard', 'hintSubRow'];

function renderHints() {
  document.getElementById('hintsTitle').textContent = t('hintsTips');
  document.getElementById('hintsDismiss').textContent = t('hintsDismiss');
  document.getElementById('hintsBody').innerHTML = HINT_KEYS.map(key =>
    `<div class="hint-item">${escapeHtml(t(key))}</div>`
  ).join('');
}

(function initHints() {
  const seen = localStorage.getItem(HINTS_SEEN_KEY) === '1';
  const dot = document.getElementById('hintsDot');
  const panel = document.getElementById('hintsPanel');

  if (!seen) dot.classList.add('visible');

  document.getElementById('hintsToggle').addEventListener('click', () => {
    const isVisible = panel.classList.toggle('visible');
    if (isVisible) {
      renderHints();
      dot.classList.remove('visible');
      localStorage.setItem(HINTS_SEEN_KEY, '1');
    }
  });

  document.getElementById('hintsDismiss').addEventListener('click', () => {
    panel.classList.remove('visible');
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('visible') &&
        !panel.contains(e.target) &&
        !document.getElementById('hintsToggle').contains(e.target)) {
      panel.classList.remove('visible');
    }
  });
})();
