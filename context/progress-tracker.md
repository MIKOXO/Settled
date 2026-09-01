# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase

- TBD

## Current Goal

- TBD

## Completed

- None yet

## In Progress

- None yet

## Next Up

- TBD

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

## Session Notes

- None yet
