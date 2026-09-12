# Court Type Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Build a responsive basketball playing-style quiz with 12 questions and 16 shareable results.

**Architecture:** A static single-page app renders landing, quiz, and result views. Pure scoring and quiz content live in one module, while app state and DOM rendering live in another.

**Tech Stack:** HTML, CSS, JavaScript modules, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-09-12-court-type-design.md`

## Global Constraints

- Exactly 12 questions, three per axis, and 16 curated four-letter results.
- No account, backend, collected answers, or real-player comparisons.
- Keyboard usable and responsive; reduced-motion preferences respected.

---

### Task 1: Quiz model and scoring

**Files:**
- Create: `src/quiz.js`
- Create: `tests/quiz.test.js`
- Create: `package.json`

**Interfaces:**
- Produces: `questions`, `results`, and `scoreAnswers(answers)`; answers is an object keyed by question id with selected pole value, and the scorer returns a four-letter code or `null`.

- [x] **Step 1: Write failing tests** for the twelve-question distribution, missing-answer behavior, scoring choices, and all 16 result codes in `tests/quiz.test.js`.
- [x] **Step 2: Run `npm test`** and confirm the test fails because the quiz module is absent.
- [x] **Step 3: Add the smallest complete quiz model**: four axis definitions, twelve situations with two choices each, 16 named results, and a pure `scoreAnswers` function.
- [x] **Step 4: Run `npm test`** and confirm all tests pass.

### Task 2: Interactive app and presentation

**Files:**
- Create: `index.html`
- Create: `src/app.js`
- Create: `src/styles.css`

**Interfaces:**
- Consumes: `questions`, `results`, and `scoreAnswers` from `src/quiz.js`.

- [x] **Step 1: Create semantic app shell** with a root landmark, metadata, and module entry.
- [x] **Step 2: Implement state transitions** for landing, question, result, back, restart, and shareable type query parameters.
- [x] **Step 3: Style the three views** for mobile and desktop using the scouting-card direction.
- [x] **Step 4: Run `npm test` and `npm run check`**, then inspect the app in a browser at desktop and mobile widths and repair material defects.
