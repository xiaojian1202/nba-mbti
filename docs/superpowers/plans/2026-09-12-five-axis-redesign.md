# Five-Axis Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the approved 45-question, five-axis quiz with 32 curated, shareable archetypes.

**Architecture:** Keep the existing static browser app and generic scoring entry point. Move question data into `src/questions.js`, keep axis/profile data and scoring in `src/quiz.js`, and adapt `src/app.js` to slug URLs and timed advancement.

**Tech Stack:** Browser JavaScript modules, Node's built-in test runner, existing CSS.

**Spec:** `docs/superpowers/specs/2026-09-12-five-axis-redesign-design.md`

## Global Constraints

- Exactly five axes with poles `F/H · S/P · D/A · B/I · C/G` in that order.
- Exactly 45 two-option questions, nine per axis, in nine interleaved rounds; every axis uses each of the five authored frames.
- Exactly 32 curated profiles; codes internal only; share URLs use `?type=<slug>`.
- No dependencies, backend, old-code translation, spectrum scoring, or visual redesign.
- This directory has no Git metadata; worktree creation and per-task commits cannot run here.

---

### Task 1: Quiz model and content

**Files:** Modify `src/quiz.js`; create `src/questions.js`; modify `tests/quiz.test.js`.

**Interfaces:** `axes` and `results` stay exported from `quiz.js`; `questions` is imported there from `questions.js` and re-exported; `scoreAnswers(answers)` returns a five-letter code or `null`. Profiles expose `name`, `slug`, `tagline`, `role`, `description`, and `strengths`.

- [x] **Step 1: Write failing structural and scoring tests.** Assert 45/5/9, exact pole options, five flips changing only the relevant letter, invalid/incomplete answers returning `null`, interleaving, cartesian coverage, and unique URL-safe slugs.
- [x] **Step 2: Run `npm test`; expect the old counts and code shape to fail.**
- [x] **Step 3: Add five axes, 45 authored questions, 32 curated profiles, and `firstPoleCount > axisQuestions.length / 2`.**
- [x] **Step 4: Run `npm test`; expect every structural/scoring test to pass.**

### Task 2: Browser flow and share links

**Files:** Modify `src/app.js`; add `tests/app.test.js` if an isolated DOM harness is needed.

**Interfaces:** Result slugs resolve to internal codes on load; completion writes the profile slug; a choice shows selected state for ~250ms then advances or scores; back navigation cancels pending advancement.

- [x] **Step 1: Add failing flow tests for slug load, unknown slug fallback, share slug, counts/tagline/scorecard, and delayed choice advancement with back correction.**
- [x] **Step 2: Run the new test file and confirm failures are due to old UI behavior.**
- [x] **Step 3: Update the render strings and click handler, keeping a single timer that is cleared on navigation.**
- [x] **Step 4: Run the new test file and `npm test`; confirm pass.**

### Task 3: Content and final verification

**Files:** Modify `PRODUCT.md`, `README.md`, and the existing `.result-code` style in `src/styles.css` only if the tagline requires it.

- [x] **Step 1: Update documented counts, duration, five-axis model, and slug link behavior.**
- [x] **Step 2: Verify `npm test`, `npm run check`, and a browser or HTTP smoke check of the static app; review against every spec section.**
