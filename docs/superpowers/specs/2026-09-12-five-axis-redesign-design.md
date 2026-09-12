# Five-Axis Redesign — Design

Date: 2026-09-12
Status: Approved design, ready for implementation planning
Supersedes the four-axis structure defined in `2026-09-12-court-type-design.md`

## Problem

The shipped quiz has four binary axes (Pace, Offense, Decisions, Team role), three
questions each, and sixteen results. Three problems motivated this redesign:

1. **The axes miss real basketball identity.** All four describe offense. Nothing
   captures how a player defends or how they carry pressure, so results read as
   half a scouting report.
2. **Results are not differentiated enough.** Sixteen offense-only archetypes blur
   into each other. Several differ only in emphasis.
3. **The structure itself is too crude.** Three questions per axis means a single
   flipped answer changes a letter, and a five-letter code shown to the user is
   meaningless to anyone who did not take the quiz.

## Solution Overview

Five binary axes, nine questions each, forty-five questions total, thirty-two
curated results. The internal representation stays a letter code; the user-facing
identity becomes an archetype name and a three-descriptor tagline.

## The Five Axes

Each axis is a genuine binary that players split on, defined so that its poles
cannot be reduced to another axis.

### 1. Tempo — when you want the shot up

- **F · Fast** — value is created by beating the defense's setup. The advantage is
  temporal: arrive before they are organized.
- **H · Half** — value is created by breaking a set defense down. The advantage is
  structural: make them move until something cracks.
- Deciding question: is a good shot early better than a great shot late?

### 2. Creation — how offense comes out of you

- **S · Scorer** — you resolve possessions. The ball's trip ends with you.
- **P · Playmaker** — you advance possessions. Your job is to hand the next person
  a better situation than the one you received.
- Deciding question: when the defense commits to you, is that a scoring
  opportunity or a passing opportunity?

### 3. Defense — how you take things away

- **D · Disruptor** — you subtract by acting: pressure, digs, gambles,
  deflections. Accepts risk in order to force events.
- **A · Anchor** — you subtract by being there: positioning, verticality,
  rotations, no mistakes. Refuses risk in order to prevent events.
- Deciding question: do you want to cause a turnover, or make sure nothing good
  happens?

### 4. Temperament — your register under pressure

- **B · Burn** — pressure is fuel, and it is visible. Emotion is part of how you
  play and how you lift a team.
- **I · Ice** — pressure is noise, and you flatten it. The same face up twenty or
  down twenty.
- Deciding question: does the moment get bigger, and do you want it to?

### 5. Role — what the team gets from you

- **C · Closer** — you want the outcome to run through you. Accountability by
  ownership.
- **G · Glue** — you want the team to be better than the sum of its parts.
  Accountability by service.
- Deciding question: would you rather be the reason we won, or the reason it
  worked?

### Code format

`F/H · S/P · D/A · B/I · C/G`, concatenated in axis order, e.g. `FSDBC`, `HPAIG`.
Thirty-two combinations. Pole letters are unique across all ten poles, so a code
is unambiguous even read out of order.

### Independence

Two pairs are at risk of collapsing into one another and are defined to pull apart:

- **Defense × Temperament.** A gambling defender reads as "fiery". Defense is
  anchored in *method* — risk posture on the floor. Temperament is anchored in
  *affect* — emotional display. An Ice Disruptor is a cold-blooded ball hawk; a
  Burn Anchor is a vocal, chest-thumping rim protector. Both are real players.
- **Creation × Role.** Scorer trends toward Closer. Creation is anchored in
  *possession mechanics* — does the ball stop with you. Role is anchored in
  *accountability preference*. A Playmaker-Closer wants the last decision, not the
  last shot. A Scorer-Glue is a bucket-getter who would rather come off the bench.

Question authoring must respect these anchors: a Defense question may never turn
on how loud a player is, and a Role question may never turn on whether they shoot.

## Identity and Naming

The five-letter code is an internal key only. It is never rendered and never
appears in a URL, because a code like `HPABG` is meaningless to a recipient and
therefore bad for sharing — the core reason the previous structure failed its
users.

Each profile carries:

| Field | Purpose |
|---|---|
| `name` | The archetype, e.g. "The Chessmaster". The primary identity. |
| `slug` | URL key derived from the name, e.g. `chessmaster`. Unique across all 32. |
| `tagline` | Three descriptors, e.g. `Patient · Cold-blooded · Selfless`. |
| `role` | One-line positional summary, e.g. "Half-court conductor". |
| `description` | Two to three sentences on how this player wins. |
| `strengths` | Exactly three short phrases. |

