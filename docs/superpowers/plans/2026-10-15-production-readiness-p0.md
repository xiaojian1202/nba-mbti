# Production Readiness (P0) Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans (or subagent-driven-development) task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Close the launch-blocking gaps: shared links unfurl, `/t/<slug>/` is the canonical share URL, a reload does not lose the quiz, the back gesture walks the quiz, and CI builds a deployable `dist/`.

**Spec:** `docs/superpowers/specs/2026-09-14-production-readiness-design.md` (written for the 32-type model; its design is registry-driven and applies unchanged to the 45 archetypes, except for the deviations below).

**Decision recorded:** slugs renamed on `collapse-archetype-pairs` break no live links (nothing is deployed). Slugs are **frozen from launch**; any later rename needs an alias.

## Deviations from the spec (simplifications)

1. **No injected JSON payload.** The client resolves the archetype from `location.pathname` (`/t/<slug>/`), then legacy `?type=`. The payload duplicated what the path already says.
2. **Dev server mirrors production routes.** `scripts/dev.py` strips a leading `/t/<slug>` prefix, so `/t/sniper/` works locally with the same code path as `dist/`. No dev/prod URL split.
3. **No new `archetype` screen.** `result()` already branches on `state.profile` (neutral copy for shared links, tested at `tests/app.test.js:144`). Kept as is.

## Global Constraints

- No `dependencies` in `package.json`; `scripts/build.js` uses only `node:` built-ins.
- Paths stay relative so `dist/` works at a domain root or a subpath. JS-built asset URLs resolve from `import.meta.url`, not the page URL.
- All `sessionStorage` access is wrapped; failure means no persistence, never a broken quiz.
- `npm test` and `npm run check` pass at the end of every task.

## Patterns to Mirror

| Category | Source | Pattern |
|---|---|---|
| DOM tests | `tests/app.test.js:6` `mount()` | Hand-stubbed `window`/`document`; drive via `app.action()` / `app.rate()` |
| Slug safety | `src/app.js:9` | `Object.hasOwn(ARCHETYPES, slug)` |
| URL writes | `src/app.js` `updateTypeUrl` | One helper owns URL mutation |
| Registry | `src/archetypes.js:301` `ARCHETYPES` | Single source for page list and count |

## Files to Change

| File | Action | Why |
|---|---|---|
| `src/app.js` | UPDATE | Path routing, history, persistence, asset URLs |
| `index.html` | UPDATE | Meta marker region + default OG/Twitter tags |
| `scripts/build.js` | CREATE | Prerender `dist/` |
| `scripts/dev.py` | UPDATE | Serve `/t/<slug>/…` from the source tree |
| `tests/app.test.js` | UPDATE | Stubs for `pushState`, `popstate`, `sessionStorage`; new tests |
| `tests/build.test.js` | CREATE | Build output tests |
| `package.json` | UPDATE | `build` script; add build.js to `check` |
| `.gitignore` | UPDATE | `dist/` |
| `.github/workflows/ci.yml` | CREATE | test + check + build |
| `README.md` | UPDATE | Build/deploy section |

---

### Task 0: Branch hygiene (needs your OK — outward-facing)

- [ ] Open a PR for `collapse-archetype-pairs` → `main`, merge after review.
- [ ] Branch `production-readiness` from updated `main`.

### Task 1: Asset URLs independent of page depth

On `/t/<slug>/`, `./public/...` in rendered HTML resolves to `/t/<slug>/public/...` and 404s in production.

- [ ] Test: rendered landing HTML contains no `src="./public/` (assets come from an absolute URL built off the module).
- [ ] In `src/app.js` add `const asset = (name) => new URL(`../public/images/${name}`, import.meta.url).href;` and replace the four `./public/images/...` literals.
- [ ] **Validate:** `npm test && npm run check`.

### Task 2: Canonical `/t/<slug>/` URLs

- [ ] Tests (extend `mount(path)` to accept a full path):
  - `/t/<known>/` renders the neutral result; `/t/not-real/` and `/t/toString/` render landing.
  - `?type=<known>` renders the archetype **and** rewrites the URL to `t/<known>/` via `replaceState`.
  - Finishing the quiz leaves the URL at `…/t/<slug>/` (update the test at `tests/app.test.js:93`).
- [ ] In `src/app.js`:
  - `const siteRoot = new URL('../', import.meta.url);`
  - `resolveSlug()` → `location.pathname` match `/\/t\/([^/]+)\/?$/` relative to `siteRoot`, else `?type=`; gate with `Object.hasOwn`.
  - Replace `updateTypeUrl(slug)` with `typeUrl(slug)` returning `new URL(slug ? `t/${slug}/` : '', siteRoot)`; all writes go through it.
- [ ] `scripts/dev.py`: in `translate_path`, strip a leading `/t/<segment>` so `/t/x/` → `/` (index.html) and `/t/x/src/app.js` → `/src/app.js`.
- [ ] **Validate:** tests; `npm run dev`, open `http://localhost:5173/t/sniper/` and `/?type=sniper` — both show The Sniper, second ends on `/t/sniper/`.

### Task 3: History — forward pushes, `popstate` retreats

