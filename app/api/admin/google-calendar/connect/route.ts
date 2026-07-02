import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  createGoogleOAuthState,
  generateGoogleAuthorizationUrl,
} from "@/lib/google-calendar/oauth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

const OAUTH_NONCE_COOKIE =
  "salon_google_calendar_oauth_nonce";

const OAUTH_COOKIE_MAX_AGE_SECONDS =
  10 * 60;

type BusinessMembershipRow = {
  business_id: string;
  role:
    | "owner"
    | "manager"
    | "staff";
  is_active: boolean;
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

  return response;
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
    "/api/admin/google-calendar/connect"
  );

  return createNoStoreRedirect(
    loginUrl
  );
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
  try {
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

    const adminClient =
      createAdminClient();

    const {
      data: membershipData,
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
        .limit(1)
        .maybeSingle();

    if (
      membershipError
    ) {
      console.error(
        "Failed to load Google Calendar membership:",
        membershipError
      );

      return redirectToSettings(
        request,
        "membership_error"
      );
    }

    if (
      !membershipData
    ) {
      return redirectToSettings(
        request,
        "forbidden"
      );
    }

    const membership =
      membershipData as BusinessMembershipRow;

    const {
      data: business,
      error: businessError,
    } =
      await adminClient
        .from("businesses")
        .select(
          "id, is_active"
        )
        .eq(
          "id",
          membership.business_id
        )
        .eq(
          "is_active",
          true
        )
        .maybeSingle();

    if (
      businessError
    ) {
      console.error(
        "Failed to load Google Calendar business:",
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

    const {
      state,
      nonce,
    } =
      createGoogleOAuthState({
        businessId:
          membership.business_id,

        userId:
          user.id,
      });

    const authorizationUrl =
      generateGoogleAuthorizationUrl(
        {
          state,
          loginHint:
            user.email ?? null,
        }
      );

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
          "/api/admin/google-calendar/callback",

        maxAge:
          OAUTH_COOKIE_MAX_AGE_SECONDS,
      }
    );

    return response;
  } catch (error) {
    console.error(
      "Failed to start Google Calendar OAuth:",
      error
    );

    return redirectToSettings(
      request,
      "connect_error"
    );
  }
}