// Loads the browser scripts (app.js, occurrence.js, roster.js, import.js)
// into one node:vm context, the way index.html loads them as classic
// <script> tags: they share one global scope, so top-level let/const in
// app.js (rows, roster, ...) are visible to the later files.
//
// The DOM is a small fake: just enough for the scripts to run their
// top-level wiring (getElementById(...).addEventListener, classList,
// textContent/innerHTML) and for tests to fire the listeners they attach.
// It is not a browser; tests here cover data logic and the import flow,
// not layout or real rendering.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SCRIPTS = ['app.js', 'occurrence.js', 'roster.js', 'import.js'];

function escapeText(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

class FakeClassList {
  constructor() { this.set = new Set(); }
  add(...c) { c.forEach(x => this.set.add(x)); }
  remove(...c) { c.forEach(x => this.set.delete(x)); }
  contains(c) { return this.set.has(c); }
  toggle(c, force) {
    const on = force === undefined ? !this.set.has(c) : !!force;
    if (on) this.set.add(c); else this.set.delete(c);
    return on;
  }
}

class FakeElement {
  constructor(id) {
    this.id = id || '';
    this.classList = new FakeClassList();
    this.style = {};
    this.dataset = {};
    this.value = '';
    this.checked = false;
    this.disabled = false;
    this.placeholder = '';
    this.files = [];
    this.children = [];
    this.listeners = new Map();
    this._text = '';
    this._html = '';
  }
  get textContent() { return this._text; }
  set textContent(v) { this._text = String(v); this._html = escapeText(v); }
  get innerHTML() { return this._html; }
  set innerHTML(v) { this._html = String(v); this._text = ''; }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(fn);
  }
  removeEventListener(type, fn) {
    const list = this.listeners.get(type);
    if (list) this.listeners.set(type, list.filter(f => f !== fn));
  }
  dispatch(type, props) {
    const event = {
      type,
      target: this,
      preventDefault() {},
      stopPropagation() {},
      ...props
    };
    (this.listeners.get(type) || []).slice().forEach(fn => fn(event));
    return event;
  }
  dispatchEvent(event) { this.dispatch(event.type, event); return true; }
  click() { this.dispatch('click'); }
  focus() {}
  blur() {}
  select() {}
  contains() { return false; }
  closest() { return null; }
  matches() { return false; }
  querySelector() { return new FakeElement(); }
  querySelectorAll() { return []; }
  getBoundingClientRect() { return { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0 }; }
  appendChild(c) { this.children.push(c); return c; }
  removeChild(c) { return c; }
  remove() {}
  setAttribute(k, v) { this[`attr:${k}`] = String(v); }
  getAttribute(k) { return this[`attr:${k}`] ?? null; }
  removeAttribute(k) { delete this[`attr:${k}`]; }
  hasAttribute(k) { return `attr:${k}` in this; }
  scrollIntoView() {}
}

class FakeDocument extends FakeElement {
  constructor() {
    super('#document');
    this.byId = new Map();
    this.bySelector = new Map();
    this.body = new FakeElement('body');
    this.documentElement = new FakeElement('html');
    this.activeElement = this.body;
  }
  getElementById(id) {
    if (!this.byId.has(id)) this.byId.set(id, new FakeElement(id));
    return this.byId.get(id);
  }
  querySelector(sel) {
    if (!this.bySelector.has(sel)) this.bySelector.set(sel, new FakeElement(sel));
    return this.bySelector.get(sel);
  }
  createElement(tag) { return new FakeElement(tag); }
  createTextNode(text) { const el = new FakeElement(); el.textContent = text; return el; }
}

function createStorage(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: k => { map.delete(k); },
    clear: () => map.clear(),
    key: i => [...map.keys()][i] ?? null,
    get length() { return map.size; },
    dump: () => Object.fromEntries(map)
  };
}

// Returns { run, document, localStorage }.
// run(code) evaluates code in the page's global scope, so it can read and
// call top-level bindings: run('parseScheduleData')('...'), run('rows').
export function loadApp(options = {}) {
  const document = new FakeDocument();
  const localStorage = createStorage(options.storage);
  const context = {
    document,
    localStorage,
    navigator: { language: 'en', clipboard: null },
    location: { href: 'https://example.test/', origin: 'https://example.test', pathname: '/', search: '', hash: '' },
    history: { replaceState() {}, pushState() {} },
    matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
    setTimeout, clearTimeout, setInterval, clearInterval,
    requestAnimationFrame: fn => setTimeout(fn, 0),
    Event: class { constructor(type) { this.type = type; } },
    FileReader: class {},
    Blob: class {},
    URL: { createObjectURL: () => '', revokeObjectURL() {} },
    console
  };
  context.window = context;
  context.globalThis = context;
  vm.createContext(context);
  for (const file of SCRIPTS) {
    const code = readFileSync(ROOT + file, 'utf8');
    vm.runInContext(code, context, { filename: file });
  }
  const run = code => vm.runInContext(code, context);
  // Rendering is DOM-heavy and out of scope; the tests count calls instead.
  run('var __renders = { table: 0, roster: 0 };' +
      'renderTable = function () { __renders.table++; };' +
      'renderRoster = function () { __renders.roster++; };');
  return { run, document, localStorage };
}

// Rows in the app's own shape. Grouping follows the app: a row with a date
// starts a group, rows without a date join the group above.
export function makeRows(spec) {
  let n = 0;
  let group = null;
  return spec.map(([date, conductor, vip, flags = {}]) => {
    n++;
    if (date || group === null) group = 'g' + n;
    return {
      id: 'r' + n,
      group,
      date: date || '',
      conductor: conductor || '',
      vip: vip || '',
      r4c: !!flags.r4c,
      r4v: !!flags.r4v,
      leftc: !!flags.leftc,
      leftv: !!flags.leftv
    };
  });
}
