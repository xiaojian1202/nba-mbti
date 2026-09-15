# Trait Archetype Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the five-axis / 32-profile quiz with nine independently scored traits, four derived roles, fixed proficiency bands, and 72 archetypes resolved through pure, authored, and composed tiers.

**Architecture:** The app stays a dependency-free static browser module. Trait, role, modifier, and proficiency data move into a new `src/traits.js`; archetype naming and tier resolution into a new `src/archetypes.js`; `src/questions.js` is rewritten as 27 four-option trait questions plus 10 binary modifier questions; `src/quiz.js` keeps `scoreAnswers` as the single scoring entry point but returns a profile object instead of a letter code; `src/app.js` renders four-option questions and a nine-bar scorecard.

**Tech Stack:** Browser JavaScript ES modules, Node's built-in test runner (`node --test`), existing CSS. No dependencies, no backend, no build step.

**Spec:** `docs/superpowers/specs/2026-09-12-trait-archetype-model-design.md`

## Global Constraints

- Exactly nine traits. Canonical order, used for all tie-breaks and all scorecard rendering: `vision, shotCreation, shooting, slashing, post, disruption, protection, movement, grit`.
- Exactly four roles: Creator (`vision`, `shotCreation`), Scorer (`shooting`, `slashing`, `post`), Defender (`disruption`, `protection`), Connector (`movement`, `grit`).
- Exactly two modifiers: Tempo (`fast` / `halfcourt`), Temper (`expressive` / `calm`).
- Exactly 37 questions: 27 trait questions with four options each, 10 modifier questions with two options each (five per modifier).
- Every trait appears in exactly 12 of the 27 trait questions. Trait scores range 0–12.
- Role strength is the **mean** of its member traits, never the sum.
- Proficiency bands over the theoretical 0–12 range, identical for every trait: 0–5 `Average`, 6–7 `Above Average`, 8–9 `Strong`, 10–11 `Excellent`, 12 `Elite`.
- Pure tier fires when the primary trait's score is ≥ 10 (Excellent or Elite). There is no `PURE_GAP` constant.
- All 72 ordered (primary, secondary) pairs resolve to a complete profile. All 72 slugs are unique and URL-safe.
- Share URLs stay `?type=<slug>`. Existing `?type=chessmaster` links are expected to break and fall through to the landing screen.
- No dependencies, no backend, no answer storage, no visual redesign beyond the four-option layout and the scorecard.
- Commit after each task with `git add <files> && git commit -m "<message>"`.

---

### Task 1: Traits, roles, modifiers, and proficiency bands

**Files:**
- Create: `src/traits.js`
- Test: `tests/traits.test.js` (create)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `TRAITS` — array of 9 objects `{ id, label, role, blurb }` in canonical order.
  - `TRAIT_ORDER` — array of the 9 `id` strings in canonical order.
  - `ROLES` — array of 4 objects `{ id, label, traits: string[], blurb }`.
  - `MODIFIERS` — array of 2 objects `{ id, label, poles: [string, string], names: [string, string] }`.
  - `PROFICIENCY_BANDS` — array of `{ min, max, label }`, ordered low to high.
  - `proficiencyOf(score)` — returns the band label string for a score in 0–12.

- [ ] **Step 1: Write the failing test**

Create `tests/traits.test.js`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { TRAITS, TRAIT_ORDER, ROLES, MODIFIERS, PROFICIENCY_BANDS, proficiencyOf } from '../src/traits.js';

test('nine traits in canonical order, each owned by exactly one role', () => {
  assert.equal(TRAITS.length, 9);
  assert.deepEqual(TRAIT_ORDER, [
    'vision', 'shotCreation', 'shooting', 'slashing', 'post',
    'disruption', 'protection', 'movement', 'grit',
  ]);
  assert.deepEqual(TRAITS.map((trait) => trait.id), TRAIT_ORDER);
  for (const trait of TRAITS) {
    assert.ok(trait.label && trait.blurb, `${trait.id} needs a label and a blurb`);
    const owners = ROLES.filter((role) => role.traits.includes(trait.id));
    assert.equal(owners.length, 1, `${trait.id} must belong to exactly one role`);
    assert.equal(owners[0].id, trait.role);
  }
});

test('four roles partition the traits with Scorer carrying three', () => {
  assert.deepEqual(ROLES.map((role) => role.id), ['creator', 'scorer', 'defender', 'connector']);
  assert.deepEqual(ROLES.map((role) => role.traits.length), [2, 3, 2, 2]);
  assert.deepEqual(ROLES.flatMap((role) => role.traits).sort(), [...TRAIT_ORDER].sort());
  for (const role of ROLES) assert.ok(role.label && role.blurb);
});

test('two binary modifiers', () => {
  assert.deepEqual(MODIFIERS.map((modifier) => modifier.id), ['tempo', 'temper']);
  assert.deepEqual(MODIFIERS.map((modifier) => modifier.poles), [['fast', 'halfcourt'], ['expressive', 'calm']]);
  for (const modifier of MODIFIERS) {
    assert.equal(modifier.names.length, 2);
    assert.ok(modifier.label);
  }
});

test('proficiency bands cover 0-12 exactly once with correct boundaries', () => {
  assert.deepEqual(PROFICIENCY_BANDS.map((band) => band.label), [
    'Average', 'Above Average', 'Strong', 'Excellent', 'Elite',
  ]);
  const seen = [];
  for (let score = 0; score <= 12; score++) {
    const matching = PROFICIENCY_BANDS.filter((band) => score >= band.min && score <= band.max);
    assert.equal(matching.length, 1, `score ${score} must match exactly one band`);
    seen.push(proficiencyOf(score));
  }
  assert.deepEqual(seen, [
    'Average', 'Average', 'Average', 'Average', 'Average', 'Average',
    'Above Average', 'Above Average',
    'Strong', 'Strong',
    'Excellent', 'Excellent',
    'Elite',
  ]);
});

