import { NextResponse } from 'next/server';
import { discordAuthorizeUrl } from '@/lib/auth/discord';
import { createOAuthStateCookie } from '@/lib/auth/session';
import { getClientIp, rateLimit } from '@/lib/auth/rate-limit';
import { getEnvStatus } from '@/lib/env';

export async function GET(request: Request) {
  const limited = rateLimit(`login:${getClientIp(request)}`, 12, 60_000);
  if (!limited.allowed) {
    return new Response('Too many login attempts.', {
      status: 429,
      headers: { 'retry-after': String(limited.retryAfter) },
    });
  }

  const status = getEnvStatus();
  if (!status.ok) {
    return NextResponse.redirect(new URL('/?setup=missing', request.url));
  }

  const env = status.env;
  const { state, cookie } = await createOAuthStateCookie(env);
  const response = NextResponse.redirect(discordAuthorizeUrl(env, state));
  response.headers.append('set-cookie', cookie);
  return response;
}
