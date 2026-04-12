# Train Conductor LW

A lightweight schedule editor for **Train Conductor** game alliances. Track who plays Conductor and VIP across dates — no backend, no accounts, just open and use.

## Features

- **Schedule table** — add rows, fill dates automatically, assign Conductor and VIP per day
- **Sub-rows** — multiple entries per date for split shifts
- **Roster** — manage alliance members with occurrence stats
- **R4 marking** — flag R4 members per cell or globally (right-click / long-press)
- **Occurrence tracking** — sliding window stats showing who played how many times
- **Notes** — annotate names with `(Birthday)`, `[backup]`, etc. without breaking matching
- **Global rename** — rename a player everywhere at once, notes preserved
- **Import / Export** — paste CSV/TSV, upload files, or copy to clipboard
- **Share** — generate a compressed URL or download a `.json` file to share schedules across devices
- **Undo / Redo** — full history with Ctrl+Z / Ctrl+Y
- **Keyboard navigation** — Tab, Enter, arrow keys for fast editing
- **i18n** — English, Ukrainian, French
- **Dark theme** — easy on the eyes

## Getting Started

No build step required. Just serve the files with any static server:

```bash
# Python
python -m http.server 3000

# Node
npx serve .

# Or simply open index.html in a browser
```

Deploy to **Cloudflare Pages**, **GitHub Pages**, **Netlify**, or any static hosting.

## Tech Stack

- Pure HTML / CSS / JavaScript — no frameworks, no dependencies
- All data stored in `localStorage`
- [lz-string](https://github.com/pieroxy/lz-string) for URL compression (vendored, MIT)

## Project Structure

```
index.html        — HTML shell, modals, layout
app.js             — core logic, i18n, undo/redo, rendering
occurrence.js      — occurrence counting and stats panel
roster.js          — roster management, R4 system, context menus
import.js          — CSV/TSV/JSON import, file download, clipboard export
hints.js           — tips panel for feature discoverability
share.js           — URL sharing with LZ-string compression
styles.css         — all styles, dark theme, responsive
vendor/            — third-party libraries (lz-string)
```

## License

[MIT](LICENSE)
