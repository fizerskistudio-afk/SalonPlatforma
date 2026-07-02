import {
  type NextRequest,
  NextResponse,
} from "next/server";
import { google } from "googleapis";

import {
  getGoogleCalendarConfig,
} from "@/lib/google-calendar/config";
import {
  encryptGoogleToken,
} from "@/lib/google-calendar/crypto";
import {
  createGoogleOAuthClient,
  exchangeGoogleAuthorizationCode,
  verifyGoogleOAuthState,
} from "@/lib/google-calendar/oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

const OAUTH_NONCE_COOKIE =
  "salon_google_calendar_oauth_nonce";

const OAUTH_COOKIE_PATH =
  "/api/admin/google-calendar/callback";

type ExistingConnectionRow = {
  refresh_token_encrypted: string;
  calendar_id: string;
  calendar_name: string | null;
};

function createNoStoreRedirect(
  url: URL
): NextResponse {
  const response =
    NextResponse.redirect(url);

  response.headers.set(
    "Cache-Control",
    "no-store, max-age=0"
  );

  response.cookies.set(
    OAUTH_NONCE_COOKIE,
    "",
    {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path:
        OAUTH_COOKIE_PATH,

      maxAge: 0,
    }
  );

  return response;
}

function redirectToSettings(
  request: NextRequest,
  status: string
): NextResponse {
  const settingsUrl = new URL(
    "/admin/settings",
    request.url
  );

  settingsUrl.searchParams.set(
    "googleCalendar",
    status
  );

  return createNoStoreRedirect(
    settingsUrl
  );
}

function redirectToLogin(
  request: NextRequest
): NextResponse {
  const loginUrl = new URL(
    "/admin/login",
    request.url
  );

  loginUrl.searchParams.set(
    "next",
    "/admin/settings"
  );

  return createNoStoreRedirect(
    loginUrl
  );
}

export async function GET(
  request: NextRequest
) {
  const searchParams =
    request.nextUrl.searchParams;

  const googleError =
    searchParams.get("error");

  if (googleError) {
    console.error(
      "Google OAuth returned an error:",
      googleError
    );

    return redirectToSettings(
      request,
      googleError ===
        "access_denied"
        ? "cancelled"
        : "google_error"
    );
  }

  const code =
    searchParams.get("code");

  const state =
    searchParams.get("state");

  if (!code || !state) {
    return redirectToSettings(
      request,
      "missing_callback_data"
    );
  }

  try {
    const statePayload =
      verifyGoogleOAuthState(
        state
      );

    if (!statePayload) {
      return redirectToSettings(
        request,
        "invalid_state"
      );
    }

    const cookieNonce =
      request.cookies.get(
        OAUTH_NONCE_COOKIE
      )?.value;

    if (
      !cookieNonce ||
      cookieNonce !==
        statePayload.nonce
    ) {
      return redirectToSettings(
        request,
        "invalid_nonce"
      );
    }

    const supabase =
      await createClient();

    const {
      data: {
        user,
      },
      error: userError,
    } =
      await supabase.auth.getUser();

    if (
      userError ||
      !user
    ) {
      return redirectToLogin(
        request
      );
    }

    if (
      user.id !==
      statePayload.userId
    ) {
      return redirectToSettings(
        request,
        "user_mismatch"
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: membership,
      error: membershipError,
    } =
      await adminClient
        .from(
          "business_members"
        )
        .select(
          "business_id, role, is_active"
        )
        .eq(
          "business_id",
          statePayload.businessId
        )
        .eq(
          "user_id",
          user.id
        )
        .eq(
          "is_active",
          true
        )
        .in(
          "role",
          [
            "owner",
            "manager",
          ]
        )
        .maybeSingle();

    if (membershipError) {
      console.error(
        "Failed to verify Google Calendar membership:",
        membershipError
      );

      return redirectToSettings(
        request,
        "membership_error"
      );
    }

    if (!membership) {
      return redirectToSettings(
        request,
        "forbidden"
      );
    }

    const {
      data: business,
      error: businessError,
    } =
      await adminClient
        .from("businesses")
        .select("id, is_active")
        .eq(
          "id",
          statePayload.businessId
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

    if (businessError) {
      console.error(
        "Failed to verify Google Calendar business:",
        businessError
      );

      return redirectToSettings(
        request,
        "business_error"
      );
    }

    if (!business) {
      return redirectToSettings(
        request,
        "business_not_found"
      );
    }

    const tokens =
      await exchangeGoogleAuthorizationCode(
        code
      );

    const oauthClient =
      createGoogleOAuthClient();

    oauthClient.setCredentials(
      tokens
    );

    const oauth2Client =
      google.oauth2({
        version: "v2",
        auth: oauthClient,
      });

    const {
      data: googleProfile,
    } =
      await oauth2Client.userinfo.get();

    const {
      data: existingConnectionData,
      error: existingConnectionError,
    } =
      await adminClient
        .from(
          "google_calendar_connections"
        )
        .select(
          `
            refresh_token_encrypted,
            calendar_id,
            calendar_name
          `
        )
        .eq(
          "business_id",
          statePayload.businessId
        )
        .maybeSingle();

    if (
      existingConnectionError
    ) {
      console.error(
        "Failed to load existing Google Calendar connection:",
        existingConnectionError
      );

      return redirectToSettings(
        request,
        "connection_read_error"
      );
    }

    const existingConnection =
      existingConnectionData as
        | ExistingConnectionRow
        | null;

    let encryptedRefreshToken =
      existingConnection
        ?.refresh_token_encrypted ??
      null;

    if (tokens.refresh_token) {
      encryptedRefreshToken =
        encryptGoogleToken(
          tokens.refresh_token
        );
    }

    if (!encryptedRefreshToken) {
      console.error(
        "Google did not return a refresh token and no previous token exists."
      );

      return redirectToSettings(
        request,
        "missing_refresh_token"
      );
    }

    const {
      scopes:
        configuredScopes,
    } =
      getGoogleCalendarConfig();

    const grantedScopes =
      tokens.scope
        ?.split(/\s+/)
        .filter(Boolean) ??
      [...configuredScopes];

    const now =
      new Date().toISOString();

    const {
      error: saveError,
    } =
      await adminClient
        .from(
          "google_calendar_connections"
        )
        .upsert(
          {
            business_id:
              statePayload.businessId,

            google_account_id:
              googleProfile.id ??
              null,

            google_account_email:
              googleProfile.email ??
              user.email ??
              null,

            calendar_id:
              existingConnection
                ?.calendar_id ??
              "primary",

            calendar_name:
              existingConnection
                ?.calendar_name ??
              "Primary calendar",

            refresh_token_encrypted:
              encryptedRefreshToken,

            scopes:
              grantedScopes,

            is_active: true,

            connected_at: now,

            last_error: null,

            updated_at: now,
          },
          {
            onConflict:
              "business_id",
          }
        );

    if (saveError) {
      console.error(
        "Failed to save Google Calendar connection:",
        saveError
      );

      return redirectToSettings(
        request,
        "connection_save_error"
      );
    }

    return redirectToSettings(
      request,
      "connected"
    );
  } catch (error) {
    console.error(
      "Google Calendar OAuth callback failed:",
      error
    );

    return redirectToSettings(
      request,
      "callback_error"
    );
  }
}