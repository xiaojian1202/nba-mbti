import test from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/quiz.js';
import { ARCHETYPES } from '../src/archetypes.js';

async function mount(search = '') {
  const original = { document: globalThis.document, window: globalThis.window };
  let html = '';
  function mutateButton(rating, transform) {
    const marker = `data-rating="${rating}"`;
    const markerIndex = html.indexOf(marker);
    const start = html.lastIndexOf('<button', markerIndex);
    const end = html.indexOf('>', markerIndex) + 1;
    html = html.slice(0, start) + transform(html.slice(start, end)) + html.slice(end);
  }
  function makeButton(rating) {
    return {
      dataset: { rating },
      classList: {
        toggle(cls, on) {
          mutateButton(rating, (tag) => {
            const without = tag.replace(new RegExp(`\\s*${cls}`), '');
            return on ? without.replace('class="scale-point', `class="scale-point ${cls}`) : without;
          });
        },
      },
      setAttribute(name, value) {
        mutateButton(rating, (tag) => tag.replace(new RegExp(`${name}="[^"]*"`), `${name}="${value}"`));
      },
      set tabIndex(value) {
        mutateButton(rating, (tag) => tag.replace(/tabindex="[^"]*"/, `tabindex="${value}"`));
      },
      focus() {},
    };
  }
  const root = {
    addEventListener(name, handler) { this[name] = handler; },
    get innerHTML() { return html; },
    set innerHTML(value) { html = value; },
    querySelector(selector) {
      if (selector === '.quiz-progress') {
        return { set value(v) { html = html.replace(/(<progress class="quiz-progress" value=")[^"]*/, `$1${v}`); } };
      }
      if (selector === '[data-action="next"]') {
        return {
          set disabled(v) {
            if (v) html = html.replace('data-action="next" >', 'data-action="next" disabled>');
            else html = html.replace('data-action="next" disabled>', 'data-action="next" >');
          },
        };
      }
      return { focus() {}, textContent: '' };
    },
    querySelectorAll(selector) {
      if (selector !== '[data-rating]') return [];
      return [...html.matchAll(/data-rating="(\d+)"/g)].map((match) => makeButton(match[1]));
    },
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
    async key(key, fromRating) { await root.keydown({ key, preventDefault() {}, target: { closest: (selector) => selector === '[data-rating]' ? { dataset: { rating: String(fromRating) } } : null } }); },
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

  const prototype = await mount('?type=toString');
  assert.match(prototype.root.innerHTML, /page--landing/);
  prototype.cleanup();
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

test('the progress bar reflects answered questions, not the displayed question index', async () => {
  const app = await mount();
  await app.action('start');
  assert.match(app.root.innerHTML, /<progress class="quiz-progress" value="0"/, 'no answers yet, bar should be empty');
  await app.rate(3);
  await app.action('next');
  assert.match(app.root.innerHTML, /<progress class="quiz-progress" value="1"/, 'one answer recorded before seeing question 2');
  app.cleanup();
});

test('the quiz renders all five scale points and blocks next until rated', async () => {
  const app = await mount();
  await app.action('start');
  for (const label of ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']) {
    assert.ok(app.root.innerHTML.includes(label), `${label} should render`);
    assert.ok(!app.root.innerHTML.includes(`aria-label="${label}"`), `${label} should not need a redundant aria-label`);
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

test('the lean bar appears for a scored result and not for a shared link', async () => {
  const app = await mount();
  await app.action('start');
  for (let index = 0; index < items.length; index++) {
    await app.rate((index * 4) % 5 + 1);
    await app.action('next');
  }
  const slug = new URL(app.href).searchParams.get('type');
  assert.match(app.root.innerHTML, /class="result-lean"/, 'a scored result shows how far it leans');
  assert.match(app.root.innerHTML, /class="trait-fill" style="width:\d/, 'the lean bar is filled to the primary share');
  app.cleanup();

  const shared = await mount(`?type=${slug}`);
  assert.ok(!shared.root.innerHTML.includes('result-lean'), 'a shared link has no scores, so no lean');
  shared.cleanup();
});

test('the role shown after taking the quiz matches the role shown on the shared link for the same result', async () => {
  const app = await mount();
  await app.action('start');
  for (let index = 0; index < items.length; index++) {
    await app.rate((index * 4) % 5 + 1);
    await app.action('next');
  }
  const slug = new URL(app.href).searchParams.get('type');
  const freshRoleMatch = app.root.innerHTML.match(/<p class="result-role">(.*?)<\/p>/);
  app.cleanup();

  const shared = await mount(`?type=${slug}`);
  const sharedRoleMatch = shared.root.innerHTML.match(/<p class="result-role">(.*?)<\/p>/);
  shared.cleanup();

  assert.ok(freshRoleMatch && sharedRoleMatch, 'both renders should show a role');
  assert.equal(freshRoleMatch[1], ARCHETYPES[slug].role, 'freshly scored result should show the authored role');
  assert.equal(freshRoleMatch[1], sharedRoleMatch[1], 'the same result should show the same role whether scored or shared');
});

test('the answer scale exposes a radiogroup of radios with one roving tab stop', async () => {
  const app = await mount();
  await app.action('start');

  assert.match(app.root.innerHTML, /class="scale" role="radiogroup"/);
  assert.equal((app.root.innerHTML.match(/role="radio"/g) || []).length, 5);
  assert.equal((app.root.innerHTML.match(/tabindex="0"/g) || []).length, 1, 'exactly one option should be tab-reachable before any answer is picked');
  assert.match(app.root.innerHTML, /data-rating="1"[^>]*tabindex="0"/, 'the first option is the roving tab stop when nothing is selected yet');

  await app.rate(3);
  assert.equal((app.root.innerHTML.match(/tabindex="0"/g) || []).length, 1, 'exactly one option should be tab-reachable after picking an answer');
  assert.match(app.root.innerHTML, /data-rating="3"[^>]*aria-checked="true"[^>]*tabindex="0"/, 'the selected option becomes the roving tab stop');
  app.cleanup();
});

test('arrow keys move the checked option and Home/End jump to the ends', async () => {
  const app = await mount();
  await app.action('start');

  await app.key('ArrowRight', 1);
  assert.match(app.root.innerHTML, /data-rating="2"[^>]*aria-checked="true"/, 'ArrowRight from an unrated group selects the next option');

  await app.key('ArrowRight', 2);
  assert.match(app.root.innerHTML, /data-rating="3"[^>]*aria-checked="true"/);

  await app.key('ArrowLeft', 3);
  assert.match(app.root.innerHTML, /data-rating="2"[^>]*aria-checked="true"/);

  await app.key('End', 2);
  assert.match(app.root.innerHTML, /data-rating="5"[^>]*aria-checked="true"/);

  await app.key('Home', 5);
  assert.match(app.root.innerHTML, /data-rating="1"[^>]*aria-checked="true"/);
  app.cleanup();
});

test('the Overview/Instincts nav is hidden mid-quiz so it cannot silently wipe answers', async () => {
  const app = await mount();
  await app.action('start');
  await app.rate(4);
  assert.ok(!app.root.innerHTML.includes('data-action="overview"'), 'the quiz screen must not offer a destructive Overview link');
  assert.ok(!app.root.innerHTML.includes('data-action="instincts"'), 'the quiz screen must not offer a destructive Instincts link');
  app.cleanup();
});

test('the landing and result screens still show the Overview/Instincts nav', async () => {
  const app = await mount();
  assert.ok(app.root.innerHTML.includes('data-action="overview"'));
  assert.ok(app.root.innerHTML.includes('data-action="instincts"'));

  const slug = Object.keys(ARCHETYPES)[0];
  const shared = await mount(`?type=${slug}`);
  assert.ok(shared.root.innerHTML.includes('data-action="overview"'));
  assert.ok(shared.root.innerHTML.includes('data-action="instincts"'));

  app.cleanup();
  shared.cleanup();
});
