# Court Type

A basketball playing-style quiz with 46 game situations and 45 on-court archetypes. It takes about ten minutes. All scoring happens in the browser; no account or backend is required.

## Run locally

Run `npm run dev`, then open [http://localhost:5173](http://localhost:5173). Node.js and Python 3 are required for this development command.

Run `npm test` for scoring tests and `npm run check` for JavaScript syntax checks.

## How it works

Forty-six Likert items measure nine traits across four roles: Creator, Scorer, Defender, and Connector. A trait that stands far enough above your own nine-trait mean gives one of 9 pure archetypes; otherwise your two strongest traits resolve to one of 36 blends, each hand-written. Trait order does not matter — the same two traits always give the same archetype — and how far the primary leads the secondary is shown as a lean bar on the result page. The result page uses an archetype slug so the named profile can be shared without storing answers.
