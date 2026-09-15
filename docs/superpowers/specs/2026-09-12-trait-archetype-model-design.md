# Trait Archetype Model — Design

Date: 2026-09-12
Status: SUPERSEDED by `2026-09-15-likert-trait-instrument-design.md`. Do not implement
from this document: its forced-choice instrument makes trait scores ipsative, and its
absolute proficiency bands are not supported by that instrument.
Supersedes `2026-09-12-five-axis-redesign-design.md`

## Problem

The shipped quiz scores five binary axes — Tempo, Creation, Defense, Temperament,
Role — nine questions each, and maps the resulting five-letter code onto one of
thirty-two authored profiles. Two defects motivate this redesign.

**The axes measure style and never skill.** Nothing in the system asks how a
player generates offense. "Sharp shooter" is unreachable at every setting,
because shooting is not a dimension. A spot-up shooter and a rim-attacking
slasher both answer `S · Scorer`, and are then separated by tempo and
temperament — which is not what distinguishes them. Every result is a style
portrait of a player whose skills were never examined.

**Every axis is forced into a dichotomy.** Nine questions resolve to one letter
by majority, so a genuine 5–4 split is reported with the same confidence as 9–0.
A balanced player is told they are an extremist, and the half of the answer that
lost is discarded rather than shown. Basketball identity is not made of opposed
pairs: shooting, driving, and passing are three things, not two poles.

## Solution Overview

Nine independently scored traits grouped into four functional roles. Identity is
the ordered pair of a player's two strongest traits, resolved through three tiers
— pure, authored, composed — so common archetypes are hand-written and complete
while rare combinations still produce a coherent, gapless result. Every trait is
additionally reported at a fixed proficiency level, so a result says how good this
player is at each skill and not only which skills rank highest. Tempo and
Temper survive as displayed modifiers that colour a result without selecting it.

Roles are functions, not positions. Nothing in the model knows or asserts a
player's size, and a defence-first player receives a defence-first identity
rather than an offensive archetype with a footnote.

## Traits and Roles

| Role | Trait | What it measures |
|---|---|---|
| **Creator** | Vision | Passing, reading the floor, organizing a possession |
| | Shot Creation | Handle and footwork to manufacture a shot from nothing |
| **Scorer** | Shooting | Perimeter shooting, off the catch, off screens, range |
| | Slashing | Attacking the rim, drives, cuts, finishing through contact |
| | Post | Back-to-the-basket scoring, interior footwork, sealing position |
| **Defender** | Disruption | On-ball pressure, hands, steals — forcing events, accepting risk |
| | Protection | Rim deterrence, help rotations, verticality — preventing events |
| **Connector** | Movement | Off-ball cutting, screening, spacing — making others' offense work |
| | Grit | Rebounding, loose balls, second chances, the ugly possessions |

Roles are derived from traits, never measured directly. Scorer carries three
traits and every other role carries two; the scoring rule below neutralizes that
asymmetry.

### Modifiers

Two binary modifiers survive from the previous structure, with their best
existing questions:

- **Tempo** — Fast / Half-court. When you want the shot up.
- **Temper** — Expressive / Calm. Your register under pressure.

Modifiers are displayed and inform description copy. They never participate in
archetype selection and never appear in an archetype name. Excluding them keeps a
name a function of two variables rather than four, which is what allows one slug
per name.

## Scoring

Scoring runs in five steps over a complete answer set. As today, an incomplete or
invalid answer set scores `null`.

**1. Trait scores.** Each of the 27 trait questions offers four options, each
option belonging to a different trait. The chosen option increments its trait.
Every trait appears in exactly 12 questions — 27 × 4 = 108 = 9 × 12 — so no trait
can win by being asked about more often. Trait scores therefore range 0–12.

**2. Role strength.** A role's strength is the **mean** of its member traits, not
the sum. Scorer's third trait would otherwise inflate it by construction and make
Scorer the modal result regardless of answers. The strongest role is displayed as
the result's headline band.

**3. Primary and secondary.** The highest and second-highest traits, ranked across
all nine irrespective of role. Primary names the archetype; secondary shades it.
Cross-role pairs are the point of the model: a Shooting primary with a Grit
secondary is a different player from one with a Vision secondary, and the previous
structure could express neither.

