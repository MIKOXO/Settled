import { Router } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';

import { createAppError } from '../utils/AppError.js';
import { requireAuth, requireOwner } from '../middleware/auth.js';
import { requireOptionBoardMembership } from '../middleware/requireOptionBoardMembership.js';
import { requireCanCreateOption } from '../middleware/requireCanCreateOption.js';
import { requireCanAttachPhoto } from '../middleware/requireCanAttachPhoto.js';
import { resolvePhotoExtension } from '../middleware/resolvePhotoExtension.js';
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

router.get('/boards/:boardId/options', requireAuth, validateBoardId, optionController.listOptionsByBoard);
router.post('/boards/:boardId/options', requireAuth, validateBoardId, requireCanCreateOption, optionController.createOption);
router.post('/options/:id/photo', requireAuth, validateOptionId, requireOptionBoardMembership, requireCanAttachPhoto, upload.single('photo'), resolvePhotoExtension, optionController.storeOptionPhoto);
router.patch('/options/:id', requireAuth, requireOwner, validateOptionId, optionController.updateOption);
router.delete('/options/:id', requireAuth, requireOwner, validateOptionId, optionController.deleteOption);

export default router;