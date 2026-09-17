# Court Type — outstanding fixes

Source: `/impeccable audit`, 2026-09-15, against commit `eaacd2f`.

Two things worth stating up front:

- **`impeccable detect` found nothing.** The mechanical design detector returns `[]` for `index.html`, `src/styles.css`, and `src/app.js`. Everything below came from reading the code and from driving the app in Chrome, not from the detector. Re-running the detector will not reproduce this list.
- **The scoring core is sound.** All 30 tests pass, covering trait independence, deterministic tie-breaking, modifier midpoints, proficiency band boundaries, and slug uniqueness. None of the fixes below require changing how traits are scored.

Ordered by severity. P0 blocks release; P1 should be fixed before release; P2 is the next pass.

---

## P0 — The result screen labels the archetype with a contradicting role

**Files:** `src/app.js:83` (`roleLabel`), consumed at `src/app.js:92`

**What happens.** The archetype name comes from the top-ranked *trait* (`ranked[0]` in `scoreAnswers`). The role printed beneath it comes from `profile.role`, which is the highest *role mean*. These are two independent computations and they disagree in ordinary cases.

**Reproduced live.** Answering the 46 items with ratings cycling 1→5 in order produces:

```
primary:   "slashing"          → archetype "The Slasher"
archetype.role:                  "Rim-attacking scorer"
profile.role: "defender"       → rendered label "Defender"
roles: { creator: 9, scorer: 10.33, defender: 10.5, connector: 10 }
```

The page renders **"The Slasher"** with **"Defender"** beneath it, under a left-rail caption reading `YOUR ROLE ON THE FLOOR`. Defender wins by 0.17 of a point on a mean that Slashing is not even part of.

**Why it matters.** This is the one screen the product exists to deliver, and the headline contradicts itself to anyone who knows what a slasher is.

**Fix.** Pick one authority and make the other follow it. The narrow fix:

```js
const roleLabel = profile
  ? ROLES.find((r) => r.id === TRAITS.find((t) => t.id === profile.primary).role).label
  : archetype.role;
```

But see P1.1 — the better fix subsumes this one. Whatever is chosen, `profile.role` and `profile.primary` should not be free to disagree silently; if the role mean stays in the profile, it belongs in the scorecard as its own labelled reading, not as the archetype's role.

---

## P1.1 — The same type reports two different roles depending on how it is opened

**File:** `src/app.js:83`

Freshly scored, the result renders `ROLES[profile.role].label` → `"Defender"`.
Opened at `?type=slasher`, the same result renders `archetype.role` → `"Rim-attacking scorer"`.

A user who copies their link and reopens it is shown a different answer than the one they just received. `archetype.role` is authored for all 81 entries and is currently **never seen by the person who actually took the quiz** — only by people they share with.

**Fix.** Render `archetype.role` on both paths. This also resolves P0.

---

## P1.2 — "One of seventy-two court types" undercounts by nine

**Files:** `src/app.js:91`, `README.md:3`, `README.md:13`, `PRODUCT.md:27`

`ARCHETYPES` contains **81** reachable entries:

| Tier | Count |
|---|---|
| pure | 9 |
| authored | 30 |
| composed | 42 |
| **total** | **81** |

72 counts the trait *pairs* only and drops the nine pure profiles — which are exactly what an Elite or Excellent primary produces, i.e. the strongest results in the system. The claim is printed as fact on the result screen.

**Fix.** Say 81, or "72 pairings plus 9 pure types". Update the result stamp and all three docs together.

**Do not change** the `28/72` and `36/64` figures in `DESIGN.md:33` — those are layout split ratios, unrelated to the archetype count.

---

## P1.3 — The answer scale is a toggle-button group, not a single-select control

**File:** `src/app.js:65`

The five scale points are `<button aria-pressed>` inside `role="group"`. A screen reader announces five independent toggle buttons: no "2 of 5" position, no indication the choices are mutually exclusive, and Tab must walk all five on every one of 46 questions.

Violates WCAG 4.1.2 (Name, Role, Value).

**Fix.** `role="radiogroup"` on `.scale`, `role="radio"` + `aria-checked` on each point, roving `tabindex` so the group is one tab stop, and Left/Right/Home/End key handling. Selection is already conveyed by both color and the filled ring, so the visual side needs no change.

