import test from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/quiz.js';
import { ARCHETYPES } from '../src/archetypes.js';

const slugOf = (href) => new URL(href).pathname.match(/\/t\/([^/]+)\/$/)?.[1];

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (Object.hasOwn(data, key) ? data[key] : null),
    setItem(key, value) { data[key] = String(value); },
    removeItem(key) { delete data[key]; },
  };
}

const throwingStorage = {
  getItem() { throw new Error('storage denied'); },
  setItem() { throw new Error('storage denied'); },
  removeItem() { throw new Error('storage denied'); },
};

// `reloadOf` reloads the page of an earlier mount: the tab keeps its history entries and position.
async function mount(path = '', { sessionStorage = memoryStorage(), reloadOf } = {}) {
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
  const entries = reloadOf ? reloadOf.entries.map((entry) => ({ ...entry })) : [{ state: null, url: `https://court.example/${path}` }];
  let position = reloadOf ? reloadOf.position : 0;
  let href = entries[position].url;
  const listeners = {};
  const history = {
    get length() { return entries.length; },
    get state() { return entries[position].state; },
    pushState(state, _title, url) {
      entries.splice(position + 1);
      entries.push({ state, url: String(url) });
      position += 1;
      href = String(url);
    },
    replaceState(state, _title, url) { entries[position] = { state, url: String(url) }; href = String(url); },
    back() {
      if (position === 0) return;
      position -= 1;
      href = entries[position].url;
      listeners.popstate?.({ state: entries[position].state });
    },
  };
  globalThis.document = { querySelector: () => root };
  globalThis.window = {
    location: { get href() { return href; }, get pathname() { return new URL(href).pathname; }, get search() { return new URL(href).search; } },
    history,
    sessionStorage,
    addEventListener(name, handler) { listeners[name] = handler; },
    scrollTo() {},
  };
  await import(`../src/app.js?test=${Math.random()}`);
  return {
    root,
    history,
    entries,
    get position() { return position; },
    get href() { return href; },
    async rate(value) { await root.click({ target: { closest: (selector) => selector === '[data-rating]' ? { dataset: { rating: String(value) } } : null } }); },
    async action(name) { await root.click({ target: { closest: (selector) => selector === '[data-action]' ? { dataset: { action: name } } : null } }); },
    async key(key, fromRating) { await root.keydown({ key, preventDefault() {}, target: { closest: (selector) => selector === '[data-rating]' ? { dataset: { rating: String(fromRating) } } : null } }); },
    cleanup() { Object.assign(globalThis, original); },
  };
}

test('a known slug path loads its archetype and an unknown slug returns to landing', async () => {
  const slug = Object.keys(ARCHETYPES)[0];
  const known = await mount(`t/${slug}/`);
  assert.match(known.root.innerHTML, /page--result/);
  assert.ok(known.root.innerHTML.includes(ARCHETYPES[slug].name));
  known.cleanup();

  for (const path of ['t/not-a-real-type/', 't/toString/', '?type=not-a-real-type', '?type=toString']) {
    const unknown = await mount(path);
    assert.match(unknown.root.innerHTML, /page--landing/, path);
    unknown.cleanup();
  }
});

test('a legacy ?type= link renders its archetype and moves to the canonical t/<slug>/ url', async () => {
  const slug = Object.keys(ARCHETYPES)[0];
  const legacy = await mount(`?type=${slug}`);
  assert.match(legacy.root.innerHTML, /page--result/);
  assert.ok(legacy.root.innerHTML.includes(ARCHETYPES[slug].name));
  assert.equal(slugOf(legacy.href), slug);
  assert.equal(new URL(legacy.href).search, '');
  legacy.cleanup();
});

