# Production Readiness — Design

Date: 2026-09-14
Status: Approved design, ready for implementation planning

## Problem

The shipped app is a correct, dependency-free static quiz: five source files, a
pure scoring function, and a passing test suite. Nothing in it is architecturally
wrong. But seven gaps stand between it and a launch, and four of them are
serious enough to damage the product on its first day.

**Shared links do not unfurl.** The product's only distribution mechanism is a
link to a result. `index.html` carries one generic `<meta name="description">`
and no Open Graph or Twitter Card tags at all, so a link pasted into iMessage,
Slack, or Twitter renders as a bare URL. Crawlers do not execute JavaScript;
they read the bytes the server sends. Every archetype currently sends identical
bytes.

**A shared link claims to be the visitor's own result.** Loading
`?type=chessmaster` renders the full result screen, headed `YOUR SCOUTING
REPORT IS IN.`, with *Take it again* as its action. For everyone except the
person who answered the questions — which is to say, for most arrivals — this
is false, and it offers no path into the quiz.

**A reload discards an eight-minute quiz.** All answers live in a plain object
in `src/app.js`. A refresh, a backgrounded mobile tab, or an OS-reclaimed
webview loses forty-five answers with no recovery.

**The back gesture leaves the site.** The app calls `replaceState` only, so the
history stack holds a single entry. On mobile, where back is a swipe, a user
reaching for the previous question exits the quiz instead.

Three further gaps are smaller but real: the project has no deploy path or CI
(`npm run dev` is `python3 -m http.server`); the hero image is a 322 KB
unoptimised JPEG with no intrinsic dimensions, and it is the LCP element; and
fonts load through an `@import` at the top of `src/styles.css`, which cannot be
discovered until that stylesheet has been fetched and parsed, defeating the
`preconnect` hints already present in `<head>`.

## Solution Overview

Introduce a prerender build step that emits one static page per archetype, each
carrying its own crawler-visible metadata. Split the result experience in two: a
neutral, linkable page *about an archetype*, and an ephemeral personal result
that exists only in the tab where the quiz was answered. Give the quiz a real
history stack and session-scoped persistence with an explicit resume. Fix the
image and font delivery, and add CI.

The app remains dependency-free browser JavaScript. The build adds no runtime —
its entire output is static files, deployable to any host, with no server, no
edge function, and no rewrite rules.

## Rejected Alternatives

**An edge function injecting metadata per request** (Vercel/Netlify/Cloudflare)
would preserve the current source tree exactly and keep `?type=` URLs. Rejected:
the profile data is static, authored content that changes only when a source
file is edited. Paying for per-request computation, and for coupling to one
host, buys nothing when nothing is per-request.

**One generic share card for every archetype** costs no infrastructure.
Rejected: the reason a person clicks a shared link is to see *which* type their
friend got. A card identical for all archetypes removes the hook that makes the
product spread.

**A URL per question** (`/q/1`…`/q/45`) would make the back gesture work through
plain history. Rejected: it invents addressable locations for linear,
non-addressable state, and forces an answer to "what does reloading `/q/30`
with no answers mean?" — a question with no user benefit and several bad
answers.

**Silent resume** of a stored run is less code than an explicit offer.
Rejected: on a shared device, the only signal that you are inside someone else's
half-finished quiz would be that the answers feel unfamiliar.

## Serving and Build Model

`scripts/build.js` is a Node script with no dependencies. It imports the profile
registry from `src/quiz.js` and writes `dist/`:

```
dist/
  index.html              landing, unmodified except the <head> fixes
  src/                    styles.css, app.js, quiz.js, questions.js
  public/                 favicon, images (including derived formats)
  t/<slug>/index.html     one page per archetype
```

Each archetype page is `index.html` with two substitutions:

1. **The metadata block.** `<title>`, `<meta name="description">`, `og:title`,
   `og:description`, `og:url`, `og:image`, `og:type`, `twitter:card`, and
   `twitter:title`/`twitter:description`, all derived from that archetype's
   `name`, `role`, and `tagline`.
2. **An injected payload.** `<script type="application/json"
   id="archetype">{"code":"HPAIC"}</script>`, so the client renders the neutral
   page on first paint without parsing the slug out of `location.pathname`.

`index.html` carries a single marker comment (`<!-- archetype-meta -->`)
delimiting the replaceable region. The build fails loudly if the marker is
absent, rather than emitting pages with no metadata.

