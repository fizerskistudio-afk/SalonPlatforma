import "server-only";

export const GOOGLE_CALENDAR_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/calendar.events",
] as const;

export type GoogleCalendarConfig = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenEncryptionKey: Buffer;
  scopes: readonly string[];
};

function requireEnvironmentVariable(
  name: string
): string {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${name} environment variable.`
    );
  }

  return value;
}

function getTokenEncryptionKey(): Buffer {
  const encodedKey =
    requireEnvironmentVariable(
      "GOOGLE_TOKEN_ENCRYPTION_KEY"
    );

  let key: Buffer;

  try {
    key = Buffer.from(
      encodedKey,
      "base64"
    );
  } catch {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY must be a valid Base64 value."
    );
  }

  if (key.length !== 32) {
    throw new Error(
      "GOOGLE_TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes."
    );
  }

  return key;
}

export function getGoogleCalendarConfig(): GoogleCalendarConfig {
  return {
    clientId:
      requireEnvironmentVariable(
        "GOOGLE_OAUTH_CLIENT_ID"
      ),

    clientSecret:
      requireEnvironmentVariable(
        "GOOGLE_OAUTH_CLIENT_SECRET"
      ),

    redirectUri:
      requireEnvironmentVariable(
        "GOOGLE_OAUTH_REDIRECT_URI"
      ),

    tokenEncryptionKey:
      getTokenEncryptionKey(),

    scopes:
      GOOGLE_CALENDAR_SCOPES,
  };
}