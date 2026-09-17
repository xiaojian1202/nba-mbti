# Likert Trait Instrument Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the five binary axes and 32 letter-code profiles with nine independently-scored traits measured by 46 five-point Likert items, resolving to one of 72 archetypes.

**Architecture:** Each item is a basketball situation plus one specific action, answered Never→Always and scored 1–5. Four items sum into each trait (range 4–20), traits are independent, and proficiency bands are assigned on a trait's deviation from that player's own mean of the nine. The two strongest traits form an ordered pair resolved through pure/authored/composed tiers into a named archetype.

**Tech Stack:** Dependency-free ES modules in the browser. Tests are `node:test` with `node:assert/strict`, run by `npm test`. No build step, no packages — `package.json` must gain no `dependencies` key.

**Spec:** `docs/superpowers/specs/2026-09-15-likert-trait-instrument-design.md`

## Global Constraints

- No runtime dependencies. The app stays dependency-free browser JavaScript.
- Every module is an ES module (`"type": "module"` is already set).
- Trait raw score range is **4–20**; modifier raw score range is **5–25**.
- The scale is exactly five points, scored 1–5: **Never · Rarely · Sometimes · Often · Always**.
- 46 items total: 36 trait items (four per trait, nine traits) and 10 modifier items (five per modifier).
- Proficiency band thresholds are **named constants** on `d = score − M` so they can be recalibrated: Elite `d ≥ 4.0`, Excellent `2.0 ≤ d < 4.0`, Strong `0.5 ≤ d < 2.0`, Solid `−2.0 ≤ d < 0.5`, Developing `d < −2.0`.
- Modifier tie defaults: **Tempo → Half-court, Temper → Calm.**
- `scoreAnswers` returns `null` for any incomplete or invalid answer set.
- No reverse-keyed items. Every item must survive a sincere `Never`.
- No item may read as the wrong answer; each describes a legitimate way to help a team.
- `npm test` and `npm run check` must pass at the end of every task.

---

### Task 1: Trait, role, modifier, and scale model

**Files:**
- Create: `src/traits.js`
- Create: `tests/traits.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `TRAITS` (array of `{ id, label, role }`, array order is the canonical tie-break order), `ROLES` (array of `{ id, label }`), `MODIFIERS` (array of `{ id, label, poles: [string, string], names: [string, string], defaultPole: string }`), `SCALE` (array of `{ value: number, label: string }`), `PROFICIENCY_BANDS` (array of `{ min: number, label: string }` ordered high to low), and `proficiency(deviation) -> string`.

- [ ] **Step 1: Write the failing test**

```js
// tests/traits.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAITS, ROLES, MODIFIERS, SCALE, proficiency } from '../src/traits.js';

test('nine traits across four roles, each role non-empty', () => {
  assert.equal(TRAITS.length, 9);
  assert.equal(ROLES.length, 4);
  assert.equal(new Set(TRAITS.map((trait) => trait.id)).size, 9);
  for (const role of ROLES) {
    assert.ok(TRAITS.some((trait) => trait.role === role.id), `${role.id} needs traits`);
  }
  for (const trait of TRAITS) {
    assert.ok(ROLES.some((role) => role.id === trait.role), `${trait.id} has an unknown role`);
    assert.ok(trait.label);
  }
  assert.equal(TRAITS.filter((trait) => trait.role === 'scorer').length, 3);
});

