import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import { createAppError } from '../utils/AppError.js';
import { Board } from '../models/Board.js';
import { Participant } from '../models/Participant.js';
import { Option } from '../models/Option.js';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import * as optionController from '../controllers/optionController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const validateBoardId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.boardId)) {
    return next(createAppError('Invalid board id', 400));
  }
  return next();
};

const validateOptionId = (req, _res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(createAppError('Invalid option id', 400));
  }
  return next();
};

const requireCanCreateOption = async (req, _res, next) => {
  try {
    const board = await Board.findById(req.params.boardId);
    if (!board) {
      return next(createAppError('Board not found', 404));
    }

    const participant = await Participant.findOne({ _id: req.participant.id, boardId: board._id });
    if (!participant) {
      return next(createAppError('Participant not found on this board', 403));
    }

    if (board.optionsOwnerOnly && req.participant.role !== 'owner') {
      return next(createAppError('Owner-only board', 403));
    }

    req.board = board;
    return next();
  } catch (err) {
    return next(err);
  }
};

const requireCanAttachPhoto = async (req, _res, next) => {
  try {
    const option = await Option.findById(req.params.id);
    if (!option) {
      return next(createAppError('Option not found', 404));
    }

    const board = await Board.findById(option.boardId);
    if (!board) {
      return next(createAppError('Board not found', 404));
    }

    const isCreator = option.createdBy.toString() === req.participant.id;
    const isOwner = board.ownerId.toString() === req.participant.id;

    if (!isCreator && !isOwner) {
      return next(createAppError('Only the option creator or board owner can attach a photo', 403));
    }

    req.board = board;
    return next();
  } catch (err) {
    return next(err);
  }
};

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const resolvePhotoExtension = (req, res, next) => {
  if (!req.file) {
    return next(createAppError('Photo file required', 400));
  }

  const extension = MIME_EXTENSIONS[req.file.mimetype];
  if (!extension) {
    return next(createAppError('Unsupported image type — use JPEG, PNG, WebP, or GIF', 400));
  }

  req.fileExtension = extension;
  return next();
};

router.get('/boards/:boardId/options', requireAuth, validateBoardId, optionController.listOptionsByBoard);
router.post('/boards/:boardId/options', requireAuth, validateBoardId, requireCanCreateOption, optionController.createOption);
router.post('/options/:id/photo', requireAuth, validateOptionId, requireCanAttachPhoto, upload.single('photo'), resolvePhotoExtension, optionController.storeOptionPhoto);
router.patch('/options/:id', requireAuth, requireOwner, validateOptionId, optionController.updateOption);
router.delete('/options/:id', requireAuth, requireOwner, validateOptionId, optionController.deleteOption);

export default router;
