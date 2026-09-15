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

test('the exact thirty authored pairs and nine pure profiles have distinct complete identities', () => {
  const authoredPairs = [
    'vision+shooting', 'vision+movement', 'vision+shotCreation',
    'shotCreation+shooting', 'shotCreation+slashing', 'shotCreation+vision',
    'shooting+movement', 'shooting+grit', 'shooting+vision', 'shooting+slashing',
    'slashing+shooting', 'slashing+grit', 'slashing+disruption', 'slashing+post',
    'post+grit', 'post+protection', 'post+movement',
    'disruption+slashing', 'disruption+movement', 'disruption+vision',
    'protection+grit', 'protection+post', 'protection+movement',
    'movement+shooting', 'movement+grit', 'movement+vision',
    'grit+protection', 'grit+post', 'grit+disruption', 'grit+movement',
  ];
  for (const [primary, secondary] of pairs) {
    assert.equal(buildArchetype(primary, secondary, 'Strong').tier,
      authoredPairs.includes(`${primary}+${secondary}`) ? 'authored' : 'composed');
  }
  const profiles = Object.values(ARCHETYPES);
  assert.equal(profiles.length, 81, 'nine pure plus 72 ordered pair profiles must not collide');
  assert.equal(profiles.filter((profile) => profile.tier === 'pure').length, 9);
  assert.equal(profiles.filter((profile) => profile.tier === 'authored').length, 30);
  assert.equal(profiles.filter((profile) => profile.tier === 'composed').length, 42);
  for (const profile of profiles) {
    assert.equal(profile.tagline.split(' · ').filter((word) => word.trim()).length, 3);
    assert.equal(new Set(profile.strengths).size, 3);
    assert.ok(profile.description.split(/[.!?]+/).filter((sentence) => sentence.trim()).length >= 2);
    assert.ok(profile.description.split(/[.!?]+/).filter((sentence) => sentence.trim()).length <= 3);
    assert.deepEqual(ARCHETYPES[profile.slug], profile);
  }
  const written = profiles.filter((profile) => profile.tier !== 'composed');
  for (const field of ['name', 'slug', 'tagline', 'role', 'description']) {
    assert.equal(new Set(written.map((profile) => profile[field])).size, 39, `${field} must distinguish written profiles`);
  }
});