test('the scale is five points scored 1 through 5', () => {
  assert.deepEqual(SCALE.map((point) => point.value), [1, 2, 3, 4, 5]);
  assert.deepEqual(SCALE.map((point) => point.label), ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']);
});

test('two modifiers each declare two poles and a tie default', () => {
  assert.equal(MODIFIERS.length, 2);
  const tempo = MODIFIERS.find((modifier) => modifier.id === 'tempo');
  const temper = MODIFIERS.find((modifier) => modifier.id === 'temper');
  assert.deepEqual(tempo.poles, ['fast', 'halfCourt']);
  assert.equal(tempo.defaultPole, 'halfCourt');
  assert.deepEqual(temper.poles, ['expressive', 'calm']);
  assert.equal(temper.defaultPole, 'calm');
  for (const modifier of MODIFIERS) {
    assert.equal(modifier.names.length, 2);
    assert.ok(modifier.poles.includes(modifier.defaultPole));
  }
});

test('proficiency bands are correct at every boundary', () => {
  assert.equal(proficiency(4.0), 'Elite');
  assert.equal(proficiency(3.99), 'Excellent');
  assert.equal(proficiency(2.0), 'Excellent');
  assert.equal(proficiency(1.99), 'Strong');
  assert.equal(proficiency(0.5), 'Strong');
  assert.equal(proficiency(0.49), 'Solid');
  assert.equal(proficiency(0), 'Solid');
  assert.equal(proficiency(-2.0), 'Solid');
  assert.equal(proficiency(-2.01), 'Developing');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/traits.test.js`
Expected: FAIL — `Cannot find module '../src/traits.js'`

- [ ] **Step 3: Write minimal implementation**

```js
// src/traits.js
export const ROLES = [
  { id: 'creator', label: 'Creator' },
  { id: 'scorer', label: 'Scorer' },
  { id: 'defender', label: 'Defender' },
  { id: 'connector', label: 'Connector' },
];

// Array order is the canonical order used to break ranking ties.
export const TRAITS = [
  { id: 'vision', label: 'Vision', role: 'creator' },
  { id: 'shotCreation', label: 'Shot Creation', role: 'creator' },
  { id: 'shooting', label: 'Shooting', role: 'scorer' },
  { id: 'slashing', label: 'Slashing', role: 'scorer' },
  { id: 'post', label: 'Post', role: 'scorer' },
  { id: 'disruption', label: 'Disruption', role: 'defender' },
  { id: 'protection', label: 'Protection', role: 'defender' },
  { id: 'movement', label: 'Movement', role: 'connector' },
  { id: 'grit', label: 'Grit', role: 'connector' },
];

export const MODIFIERS = [
  { id: 'tempo', label: 'Tempo', poles: ['fast', 'halfCourt'], names: ['Fast', 'Half-court'], defaultPole: 'halfCourt' },
  { id: 'temper', label: 'Temper', poles: ['expressive', 'calm'], names: ['Expressive', 'Calm'], defaultPole: 'calm' },
];

export const SCALE = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
];

export const ITEMS_PER_TRAIT = 4;
export const ITEMS_PER_MODIFIER = 5;
export const MODIFIER_MIDPOINT = 15;

// Provisional thresholds on d = trait score - player mean. Ordered high to low.
// Calibrate against real answer sets; see the spec's Open Items.
export const PROFICIENCY_BANDS = [
  { min: 4.0, label: 'Elite' },
  { min: 2.0, label: 'Excellent' },
  { min: 0.5, label: 'Strong' },
  { min: -2.0, label: 'Solid' },
  { min: -Infinity, label: 'Developing' },
];

export function proficiency(deviation) {
  return PROFICIENCY_BANDS.find((band) => deviation >= band.min).label;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/traits.test.js`
Expected: PASS, 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/traits.js tests/traits.test.js
git commit -m "feat: add trait, role, modifier, and proficiency band model"
```

---

### Task 2: The 46-item Likert instrument

Authoring task. The structure is fixed by code; the copy is written by hand against the constraints below.

**Files:**
- Rewrite: `src/questions.js`
- Create: `tests/questions.test.js`

**Interfaces:**
- Consumes: `TRAITS`, `MODIFIERS`, `ITEMS_PER_TRAIT`, `ITEMS_PER_MODIFIER` from `src/traits.js`.
- Produces: `items` — an array of 46 objects. A trait item is `{ id: 'i1', kind: 'trait', key: 'shooting', stem: string, action: string }`. A modifier item is `{ id: 'i5', kind: 'modifier', key: 'tempo', pole: 'fast', stem: string, action: string }`. `id` is `i` + 1-based position in the final ordered array.

**Authoring constraints (every item):**
- One concrete stem (the situation) plus one specific action. The action is what the player rates.
- Taps exactly one trait, or one modifier pole.
- Must survive a sincere `Never` from some real player. If `Never` would read as admitting to being a bad player, the item measures nothing — rewrite it.
- No action may read as the wrong answer.
- Rotate through the five frames across the set: live situation, preference, adversity, outside view, cost.

**Required facet coverage — the four items for a trait must cover four distinct facets, not paraphrase one another:**

| Trait | Four facets |
|---|---|
| Vision | early read before the catch · passing out of a double · skip/cross-court delivery · giving up your own shot to make a better one |
| Shot Creation | one-on-one from a standstill · shot-clock bailout · handle under ball pressure · creating separation late in a possession |
| Shooting | catch-and-shoot with a hand flying · coming off a screen · deep range · shot diet (declining twos to take threes) |
| Slashing | driving into contact · cutting backdoor · attacking a closeout · finishing over a taller helper |
| Post | sealing for position · backing down a smaller defender · interior footwork over facing up · taking the offensive glass from the block |
| Disruption | digging at a live dribble · jumping a passing lane · full-court ball pressure · accepting a blow-by as the cost of forcing a turnover |
| Protection | leaving your man to meet a driver · verticality over swiping · defensive-rebound positioning · organizing the back line |
| Movement | cutting immediately after giving it up · setting an off-ball screen · relocating to open a driving lane · spacing out of a teammate's drive |
| Grit | loose ball on the floor · offensive rebound in traffic · taking a charge · doing the ugly work with no shot attempt in it |

**Modifier items** — five each, all keyed to the *first* pole unless deliberately written toward the second; a second-pole item's score is reversed during scoring (Task 3 handles this). Tempo: when you want the shot up. Temper: your register under pressure.

**Ordering** — four rounds of nine trait items, the trait order rotated by two each round so no two consecutive items share a trait and no round boundary repeats a trait. Modifier items are inserted at fixed positions, and never conflict because they carry no trait.

- [ ] **Step 1: Write the failing test**

```js
// tests/questions.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { items } from '../src/questions.js';
import { TRAITS, MODIFIERS, ITEMS_PER_TRAIT, ITEMS_PER_MODIFIER } from '../src/traits.js';

test('46 items: four per trait, five per modifier', () => {
  assert.equal(items.length, 46);
  for (const trait of TRAITS) {
    assert.equal(items.filter((item) => item.kind === 'trait' && item.key === trait.id).length, ITEMS_PER_TRAIT, `${trait.id} needs four items`);
  }
  for (const modifier of MODIFIERS) {
    const own = items.filter((item) => item.kind === 'modifier' && item.key === modifier.id);
    assert.equal(own.length, ITEMS_PER_MODIFIER, `${modifier.id} needs five items`);
    assert.ok(own.every((item) => modifier.poles.includes(item.pole)), `${modifier.id} items need a valid pole`);
  }
  assert.equal(items.filter((item) => item.kind === 'trait').length, 36);
});

test('every item has an id, a stem, and one action', () => {
  assert.deepEqual(items.map((item) => item.id), items.map((_item, index) => `i${index + 1}`));
  for (const item of items) {
    assert.ok(item.stem && item.stem.trim(), `${item.id} needs a stem`);
    assert.ok(item.action && item.action.trim(), `${item.id} needs an action`);
    assert.ok(['trait', 'modifier'].includes(item.kind));
  }
});

test('no two consecutive items share a trait', () => {
  for (let index = 1; index < items.length; index++) {
    const previous = items[index - 1];
    const current = items[index];
    if (previous.kind === 'trait' && current.kind === 'trait') {
      assert.notEqual(previous.key, current.key, `${current.id} repeats ${previous.key}`);
    }
  }
});

test('the four items for a trait are distinct from one another', () => {
  for (const trait of TRAITS) {
    const own = items.filter((item) => item.kind === 'trait' && item.key === trait.id);
    assert.equal(new Set(own.map((item) => item.action)).size, own.length, `${trait.id} has duplicate actions`);
    assert.equal(new Set(own.map((item) => item.stem)).size, own.length, `${trait.id} has duplicate stems`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/questions.test.js`
Expected: FAIL — `items` is not exported from `src/questions.js` (the file still exports `questions`)

- [ ] **Step 3: Write the item set**

Replace `src/questions.js` entirely. Author four items per trait against the facet table above, and five per modifier. Two worked examples, to fix the voice:

```js
// Shooting, facet: catch-and-shoot with a hand flying
{ stem: 'A defender closes out hard and you have a live dribble at the elbow.', action: 'You rise into the shot anyway.' }
// Grit, facet: loose ball on the floor
{ stem: 'The ball is loose at your feet with bodies around it.', action: "You're on the floor after it." }
```

Structure, with the rotation that satisfies the consecutive-trait test:

```js
// src/questions.js
import { TRAITS, MODIFIERS } from './traits.js';

// Four items per trait, keyed by trait id, in facet order (see the plan's facet table).
const traitItems = {
  vision: [
    { stem: '...', action: '...' },
    { stem: '...', action: '...' },
    { stem: '...', action: '...' },
    { stem: '...', action: '...' },
  ],
  // ... one entry per trait in TRAITS, four items each
};

// Five items per modifier. `pole` says which pole a high rating supports.
const modifierItems = {
  tempo: [
    { pole: 'fast', stem: '...', action: '...' },
    // ... five total
  ],
  temper: [
    { pole: 'expressive', stem: '...', action: '...' },
    // ... five total
  ],
};

// Four rounds of nine trait items; the trait order rotates by two each round so
// that no two consecutive items share a trait, across round boundaries included.
const rounds = [0, 1, 2, 3].map((round) => TRAITS.map((_trait, position) => {
  const trait = TRAITS[(position + round * 2) % TRAITS.length];
  return { kind: 'trait', key: trait.id, ...traitItems[trait.id][round] };
}));

const modifierQueue = MODIFIERS.flatMap((modifier) => modifierItems[modifier.id].map((item) => ({ kind: 'modifier', key: modifier.id, ...item })));

// Interleave: one modifier item after every fourth trait item until the queue drains.
const ordered = [];
let modifierIndex = 0;
rounds.flat().forEach((item, index) => {
  ordered.push(item);
  if ((index + 1) % 4 === 0 && modifierIndex < modifierQueue.length) {
    ordered.push(modifierQueue[modifierIndex]);
    modifierIndex += 1;
  }
});
ordered.push(...modifierQueue.slice(modifierIndex));

export const items = ordered.map((item, index) => ({ id: `i${index + 1}`, ...item }));
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/questions.test.js && npm run check`
Expected: PASS, 4 tests. If the consecutive-trait test fails, the rotation offset is wrong — do not fix it by reordering copy.

- [ ] **Step 5: Commit**

```bash
git add src/questions.js tests/questions.test.js
git commit -m "feat: replace forced-choice questions with 46 likert items"
```

---

### Task 3: Scoring

**Files:**
- Rewrite: `src/quiz.js`
- Rewrite: `tests/quiz.test.js`

**Interfaces:**
- Consumes: `items` from `src/questions.js`; `TRAITS`, `ROLES`, `MODIFIERS`, `MODIFIER_MIDPOINT`, `proficiency` from `src/traits.js`.
- Produces: `scoreAnswers(answers) -> profile | null`, where `answers` maps item id to an integer 1–5. The profile is:

```js
{
  traits: { vision: 12, shotCreation: 9, /* ...all nine, 4-20 */ },
  mean: 11.2,
  proficiency: { vision: 'Strong', /* ...all nine */ },
  roles: { creator: 10.5, scorer: 8.0, defender: 13.5, connector: 9.0 },
  role: 'defender',
  primary: 'protection',
  secondary: 'grit',
  tempo: 'halfCourt',
  temper: 'calm',
}
```

`archetype`, `slug`, and `tier` are added in Task 4. Also re-export `items` so `src/app.js` has one import site.

- [ ] **Step 1: Write the failing test**

```js
// tests/quiz.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { items, scoreAnswers } from '../src/quiz.js';
import { TRAITS, MODIFIERS } from '../src/traits.js';

const answerAll = (value) => Object.fromEntries(items.map((item) => [item.id, value]));

function withTrait(base, traitId, value) {
  const answers = { ...base };
  for (const item of items.filter((item) => item.kind === 'trait' && item.key === traitId)) {
    answers[item.id] = value;
  }
  return answers;
}

test('incomplete or invalid answers have no result', () => {
  assert.equal(scoreAnswers({}), null);
  const complete = answerAll(3);
  assert.equal(scoreAnswers({ ...complete, i1: 0 }), null);
  assert.equal(scoreAnswers({ ...complete, i1: 6 }), null);
  assert.equal(scoreAnswers({ ...complete, i1: 2.5 }), null);
  assert.equal(scoreAnswers({ ...complete, i1: '4' }), null);
  assert.equal(scoreAnswers({ ...complete, i1: undefined }), null);
});

test('trait scores are independent: maxing one trait moves no other', () => {
  const baseline = scoreAnswers(answerAll(1));
  for (const trait of TRAITS) {
    const raised = scoreAnswers(withTrait(answerAll(1), trait.id, 5));
    assert.equal(raised.traits[trait.id], 20, `${trait.id} should reach 20`);
    for (const other of TRAITS.filter((candidate) => candidate.id !== trait.id)) {
      assert.equal(raised.traits[other.id], baseline.traits[other.id], `${trait.id} moved ${other.id}`);
    }
  }
});

test('a flat profile bands every trait Solid', () => {
  for (const value of [1, 3, 5]) {
    const profile = scoreAnswers(answerAll(value));
    for (const trait of TRAITS) {
      assert.equal(profile.proficiency[trait.id], 'Solid');
    }
  }
});

test('uniformly high and uniformly low responders get the same result', () => {
  const high = scoreAnswers(answerAll(5));
  const low = scoreAnswers(answerAll(1));
  assert.deepEqual(high.proficiency, low.proficiency);
  assert.equal(high.primary, low.primary);
  assert.equal(high.secondary, low.secondary);
  assert.notEqual(high.mean, low.mean);
});

test('role strength is a mean, so three-trait Scorer does not win by construction', () => {
  const answers = answerAll(1);
  const scorers = TRAITS.filter((trait) => trait.role === 'scorer');
  const defenders = TRAITS.filter((trait) => trait.role === 'defender');
  let raised = answers;
  for (const trait of scorers) raised = withTrait(raised, trait.id, 3);
  for (const trait of defenders) raised = withTrait(raised, trait.id, 4);
  const profile = scoreAnswers(raised);
  assert.equal(profile.roles.scorer, 12);
  assert.equal(profile.roles.defender, 16);
  assert.equal(profile.role, 'defender');
});

test('primary and secondary are the top two traits across all nine', () => {
  let answers = answerAll(2);
  answers = withTrait(answers, 'shooting', 5);
  answers = withTrait(answers, 'grit', 4);
  const profile = scoreAnswers(answers);
  assert.equal(profile.primary, 'shooting');
  assert.equal(profile.secondary, 'grit');
  assert.equal(profile.proficiency.shooting, 'Elite');
});

test('ties resolve deterministically by role strength then canonical order', () => {
  const profile = scoreAnswers(answerAll(3));
  const again = scoreAnswers(answerAll(3));
  assert.equal(profile.primary, again.primary);
  assert.equal(profile.secondary, again.secondary);
  assert.notEqual(profile.primary, profile.secondary);
});

test('a modifier sum of exactly the midpoint takes the declared default pole', () => {
  const answers = answerAll(1);
  for (const modifier of MODIFIERS) {
    const own = items.filter((item) => item.kind === 'modifier' && item.key === modifier.id);
    // 5 items summing to 15: 3 each.
    for (const item of own) answers[item.id] = 3;
  }
  const profile = scoreAnswers(answers);
  assert.equal(profile.tempo, 'halfCourt');
  assert.equal(profile.temper, 'calm');
});

test('a modifier above its midpoint takes the leading pole', () => {
  const answers = answerAll(1);
  for (const item of items.filter((item) => item.kind === 'modifier')) {
    answers[item.id] = item.pole === 'fast' || item.pole === 'expressive' ? 5 : 1;
  }
  const profile = scoreAnswers(answers);
  assert.equal(profile.tempo, 'fast');
  assert.equal(profile.temper, 'expressive');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/quiz.test.js`
Expected: FAIL — `src/quiz.js` exports `questions`/`axes`, not `items`, and `scoreAnswers` returns a string

- [ ] **Step 3: Write the implementation**

Replace `src/quiz.js` entirely. `profiles`, `results`, and `axes` are deleted; archetype copy moves to `src/archetypes.js` in Task 4. Write exactly this:

```js
// src/quiz.js
import { items } from './questions.js';
import { TRAITS, ROLES, MODIFIERS, MODIFIER_MIDPOINT, proficiency } from './traits.js';

export { items };

const isValid = (value) => Number.isInteger(value) && value >= 1 && value <= 5;

function sumOf(answers, matches) {
  return items.filter(matches).reduce((total, item) => total + answers[item.id], 0);
}

export function scoreAnswers(answers) {
  if (items.some((item) => !isValid(answers[item.id]))) return null;

  const traits = Object.fromEntries(TRAITS.map((trait) => [
    trait.id,
    sumOf(answers, (item) => item.kind === 'trait' && item.key === trait.id),
  ]));

  const mean = TRAITS.reduce((total, trait) => total + traits[trait.id], 0) / TRAITS.length;

  const bands = Object.fromEntries(TRAITS.map((trait) => [trait.id, proficiency(traits[trait.id] - mean)]));

  const roles = Object.fromEntries(ROLES.map((role) => {
    const members = TRAITS.filter((trait) => trait.role === role.id);
    return [role.id, members.reduce((total, trait) => total + traits[trait.id], 0) / members.length];
  }));

  const strongestRole = ROLES.reduce((best, role) => (roles[role.id] > roles[best.id] ? role : best), ROLES[0]);

  // Rank by score, then by the strength of the trait's role, then by canonical order.
  const ranked = [...TRAITS].sort((left, right) => (
    traits[right.id] - traits[left.id]
    || roles[right.role] - roles[left.role]
    || TRAITS.indexOf(left) - TRAITS.indexOf(right)
  ));

  const modifierPoles = Object.fromEntries(MODIFIERS.map((modifier) => {
    const total = items
      .filter((item) => item.kind === 'modifier' && item.key === modifier.id)
      .reduce((sum, item) => sum + (item.pole === modifier.poles[0] ? answers[item.id] : 6 - answers[item.id]), 0);
    if (total === MODIFIER_MIDPOINT) return [modifier.id, modifier.defaultPole];
    return [modifier.id, total > MODIFIER_MIDPOINT ? modifier.poles[0] : modifier.poles[1]];
  }));

  return {
    traits,
    mean,
    proficiency: bands,
    roles,
    role: strongestRole.id,
    primary: ranked[0].id,
    secondary: ranked[1].id,
    tempo: modifierPoles.tempo,
    temper: modifierPoles.temper,
  };
}
```

Note the modifier reversal: an item written toward the second pole contributes `6 - answer`, so both poles' items sum onto one 5–25 axis toward `poles[0]`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- tests/quiz.test.js && npm run check`
Expected: PASS, 9 tests. `tests/app.test.js` will now fail — Task 5 rewrites it.

- [ ] **Step 5: Commit**

```bash
git add src/quiz.js tests/quiz.test.js
git commit -m "feat: score nine independent traits with within-person proficiency"
```

---

### Task 4: Archetypes

Authoring plus code. Nine pure profiles, thirty authored pairs, and a composed fallback covering all 72 ordered pairs.

**Files:**
- Create: `src/archetypes.js`
- Create: `tests/archetypes.test.js`
- Modify: `src/quiz.js` — `scoreAnswers` gains `tier`, `archetype`, `slug`
- Modify: `tests/quiz.test.js` — add the tier-boundary test below

**Interfaces:**
- Consumes: `TRAITS` from `src/traits.js`.
- Produces: `buildArchetype(primary, secondary, primaryBand) -> { name, slug, tagline, role, description, strengths, tier }` and `ARCHETYPES` — the generated table of all 72 pairs at both pure and non-pure bands, used for slug lookup.

**Naming system.** Composed names are `The <modifier word of secondary> <base name of primary>`:

| Trait | Base name (as primary) | Modifier word (as secondary) |
|---|---|---|
| vision | The Orchestrator | Heads-Up |
| shotCreation | The Shotmaker | Self-Made |
| shooting | The Sniper | Deadeye |
| slashing | The Slasher | Downhill |
| post | The Bruiser | Low-Block |
| disruption | The Pickpocket | Ball-Hawk |
| protection | The Wall | Backline |
| movement | The Mover | Restless |
| grit | The Hard Hat | Blue-Collar |

So `(shooting, grit)` composes to **The Blue-Collar Sniper**, slug `blue-collar-sniper`. Slug is the name lowercased with the leading `The ` dropped and spaces and slashes replaced by hyphens.

**The thirty authored pairs** — chosen as the combinations most likely to be reached, each getting a hand-written name, tagline, role line, description, and three strengths:

`vision+shooting`, `vision+movement`, `vision+shotCreation`, `shotCreation+shooting`, `shotCreation+slashing`, `shotCreation+vision`, `shooting+movement`, `shooting+grit`, `shooting+vision`, `shooting+slashing`, `slashing+shooting`, `slashing+grit`, `slashing+disruption`, `slashing+post`, `post+grit`, `post+protection`, `post+movement`, `disruption+slashing`, `disruption+movement`, `disruption+vision`, `protection+grit`, `protection+post`, `protection+movement`, `movement+shooting`, `movement+grit`, `movement+vision`, `grit+protection`, `grit+post`, `grit+disruption`, `grit+movement`.

**Copy constraints:** tagline is exactly three descriptors joined by ` · `; strengths is exactly three short phrases; description is two to three sentences on how this player wins. Composed copy draws its tagline from the two traits' descriptor pools and assembles its description from trait copy, with one strength per trait plus one from the role.

- [ ] **Step 1: Write the failing test**

```js
// tests/archetypes.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArchetype, ARCHETYPES } from '../src/archetypes.js';
import { TRAITS } from '../src/traits.js';

const pairs = TRAITS.flatMap((primary) => TRAITS.filter((trait) => trait.id !== primary.id).map((secondary) => [primary.id, secondary.id]));

test('there are 72 ordered pairs and every one resolves completely', () => {
  assert.equal(pairs.length, 72);
  for (const [primary, secondary] of pairs) {
    const archetype = buildArchetype(primary, secondary, 'Strong');
    assert.ok(archetype.name, `${primary}+${secondary} needs a name`);
    assert.match(archetype.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(archetype.tagline.split(' · ').length, 3, `${primary}+${secondary} needs three descriptors`);
    assert.ok(archetype.role && archetype.description);
    assert.equal(archetype.strengths.length, 3);
    assert.ok(archetype.strengths.every(Boolean));
    assert.ok(['pure', 'authored', 'composed'].includes(archetype.tier));
  }
});

test('a primary in a top band resolves pure, a lower band does not', () => {
  for (const band of ['Elite', 'Excellent']) {
    assert.equal(buildArchetype('shooting', 'grit', band).tier, 'pure');
  }
  for (const band of ['Strong', 'Solid', 'Developing']) {
    assert.notEqual(buildArchetype('shooting', 'grit', band).tier, 'pure');
  }
});

test('pure depends only on the primary trait', () => {
  const first = buildArchetype('shooting', 'grit', 'Elite');
  const second = buildArchetype('shooting', 'vision', 'Elite');
  assert.equal(first.slug, second.slug);
  assert.equal(new Set(TRAITS.map((trait) => buildArchetype(trait.id, TRAITS.find((other) => other.id !== trait.id).id, 'Elite').slug)).size, 9);
});

test('an authored pair beats composition and an uncurated pair composes', () => {
  assert.equal(buildArchetype('shooting', 'grit', 'Strong').tier, 'authored');
  assert.equal(buildArchetype('post', 'shooting', 'Strong').tier, 'composed');
  assert.equal(buildArchetype('post', 'shooting', 'Strong').name, 'The Deadeye Bruiser');
});

test('every slug is unique across the full table and round-trips', () => {
  // Object keys dedupe silently, so collisions must be counted before the table is built.
  const built = [
    ...TRAITS.map((primary) => buildArchetype(primary.id, TRAITS.find((trait) => trait.id !== primary.id).id, 'Elite')),
    ...pairs.map(([primary, secondary]) => buildArchetype(primary, secondary, 'Strong')),
  ];
  const seen = new Map();
  for (const archetype of built) {
    const previous = seen.get(archetype.slug);
    assert.ok(!previous || previous === archetype.name, `slug ${archetype.slug} is used by both ${previous} and ${archetype.name}`);
    seen.set(archetype.slug, archetype.name);
  }
  for (const slug of Object.keys(ARCHETYPES)) {
    assert.equal(ARCHETYPES[slug].slug, slug);
    assert.ok(ARCHETYPES[slug].name);
  }
  assert.ok(ARCHETYPES['sniper'], 'the pure Shooting archetype should be reachable by slug');
  assert.ok(ARCHETYPES['blue-collar-sniper'], 'the authored shooting+grit archetype should be reachable by slug');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/archetypes.test.js`
Expected: FAIL — `Cannot find module '../src/archetypes.js'`

- [ ] **Step 3: Write the implementation**

```js
// src/archetypes.js
import { TRAITS } from './traits.js';

const PURE_BANDS = ['Elite', 'Excellent'];

const BASE_NAMES = {
  vision: 'The Orchestrator', shotCreation: 'The Shotmaker', shooting: 'The Sniper',
  slashing: 'The Slasher', post: 'The Bruiser', disruption: 'The Pickpocket',
  protection: 'The Wall', movement: 'The Mover', grit: 'The Hard Hat',
};

const MODIFIER_WORDS = {
  vision: 'Heads-Up', shotCreation: 'Self-Made', shooting: 'Deadeye',
  slashing: 'Downhill', post: 'Low-Block', disruption: 'Ball-Hawk',
  protection: 'Backline', movement: 'Restless', grit: 'Blue-Collar',
};

// Three descriptors and one strength per trait, used to assemble composed copy.
const TRAIT_COPY = {
  vision: { descriptors: ['Heads-up', 'Unselfish', 'Early'], strength: 'Reads the floor a beat early', clause: 'you see the next pass before the defense does' },
  // ... one entry per trait
};

const ROLE_STRENGTH = {
  creator: 'Organizes a possession', scorer: 'Puts points on the board',
  defender: 'Takes away what matters', connector: 'Makes the lineup work',
};

// Nine hand-written single-trait profiles, keyed by trait id.
const PURE = {
  shooting: { name: 'The Sniper', slug: 'sniper', tagline: 'Deadly · Ready · Relentless', role: 'Perimeter scoring specialist', description: '...', strengths: ['...', '...', '...'] },
  // ... one entry per trait
};

// Thirty hand-written pairs, keyed `${primary}+${secondary}`.
const AUTHORED = {
  'shooting+grit': { name: 'The Blue-Collar Sniper', slug: 'blue-collar-sniper', tagline: '...', role: '...', description: '...', strengths: ['...', '...', '...'] },
  // ... thirty entries, see the plan's authored-pair list
};

const slugify = (name) => name.replace(/^The /, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function compose(primary, secondary) {
  const name = `${MODIFIER_WORDS[secondary]} ${BASE_NAMES[primary].replace('The ', '')}`;
  const role = TRAITS.find((trait) => trait.id === primary).role;
  return {
    name: `The ${name}`,
    slug: slugify(name),
    tagline: [TRAIT_COPY[primary].descriptors[0], TRAIT_COPY[secondary].descriptors[1], TRAIT_COPY[primary].descriptors[2]].join(' · '),
    role: `${TRAITS.find((trait) => trait.id === primary).label} first, ${TRAITS.find((trait) => trait.id === secondary).label} second`,
    description: `You win by leaning on one thing: ${TRAIT_COPY[primary].clause}. Behind it, ${TRAIT_COPY[secondary].clause}, and that second skill is what makes the first one hard to take away.`,
    strengths: [TRAIT_COPY[primary].strength, TRAIT_COPY[secondary].strength, ROLE_STRENGTH[role]],
  };
}

export function buildArchetype(primary, secondary, primaryBand) {
  if (PURE_BANDS.includes(primaryBand)) return { ...PURE[primary], tier: 'pure' };
  const authored = AUTHORED[`${primary}+${secondary}`];
  if (authored) return { ...authored, tier: 'authored' };
  return { ...compose(primary, secondary), tier: 'composed' };
}

export const ARCHETYPES = Object.fromEntries(
  TRAITS.flatMap((primary) => [
    buildArchetype(primary.id, TRAITS.find((trait) => trait.id !== primary.id).id, 'Elite'),
    ...TRAITS.filter((trait) => trait.id !== primary.id).map((secondary) => buildArchetype(primary.id, secondary.id, 'Strong')),
  ]).map((archetype) => [archetype.slug, archetype]),
);
```

- [ ] **Step 4: Wire the archetype into `scoreAnswers`**

In `src/quiz.js`, add the import and extend the returned object:

```js
import { buildArchetype } from './archetypes.js';
// ...inside scoreAnswers, after `ranked` and `bands` are computed:
const archetype = buildArchetype(ranked[0].id, ranked[1].id, bands[ranked[0].id]);
// ...and in the returned object:
  tier: archetype.tier,
  archetype,
  slug: archetype.slug,
```

Add to `tests/quiz.test.js`:

```js
test('tier selection follows the primary band', () => {
  let answers = Object.fromEntries(items.map((item) => [item.id, 2]));
  const raise = (traitId, value) => {
    for (const item of items.filter((item) => item.kind === 'trait' && item.key === traitId)) answers[item.id] = value;
  };
  raise('shooting', 5);
  const towering = scoreAnswers(answers);
  assert.equal(towering.proficiency.shooting, 'Elite');
  assert.equal(towering.tier, 'pure');
  assert.equal(towering.slug, towering.archetype.slug);

  answers = Object.fromEntries(items.map((item) => [item.id, 4]));
  raise('shooting', 5);
  const modest = scoreAnswers(answers);
  assert.ok(['authored', 'composed'].includes(modest.tier));
});
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npm test -- tests/archetypes.test.js tests/quiz.test.js && npm run check`
Expected: PASS. If the 72-pair test reports a missing name, an authored entry is malformed — composition should never be reached with a missing `TRAIT_COPY` entry.

- [ ] **Step 6: Commit**

```bash
git add src/archetypes.js tests/archetypes.test.js src/quiz.js tests/quiz.test.js
git commit -m "feat: resolve 72 archetypes through pure, authored, and composed tiers"
```

---

### Task 5: App rendering and routing

**Files:**
- Modify: `src/app.js` — imports (line 1), landing copy (lines 36, 40–41), quiz screen (lines 48–68), result screen (lines 70–88), click handling (lines 103–154)
- Rewrite: `tests/app.test.js`
- Modify: `index.html` — the generic `<meta name="description">` mentions five axes

**Interfaces:**
- Consumes: `items`, `scoreAnswers` from `src/quiz.js`; `ARCHETYPES` from `src/archetypes.js`; `TRAITS`, `ROLES`, `MODIFIERS`, `SCALE` from `src/traits.js`.
- Produces: no exports; `src/app.js` stays a side-effecting entry module.

State changes: `answers` maps item id to 1–5 rather than item id to a pole letter. `state.type` (a five-letter code) becomes `state.profile` (the object from `scoreAnswers`) for a completed quiz, or a bare archetype from `ARCHETYPES[slug]` for a shared link — which has no trait scores, so the scorecard renders only when `state.profile` is present.

- [ ] **Step 1: Write the failing test**

```js
// tests/app.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/app.test.js`
Expected: FAIL — `src/quiz.js` no longer exports `results`, and `[data-rating]` does not exist

- [ ] **Step 3: Rewrite the app**

Replace line 1 and the state block:

```js
import { items, scoreAnswers } from './quiz.js';
import { ARCHETYPES } from './archetypes.js';
import { TRAITS, ROLES, MODIFIERS, SCALE } from './traits.js';

const root = document.querySelector('#app');
const slug = new URLSearchParams(window.location.search).get('type');
const shared = slug ? ARCHETYPES[slug] : null;
const state = {
  screen: shared ? 'result' : 'landing',
  index: 0,
  answers: {},
  profile: null,
  archetype: shared,
};
```

Replace the `quiz()` body's question block (old lines 59–63) with the scale:

```js
      <div class="quiz-main">
        <p class="item-stem">${item.stem}</p>
        <h1 id="question-title" tabindex="-1">${item.action}</h1>
        <div class="scale" role="group" aria-label="How often is this you?">
          ${SCALE.map((point) => `<button class="scale-point ${selected === point.value ? 'scale-point--selected' : ''}" data-rating="${point.value}" aria-pressed="${selected === point.value}"><span class="scale-dot"></span><span class="scale-label">${point.label}</span></button>`).join('')}
        </div>
        <div class="quiz-actions"><button class="text-button" data-action="back">${state.index === 0 ? 'Back to start' : 'Previous question'}</button><button class="primary-button primary-button--small" data-action="next" ${selected ? '' : 'disabled'}>${state.index === items.length - 1 ? 'See my type' : 'Next play'} ${arrow}</button></div>
      </div>
```

with `const item = items[state.index];` and `const selected = state.answers[item.id];` at the top of `quiz()`, and `items.length` replacing `questions.length` throughout.

Replace `result()`'s breakdown with the scorecard, rendered only for a completed quiz:

```js
function result() {
  const archetype = state.archetype;
  const profile = state.profile;
  const scorecard = profile ? `<div><h2>Your nine<br />traits</h2>
    <p class="scorecard-note">Measured against the rest of your game.</p>
    <div class="trait-list">${[...TRAITS].sort((left, right) => profile.traits[right.id] - profile.traits[left.id]).map((trait) => `<div class="trait-row"><span class="trait-label">${trait.label}</span><span class="trait-bar"><span class="trait-fill" style="width:${((profile.traits[trait.id] - 4) / 16) * 100}%"></span></span><strong class="trait-band">${profile.proficiency[trait.id]}</strong></div>`).join('')}</div>
    <div class="modifier-list">${MODIFIERS.map((modifier) => `<p><span class="micro-label">${modifier.label}</span> ${modifier.names[modifier.poles.indexOf(profile[modifier.id])]}</p>`).join('')}</div>
  </div>` : '';

  const lead = profile ? 'YOUR SCOUTING REPORT IS IN.' : 'A COURT TYPE.';
  const roleLabel = profile ? ROLES.find((role) => role.id === profile.role).label : archetype.role;
  // ...render as before, using `archetype.name`, `archetype.tagline`, `archetype.description`,
  // `archetype.strengths`, `lead`, `roleLabel`, and `scorecard` in place of the old axis list.
  // The action on a shared link is "Find my court type" (data-action="start"), not "Take it again".
}
```

Replace the choice branch of the click handler (old lines 104–110) and the scoring branch (old lines 131–141):

```js
  const rating = event.target.closest('[data-rating]');
  if (rating) {
    state.answers[items[state.index].id] = Number(rating.dataset.rating);
    quiz();
    root.querySelector(`[data-rating="${rating.dataset.rating}"]`)?.focus();
    return;
  }
```

```js
  } else if (action === 'next') {
    if (!state.answers[items[state.index].id]) return;
    if (state.index < items.length - 1) state.index += 1;
    else {
      const profile = scoreAnswers(state.answers);
      if (!profile) return;
      state.profile = profile;
      state.archetype = profile.archetype;
      state.screen = 'result';
      const url = new URL(window.location.href);
      url.searchParams.set('type', profile.slug);
      window.history.replaceState({}, '', url);
    }
  }
```

In `start`/`restart`, reset `state.profile = null; state.archetype = null;` in place of `state.type = null`.

Landing copy: line 36 becomes `${items.length} game situations · About 10 minutes · No wrong answers`; the manifesto block becomes nine traits and four roles, `32 POSSIBLE STYLES` becomes `72 POSSIBLE TYPES`, and the instinct grid iterates `ROLES` with their member traits instead of `axes`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test && npm run check`
Expected: PASS, all suites. `npm run check` must also be updated in Task 7 to cover the two new modules.

- [ ] **Step 5: Commit**

```bash
git add src/app.js tests/app.test.js index.html
git commit -m "feat: render the likert scale and the nine-trait scorecard"
```

---

### Task 6: Styles

**Files:**
- Modify: `src/styles.css` — replace the `.choice` block with `.scale`, replace `.axis-row`/`.axis-list`/`.axis-label`/`.axis-opposite` with the trait scorecard

**Interfaces:**
- Consumes: the class names emitted in Task 5 — `.item-stem`, `.scale`, `.scale-point`, `.scale-point--selected`, `.scale-dot`, `.scale-label`, `.scorecard-note`, `.trait-list`, `.trait-row`, `.trait-label`, `.trait-bar`, `.trait-fill`, `.trait-band`, `.modifier-list`.
- Produces: no interface.

- [ ] **Step 1: Style the scale**

Five points in a row on desktop, stacked full-width on narrow screens. The row must stay tappable at 360px — if five labels do not fit, show the dots with only the two end labels (`Never`, `Always`) and give each button an `aria-label` carrying its full label.

```css
.scale { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0.5rem; }
.scale-point { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 1rem 0.5rem; background: none; border: 1px solid currentColor; cursor: pointer; }
.scale-point--selected { background: var(--orange, #e8590c); color: #fff; }
.item-stem { opacity: 0.75; margin-bottom: 0.5rem; }
```

- [ ] **Step 2: Style the scorecard**

```css
.trait-row { display: grid; grid-template-columns: 8rem 1fr 6rem; align-items: center; gap: 1rem; }
.trait-bar { height: 0.5rem; background: rgba(0, 0, 0, 0.08); }
.trait-fill { display: block; height: 100%; background: var(--orange, #e8590c); }
.scorecard-note { opacity: 0.7; font-size: 0.85rem; }
```

Match the existing file's variable names and spacing scale rather than the literals above — read the top of `src/styles.css` first and reuse what is there.

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, open `http://localhost:5173`, take the quiz through to a result. Check at 360px and at desktop width that the scale row is tappable, that the selected point is visibly distinct, and that nine bars render in descending order.

- [ ] **Step 4: Commit**

```bash
git add src/styles.css
git commit -m "style: scale row and nine-trait scorecard"
```

---

### Task 7: Documentation and checks

**Files:**
- Modify: `PRODUCT.md` — the Capabilities and Constraints paragraph
- Modify: `README.md` — question count, axes, result count
- Modify: `package.json` — the `check` script

- [ ] **Step 1: Update the check script**

```json
"check": "node --check src/traits.js && node --check src/questions.js && node --check src/archetypes.js && node --check src/quiz.js && node --check src/app.js"
```

- [ ] **Step 2: Update PRODUCT.md**

Replace the Capabilities and Constraints paragraph with:

> The first release has 46 items across nine playing-style traits and 72 archetypes. It takes about ten minutes. It does not use accounts, collect answers, or compare users to real NBA players.

- [ ] **Step 3: Update README.md**

Replace every mention of 45 questions with 46 items, five axes with nine traits in four roles, 32 results with 72 archetypes, and eight minutes with ten.

- [ ] **Step 4: Run the full suite**

Run: `npm test && npm run check`
Expected: PASS, every suite. Confirm no `dependencies` key has appeared in `package.json`.

- [ ] **Step 5: Commit**

```bash
git add PRODUCT.md README.md package.json
git commit -m "docs: update counts for the likert trait instrument"
```

---

## Notes for the executor

- **Do not reintroduce a forced choice.** The trait-independence test in Task 3 is the regression guard for the entire redesign. If it fails, the instrument has regressed to the ipsative model this replaces.
- **Band thresholds are provisional.** If a band looks wrong during play-testing, change the constants in `src/traits.js`, not the scoring logic.
- **The old five-axis code is deleted, not adapted.** `axes`, `results`, `profiles`, and the five-letter codes have no honest translation into the trait model, and existing `?type=chessmaster` links are expected to break.
