import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, results } from '../src/quiz.js';

async function mount(search = '') {
  const original = { document: globalThis.document, window: globalThis.window };
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
  await import(`../src/app.js?test=${Math.random()}`);
  return {
    root,
    get href() { return href; },
    async choose(value) { await root.click({ target: { closest: (selector) => selector === '[data-choice]' ? { dataset: { choice: value } } : null } }); },
    async action(name) { await root.click({ target: { closest: (selector) => selector === '[data-action]' ? { dataset: { action: name } } : null } }); },
    cleanup() { Object.assign(globalThis, original); },
  };
}

test('a known slug loads its profile and an unknown slug returns to landing', async () => {
  const known = await mount('?type=chessmaster');
  try {
    assert.match(known.root.innerHTML, /The Chessmaster/);
    assert.match(known.root.innerHTML, /HPAIC/);
    assert.match(known.root.innerHTML, /Your five<br \/>instincts/);
    assert.equal((known.root.innerHTML.match(/class="axis-row"/g) || []).length, 5);
  } finally { known.cleanup(); }
  const unknown = await mount('?type=FSIC');
  try { assert.match(unknown.root.innerHTML, /Find my court type/); }
  finally { unknown.cleanup(); }
});

test('a choice enables Next, back preserves previous answers, and completion shares a slug', async () => {
  const app = await mount();
  try {
    assert.match(app.root.innerHTML, /45 game situations/);
    await app.action('start');
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 45/);
    assert.match(app.root.innerHTML, /data-action="next" disabled/);
    await app.choose(questions[0].options[0].value);
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 45/);
    assert.doesNotMatch(app.root.innerHTML, /data-action="next" disabled/);
    await app.action('next');
    assert.match(app.root.innerHTML, /QUESTION 02 \/ 45/);
    await app.choose(questions[1].options[0].value);
    await app.action('back');
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 45/);
    await app.action('next');
    for (const question of questions.slice(1)) {
      await app.choose(question.options[0].value);
      await app.action('next');
    }
    assert.match(app.root.innerHTML, /The Firestarter/);
    assert.equal(new URL(app.href).searchParams.get('type'), results.FSDBC.slug);
    assert.match(app.root.innerHTML, /FSDBC/);
  } finally { app.cleanup(); }
});