test('proficiency boundaries are exact', () => {
  assert.equal(proficiencyOf(5), 'Average');
  assert.equal(proficiencyOf(6), 'Above Average');
  assert.equal(proficiencyOf(7), 'Above Average');
  assert.equal(proficiencyOf(8), 'Strong');
  assert.equal(proficiencyOf(9), 'Strong');
  assert.equal(proficiencyOf(10), 'Excellent');
  assert.equal(proficiencyOf(11), 'Excellent');
  assert.equal(proficiencyOf(12), 'Elite');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/traits.test.js`
Expected: FAIL with `Cannot find module '.../src/traits.js'`.

- [ ] **Step 3: Write the implementation**

Create `src/traits.js`:

```javascript
export const ROLES = [
  { id: 'creator', label: 'Creator', traits: ['vision', 'shotCreation'], blurb: 'You make the offense happen before the shot exists.' },
  { id: 'scorer', label: 'Scorer', traits: ['shooting', 'slashing', 'post'], blurb: 'You are where the possession is meant to end.' },
  { id: 'defender', label: 'Defender', traits: ['disruption', 'protection'], blurb: 'You decide what the other team is allowed to do.' },
  { id: 'connector', label: 'Connector', traits: ['movement', 'grit'], blurb: 'You make four other players better than they are alone.' },
];

export const TRAITS = [
  { id: 'vision', role: 'creator', label: 'Vision', blurb: 'Passing, reading the floor, organizing a possession.' },
  { id: 'shotCreation', role: 'creator', label: 'Shot Creation', blurb: 'Handle and footwork to manufacture a shot from nothing.' },
  { id: 'shooting', role: 'scorer', label: 'Shooting', blurb: 'Perimeter shooting, off the catch, off screens, range.' },
  { id: 'slashing', role: 'scorer', label: 'Slashing', blurb: 'Attacking the rim, drives, cuts, finishing through contact.' },
  { id: 'post', role: 'scorer', label: 'Post', blurb: 'Back-to-the-basket scoring, interior footwork, sealing position.' },
  { id: 'disruption', role: 'defender', label: 'Disruption', blurb: 'On-ball pressure, hands, steals — forcing events, accepting risk.' },
  { id: 'protection', role: 'defender', label: 'Protection', blurb: 'Rim deterrence, help rotations, verticality — preventing events.' },
  { id: 'movement', role: 'connector', label: 'Movement', blurb: "Off-ball cutting, screening, spacing — making others' offense work." },
  { id: 'grit', role: 'connector', label: 'Grit', blurb: 'Rebounding, loose balls, second chances, the ugly possessions.' },
];

// Canonical order. Used for deterministic tie-breaks and for scorecard rendering.
export const TRAIT_ORDER = TRAITS.map((trait) => trait.id);

export const MODIFIERS = [
  { id: 'tempo', label: 'Tempo', poles: ['fast', 'halfcourt'], names: ['Fast', 'Half court'] },
  { id: 'temper', label: 'Temper', poles: ['expressive', 'calm'], names: ['Expressive', 'Calm'] },
];

// Fixed bands over the theoretical 0-12 range, identical for every trait.
// Absolute, not relative: this says how good you are at a skill, not how it ranks among your own.
export const PROFICIENCY_BANDS = [
  { min: 0, max: 5, label: 'Average' },
  { min: 6, max: 7, label: 'Above Average' },
  { min: 8, max: 9, label: 'Strong' },
  { min: 10, max: 11, label: 'Excellent' },
  { min: 12, max: 12, label: 'Elite' },
];

export function proficiencyOf(score) {
  return PROFICIENCY_BANDS.find((band) => score >= band.min && score <= band.max).label;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/traits.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/traits.js tests/traits.test.js
git commit -m "feat: add trait, role, modifier, and proficiency model"
```

---

### Task 2: Question set

**Files:**
- Modify: `src/questions.js` (full rewrite)
- Test: `tests/questions.test.js` (create)

**Interfaces:**
- Consumes: `TRAIT_ORDER`, `MODIFIERS` from `src/traits.js`.
- Produces: `questions` — array of 37 objects. Trait questions are `{ id: 'q1'..., kind: 'trait', prompt, options: [{ trait, label }] }` with exactly four options. Modifier questions are `{ id, kind: 'modifier', modifier: 'tempo'|'temper', prompt, options: [{ value, label }] }` with exactly two options carrying that modifier's two poles in order.

**The trait schedule is fixed.** Every trait appears in exactly 12 questions and every one of the 36 trait pairs co-occurs 4 or 5 times. Author the copy against this table; do not invent a different assignment.

| Q | Traits (option order) |
|---|---|
| 1 | slashing, movement, disruption, shooting |
| 2 | protection, vision, post, shotCreation |
| 3 | grit, movement, shooting, protection |
| 4 | grit, disruption, slashing, vision |
| 5 | post, shotCreation, movement, grit |
| 6 | shotCreation, slashing, protection, shooting |
| 7 | vision, disruption, post, shooting |
| 8 | grit, protection, post, disruption |
| 9 | slashing, vision, shotCreation, movement |
| 10 | post, shooting, grit, slashing |
| 11 | movement, shotCreation, protection, disruption |
| 12 | vision, disruption, grit, shotCreation |
| 13 | post, shooting, movement, vision |
| 14 | slashing, protection, grit, vision |
| 15 | protection, slashing, movement, post |
| 16 | shotCreation, disruption, shooting, protection |
| 17 | grit, vision, shotCreation, shooting |
| 18 | slashing, disruption, movement, post |
| 19 | disruption, shooting, slashing, shotCreation |
| 20 | protection, vision, movement, grit |
| 21 | post, grit, slashing, shotCreation |
| 22 | vision, shooting, protection, post |
| 23 | disruption, movement, shotCreation, post |
| 24 | slashing, protection, disruption, vision |
| 25 | movement, grit, shooting, shotCreation |
| 26 | vision, slashing, movement, shooting |
| 27 | grit, post, disruption, protection |

Authoring rules for the copy:
- One concrete game situation per prompt; four responses, one per scheduled trait, in the scheduled order.
- No option may read as the wrong answer, and **no option may read as the dull one.** The proficiency bands are fixed across all nine traits, so if one trait's options are consistently the more appealing choice its scores skew high and its bands mean something different from every other trait's. Grit and Protection options need the same care and craft as Slashing and Shooting options.
- Rotate through five frames across the set, each used several times: live situation, preference, adversity, outside view, and cost ("what are you willing to give up").
- Modifier questions keep the best existing Tempo and Temper prompts from the current `src/questions.js` — those are questions 1, 6, 11, 16, 21 (tempo) and 4, 9, 14, 19, 24 (temperament) in the shipped file.
- Final order interleaves the 10 modifier questions among the 27 trait questions so no two consecutive questions share most of their traits.

- [ ] **Step 1: Write the failing test**

Create `tests/questions.test.js`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from '../src/questions.js';
import { TRAIT_ORDER, MODIFIERS } from '../src/traits.js';

const traitQuestions = () => questions.filter((question) => question.kind === 'trait');
const modifierQuestions = () => questions.filter((question) => question.kind === 'modifier');

test('37 questions: 27 trait and 10 modifier, with unique ids', () => {
  assert.equal(questions.length, 37);
  assert.equal(traitQuestions().length, 27);
  assert.equal(modifierQuestions().length, 10);
  assert.equal(new Set(questions.map((question) => question.id)).size, 37);
  for (const question of questions) assert.ok(question.prompt, `${question.id} needs a prompt`);
});

test('every trait question has four options mapping to four distinct known traits', () => {
  for (const question of traitQuestions()) {
    assert.equal(question.options.length, 4, `${question.id} needs four options`);
    const traits = question.options.map((option) => option.trait);
    assert.equal(new Set(traits).size, 4, `${question.id} repeats a trait`);
    for (const trait of traits) assert.ok(TRAIT_ORDER.includes(trait), `${question.id} has unknown trait ${trait}`);
    for (const option of question.options) assert.ok(option.label, `${question.id} has an unlabelled option`);
  }
});

test('every trait appears in exactly 12 trait questions', () => {
  const counts = Object.fromEntries(TRAIT_ORDER.map((trait) => [trait, 0]));
  for (const question of traitQuestions()) {
    for (const option of question.options) counts[option.trait] += 1;
  }
  for (const trait of TRAIT_ORDER) {
    assert.equal(counts[trait], 12, `${trait} appears ${counts[trait]} times, expected 12`);
  }
});

test('every trait pair co-occurs at least once', () => {
  const pairs = new Set();
  for (const question of traitQuestions()) {
    const traits = question.options.map((option) => option.trait);
    for (let i = 0; i < traits.length; i++) {
      for (let j = i + 1; j < traits.length; j++) {
        pairs.add([traits[i], traits[j]].sort().join('|'));
      }
    }
  }
  for (let i = 0; i < TRAIT_ORDER.length; i++) {
    for (let j = i + 1; j < TRAIT_ORDER.length; j++) {
      const key = [TRAIT_ORDER[i], TRAIT_ORDER[j]].sort().join('|');
      assert.ok(pairs.has(key), `${key} never co-occurs`);
    }
  }
});

test('five questions per modifier, each carrying that modifier two poles in order', () => {
  for (const modifier of MODIFIERS) {
    const own = modifierQuestions().filter((question) => question.modifier === modifier.id);
    assert.equal(own.length, 5, `${modifier.id} needs five questions`);
    for (const question of own) {
      assert.deepEqual(question.options.map((option) => option.value), modifier.poles, `${question.id} poles`);
      for (const option of question.options) assert.ok(option.label);
    }
  }
});

test('no two consecutive questions share more than one trait', () => {
  for (let i = 1; i < questions.length; i++) {
    const previous = questions[i - 1];
    const current = questions[i];
    if (previous.kind !== 'trait' || current.kind !== 'trait') continue;
    const previousTraits = new Set(previous.options.map((option) => option.trait));
    const shared = current.options.filter((option) => previousTraits.has(option.trait)).length;
    assert.ok(shared <= 1, `${previous.id} and ${current.id} share ${shared} traits`);
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/questions.test.js`
Expected: FAIL — the shipped `questions.js` exports 45 two-option axis questions, so the count and `kind` assertions fail.

- [ ] **Step 3: Write the implementation**

Rewrite `src/questions.js`. Use this shape, authoring all 27 trait entries against the schedule table above and all 10 modifier entries:

```javascript
// Each trait entry: [prompt, [trait, label], [trait, label], [trait, label], [trait, label]].
// Option traits follow the fixed schedule in the implementation plan: every trait appears
// in exactly 12 questions and every trait pair co-occurs at least four times.
const traitRounds = [
  ['You catch the ball at the elbow with a live dribble.',
    ['slashing', 'Attack the closeout before it sets.'],
    ['movement', 'Give it up and cut off the hand-off.'],
    ['disruption', 'Shot clock is fine — I want the stop that follows.'],
    ['shooting', 'Rise into the shot.']],
  // ...25 more, following the schedule table...
  ['Your team needs one possession to hold a two-point lead.',
    ['grit', 'Win the rebound if it misses.'],
    ['post', 'Seal early and make them foul me.'],
    ['disruption', 'Pick the ball up full court.'],
    ['protection', 'Sit in the paint and take away the rim.']],
];

// Each modifier entry: [modifier, prompt, firstPoleLabel, secondPoleLabel].
const modifierRounds = [
  ['tempo', 'Your team grabs a defensive rebound. What is your first move?',
    'Sprint the lane before the defense gets set.',
    'Bring it up and make the defense guard a full possession.'],
  // ...9 more...
];

const traitQuestions = traitRounds.map(([prompt, ...options], index) => ({
  id: `t${index + 1}`,
  kind: 'trait',
  prompt,
  options: options.map(([trait, label]) => ({ trait, label })),
}));

const modifierQuestions = modifierRounds.map(([modifier, prompt, first, second], index) => ({
  id: `m${index + 1}`,
  kind: 'modifier',
  modifier,
  prompt,
  options: modifier === 'tempo'
    ? [{ value: 'fast', label: first }, { value: 'halfcourt', label: second }]
    : [{ value: 'expressive', label: first }, { value: 'calm', label: second }],
}));

// Interleave: one modifier question after roughly every third trait question.
export const questions = traitQuestions.flatMap((question, index) => {
  const modifierIndex = Math.floor(index / 3);
  const dueHere = index % 3 === 2 && modifierIndex < modifierQuestions.length;
  return dueHere ? [question, modifierQuestions[modifierIndex]] : [question];
}).concat(modifierQuestions.slice(9));
```

If the consecutive-trait test fails, reorder `traitRounds` — the schedule fixes which traits appear together in a question, not which question comes first.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/questions.test.js`
Expected: PASS, 6 tests. `tests/quiz.test.js` and `tests/app.test.js` are expected to fail at this point; Tasks 4 and 5 repair them.

- [ ] **Step 5: Commit**

```bash
git add src/questions.js tests/questions.test.js
git commit -m "feat: rewrite questions as 27 trait and 10 modifier prompts"
```

---

### Task 3: Archetype table and tier resolution

**Files:**
- Create: `src/archetypes.js`
- Test: `tests/archetypes.test.js` (create)

**Interfaces:**
- Consumes: `TRAITS`, `TRAIT_ORDER`, `ROLES` from `src/traits.js`.
- Produces:
  - `buildArchetype(primary, secondary, primaryScore)` — returns `{ name, slug, tagline, role, description, strengths, tier }` for any ordered pair of distinct trait ids. `tier` is `'pure'`, `'authored'`, or `'composed'`. Pure fires when `primaryScore >= 10`.
  - `ARCHETYPES` — array of every resolvable profile, used for slug lookup on page load.
  - `archetypeBySlug(slug)` — returns a profile or `undefined`.

- [ ] **Step 1: Write the failing test**

Create `tests/archetypes.test.js`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArchetype, ARCHETYPES, archetypeBySlug } from '../src/archetypes.js';
import { TRAIT_ORDER } from '../src/traits.js';

const orderedPairs = () => TRAIT_ORDER.flatMap(
  (primary) => TRAIT_ORDER.filter((secondary) => secondary !== primary).map((secondary) => [primary, secondary]),
);

test('all 72 ordered pairs resolve to a complete profile', () => {
  const pairs = orderedPairs();
  assert.equal(pairs.length, 72);
  for (const [primary, secondary] of pairs) {
    const profile = buildArchetype(primary, secondary, 8);
    assert.ok(profile.name, `${primary}/${secondary} needs a name`);
    assert.match(profile.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${primary}/${secondary} slug`);
    assert.equal(profile.tagline.split(' · ').length, 3, `${primary}/${secondary} needs three descriptors`);
    assert.ok(profile.role, `${primary}/${secondary} needs a role line`);
    assert.ok(profile.description, `${primary}/${secondary} needs a description`);
    assert.equal(profile.strengths.length, 3, `${primary}/${secondary} needs three strengths`);
    assert.ok(profile.strengths.every(Boolean));
  }
});

