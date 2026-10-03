import { createAppError } from '../utils/AppError.js';
import { canManageOption } from '../utils/optionGuard.js';

// Option edit + delete gate. Runs after requireOptionBoardMembership, which has
// already resolved `req.option` (404 on a missing option, 403 for a participant
// who isn't on that option's board) and `requireAuth`, which has attached the
// participant with its role read fresh from the DB — so this is a pure check
// with no extra queries.
export const requireCanManageOption = (req, _res, next) => {
  if (!canManageOption(req.participant, req.option)) {
    return next(
      createAppError('Only the option creator or board owner can edit or remove this option', 403),
    );
  }
  return next();
};