---

## P1.4 — Navigating to Overview or Instincts mid-quiz destroys every answer

**File:** `src/app.js:124-141`

The header nav is present on every quiz screen. Clicking "Overview" or "Instincts" returns to the landing page. The only route back in is "Take The Quiz" (`action === 'start'`, line 129), which unconditionally resets `answers` and `index`.

Forty-five answers vanish on one misclick, with no warning and no confirmation, in an instrument that takes ten minutes.

**Fix.** Either keep the in-progress state and offer "Resume question 32" in place of an unconditional reset, or suppress the nav while `screen === 'quiz'`.

---

## P2.1 — Three of five scale labels disappear on common phones

**File:** `src/styles.css:117`

```css
@media(max-width:400px){ .scale-point:not(:first-child):not(:last-child) .scale-label{display:none} }
```

At ≤400px — iPhone SE at 375, most Android at 360 — "Rarely", "Sometimes" and "Often" are removed, leaving three unlabeled dots between "Never" and "Always". The landing page carries a legend of the five scale points; the quiz screen does not, so there is nothing to refer back to.

**Fix.** Abbreviate rather than remove, or stack the scale vertically below 400px.

---

## P2.2 — Header nav labels collapsed with `font-size:0`

**File:** `src/styles.css:116` — `.header-nav button{font-size:0;padding:4px}`

"Overview" and "Instincts" become bare circled numerals on every mobile screen, with no icon or tooltip. The accessible name survives in the DOM; the visible affordance does not.

---

## P2.3 — Touch targets below 44px

| Element | Measured | Target |
|---|---|---|
| `.header-nav button` | 28px | 44px |
| `.nav-number` | 26px | 44px |
| `.text-button` (mobile) | ~37px | 44px |

WCAG 2.5.8. `.scale-point` at 96px is fine.

---

## P2.4 — Font CSS is `@import`-ed from inside the stylesheet

**Files:** `src/styles.css:1`, `index.html:9-10`

The Google Fonts `@import` sits at the top of `styles.css`, which serializes the critical path: HTML → `styles.css` → fonts CSS → font files. The two `preconnect` hints already in `index.html` suggest a `<link rel="stylesheet">` was meant to live there, which would save a full round trip before the display face paints.

---

## P2.5 — 322 KB hero JPEG is the LCP element, unpreloaded and unprioritized

**Files:** `public/images/hero-basketball.jpg`, `src/app.js:33`

Add `fetchpriority="high"` and a `<link rel="preload">`, and ship a WebP/AVIF alternate. No CLS risk — the image is absolutely positioned with explicit dimensions from CSS.

---

## P2.6 — No `<noscript>` fallback

**File:** `index.html:16`

`<main id="app">` is empty until `app.js` runs. A module failure, a blocked CDN, or disabled JS yields a blank near-black page with no explanation.

---

## P3 — Progress bar reads 1/46 before the first answer

**File:** `src/app.js:65` — `value="${state.index + 1}"` measures the question displayed, not work completed. The meter is never empty and reaches full on the last question rather than on submission.

---

## Systemic patterns

1. **Two sources of truth for "role."** `profile.role` (role mean) and `archetype.role` (authored phrase) both exist, are each correct in isolation, and get selected by *screen* rather than by rule. This single ambiguity produces P0 and P1.1. Fixing it structurally is worth more than patching either symptom.

2. **Mobile compresses by deleting content.** P2.1 and P2.2 both resolve tight space with `display:none` / `font-size:0` rather than by re-laying out. Both are recoverable with a stacked or abbreviated layout at no cost to the design.

---

## Verified as *not* problems

Recorded so they don't get re-litigated:

- **Contrast passes WCAG AA everywhere**, including the tightest pair in the system — `#7c7c7c` on `#1a1a1a` at 4.74:1. Coral on near-black is 6.98:1, as is ink on coral.
- **`prefers-reduced-motion` is handled correctly** and also disables `scroll-behavior:smooth`. Nothing depends on motion to convey state.
- **`?type=` lookup is safe.** `Object.hasOwn` means `?type=constructor` cannot reach a prototype member.
- **No console errors** across a full 46-question run.
- **No horizontal overflow** at any tested viewport.
- **Zero detector findings.** The design system is coherent and product-specific.
