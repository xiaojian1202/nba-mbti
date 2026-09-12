import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, results } from '../src/quiz.js';

async function mount(search = '') {
  const original = { document: globalThis.document, window: globalThis.window, setTimeout: globalThis.setTimeout, clearTimeout: globalThis.clearTimeout };
  const timers = new Map();
  let nextTimer = 0;
  const root = {
    innerHTML: '',
    addEventListener(_name, handler) { this.click = handler; },
    querySelector() { return { focus() {}, textContent: '' }; },
  };
  let href = `https://court.example/${search}`;
  globalThis.document = { querySelector: () => root };
  globalThis.window = {
    location: { get href() { return href; }, get search() { return new URL(href).search; } },
    history: { replaceState(_state, _title, url) { href = String(url); } },
    scrollTo() {},
  };
  globalThis.setTimeout = (fn, ms) => { assert.equal(ms, 250); timers.set(++nextTimer, fn); return nextTimer; };
  globalThis.clearTimeout = (id) => timers.delete(id);
  await import(`../src/app.js?test=${Math.random()}`);
  return {
    root,
    get href() { return href; },
    async choose(value) { await root.click({ target: { closest: (selector) => selector === '[data-choice]' ? { dataset: { choice: value } } : null } }); },
    async action(name) { await root.click({ target: { closest: (selector) => selector === '[data-action]' ? { dataset: { action: name } } : null } }); },
    tick() { const entries = [...timers.values()]; timers.clear(); for (const fn of entries) fn(); },
    cleanup() { Object.assign(globalThis, original); },
  };
}

test('a known slug loads its profile and an unknown slug returns to landing', async () => {
  const known = await mount('?type=chessmaster');
  try {
    assert.match(known.root.innerHTML, /The Chessmaster/);
    assert.match(known.root.innerHTML, /Patient · Cold-blooded · Decisive/);
    assert.match(known.root.innerHTML, /Your five<br \/>instincts/);
    assert.equal((known.root.innerHTML.match(/class="axis-row"/g) || []).length, 5);
    assert.doesNotMatch(known.root.innerHTML, /HPAIC/);
  } finally { known.cleanup(); }
  const unknown = await mount('?type=FSIC');
  try { assert.match(unknown.root.innerHTML, /Find my court type/); }
  finally { unknown.cleanup(); }
});

test('a choice advances after 250ms, back cancels a pending advance, and completion shares a slug', async () => {
  const app = await mount();
  try {
    assert.match(app.root.innerHTML, /45 game situations/);
    await app.action('start');
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 45/);
    await app.choose(questions[0].options[0].value);
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 45/);
    app.tick();
    assert.match(app.root.innerHTML, /QUESTION 02 \/ 45/);
    await app.choose(questions[1].options[0].value);
    await app.action('back');
    app.tick();
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 45/);
    await app.choose(questions[0].options[0].value);
    app.tick();
    for (const question of questions.slice(1)) {
      await app.choose(question.options[0].value);
      app.tick();
    }
    assert.match(app.root.innerHTML, /The Firestarter/);
    assert.equal(new URL(app.href).searchParams.get('type'), results.FSDBC.slug);
    assert.doesNotMatch(app.root.innerHTML, /FSDBC/);
  } finally { app.cleanup(); }
});
