# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- Module 3 — Participant & Session (complete)

## Current Goal

- Completed Module 3 (JWT sessions, auth middleware, magic-link recovery, ownership claim). Next: Module 4 — Socket Foundation

## Completed

- Module 1 — Foundation & Scaffold (server/):
  - `config/env.js` — env loading via dotenv, fail-fast on missing required vars
  - `config/db.js` — Mongoose connection via MONGODB_URI
  - `app.js` — Express app: cors, helmet, morgan, JSON parsing, health route, error middleware
  - `server.js` — HTTP + Socket.io (no handlers yet), connects DB, listens on PORT (5000)
  - `routes/health.js` — GET /health returns `{ status: "ok" }`
  - Fixed package.json scripts to point at root `server.js`
- Module 2 — Board (server/):
  - `models/Board.js` — schema: name, type (enum, optional), status (open/decided), ownerId, inviteToken (unique), decisionDeadline (optional), createdAt
  - `models/Participant.js` — schema: boardId, displayName, email, role (owner/member), createdAt
  - `validators/board.js` — Zod: createBoard (name, type?, creatorDisplayName, creatorEmail), updateBoard (name?, type?, at-least-one required)
  - `services/boardService.js` — createBoard (transactional: Participant + Board + link boardId), getBoardById, updateBoard
  - `controllers/boardController.js` — thin: parse → service → `{ success, data, error }` response
  - `routes/board.js` — POST/GET/PATCH `/api/boards[/:id]` with ObjectId validation
  - `utils/asyncHandler.js` — shared async wrapper
  - Fixed `app.js`: mount board routes at `/api` prefix; ZodError → 400
- Module 3 — Participant & Session (server/):
  - `models/Participant.js` — added `lastActiveAt` (Date)
  - `utils/tokens.js` — `signSessionToken` (30d, type `session`), `signRecoveryToken` (15m, type `recovery`), `verifyToken`
  - `utils/email.js` — `sendMagicLinkEmail` via Brevo, links to `/recover?token=...`
  - `middleware/auth.js` — `requireAuth`, `requireOwner`
  - `services/participantService.js` — joinBoard (FR9 dedupe), recoverRequest (no email leak), recover, claimOwnership
  - `controllers/participantController.js` + `validators/participant.js` + `routes/participant.js`
  - `routes/board.js` — GET gated by `requireAuth`, PATCH by `requireAuth`+`requireOwner`
  - `controllers/boardController.js` — createBoard sets owner session cookie + fires recovery email
  - `app.js` — added `cookie-parser`, CORS `credentials: true`, mounted participant routes

## In Progress

- None

## Next Up

- Module 4 — Socket Foundation: room-per-board Socket.io setup, connect/disconnect, room join on auth

## Open Questions

- Tie-break rule when two options have equal score — owner discretion, or auto-resolve by earliest created?
- Owner-inactivity threshold set at 7 days by default — not yet stress-tested against real usage
- Invite links have no expiry/revocation for MVP — accepted tradeoff, revisit if abuse becomes a problem
- Duplicate participant joins are not prevented (email is required but unverified) — accepted tradeoff for MVP
- Session cookies use `secure: false` in current dev config — must be `secure: true` behind HTTPS in production (already true once deployed; `PRODUCTION_REVIEW`: set secure based on NODE_ENV when env/deploy is finalized)
- Participant emails are never exposed to other participants (NFR7) — join/recover responses only return the acting participant's own email

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
- Module 2: `Participant.boardId` is not required (set after Board creation in same transaction) — circular dependency: Board needs Participant `_id` as `ownerId`, Participant needs Board `_id` as `boardId`; one side must be deferred
- Module 3: session JWT is board-scoped; `requireAuth` relies on token scope, no per-request board re-check (NFR8 invite-link obscurity, no hardening)
- Module 3: `sendMagicLinkEmail` is fire-and-forget — email failures never block create/join
- Module 3: FR9 dedupe keys on a session cookie whose `boardId` matches the invite token's board; otherwise a new participant
- Module 3: ownership claim reassigns `ownerId` and flips both roles in one service call (no transaction) — preserves exactly-one-owner invariant

## Session Notes

- Module 1 verified: server boots, connects to MongoDB, listens on 5000, `GET /health` → 200 `{"status":"ok"}`
- Module 2 verified via curl: POST /api/boards → 201 (board + ownerId + inviteUrl), GET /api/boards/:id → 200, PATCH → 200, empty PATCH → 400, invalid id → 400, nonexistent → 404
- Module 3 verified via curl: create board sets session cookie + fires recovery email; GET with cookie → 200, without → 401; PATCH owner cookie → 200, member/absent → 403/401; join → 201 + cookie; re-join → 200 `existing:true` (no duplicate); recover-request for existing + non-existent email → same generic response (no leak); recover → 200 + fresh session cookie that works on GET; session token can't be used in recover, recovery token can't be used as session (both 401); claim-ownership: active owner → 403, after backdating `lastActiveAt` past 7 days → 200 (roles swap, board.ownerId updated, one owner remains), claim again → 403 "already the owner"
