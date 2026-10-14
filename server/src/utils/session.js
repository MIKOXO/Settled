export const SESSION_COOKIE = 'session';

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: MAX_AGE_MS,
  });
};

export const readSessionToken = (req) => req.cookies?.[SESSION_COOKIE] ?? null;