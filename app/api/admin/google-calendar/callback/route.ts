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
  type GoogleOAuthTarget,
} from "@/lib/google-calendar/oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";
export const revalidate = 0;

const OAUTH_NONCE_COOKIE =
  "salon_google_calendar_oauth_nonce";
const OAUTH_TARGET_COOKIE =
  "salon_google_calendar_oauth_target";
const OAUTH_COOKIE_PATH =
  "/api/admin/google-calendar/callback";

type ExistingConnectionRow = {
  refresh_token_encrypted: string;
  calendar_id: string;
  calendar_name: string | null;
};

function readTargetCookie(
  request: NextRequest
): GoogleOAuthTarget {
  return request.cookies.get(
    OAUTH_TARGET_COOKIE
  )?.value === "employee"
    ? "employee"
    : "business";
}

function createNoStoreRedirect(
  url: URL
): NextResponse {
  const response =
    NextResponse.redirect(url);

  response.headers.set(
    "Cache-Control",
    "no-store, max-age=0"
  );

  for (const cookieName of [
    OAUTH_NONCE_COOKIE,
    OAUTH_TARGET_COOKIE,
  ]) {
    response.cookies.set(
      cookieName,
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
  }

  return response;
}

function redirectToDestination(
  request: NextRequest,
  target: GoogleOAuthTarget,
  status: string
): NextResponse {
  const destination =
    target === "employee"
      ? "/staff/calendar"
      : "/admin/settings";

  const url = new URL(
    destination,
    request.url
  );

  url.searchParams.set(
    "googleCalendar",
    status
  );

  return createNoStoreRedirect(
    url
  );
}

function redirectToLogin(
  request: NextRequest,
  target: GoogleOAuthTarget
): NextResponse {
  const loginUrl = new URL(
    target === "employee"
      ? "/staff/login"
      : "/admin/login",
    request.url
  );

  loginUrl.searchParams.set(
    "next",
    target === "employee"
      ? "/staff/calendar"
      : "/admin/settings"
  );

  return createNoStoreRedirect(
    loginUrl
  );
}

export async function GET(
  request: NextRequest
) {
  const cookieTarget =
    readTargetCookie(
      request
    );

  const searchParams =
    request.nextUrl.searchParams;
  const googleError =
    searchParams.get("error");

  if (googleError) {
    console.error(
      "Google OAuth returned an error:",
      googleError
    );

    return redirectToDestination(
      request,
      cookieTarget,
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
    return redirectToDestination(
      request,
      cookieTarget,
      "missing_callback_data"
    );
  }

  try {
    const statePayload =
      verifyGoogleOAuthState(
        state
      );

    if (!statePayload) {
      return redirectToDestination(
        request,
        cookieTarget,
        "invalid_state"
      );
    }

    const stateTarget =
      statePayload.target ??
      "business";

    if (
      stateTarget !==
      cookieTarget
    ) {
      return redirectToDestination(
        request,
        cookieTarget,
        "target_mismatch"
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
      return redirectToDestination(
        request,
        stateTarget,
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
        request,
        stateTarget
      );
    }

    if (
      user.id !==
      statePayload.userId
    ) {
      return redirectToDestination(
        request,
        stateTarget,
        "user_mismatch"
      );
    }

    const adminClient =
      createAdminClient();

    if (
      stateTarget ===
      "employee"
    ) {
      if (
        !statePayload.employeeId
      ) {
        return redirectToDestination(
          request,
          stateTarget,
          "employee_link_required"
        );
      }

      const {
        data: membership,
        error: membershipError,
      } = await adminClient
        .from(
          "business_members"
        )
        .select(
          "business_id, employee_id, role, is_active"
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
          "employee_id",
          statePayload.employeeId
        )
        .eq(
          "role",
          "staff"
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

      if (membershipError) {
        console.error(
          "Failed to verify staff Google Calendar membership:",
          membershipError
        );

        return redirectToDestination(
          request,
          stateTarget,
          "membership_error"
        );
      }

      if (!membership) {
        return redirectToDestination(
          request,
          stateTarget,
          "forbidden"
        );
      }

      const {
        data: employee,
        error: employeeError,
      } = await adminClient
        .from("employees")
        .select(
          "id, business_id, is_active"
        )
        .eq(
          "id",
          statePayload.employeeId
        )
        .eq(
          "business_id",
          statePayload.businessId
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

      if (
        employeeError ||
        !employee
      ) {
        console.error(
          "Failed to verify employee before Google Calendar connection:",
          employeeError
        );

        return redirectToDestination(
          request,
          stateTarget,
          "employee_not_found"
        );
      }
    } else {
      const {
        data: membership,
        error: membershipError,
      } = await adminClient
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
          "Failed to verify salon Google Calendar membership:",
          membershipError
        );

        return redirectToDestination(
          request,
          stateTarget,
          "membership_error"
        );
      }

      if (!membership) {
        return redirectToDestination(
          request,
          stateTarget,
          "forbidden"
        );
      }
    }

    const {
      data: business,
      error: businessError,
    } = await adminClient
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

    if (
      businessError ||
      !business
    ) {
      console.error(
        "Failed to verify Google Calendar business:",
        businessError
      );

      return redirectToDestination(
        request,
        stateTarget,
        "business_error"
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

    const connectionTable =
      stateTarget ===
      "employee"
        ? "employee_google_calendar_connections"
        : "google_calendar_connections";

    let existingQuery =
      adminClient
        .from(connectionTable)
        .select(
          "refresh_token_encrypted, calendar_id, calendar_name"
        )
        .eq(
          "business_id",
          statePayload.businessId
        );

    if (
      stateTarget ===
      "employee"
    ) {
      existingQuery =
        existingQuery.eq(
          "employee_id",
          statePayload.employeeId!
        );
    }

    const {
      data: existingConnectionData,
      error: existingConnectionError,
    } =
      await existingQuery.maybeSingle();

    if (
      existingConnectionError
    ) {
      console.error(
        "Failed to load existing Google Calendar connection:",
        existingConnectionError
      );

      return redirectToDestination(
        request,
        stateTarget,
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

      return redirectToDestination(
        request,
        stateTarget,
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

    const hasCalendarWriteScope =
      grantedScopes.some(
        (scope) =>
          scope ===
            "https://www.googleapis.com/auth/calendar.events" ||
          scope ===
            "https://www.googleapis.com/auth/calendar" ||
          scope ===
            "https://www.googleapis.com/auth/calendar.events.owned"
      );

    if (
      stateTarget ===
        "employee" &&
      !hasCalendarWriteScope
    ) {
      console.error(
        "Staff Google OAuth completed without a writable Calendar scope:",
        grantedScopes
      );

      /*
       * Ne ostavljamo stari ili parcijalni token prikazan kao
       * aktivna konekcija. Staff mora ponoviti OAuth i eksplicitno
       * odobriti Google Calendar dozvolu.
       */
      const {
        error: cleanupError,
      } = await adminClient
        .from(
          "employee_google_calendar_connections"
        )
        .delete()
        .eq(
          "business_id",
          statePayload.businessId
        )
        .eq(
          "employee_id",
          statePayload.employeeId!
        );

      if (cleanupError) {
        console.error(
          "Failed to remove employee Google connection with insufficient scopes:",
          cleanupError
        );
      }

      return redirectToDestination(
        request,
        stateTarget,
        "insufficient_scope"
      );
    }

    const now =
      new Date().toISOString();

    const commonValues = {
      business_id:
        statePayload.businessId,
      google_account_id:
        googleProfile.id ?? null,
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
    };

    const saveValues =
      stateTarget ===
      "employee"
        ? {
            ...commonValues,
            employee_id:
              statePayload.employeeId!,
            connected_by_user_id:
              user.id,
          }
        : commonValues;

    const onConflict =
      stateTarget ===
      "employee"
        ? "business_id,employee_id"
        : "business_id";

    const {
      error: saveError,
    } = await adminClient
      .from(connectionTable)
      .upsert(
        saveValues,
        {
          onConflict,
        }
      );

    if (saveError) {
      console.error(
        "Failed to save Google Calendar connection:",
        saveError
      );

      return redirectToDestination(
        request,
        stateTarget,
        "connection_save_error"
      );
    }

    return redirectToDestination(
      request,
      stateTarget,
      "connected"
    );
  } catch (error) {
    console.error(
      "Google Calendar OAuth callback failed:",
      error
    );

    return redirectToDestination(
      request,
      cookieTarget,
      "callback_error"
    );
  }
}