test('rendered images resolve from the module, not the page url, so nested pages load them', async () => {
  const slug = Object.keys(ARCHETYPES)[0];
  const landing = await mount();
  const landingHtml = landing.root.innerHTML;
  await landing.action('start');
  const quizHtml = landing.root.innerHTML;
  landing.cleanup();
  const shared = await mount(`?type=${slug}`);
  const resultHtml = shared.root.innerHTML;
  shared.cleanup();

  for (const html of [landingHtml, quizHtml, resultHtml]) {
    assert.doesNotMatch(html, /src="\.\/public\//);
    assert.match(html, /src="file:\/\/[^"]*\/public\/images\/basketball-mark-outlined\.svg"/);
  }
});

test('answering every item reaches a result and writes its slug to the url', async () => {
  const app = await mount();
  await app.action('start');
  for (let index = 0; index < items.length; index++) {
    await app.rate(4);
    await app.action('next');
  }
  assert.match(app.root.innerHTML, /page--result/);
  const slug = slugOf(app.href);
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
  const slug = slugOf(app.href);
  assert.match(app.root.innerHTML, /class="result-lean"/, 'a scored result shows how far it leans');
  assert.match(app.root.innerHTML, /class="trait-fill" style="width:\d/, 'the lean bar is filled to the primary share');
  app.cleanup();

  const shared = await mount(`t/${slug}/`);
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
  const slug = slugOf(app.href);
  const freshRoleMatch = app.root.innerHTML.match(/<p class="result-role">(.*?)<\/p>/);
  app.cleanup();

  const shared = await mount(`t/${slug}/`);
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

async function answer(app, count) {
  for (let index = 0; index < count; index++) {
    await app.rate(index % 5 + 1);
    await app.action('next');
  }
}

test('back from question n returns to question n-1 with answers kept', async () => {
  const app = await mount();
  await app.action('start');
  await answer(app, 3);
  assert.ok(app.root.innerHTML.includes('QUESTION 04'));
  app.history.back();
  assert.ok(app.root.innerHTML.includes('QUESTION 03'));
  assert.match(app.root.innerHTML, /data-rating="3"[^>]*aria-checked="true"/, 'the answer to question 3 is kept');
  assert.match(app.root.innerHTML, /<progress class="quiz-progress" value="3"/);
  app.cleanup();
});

test('back from the first question returns to the landing page', async () => {
  const app = await mount();
  await app.action('start');
  assert.ok(app.root.innerHTML.includes('QUESTION 01'));
  app.history.back();
  assert.match(app.root.innerHTML, /page--landing/);
  assert.equal(app.href, 'https://court.example/');
  app.cleanup();
});

test('the previous-question button and the back gesture produce the same screen', async () => {
  const viaButton = await mount();
  await viaButton.action('start');
  await answer(viaButton, 2);
  await viaButton.action('back');
  const buttonHtml = viaButton.root.innerHTML;
  viaButton.cleanup();

  const viaGesture = await mount();
  await viaGesture.action('start');
  await answer(viaGesture, 2);
  viaGesture.history.back();
  const gestureHtml = viaGesture.root.innerHTML;
  viaGesture.cleanup();

  assert.ok(buttonHtml.includes('QUESTION 02'));
  assert.equal(buttonHtml, gestureHtml);
});

test('finishing the quiz pushes the result as a new history entry', async () => {
  const app = await mount();
  await app.action('start');
  await answer(app, items.length - 1);
  await app.rate(4);
  const before = app.history.length;
  await app.action('next');
  assert.match(app.root.innerHTML, /page--result/);
  assert.equal(app.history.length, before + 1);
  assert.deepEqual(app.history.state, { screen: 'result' });
  assert.ok(ARCHETYPES[slugOf(app.href)]);
  app.cleanup();
});

test('back from the result returns to the last question', async () => {
  const app = await mount();
  await app.action('start');
  await answer(app, items.length);
  assert.match(app.root.innerHTML, /page--result/);
  app.history.back();
  assert.match(app.root.innerHTML, /page--quiz/);
  assert.ok(app.root.innerHTML.includes(`QUESTION ${String(items.length).padStart(2, '0')}`));
  assert.equal(slugOf(app.href), undefined);
  app.cleanup();
});

test('an unfinished run offers resume; a first visit and a finished run do not', async () => {
  const storage = memoryStorage();
  const first = await mount('', { sessionStorage: storage });
  assert.doesNotMatch(first.root.innerHTML, /data-action="resume"/);
  await first.action('start');
  await answer(first, 10);
  first.cleanup();

  const reload = await mount('', { sessionStorage: storage });
  assert.match(reload.root.innerHTML, /page--landing/);
  assert.match(reload.root.innerHTML, /data-action="resume"/);
  assert.ok(reload.root.innerHTML.includes(`Pick up where you left off — question 11 of ${items.length}`));
  await reload.action('start');
  await answer(reload, items.length);
  assert.match(reload.root.innerHTML, /page--result/);
  reload.cleanup();

  const afterFinish = await mount('', { sessionStorage: storage });
  assert.match(afterFinish.root.innerHTML, /page--landing/);
  assert.doesNotMatch(afterFinish.root.innerHTML, /data-action="resume"/);
  afterFinish.cleanup();
});

test('resume restores the saved answers and position', async () => {
  const uninterrupted = await mount();
  await uninterrupted.action('start');
  await answer(uninterrupted, items.length);
  const expected = { html: uninterrupted.root.innerHTML, href: uninterrupted.href };
  uninterrupted.cleanup();

  const storage = memoryStorage();
  const before = await mount('', { sessionStorage: storage });
  await before.action('start');
  await answer(before, 10);
  before.cleanup();

  const app = await mount('', { sessionStorage: storage });
  await app.action('resume');
  assert.match(app.root.innerHTML, /page--quiz/);
  assert.ok(app.root.innerHTML.includes('QUESTION 11'));
  assert.match(app.root.innerHTML, /<progress class="quiz-progress" value="10"/);
  assert.deepEqual(app.history.state, { screen: 'quiz', index: 10, run: JSON.parse(storage.getItem('court-type:run')).run });
  for (let index = 10; index < items.length; index++) {
    await app.rate(index % 5 + 1);
    await app.action('next');
  }
  assert.equal(app.root.innerHTML, expected.html, 'the first ten answers survived the reload');
  assert.equal(app.href, expected.href);
  app.cleanup();
});

test('after a reload, going back neither enters the quiz unasked nor erases the saved run', async () => {
  const storage = memoryStorage();
  const before = await mount('', { sessionStorage: storage });
  await before.action('start');
  await answer(before, 10);
  before.cleanup();

  const app = await mount('', { sessionStorage: storage, reloadOf: before });
  while (app.position > 0) {
    app.history.back();
    assert.match(app.root.innerHTML, /page--landing/);
    assert.ok(app.root.innerHTML.includes(`Pick up where you left off — question 11 of ${items.length}`));
  }
  assert.equal(Object.keys(JSON.parse(storage.getItem('court-type:run')).answers).length, 10);
  app.cleanup();
});

test('after a reload and resume, the previous-question button walks back through the saved answers', async () => {
  const storage = memoryStorage();
  const before = await mount('', { sessionStorage: storage });
  await before.action('start');
  await answer(before, 10);
  before.cleanup();

  const app = await mount('', { sessionStorage: storage, reloadOf: before });
  await app.action('resume');
  for (let question = 10; question >= 1; question--) {
    await app.action('back');
    assert.ok(app.root.innerHTML.includes(`QUESTION ${String(question).padStart(2, '0')}`), `question ${question}`);
    assert.match(app.root.innerHTML, new RegExp(`data-rating="${(question - 1) % 5 + 1}"[^>]*aria-checked="true"`));
  }
  await app.action('back');
  assert.match(app.root.innerHTML, /page--landing/);
  app.cleanup();
});

test('resuming after a reload and a back gesture, the previous question is still one step back', async () => {
  const storage = memoryStorage();
  const before = await mount('', { sessionStorage: storage });
  await before.action('start');
  await answer(before, 10);
  before.cleanup();

  const app = await mount('', { sessionStorage: storage, reloadOf: before });
  app.history.back();
  await app.action('resume');
  assert.ok(app.root.innerHTML.includes('QUESTION 11'));
  await app.action('back');
  assert.ok(app.root.innerHTML.includes('QUESTION 10'));
  app.cleanup();
});

test('starting over after a reload, back from the first question returns to the landing page', async () => {
  const storage = memoryStorage();
  const before = await mount('', { sessionStorage: storage });
  await before.action('start');
  await answer(before, 10);
  before.cleanup();

  const app = await mount('', { sessionStorage: storage, reloadOf: before });
  await app.action('start');
  await app.action('back');
  assert.match(app.root.innerHTML, /page--landing/);
  app.cleanup();
});

test('a corrupted or invalid saved run is discarded', async () => {
  const firstVisit = await mount();
  const firstVisitHtml = firstVisit.root.innerHTML;
  firstVisit.cleanup();
  const id = items[0].id;

  const valid = await mount('', { sessionStorage: memoryStorage({ 'court-type:run': JSON.stringify({ answers: { [id]: 3 }, index: 1, run: 1 }) }) });
  assert.match(valid.root.innerHTML, /data-action="resume"/, 'a valid run is offered, so the cases below are meaningful');
  valid.cleanup();

  const invalid = [
    '{not json',
    'null',
    JSON.stringify({ answers: { 'no-such-item': 3 }, index: 0 }),
    JSON.stringify({ answers: { [id]: 6 }, index: 0 }),
    JSON.stringify({ answers: { [id]: 3 }, index: items.length }),
    JSON.stringify({ answers: { [id]: 3 }, index: 5 }),
    JSON.stringify({ answers: { [id]: 3 }, index: 0 }),
  ];
  for (const saved of invalid) {
    const app = await mount('', { sessionStorage: memoryStorage({ 'court-type:run': saved }) });
    assert.equal(app.root.innerHTML, firstVisitHtml, saved);
    await app.action('resume');
    assert.match(app.root.innerHTML, /page--landing/, saved);
    app.cleanup();
  }
});

test('the quiz still works when sessionStorage throws', async () => {
  const app = await mount('', { sessionStorage: throwingStorage });
  assert.match(app.root.innerHTML, /page--landing/);
  assert.doesNotMatch(app.root.innerHTML, /data-action="resume"/);
  await app.action('start');
  await answer(app, items.length);
  assert.match(app.root.innerHTML, /page--result/);
  assert.ok(ARCHETYPES[slugOf(app.href)]);
  app.cleanup();
});
