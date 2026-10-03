import { Option } from '../models/Option.js';
import { Location } from '../models/Location.js';
import { Vote } from '../models/Vote.js';
import { Comment } from '../models/Comment.js';
import { uploadToB2, getSignedPhotoUrl } from '../utils/b2.js';
import { createAppError } from '../utils/AppError.js';
import { assertBoardOpen } from '../utils/boardGuard.js';
import { findLeadingOptionIds } from './voteService.js';

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
    const location = await Location.create({
      optionId: option._id,
      lat: input.location.lat,
      lng: input.location.lng,
      placeName: input.location.placeName,
      placeSource: input.location.placeSource,
      addedBy: participantId,
    });

    option.locationId = location._id;
    await option.save();
  }

  return option;
};

export const listOptionsByBoard = async (boardId, participantId) => {
  const options = await Option.find({ boardId })
    .populate('locationId')
    .sort({ createdAt: -1 });

  const optionIds = options.map((o) => o._id);

  const [votes, leadingIds] = await Promise.all([
    participantId
      ? Vote.find({ optionId: { $in: optionIds }, participantId })
      : Promise.resolve([]),
    findLeadingOptionIds(boardId),
  ]);

  const voteMap = new Map(votes.map((v) => [v.optionId.toString(), v.value]));
  const leadingSet = new Set(leadingIds);

  return Promise.all(
    options.map(async (option) => {
      const photoUrl = option.photoKey ? await getSignedPhotoUrl(option.photoKey) : null;
      const score = option.likesCount - option.dislikesCount;
      return {
        id: option._id,
        boardId: option.boardId,
        createdBy: option.createdBy,
        title: option.title,
        notes: option.notes ?? null,
        link: option.link ?? null,
        photoKey: option.photoKey ?? null,
        locationId: option.locationId?._id ?? null,
        likesCount: option.likesCount,
        dislikesCount: option.dislikesCount,
        commentCount: option.commentCount,
        score,
        isLeading: leadingSet.has(option._id.toString()),
        vote: voteMap.get(option._id.toString()) ?? null,
        createdAt: option.createdAt,
        updatedAt: option.updatedAt,
        photoUrl,
        location: option.locationId ?? null,
      };
    }),
  );
};

export const attachPhoto = async (optionId, buffer, contentType, extension) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  const key = `options/${optionId}/photo.${extension}`;
  await uploadToB2(buffer, key, contentType);

  option.photoKey = key;
  await option.save();

  return option;
};

export const updateOption = async (optionId, patch) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  if (patch.title !== undefined) option.title = patch.title;

  if (patch.notes !== undefined) option.notes = patch.notes;

  if (patch.link !== undefined) option.link = patch.link;

  if (patch.location !== undefined) {
    if (patch.location === null) {
      if (option.locationId) {
        await Location.findByIdAndDelete(option.locationId);
        option.locationId = null;
      }
    } else {
      if (option.locationId) {
        await Location.findByIdAndUpdate(
          option.locationId,
          {
            lat: patch.location.lat,
            lng: patch.location.lng,
            placeName: patch.location.placeName,
            placeSource: patch.location.placeSource,
          },
          { runValidators: true },
        );
      } else {
        const location = await Location.create({
          optionId: option._id,
          lat: patch.location.lat,
          lng: patch.location.lng,
          placeName: patch.location.placeName,
          placeSource: patch.location.placeSource,
          addedBy: option.createdBy,
        });
        option.locationId = location._id;
      }
    }
  }

  await option.save();

  return option;
};

export const deleteOption = async (optionId) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  // Dependents go first. A vote or comment that outlives its option is an
  // orphan nothing can render, aggregate, or ever clean up — and deleting the
  // option first would open a window where it is gone but they aren't. Ordering
  // it this way is the only way to keep a failed child delete from taking the
  // option with it.
  //
  // Contrast with removeParticipant, which deliberately keeps a removed
  // participant's votes and comments as history: there the records still mean
  // something, here the thing they describe is gone.
  await Promise.all([
    option.locationId ? Location.findByIdAndDelete(option.locationId) : null,
    Vote.deleteMany({ optionId: option._id }),
    Comment.deleteMany({ optionId: option._id }),
  ]);

  await Option.deleteOne({ _id: option._id });

  return option;
};
