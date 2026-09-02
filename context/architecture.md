# Architecture Context

## Stack

| Layer              | Technology                           | Role                                                              |
| ------------------ | ------------------------------------ | ----------------------------------------------------------------- |
| Frontend framework | React 19 + Vite                      | SPA UI, dev/build tooling                                         |
| UI                 | Tailwind CSS                         | Styling                                                           |
| State management   | Redux Toolkit                        | Global client state (board, session, participants)                |
| Icons              | Lucide React                         | Icon set                                                          |
| Animation          | Framer Motion                        | Vote/card animations — core interaction, not decoration           |
| Maps               | React Leaflet + OpenStreetMap tiles  | Interactive map rendering                                         |
| Real-time (client) | Socket.io-client                     | Live board updates                                                |
| Backend framework  | Node.js + Express                    | REST API, 3-tier: Routes → Controllers → Services                 |
| Real-time (server) | Socket.io                            | Room-scoped events, one room per `board_id`                       |
| Database           | MongoDB Atlas + Mongoose             | All structured data                                               |
| File storage       | Backblaze B2 (S3-compatible)         | Option photos                                                     |
| Auth               | JWT                                  | Board-scoped session tokens, no full account system               |
| Email              | Brevo                                | Magic-link recovery                                               |
| Geocoding          | Nominatim (OpenStreetMap)            | Place search / reverse geocoding                                  |
| Deployment         | Vercel (frontend) / Render (backend) | Backend needs a persistent process for Socket.io — not serverless |

## System Boundaries

### Server — 3-tier (Routes → Controllers → Services)

```
server/
  src/
    routes/         — defines endpoints per resource, wires middleware, no logic
    controllers/    — parses request, calls services, shapes response
    services/       — all business logic, talks to models
    models/         — Mongoose schemas
    middleware/     — auth (JWT verify), role checks, validation, error handling
    sockets/        — Socket.io event handlers, room join/leave, emit logic
    validators/     — request schema validation (e.g. Zod)
    utils/          — geocoding client, email sender, B2 upload client
    config/         — env loading, DB connection, socket server setup
  app.js            — Express app assembly
  server.js         — HTTP + Socket.io server bootstrap
```

- `routes/` — owns URL structure and middleware wiring only
- `controllers/` — owns request/response shape; never touches the database directly
- `services/` — owns business logic and all database access; the only layer that talks to `models/`
- `sockets/` — owns real-time event contracts and room scoping; calls the same `services/` layer as controllers, never duplicates logic

### Client

```
client/
  src/
    pages/          — routed top-level pages: landing page, board pages, optional board sub-pages
    features/       — one folder per domain: board, options, voting, map, threads, availability
    components/     — shared, cross-feature UI components
    hooks/          — shared React hooks (e.g. useSocket, useBoard)
    services/       — API client, socket client
    store/          — Redux Toolkit slices + store config
    context/        — session-only state not suited to Redux (e.g. active socket instance)
    utils/
  main.jsx
```

- `pages/` — owns routing; a page composes `features/` and `components/`, holds no business logic itself
- `features/` — owns UI + local logic for one domain; does not reach into another feature's internals
- `store/` — owns global client state (board data, participant session, votes) via Redux Toolkit slices
- `services/` — owns all outbound communication (REST + socket); features never call `fetch`/`socket.emit` directly

## Storage Model

- **MongoDB Atlas**: all structured data — Board, Participant, Option, Vote, Comment, AvailabilitySlot, Location, ParticipantLocation
- **Backblaze B2**: binary file storage only — option photos. Never store binary content in MongoDB. The bucket is **private** (public buckets require billing info on file, which isn't set up) — MongoDB stores the B2 object key only, never a permanent URL. The service layer generates a short-lived pre-signed GET URL (via `@aws-sdk/s3-request-presigner`) each time an option with a photo is fetched.

## Auth and Access Model

- No full account system. Every participant gets a board-scoped JWT session token on join (cookie or bearer, decided at implementation).
- Email is a required field for both creator and participant, but unverified at join — it exists for recovery and identification, not gatekeeping.
- Magic-link recovery re-issues a board-scoped JWT for a returning participant/owner, cross-device.
- Exactly one `owner` role per board at all times. Owner-only actions (settings, lock-in, remove participant/option, edit any option) are gated by a role-check middleware before the controller runs.
- Ownership can transfer: if `owner.last_active_at` exceeds the inactivity threshold with the board still undecided, any participant can claim ownership via a dedicated endpoint. This is a role reassignment, not a new owner record — the invariant of exactly one owner still holds.

## Invariants

1. Routes contain no business logic — only middleware wiring (auth, validation) and a call into a controller.
2. Controllers never query the database directly — all data access goes through `services/`.
3. Every mutation (vote, comment, option create/edit, lock-in, remove, ownership claim) passes an authorization check (participant-of-board, or owner-only) before it reaches the service layer.
4. Socket.io events are always scoped to a `board_id` room — never broadcast globally, never cross board boundaries.
5. Any state broadcast over a socket event is persisted to MongoDB first — sockets announce confirmed state, they are not the source of truth themselves.
6. `ParticipantLocation` data is only stored and included in any payload for a participant who has explicitly opted in — never sent by default, never inferred.
7. Exactly one `owner` exists per board at any point in time — a claim transfers the role, it never creates a second owner.
