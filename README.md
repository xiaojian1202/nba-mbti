# Court Type

A basketball playing-style quiz with 46 game situations and 45 on-court archetypes. It takes about ten minutes. All scoring happens in the browser; no account or backend is required.

## Run locally

Run `npm run dev`, then open [http://localhost:5173](http://localhost:5173). Node.js and Python 3 are required for this development command.

Run `npm test` for scoring tests and `npm run check` for JavaScript syntax checks.

## Build

Run `SITE_URL=https://your.domain npm run build` to write the static site to `dist/`. `SITE_URL` is required and is used for absolute share links and images; the build fails without it. It emits one page per archetype at `dist/t/<slug>/`, so any static host can serve `dist/` as-is with no rewrites.

## How it works

Forty-six Likert items measure nine traits across four roles: Creator, Scorer, Defender, and Connector. The two strongest traits form an unordered pair resolved into one of 45 archetypes (36 pairings plus 9 pure types). The result page uses an archetype slug so the named profile can be shared without storing answers.
