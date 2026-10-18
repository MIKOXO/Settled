export const SESSION_COOKIE = 'session';

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export const getCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: MAX_AGE_MS,
});

export const setSessionCookie = (res, token) => {
  res.cookie(SESSION_COOKIE, token, getCookieOptions());
};

export const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
};

export const readSessionToken = (req) => req.cookies?.[SESSION_COOKIE] ?? null;