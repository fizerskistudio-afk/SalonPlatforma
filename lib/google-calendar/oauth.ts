import "server-only";

import {
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { google } from "googleapis";

import { getGoogleCalendarConfig } from "./config";

const OAUTH_STATE_VERSION = 1;
const OAUTH_STATE_LIFETIME_MS =
  10 * 60 * 1000;
const OAUTH_CLOCK_SKEW_MS =
  60 * 1000;

export type GoogleOAuthTarget =
  | "business"
  | "employee";

export type GoogleOAuthStatePayload = {
  version: 1;
  businessId: string;
  userId: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
  target?: GoogleOAuthTarget;
  employeeId?: string;
};

type CreateGoogleOAuthStateInput = {
  businessId: string;
  userId: string;
  target?: GoogleOAuthTarget;
  employeeId?: string | null;
};

type GenerateAuthorizationUrlInput = {
  state: string;
  loginHint?: string | null;
};

function encodeBase64Url(
  value: string | Buffer
): string {
  const buffer =
    typeof value === "string"
      ? Buffer.from(
          value,
          "utf8"
        )
      : value;

  return buffer.toString(
    "base64url"
  );
}

function decodeBase64Url(
  value: string
): Buffer {
  return Buffer.from(
    value,
    "base64url"
  );
}

function createStateSignature(
  encodedPayload: string
): Buffer {
  const {
    tokenEncryptionKey,
  } = getGoogleCalendarConfig();

  return createHmac(
    "sha256",
    tokenEncryptionKey
  )
    .update(
      encodedPayload,
      "utf8"
    )
    .digest();
}

function isString(
  value: unknown
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0
  );
}

function isFiniteNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isGoogleOAuthTarget(
  value: unknown
): value is GoogleOAuthTarget {
  return (
    value === "business" ||
    value === "employee"
  );
}

function isValidStatePayload(
  value: unknown
): value is GoogleOAuthStatePayload {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const payload =
    value as Partial<GoogleOAuthStatePayload>;

  if (
    payload.version !==
      OAUTH_STATE_VERSION ||
    !isString(
      payload.businessId
    ) ||
    !isString(
      payload.userId
    ) ||
    !isString(
      payload.nonce
    ) ||
    !isFiniteNumber(
      payload.issuedAt
    ) ||
    !isFiniteNumber(
      payload.expiresAt
    )
  ) {
    return false;
  }

  if (
    payload.target !==
      undefined &&
    !isGoogleOAuthTarget(
      payload.target
    )
  ) {
    return false;
  }

  const target =
    payload.target ??
    "business";

  if (
    target === "employee" &&
    !isString(
      payload.employeeId
    )
  ) {
    return false;
  }

  return true;
}

export function createGoogleOAuthClient() {
  const {
    clientId,
    clientSecret,
    redirectUri,
  } = getGoogleCalendarConfig();

  return new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );
}

export function createGoogleOAuthState({
  businessId,
  userId,
  target = "business",
  employeeId,
}: CreateGoogleOAuthStateInput): {
  state: string;
  nonce: string;
} {
  if (
    target === "employee" &&
    !employeeId?.trim()
  ) {
    throw new Error(
      "Employee Google OAuth state requires an employee ID."
    );
  }

  const now = Date.now();
  const nonce =
    randomBytes(32).toString(
      "base64url"
    );

  const payload: GoogleOAuthStatePayload = {
    version:
      OAUTH_STATE_VERSION,
    businessId,
    userId,
    nonce,
    issuedAt: now,
    expiresAt:
      now +
      OAUTH_STATE_LIFETIME_MS,
    target,
    ...(target ===
      "employee"
      ? {
          employeeId:
            employeeId!.trim(),
        }
      : {}),
  };

  const encodedPayload =
    encodeBase64Url(
      JSON.stringify(
        payload
      )
    );

  const signature =
    createStateSignature(
      encodedPayload
    );

  const state = [
    encodedPayload,
    encodeBase64Url(
      signature
    ),
  ].join(".");

  return {
    state,
    nonce,
  };
}

export function verifyGoogleOAuthState(
  state: string
): GoogleOAuthStatePayload | null {
  const parts =
    state.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [
    encodedPayload,
    encodedSignature,
  ] = parts;

  let receivedSignature: Buffer;

  try {
    receivedSignature =
      decodeBase64Url(
        encodedSignature
      );
  } catch {
    return null;
  }

  const expectedSignature =
    createStateSignature(
      encodedPayload
    );

  if (
    receivedSignature.length !==
    expectedSignature.length
  ) {
    return null;
  }

  if (
    !timingSafeEqual(
      receivedSignature,
      expectedSignature
    )
  ) {
    return null;
  }

  let parsedPayload: unknown;

  try {
    parsedPayload =
      JSON.parse(
        decodeBase64Url(
          encodedPayload
        ).toString("utf8")
      );
  } catch {
    return null;
  }

  if (
    !isValidStatePayload(
      parsedPayload
    )
  ) {
    return null;
  }

  const now = Date.now();

  if (
    parsedPayload.expiresAt <
      now ||
    parsedPayload.issuedAt >
      now +
        OAUTH_CLOCK_SKEW_MS
  ) {
    return null;
  }

  if (
    parsedPayload.expiresAt -
      parsedPayload.issuedAt >
    OAUTH_STATE_LIFETIME_MS
  ) {
    return null;
  }

  return parsedPayload;
}

export function generateGoogleAuthorizationUrl({
  state,
  loginHint,
}: GenerateAuthorizationUrlInput): string {
  const {
    scopes,
  } = getGoogleCalendarConfig();

  const oauthClient =
    createGoogleOAuthClient();

  return oauthClient.generateAuthUrl(
    {
      access_type:
        "offline",
      scope: [
        ...scopes,
      ],
      include_granted_scopes:
        true,
      prompt:
        "consent",
      state,
      ...(loginHint?.trim()
        ? {
            login_hint:
              loginHint.trim(),
          }
        : {}),
    }
  );
}

export async function exchangeGoogleAuthorizationCode(
  code: string
) {
  if (!code.trim()) {
    throw new Error(
      "Missing Google authorization code."
    );
  }

  const oauthClient =
    createGoogleOAuthClient();

  const {
    tokens,
  } =
    await oauthClient.getToken(
      code
    );

  return tokens;
}

export function createGoogleOAuthClientWithRefreshToken(
  refreshToken: string
) {
  if (!refreshToken) {
    throw new Error(
      "Missing Google refresh token."
    );
  }

  const oauthClient =
    createGoogleOAuthClient();

  oauthClient.setCredentials({
    refresh_token:
      refreshToken,
  });

  return oauthClient;
}
