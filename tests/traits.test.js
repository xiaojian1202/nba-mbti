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
