# Court Type (nba-mbti): project memory

Read this first. It sums up the repo so a new conversation or agent can start without re-reading the whole project. Update it when a feature lands, a decision changes, or something breaks in a new way.

Last updated: 2026-10-18 (branch `production-readiness`, 11 commits ahead of `main`, pushed).

## What it is

Court Type is a basketball playing-style quiz. The user answers 46 Likert items and gets one of **45 archetypes**. Everything runs in the browser: no backend, no accounts, and answers are never collected. The app is plain HTML/CSS/ES modules with **zero dependencies**. Node is used only for tests and the build; Python is used only for the dev server.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | `scripts/dev.py`, a no-cache server at http://localhost:5173 |
| `npm test` | `node --test` (54 tests, all passing as of the date above) |
| `npm run check` | `node --check` on every source and build file |
| `SITE_URL=https://x npm run build` | Static site in `dist/`, plus one page per archetype at `dist/t/<slug>/`. The build fails if `SITE_URL` is missing. |

CI (`.github/workflows/ci.yml`, Node 22) runs test, check, and build on every push and PR, then uploads `dist/` as an artifact.

## Map

- `src/traits.js`: ROLES (4), TRAITS (9; **array order is the canonical tie-break order**), MODIFIERS (Tempo, Temper), SCALE, and PROFICIENCY_BANDS.
- `src/questions.js`: the 46 items. 36 trait items (4 per trait) and 10 modifier items (5 per modifier), each rated 1–5.
- `src/quiz.js`: `scoreAnswers(answers)`, a pure function that returns `null` unless all 46 answers are valid. It computes trait sums, the player's mean, proficiency bands (based on deviation from the player's own mean), role means, a ranked trait list, the archetype, `lean`, and the modifier poles.
- `src/archetypes.js`: 9 PURE and 36 BLENDS, plus `buildArchetype(primary, secondary, deviation)`. A result is pure when the primary trait's deviation is ≥ `PURE_DEVIATION_THRESHOLD = 7`. Blend pairs are **unordered**: the pair is sorted into TRAITS order before lookup.
- `src/app.js`: the UI. It renders strings into `#app`, handles routing, history, sessionStorage resume, and sharing.
- `src/styles.css`: the design tokens and all styles.
- `scripts/build.js`: copies `src/` and `public/`, replaces `%SITE_URL%`, and writes per-slug pages. It does this by swapping the `<!-- meta:start -->…<!-- meta:end -->` block in `index.html` and rewriting `./` paths to `../../`.
- `tests/app.test.js`: drives `app.js` through a **hand-rolled DOM/window/history/sessionStorage harness** (`mount(path, { sessionStorage })`). There are no test dependencies; extend the harness only as much as a test needs.
- `docs/superpowers/specs/` and `plans/`: approved design docs, which are tracked. `docs/FIXES.md` is the 2026-09-15 audit.
- `DESIGN.md` covers the visual system. `PRODUCT.md` covers product intent.

## Key behaviors and invariants

- **Share URLs** are canonical: `t/<slug>/`. Legacy `?type=<slug>` links redirect to them. An unknown slug falls through to the landing page. Slug lookup uses `Object.hasOwn`, so values like `?type=constructor` are safe.
- **There are two result modes.** A fresh result has `state.profile` set and shows the scorecard. A shared link shows neutral archetype copy ("ONE OF 45 COURT TYPES") with a path into the quiz. Never present a shared link as the visitor's own result.
- **The role shown is always `archetype.role`**, the authored phrase. `profile.role`, the highest role mean, must not be used as the archetype's label. That mismatch was the P0 bug, described below.
- **History.** Forward moves `pushState`, finishing pushes the `t/<slug>/` URL, and one `popstate` listener owns going back. Back from question 1 goes to the landing page and stays on the site.
- **Resume.** The run is saved to `sessionStorage['court-type:run']` on every change. It is cleared on finish and on start. `loadRun` validates everything: item ids, integer ratings from 1 to 5, the index range, and that the run is incomplete. All storage access sits in try/catch. The landing page offers an explicit "Pick up where you left off" option; a run is never resumed silently.
- **Asset URLs** are resolved from `import.meta.url` (`asset()` and `siteRoot` in `app.js`), not from the page. This keeps them working at any depth, such as `/t/<slug>/`.
- `TYPE_COUNT` is derived from `ARCHETYPES` and never hard-coded.
- **The answer scale** is `role="radiogroup"` with radios, roving tabindex, and arrow/Home/End keys.

