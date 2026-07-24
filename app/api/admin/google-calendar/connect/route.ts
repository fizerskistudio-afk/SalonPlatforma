import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  requireAdmin,
} from "@/lib/auth/admin";
import {
  createGoogleOAuthState,
  generateGoogleAuthorizationUrl,
} from "@/lib/google-calendar/oauth";

export const dynamic =
  "force-dynamic";
export const revalidate = 0;

const OAUTH_NONCE_COOKIE =
  "salon_google_calendar_oauth_nonce";
const OAUTH_TARGET_COOKIE =
  "salon_google_calendar_oauth_target";
const OAUTH_CALLBACK_PATH =
  "/api/admin/google-calendar/callback";
const OAUTH_COOKIE_MAX_AGE_SECONDS =
  10 * 60;

function createNoStoreRedirect(
  url: URL
): NextResponse {
  const response =
    NextResponse.redirect(url);

  response.headers.set(
    "Cache-Control",
    "no-store, max-age=0"
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

export async function GET(
  request: NextRequest
) {
  const admin =
    await requireAdmin();

  try {
    const {
      state,
      nonce,
    } = createGoogleOAuthState({
      businessId:
        admin.business.id,
      userId:
        admin.userId,
      target:
        "business",
    });

    const authorizationUrl =
      generateGoogleAuthorizationUrl({
        state,
        loginHint:
          admin.email,
      });

    const response =
      createNoStoreRedirect(
        new URL(
          authorizationUrl
        )
      );

    response.cookies.set(
      OAUTH_NONCE_COOKIE,
      nonce,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path:
          OAUTH_CALLBACK_PATH,
        maxAge:
          OAUTH_COOKIE_MAX_AGE_SECONDS,
      }
    );

    response.cookies.set(
      OAUTH_TARGET_COOKIE,
      "business",
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          "production",
        sameSite: "lax",
        path:
          OAUTH_CALLBACK_PATH,
        maxAge:
          OAUTH_COOKIE_MAX_AGE_SECONDS,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Failed to start salon Google Calendar OAuth:",
      error
    );

    return redirectToSettings(
      request,
      "connect_error"
    );
  }
}
