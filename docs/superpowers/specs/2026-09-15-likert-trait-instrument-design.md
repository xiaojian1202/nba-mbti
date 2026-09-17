# Likert Trait Instrument — Design

Date: 2026-09-15
Status: Approved design, ready for implementation planning
Supersedes `2026-09-12-trait-archetype-model-design.md`, which in turn superseded
`2026-09-12-five-axis-redesign-design.md`. This document is self-contained; the
superseded specs should not be consulted during implementation.

## Problem

The shipped quiz scores five binary axes — Tempo, Creation, Defense, Temperament,
Role — nine questions each, and maps the five-letter code onto one of thirty-two
profiles. The superseded trait-archetype design correctly diagnosed two defects in
it: the axes measure style and never skill, and every axis is forced into a
dichotomy, so a 5–4 split is reported with the same confidence as 9–0.

That design replaced the axes with nine traits, but kept a forced-choice
instrument: 27 questions, each offering four options belonging to four different
traits, pick one. That instrument reintroduces the defect it was meant to cure, in
a subtler form.

**Forced choice makes the trait scores ipsative.** Picking one option per question
across 27 questions means the nine trait scores always sum to exactly 27. Raising
one trait mechanically lowers another. No player can be good at everything or bad
at everything, and the answer space is a fixed-sum simplex rather than nine free
dimensions.

**Ipsative scores cannot support absolute claims.** The superseded design bands
trait scores into proficiency levels and states that "Proficiency is absolute, not
relative... It answers 'can this player shoot?'". The instrument does not support
that. Under a fixed sum the mean trait score is 3 of a possible 12, `Elite` (12)
requires choosing that trait on every one of its twelve appearances, and `Average`
(0–5) swallows the large majority of scores. The label claims an absolute reading
of a number that only ever carried a relative one.

**Ipsative scoring caps identity uniqueness.** This is the defect that motivates
the rewrite. Because the total is fixed, a player who is genuinely strong at both
Shooting and Grit cannot be scored as such; the instrument must trade one against
the other and report a ranking that discards the rest. Two players with different
overall levels but the same shape are scored identically. The model promises
seventy-two archetypes but feeds them from an answer space that flattens exactly
the distinctions the archetypes exist to express.

## Solution Overview

Replace the forced-choice instrument with an independently-scored Likert
instrument, and make proficiency explicitly within-person.

Forty-six items, each a concrete basketball situation plus one specific action,
answered on a single five-point frequency scale from Never to Always. Thirty-six
items cover the nine traits, four each; ten cover the two modifiers. Each item
taps exactly one trait, so trait scores are independent: rating Grit highly costs
Shooting nothing.

Proficiency bands are assigned on a trait's deviation from that player's own mean
across the nine traits, which keeps every result readable whether the player
answers high or low throughout, and removes the absolute claim the instrument
cannot support.

The trait and archetype model is otherwise carried forward unchanged: nine traits
in four roles, identity as the ordered pair of the two strongest traits, resolved
through pure, authored, and composed tiers across all seventy-two ordered pairs.

The app remains dependency-free browser JavaScript.

## Rejected Alternatives

