# Court Type

A basketball playing-style quiz with 46 game situations and 72 on-court archetypes. It takes about ten minutes. All scoring happens in the browser; no account or backend is required.

## Run locally

Run `npm run dev`, then open [http://localhost:5173](http://localhost:5173). Node.js and Python 3 are required for this development command.

Run `npm test` for scoring tests and `npm run check` for JavaScript syntax checks.

## How it works

Forty-six Likert items measure nine traits across four roles: Creator, Scorer, Defender, and Connector. The two strongest traits form an ordered pair resolved into one of 72 archetypes. The result page uses an archetype slug so the named profile can be shared without storing answers.
