import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { requireEnv, type ServerEnv } from '@/lib/env';
import { base64UrlDecode, base64UrlEncode, hmac, randomToken, safeEqualHmac } from './crypto';
import { parseCookieHeader, serializeCookie } from './cookies';

export const SESSION_COOKIE = 'vt_session';
export const OAUTH_STATE_COOKIE = 'vt_oauth_state';
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
const CSRF_CONTEXT = 'logout';

export type SessionUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export type AppSession = {
  sid: string;
  user: SessionUser;
  guildId: string;
  isAdmin: boolean;
  issuedAt: number;
  expiresAt: number;
};

export async function createSessionCookie(
  user: SessionUser,
  guildId: string,
  isAdmin: boolean,
  env: ServerEnv,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const session: AppSession = {
    sid: randomToken(24),
    user,
    guildId,
    isAdmin,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS,
  };
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = await hmac(payload, env.sessionSecret);
  return `${payload}.${signature}`;
}

export async function readSessionFromRequest(
  request: Request,
): Promise<AppSession | null> {
  const env = requireEnv();
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  return verifySessionCookie(cookies.get(SESSION_COOKIE), env.sessionSecret);
}

export async function getCurrentSession(): Promise<AppSession | null> {
  let env: ServerEnv;
  try {
    env = requireEnv();
  } catch {
    return null;
  }
  const requestHeaders = await headers();
  const cookies = parseCookieHeader(requestHeaders.get('cookie'));
  return verifySessionCookie(cookies.get(SESSION_COOKIE), env.sessionSecret);
}

export async function requireAdminSession(): Promise<AppSession> {
  const session = await getCurrentSession();
  if (!session) redirect('/');
  if (!session.isAdmin) redirect('/access-denied');
  return session;
}

export async function makeCsrfToken(session: AppSession): Promise<string> {
  const env = requireEnv();
  const value = `${session.sid}.${CSRF_CONTEXT}.${session.expiresAt}`;
  const signature = await hmac(value, env.sessionSecret);
  return `${value}.${signature}`;
}

export async function verifyCsrfToken(
  token: string | null,
  session: AppSession | null,
): Promise<boolean> {
  if (!token || !session) return false;
  const env = requireEnv();
  const [sid, context, expiresAt, signature] = token.split('.');
  if (
    !sid ||
    !context ||
    !expiresAt ||
    !signature ||
    sid !== session.sid ||
    context !== CSRF_CONTEXT ||
    expiresAt !== String(session.expiresAt)
  ) {
    return false;
  }

  return safeEqualHmac(`${sid}.${context}.${expiresAt}`, signature, env.sessionSecret);
}

export function sessionSetCookie(value: string, env: ServerEnv): string {
  return serializeCookie(SESSION_COOKIE, value, {
    httpOnly: true,
    maxAge: SESSION_TTL_SECONDS,
    sameSite: 'Lax',
    secure: env.nodeEnv === 'production',
  });
}

export function clearSessionCookie(env: ServerEnv): string {
  return serializeCookie(SESSION_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    sameSite: 'Lax',
    secure: env.nodeEnv === 'production',
  });
}

export async function createOAuthStateCookie(env: ServerEnv): Promise<{
  state: string;
  cookie: string;
}> {
  const state = randomToken(32);
  const issuedAt = Math.floor(Date.now() / 1000);
  const value = `${state}.${issuedAt}`;
  const signature = await hmac(value, env.sessionSecret);
  return {
    state,
    cookie: serializeCookie(OAUTH_STATE_COOKIE, `${value}.${signature}`, {
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: 'Lax',
      secure: env.nodeEnv === 'production',
    }),
  };
}

export async function verifyOAuthState(
  request: Request,
  state: string | null,
  env: ServerEnv,
): Promise<boolean> {
  if (!state) return false;
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const cookieValue = cookies.get(OAUTH_STATE_COOKIE);
  if (!cookieValue) return false;
  const [storedState, issuedAt, signature] = cookieValue.split('.');
  if (!storedState || !issuedAt || !signature || storedState !== state) {
    return false;
  }
  const issuedAtNumber = Number(issuedAt);
  if (!Number.isFinite(issuedAtNumber)) return false;
  if (Math.floor(Date.now() / 1000) - issuedAtNumber > 60 * 10) return false;
  return safeEqualHmac(`${storedState}.${issuedAt}`, signature, env.sessionSecret);
}

export function clearOAuthStateCookie(env: ServerEnv): string {
  return serializeCookie(OAUTH_STATE_COOKIE, '', {
    httpOnly: true,
    maxAge: 0,
    sameSite: 'Lax',
    secure: env.nodeEnv === 'production',
  });
}

async function verifySessionCookie(
  cookieValue: string | undefined,
  secret: string,
): Promise<AppSession | null> {
  if (!cookieValue) return null;
  const [payload, signature] = cookieValue.split('.');
  if (!payload || !signature) return null;
  if (!(await safeEqualHmac(payload, signature, secret))) return null;

  const decoded = base64UrlDecode(payload);
  if (!decoded) return null;

  try {
    const session = JSON.parse(decoded) as AppSession;
    if (!isSession(session)) return null;
    if (session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session;
  } catch {
    return null;
  }
}

function isSession(value: AppSession): value is AppSession {
  return (
    typeof value?.sid === 'string' &&
    typeof value.user?.id === 'string' &&
    typeof value.user?.username === 'string' &&
    (typeof value.user.displayName === 'string' || value.user.displayName === null) &&
    (typeof value.user.avatarUrl === 'string' || value.user.avatarUrl === null) &&
    typeof value.guildId === 'string' &&
    typeof value.isAdmin === 'boolean' &&
    typeof value.issuedAt === 'number' &&
    typeof value.expiresAt === 'number'
  );
}
