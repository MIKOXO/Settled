export const ok = (res, data = null, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

export const fail = (res, statusCode, message, extra = {}) =>
  res.status(statusCode).json({
    success: false,
    error: { message, statusCode, ...extra },
  });