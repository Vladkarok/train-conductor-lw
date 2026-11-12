import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp, makeRows } from './helpers/load-app.js';

let app;
let run;

beforeEach(() => {
  app = loadApp();
  run = app.run;
});

function setRows(list) {
  run('rows').length = 0;
  run('rows').push(...JSON.parse(JSON.stringify(list)));
}

function setOcc(values) {
  Object.assign(run('occ'), values);
}

const renders = () => run('__renders.table');
const savedOcc = () => JSON.parse(app.localStorage.getItem('schedule_occ'));
const el = id => app.document.getElementById(id);

// Five dated groups (newest first, as the app stores them); 03.05 has a sub-row.
const fiveDays = () => makeRows([
  ['05.05.2026', 'Alice', 'Bob'],
  ['04.05.2026', 'alice (late)', 'Carol'],
  ['03.05.2026', 'Bob', 'Alice'],
  ['', 'Dave', 'ALICE'],
  ['02.05.2026', 'Carol', 'Bob'],
  ['01.05.2026', 'Eve', '']
]);

describe('saved occurrence state', () => {
  it('starts disabled with a 7-day window', () => {
    expect({ ...run('occ') }).toEqual({ enabled: false, windowSize: 7, windowStart: 0 });
  });

  it('restores saved settings over the defaults', () => {
    app = loadApp({ storage: { schedule_occ: JSON.stringify({ enabled: true, windowSize: 3 }) } });
    expect({ ...app.run('occ') }).toEqual({ enabled: true, windowSize: 3, windowStart: 0 });
  });

  // BUG: occurrence.js parses saved state with a bare JSON.parse at load.
  // Corrupt saved state throws, occ is never defined, and every later
  // renderTable() call fails, so the schedule never renders until site data
  // is cleared. app.js guards its own JSON.parse calls with try/catch.
  it.fails('falls back to defaults when saved state is not valid JSON', () => {
    app = loadApp({ storage: { schedule_occ: '{"enabled":tru' } });
    expect(app.run('occ').windowSize).toBe(7);
  });
});

describe('getOrderedGroups', () => {
  it('lists groups in table order with the row indices of each', () => {
    setRows(fiveDays());
    expect(run('getOrderedGroups')().map(g => g.indices)).toEqual([[0], [1], [2, 3], [4], [5]]);
  });

  it('returns no groups for an empty schedule', () => {
    setRows([]);
    expect(run('getOrderedGroups')()).toEqual([]);
  });

  it('treats rows of one group that are not next to each other as separate groups', () => {
    const rows = makeRows([['02.05.2026', 'A', ''], ['01.05.2026', 'B', ''], ['', 'C', '']]);
    rows[2].group = rows[0].group;
    setRows(rows);
    expect(run('getOrderedGroups')().map(g => g.indices)).toEqual([[0], [1], [2]]);
  });
});

describe('getOccWindow', () => {
  beforeEach(() => setRows(fiveDays()));

  it('covers the newest N groups and their sub-rows', () => {
    setOcc({ windowSize: 3, windowStart: 0 });
    const w = run('getOccWindow')();
    expect([w.total, w.size]).toEqual([5, 3]);
    expect(w.active.map(g => g.indices)).toEqual([[0], [1], [2, 3]]);
    expect([...w.windowIndices].sort()).toEqual([0, 1, 2, 3]);
  });

  it('shrinks to the whole schedule when it has fewer groups than the window', () => {
    setOcc({ windowSize: 7 });
    const w = run('getOccWindow')();
    expect([w.total, w.size, w.active.length]).toEqual([5, 5, 5]);
  });

  it('pulls a start past the end back to the last full window', () => {
    setOcc({ windowSize: 2, windowStart: 99 });
    const w = run('getOccWindow')();
    expect(run('occ').windowStart).toBe(3);
    expect(w.active.map(g => g.indices)).toEqual([[4], [5]]);
  });

  it('pulls a negative start up to 0', () => {
    setOcc({ windowSize: 2, windowStart: -4 });
    run('getOccWindow')();
    expect(run('occ').windowStart).toBe(0);
  });

  it('handles an empty schedule', () => {
    setRows([]);
    setOcc({ windowSize: 3, windowStart: 2 });
    const w = run('getOccWindow')();
    expect([w.total, w.size, w.active.length, w.windowIndices.size]).toEqual([0, 0, 0, 0]);
    expect(run('occ').windowStart).toBe(0);
  });
});

describe('setOccWindowStart', () => {
  beforeEach(() => {
    setRows(fiveDays());
    setOcc({ windowSize: 2, windowStart: 0 });
  });

  it('moves the window, re-renders, and saves only when asked', () => {
    expect(run('setOccWindowStart')(1)).toBe(true);
    expect(run('occ').windowStart).toBe(1);
    expect(renders()).toBe(1);
    expect(app.localStorage.getItem('schedule_occ')).toBeNull();

    expect(run('setOccWindowStart')(2, { save: true })).toBe(true);
    expect(savedOcc().windowStart).toBe(2);
  });

  it('clamps to the last full window and reports no change at the edge', () => {
    expect(run('setOccWindowStart')(10)).toBe(true);
    expect(run('occ').windowStart).toBe(3);
    expect(run('setOccWindowStart')(4)).toBe(false);
    expect(run('setOccWindowStart')(-1, { render: false })).toBe(true);
    expect(run('occ').windowStart).toBe(0);
    expect(renders()).toBe(1);
  });
});

