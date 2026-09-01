# Code Standards

## General

- Keep modules small and single-purpose
- Fix root causes, do not layer workarounds
- DRY — shared logic goes into a service, util, or hook; never copy-pasted across files
- Do not mix unrelated concerns in one component, route, or controller

## JavaScript

- Plain modern JavaScript — no TypeScript
- ES6+ throughout: arrow functions, destructuring, template literals, spread/rest, optional chaining (`?.`), nullish coalescing (`??`)
- `const` by default, `let` when reassignment is needed, never `var`
- `async/await` over raw `.then()` chains
- ES modules (`import`/`export`) on both frontend and backend
- No TypeScript means runtime validation carries the weight TS would — validate all external input at system boundaries (Zod on the backend)

## React (Frontend)

- Functional components + hooks only — no class components
- Code-split at the route level: every page in `pages/` is lazy-loaded via `React.lazy` + `Suspense`
- Organize by feature (`features/board`, `features/voting`, etc.), not by file type
- `useMemo`/`useCallback`/`React.memo` only where there's an actual measured cost — not applied by default
- One Redux Toolkit slice per domain; slices don't reach into each other's state directly
- Extract a custom hook the moment logic is reused across 2+ components

## Express (Backend)

- Route handlers are thin: validate → call controller → nothing else
- Controllers are thin: call service → shape response → nothing else
- All async route handlers wrapped in a shared error-handling wrapper — no repeated try/catch per route
- Config centralized in `config/` — no `process.env` reads scattered through the codebase

## Styling

- Tailwind utility classes only — no inline styles, no ad-hoc CSS files
- Design tokens (colors, spacing, radius) defined once in `tailwind.config`, referenced everywhere — no hardcoded hex values
- Icons: Lucide React only, consistent size scale (`h-4 w-4` inline, `h-5 w-5` in buttons)

## API & Socket Contracts

- Validate and parse all request input (Zod) before any logic runs
- Enforce auth + role check before any mutation, not after
- Consistent response shape across every endpoint: `{ success, data, error }`
- Socket.io event names follow `resource:action` (e.g. `option:created`, `vote:updated`, `comment:added`)

## Data and Storage

- Metadata and relationships belong in MongoDB
- Binary content (option photos) belongs in Backblaze B2 — never stored in MongoDB
- Validation defined at the Mongoose schema level too, not only at the API boundary — the database should reject bad data even if a request check is ever bypassed

## Performance

- Code-split by route (`React.lazy`) so the initial bundle only loads what the landing/current page needs
- Debounce or throttle high-frequency socket emissions (e.g. rapid vote toggling) to avoid flooding the socket connection
- Paginate or cap queries that can grow unbounded (comments, options) — never load an entire collection unfiltered
- Avoid N+1 queries — use Mongoose `.populate()` deliberately, never inside a loop

## File Organization

**Backend** — `routes/`, `controllers/`, `services/`, `models/`, `middleware/`, `sockets/`, `validators/`, `utils/`, `config/`

**Frontend** — `pages/`, `features/`, `components/`, `hooks/`, `services/`, `store/`, `context/`, `utils/`