## Critical changes (chronological)

1. Initial build used forced-choice questions → **five-axis redesign** → **trait/archetype model**.
2. **Likert instrument** (PRs #1 and #2): 46 Likert items, 9 independent traits scored against the player's own mean, and the NBA Era design system (near-black, coral, Archivo/Barlow/IBM Plex Mono).
3. **Collapse to unordered pairs** (`fcbfdfd`, PR #3). A+B and B+A had been separate types that differed only in name, so the count went from **81 to 45**. `compose()` and the composed tier were removed; tier is now `'pure' | 'blend'`. `profile.lean` (the primary's share of the top two traits) replaced ordering as the signal for lopsided vs. balanced. 10 old slugs now fall through to the landing page.
4. **Production readiness P0** (current branch, plan at `docs/superpowers/plans/2026-10-15-production-readiness-p0.md`): module-relative assets, `t/<slug>/` URLs, real history, session resume, a prerender build with og/twitter metadata, and CI. Tasks 1–6 are done, even though the checkboxes in the plan file were never ticked. **Task 7 (deploy) is blocked on choosing a host and domain.**

## Past failures and lessons

- **Role contradiction (P0 in FIXES.md).** The archetype name came from the top trait, but the role label came from the top role mean. The screen could show "The Slasher" with "Defender" under it. The fix was a single authority for role, `archetype.role`. Don't keep two sources of truth for the same label.
- **Pure gate was too loose.** Gating pure results on the Elite/Excellent bands fired for about 97% of simulated respondents. It was replaced with a raw deviation threshold of 7, which fires for roughly 10–20% of respondents. The proficiency bands are still marked *provisional* and still need calibration against real data.
- **Slug collision.** Two entries named "The Pickpocket" collided in the slug-keyed table, which silently dropped one. Tests now assert slug uniqueness. Keep that test.
- **Stale browser cache in dev.** Plain `python3 -m http.server` let Chrome serve old code, and `?v=N` cache-busting didn't help. `scripts/dev.py` sends `Cache-Control: no-store` and drops ETag and Last-Modified. Keep that property if the dev server is ever replaced.
- **Relative asset paths broke under `/t/<slug>/`.** The fix was `import.meta.url` resolution. Build-time paths are also rewritten, and `dev.py` strips the `/t/<slug>` prefix so local routing matches production.
- **Mobile layout deleted content** (`display:none` and `font-size:0` on labels). The fix was to re-lay out instead: the scale stacks vertically at ≤520px.

## What works well (keep doing it)

- A pure, deterministic scoring core with thorough tests (tie-breaks, band boundaries, modifier midpoints, slug uniqueness). UI work shouldn't need to touch scoring.
- Zero dependencies and static output. The spec rejected edge functions, per-question URLs, and silent resume, and its "Rejected Alternatives" section explains why.
- The brainstorm → spec → plan → implementation workflow, with specs and plans committed under `docs/superpowers/`.
- Small, focused conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `ci:`) that explain the reason in the body.
- `docs/FIXES.md` has a "Verified as *not* problems" section (contrast, reduced motion, overflow, `?type` safety). Don't re-audit those items.

## Known open items and stale spots

- Deploy (plan Task 7): no host or domain yet. Real unfurl checks still need to be done in Slack or iMessage.
- `og:image` is the same hero image for every type. Per-type images are P2.
- The proficiency band thresholds have not been calibrated.
- Remaining P2 items from FIXES.md (touch targets under 44px, WebP/AVIF hero) should be rechecked against current CSS before acting on them.

## Repo conventions

- Generated skill and tool artifacts stay on disk but are gitignored: `.claude/`, `.impeccable/`, `.superpowers/`, `graphify-out/`, `.worktrees/`, `dist/`. Gitignore any new tool output. `docs/superpowers/{specs,plans}` is the exception and stays tracked.
- Ask before outward-facing git actions: opening or merging PRs, pushing to `main`, deploying.
- Follow the Karpathy guidelines in the global CLAUDE.md: make surgical changes and keep things simple.
