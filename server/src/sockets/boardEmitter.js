import { emitToBoard } from './io.js';

export const emitBoardDecided = (boardId, payload) =>
  emitToBoard('board:decided', boardId, payload);

// A join is the one roster change nobody in the room asked for, so it has to be
// pushed — everyone already on the board is looking at a roster that just became
// wrong. Roster shape only: this reaches every client on the board, so it must
// never carry the email (NFR7).
export const emitParticipantAdded = (boardId, payload) =>
  emitToBoard('participant:added', boardId, payload);

export const emitParticipantRemoved = (boardId, payload) =>
  emitToBoard('participant:removed', boardId, payload);

// Settings gate what every participant can do, so a change has to reach every
// client. Only patched keys are sent; clients merge the partial into their board.
export const emitBoardUpdated = (boardId, payload) =>
  emitToBoard('board:updated', boardId, payload);