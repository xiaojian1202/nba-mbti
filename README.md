# Court Type

A basketball playing-style quiz with 45 game situations and 32 curated on-court archetypes. It takes about eight minutes. All scoring happens in the browser; no account or backend is required.

## Run locally

Run `npm run dev`, then open [http://localhost:5173](http://localhost:5173). Node.js and Python 3 are required for this development command.

Run `npm test` for scoring tests and `npm run check` for JavaScript syntax checks.

## How it works

Nine questions measure each of five axes: tempo, creation, defense, temperament, and role. The majority answer for each axis forms an internal five-letter type. The result page uses an archetype slug such as `?type=chessmaster` so the named profile can be shared without storing answers or exposing the internal code.