describe('buildCounts and buildGeneralCounts', () => {
  beforeEach(() => setRows(fiveDays()));
  const groups = () => run('getOrderedGroups')();
  const asObject = map => Object.fromEntries([...map].sort());

  it('counts one column by name, ignoring case and notes', () => {
    expect(asObject(run('buildCounts')(groups(), 'conductor'))).toEqual({ alice: 2, bob: 1, carol: 1, dave: 1, eve: 1 });
    expect(asObject(run('buildCounts')(groups(), 'vip'))).toEqual({ alice: 2, bob: 2, carol: 1 });
  });

  it('counts both columns together, so a conductor-and-VIP player adds up', () => {
    expect(asObject(run('buildGeneralCounts')(groups()))).toEqual({ alice: 4, bob: 3, carol: 2, dave: 1, eve: 1 });
  });

  it('counts only the groups it is given', () => {
    const firstTwo = groups().slice(0, 2);
    expect(asObject(run('buildGeneralCounts')(firstTwo))).toEqual({ alice: 2, bob: 1, carol: 1 });
  });

  it('counts the same player twice when they hold both seats on one row', () => {
    setRows(makeRows([['01.05.2026', 'Zed', 'zed [vip]']]));
    expect(asObject(run('buildGeneralCounts')(groups()))).toEqual({ zed: 2 });
  });

  it('skips empty cells and cells that are only a note', () => {
    setRows(makeRows([['01.05.2026', '', '(nobody)'], ['', '   ', '[tbd]']]));
    expect(run('buildGeneralCounts')(groups()).size).toBe(0);
  });
});

describe('occClass', () => {
  const counts = () => new Map([['alice', 1], ['bob', 2], ['carol', 5], ['dave', 9]]);
  const cls = (value, c = counts()) => run('occClass')(value, c);

  it('marks names seen at least twice, capped at level 5', () => {
    expect([cls('Alice'), cls('Bob'), cls('carol'), cls('Dave')]).toEqual(['', 'occ-2', 'occ-5', 'occ-5']);
  });

  it('matches by name without the note', () => {
    expect(cls('BOB (sub)')).toBe('occ-2');
  });

  it('returns no class for unknown, empty or uncounted values', () => {
    expect([cls('Eve'), cls(''), cls('Bob', null)]).toEqual(['', '', '']);
  });
});