The `tagline` is hand-written per type, drawn from that type's own poles and
chosen for what most defines it. It is written for meaning, not assembled
mechanically from pole names, which is why it cannot be generated.

Because the tagline names only three of five axes, the result page retains a full
axis scorecard — renamed from "Your four instincts" to "Your five instincts" —
spelling out every axis in words with the opposite pole shown greyed. The tagline
gives the gist in one line; the scorecard makes the full answer recoverable.

### URLs

Result URLs become `?type=chessmaster`. On load, the slug resolves to a code via a
lookup over `results`. An unrecognized `type` parameter falls through to the
landing screen, which is the existing behavior for invalid codes.

Existing `?type=FSIC` links break. This is accepted rather than mitigated: the
Decisions axis no longer exists, so old codes cannot be mapped onto the new
structure without inventing an answer the user never gave. Silently mistranslating
someone's result is worse than sending them back to the start.

## Scoring

Forty-five questions, nine per axis, each question offering exactly two options
whose values are the two poles of its axis. Each axis resolves to whichever pole
won the majority of its nine questions. Nine is odd, so ties are structurally
impossible and no tie-break rule is needed. Every question carries equal weight.

`scoreAnswers` keeps its current structure. It already iterates `axes` generically
and returns `null` unless every question has a valid answer. One line changes: the
hardcoded `firstPoleCount >= 2` becomes a majority of that axis's own question
count, so the function stops assuming three questions per axis.

## Question Authoring

Nine questions per axis restate the same binary unless the framing varies. Each
axis rotates through five frames:

1. **Live situation** — "You grab a defensive rebound. First move?"
2. **Preference** — "Which possession would you rather lead?"
3. **Adversity** — "You are 0-for-7. How do you still win?"
4. **Outside view** — "What would your coach put in the scouting report?"
5. **Cost** — "Which mistake can you live with?"

The cost frame is the most discriminating and is absent from the current quiz:
asking what someone will give up separates poles far better than asking what they
prefer. Each axis uses each frame at least once.

Question order interleaves the axes, cycling Tempo → Creation → Defense →
Temperament → Role nine times. No two consecutive questions probe the same axis,
which keeps the repetition invisible to the user.

Neither option in any question may read as the wrong answer. Both poles describe
a legitimate way to help a team.

## Flow Changes

Selecting an answer advances to the next question after roughly 250ms. Today a
choice is selected and then confirmed with "Next play", which is acceptable at
twelve questions but becomes ninety interactions at forty-five. "Previous
question" remains available so an answer can be corrected. This is the only
interaction change; the existing layout, progress bar, and result composition
survive unchanged apart from counts and labels.

## Components

| File | Change |
|---|---|
| `src/quiz.js` | Five axes. Thirty-two profiles with `tagline` and `slug`. `scoreAnswers` generalized to a majority of each axis's question count. |
| `src/questions.js` *(new)* | The forty-five questions, moved out of `quiz.js`. At roughly 180 lines they would swamp the scoring logic; they are pure data with a single consumer. |
| `src/app.js` | Slug-to-code resolution on load and slug in the shared URL; `/12` counters become `/45`; the `result-code` element becomes the tagline; the breakdown heading becomes "Your five instincts"; answer auto-advance; landing copy counts. |
| `tests/quiz.test.js` | Updated and extended, see Testing. |
| `PRODUCT.md` | Twelve to forty-five questions, sixteen to thirty-two results, four to five axes, three to roughly eight minutes. |
| `README.md` | Same counts; the "How it works" paragraph describes five axes and slug URLs. |

`DESIGN.md` and `src/styles.css` change only if the tagline or auto-advance needs
a style that does not already exist. The result page already has a slot for a
prominent line where the code sat.

## Testing

The existing test file has the right shape — structural assertions plus
exhaustive profile coverage — and is extended rather than replaced.

1. Forty-five questions, five axes, nine questions per axis.
2. Every question's two option values are exactly its axis's two poles.
3. An incomplete answer set scores `null`.
4. Majority decides each letter: flipping five of one axis's nine answers changes
   that letter and no other.
5. All thirty-two codes have a profile with a name, tagline, role, description,
   and exactly three strengths. Generated as a cartesian product over `axes`
   rather than five nested loops, so the test does not need editing if an axis is
   ever added.
6. All thirty-two slugs are unique and URL-safe.
7. Question order interleaves: no two consecutive questions share an axis.

## Out of Scope

- Spectrum or magnitude scoring. Letters are binary; the nine-question majority is
  the only aggregation.
- Comparison to real NBA players, accounts, answer storage, and analytics, all of
  which remain excluded per `PRODUCT.md`.
- Redirects or a translation table for old four-letter result links.
- Any visual redesign beyond the label, count, and tagline changes listed above.
