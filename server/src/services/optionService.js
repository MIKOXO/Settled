import { Option } from '../models/Option.js';
import { Location } from '../models/Location.js';
import { Vote } from '../models/Vote.js';
import { Comment } from '../models/Comment.js';
import { createAppError } from '../utils/AppError.js';
import { uploadToB2 } from '../utils/b2.js';
import { assertBoardOpen } from '../utils/boardGuard.js';
import { serializeOption } from '../utils/serialize.js';
import { pickDefined } from '../utils/pickDefined.js';
import { findLeadingOptionIds } from './voteService.js';
import {
  emitOptionCreated,
  emitOptionUpdated,
  emitOptionDeleted,
} from '../sockets/optionEmitter.js';

const getOptionOr404 = async (optionId) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }
  return option;
};

const saveOptionLocation = async (option, location) => {
  if (!option.locationId) {
    const created = await Location.create({
      ...location,
      optionId: option._id,
      addedBy: option.createdBy,
    });
    return created._id;
  }

  await Location.findByIdAndUpdate(option.locationId, location, { runValidators: true });
  return option.locationId;
};

export const createOption = async (participantId, board, input) => {
  assertBoardOpen(board);

  const option = await Option.create({
    boardId: board._id,
    createdBy: participantId,
    title: input.title,
    notes: input.notes,
    link: input.link,
  });

  if (input.location) {
    option.locationId = await saveOptionLocation(option, input.location);
    await option.save();
  }

  // Announced only after the write lands, so the socket reports confirmed state
  // rather than intent (invariant 5).
  emitOptionCreated(option, await findLeadingOptionIds(board._id));

  return option;
};

export const listOptionsByBoard = async (boardId, participantId) => {
  const options = await Option.find({ boardId })
    .populate('locationId')
    .sort({ createdAt: -1 });

  const [votes, leadingIds] = await Promise.all([
    participantId
      ? Vote.find({ optionId: { $in: options.map((o) => o._id) }, participantId })
      : [],
    findLeadingOptionIds(boardId),
  ]);

  const voteMap = new Map(votes.map((vote) => [vote.optionId.toString(), vote.value]));

  return Promise.all(
    options.map((option) =>
      serializeOption(option, {
        leadingIds,
        vote: voteMap.get(option._id.toString()) ?? null,
      }),
    ),
  );
};

export const attachPhoto = async (optionId, buffer, contentType, extension) => {
  const option = await getOptionOr404(optionId);

  const key = `options/${optionId}/photo.${extension}`;
  await uploadToB2(buffer, key, contentType);

  option.photoKey = key;
  await option.save();

  emitOptionUpdated(option, await findLeadingOptionIds(option.boardId));

  return option;
};

// Detaches the photo without touching storage — the B2 object is left orphaned,
// the same MVP tradeoff as re-uploads overwriting the one key. Clients see the
// clear through the ordinary `option:updated` broadcast, so removing a photo
// needs no event of its own.
export const removePhoto = async (optionId) => {
  const option = await getOptionOr404(optionId);

  option.photoKey = null;
  await option.save();

  emitOptionUpdated(option, await findLeadingOptionIds(option.boardId));

  return option;
};

export const updateOption = async (optionId, patch) => {
  const option = await getOptionOr404(optionId);
  const { location, ...fields } = patch;

  Object.assign(option, pickDefined(fields));

  if (location === null) {
    if (option.locationId) {
      await Location.findByIdAndDelete(option.locationId);
      option.locationId = null;
    }
  } else if (location) {
    option.locationId = await saveOptionLocation(option, location);
  }

  await option.save();

  emitOptionUpdated(option, await findLeadingOptionIds(option.boardId));

  return option;
};

export const deleteOption = async (optionId) => {
  const option = await getOptionOr404(optionId);

  // Dependents go first: a vote or comment outliving its option is an orphan
  // nothing can render, aggregate, or clean up. Contrast removeParticipant,
  // which deliberately keeps a removed member's votes and comments as history.
  await Promise.all([
    option.locationId ? Location.findByIdAndDelete(option.locationId) : null,
    Vote.deleteMany({ optionId: option._id }),
    Comment.deleteMany({ optionId: option._id }),
  ]);

  await Option.deleteOne({ _id: option._id });

  emitOptionDeleted(option);

  return option;
};