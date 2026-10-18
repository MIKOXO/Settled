# Settled

A shared decision board for groups — trips, dinners, events, anything. Participants propose options, vote in real time, mark availability, and drop map pins on a shared map until an owner locks in the final decision. No group-chat chaos, no signup for participants.

![Settled home overview](./client/public/HomeOverview.png)

## How It Works

1. **Create a board** — name it, pick a type, get an invite link
2. **Join with a link** — participants join with just a display name and email
3. **Decide together** — propose options, vote, comment, poll dates, share pins — all live
4. **Lock it in** — the owner locks the winning option once the signal is in

## Features

- **Options & voting** — like/dislike with live scores and a leading-option highlight
- **Date polling** — availability grid with live aggregates
- **Shared map** — place search, pin drops, opt-in personal location
- **Live threads** — per-option comments with replies, in real time
- **Zero friction** — invite links, guest join, magic-link access recovery
- **Owner controls** — settings, remove participants, lock the decision

## Stack

| Frontend                  | Backend                 |
| ------------------------- | ----------------------- |
| React 19 + Vite           | Node.js + Express       |
| Tailwind CSS              | MongoDB + Mongoose      |
| Redux Toolkit             | Socket.io               |
| Socket.io-client          | JWT sessions (cookies)  |
| MapLibre GL + OpenFreeMap | Zod validation          |
| Framer Motion             | Backblaze B2 (photos)   |
|                           | Nominatim / Wikipedia   |
|                           | Brevo (magic-link mail) |

## Structure

```
settled/
├── client/                     React SPA
│   ├── src/pages/              Routes (Landing, Create, Board, Join, Share, Recover)
│   ├── src/features/           Feature UI — board, options, voting, threads,
│   │                           availability, map, landing
│   ├── src/components/         Shared UI (menus, form fields, lightbox)
│   ├── src/store/              Redux slices — board + session
│   ├── src/services/           API clients (axios) and the socket connection
│   ├── src/hooks/              Board socket, form errors, small utilities
│   └── src/utils/              Pure helpers (dates, geolocation, validation)
└── server/                     REST API + Socket.io
    ├── src/routes/             Endpoints + middleware wiring
    ├── src/controllers/        Request/response shaping
    ├── src/services/           All business logic and DB access
    ├── src/models/             Mongoose schemas
    ├── src/middleware/         Auth, roles, validation, errors
    ├── src/sockets/            Socket.io handlers, room scoping, emitters
    └── src/validators/         Zod request schemas
```

## Running Locally

Commands run from the repository root. Backend first:

```bash
# Backend — http://localhost:5000
cd server
npm install
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET, CLIENT_URL
npm run dev

# Frontend — http://localhost:3000 (separate terminal)
cd client
npm install
cp .env.example .env   # already points at localhost:5000
npm run dev
```

`GET http://localhost:5000/health` should return `{"status":"ok"}`.

## Client Scripts

| Command           | Purpose             |
| ----------------- | ------------------- |
| `npm run dev`     | Dev server with HMR |
| `npm run build`   | Production build    |
| `npm run lint`    | ESLint              |
| `npm run preview` | Preview the build   |

## Deployment

- **Frontend** → Vercel (`client/`), rewrites `/api/*` to the backend
- **Backend** → Render (`server/`), a persistent process — required for Socket.io, so not serverless

Set `VITE_SOCKET_URL` (Vercel) to the Render URL for live updates, and `CLIENT_URL` (Render) to the Vercel origin for CORS.
