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

function redirectToLogin(
  request: NextRequest
): NextResponse {
  const loginUrl = new URL(
    "/staff/login",
    request.url
  );

  loginUrl.searchParams.set(
    "next",
    "/staff/calendar"
  );

  return createNoStoreRedirect(
    loginUrl
  );
}

function redirectToCalendar(
  request: NextRequest,
  status: string
): NextResponse {
  const calendarUrl = new URL(
    "/staff/calendar",
    request.url
  );

  calendarUrl.searchParams.set(
    "googleCalendar",
    status
  );

  return createNoStoreRedirect(
    calendarUrl
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
        "user_id",
        user.id
      )
      .eq(
        "role",
        "staff"
      )
      .eq(
        "is_active",
        true
      )
      .limit(1)
      .maybeSingle();

    if (membershipError) {
      console.error(
        "Failed to load staff Google Calendar membership:",
        membershipError
      );

      return redirectToCalendar(
        request,
        "membership_error"
      );
    }

    if (
      !membership ||
      !membership.employee_id
    ) {
      return redirectToCalendar(
        request,
        "employee_link_required"
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
        membership.employee_id
      )
      .eq(
        "business_id",
        membership.business_id
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
        "Failed to load staff employee before Google OAuth:",
        employeeError
      );

      return redirectToCalendar(
        request,
        "employee_not_found"
      );
    }

    const {
      state,
      nonce,
    } = createGoogleOAuthState({
      businessId:
        membership.business_id,
      userId:
        user.id,
      target:
        "employee",
      employeeId:
        employee.id,
    });

    const authorizationUrl =
      generateGoogleAuthorizationUrl({
        state,
        loginHint:
          user.email ?? null,
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
      "employee",
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
      "Failed to start staff Google Calendar OAuth:",
      error
    );

    return redirectToCalendar(
      request,
      "connect_error"
    );
  }
}