Rules:
- `start` / resume: `pushState({ screen: 'quiz', index }, '', siteRoot)`.
- `next` (not last): `pushState({ screen: 'quiz', index: index + 1 }, '', siteRoot)`.
- Finish: `replaceState({ screen: 'result' }, '', typeUrl(slug))` — replace, so back returns to the last question.
- `home`: `pushState({}, '', siteRoot)`.
- `back` button: `history.back()` only — no state mutation.
- `popstate`: if `event.state?.screen === 'quiz'` → quiz at `Math.min(event.state.index, answeredCount)` (clamp prevents landing on a question past unanswered ones, e.g. after a reload with an empty run); if `screen === 'result'` and `state.profile` → personal result; else resolve from the URL (archetype or landing).

- [ ] Harness: `window.history` gains `pushState` and a stack; `back()` pops and fires the captured `popstate` listener; `window.addEventListener` records listeners.
- [ ] Tests: popstate from Q n → n−1 with answers kept; from Q1 → landing; Previous-question button and popstate produce identical HTML; finishing replaces (stack length unchanged by the finish); back from result → last question.
- [ ] Implement in `src/app.js` click handler + one `popstate` listener calling `render(true)`.
- [ ] **Validate:** tests; manual in Chrome: answer 3, browser back twice, back again → landing, still on the site.

### Task 4: Session persistence with explicit resume

- [ ] Helpers in `src/app.js` (key `court-type:run`): `saveRun()`, `clearRun()`, `loadRun()` — each in `try/catch`. `loadRun` returns `null` unless: JSON parses to an object; every answer key is a known item id with an integer 1–5; `index` is an integer in `[0, items.length − 1]` and ≤ answered count; and the run is incomplete.
- [ ] Save on every rating and index change; clear on finish and on `start`.
- [ ] Landing: when `loadRun()` is non-null, render a secondary `data-action="resume"` control — "Pick up where you left off — question N of 46" — beside the primary start button. `resume` restores answers + index and pushes the quiz entry.
- [ ] Tests (harness gets a `sessionStorage` stub, plus a variant whose methods throw):
  - unfinished run → resume shown; first visit → absent; after finishing → absent.
  - resume restores answers and position.
  - corrupted JSON, unknown id, value 6, out-of-range index → discarded, landing renders as first visit.
  - throwing storage → landing renders, full quiz completes.
- [ ] **Validate:** tests; manual: answer 10, reload, resume lands on question 11 with answers intact.

### Task 5: Prerender build with share metadata

- [ ] `index.html`: wrap `<title>` + description in `<!-- meta:start -->` … `<!-- meta:end -->` and add default `og:title`, `og:description`, `og:type=website`, `og:url`, `og:image`, `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`. `og:url`/`og:image` use a `%SITE_URL%` token.
- [ ] `scripts/build.js` (exports `build({ siteUrl, outDir })`, CLI reads `SITE_URL` env and fails without it):
  1. Clean `outDir`; copy `index.html`, `src/`, `public/`.
  2. Fail loudly if the meta markers are missing.
  3. Write `dist/index.html` with `%SITE_URL%` replaced.
  4. For each entry in `ARCHETYPES`: replace the meta region with archetype title (`${name} — Court Type`), description (`tagline` + `role`), `og:url = ${SITE_URL}/t/${slug}/`, image = hero; rewrite `href="./`/`src="./` to `../../`; write `dist/t/<slug>/index.html`. HTML-escape all interpolated text.
- [ ] `tests/build.test.js` (build into a temp dir):
  - page count under `t/` equals `Object.keys(ARCHETYPES).length`;
  - each page's `og:title` contains that archetype's name and `og:url` ends with `/t/<slug>/`;
  - no `%SITE_URL%` survives anywhere;
  - archetype pages reference `../../src/app.js`;
  - missing marker → `build()` rejects.
- [ ] `package.json`: `"build": "node scripts/build.js"`; append `&& node --check scripts/build.js` to `check`. `.gitignore`: `dist/`.
- [ ] **Validate:** `SITE_URL=http://localhost:8080 npm run build && python3 -m http.server 8080 -d dist`; open `/t/sniper/` (renders, assets load, no console errors); `curl -s localhost:8080/t/sniper/ | grep og:title`.

### Task 6: CI

- [ ] `.github/workflows/ci.yml` on push + pull_request: `actions/checkout`, `actions/setup-node` (Node 22), `npm test`, `npm run check`, `SITE_URL=${{ vars.SITE_URL || 'https://example.invalid' }} npm run build`, upload `dist/` as an artifact.
- [ ] README: build + deploy section (`dist/` is static, no rewrites needed).
- [ ] **Validate:** workflow green on the PR.

### Task 7: Deploy (blocked on host + domain choice)

- [ ] Pick host/domain, set `SITE_URL`, add the deploy step to CI.
- [ ] Verify unfurl of `/t/<slug>/` in a real card validator (e.g. paste into Slack/iMessage).

## Validation (end state)

```bash
npm test && npm run check
SITE_URL=http://localhost:8080 npm run build && python3 -m http.server 8080 -d dist
```

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Relative paths break on `/t/<slug>/` | High without Task 1 | `import.meta.url` assets + build path rewrite + manual dist check |
| Stale history entries after reload hit an empty run | Medium | Index clamp to answered count on popstate |
| Test harness grows brittle (hand-rolled DOM) | Medium | Extend `mount()` minimally; no new test deps |
| `og:image` is the same hero for every type | Accepted | Per-type images are P2 |

## Acceptance

- [ ] All tasks 1–6 complete; Task 7 once host is chosen
- [ ] `npm test`, `npm run check`, `npm run build` pass locally and in CI
- [ ] Manual: unfurl, resume, back gesture verified in a browser
