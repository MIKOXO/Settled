import { Vote } from '../models/Vote.js';
import { Option } from '../models/Option.js';
import { createAppError } from '../utils/AppError.js';
import { emitVoteUpdated } from '../sockets/voteEmitter.js';

export const castVote = async (participantId, optionId, value) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  const existing = await Vote.findOne({ optionId, participantId });

  if (existing) {
    if (existing.value === value) {
      return { vote: existing, option };
    }

    await Vote.findByIdAndUpdate(existing._id, { value }, { runValidators: true });
    await Option.findByIdAndUpdate(optionId, {
      $inc: {
        likesCount: value === 'like' ? 1 : -1,
        dislikesCount: value === 'dislike' ? 1 : -1,
      },
    });
  } else {
    await Vote.create({ optionId, participantId, value });
    await Option.findByIdAndUpdate(optionId, {
      $inc: {
        likesCount: value === 'like' ? 1 : 0,
        dislikesCount: value === 'dislike' ? 1 : 0,
      },
    });
  }

  const updatedOption = await Option.findById(optionId);
  const vote = await Vote.findOne({ optionId, participantId });

  const leadingOptionIds = await findLeadingOptionIds(updatedOption.boardId);
  emitVoteUpdated(updatedOption.boardId, {
    optionId: updatedOption._id,
    likesCount: updatedOption.likesCount,
    dislikesCount: updatedOption.dislikesCount,
    score: updatedOption.likesCount - updatedOption.dislikesCount,
    leadingOptionIds,
  });

  return { vote, option: updatedOption };
};

export const removeVote = async (participantId, optionId) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }

  const vote = await Vote.findOneAndDelete({ optionId, participantId });

  if (vote) {
    await Option.findByIdAndUpdate(optionId, {
      $inc: {
        likesCount: vote.value === 'like' ? -1 : 0,
        dislikesCount: vote.value === 'dislike' ? -1 : 0,
      },
    });
  }

  const updatedOption = await Option.findById(optionId);

  if (vote) {
    const leadingOptionIds = await findLeadingOptionIds(updatedOption.boardId);
    emitVoteUpdated(updatedOption.boardId, {
      optionId: updatedOption._id,
      likesCount: updatedOption.likesCount,
      dislikesCount: updatedOption.dislikesCount,
      score: updatedOption.likesCount - updatedOption.dislikesCount,
      leadingOptionIds,
    });
  }

  return { option: updatedOption };
};

export const findLeadingOptionIds = async (boardId) => {
  const options = await Option.find({ boardId }).select('_id likesCount dislikesCount');

  if (options.length === 0) return [];

  let maxScore = -Infinity;

  for (const opt of options) {
    const score = opt.likesCount - opt.dislikesCount;
    if (score > maxScore) maxScore = score;
  }

  return options
    .filter((opt) => opt.likesCount - opt.dislikesCount === maxScore)
    .map((opt) => opt._id.toString());
};
