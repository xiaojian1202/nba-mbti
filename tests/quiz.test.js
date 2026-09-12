import test from 'node:test';
import assert from 'node:assert/strict';
import { axes, questions, results, scoreAnswers } from '../src/quiz.js';

test('the quiz has nine interleaved questions per five axes', () => {
  assert.equal(questions.length, 45);
  assert.equal(axes.length, 5);
  assert.deepEqual(axes.map((axis) => axis.poles), [['F', 'H'], ['S', 'P'], ['D', 'A'], ['B', 'I'], ['C', 'G']]);
  for (const axis of axes) {
    assert.equal(questions.filter((question) => question.axis === axis.id).length, 9);
  }
  for (let i = 0; i < questions.length; i++) {
    assert.equal(questions[i].axis, axes[i % axes.length].id);
    assert.deepEqual(questions[i].options.map((option) => option.value).sort(), [...axes[i % axes.length].poles].sort());
    assert.ok(questions[i].prompt && questions[i].options.every((option) => option.label));
  }
  assert.equal(new Set(questions.map((question) => question.id)).size, 45);
});

test('incomplete or invalid answers have no result', () => {
  assert.equal(scoreAnswers({}), null);
  const answers = Object.fromEntries(questions.map((question) => [question.id, question.options[0].value]));
  assert.equal(scoreAnswers({ ...answers, q1: 'invalid' }), null);
  assert.equal(scoreAnswers({ ...answers, q45: undefined }), null);
});

test('a five-of-nine majority changes only its own letter', () => {
  const answers = Object.fromEntries(questions.map((question) => [question.id, axes.find((axis) => axis.id === question.axis).poles[0]]));
  const firstCode = axes.map((axis) => axis.poles[0]).join('');
  assert.equal(scoreAnswers(answers), 'FSDBC');
  for (const [index, axis] of axes.entries()) {
    const changed = { ...answers };
    for (const question of questions.filter((item) => item.axis === axis.id).slice(0, 5)) {
      changed[question.id] = axis.poles[1];
    }
    assert.equal(scoreAnswers(changed), firstCode.slice(0, index) + axis.poles[1] + firstCode.slice(index + 1));
  }
});

test('all 32 possible codes have distinct shareable curated profiles', () => {
  assert.equal(Object.keys(results).length, 32);
  const codes = axes.reduce((partial, axis) => partial.flatMap((prefix) => axis.poles.map((pole) => prefix + pole)), ['']);
  const slugs = new Set();
  for (const code of codes) {
    const profile = results[code];
    assert.ok(profile?.name, `${code} needs a name`);
    assert.match(profile.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.equal(profile.tagline.split(' · ').length, 3, `${code} needs three descriptors`);
    assert.ok(profile.role && profile.description);
    assert.equal(profile.strengths.length, 3);
    assert.ok(profile.strengths.every(Boolean));
    assert.ok(!slugs.has(profile.slug), `${profile.slug} is duplicated`);
    slugs.add(profile.slug);
  }
  assert.deepEqual(Object.keys(results).sort(), codes.sort());
});
