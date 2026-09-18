import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArchetype, ARCHETYPES, PURE_DEVIATION_THRESHOLD } from '../src/archetypes.js';
import { TRAITS } from '../src/traits.js';

const pairs = TRAITS.flatMap((primary) => TRAITS.filter((trait) => trait.id !== primary.id).map((secondary) => [primary.id, secondary.id]));

test('trait order does not change which blend you get', () => {
  for (const [primary, secondary] of pairs) {
    const forward = buildArchetype(primary, secondary, 0);
    const reverse = buildArchetype(secondary, primary, 0);
    assert.equal(forward.slug, reverse.slug, `${primary}+${secondary} and its mirror must be one archetype`);
    assert.deepEqual(forward, reverse);
  }
  assert.equal(new Set(pairs.map(([primary, secondary]) => buildArchetype(primary, secondary, 0).slug)).size, 36);
});

test('every blend is hand-written and complete', () => {
  for (const [primary, secondary] of pairs) {
    const archetype = buildArchetype(primary, secondary, 0);
    assert.equal(archetype.tier, 'blend');
    assert.ok(archetype.name, `${primary}+${secondary} needs a name`);
    assert.match(archetype.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(archetype.tagline.split(' · ').filter((word) => word.trim()).length, 3);
    assert.ok(archetype.role && archetype.description);
    assert.equal(new Set(archetype.strengths).size, 3);
    const sentences = archetype.description.split(/[.!?]+/).filter((sentence) => sentence.trim());
    assert.ok(sentences.length >= 2 && sentences.length <= 3, `${archetype.name} description should be 2-3 sentences`);
  }
});

test('a primary deviation at or above the pure threshold resolves pure, below it does not', () => {
  for (const deviation of [PURE_DEVIATION_THRESHOLD, PURE_DEVIATION_THRESHOLD + 3]) {
    assert.equal(buildArchetype('shooting', 'grit', deviation).tier, 'pure');
  }
  for (const deviation of [PURE_DEVIATION_THRESHOLD - 0.01, 2, 0, -5]) {
    assert.equal(buildArchetype('shooting', 'grit', deviation).tier, 'blend');
  }
});

test('pure depends only on the primary trait', () => {
  const first = buildArchetype('shooting', 'grit', PURE_DEVIATION_THRESHOLD);
  const second = buildArchetype('shooting', 'vision', PURE_DEVIATION_THRESHOLD);
  assert.equal(first.slug, second.slug);
  assert.equal(new Set(TRAITS.map((trait) => buildArchetype(trait.id, TRAITS.find((other) => other.id !== trait.id).id, PURE_DEVIATION_THRESHOLD).slug)).size, 9);
});

test('the table is nine pure plus thirty-six blends with distinct identities', () => {
  const profiles = Object.values(ARCHETYPES);
  assert.equal(profiles.length, 45, 'slug collisions would silently drop a profile');
  assert.equal(profiles.filter((profile) => profile.tier === 'pure').length, 9);
  assert.equal(profiles.filter((profile) => profile.tier === 'blend').length, 36);
  for (const field of ['name', 'slug', 'tagline', 'role', 'description']) {
    assert.equal(new Set(profiles.map((profile) => profile[field])).size, 45, `${field} must distinguish every profile`);
  }
  for (const slug of Object.keys(ARCHETYPES)) {
    assert.equal(ARCHETYPES[slug].slug, slug);
  }
  assert.ok(ARCHETYPES['sniper'], 'the pure Shooting archetype should be reachable by slug');
  assert.ok(ARCHETYPES['spacing-engine'], 'the shooting/movement blend should be reachable by slug');
});
