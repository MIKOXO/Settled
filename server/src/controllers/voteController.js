import { catchAsync } from '../utils/catchAsync.js';
import { voteSchema } from '../validators/vote.js';
import * as voteService from '../services/voteService.js';

export const castVote = catchAsync(async (req, res) => {
  const input = voteSchema.parse(req.body);
  const result = await voteService.castVote(req.participant.id, req.params.id, input.value);
  res.status(200).json({
    success: true,
    data: {
      vote: {
        id: result.vote._id,
        optionId: result.vote.optionId,
        participantId: result.vote.participantId,
        value: result.vote.value,
        createdAt: result.vote.createdAt,
        updatedAt: result.vote.updatedAt,
      },
      option: {
        id: result.option._id,
        likesCount: result.option.likesCount,
        dislikesCount: result.option.dislikesCount,
        score: result.option.likesCount - result.option.dislikesCount,
      },
    },
    error: null,
  });
});

export const removeVote = catchAsync(async (req, res) => {
  const result = await voteService.removeVote(req.participant.id, req.params.id);
  res.status(200).json({
    success: true,
    data: {
      option: {
        id: result.option._id,
        likesCount: result.option.likesCount,
        dislikesCount: result.option.dislikesCount,
        score: result.option.likesCount - result.option.dislikesCount,
      },
    },
    error: null,
  });
});
