# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Module 7 — Threads/Comments (complete)

## Current Goal

- Completed Module 7 (Comment model, post + paginated list, atomic `commentCount`, `comment:added` broadcast, shared board-membership middleware). Next: Module 8 — Availability

## Completed

- Module 1 — Foundation & Scaffold (server/): env config, DB connection, Express + Socket.io bootstrap, `/health` endpoint
- Module 2 — Board (server/): Board + Participant models, board CRUD (POST/GET/PATCH), Zod validation, controller/service pattern established
- Module 3 — Participant & Session (server/): JWT sessions, `requireAuth`/`requireOwner` middleware, joinBoard, magic-link recovery, ownership claim
- Module 4 — Socket Foundation (server/): Socket.io auth middleware (JWT cookie), auto room join per board, no-op disconnect handler
- Module 5 — Options (server/): Option + Location models, B2 photo upload + signed URLs, option CRUD endpoints, photo upload (creator/owner), `optionsOwnerOnly` board setting
- Module 6 — Voting (server/): Vote model, cast/change/remove reactions (atomic `$inc`), score + `isLeading` per request, `vote:updated` broadcast
- Module 7 — Threads/Comments (server/): Comment model, post + cursor-paginated list, atomic `commentCount` on Option, `comment:added` broadcast

## In Progress

- None

## Next Up

- Module 8 — Availability: AvailabilitySlot model, date grid, live aggregates (date grid)

## Open Questions

- ~~Tie-break rule when two options have equal score~~ — all tied options reported as `isLeading` for MVP
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
- Module 6: `DELETE /options/:id/vote` — removes a reaction to neutral (FR11 extension, not in FR list)
- Module 6: `score`/`isLeading` computed per request, never stored; ties all flagged leading
- Module 6: `vote:updated` emitted from service layer after persistence via thin `voteEmitter.js` + `io.js` accessor — no socket logic duplication, invariant 5
- Module 6: reaction counts via Mongoose `$inc` (atomic); unique index (optionId, participantId) enforces one reaction per option
- Module 6: `socket.io-client` used only as a dev-time verification dependency (`npm install --no-save`), not added to package.json — validates real-time behavior across two clients.
- Module 7: `requireOptionBoardMembership` shared middleware — option-exists + participant-on-board check, replaces duplicated logic in photo (Module 5) and vote (Module 6); used by photo, vote, and comment routes

## Session Notes

- Module 1: server boots, `/health` → 200
- Module 2: board CRUD verified via curl (201/200/400/404)
- Module 3: join/recover/claim-ownership all verified via curl (201/200/401/403)
- Module 4: socket auth + room join verified via socket.io-client (23/23 assertions)
- Module 5: option CRUD + photo + auth matrix verified via fetch (36/36 assertions)
- Module 6: vote-creation-flip-no-op-remove all update `likesCount`/`dislikesCount` atomically; score + `isLeading` incl. ties verified via curl
- Module 6: `vote:updated` received live by two socket clients with correct counts, score, leading option (12/12)
- Module 7: comment post increments `commentCount` atomically; cursor pagination limits thread; participant names shown, no emails; auth + validation verified via curl
- Module 7: `comment:added` received live by two socket clients with new comment + updated count (10/10)