**The build derives its page list from the profile registry, never from a
hardcoded count.** Adding, removing, or renaming a profile changes the emitted
pages with no edit to the build script.

### Development parity

`npm run dev` continues to serve the source tree, where no `t/` directories
exist and no payload is injected. The client therefore resolves an archetype
from three sources in order: the injected payload, then `location.pathname`,
then a `?type=` query parameter. Development uses the query form; production
uses the payload; the pathname branch covers a built page whose script tag was
stripped. All three reach the same render function over the same profile data,
so the build adds only the crawler-visible HTML and a first-paint shortcut.

### Link compatibility

On load, a `?type=<slug>` query parameter naming a known profile is replaced —
via `replaceState`, not a navigation — with the equivalent `/t/<slug>` path when
running from `dist/`, and honoured in place otherwise. Links already shared keep
working. An unknown slug in either form renders the landing page, as today.

## Screens and State

`state.screen` becomes `landing | quiz | result | archetype`.

| Screen | Reached by | Voice | Primary action |
|---|---|---|---|
| `landing` | `/` | — | Find my court type |
| `quiz` | pressing start | — | Next play |
| `result` | finishing the quiz, in that tab only | second person | Copy result link |
| `archetype` | loading `/t/<slug>` | neutral, third person | Find my court type |

**`archetype` is a page about an archetype, not about a person.** It never says
"your" and never attributes the result to anybody — not to the visitor and not
to a friend. It is the canonical, linkable, prerendered page, and it is what
every crawler and every cold visitor receives.

**`result` is ephemeral.** It exists only in the tab that answered the
questions, and no URL loads it. Finishing the quiz calls `replaceState` to
`/t/<slug>` so the link is copyable, while the screen remains the personal
result.

*Consequence, accepted deliberately:* reloading that URL after finishing yields
the neutral archetype page, because at that point the visitor is simply a reader
of a page about that archetype. Reload after finishing is mildly lossy.

### Shared rendering

`result` and `archetype` render identical profile content — name, role,
description, strengths, and the axis breakdown. That markup is extracted into a
single `profileBody(profile)` helper used by both. The screens differ only in
the header block, the framing copy, and the actions.

The axis breakdown appears on both: which side of each axis a type occupies is a
property of the archetype, not of anyone's answers.

`archetype` carries two elements `result` does not, because a cold visitor
arrives with no context:

- A line establishing what the page is, above the name: "One of thirty-two court
  types" (phrased from the registry size, not hardcoded).
- Beneath the primary action, a secondary link to the landing page's explanation
  of the five instincts.

## History

One rule: **forward pushes, `popstate` retreats.**

- Entering the quiz pushes one entry. Advancing to each next question pushes
  another. Every entry uses path `/` — the stack grows, the address bar does not
  change.
- A `popstate` handler moves the app backward: question *n* → *n−1*; question 1
  → landing.
- The in-app *Previous question* button calls `history.back()` rather than
  mutating state, so the button and the gesture cannot disagree.
- Moving forward after a back re-pushes rather than relying on the forward
  stack.
- Finishing uses `replaceState` to `/t/<slug>` — replace, not push — so back
  from the result returns to the final question rather than trapping the user.

## Persistence

On every answer, the app writes `{ answers, index }` to `sessionStorage` under
one key. Reaching the result clears it. Pressing start fresh clears it before
beginning.

`sessionStorage`, not `localStorage`, because its lifetime already expresses the
intent: it survives a reload and a backgrounded tab, and it is gone when the tab
closes, so a stale run cannot greet someone a week later.

### Resume

The landing page reads the key on load. **The resume control is rendered only
when an unfinished run exists** — answers present, and not a complete set.
It is absent on a first visit and absent after a completed quiz. It shows the
position ("Pick up where you left off — question 17 of 45") and sits alongside
the normal start button, which remains primary.

### Validation

Stored data is validated before use, never trusted. Unknown question ids, values
outside an axis's two poles, a non-integer or out-of-range index, or malformed
JSON all cause the key to be discarded and the landing page to render as a first
visit. `sessionStorage` is user-editable, and `scoreAnswers` assumes well-formed
answers; validating on read keeps a corrupted run from reaching it.

### Unavailable storage

All `sessionStorage` access is wrapped. It throws rather than returning null in
Safari private mode and in some embedded webviews. A failure degrades to no
persistence and no resume control; the quiz itself still works.

