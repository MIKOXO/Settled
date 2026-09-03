import { createAppError } from '../utils/AppError.js';

const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const resolvePhotoExtension = (req, _res, next) => {
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