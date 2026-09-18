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
  answers[items.find((item) => item.kind === 'trait' && item.key === 'shooting').id] = 5;
  const modest = scoreAnswers(answers);
  assert.equal(modest.proficiency.shooting, 'Strong');
  assert.equal(modest.tier, 'blend');
});

test('a plausible two-strong-trait profile resolves to a pair archetype, not a pure one', () => {
  // Everything at 3 except two genuinely strong traits at 5. Under the old Elite/Excellent
  // gate this primary trait would have banded 'Elite' and wrongly returned a pure result,
  // discarding the secondary trait. The raised gate requires a much larger standout.
  const raise = (answers, traitId, value) => {
    for (const item of items.filter((item) => item.kind === 'trait' && item.key === traitId)) answers[item.id] = value;
    return answers;
  };
  let answers = Object.fromEntries(items.map((item) => [item.id, 3]));
  answers = raise(answers, 'shooting', 5);
  answers = raise(answers, 'grit', 4);
  const profile = scoreAnswers(answers);
  assert.equal(profile.primary, 'shooting');
  assert.equal(profile.secondary, 'grit');
  assert.equal(profile.proficiency.shooting, 'Elite');
  assert.notEqual(profile.tier, 'pure');
  assert.equal(profile.tier, 'blend');
});

test('lean measures the primary trait against the secondary, and ignores their order', () => {
  const raise = (answers, traitId, value) => {
    for (const item of items.filter((item) => item.kind === 'trait' && item.key === traitId)) answers[item.id] = value;
    return answers;
  };
  let answers = Object.fromEntries(items.map((item) => [item.id, 3]));
  answers = raise(answers, 'shooting', 5);
  answers = raise(answers, 'grit', 4);
  const lopsided = scoreAnswers(answers);
  assert.equal(lopsided.lean, lopsided.traits.shooting / (lopsided.traits.shooting + lopsided.traits.grit));
  assert.ok(lopsided.lean > 0.5 && lopsided.lean < 1);

  // Swapping which of the two is stronger keeps the same archetype and mirrors the lean.
  let swapped = Object.fromEntries(items.map((item) => [item.id, 3]));
  swapped = raise(swapped, 'grit', 5);
  swapped = raise(swapped, 'shooting', 4);
  const mirrored = scoreAnswers(swapped);
  assert.equal(mirrored.primary, 'grit');
  assert.equal(mirrored.secondary, 'shooting');
  assert.equal(mirrored.slug, lopsided.slug, 'order must not change the archetype');
  assert.equal(mirrored.lean, lopsided.lean, 'the mirrored profile leans as far the other way');
});
