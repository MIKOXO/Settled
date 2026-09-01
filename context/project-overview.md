# Settled

## Overview

Settled is a shared decision board for groups deciding on an activity — a trip, dinner, event, or anything generic. Participants propose options, vote on them in real time, mark availability, and drop location pins on a shared map, until an owner locks in a final decision. It replaces the usual group-chat mess of buried messages, no structured voting, and no single source of truth once something is (maybe) decided.

## Goals

1. Get a group from "we should decide something" to a locked decision with zero signup friction for participants.
2. Make the decision-making process itself visible and live — votes, comments, and availability update for everyone instantly.
3. Ship a working MVP demonstrating real-time collaborative UX, not a portfolio CRUD app.

## Core User Flow

1. Creator opens Settled, names a board (with optional type: Trip/Dinner/Event/Custom), provides email, gets an invite link.
2. Participant opens invite link, joins with display name + email (required, unverified).
3. Participant proposes an option (title, notes, optional link/photo, optional map location) or votes/comments on existing ones.
4. Participant optionally marks availability on the date grid and/or drops their own location pin (opt-in, exact once shared).
5. Votes, comments, and availability update live for all participants as they happen.
6. Owner locks in the final decision once enough signal has come in.

## Features

### Boards

- Create board with name + type
- Owner-only settings, decision lock-in, remove options/participants
- Shareable invite link (no expiry/revocation in MVP)

### Options & Voting

- Any participant (or owner-only, per setting) proposes an option
- One reaction per participant per option: like or dislike, changeable anytime
- Score = likes − dislikes; leading option highlighted live
- Owner can edit any option's details (title, notes, link, location) after creation — e.g. to incorporate thread feedback

### Date Polling

- Availability grid per proposed date
- Live aggregate of who's free when

### Map

- Location options shown as pins on a shared interactive map
- Place search + manual pin drop (via Nominatim/OpenStreetMap)
- Opt-in personal location pin, displayed exact to all board participants once shared

### Threads

- Per-option comment thread, live updates, visible comment count on the card

### Real-Time Sync

- Votes, options, comments, and availability propagate to all clients without refresh (~1s target)

## Scope

### In Scope

- Single activity-agnostic board type
- Real-time voting, threads, availability grid, interactive map
- Guest join with required (unverified) email; verified magic-link recovery
- Owner-only decision lock-in
- Web app, mobile-first responsive

### Out of Scope

- Native mobile apps
- OAuth / full account system
- Calendar sync (Google/Apple)
- Expense splitting / payments
- Ranked-choice voting, checklists, recap cards, saved "regulars" groups
- Multi-board dashboard for registered users
- Push/email notifications beyond magic-link recovery
- Invite link expiry/revocation

## Functional Requirements

**Board management**

- FR1: Create board with name + optional type (Trip/Dinner/Event/Custom)
- FR2: Creator must provide email; system sends a magic recovery link
- FR3: System generates a shareable invite link per board
- FR4: Owner can edit settings, lock a decision, remove options/participants
- FR5: Owner can edit any option's details (title, notes, link, location) after creation
- FR6: Any participant can claim ownership if the current owner has been inactive past the threshold and the board is still undecided

**Joining**

- FR7: Join via invite link with display name and email — email is required for every participant, but unverified
- FR8: Email is used to send a magic recovery link, same as the owner flow
- FR9: Returning users recognized automatically on the same device/session

**Options & voting**

- FR10: Any participant (or owner-only, per setting) can propose an option: title, notes, link/photo, optional location
- FR11: Each participant casts one reaction per option — like or dislike — changeable at any time
- FR12: Score per option = likes − dislikes; updates in real time for all participants
- FR13: Leading option highlighted live once it has the highest score
- FR14: Owner manually locks in the final decision

**Date polling**

- FR15: Mark availability on a calendar grid per proposed date
- FR16: Aggregate "who's free when" updates live

**Map**

- FR17: Location options display as pins on a shared, interactive map
- FR18: Participants can opt in to share their own location; once shared, it displays as an exact pin to all board participants
- FR19: Map supports place search (via Nominatim), not just manual pin drop

**Threads**

- FR20: Each option has its own discussion thread
- FR21: New comments appear live for all participants
- FR22: Comment count visible on the option card without opening the thread

**Real-time sync**

- FR23: Votes, options, comments, availability, and ownership changes propagate live without refresh

## Non-Functional Requirements

- NFR1: Updates reflect on other clients within ~1 second under normal network conditions
- NFR2: A board with ~50 participants, ~30 options, and active threads stays responsive
- NFR3: Join-to-first-vote achievable within 3 taps/clicks from the invite link
- NFR4: Fully usable on mobile viewport widths (primary context)
- NFR5: Board data persists reliably even if a participant loses their session/device
- NFR6: Magic-link recovery works cross-device/browser for both owner and participants
- NFR7: Participant emails are never exposed to other participants
- NFR8: Board access is restricted to invite-link holders — accepted as obscurity, not hardened access control; no link expiry/revocation in MVP
- NFR9: Backend supports multiple concurrent boards with isolated real-time channels (one Socket.io room per board)
- NFR10: The data model should reasonably accommodate future features (e.g. expenses), but the current Vote model is not guaranteed to extend to ranked-choice without a rework

## Use Cases

- UC1 — Create board (creator provides name/type + email, gets an invite link)
- UC2 — Join board (participant enters display name + email)
- UC3 — Propose an option
- UC4 — Pick a location on the map (own location shown exact once opted in, tap/search to attach a spot to an option)
- UC5 — Vote on an option
- UC6 — Comment on an option (thread)
- UC7 — Mark availability
- UC8 — View aggregated map (all option pins + opted-in participant pins)
- UC9 — Edit an option (owner)
- UC10 — Lock in decision (owner)
- UC11 — Recover access via magic link
- UC12 — Claim ownership after owner inactivity
- UC13 — Manage board (owner: remove option/participant, change settings)

## Success Criteria

1. A creator can open a board, get an invite link, and a second participant can join and vote within 3 clicks of opening that link.
2. Two participants voting simultaneously each see the other's vote reflected within ~1 second, no refresh.
3. A participant can drop a location pin and every other participant sees the exact same coordinates.
4. An owner can edit an option's details and the change reflects live for every participant.
5. An owner can lock a decision and it's reflected as final for every participant on the board.
6. If the owner goes inactive past the abandonment threshold, another participant can claim ownership and lock the decision.
