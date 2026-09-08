export type ServerEnv = {
  appName: string;
  discordClientId: string;
  discordClientSecret: string;
  discordGuildId: string;
  discordRedirectUri: string;
  sessionSecret: string;
  nodeEnv: string;
};

const requiredKeys = [
  'DISCORD_CLIENT_ID',
  'DISCORD_CLIENT_SECRET',
  'DISCORD_GUILD_ID',
  'DISCORD_REDIRECT_URI',
  'SESSION_SECRET',
] as const;

export type RequiredEnvKey = (typeof requiredKeys)[number];

export type EnvStatus =
  | { ok: true; env: ServerEnv }
  | { ok: false; missing: RequiredEnvKey[]; weakSecret: boolean };

export function getEnvStatus(): EnvStatus {
  const missing = requiredKeys.filter((key) => !process.env[key]?.trim());
  const sessionSecret = process.env.SESSION_SECRET?.trim() ?? '';

  if (missing.length > 0 || sessionSecret.length < 32) {
    return {
      ok: false,
      missing,
      weakSecret: sessionSecret.length > 0 && sessionSecret.length < 32,
    };
  }

  const redirectUri = process.env.DISCORD_REDIRECT_URI!.trim();
  try {
    const url = new URL(redirectUri);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }
  } catch {
    return {
      ok: false,
      missing: ['DISCORD_REDIRECT_URI'],
      weakSecret: false,
    };
  }

  return {
    ok: true,
    env: {
      appName: process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'Valtheris Tools',
      discordClientId: process.env.DISCORD_CLIENT_ID!.trim(),
      discordClientSecret: process.env.DISCORD_CLIENT_SECRET!.trim(),
      discordGuildId: process.env.DISCORD_GUILD_ID!.trim(),
      discordRedirectUri: redirectUri,
      sessionSecret,
      nodeEnv: process.env.NODE_ENV ?? 'development',
    },
  };
}

export function requireEnv(): ServerEnv {
  const status = getEnvStatus();
  if (!status.ok) {
    const missing = status.missing.join(', ') || 'SESSION_SECRET';
    const weak = status.weakSecret
      ? ' SESSION_SECRET must contain at least 32 characters.'
      : '';
    throw new Error(`Missing or invalid environment variables: ${missing}.${weak}`);
  }

  return status.env;
}
