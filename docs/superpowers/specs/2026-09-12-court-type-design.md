# Court Type design

## Purpose

Create a basketball personality quiz that tells someone what kind of player they are on the court. The experience is for casual players and NBA fans; it is entertainment, not a clinical MBTI assessment.

## First release

- A distinctive responsive landing screen that explains the quiz and starts it.
- Twelve basketball-situation questions, three per independent axis: pace (fast break / half court), offensive instinct (scorer / facilitator), decision style (instinct / structure), and team role (closer / connector).
- One question at a time, with progress, answer selection, back navigation, and the ability to start over.
- Deterministic browser-side scoring into 16 four-letter types. Three questions per axis prevent ties; unanswered questions never produce a result.
- Sixteen curated results, each with a name, on-court role, short description, and strengths. A result URL can be copied or shared.
- No accounts, database, real-player comparisons, or collected answers.

## Experience and implementation

Use a lightweight static web app with semantic HTML, CSS, and JavaScript. The visual style draws from a basketball scouting card and arena scoreboard: bold condensed display type, cool concourse slate, ink, and a single vivid orange accent. The quiz must work on mobile and desktop, remain usable with a keyboard, and respect reduced-motion settings. Scoring and result lookup are separate from DOM rendering so the combinations can be tested with Node's built-in test runner.

## Verification

Test scoring for each axis, all 16 result codes, and incomplete answers. Run a local browser check of start, answer, back, finish, restart, share link, desktop layout, and mobile layout.
