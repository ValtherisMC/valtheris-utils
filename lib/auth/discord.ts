import type { ServerEnv } from '@/lib/env';
import type { SessionUser } from './session';

const DISCORD_API = 'https://discord.com/api/v10';
const ADMINISTRATOR_PERMISSION = 0x8;

type DiscordTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

type DiscordUser = {
  id: string;
  username: string;
  global_name?: string | null;
  avatar?: string | null;
  discriminator?: string;
};

type DiscordGuild = {
  id: string;
  name: string;
  owner?: boolean;
  permissions?: string;
};

export class DiscordAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DiscordAuthError';
  }
}

export function discordAuthorizeUrl(env: ServerEnv, state: string): string {
  const url = new URL('https://discord.com/oauth2/authorize');
  url.searchParams.set('client_id', env.discordClientId);
  url.searchParams.set('redirect_uri', env.discordRedirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'identify guilds');
  url.searchParams.set('state', state);
  url.searchParams.set('prompt', 'consent');
  return url.toString();
}

export async function exchangeCodeForToken(
  code: string,
  env: ServerEnv,
): Promise<DiscordTokenResponse> {
  const body = new URLSearchParams({
    client_id: env.discordClientId,
    client_secret: env.discordClientSecret,
    grant_type: 'authorization_code',
    code,
    redirect_uri: env.discordRedirectUri,
  });

  const response = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    throw new DiscordAuthError('Discord did not accept the authorization code.');
  }

  return response.json() as Promise<DiscordTokenResponse>;
}

export async function getDiscordUser(accessToken: string): Promise<SessionUser> {
  const user = await discordFetch<DiscordUser>('/users/@me', accessToken);

  return {
    id: user.id,
    username: user.username,
    displayName: user.global_name ?? null,
    avatarUrl: buildAvatarUrl(user),
  };
}

export async function verifyDiscordAdministrator(
  accessToken: string,
  guildId: string,
): Promise<boolean> {
  const guilds = await discordFetch<DiscordGuild[]>('/users/@me/guilds', accessToken);
  const guild = guilds.find((item) => item.id === guildId);
  if (!guild) return false;
  if (guild.owner) return true;
  if (!guild.permissions) return false;

  const lowPermissionBits = decimalStringModulo(guild.permissions, 16);
  return (lowPermissionBits & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
}

async function discordFetch<T>(path: string, accessToken: string): Promise<T> {
  const response = await fetch(`${DISCORD_API}${path}`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new DiscordAuthError('Discord API request failed.');
  }

  return response.json() as Promise<T>;
}

function buildAvatarUrl(user: DiscordUser): string | null {
  if (!user.avatar) return null;
  const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
}

function decimalStringModulo(value: string, modulo: number): number {
  let result = 0;
  for (const char of value) {
    const digit = char.charCodeAt(0) - 48;
    if (digit < 0 || digit > 9) return 0;
    result = (result * 10 + digit) % modulo;
  }
  return result;
}
