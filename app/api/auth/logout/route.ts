import { NextResponse } from 'next/server';
import { clearSessionCookie, readSessionFromRequest, verifyCsrfToken } from '@/lib/auth/session';
import { requireEnv } from '@/lib/env';

export async function POST(request: Request) {
  const env = requireEnv();
  const session = await readSessionFromRequest(request);
  const form = await request.formData();
  const csrf = form.get('csrf');

  if (session && !(await verifyCsrfToken(typeof csrf === 'string' ? csrf : null, session))) {
    return new Response('Invalid logout request.', { status: 403 });
  }

  const response = NextResponse.redirect(new URL('/', request.url));
  response.headers.append('set-cookie', clearSessionCookie(env));
  return response;
}