test('every slug is unique and round-trips through lookup', () => {
  const slugs = ARCHETYPES.map((profile) => profile.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'slugs must be unique');
  for (const profile of ARCHETYPES) {
    assert.equal(archetypeBySlug(profile.slug).name, profile.name);
  }
  assert.equal(archetypeBySlug('not-a-real-slug'), undefined);
});

test('pure tier fires at Excellent and not below it', () => {
  const [primary, secondary] = ['shooting', 'grit'];
  assert.equal(buildArchetype(primary, secondary, 10).tier, 'pure');
  assert.equal(buildArchetype(primary, secondary, 12).tier, 'pure');
  assert.notEqual(buildArchetype(primary, secondary, 9).tier, 'pure');
});

test('a pure result ignores the secondary entirely', () => {
  const first = buildArchetype('shooting', 'grit', 11);
  const second = buildArchetype('shooting', 'vision', 11);
  assert.deepEqual(first, second);
});

test('authored pairs win over composed below the pure threshold', () => {
  const authored = ARCHETYPES.filter((profile) => profile.tier === 'authored');
  assert.ok(authored.length >= 25, `expected ~30 authored pairs, found ${authored.length}`);
  for (const profile of authored) {
    assert.equal(buildArchetype(profile.primary, profile.secondary, 8).tier, 'authored');
  }
});

