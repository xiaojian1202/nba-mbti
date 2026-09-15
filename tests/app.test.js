import test from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/quiz.js';
import { ARCHETYPES } from '../src/archetypes.js';

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
    async rate(value) { await root.click({ target: { closest: (selector) => selector === '[data-rating]' ? { dataset: { rating: String(value) } } : null } }); },
    async action(name) { await root.click({ target: { closest: (selector) => selector === '[data-action]' ? { dataset: { action: name } } : null } }); },
    cleanup() { Object.assign(globalThis, original); },
  };
}

test('a known slug loads its archetype and an unknown slug returns to landing', async () => {
  const slug = Object.keys(ARCHETYPES)[0];
  const known = await mount(`?type=${slug}`);
  assert.match(known.root.innerHTML, /result/);
  assert.ok(known.root.innerHTML.includes(ARCHETYPES[slug].name));
  known.cleanup();

  const unknown = await mount('?type=not-a-real-type');
  assert.match(unknown.root.innerHTML, /page--landing/);
  unknown.cleanup();
});

test('answering every item reaches a result and writes its slug to the url', async () => {
  const app = await mount();
  await app.action('start');
  for (let index = 0; index < items.length; index++) {
    await app.rate(4);
    await app.action('next');
  }
  assert.match(app.root.innerHTML, /page--result/);
  const slug = new URL(app.href).searchParams.get('type');
  assert.ok(ARCHETYPES[slug], `${slug} should be a known archetype`);
  app.cleanup();
});

test('the quiz renders all five scale points and blocks next until rated', async () => {
  const app = await mount();
  await app.action('start');
  for (const label of ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']) {
    assert.ok(app.root.innerHTML.includes(label), `${label} should render`);
  }
  assert.match(app.root.innerHTML, /disabled/);
  await app.action('next');
  assert.ok(app.root.innerHTML.includes('QUESTION 01'), 'next should not advance an unrated item');
  await app.rate(3);
  await app.action('next');
  assert.ok(app.root.innerHTML.includes('QUESTION 02'));
  app.cleanup();
});

test('a completed result shows all nine trait bars and the within-person note', async () => {
  const app = await mount();
  await app.action('start');
  for (let index = 0; index < items.length; index++) {
    await app.rate(index % 5 + 1);
    await app.action('next');
  }
  assert.match(app.root.innerHTML, /Measured against the rest of your game/);
  assert.equal((app.root.innerHTML.match(/class="trait-row"/g) || []).length, 9);
  app.cleanup();
});

test('a shared link shows the archetype without claiming the visitor answered', async () => {
  const slug = Object.keys(ARCHETYPES)[0];
  const app = await mount(`?type=${slug}`);
  assert.ok(!app.root.innerHTML.includes('trait-row'), 'a shared link has no trait scores to show');
  app.cleanup();
});
