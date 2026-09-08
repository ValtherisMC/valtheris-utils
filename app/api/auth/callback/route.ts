import { NextResponse } from 'next/server';
import {
  exchangeCodeForToken,
  getDiscordUser,
  verifyDiscordAdministrator,
} from '@/lib/auth/discord';
import { getClientIp, rateLimit } from '@/lib/auth/rate-limit';
import {
  clearOAuthStateCookie,
  createSessionCookie,
  sessionSetCookie,
  verifyOAuthState,
} from '@/lib/auth/session';
import { getEnvStatus } from '@/lib/env';

export async function GET(request: Request) {
  const limited = rateLimit(`callback:${getClientIp(request)}`, 20, 60_000);
  if (!limited.allowed) {
    return new Response('Too many authentication attempts.', {
      status: 429,
      headers: { 'retry-after': String(limited.retryAfter) },
    });
  }

  const status = getEnvStatus();
  if (!status.ok) {
    return NextResponse.redirect(new URL('/?setup=missing', request.url));
  }

  const env = status.env;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const clearState = clearOAuthStateCookie(env);
  if (!code || !(await verifyOAuthState(request, state, env))) {
    const response = NextResponse.redirect(new URL('/?auth=state', request.url));
    response.headers.append('set-cookie', clearState);
    return response;
  }

  try {
    const token = await exchangeCodeForToken(code, env);
    const [user, isAdmin] = await Promise.all([
      getDiscordUser(token.access_token),
      verifyDiscordAdministrator(token.access_token, env.discordGuildId),
    ]);
    const sessionCookieValue = await createSessionCookie(
      user,
      env.discordGuildId,
      isAdmin,
      env,
    );
    const response = NextResponse.redirect(
      new URL(isAdmin ? '/dashboard' : '/access-denied', request.url),
    );
    response.headers.append('set-cookie', clearState);
    response.headers.append('set-cookie', sessionSetCookie(sessionCookieValue, env));
    return response;
  } catch {
    const response = NextResponse.redirect(new URL('/?auth=discord', request.url));
    response.headers.append('set-cookie', clearState);
    return response;
  }
}
