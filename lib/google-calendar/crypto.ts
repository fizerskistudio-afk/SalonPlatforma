import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import {
  getGoogleCalendarConfig,
} from "./config";

const TOKEN_VERSION = "v1";

const TOKEN_AAD = Buffer.from(
  "salon-platform:google-calendar-token:v1",
  "utf8"
);

function encodeBase64Url(
  value: Buffer
): string {
  return value.toString(
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

export function encryptGoogleToken(
  plainToken: string
): string {
  if (!plainToken) {
    throw new Error(
      "Cannot encrypt an empty Google token."
    );
  }

  const {
    tokenEncryptionKey,
  } =
    getGoogleCalendarConfig();

  const initializationVector =
    randomBytes(12);

  const cipher =
    createCipheriv(
      "aes-256-gcm",
      tokenEncryptionKey,
      initializationVector
    );

  cipher.setAAD(TOKEN_AAD);

  const encryptedToken =
    Buffer.concat([
      cipher.update(
        plainToken,
        "utf8"
      ),
      cipher.final(),
    ]);

  const authenticationTag =
    cipher.getAuthTag();

  return [
    TOKEN_VERSION,
    encodeBase64Url(
      initializationVector
    ),
    encodeBase64Url(
      authenticationTag
    ),
    encodeBase64Url(
      encryptedToken
    ),
  ].join(".");
}

export function decryptGoogleToken(
  encryptedValue: string
): string {
  const parts =
    encryptedValue.split(".");

  if (
    parts.length !== 4 ||
    parts[0] !== TOKEN_VERSION
  ) {
    throw new Error(
      "Invalid encrypted Google token format."
    );
  }

  try {
    const {
      tokenEncryptionKey,
    } =
      getGoogleCalendarConfig();

    const initializationVector =
      decodeBase64Url(
        parts[1]
      );

    const authenticationTag =
      decodeBase64Url(
        parts[2]
      );

    const encryptedToken =
      decodeBase64Url(
        parts[3]
      );

    if (
      initializationVector.length !==
        12 ||
      authenticationTag.length !==
        16
    ) {
      throw new Error(
        "Invalid encrypted token metadata."
      );
    }

    const decipher =
      createDecipheriv(
        "aes-256-gcm",
        tokenEncryptionKey,
        initializationVector
      );

    decipher.setAAD(TOKEN_AAD);

    decipher.setAuthTag(
      authenticationTag
    );

    const decryptedToken =
      Buffer.concat([
        decipher.update(
          encryptedToken
        ),
        decipher.final(),
      ]);

    return decryptedToken.toString(
      "utf8"
    );
  } catch {
    throw new Error(
      "Google token could not be decrypted."
    );
  }
}