test('there are nine pure profiles, one per trait', () => {
  const pure = ARCHETYPES.filter((profile) => profile.tier === 'pure');
  assert.equal(pure.length, 9);
  assert.deepEqual(pure.map((profile) => profile.primary).sort(), [...TRAIT_ORDER].sort());
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/archetypes.test.js`
Expected: FAIL with `Cannot find module '.../src/archetypes.js'`.

- [ ] **Step 3: Write the implementation**

Create `src/archetypes.js`. Author the nine pure profiles, the base names, the modifier words, the descriptor pools, and roughly 30 authored pairs; the composition function fills the rest:

```javascript
import { TRAITS, TRAIT_ORDER, ROLES } from './traits.js';

const PURE_THRESHOLD = 10; // Excellent or Elite. Replaces the old gap-based PURE_GAP.

const roleOf = (trait) => TRAITS.find((item) => item.id === trait).role;
const roleLabel = (trait) => ROLES.find((role) => role.id === roleOf(trait)).label;

// One authored single-trait profile per trait, used when the primary is Excellent or Elite.
const pureProfiles = {
  shooting: {
    name: 'The Sniper',
    slug: 'sniper',
    tagline: 'Lethal · Patient · Unhurried',
    role: 'Pure perimeter scoring threat',
    description: 'You bend a defense without touching it. The threat of your release moves three defenders before the ball has left your hands.',
    strengths: ['Off-the-catch release', 'Relocation instincts', 'Gravity without the ball'],
  },
  // ...eight more: vision, shotCreation, slashing, post, disruption, protection, movement, grit...
};

// Base name per trait, used as the noun of a composed name.
const baseNames = {
  vision: 'Conductor',
  shotCreation: 'Shotmaker',
  shooting: 'Sniper',
  slashing: 'Slasher',
  post: 'Anchor',
  disruption: 'Hawk',
  protection: 'Wall',
  movement: 'Ghost',
  grit: 'Workhorse',
};

// Modifier word per trait, used as the adjective of a composed name.
// Each must read well in front of all eight other base names.
const modifierWords = {
  vision: 'Unselfish',
  shotCreation: 'Crafty',
  shooting: 'Deadeye',
  slashing: 'Downhill',
  post: 'Low-Block',
  disruption: 'Predatory',
  protection: 'Iron',
  movement: 'Restless',
  grit: 'Blue-Collar',
};

// Three descriptors per trait; composed taglines take two from the primary and one from the secondary.
const descriptors = {
  vision: ['Perceptive', 'Generous', 'Two moves ahead'],
  // ...eight more...
};

// One strength phrase per trait, plus one per role, for composed profiles.
const traitStrengths = {
  vision: 'Reads the whole floor',
  // ...eight more...
};

const roleStrengths = {
  creator: 'Starts the possession',
  scorer: 'Finishes the possession',
  defender: 'Ends theirs',
  connector: 'Holds the five together',
};

// Roughly 30 hand-written pairs, chosen for the combinations players most often reach.
// Key is `${primary}|${secondary}`.
const authoredPairs = {
  'shooting|movement': {
    name: 'The Movement Shooter',
    slug: 'movement-shooter',
    tagline: 'Tireless · Precise · Never still',
    role: 'Perpetual-motion perimeter scorer',
    description: 'You do not wait for the shot; you run until the shot exists. Two screens and a curl later, the defense is a step behind and that is all you need.',
    strengths: ['Coming off screens', 'Reading the chase', 'Conditioning as a weapon'],
  },
  // ...roughly 29 more...
};

const slugify = (name) => name.replace(/^The /, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function compose(primary, secondary) {
  const name = `The ${modifierWords[secondary]} ${baseNames[primary]}`;
  return {
    name,
    slug: slugify(name),
    tagline: [descriptors[primary][0], descriptors[primary][1], descriptors[secondary][0]].join(' · '),
    role: `${roleLabel(primary)} shaded by ${TRAITS.find((t) => t.id === secondary).label.toLowerCase()}`,
    description: `${TRAITS.find((t) => t.id === primary).blurb} ${TRAITS.find((t) => t.id === secondary).blurb} The first is how you win; the second is how you are recognised.`,
    strengths: [traitStrengths[primary], traitStrengths[secondary], roleStrengths[roleOf(primary)]],
  };
}

export function buildArchetype(primary, secondary, primaryScore) {
  if (primaryScore >= PURE_THRESHOLD) {
    return { ...pureProfiles[primary], primary, secondary: null, tier: 'pure' };
  }
  const authored = authoredPairs[`${primary}|${secondary}`];
  if (authored) return { ...authored, primary, secondary, tier: 'authored' };
  return { ...compose(primary, secondary), primary, secondary, tier: 'composed' };
}

export const ARCHETYPES = [
  ...TRAIT_ORDER.map((trait) => ({ ...pureProfiles[trait], primary: trait, secondary: null, tier: 'pure' })),
  ...TRAIT_ORDER.flatMap((primary) => TRAIT_ORDER
    .filter((secondary) => secondary !== primary)
    .map((secondary) => buildArchetype(primary, secondary, 8))),
];

export function archetypeBySlug(slug) {
  return ARCHETYPES.find((profile) => profile.slug === slug);
}
```

Slug collisions between a pure profile and a composed one are possible — `sniper` is both the pure Shooting name and the base name of every composed Shooting archetype. The composed form always carries a modifier word, so `The Sniper` and `The Blue-Collar Sniper` differ; the uniqueness test catches any authored slug that collides with a composed one, and the fix is to rename the authored profile.

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/archetypes.test.js`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/archetypes.js tests/archetypes.test.js
git commit -m "feat: add archetype table with pure, authored, and composed tiers"
```

---

### Task 4: Scoring

**Files:**
- Modify: `src/quiz.js` (full rewrite)
- Modify: `tests/quiz.test.js` (full rewrite)

**Interfaces:**
- Consumes: `questions` from `src/questions.js`; `TRAITS`, `TRAIT_ORDER`, `ROLES`, `MODIFIERS`, `proficiencyOf` from `src/traits.js`; `buildArchetype` from `src/archetypes.js`.
- Produces: `scoreAnswers(answers)` returns `null` for an incomplete or invalid answer set, otherwise:

```javascript
{
  traits: { vision: 3, shotCreation: 0, /* ...all nine, 0-12... */ },
  proficiency: { vision: 'Average', /* ...all nine... */ },
  roles: { creator: 1.5, scorer: 4, defender: 2, connector: 4.5 },  // means, not sums
  role: 'connector',       // strongest role id
  primary: 'grit',         // highest trait id
  secondary: 'movement',   // second-highest trait id
  archetype: { name, slug, tagline, role, description, strengths, primary, secondary, tier },
  tempo: 'fast',
  temper: 'calm',
}
```

`quiz.js` also re-exports `questions`, `TRAITS`, `ROLES`, and `MODIFIERS` so `app.js` keeps a single import source, matching the existing arrangement.

- [ ] **Step 1: Write the failing test**

Rewrite `tests/quiz.test.js`:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, scoreAnswers } from '../src/quiz.js';
import { TRAIT_ORDER, proficiencyOf } from '../src/traits.js';

const traitQuestions = questions.filter((question) => question.kind === 'trait');
const modifierQuestions = questions.filter((question) => question.kind === 'modifier');

// Answer every trait question with the first listed option whose trait is in `preferred`,
// falling back to the first option. Modifier questions take their first pole.
function answersPreferring(preferred) {
  const answers = {};
  for (const question of traitQuestions) {
    const choice = question.options.find((option) => preferred.includes(option.trait)) ?? question.options[0];
    answers[question.id] = choice.trait;
  }
  for (const question of modifierQuestions) answers[question.id] = question.options[0].value;
  return answers;
}

test('an incomplete or invalid answer set scores null', () => {
  assert.equal(scoreAnswers({}), null);
  const complete = answersPreferring([]);
  assert.equal(scoreAnswers({ ...complete, [traitQuestions[0].id]: 'notATrait' }), null);
  assert.equal(scoreAnswers({ ...complete, [traitQuestions[0].id]: undefined }), null);
  assert.equal(scoreAnswers({ ...complete, [modifierQuestions[0].id]: 'sideways' }), null);
});

test('trait scores sum to 27 and stay within 0-12', () => {
  const profile = scoreAnswers(answersPreferring(['shooting']));
  const total = TRAIT_ORDER.reduce((sum, trait) => sum + profile.traits[trait], 0);
  assert.equal(total, 27);
  for (const trait of TRAIT_ORDER) {
    assert.ok(profile.traits[trait] >= 0 && profile.traits[trait] <= 12, `${trait} out of range`);
  }
});

test('always choosing one trait maxes it at 12 and makes it primary', () => {
  for (const trait of TRAIT_ORDER) {
    const profile = scoreAnswers(answersPreferring([trait]));
    assert.equal(profile.traits[trait], 12, `${trait} should reach 12`);
    assert.equal(profile.primary, trait);
    assert.equal(profile.proficiency[trait], 'Elite');
    assert.equal(profile.archetype.tier, 'pure', `${trait} at 12 must resolve pure`);
  }
});

test('proficiency mirrors the band of each trait score', () => {
  const profile = scoreAnswers(answersPreferring(['vision', 'grit']));
  for (const trait of TRAIT_ORDER) {
    assert.equal(profile.proficiency[trait], proficiencyOf(profile.traits[trait]));
  }
});

test('role strength is a mean, not a sum', () => {
  // Scorer has three traits; a sum would let three mediocre scoring traits beat two strong
  // defensive ones. Build an answer set where Defender's mean exceeds Scorer's and assert Defender wins.
  const profile = scoreAnswers(answersPreferring(['disruption', 'protection']));
  assert.equal(profile.role, 'defender');
  const scorerSum = profile.traits.shooting + profile.traits.slashing + profile.traits.post;
  const defenderSum = profile.traits.disruption + profile.traits.protection;
  assert.ok(profile.roles.defender > profile.roles.scorer, 'defender mean must win');
  assert.equal(profile.roles.scorer, scorerSum / 3);
  assert.equal(profile.roles.defender, defenderSum / 2);
});

test('the same answers always produce the same archetype', () => {
  const answers = answersPreferring(['movement', 'grit']);
  const first = scoreAnswers(answers);
  const second = scoreAnswers({ ...answers });
  assert.deepEqual(first, second);
});

test('ranking ties break by role strength then canonical trait order', () => {
  const profile = scoreAnswers(answersPreferring([]));
  assert.ok(TRAIT_ORDER.includes(profile.primary));
  assert.ok(TRAIT_ORDER.includes(profile.secondary));
  assert.notEqual(profile.primary, profile.secondary);
});

test('modifiers resolve to a single pole each and never reach the archetype', () => {
  const profile = scoreAnswers(answersPreferring(['shooting']));
  assert.ok(['fast', 'halfcourt'].includes(profile.tempo));
  assert.ok(['expressive', 'calm'].includes(profile.temper));
  assert.doesNotMatch(profile.archetype.name, /Fast|Half court|Expressive|Calm/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/quiz.test.js`
Expected: FAIL — `scoreAnswers` currently returns a five-letter string, so `profile.traits` is undefined.

- [ ] **Step 3: Write the implementation**

Rewrite `src/quiz.js`:

```javascript
import { questions } from './questions.js';
import { TRAITS, TRAIT_ORDER, ROLES, MODIFIERS, proficiencyOf } from './traits.js';
import { buildArchetype, archetypeBySlug, ARCHETYPES } from './archetypes.js';

export { questions, TRAITS, TRAIT_ORDER, ROLES, MODIFIERS, ARCHETYPES, archetypeBySlug, proficiencyOf };

function isValid(answers) {
  return questions.every((question) => question.kind === 'trait'
    ? question.options.some((option) => option.trait === answers[question.id])
    : question.options.some((option) => option.value === answers[question.id]));
}

export function scoreAnswers(answers) {
  if (!isValid(answers)) return null;

  // 1. Trait scores.
  const traits = Object.fromEntries(TRAIT_ORDER.map((trait) => [trait, 0]));
  for (const question of questions) {
    if (question.kind === 'trait') traits[answers[question.id]] += 1;
  }

  // 2. Role strength is the mean of member traits, so Scorer's third trait cannot inflate it.
  const roles = Object.fromEntries(ROLES.map((role) => [
    role.id,
    role.traits.reduce((sum, trait) => sum + traits[trait], 0) / role.traits.length,
  ]));
  const role = ROLES.map((item) => item.id).reduce((best, id) => (roles[id] > roles[best] ? id : best));

  // 3. Primary and secondary, ranked across all nine. Ties break by role strength,
  // then by canonical trait order, so identical answers always yield an identical result.
  const ranked = [...TRAIT_ORDER].sort((a, b) => {
    if (traits[b] !== traits[a]) return traits[b] - traits[a];
    const roleA = roles[TRAITS.find((trait) => trait.id === a).role];
    const roleB = roles[TRAITS.find((trait) => trait.id === b).role];
    if (roleB !== roleA) return roleB - roleA;
    return TRAIT_ORDER.indexOf(a) - TRAIT_ORDER.indexOf(b);
  });
  const [primary, secondary] = ranked;

  // 4. Proficiency: absolute bands over 0-12, identical for every trait.
  const proficiency = Object.fromEntries(TRAIT_ORDER.map((trait) => [trait, proficiencyOf(traits[trait])]));

  // 5. Tier resolution.
  const archetype = buildArchetype(primary, secondary, traits[primary]);

  const modifier = (id) => {
    const own = questions.filter((question) => question.modifier === id);
    const poles = MODIFIERS.find((item) => item.id === id).poles;
    const first = own.filter((question) => answers[question.id] === poles[0]).length;
    return first > own.length / 2 ? poles[0] : poles[1];
  };

  return {
    traits,
    proficiency,
    roles,
    role,
    primary,
    secondary,
    archetype,
    tempo: modifier('tempo'),
    temper: modifier('temper'),
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --test tests/quiz.test.js`
Expected: PASS, 8 tests.

- [ ] **Step 5: Commit**

```bash
git add src/quiz.js tests/quiz.test.js
git commit -m "feat: score nine traits, roles, proficiency, and archetype tier"
```

---

### Task 5: Result rendering and share links

**Files:**
- Modify: `src/app.js`
- Modify: `src/styles.css`
- Modify: `tests/app.test.js`

**Interfaces:**
- Consumes: `questions`, `scoreAnswers`, `TRAITS`, `TRAIT_ORDER`, `ROLES`, `MODIFIERS`, `archetypeBySlug` from `src/quiz.js`.
- Produces: no exports. `state.profile` holds the `scoreAnswers` return value, or a slug-loaded archetype with no trait scores.

Rendering changes:
- **Quiz screen:** four choice buttons for trait questions, two for modifier questions. Choice letters run `A`–`D`. `data-choice` carries the option's `trait` for trait questions and its `value` for modifier questions. The count reads `QUESTION 01 / 37`.
- **Result screen, top to bottom:** role band, archetype name, tagline, description and exactly three strengths, the nine-bar scorecard, then one line each for Tempo and Temper.
- **Scorecard:** nine rows in canonical trait order, sorted by score descending, each with the trait label, a bar whose width is `score / 12 * 100`%, the raw score, and its proficiency label.
- **Slug loading:** a URL slug resolves through `archetypeBySlug`. A slug-loaded result has no trait scores, so the scorecard and modifier lines are omitted and only the archetype copy renders. An unrecognised slug falls through to the landing screen, unchanged from today.
- **Landing copy:** `37 game situations`, and the instinct grid renders the four roles rather than the five axes.

- [ ] **Step 1: Write the failing test**

Rewrite `tests/app.test.js`, keeping the existing `mount` harness verbatim and replacing the two tests:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { questions, ARCHETYPES } from '../src/quiz.js';

// ...keep the existing mount() helper unchanged...

test('a known slug loads its archetype and an unknown slug returns to landing', async () => {
  const target = ARCHETYPES.find((profile) => profile.tier === 'pure');
  const known = await mount(`?type=${target.slug}`);
  try {
    assert.ok(known.root.innerHTML.includes(target.name));
    assert.ok(known.root.innerHTML.includes(target.tagline));
    // A slug-loaded result has no answers, so no scorecard.
    assert.equal((known.root.innerHTML.match(/class="trait-row"/g) || []).length, 0);
  } finally { known.cleanup(); }

  const unknown = await mount('?type=chessmaster');
  try { assert.match(unknown.root.innerHTML, /Find my court type/); }
  finally { unknown.cleanup(); }
});

test('completing the quiz renders a nine-bar scorecard with proficiency labels', async () => {
  const app = await mount();
  try {
    assert.match(app.root.innerHTML, /37 game situations/);
    await app.action('start');
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 37/);
    assert.match(app.root.innerHTML, /data-action="next" disabled/);

    for (const question of questions) {
      const value = question.kind === 'trait' ? question.options[0].trait : question.options[0].value;
      await app.choose(value);
      await app.action('next');
    }

    assert.equal((app.root.innerHTML.match(/class="trait-row"/g) || []).length, 9);
    assert.match(app.root.innerHTML, /Average|Above Average|Strong|Excellent|Elite/);
    assert.match(app.root.innerHTML, /Tempo/);
    assert.match(app.root.innerHTML, /Temper/);
    const slug = new URL(app.href).searchParams.get('type');
    assert.ok(ARCHETYPES.some((profile) => profile.slug === slug), `${slug} must be a known archetype slug`);
  } finally { app.cleanup(); }
});

test('trait questions render four choices and modifier questions render two', async () => {
  const app = await mount();
  try {
    await app.action('start');
    const expected = questions[0].kind === 'trait' ? 4 : 2;
    assert.equal((app.root.innerHTML.match(/class="choice /g) || []).length, expected);
  } finally { app.cleanup(); }
});

test('back preserves a previous answer', async () => {
  const app = await mount();
  try {
    await app.action('start');
    const first = questions[0].kind === 'trait' ? questions[0].options[0].trait : questions[0].options[0].value;
    await app.choose(first);
    await app.action('next');
    await app.action('back');
    assert.match(app.root.innerHTML, /QUESTION 01 \/ 37/);
    assert.doesNotMatch(app.root.innerHTML, /data-action="next" disabled/);
  } finally { app.cleanup(); }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/app.test.js`
Expected: FAIL — `app.js` still imports `axes` and `results` from `quiz.js`, which no longer exports them.

- [ ] **Step 3: Write the implementation**

In `src/app.js`:

Replace the import and initial state:

```javascript
import { questions, scoreAnswers, TRAITS, TRAIT_ORDER, ROLES, MODIFIERS, ARCHETYPES, archetypeBySlug } from './quiz.js';

const root = document.querySelector('#app');
const slug = new URLSearchParams(window.location.search).get('type');
const loaded = slug ? archetypeBySlug(slug) : undefined;
const state = {
  screen: loaded ? 'result' : 'landing',
  index: 0,
  answers: {},
  profile: loaded ? { archetype: loaded, traits: null } : null,
};
```

Replace the choice rendering inside `quiz()`:

```javascript
const letters = ['A', 'B', 'C', 'D'];
// ...
${question.options.map((option, i) => {
  const value = question.kind === 'trait' ? option.trait : option.value;
  return `<button class="choice ${selected === value ? 'choice--selected' : ''}" data-choice="${value}" aria-pressed="${selected === value}"><span class="choice-letter">${letters[i]}</span><span class="choice-text">${option.label}</span></button>`;
}).join('')}
```

Replace `result()`:

```javascript
function result() {
  const { archetype, traits, proficiency, role, tempo, temper } = state.profile;
  const band = role ? ROLES.find((item) => item.id === role) : null;

  const scorecard = traits ? [...TRAIT_ORDER]
    .sort((a, b) => traits[b] - traits[a] || TRAIT_ORDER.indexOf(a) - TRAIT_ORDER.indexOf(b))
    .map((id) => {
      const trait = TRAITS.find((item) => item.id === id);
      return `<div class="trait-row"><span class="trait-label">${trait.label}</span><span class="trait-bar"><span class="trait-fill" style="width:${(traits[id] / 12) * 100}%"></span></span><span class="trait-score">${traits[id]}</span><span class="trait-proficiency">${proficiency[id]}</span></div>`;
    }).join('') : '';

  const modifierLines = traits ? MODIFIERS.map((modifier) => {
    const chosen = modifier.id === 'tempo' ? tempo : temper;
    const side = modifier.poles.indexOf(chosen);
    return `<div class="modifier-row"><span class="modifier-label">${modifier.label}</span><strong>${modifier.names[side]}</strong><span class="modifier-opposite">${modifier.names[1 - side]}</span></div>`;
  }).join('') : '';

  root.innerHTML = `<div class="page page--result">
    ${header()}
    <main class="shell">
    <section class="result-lead" aria-labelledby="result-title">
      <div class="result-left"><p class="result-tag">YOUR SCOUTING REPORT IS IN.</p>${band ? `<p class="result-band">${band.label}</p>` : ''}<p class="result-stamp">ONE OF SEVENTY-TWO COURT TYPES</p></div>
      <div class="result-right"><h1 id="result-title" tabindex="-1">${archetype.name}</h1><p class="result-tagline">${archetype.tagline}</p><p class="result-role">${archetype.role}</p><p class="result-description">${archetype.description}</p><div class="result-actions"><button class="primary-button primary-button--small" data-action="share">Copy result link ${arrow}</button><button class="text-button" data-action="restart">Take it again</button></div><p id="share-status" class="share-status" role="status" aria-live="polite"></p></div>
    </section>
    <section class="result-details"><div><h2>What you bring<br />to the floor</h2><ul class="strength-list">${archetype.strengths.map((strength, i) => `<li><span class="circle-number">0${i + 1}</span>${strength}</li>`).join('')}</ul></div>${traits ? `<div><h2>Your nine<br />traits</h2><div class="trait-list">${scorecard}</div><div class="modifier-list">${modifierLines}</div></div>` : ''}</section>
    <section class="end-cta"><button data-action="restart"><span class="micro-label">THE BEST TEAMS NEED EVERY TYPE</span><span class="end-cta-line">Run It Back <span class="line-arrow" aria-hidden="true"></span></span></button></section></main>
    ${footer()}
  </div>`;
}
```

In the click handler, replace the `next` completion branch and the `start`/`restart` reset:

```javascript
// in 'start' / 'restart':
state.profile = null;

// in 'next':
if (state.index < questions.length - 1) state.index += 1;
else {
  state.profile = scoreAnswers(state.answers);
  if (!state.profile) return;
  state.screen = 'result';
  const url = new URL(window.location.href);
  url.searchParams.set('type', state.profile.archetype.slug);
  window.history.replaceState({}, '', url);
}
```

In `landing()`, change the question count to `${questions.length} game situations`, change the heading to `Nine traits.<br />One court type.`, change the copy under it to name the four roles, change `32 POSSIBLE STYLES` to `72 POSSIBLE STYLES`, and render the instinct grid from `ROLES` instead of `axes`:

```javascript
${ROLES.map((role, i) => `<article class="instinct-card"><span class="circle-number">${String(i + 1).padStart(2, '0')}</span><h3>${role.label}</h3><p>${role.blurb}</p></article>`).join('')}
```

In `src/styles.css`, add the four-option and scorecard rules next to the existing `.axis-row` block, and delete the now-unused `.axis-row`, `.axis-label`, `.axis-opposite`, `.axis-list`, and `.result-code` rules:

```css
.choices { display: grid; gap: 0.75rem; }
.trait-row { display: grid; grid-template-columns: 9rem 1fr 2rem 7rem; align-items: center; gap: 0.75rem; padding: 0.4rem 0; }
.trait-bar { background: rgba(0, 0, 0, 0.08); height: 0.5rem; border-radius: 999px; overflow: hidden; }
.trait-fill { display: block; height: 100%; background: var(--accent, #e2622a); }
.trait-score { font-variant-numeric: tabular-nums; text-align: right; }
.trait-proficiency { font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; opacity: 0.7; }
.modifier-row { display: grid; grid-template-columns: 9rem 1fr 1fr; align-items: center; gap: 0.75rem; padding: 0.4rem 0; }
.modifier-opposite { opacity: 0.45; }
@media (max-width: 640px) {
  .trait-row { grid-template-columns: 1fr 2rem; grid-template-areas: 'label score' 'bar bar' 'proficiency proficiency'; }
  .trait-label { grid-area: label; } .trait-score { grid-area: score; }
  .trait-bar { grid-area: bar; } .trait-proficiency { grid-area: proficiency; }
}
```

Confirm `--accent` exists in `styles.css`; if the file uses a literal orange, use that literal instead of the variable.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/app.test.js`
Expected: PASS, 4 tests.

Run: `npm test`
Expected: PASS, all five test files.

Run: `npm run check`
Expected: no output, exit 0. Note that `check` currently lints only three files — extend it to the new modules:

```json
"check": "node --check src/questions.js && node --check src/quiz.js && node --check src/app.js && node --check src/traits.js && node --check src/archetypes.js"
```

- [ ] **Step 5: Commit**

```bash
git add src/app.js src/styles.css tests/app.test.js package.json
git commit -m "feat: render role band, archetype, and nine-trait scorecard"
```

---

### Task 6: Documentation and final verification

**Files:**
- Modify: `README.md`
- Modify: `PRODUCT.md`
- Modify: `docs/superpowers/specs/2026-09-12-trait-archetype-model-design.md` (status line only)

- [ ] **Step 1: Update the documented model**

In `README.md` and `PRODUCT.md`, replace throughout:
- 45 questions → 37 questions; "about eight minutes" → "about six minutes"
- five axes (tempo, creation, defense, temperament, role) → nine traits in four roles, plus two displayed modifiers
- 32 curated archetypes → 72 archetypes across pure, authored, and composed tiers
- add one sentence naming the proficiency bands: `Average, Above Average, Strong, Excellent, Elite`, and stating they are fixed bands over the 0–12 range rather than a ranking
- keep the existing statements that scoring is entirely in the browser with no account or backend
- note that `?type=<slug>` links from the previous five-axis version no longer resolve

Update the `npm run check` line in `README.md` if the script description mentions specific files.

- [ ] **Step 2: Mark the spec implemented**

Change the spec's `Status:` line to `Implemented` and delete the Open Items entry about proficiency bands only if the question set was authored and the balance tests pass; otherwise leave it as a live authoring constraint.

- [ ] **Step 3: Run the full verification**

```bash
npm test
npm run check
```

Expected: all tests pass, `check` exits 0.

- [ ] **Step 4: Smoke-test in a browser**

```bash
npm run dev
```

Open `http://localhost:5173`. Confirm: landing shows 37 questions and four roles; a trait question shows four choices lettered A–D; a modifier question shows two; completing the quiz shows a role band, an archetype name, three strengths, nine scorecard rows each with a proficiency label, and Tempo and Temper lines; the URL carries `?type=<slug>`; reloading that URL shows the same archetype without the scorecard; `?type=chessmaster` shows the landing screen.

- [ ] **Step 5: Commit**

```bash
git add README.md PRODUCT.md docs/superpowers/specs/2026-09-12-trait-archetype-model-design.md
git commit -m "docs: document nine-trait model and proficiency bands"
```
