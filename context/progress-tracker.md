# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Module 5 — Options (complete)

## Current Goal

- Completed Module 5 (Option + Location models, B2 photo upload, option CRUD + REST endpoints, optionsOwnerOnly). Next: Module 6 — Voting

## Completed

- Module 1 — Foundation & Scaffold (server/): env config, DB connection, Express + Socket.io bootstrap, `/health` endpoint
- Module 2 — Board (server/): Board + Participant models, board CRUD (POST/GET/PATCH), Zod validation, controller/service pattern established
- Module 3 — Participant & Session (server/): JWT sessions, `requireAuth`/`requireOwner` middleware, joinBoard, magic-link recovery, ownership claim
- Module 4 — Socket Foundation (server/): Socket.io auth middleware (JWT cookie), auto room join per board, no-op disconnect handler
- Module 5 — Options (server/): Option + Location models, B2 photo upload + signed URLs, option CRUD endpoints, photo upload (creator/owner), `optionsOwnerOnly` board setting

## In Progress

- None

## Next Up

- Module 6 — Voting: Vote model, cast/change reaction, score aggregation, "leading" flag

## Open Questions

- Tie-break rule when two options have equal score
- Owner-inactivity threshold (7 days) not stress-tested
- Invite links have no expiry/revocation for MVP
- Duplicate participant joins not prevented (accepted tradeoff)
- Session cookies `secure: false` in dev — must be `true` in production
- Participant emails never exposed to other participants (NFR7)

## Architecture Decisions

- Vote scoring: one reaction (like/dislike) per participant per option, changeable; score = likes − dislikes
- Participant location: opt-in, shown exact to all board participants once shared
- Owner can edit any option's details post-creation (not just remove)
- Ownership claim: time-based (7 days inactive), preserves exactly-one-owner invariant
- Email required but unverified for every participant
- No TypeScript — plain modern JS, Zod for runtime validation
- Backend 3-tier: Routes → Controllers → Services; sockets call same services
- Module 1: `.env` env vars — B2/Brevo/Nominatim are optional, gracefully skipped if absent
- Module 2: `Participant.boardId` deferred (set after Board creation) — circular dependency
- Module 3: session JWT board-scoped; `requireAuth` relies on token scope, no per-request board re-check
- Module 3: `sendMagicLinkEmail` is fire-and-forget; claim-ownership reassigns in one call (no transaction)
- Module 4: `cookie` package (v1+) exports `parseCookie` not `parse` in ESM
- Module 5: `optionsOwnerOnly` wired into board PATCH so it's actually toggleable
- Module 5: PATCH/DELETE option are `requireOwner` only; photo upload = creator OR owner
- Module 5: B2 photo key overwrites on re-upload (acceptable — single photo per option MVP)

## Session Notes

- Module 1: server boots, `/health` → 200
- Module 2: board CRUD verified via curl (201/200/400/404)
- Module 3: join/recover/claim-ownership all verified via curl (201/200/401/403)
- Module 4: socket auth + room join verified via socket.io-client (23/23 assertions)
- Module 5: option CRUD + photo + auth matrix verified via fetch (36/36 assertions)