**Bare self-statement Likert items** ("I'd rather make the extra pass than take a
good shot") are the most literal reading of a standard personality instrument and
the cheapest to author. Rejected: they abandon the product principle that game
situations stay concrete and familiar, and ability-framed self-description invites
uniform self-flattery in a way that behaviour-framed frequency does not.

**Rating all four options of the existing situations** on a 1–5 scale would be
normative while preserving the authored four-option questions. Rejected: four
interactions per screen, against one today, for a set that must stay inside a
single sitting.

**Keeping forced choice and adding intensity** — strongly A / slightly A / slightly
B / strongly B — gives graded scores while preserving A/B items. Rejected: the sum
of any opposed pair is still fixed, so it is ipsative within each pairing and
solves the uniqueness problem only across pairings that happen to be authored.

**Absolute bands plus reverse-keyed items** would preserve a genuine "can this
player shoot?" reading and catch the straight-line responder. Rejected in favour of
within-person banding: reverse-keyed items are the hardest kind to write in this
voice and the ones players most often misread, and they do not address the sincere
high-rater at all. The cost of the choice is accepted and disclosed — see
Presentation.

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

Roles are functions, not positions. Nothing in the model knows or asserts a
player's size, and a defence-first player receives a defence-first identity rather
than an offensive archetype with a footnote. Roles are derived from traits, never
measured directly. Scorer carries three traits and every other role carries two;
the role-strength rule below neutralizes the asymmetry.

### Modifiers

- **Tempo** — Fast / Half-court. When you want the shot up.
- **Temper** — Expressive / Calm. Your register under pressure.

Modifiers are displayed and inform description copy. They never participate in
archetype selection and never appear in an archetype name. Excluding them keeps a
name a function of two variables rather than four, which is what allows one slug
per name.

## The Instrument

**Forty-six items, all answered on one five-point frequency scale:**

> Never · Rarely · Sometimes · Often · Always

scored 1 through 5 respectively.

- **36 trait items** — four per trait across the nine traits.
- **10 modifier items** — five Tempo, five Temper.

Every item is a concrete stem plus one specific action, and taps exactly one
trait or one modifier:

> *A defender closes out hard and you have a live dribble at the elbow.*
> **You rise into the shot anyway.**    *(Shooting)*

> *The ball is loose at your feet with bodies around it.*
> **You're on the floor after it.**    *(Grit)*

No item compares two traits. Discrimination comes from scoring across items, never
from a choice inside one.

Raw trait score: **4–20**. Raw modifier score: **5–25**.

### Authoring constraints

- **Every item must survive a sincere `Never`.** If answering Never to an item
  would read as admitting to being a bad player, the item measures nothing and
  everyone will inflate it. "You back them down rather than face up" is a
  legitimate Never for a guard and is a good item; "You compete hard on defense"
  is not an item.
- **The four items for a trait must cover distinct facets**, not paraphrase one
  another. Four catch-and-shoot items produce a narrower Shooting score than one
  catch-and-shoot, one off-screen, one deep-range, and one shot-diet item.
- **No action may read as the wrong answer.** Each describes a legitimate way to
  help a team.
- **Items rotate through five frames**, each used across the set: live situation,
  preference, adversity, outside view, and cost. The cost frame — what you are
  willing to give up — discriminates most sharply and is retained from the earlier
  designs.
- **Order interleaves traits** so that no two consecutive items share a trait,
  keeping the repetition invisible.
- **No reverse-keyed items.** Acquiescence is handled in scoring.

The option-balance constraints of the superseded design — every trait appearing in
exactly twelve questions, the four options of a question mapping to four distinct
traits, trait pairs co-occurring evenly — are deleted. They existed to neutralize
the fixed sum, which no longer exists.

Answer selection auto-advances after roughly 250ms, and "Previous question"
remains available, both unchanged from current behaviour. One tap advances one
screen, so the interaction stays as fast per screen as today despite the longer
stem.

## Scoring

Scoring runs in six steps over a complete answer set. An incomplete or invalid
answer set scores `null`, as today.

**1. Trait scores.** Sum the four items for each trait. Range 4–20, independent
across traits. Two players can both be high on Shooting and on Grit, which is the
property the rewrite exists to gain.

**2. Person mean.** `M` is the mean of the nine trait scores.

**3. Proficiency.** Each trait's band is a function of its deviation
`d = score − M`:

| `d` | Band |
|---|---|
| `d ≥ +4.0` | Elite |
| `+2.0 ≤ d < +4.0` | Excellent |
| `+0.5 ≤ d < +2.0` | Strong |
| `−2.0 ≤ d < +0.5` | Solid |
| `d < −2.0` | Developing |

Every player gets a readable spread regardless of how high or low they answer
overall, and a uniformly high responder and a uniformly low responder with the
same shape receive the same bands.

These thresholds are provisional. They are first-pass values chosen without an
answer distribution to calibrate against, and they are to be implemented as named
constants in `src/traits.js` so they can be adjusted once real answer sets exist.

**4. Role strength.** A role's strength is the **mean** of its member traits, not
the sum. Scorer's third trait would otherwise inflate it by construction and make
Scorer the modal result regardless of answers. The strongest role is displayed as
the result's headline band.

**5. Primary and secondary.** The highest and second-highest traits, ranked across
all nine irrespective of role. Primary names the archetype; secondary shades it.
Cross-role pairs are the point of the model: a Shooting primary with a Grit
secondary is a different player from one with a Vision secondary.

Ranking ties are broken deterministically — first by the strength of the trait's
role, then by a fixed canonical trait order — so identical answers always yield an
identical result.

**6. Tier.** The (primary, secondary) pair resolves through three tiers:

| Tier | Condition | Source of identity |
|---|---|---|
| **Pure** | primary is Elite or Excellent | One of nine authored single-trait profiles |
| **Authored** | pair appears in the curated table | A fully hand-written profile |
| **Composed** | otherwise | `modifier[secondary] + base[primary]` |

Nine base names and nine modifier words cover all seventy-two ordered pairs, so no
combination is ever without a result. Roughly thirty pairs are authored; the
balance compose.

Under within-person banding the pure tier reads correctly: a primary of Elite or
Excellent now means this skill stands well above the rest of the player's game,
which is exactly the condition under which a single-trait archetype is the honest
answer. Under the superseded absolute bands it fired for anyone who answered high
across the board.

**Modifiers.** Sum the five items, range 5–25, midpoint 15. Above 15 resolves to
the first pole, below 15 to the second. Exactly 15 is reachable — the odd-count
trick of the superseded design does not apply to a sum — so each modifier declares
a default pole for the tie: **Tempo defaults to Half-court, Temper to Calm.** The
default is a deterministic rule, not a judgement about the player.

## Presentation

Each result page renders, top to bottom:

1. **Role band** — Creator, Scorer, Defender, or Connector.
2. **Archetype name** — "The Sniper", "The Blue-Collar Sniper", "The Wall".
3. **Tagline** — three descriptors.
4. **Description and exactly three strengths.**
5. **Trait scorecard** — all nine traits as ranked bars, each labelled with its
   proficiency band.
6. **Tempo and Temper** — one line each.

The scorecard is what repairs the forced-dichotomy defect: a genuinely balanced
player sees the shape of their game rather than a coin flip reported as a verdict.

**The scorecard must state that bands are within-person.** A line such as
*"Measured against the rest of your game"* sits with the scorecard. This is not
optional polish. The bands answer "what is this player best at", not "can this
player shoot", and a page that implies the second while computing the first is
making a claim the instrument does not support.

### Profile fields

| Field | Applies to | Purpose |
|---|---|---|
| `name` | all tiers | The archetype. Pure and authored are written; composed is assembled. |
| `slug` | all tiers | URL key, unique across all 72 |
| `tagline` | all tiers | Three descriptors: hand-written for pure and authored, drawn from the two traits' descriptor pools for composed |
| `role` | all tiers | One-line functional summary |
| `description` | all tiers | Two to three sentences on how this player wins; assembled from trait copy for composed |
| `strengths` | all tiers | Exactly three short phrases; one per trait plus one from the role for composed |

Every tier fills every field, so the result page never renders an empty slot.
Composed copy is the weakest writing in the system by construction and cannot be
made otherwise; two mitigations apply. The roughly thirty authored pairs are chosen
to cover the combinations players are most likely to reach, and the nine modifier
words are treated as real writing, since each must read well in front of eight
different base names.

### URLs

`?type=<slug>`. Pure yields `sniper`; authored yields its own hand-picked slug;
composed derives from the composed name, e.g. `blue-collar-sniper`. On load a slug
resolves to an archetype through a lookup over the generated table. An unrecognized
slug falls through to the landing screen, the existing behaviour.

Existing `?type=chessmaster` links break. This is accepted rather than mitigated:
the old model has no honest translation into a nine-trait one, and silently
remapping someone's result is worse than returning them to the start.

## Components

| File | Change |
|---|---|
| `src/traits.js` *(new)* | The nine traits, four roles, two modifiers with their default poles, the canonical trait order used for tie-breaks, and the proficiency deviation thresholds as named constants. |
| `src/archetypes.js` *(new)* | Nine pure profiles, ~30 authored pairs, nine base names, nine modifier words, and `buildArchetype(primary, secondary)` resolving all 72 pairs through the three tiers. |
| `src/questions.js` | Rewritten: 46 Likert items — 36 trait, 10 modifier — each with a stem, an action, a keyed trait or modifier, and the shared five-point scale. |
| `src/quiz.js` | `scoreAnswers` returns a profile object — trait scores, person mean, per-trait proficiency, role strengths, role, primary, secondary, tier, archetype, tempo, temper — instead of a letter code. The axis table is replaced by the trait and role model. |
| `src/app.js` | Five-point scale rendering; role band, archetype, nine-bar scorecard with proficiency labels and the within-person note, and modifier lines on the result; slug routing over the archetype table; question counts. |
| `src/styles.css` | Scale-row layout and the nine-bar scorecard with proficiency labels. |
| `tests/quiz.test.js` | Rewritten, see Testing. |
| `tests/app.test.js` | Updated for slug routing, scale interaction, and result composition. |
| `PRODUCT.md`, `README.md` | 45 questions → 46 items, five axes → nine traits and four roles, 32 results → 72 archetypes, about eight minutes → about ten. |

## Testing

1. There are 46 items: 36 trait items, four per trait across nine traits, each
   keyed to exactly one trait; and 10 modifier items, five per modifier.
2. Every item carries all five scale points, scored 1 through 5.
3. No two consecutive items share a trait.
4. An incomplete or invalid answer set scores `null`.
5. **Trait independence.** An answer set that maxes one trait's four items leaves
   every other trait's score identical to a baseline answer set. This is the direct
   regression test for the property the rewrite exists to gain, and it is the test
   that fails if a forced-choice structure is ever reintroduced.
6. Proficiency bands are correct at each deviation boundary, and a flat profile —
   all nine trait scores equal — bands every trait as Solid.
7. **Acquiescence.** An all-Always answer set and an all-Never answer set produce
   the same nine bands, the same primary, and the same secondary.
8. Modifier midpoint: a modifier sum of exactly 15 resolves to that modifier's
   declared default pole, deterministically.
9. Role strength is a mean, not a sum: an answer set giving Scorer's three traits a
   lower average than Defender's two resolves to Defender.
10. All 72 ordered pairs resolve to a profile with a non-empty name, and all 72
    slugs are unique.
11. Tier selection is correct at its boundaries: a primary whose deviation is just
    inside Excellent resolves pure, and one just outside does not; a curated pair
    below that resolves authored; an uncurated pair below it resolves composed.
12. Ranking ties resolve deterministically — the same answers always produce the
    same archetype.
13. Every slug round-trips: resolving a profile's slug returns that profile.
14. Every authored and pure profile has a tagline, a description, and exactly three
    strengths.

## Open Items

- **Band thresholds are uncalibrated.** The deviation cut points are first-pass
  values. Once the item set exists, they should be checked against plausible answer
  sets so that the bands are reachable and Elite is rare without being unreachable.
- **Facet coverage is the live authoring risk.** Within-person banding absorbs a
  trait whose items are uniformly appealing, which dissolves most of the superseded
  design's "equally attractive options" concern. What replaces it is narrowness: if
  a trait's four items paraphrase one facet, its score measures that facet rather
  than the trait, and no scoring rule can recover the difference.
- **The roughly thirty authored pairs are not yet chosen.** Selection should follow
  the combinations most likely to be reached, which is only knowable once the items
  exist.
- **Item count against the time budget.** Forty-six items at a longer read per
  screen is about ten minutes. If play-testing shows drop-off, the reduction to
  three items per trait — 37 screens — is the known lever, at the cost of rank
  stability in the primary/secondary pair that names the archetype.
