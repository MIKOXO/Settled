/**
 * Forwards a rejected handler promise to the Express error handler. Keeps the
 * wrapped function's name so route stacks and stack traces stay readable.
 */
export const catchAsync = (fn) => {
  const wrapped = async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };

  return Object.defineProperty(wrapped, 'name', {
    value: fn.name || 'catchAsync',
    configurable: true,
  });
};