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
