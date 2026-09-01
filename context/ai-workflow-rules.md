# AI Workflow Rules

## Approach

Build Settled incrementally using a spec-driven workflow. `project-overview.md`, `architecture.md`, `code-standards.md`, and this file define what to build, how to build it, and the constraints it must respect. `progress-tracker.md` defines the current state. Always implement against these specs — do not invent product behavior, data model fields, or architectural boundaries not defined in them.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step

## When to Split Work

Split an implementation step if it combines:

- A REST API change and a Socket.io event change in the same step
- Frontend feature work and backend route/service work
- More than one unrelated resource (e.g. `Option` logic and `AvailabilitySlot` logic together)
- Any behavior not clearly defined in `project-overview.md` or `architecture.md`

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing — do not guess and move on

## Protected Files

Do not modify the following unless explicitly instructed:

- Folder structure defined in `architecture.md` — restructuring requires updating that file first, not the other way around
- `tailwind.config` design tokens once `ui-context.md` is drafted — tokens are the single source of truth for styling
- `.env` files, `package-lock.json`, any generated/build output

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- System architecture or folder boundaries → `architecture.md`
- Storage model or Mongoose schema fields → `architecture.md`
- New or changed Socket.io event contracts → `architecture.md`
- Code conventions or standards → `code-standards.md`
- Feature scope → `project-overview.md`

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. For any real-time feature, behavior was verified across two connected clients, not just one
4. `progress-tracker.md` reflects the completed work
5. `npm run build` passes on both frontend and backend