describe('renderOccStats', () => {
  const render = () => {
    const w = run('getOccWindow')();
    run('renderOccStats')(
      run('buildGeneralCounts')(w.active),
      run('buildCounts')(w.active, 'conductor'),
      run('buildCounts')(w.active, 'vip')
    );
    return el('occStatsBody').innerHTML;
  };
  const names = html => [...html.matchAll(/occ-stats-name occ-(\d)">([^<]*)</g)].map(m => [m[2], +m[1]]);

  it('hides the panel when tracking is off', () => {
    setRows(fiveDays());
    setOcc({ enabled: false });
    render();
    expect(el('occStats').classList.contains('visible')).toBe(false);
    expect(el('occStatsBody').innerHTML).toBe('');
  });

  it('lists players seen twice or more, most first, then by name', () => {
    setRows(fiveDays());
    setOcc({ enabled: true, windowSize: 7 });
    const html = render();
    expect(el('occStats').classList.contains('visible')).toBe(true);
    expect(names(html)).toEqual([['Alice', 4], ['Bob', 3], ['Carol', 2]]);
  });

  it('shows per-seat badges only for seats the player held', () => {
    setRows(makeRows([['02.05.2026', 'Carol', 'Eve'], ['01.05.2026', 'Carol', 'Bob']]));
    setOcc({ enabled: true });
    const html = render();
    expect(html).toContain(`occ-stats-badge cond">${run('TRANSLATIONS.en.occCond')} 2<`);
    expect(html).not.toContain('occ-stats-badge vip');
  });

  it('counts only inside the window but uses the first spelling from the whole table', () => {
    setRows(makeRows([
      ['03.05.2026', 'alice [x]', ''],
      ['02.05.2026', 'ALICE', 'Bob'],
      ['01.05.2026', 'Alice', 'Bob']
    ]));
    setOcc({ enabled: true, windowSize: 2, windowStart: 1 });
    expect(names(render())).toEqual([['alice', 2], ['Bob', 2]]);
  });

  it('shows the empty message when nobody repeats in the window', () => {
    setRows(fiveDays());
    setOcc({ enabled: true, windowSize: 1 });
    expect(render()).toBe(`<div class="occ-stats-empty">${run('TRANSLATIONS.en.occNoData')}</div>`);
  });

  it('escapes HTML in player names', () => {
    const evil = '<img src=x onerror=alert`1`>&';
    setRows(makeRows([['02.05.2026', evil, ''], ['01.05.2026', evil, '']]));
    setOcc({ enabled: true });
    const html = render();
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img src=x onerror=alert`1`&gt;&amp;<');
  });

  it('uses the current language for labels', () => {
    run('currentLang = "ua"');
    setRows(makeRows([['02.05.2026', 'Carol', ''], ['01.05.2026', 'Carol', '']]));
    setOcc({ enabled: true });
    render();
    expect(el('occStatsTitle').textContent).toBe(run('TRANSLATIONS.ua.occStats'));
    expect(el('occStatsBody').innerHTML).toContain(`${run('TRANSLATIONS.ua.occCond')} 2`);
  });
});

describe('occurrence controls', () => {
  beforeEach(() => setRows(fiveDays()));

  it('the toggle switches tracking, resets the window to the top and saves', () => {
    setOcc({ windowStart: 3, windowSize: 2 });
    el('occToggle').click();
    expect(savedOcc()).toEqual({ enabled: true, windowSize: 2, windowStart: 0 });
    expect(el('occToggle').classList.contains('active')).toBe(true);
    expect(el('occUp').disabled).toBe(true);
    expect(el('occDown').disabled).toBe(false);
    el('occToggle').click();
    expect(savedOcc().enabled).toBe(false);
    expect(el('occDown').disabled).toBe(true);
  });

  it('up and down move the window one group and stop at the ends', () => {
    setOcc({ enabled: true, windowSize: 3, windowStart: 0 });
    el('occUp').click();
    expect(run('occ').windowStart).toBe(0);
    el('occDown').click();
    el('occDown').click();
    el('occDown').click();
    expect(run('occ').windowStart).toBe(2);
    expect(savedOcc().windowStart).toBe(2);
    el('occUp').click();
    expect(run('occ').windowStart).toBe(1);
  });

  it('up and down do nothing while tracking is off', () => {
    setOcc({ enabled: false, windowSize: 3, windowStart: 0 });
    el('occDown').click();
    expect(run('occ').windowStart).toBe(0);
    expect(app.localStorage.getItem('schedule_occ')).toBeNull();
  });

  it('syncOccUi disables the buttons at each end of the schedule', () => {
    setOcc({ enabled: true, windowSize: 2, windowStart: 3 });
    run('syncOccUi')(run('getOccWindow')());
    expect([el('occUp').disabled, el('occDown').disabled]).toEqual([false, true]);
    setOcc({ windowSize: 7, windowStart: 0 });
    run('syncOccUi')(run('getOccWindow')());
    expect([el('occUp').disabled, el('occDown').disabled]).toEqual([true, true]);
  });

  it.each([
    ['3', 3],
    ['4.9', 4],
    ['12 days', 12]
  ])('a window size of %j is accepted as %i and resets the window', (input, size) => {
    setOcc({ windowSize: 2, windowStart: 2 });
    el('occWindow').dispatch('change', { target: { value: input } });
    expect(savedOcc()).toMatchObject({ windowSize: size, windowStart: 0 });
  });

  it.each(['0', '-2', '', 'abc'])('a window size of %j is ignored', input => {
    setOcc({ windowSize: 2, windowStart: 2 });
    el('occWindow').dispatch('change', { target: { value: input } });
    expect({ ...run('occ') }).toMatchObject({ windowSize: 2, windowStart: 2 });
    expect(app.localStorage.getItem('schedule_occ')).toBeNull();
  });
});

describe('dragging the window', () => {
  // The fake DOM has no layout, so the in-window rows report zero height and
  // the drag code falls back to its 36px default row height.
  const row = { closest: sel => (sel === 'tr.in-window' ? {} : null) };
  const drag = (fromY, toY) => {
    el('tableBody').dispatch('mousedown', { target: row, clientY: fromY });
    app.document.dispatch('mousemove', { clientY: toY });
    app.document.dispatch('mouseup', {});
  };

  beforeEach(() => {
    setRows(fiveDays());
    setOcc({ enabled: true, windowSize: 2, windowStart: 0 });
  });

  it('moves the window one group per row height and saves on release', () => {
    drag(100, 100 + 36 * 2);
    expect(run('occ').windowStart).toBe(2);
    expect(savedOcc().windowStart).toBe(2);
  });

  it('ignores movement under half a row', () => {
    drag(100, 117);
    expect(run('occ').windowStart).toBe(0);
  });

  it('stops at the last full window', () => {
    drag(0, 36 * 40);
    expect(run('occ').windowStart).toBe(3);
  });

  it('does not start while tracking is off', () => {
    setOcc({ enabled: false });
    drag(0, 36 * 2);
    expect(run('occ').windowStart).toBe(0);
  });
});
