import { describe, it, expect, beforeEach } from 'vitest';
import { loadApp, makeRows } from './helpers/load-app.js';

let app;
let run;

beforeEach(() => {
  app = loadApp();
  run = app.run;
});

// Strip the random ids so results compare by content and grouping.
// Groups become 0, 1, 2... in order of first appearance.
function shape(rows) {
  const groupIndex = new Map();
  return rows.map(r => {
    if (!groupIndex.has(r.group)) groupIndex.set(r.group, groupIndex.size);
    return {
      g: groupIndex.get(r.group),
      date: r.date,
      conductor: r.conductor,
      vip: r.vip,
      r4c: r.r4c,
      r4v: r.r4v,
      leftc: r.leftc,
      leftv: r.leftv
    };
  });
}

function setRows(list) {
  run('rows').length = 0;
  run('rows').push(...JSON.parse(JSON.stringify(list)));
}

function setRoster(obj) {
  const roster = run('roster');
  Object.keys(roster).forEach(k => delete roster[k]);
  Object.assign(roster, JSON.parse(JSON.stringify(obj)));
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

// Drives the real import modal: open it, paste text, pick a mode, confirm.
async function importVia(buttonId, text, mode = 'replace') {
  const doc = app.document;
  doc.getElementById(buttonId).click();
  doc.getElementById('importTextarea').value = text;
  doc.querySelector('input[name="importMode"]:checked').value = mode;
  doc.getElementById('importModalConfirm').click();
  await flush();
}

describe('splitCsvLine', () => {
  const split = (line, d = ',') => run('splitCsvLine')(line, d);

  it('keeps delimiters inside quoted fields', () => {
    expect(split('"Smith, J",Bob')).toEqual(['Smith, J', 'Bob']);
  });

  it('turns doubled quotes inside a quoted field into one quote', () => {
    expect(split('"Dave ""Ace"" Lee",x')).toEqual(['Dave "Ace" Lee', 'x']);
  });

  it('keeps empty fields, including a trailing one', () => {
    expect(split('a,,b,')).toEqual(['a', '', 'b', '']);
    expect(split('')).toEqual(['']);
  });

  it('splits on tabs only when the delimiter is a tab', () => {
    expect(split('A, B\tC', '\t')).toEqual(['A, B', 'C']);
  });

  it('takes the rest of the line when a quote is never closed', () => {
    expect(split('"open, field,x')).toEqual(['open, field,x']);
  });
});

describe('parseScheduleData: CSV/TSV', () => {
  const parse = text => run('parseScheduleData')(text);

  it('returns null for empty or blank input', () => {
    expect(parse('')).toBeNull();
    expect(parse('  \n\t\n\r\n')).toBeNull();
  });

  it('keeps the first row when there is no header', () => {
    expect(shape(parse('01.05.2026,Alice,Bob'))).toEqual([
      { g: 0, date: '01.05.2026', conductor: 'Alice', vip: 'Bob', r4c: false, r4v: false, leftc: false, leftv: false }
    ]);
  });

  it.each([
    ['English', 'Date,Conductor,VIP'],
    ['Ukrainian', 'Дата,Провідник,VIP'],
    ['French', 'Date,Chef de train,VIP'],
    ['quoted, mixed case', '"DATE","conductor","Vip"']
  ])('skips a %s header row', (_, header) => {
    const out = parse(header + '\n01.05.2026,Alice,Bob');
    expect(out).toHaveLength(1);
    expect(out[0].conductor).toBe('Alice');
  });

  it('skips the header of a downloaded CSV that still starts with a BOM', () => {
    const out = parse('﻿Date,Conductor,VIP\n01.05.2026,Alice,Bob');
    expect(out.map(r => r.conductor)).toEqual(['Alice']);
  });

  it('normalises d.m.yyyy, d/m/yyyy and d-m-yyyy dates to dd.mm.yyyy', () => {
    const out = parse('1.5.2026,A,\n2/6/2026,B,\n3-7-2026,C,\n31.12.2026,D,');
    expect(out.map(r => r.date)).toEqual(['01.05.2026', '02.06.2026', '03.07.2026', '31.12.2026']);
  });

  it('keeps date text it does not recognise as typed', () => {
    const out = parse('2026-05-01,A,\n1.5.26,B,\nMonday,C,');
    expect(out.map(r => r.date)).toEqual(['2026-05-01', '1.5.26', 'Monday']);
  });

  it('puts rows without a date into the group of the dated row above', () => {
    const out = parse('01.05.2026,A,B\n,C,D\n02.05.2026,E,F\n,G,H\n,I,J');
    expect(shape(out).map(r => [r.g, r.date, r.conductor])).toEqual([
      [0, '01.05.2026', 'A'],
      [0, '', 'C'],
      [1, '02.05.2026', 'E'],
      [1, '', 'G'],
      [1, '', 'I']
    ]);
  });

  it('gives leading undated rows one shared group of their own', () => {
    const out = parse(',A,\n,B,\n01.05.2026,C,');
    expect(shape(out).map(r => r.g)).toEqual([0, 0, 1]);
  });

  it('ignores blank lines and handles CRLF line endings', () => {
    const out = parse('01.05.2026,A,B\r\n\r\n   \r\n02.05.2026,C,D\r\n');
    expect(out.map(r => [r.date, r.vip])).toEqual([['01.05.2026', 'B'], ['02.05.2026', 'D']]);
  });

  it('fills missing columns with empty names and unset flags', () => {
    const [row] = parse('01.05.2026');
    expect(row).toMatchObject({ date: '01.05.2026', conductor: '', vip: '', r4c: false, r4v: false, leftc: false, leftv: false });
  });

  it('sets a flag for any non-blank mark in columns 4 to 7', () => {
    const out = parse('01.05.2026,A,B,1,,x,\n,C,D, ,yes,,LEFT');
    expect(out.map(r => [r.r4c, r.r4v, r.leftc, r.leftv])).toEqual([
      [true, false, true, false],
      [false, true, false, true]
    ]);
  });

  it('switches to tab-separated mode when any line has a tab, so commas stay in names', () => {
    const out = parse('01.05.2026\tSmith, J\tBob\n\tAlice, Jr\t"Carol, K"');
    expect(out.map(r => [r.date, r.conductor, r.vip])).toEqual([
      ['01.05.2026', 'Smith, J', 'Bob'],
      ['', 'Alice, Jr', 'Carol, K']
    ]);
  });

  it('trims spaces around fields and unquotes them', () => {
    const [row] = parse(' 01.05.2026 , "Alice" ,  Bob  ');
    expect([row.date, row.conductor, row.vip]).toEqual(['01.05.2026', 'Alice', 'Bob']);
  });

  it('keeps unusual names: non-Latin, emoji, notes, apostrophes', () => {
    const [row] = parse('01.05.2026,Олена (backup),O\'Connor 🚂');
    expect([row.conductor, row.vip]).toEqual(['Олена (backup)', 'O\'Connor 🚂']);
  });

  it('gives every row its own id', () => {
    const out = parse('01.05.2026,A,\n,B,\n,C,');
    expect(new Set(out.map(r => r.id)).size).toBe(3);
  });

  // Header detection used to check whether any cell of the first line merely
  // contained "date", "vip", "chef", ... so a headerless paste whose first
  // row had a player such as "Viper", "Chefo" or "Update" lost that row.
  it('keeps a headerless first row whose player name contains "vip"', () => {
    expect(parse('01.05.2026,Viper,Bob')).toHaveLength(1);
  });

  it('keeps a headerless first row whose player name contains "date"', () => {
    const out = parse('01.05.2026,Update,Bob\n02.05.2026,Alice,Bob');
    expect(out.map(r => r.conductor)).toEqual(['Update', 'Alice']);
  });

  it.each([
    ['a header word as a name, dated', '01.05.2026,VIP,Chef'],
    ['a header word as a name, undated sub-row', ',Conductor,Bob'],
    ['a name that contains "chef"', '01.05.2026,Chefo,Bob'],
    ['an unrecognised date', '2026-05-01,Vip Joe,Bob'],
    ['a BOM before the first date', '\uFEFF01.05.2026,Viper,Bob'],
    ['a text day and a header word as a name', 'Monday,Chef,Bob'],
    ['a translated label word as a name', 'TBD,Train,Bob'],
    ['a day label and a VIP-like name', 'Sat 01.05,VIP Joe,Bob'],
    ['an empty date and a header word as one name', ',VIP,Bob']
  ])('keeps a headerless first row with %s', (_, first) => {
    expect(parse(first + '\n02.05.2026,Alice,Bob')).toHaveLength(2);
  });

  it.each([
    ['English, tab-separated', 'Date\tConductor\tVIP\tR4C\tR4V\tLEFTC\tLEFTV'],
    ['Ukrainian, with flag columns', 'Дата,Провідник,VIP,R4C,R4V,LEFTC,LEFTV'],
    ['French, quoted', '"Date","Chef de train","VIP"'],
    ['hand-made', 'Train date,Train conductor,VIP passenger'],
    ['only the date column labelled', 'Date,,'],
    ['with a time zone in the date label', 'Date (UTC+3),Conductor,VIP'],
    ['without a date word', 'Day,Conductor,VIP'],
    ['with an empty first cell', ',Conductor,VIP'],
    ['French, with an empty first cell', ',Chef de train,VIP'],
    ['with a BOM and spaces', '\uFEFF  Date , Conductor , VIP ']
  ])('still skips a %s header row', (_, header) => {
    const d = header.includes('\t') ? '\t' : ',';
    const out = parse(header + `\n01.05.2026${d}Alice${d}Bob`);
    expect(out.map(r => r.conductor)).toEqual(['Alice']);
  });
});

describe('parseScheduleData: JSON share file', () => {
  const parse = text => run('parseScheduleData')(text);

  it('restores rows with their ids and groups', () => {
    const rows = makeRows([
      ['02.05.2026', 'A', 'B', { r4c: true }],
      ['', 'C', 'D', { leftv: true }],
      ['01.05.2026', 'E', 'F']
    ]);
    const text = JSON.stringify({ version: 1, rows }, null, 2);
    expect(parse(text)).toEqual(rows);
  });

  it('reads a share file that starts with a BOM', () => {
    const rows = makeRows([['01.05.2026', 'A', 'B']]);
    expect(parse('﻿' + JSON.stringify({ rows }))).toEqual(rows);
  });

  it('fills in missing fields and coerces flags to booleans', () => {
    const [row] = parse(JSON.stringify({ rows: [{ conductor: 'A', r4c: 1, leftv: 'yes', r4v: 0 }] }));
    expect(row).toMatchObject({ date: '', conductor: 'A', vip: '', r4c: true, r4v: false, leftc: false, leftv: true });
    expect(row.id).toBeTruthy();
    expect(row.group).toBeTruthy();
  });

  it('returns an empty list for a share file with no rows', () => {
    expect(parse('{"rows": []}')).toEqual([]);
  });
});

describe('buildScheduleCsv round trip', () => {
  const sample = makeRows([
    ['03.05.2026', 'Smith, J', 'Dave "Ace" Lee', { r4c: true }],
    ['', 'Олена (backup)', '', { leftv: true }],
    ['02.05.2026', 'Bob', 'Carol', { r4v: true, leftc: true }],
    ['01.05.2026', '', 'Eve']
  ]);

  it.each(['en', 'ua', 'fr'])('parses its own %s download back to the same schedule', lang => {
    run(`currentLang = ${JSON.stringify(lang)}`);
    setRows(sample);
    const csv = run('buildScheduleCsv')();
    // The download prepends a BOM; parse it the way a pasted copy would arrive.
    expect(shape(run('parseScheduleData')('﻿' + csv))).toEqual(shape(sample));
  });

  it('writes the date only on the first row of each group', () => {
    setRows(sample);
    const lines = run('buildScheduleCsv')().split('\n');
    expect(lines[0]).toBe('Date,Conductor,VIP,R4C,R4V,LEFTC,LEFTV');
    expect(lines.slice(1).map(l => l.split(',')[0])).toEqual(['"03.05.2026"', '""', '"02.05.2026"', '"01.05.2026"']);
  });

  // Fields used to be unquoted twice on import (splitCsvLine, then unquote),
  // so a name that itself started and ended with a quote lost those quotes.
  it('keeps a name that is wrapped in quotes', () => {
    setRows(makeRows([['01.05.2026', '"Ace"', 'Bob']]));
    const [row] = run('parseScheduleData')(run('buildScheduleCsv')());
    expect(row.conductor).toBe('"Ace"');
  });

  it('keeps quotes at the edges of names in a pasted CSV and TSV', () => {
    const parse = text => run('parseScheduleData')(text);
    expect(parse('01.05.2026,"""Ace""","x ""y"""')[0]).toMatchObject({ conductor: '"Ace"', vip: 'x "y"' });
    expect(parse('01.05.2026\t"""Ace"""\tBob')[0].conductor).toBe('"Ace"');
  });
});

describe('parseRosterData', () => {
  const parse = text => run('parseRosterData')(text);
  const plain = names => names.map(name => ({ name, r4: false, left: false }));

  it('returns an empty list for empty input', () => {
    expect(parse('')).toEqual([]);
    expect(parse('\n  \n')).toEqual([]);
  });

  it('reads a newline-separated list', () => {
    expect(parse('Alice\r\n  Bob  \n\nCarol')).toEqual(plain(['Alice', 'Bob', 'Carol']));
  });

  it('drops a BOM before the first name of a plain list', () => {
    expect(parse('﻿Alice\nBob')).toEqual(plain(['Alice', 'Bob']));
  });

  it('reads a single comma-separated line as a list of names', () => {
    expect(parse('Alice, Bob,Carol,')).toEqual(plain(['Alice', 'Bob', 'Carol']));
  });

  it('drops duplicates by name, ignoring case and notes, and keeps the first spelling', () => {
    expect(parse('Alice (backup)\nALICE\nalice [late]\nBob')).toEqual(plain(['Alice (backup)', 'Bob']));
  });

  it('skips entries that are only a note', () => {
    expect(parse('(away)\n[x]\nBob')).toEqual(plain(['Bob']));
  });

  it('reads a TSV export with header and R4/LEFT columns', () => {
    const text = 'Name\tR4\tLEFT\nAlice\t1\t\nBob\t\t1\n"Smith, J"\t\t';
    expect(parse(text)).toEqual([
      { name: 'Alice', r4: true, left: false },
      { name: 'Bob', r4: false, left: true },
      { name: 'Smith, J', r4: false, left: false }
    ]);
  });

  it('accepts 1/true/yes/y/x and the column name as a mark, in any case', () => {
    const marks = ['1', 'TRUE', 'Yes', 'y', 'X'];
    const text = 'Name,R4,LEFT\n' + marks.map((m, i) => `P${i},${m},${m}`).join('\n') + '\nQ,r4,left';
    expect(parse(text).map(e => [e.r4, e.left])).toEqual([
      ...marks.map(() => [true, true]),
      [true, true]
    ]);
  });

  it('treats other marks (0, no, -) as unset', () => {
    const text = 'Name,R4,LEFT\nA,0,no\nB,-,false\nC,r4,0';
    expect(parse(text).map(e => [e.r4, e.left])).toEqual([[false, false], [false, false], [true, false]]);
  });

  it('merges duplicate rows by name and keeps any mark seen', () => {
    const text = 'Name\tR4\tLEFT\nAlice\t1\t\nALICE (alt)\t\t1\nalice\t\t';
    expect(parse(text)).toEqual([{ name: 'Alice', r4: true, left: true }]);
  });

  it('reads multi-line CSV without a header', () => {
    expect(parse('Alice,1\nBob,')).toEqual([
      { name: 'Alice', r4: true, left: false },
      { name: 'Bob', r4: false, left: false }
    ]);
  });

  it('round-trips buildRosterText output', () => {
    setRoster({
      bob: { display: 'Bob', r4: false, left: true },
      alice: { display: 'alice', r4: true, left: false },
      'smith, j': { display: 'Smith, J', r4: true, left: true },
      'o"neil': { display: 'O"Neil', r4: false, left: false }
    });
    const text = run('buildRosterText')();
    expect(parse(text)).toEqual([
      { name: 'alice', r4: true, left: false },
      { name: 'Bob', r4: false, left: true },
      { name: 'O"Neil', r4: false, left: false },
      { name: 'Smith, J', r4: true, left: true }
    ]);
  });

  // Header detection used to look at the *values* of the first line. "r4"
  // and "left" are accepted marks, and "Nick" is a common name, but on the
  // first line they made it look like a header, so that member was dropped.
  it('keeps a headerless first row marked "r4"', () => {
    expect(parse('Alice,r4\nBob,').map(e => e.name)).toEqual(['Alice', 'Bob']);
  });

  it('keeps a headerless first row for a member named Nick', () => {
    expect(parse('Nick\t1\nBob\t').map(e => e.name)).toEqual(['Nick', 'Bob']);
  });

  it.each([
    ['marked left', 'Alice\t\tleft'],
    ['named Player and marked 1', 'Player,1,'],
    ['whose name contains a label', 'Nameless,,1'],
    ['named Ім\'я-like but with marks', 'Ніка\t1\t1'],
    ['named Nick with no marks', 'Nick\t\t'],
    ['named Nick Fury and marked r4', 'Nick Fury,r4'],
    ['named Name and marked 1', 'Name,1,'],
    ['named Player alone', 'Player\t']
  ])('keeps a headerless first row %s', (_, first) => {
    const d = first.includes('\t') ? '\t' : ',';
    expect(parse(first + `\nBob${d}${d}`).map(e => e.name)).toEqual([first.split(d)[0], 'Bob']);
  });

  it.each([
    ['English export', 'Name\tR4\tLEFT'],
    ['lower case CSV', 'name,r4,left'],
    ['name column only', 'Nickname\t\t'],
    ['Ukrainian', 'Ім\'я\tR4\tLEFT'],
    ['Ukrainian with a typographic apostrophe', 'Ім’я,R4,Left'],
    ['French', 'Pseudo\tR4\tLEFT'],
    ['Player with wordy labels', 'Player,Is R4,Left alliance'],
    ['extra column before the marks', 'Name,Power,R4,Left'],
    ['extra column after the marks', 'Name\tR4\tLEFT\tNotes'],
    ['two-word label', 'Player name\tR4\tLEFT'],
    ['annotated label', 'Name (in game),R4,Left'],
    ['Ukrainian two-word label', 'Ім\'я гравця\tR4'],
    ['name and notes only', 'Name\tNotes\t']
  ])('still skips a %s header row', (_, header) => {
    const d = header.includes('\t') ? '\t' : ',';
    expect(parse(header + `\nAlice${d}1${d}\nBob${d}${d}1`)).toEqual([
      { name: 'Alice', r4: true, left: false },
      { name: 'Bob', r4: false, left: true }
    ]);
  });

  it('keeps names wrapped in quotes from its own export', () => {
    setRoster({ '"ace"': { display: '"Ace"', r4: true, left: false } });
    expect(parse(run('buildRosterText')())).toEqual([{ name: '"Ace"', r4: true, left: false }]);
  });
});

describe('buildRosterText', () => {
  it('returns an empty string for an empty roster', () => {
    setRoster({});
    expect(run('buildRosterText')()).toBe('');
  });

  it('sorts names case-insensitively and quotes them', () => {
    setRoster({
      zed: { display: 'Zed', r4: true, left: false },
      amy: { display: 'amy', r4: false, left: true },
      'dave "d"': { display: 'Dave "D"', r4: false, left: false }
    });
    expect(run('buildRosterText')().split('\n')).toEqual([
      'Name\tR4\tLEFT',
      '"amy"\t\t1',
      '"Dave ""D"""\t\t',
      '"Zed"\t1\t'
    ]);
  });
});

describe('appendScheduleRows', () => {
  const append = parsed => run('appendScheduleRows')(JSON.parse(JSON.stringify(parsed)));
  const dates = () => run('rows').map(r => r.date || '-');

  it('takes the imported rows as they are when the schedule is empty', () => {
    setRows([]);
    const incoming = makeRows([['01.05.2026', 'A', ''], ['03.05.2026', 'B', '']]);
    append(incoming);
    expect(run('rows').map(r => r.id)).toEqual(['r1', 'r2']);
  });

  it('places each imported group by date, newest first', () => {
    setRows(makeRows([['10.05.2026', 'A', ''], ['05.05.2026', 'B', '']]));
    append(makeRows([['12.05.2026', 'N', ''], ['07.05.2026', 'M', ''], ['01.05.2026', 'O', '']]));
    expect(dates()).toEqual(['12.05.2026', '10.05.2026', '07.05.2026', '05.05.2026', '01.05.2026']);
  });

  it('compares across month and year boundaries by calendar date', () => {
    setRows(makeRows([['01.01.2027', 'A', ''], ['30.11.2026', 'B', '']]));
    append(makeRows([['31.12.2026', 'N', ''], ['01.12.2026', 'M', '']]));
    expect(dates()).toEqual(['01.01.2027', '31.12.2026', '01.12.2026', '30.11.2026']);
  });

  it('puts an imported group after an existing group with the same date', () => {
    setRows(makeRows([['05.05.2026', 'Old', '']]));
    append(makeRows([['05.05.2026', 'New', '']]));
    expect(run('rows').map(r => r.conductor)).toEqual(['Old', 'New']);
  });

  it('keeps sub-rows with their group', () => {
    setRows(makeRows([['10.05.2026', 'A', ''], ['', 'A2', ''], ['01.05.2026', 'B', '']]));
    append(makeRows([['05.05.2026', 'N', ''], ['', 'N2', '']]));
    expect(run('rows').map(r => r.conductor)).toEqual(['A', 'A2', 'N', 'N2', 'B']);
  });

  it('puts undated and invalid-date groups at the end', () => {
    setRows(makeRows([['10.05.2026', 'A', ''], ['', 'A2', '']]));
    append(makeRows([['31.02.2026', 'Bad', ''], ['', 'Undated', ''], ['01.05.2026', 'Old', '']]));
    // 31.02 is not a real date, so "Bad" and its sub-row count as undated.
    expect(run('rows').map(r => r.conductor)).toEqual(['A', 'A2', 'Old', 'Bad', 'Undated']);
  });

  it('places dated groups before undated ones already in the schedule', () => {
    setRows(makeRows([['10.05.2026', 'A', ''], ['bogus', 'X', '']]));
    append(makeRows([['01.05.2026', 'Old', '']]));
    expect(run('rows').map(r => r.conductor)).toEqual(['A', 'Old', 'X']);
  });
});

describe('schedule import flow', () => {
  beforeEach(() => {
    setRows(makeRows([['10.05.2026', 'Keep', 'Me']]));
    setRoster({ zed: { display: 'Zed', r4: true, left: true } });
  });

  it('replace mode swaps the schedule, reorders it newest first and saves it', async () => {
    await importVia('importScheduleBtn', 'Date,Conductor,VIP\n01.05.2026,A,B\n,A2,\n02.05.2026,C,D');
    expect(run('rows').map(r => r.conductor)).toEqual(['C', 'A', 'A2']);
    expect(JSON.parse(app.localStorage.getItem('schedule_data')).map(r => r.conductor)).toEqual(['C', 'A', 'A2']);
    expect(run('undoStack').length).toBe(1);
  });

  it('replace mode clears roster marks that no imported row carries', async () => {
    await importVia('importScheduleBtn', '01.05.2026,Zed,Bob,,1');
    expect(run('roster').zed).toEqual({ display: 'Zed', r4: false, left: false });
    expect(run('roster').bob).toEqual({ display: 'Bob', r4: true, left: false });
  });

  it('append mode merges by date and keeps existing roster marks', async () => {
    await importVia('importScheduleBtn', '12.05.2026,New,\n01.05.2026,Old,', 'append');
    expect(run('rows').map(r => r.conductor)).toEqual(['New', 'Keep', 'Old']);
    expect(run('roster').zed).toEqual({ display: 'Zed', r4: true, left: true });
  });

  it('leaves everything untouched for a share file with no rows', async () => {
    await importVia('importScheduleBtn', '{"rows": []}');
    expect(run('rows').map(r => r.conductor)).toEqual(['Keep']);
    expect(run('undoStack').length).toBe(0);
    expect(app.localStorage.getItem('schedule_data')).toBeNull();
  });

  it('does nothing when the text box is left empty', async () => {
    await importVia('importScheduleBtn', '   ');
    expect(run('rows').map(r => r.conductor)).toEqual(['Keep']);
    expect(run('undoStack').length).toBe(0);
  });

  it('restores the roster from a share file, replacing the old one', async () => {
    const rows = makeRows([['01.05.2026', 'Alice', '']]);
    const roster = { alice: { display: 'Alice', r4: true, left: false } };
    await importVia('importScheduleBtn', JSON.stringify({ version: 1, rows, roster }));
    expect(run('roster')).toEqual({ alice: { display: 'Alice', r4: true, left: false } });
    expect(JSON.parse(app.localStorage.getItem('schedule_roster'))).toEqual(run('roster'));
  });

  it('sanitises hand-edited roster entries from a share file', async () => {
    const roster = {
      '  MiXed  ': { display: 'Mixed', r4: 'yes', left: 0 },
      nodisplay: { r4: true },
      emptydisplay: { display: '', left: 1 },
      numeric: { display: 42 },
      ['k'.repeat(100)]: { display: 'D'.repeat(300) },
      broken: null,
      list: ['a'],
      str: 'text',
      '   ': { display: 'Blank key' }
    };
    await importVia('importScheduleBtn', JSON.stringify({ rows: [{ date: '01.05.2026' }], roster }));
    const out = run('roster');
    expect(Object.keys(out).sort()).toEqual(['emptydisplay', 'k'.repeat(80), 'mixed', 'nodisplay', 'numeric']);
    expect(out.mixed).toEqual({ display: 'Mixed', r4: true, left: false });
    expect(out.nodisplay).toEqual({ display: 'nodisplay', r4: true, left: false });
    expect(out.emptydisplay).toEqual({ display: 'emptydisplay', r4: false, left: true });
    expect(out.numeric.display).toBe('numeric');
    expect(out['k'.repeat(80)].display).toBe('D'.repeat(200));
  });

  it('ignores a share-file roster that is an array', async () => {
    const rows = makeRows([['01.05.2026', 'Alice', '']]);
    await importVia('importScheduleBtn', JSON.stringify({ rows, roster: [{ display: 'X' }] }), 'append');
    expect(Object.keys(run('roster')).sort()).toEqual(['alice', 'keep', 'me', 'zed']);
  });
});

describe('roster import flow', () => {
  beforeEach(() => {
    setRows([]);
    setRoster({ zed: { display: 'Zed', r4: true, left: false } });
  });

  it('replace mode drops members not in the import', async () => {
    await importVia('importRosterBtn', 'Alice\nBob');
    expect(Object.keys(run('roster')).sort()).toEqual(['alice', 'bob']);
  });

  it('append mode keeps existing members and only ever adds marks', async () => {
    await importVia('importRosterBtn', 'Name,R4,LEFT\nZED,,1\nAlice (note),1,', 'append');
    expect(run('roster')).toEqual({
      zed: { display: 'Zed', r4: true, left: true },
      alice: { display: 'Alice', r4: true, left: false }
    });
    expect(JSON.parse(app.localStorage.getItem('schedule_roster'))).toEqual(run('roster'));
  });

  it('keeps the roster when the import has no usable names', async () => {
    await importVia('importRosterBtn', '(away)\n[x]');
    expect(Object.keys(run('roster'))).toEqual(['zed']);
  });
});