Ranking ties are broken deterministically — first by the strength of the trait's
role, then by a fixed canonical trait order — so identical answers always yield an
identical result.

**4. Proficiency.** Every trait score is also mapped to a proficiency level — a
plain statement of how good this player is at that skill. Levels are fixed bands
over the theoretical 0–12 range, identical for all nine traits:

| Score | Proficiency |
|---|---|
| 0–5 | Average |
| 6–7 | Above Average |
| 8–9 | Strong |
| 10–11 | Excellent |
| 12 | Elite |

Proficiency is absolute, not relative. It answers "can this player shoot?" rather
than "is shooting the best thing this player does?", which the primary/secondary
ranking already answers. The two are independent and both are shown: a player
whose every trait lands in Average still has a primary, and a player with three
Excellent traits still has only one.

**5. Tier.** The (primary, secondary) pair resolves through three tiers:

| Tier | Condition | Source of identity |
|---|---|---|
| **Pure** | primary is Elite or Excellent | One of nine authored single-trait profiles |
| **Authored** | pair appears in the curated table | A fully hand-written profile |
| **Composed** | otherwise | `modifier[secondary] + base[primary]` |

Nine base names and nine modifier words cover all 72 ordered pairs, so no
combination is ever without a result. Roughly 30 pairs are authored; the balance
compose.

The pure tier keys off proficiency rather than off the gap between primary and
secondary. A gap test conflates two different things: a specialist scoring 12/10
is genuinely elite at one skill and fails a gap test, while a weak generalist
scoring 6/2 passes one. The question the pure tier is asking is whether this
player is outstanding at their best skill, and the proficiency band answers it
directly. This replaces the provisional `PURE_GAP` constant, which is removed.

## Identity and Presentation

Each result page renders, top to bottom:

1. **Role band** — Creator, Scorer, Defender, or Connector.
2. **Archetype name** — "The Sniper", "The Blue-Collar Sniper", "The Wall".
3. **Tagline** — three descriptors.
4. **Description and exactly three strengths.**
5. **Trait scorecard** — all nine traits as ranked bars, each labelled with its
   proficiency level.
6. **Tempo and Temper** — one line each.

The scorecard is what repairs the forced-dichotomy defect. A player whose profile
is genuinely balanced sees its shape rather than a coin flip reported as a
verdict, and the axis information that majority voting used to discard is now
visible in full. Proficiency labels make the bars readable without a reference
point: a bar is long or short relative to its neighbours, but "Excellent" states
what the length means on its own.

### Profile fields

| Field | Applies to | Purpose |
|---|---|---|
| `name` | all tiers | The archetype. Pure and authored are written; composed is assembled. |
| `slug` | all tiers | URL key, unique across all 72 |
| `tagline` | all tiers | Three descriptors: hand-written for pure and authored, drawn from the two traits' descriptor pools for composed |
| `role` | all tiers | One-line functional summary |
| `description` | all tiers | Two to three sentences on how this player wins; assembled from trait copy for composed |
| `strengths` | all tiers | Exactly three short phrases; one per trait plus one from the role for composed |

Every tier fills every field, so the result page never renders an empty slot. Composed copy is
the weakest writing in the system by construction and cannot be made otherwise;
two mitigations apply. The ~30 authored pairs are chosen to cover the
combinations players are most likely to reach, and the nine modifier words are
treated as real writing, since each must read well in front of eight different
base names.

### URLs

`?type=<slug>`. Pure yields `sniper`; authored yields its own hand-picked slug;
composed derives from the composed name, e.g. `blue-collar-sniper`. On load a slug
resolves to an archetype through a lookup over the generated table. An
unrecognized slug falls through to the landing screen, the existing behavior.

Existing `?type=chessmaster` links break. This is accepted rather than mitigated,
on the same reasoning the previous redesign applied to five-letter codes: the old
model has no honest translation into a nine-trait one, and silently remapping
someone's result is worse than returning them to the start.

## Question Authoring

**37 questions: 27 trait questions and 10 modifier questions** (five each for
Tempo and Temper, an odd count so a modifier cannot tie). This is shorter than
today's 45 while measuring nine dimensions instead of five.

Each trait question presents one concrete game situation and four responses, each
mapping to a different trait:

> You catch the ball at the elbow with a live dribble.
> — Rise into the shot. *(Shooting)*
> — Attack the closeout. *(Slashing)*
> — Back your man down. *(Post)*
> — Hit the cutter. *(Vision)*

