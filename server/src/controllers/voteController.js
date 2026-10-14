import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import { voteSchema } from '../validators/vote.js';
import * as voteService from '../services/voteService.js';

const scoreData = (option) => ({
  id: option._id,
  likesCount: option.likesCount,
  dislikesCount: option.dislikesCount,
  score: option.likesCount - option.dislikesCount,
});

export const castVote = catchAsync(async (req, res) => {
  const { value } = voteSchema.parse(req.body);
  const result = await voteService.castVote(req.participant.id, req.params.id, value);

  return ok(res, {
    vote: {
      id: result.vote._id,
      optionId: result.vote.optionId,
      participantId: result.vote.participantId,
      value: result.vote.value,
      createdAt: result.vote.createdAt,
      updatedAt: result.vote.updatedAt,
    },
    option: scoreData(result.option),
  });
});

export const removeVote = catchAsync(async (req, res) => {
  const result = await voteService.removeVote(req.participant.id, req.params.id);
  return ok(res, { option: scoreData(result.option) });
});