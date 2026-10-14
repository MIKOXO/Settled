import { Router } from 'express';
import multer from 'multer';

import { validateObjectId } from '../middleware/validateObjectId.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOptionBoardMembership } from '../middleware/requireOptionBoardMembership.js';
import { requireCanCreateOption } from '../middleware/requireCanCreateOption.js';
import { requireCanAttachPhoto } from '../middleware/requireCanAttachPhoto.js';
import { requireCanManageOption } from '../middleware/requireCanManageOption.js';
import { resolvePhotoExtension } from '../middleware/resolvePhotoExtension.js';
import * as optionController from '../controllers/optionController.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

const boardId = validateObjectId('boardId', 'board id');
const optionId = validateObjectId('id', 'option id');

router.get('/boards/:boardId/options', requireAuth, boardId, optionController.listOptionsByBoard);
router.post(
  '/boards/:boardId/options',
  requireAuth,
  boardId,
  requireCanCreateOption,
  optionController.createOption,
);
router.post(
  '/options/:id/photo',
  requireAuth,
  optionId,
  requireOptionBoardMembership,
  requireCanAttachPhoto,
  upload.single('photo'),
  resolvePhotoExtension,
  optionController.storeOptionPhoto,
);
router.patch(
  '/options/:id',
  requireAuth,
  optionId,
  requireOptionBoardMembership,
  requireCanManageOption,
  optionController.updateOption,
);
router.delete(
  '/options/:id',
  requireAuth,
  optionId,
  requireOptionBoardMembership,
  requireCanManageOption,
  optionController.deleteOption,
);

export default router;