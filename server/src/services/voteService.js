import { Vote } from '../models/Vote.js';
import { Option } from '../models/Option.js';
import { createAppError } from '../utils/AppError.js';
import { assertOptionBoardOpen } from '../utils/boardGuard.js';
import { emitVoteUpdated } from '../sockets/voteEmitter.js';

const scoreOf = (option) => option.likesCount - option.dislikesCount;

const getOptionOr404 = async (optionId) => {
  const option = await Option.findById(optionId);
  if (!option) {
    throw createAppError('Option not found', 404);
  }
  return option;
};

const bumpCounts = (optionId, delta) =>
  Option.findByIdAndUpdate(optionId, {
    $inc: { likesCount: delta.likes ?? 0, dislikesCount: delta.dislikes ?? 0 },
  });

const broadcast = async (option) => {
  const leadingOptionIds = await findLeadingOptionIds(option.boardId);
  emitVoteUpdated(option.boardId, {
    optionId: option._id,
    likesCount: option.likesCount,
    dislikesCount: option.dislikesCount,
    score: scoreOf(option),
    leadingOptionIds,
  });
};

export const castVote = async (participantId, optionId, value) => {
  const option = await getOptionOr404(optionId);
  await assertOptionBoardOpen(option);

  const existing = await Vote.findOne({ optionId, participantId });

  if (existing && existing.value === value) {
    return { vote: existing, option };
  }

  // Reaction counts move atomically: a flip has to decrement the old side and
  // increment the new one in the same write.
  if (existing) {
    await Vote.findByIdAndUpdate(existing._id, { value }, { runValidators: true });
    await bumpCounts(optionId, {
      likes: value === 'like' ? 1 : -1,
      dislikes: value === 'dislike' ? 1 : -1,
    });
  } else {
    await Vote.create({ optionId, participantId, value });
    await bumpCounts(optionId, {
      likes: value === 'like' ? 1 : 0,
      dislikes: value === 'dislike' ? 1 : 0,
    });
  }

  const updatedOption = await getOptionOr404(optionId);
  const vote = await Vote.findOne({ optionId, participantId });

  await broadcast(updatedOption);

  return { vote, option: updatedOption };
};

export const removeVote = async (participantId, optionId) => {
  const option = await getOptionOr404(optionId);
  await assertOptionBoardOpen(option);

  const vote = await Vote.findOneAndDelete({ optionId, participantId });

  if (vote) {
    await bumpCounts(optionId, {
      likes: vote.value === 'like' ? -1 : 0,
      dislikes: vote.value === 'dislike' ? -1 : 0,
    });
  }

  const updatedOption = await getOptionOr404(optionId);

  if (vote) {
    await broadcast(updatedOption);
  }

  return { option: updatedOption };
};

// Ties all count as leading for MVP — there is no tie-break rule yet.
export const findLeadingOptionIds = async (boardId) => {
  const options = await Option.find({ boardId }).select('_id likesCount dislikesCount');
  if (options.length === 0) return [];

  const maxScore = options.reduce((max, option) => Math.max(max, scoreOf(option)), -Infinity);

  return options.filter((option) => scoreOf(option) === maxScore).map((option) => option._id.toString());
};