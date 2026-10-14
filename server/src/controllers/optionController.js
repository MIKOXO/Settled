import { catchAsync } from '../utils/catchAsync.js';
import { ok } from '../utils/respond.js';
import { serializeOptionSummary } from '../utils/serialize.js';
import { createOptionSchema, updateOptionSchema } from '../validators/option.js';
import * as optionService from '../services/optionService.js';

export const createOption = catchAsync(async (req, res) => {
  const input = createOptionSchema.parse(req.body);
  const option = await optionService.createOption(req.participant.id, req.board, input);
  return ok(res, { option: serializeOptionSummary(option) }, 201);
});

export const storeOptionPhoto = catchAsync(async (req, res) => {
  const option = await optionService.attachPhoto(
    req.params.id,
    req.file.buffer,
    req.file.mimetype,
    req.fileExtension,
  );
  return ok(res, { option: serializeOptionSummary(option) });
});

export const updateOption = catchAsync(async (req, res) => {
  const patch = updateOptionSchema.parse(req.body);
  const option = await optionService.updateOption(req.params.id, patch);
  return ok(res, { option: serializeOptionSummary(option) });
});

export const deleteOption = catchAsync(async (req, res) => {
  await optionService.deleteOption(req.params.id);
  return ok(res);
});

export const listOptionsByBoard = catchAsync(async (req, res) =>
  ok(res, { options: await optionService.listOptionsByBoard(req.params.boardId, req.participant.id) }));