import type { EmailOtpType } from "@supabase/supabase-js";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

const EMAIL_OTP_TYPES =
  new Set<EmailOtpType>([
    "email",
    "signup",
    "invite",
    "magiclink",
    "recovery",
    "email_change",
  ]);

function getSafeNextPath(
  value: string | null
): string {
  if (
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/admin";
  }

  return value;
}

function isEmailOtpType(
  value: string | null
): value is EmailOtpType {
  return (
    value !== null &&
    EMAIL_OTP_TYPES.has(
      value as EmailOtpType
    )
  );
}

export async function GET(
  request: NextRequest
) {
  const next = getSafeNextPath(
    request.nextUrl.searchParams.get(
      "next"
    )
  );

  const code =
    request.nextUrl.searchParams.get(
      "code"
    );

  const tokenHash =
    request.nextUrl.searchParams.get(
      "token_hash"
    );

  const type =
    request.nextUrl.searchParams.get(
      "type"
    );

  const supabase = await createClient();

  let errorMessage: string | null =
    null;

  if (code) {
    const { error } =
      await supabase.auth.exchangeCodeForSession(
        code
      );

    errorMessage =
      error?.message ?? null;
  } else if (
    tokenHash &&
    isEmailOtpType(type)
  ) {
    const { error } =
      await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

    errorMessage =
      error?.message ?? null;
  } else {
    errorMessage =
      "Nedostaje autentikacioni kod.";
  }

  if (errorMessage) {
    console.error(
      "Supabase auth callback failed:",
      errorMessage
    );

    const errorUrl = new URL(
      "/admin/login",
      request.nextUrl.origin
    );

    errorUrl.searchParams.set(
      "authError",
      "callback"
    );

    return NextResponse.redirect(
      errorUrl
    );
  }

  return NextResponse.redirect(
    new URL(
      next,
      request.nextUrl.origin
    )
  );
}
