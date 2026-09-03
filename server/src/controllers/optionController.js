import { catchAsync } from '../utils/catchAsync.js';
import { createOptionSchema, updateOptionSchema } from '../validators/option.js';
import * as optionService from '../services/optionService.js';

const optionData = (option) => ({
  id: option._id,
  boardId: option.boardId,
  createdBy: option.createdBy,
  title: option.title,
  notes: option.notes ?? null,
  link: option.link ?? null,
  photoKey: option.photoKey ?? null,
  locationId: option.locationId ?? null,
  likesCount: option.likesCount,
  dislikesCount: option.dislikesCount,
  createdAt: option.createdAt,
  updatedAt: option.updatedAt,
});

export const createOption = catchAsync(async (req, res) => {
  const input = createOptionSchema.parse(req.body);
  const option = await optionService.createOption(req.participant.id, req.board, input);
  res.status(201).json({
    success: true,
    data: { option: optionData(option) },
    error: null,
  });
});

export const storeOptionPhoto = catchAsync(async (req, res) => {
  const option = await optionService.attachPhoto(req.params.id, req.file.buffer, req.file.mimetype, req.fileExtension);
  res.status(200).json({
    success: true,
    data: { option: optionData(option) },
    error: null,
  });
});

export const updateOption = catchAsync(async (req, res) => {
  const patch = updateOptionSchema.parse(req.body);
  const option = await optionService.updateOption(req.params.id, patch);
  res.status(200).json({
    success: true,
    data: { option: optionData(option) },
    error: null,
  });
});

export const deleteOption = catchAsync(async (req, res) => {
  await optionService.deleteOption(req.params.id);
  res.status(200).json({
    success: true,
    data: null,
    error: null,
  });
});

export const listOptionsByBoard = catchAsync(async (req, res) => {
  const options = await optionService.listOptionsByBoard(req.params.boardId, req.participant.id);
  res.status(200).json({
    success: true,
    data: { options },
    error: null,
  });
});
