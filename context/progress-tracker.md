# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Client build: Module 1 complete; Module 2 (Landing Page) next

## Current Goal

- Module 1 — Foundation & App Shell (client/) fully complete (both steps). Next: Module 2 — Landing Page.

## Completed

- Module 1 — Foundation & Scaffold (server/): env config, DB connection, Express + Socket.io bootstrap, `/health` endpoint
- Module 2 — Board (server/): Board + Participant models, board CRUD (POST/GET/PATCH), Zod validation, controller/service pattern established
- Module 3 — Participant & Session (server/): JWT sessions, `requireAuth`/`requireOwner` middleware, joinBoard, magic-link recovery, ownership claim
- Module 4 — Socket Foundation (server/): Socket.io auth middleware (JWT cookie), auto room join per board, no-op disconnect handler
- Module 5 — Options (server/): Option + Location models, B2 photo upload + signed URLs, option CRUD endpoints, photo upload (creator/owner), `optionsOwnerOnly` board setting
- Module 6 — Voting (server/): Vote model, cast/change/remove reactions (atomic `$inc`), score + `isLeading` per request, `vote:updated` broadcast
- Module 7 — Threads/Comments (server/): Comment model, post + cursor-paginated list, atomic `commentCount` on Option, `comment:added` broadcast
- Module 8 — Availability (server/): AvailabilitySlot model, per-toggle upsert (date normalized to midnight UTC), raw list endpoint, `availability:updated` broadcast
- Module 9 — Map & Location (server/): ParticipantLocation model, participant/option pin listing, Nominatim place search proxy, `location:updated`/`location:removed` broadcasts
- Module 1 Step A — Foundation & App Shell (client/): Vite dev server port 3000, folder structure (pages/, features/, components/, hooks/, services/, store/, context/, utils/), design tokens as CSS custom properties, Tailwind config wired to tokens, Layout component (sticky blurred nav, Settled logo), react-router-dom shell with placeholder route
- Module 1 Step B — Foundation & App Shell (client/): `.env` with `VITE_API_URL`/`VITE_SOCKET_URL`, axios instance (`services/api.js`) with `withCredentials` + response interceptor unwrapping `{ success, data, error }`, socket.io client factory (`services/socket.js`) with `initSocket`/`getSocket`/`disconnectSocket`, `useSocket` hook with connect/disconnect lifecycle cleanup, Redux Toolkit store (`store/index.js`) with `sessionSlice` (`{ id, boardId, role, displayName }` + `setSession`/`clearSession` actions), `<Provider>` wired into `main.jsx`

## In Progress

- None

## Next Up

- Module 2 — Landing Page (client/)

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
- Module 8: availability per-toggle write (not bulk save) — each grid click upserts one slot + broadcasts live immediately
- Module 8: `PUT /boards/:boardId/availability` uses `findOneAndUpdate` with `upsert: true` on compound unique index (boardId, participantId, date) — no duplicates on repeated calls
- Module 8: dates normalized to midnight UTC server-side for clean comparisons; GET returns raw slot list, no server-side aggregation
- Module 8: `availability:updated` emits only the changed slot `{ participantId, date, status }` — clients patch locally
- Module 9: opt-in = doc existence; no separate visibility/fuzzed tier — once shared, location always exact (per finalized decision)
- Module 9: `ParticipantLocation.participantId` is unique — one location per participant, upserted on PUT
- Module 9: GET `/locations` returns two separate arrays (`participantLocations`, `optionLocations`) — client styles pins differently
- Module 9: place search proxies to Nominatim with `NOMINATIM_USER_AGENT`; trims response to `{ name, lat, lng }` — Nominatim's 1 req/sec limit is an accepted MVP constraint (already logged in architecture.md); no caching/rate-limiting layer for this module
- Module 9: `location:updated` emits full location after upsert; `location:removed` emits only `{ participantId }`
- Module 1 Step B: `services/api.js` response interceptor returns `data.data` on `{ success, data, error }` shape; non-standard responses (e.g. `/health`) passed through as-is
- Module 1 Step B: `sessionSlice` is the only Redux slice at launch — all other domain state (options, votes, comments, availability, locations) deferred to the module that needs it
- Module 1 Step B: `initSocket()` does NOT auto-connect (`autoConnect: false`) — connection triggered explicitly once a session exists

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
- Module 8: PUT upserts correctly — flip free→busy updates same doc (no duplicate), compound unique index confirmed in MongoDB; GET returns full raw list; 400/401 validation verified (20/20)
- Module 8: `availability:updated` received live by second socket client with correct participantId, date, status on both initial mark and flip (10/10)
- Module 9: opt-in creates/updates location (no duplicate), opt-out removes it; GET returns participant + option pins correctly separated; Nominatim search returns usable `{ name, lat, lng }`; all validation + 401 guards verified (42/42)
- Module 9: `location:updated` and `location:removed` received live on a second socket client with correct payloads, incl. re-upsert (14/14)
- Module 1 Step A (client): dev server on port 3000, `npm run build` passes, no hardcoded hex outside index.css tokens, dark background + coral accent logo dot visible, Sora headings + Plus Jakarta Sans body render correctly
- Module 1 Step B (client): `npm run build` passes, server `/health` responds with `{"status":"ok"}`, CORS + credentials confirmed (`Access-Control-Allow-Origin: http://localhost:3000`, `Access-Control-Allow-Credentials: true`), Redux store initializes with session slice, Provider wired into main.jsx
