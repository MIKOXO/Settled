import { emitToBoard } from './io.js';
import { serializeOption } from '../utils/serialize.js';

const emitOptionEvent = (event) => async (option, leadingIds) =>
  emitToBoard(event, option.boardId, await serializeOption(option, { leadingIds }));

// `vote` is always null on the wire: it is the only per-participant field on an
// option, and broadcasting the sender's reaction would stamp it onto everyone
// else's card. Clients keep their own reaction until the server re-issues it.
export const emitOptionCreated = emitOptionEvent('option:created');
export const emitOptionUpdated = emitOptionEvent('option:updated');

export const emitOptionDeleted = (option) =>
  emitToBoard('option:deleted', option.boardId, { optionId: option._id });