Authoring constraints:

- Every trait appears in exactly 12 of the 27 questions.
- The four options in a question map to four distinct traits.
- Trait pairs should co-occur roughly evenly across questions. Perfect balance is
  impossible — 27 questions cover 162 trait pairings against 36 distinct pairs —
  so the target is approximate, and no pair may be absent entirely.
- No option may read as the wrong answer. Each describes a legitimate way to help
  a team.
- Questions rotate through five frames, each used across the set: live situation,
  preference, adversity, outside view, and cost. The cost frame — what you are
  willing to give up — discriminates most sharply and is retained from the
  previous design.
- Question order interleaves traits and modifiers so that no two consecutive
  questions share most of their traits, keeping the repetition invisible.

Answer selection auto-advances after roughly 250ms, and "Previous question"
remains available, both unchanged from current behavior.

## Components

| File | Change |
|---|---|
| `src/traits.js` *(new)* | The nine traits, four roles, two modifiers, the canonical trait order used for tie-breaks, and the proficiency bands. |
| `src/archetypes.js` *(new)* | Nine pure profiles, ~30 authored pairs, nine base names, nine modifier words, and `buildArchetype(primary, secondary)` resolving all 72 pairs through the three tiers. |
| `src/questions.js` | Rewritten: 27 four-option trait questions and 10 binary modifier questions. |
| `src/quiz.js` | `scoreAnswers` returns a profile object — trait scores, per-trait proficiency, role strengths, role, primary, secondary, tier, archetype, tempo, temper — instead of a letter code. The axis table is replaced by the trait and role model. |
| `src/app.js` | Four-option question rendering; role band, archetype, nine-bar scorecard with proficiency labels, and modifier lines on the result; slug routing over the archetype table; question counts. |
| `src/styles.css` | Four-option layout and the nine-bar scorecard with proficiency labels. |
| `tests/quiz.test.js` | Rewritten, see Testing. |
| `tests/app.test.js` | Updated for slug routing and result composition. |
| `PRODUCT.md`, `README.md` | 45 → 37 questions, five axes → nine traits and four roles, 32 results → 72 archetypes, timing revised. |

## Testing

1. There are 27 trait questions, each with exactly four options mapping to four
   distinct traits.
2. Every trait appears in exactly 12 trait questions.
3. Every trait pair co-occurs at least once.
4. There are 10 modifier questions, five per modifier, each with two options
   carrying that modifier's two poles.
5. An incomplete or invalid answer set scores `null`.
6. Role strength is a mean, not a sum: an answer set giving Scorer's three traits
   a lower average than Defender's two resolves to Defender. This is a direct
   regression test for the asymmetry the mean exists to neutralize.
7. All 72 ordered pairs resolve to a profile with a non-empty name, and all 72
   slugs are unique.
8. Proficiency bands are correct at their boundaries: 5 is Average and 6 is Above
   Average, 7/8 and 9/10 divide likewise, and only 12 is Elite.
9. Every trait can reach 12. For each of the nine traits there exists a
   constructible answer set scoring it 12, proving no trait is structurally
   capped below the top proficiency band by the question set.
10. Tier selection is correct at its boundaries: a primary of 10 resolves pure and
   a primary of 9 does not; a curated pair below that resolves authored; an
   uncurated pair below it resolves composed.
11. Ranking ties resolve deterministically — the same answers always produce the
   same archetype.
12. Every slug round-trips: resolving a profile's slug returns that profile.
13. Every authored and pure profile has a tagline, a description, and exactly
    three strengths.

## Open Items

- Proficiency bands assume the nine traits are equally *attractive* to answer,
  not merely equally *frequent*. Count balance is enforced (12 questions each),
  but if one trait's options consistently read as the more appealing choice, its
  scores will skew high and its bands will mean something different from every
  other trait's. Authoring must therefore extend the existing "no option may read
  as the wrong answer" constraint with "no option may read as the dull one", and
  a trait that no plausible answer set pushes into Excellent is evidence of a
  lopsided question set to be fixed in `questions.js`, not of a mis-set band.
- The ~30 authored pairs are not yet chosen. Selection should follow the
  combinations most likely to be reached, which is only knowable once the
  questions exist.
