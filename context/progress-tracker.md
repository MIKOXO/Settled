# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Module 1 — Foundation & Scaffold (complete)

## Current Goal

- Completed Module 1 (server scaffold). Next: Module 2

## Completed

- Module 1 — Foundation & Scaffold (server/):
  - `config/env.js` — env loading via dotenv, fail-fast on missing required vars
  - `config/db.js` — Mongoose connection via MONGODB_URI
  - `app.js` — Express app: cors, helmet, morgan, JSON parsing, health route, error middleware
  - `server.js` — HTTP + Socket.io (no handlers yet), connects DB, listens on PORT (5000)
  - `routes/health.js` — GET /health returns `{ status: "ok" }`
  - Fixed package.json scripts to point at root `server.js`

## In Progress

- None

## Next Up

- Module 2 — Board & Participant schemas, create/join REST endpoints, invite-link + board-scoped JWT, auth/role middleware

## Open Questions

- Tie-break rule when two options have equal score — owner discretion, or auto-resolve by earliest created?
- Owner-inactivity threshold set at 7 days by default — not yet stress-tested against real usage
- Invite links have no expiry/revocation for MVP — accepted tradeoff, revisit if abuse becomes a problem
- Duplicate participant joins are not prevented (email is required but unverified) — accepted tradeoff for MVP

## Architecture Decisions

- Vote scoring: one reaction (like/dislike) per participant per option, changeable anytime; score = likes − dislikes — needed to define "leading option"
- Participant location: opt-in, but shown exact (not fuzzed) to all board participants once shared — deliberate tradeoff of privacy for simplicity/utility, flagged and accepted
- Owner can edit any option's details post-creation (not just remove) — supports acting on thread feedback
- Ownership abandonment: time-based claim (any participant can claim after owner inactivity threshold), not vote-based — simplest mechanism that avoids a permanently stuck board
- Email required (not optional) for every participant, but unverified — balances recovery/dedupe against the zero-friction join goal
- No TypeScript — plain modern JS throughout, runtime validation (Zod) carries the boundary-safety role TS would
- Backend is strict 3-tier: Routes → Controllers → Services, sockets call the same service layer as controllers
- Stack finalized: Redux Toolkit (frontend state), Lucide (icons), Brevo (email), Vercel (frontend deploy), Render (backend deploy)
- Module 1: `app.js`/`server.js` at `server/` root, subfolders under `server/src/` per architecture; fixed package.json scripts to `server.js`
- Module 1: `.env` (protected) missing `BREVO_SENDER_EMAIL`/`NOMINATIM_USER_AGENT` — env.js falls back to `FROM_EMAIL`/`EMAIL_USER` and a default user-agent instead of editing `.env`; only core vars hard-required (service creds unused until later modules)
- Module 1: `/health` returns directly from the route, no controller/service (scaffold exception; no DB/business logic)

## Session Notes

- Module 1 verified: server boots, connects to MongoDB, listens on 5000, `GET /health` → 200 `{"status":"ok"}`