## Performance and Delivery

**Fonts.** Move the `@import` from `src/styles.css:1` into a
`<link rel="stylesheet">` in `<head>`, immediately after the existing
`preconnect` hints. The font request then starts during the initial HTML scan
instead of waiting on a stylesheet fetch and parse. `display=swap` is already in
the URL and stays, so text paints in the fallback rather than blocking.

**Hero image.** `public/images/hero-basketball.jpg` is 1024×1536, 322 KB, and
the LCP element. Three changes:

- Add `width="1024" height="1536"` so the box is reserved before the bytes
  arrive, eliminating layout shift. The existing `object-fit: cover` and
  absolute positioning are unaffected.
- Add `fetchpriority="high"`, since it is above the fold and currently competes
  with the font requests.
- Serve AVIF and WebP through `<picture>`, with the JPEG as fallback.

Derived formats are generated with `sips` (present on macOS, no dependency) and
**committed to the repository** rather than produced on each build. The source
image changes approximately never, and regenerating per build would make output
non-reproducible across machines. The source `.jpg` and its `.prompt.txt` stay
in `public/images/`.

**Delivery.** `npm run build` produces `dist/`, deployable to any static host.
Every route is a real directory containing a real `index.html`, so no rewrite
rules are required. A GitHub Actions workflow runs `npm test` and `npm run
check` on push and pull request, then builds.

*The deploy target is deliberately not specified here.* Choosing prerendering
over an edge function was precisely to keep the app host-agnostic; naming a host
in this spec would spend that.

## Testing

Three groups extend the existing `node --test` suite, which already covers
scoring and the DOM flow. The existing harness stubs `window` and `document` by
hand; `history` and `sessionStorage` become stubs alongside them.

**Build output**
- Every profile in the registry produces a page at its slug.
- Each page's `og:title` and injected code match that profile.
- The emitted page count equals the registry size — this is what catches a
  profile added without a page.
- A missing marker comment fails the build.

**History**
- `popstate` from question *n* lands on *n−1*.
- `popstate` from question 1 lands on the landing page.
- *Previous question* and the back gesture produce the same state.
- Finishing replaces rather than pushes.

**Persistence**
- An unfinished run renders the resume control; a finished run does not; a first
  visit does not.
- Resuming restores both answers and position.
- A corrupted or partially-valid payload is discarded silently.
- A throwing `sessionStorage` still renders a working landing page and quiz.

**Screens**
- `/t/<slug>` renders the neutral archetype page and contains no second-person
  framing copy.
- A completed quiz renders the personal result.
- Both render identical profile content.

## Interaction With the Trait Archetype Model

`docs/superpowers/plans/2026-09-12-trait-archetype-model.md` is an approved,
unimplemented plan that replaces the five-axis / 32-profile model with nine
traits and 72 archetypes. Three of its constraints contradict this design:

| Trait plan | This spec |
|---|---|
| Share URLs stay `?type=<slug>` | Share URLs become `/t/<slug>`, with `?type=` redirecting |
| Existing `?type=chessmaster` links are expected to break | Existing links keep working |
| No build step | A prerender build step |

**This spec does not re-open those decisions, and is written so the conflict
does not have to be resolved before implementation.** Everything here derives
from the profile registry rather than from the five-axis model: the build emits
one page per registry entry, whether that registry holds 32 five-letter codes or
72 trait pairs, and `profileBody` renders whatever fields the registry exposes.

Two coupling points need attention whenever the trait model lands:

1. **Slug stability.** The trait plan assigns new slugs. Archetype pages
   prerendered under the old slugs will 404 afterward. Either the trait model
   preserves the 32 existing slugs as aliases, or the launch accepts that links
   shared before the migration break — a decision to make deliberately, not by
   omission.
2. **The axis breakdown.** `profileBody` renders five axis rows today and a
   nine-trait scorecard under the trait model. It is the single place both
   screens get that markup, so the change is confined to it.

**Recommended ordering:** ship this work first. It is smaller, it is independent
of the scoring model, and shipping the trait model onto an app that still cannot
unfurl a link would waste the larger change.

## Out of Scope

- Per-archetype share images. `og:image` points at the existing hero for every
  archetype. Generating 32 distinct images is worthwhile later; the prerender
  step is where it will go.
- Analytics and error monitoring.
- Any visual redesign beyond the resume control and the archetype page's two
  additional elements.
- Server-side anything. The output stays static.
