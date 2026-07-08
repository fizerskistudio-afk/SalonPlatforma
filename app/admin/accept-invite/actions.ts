"use server";

import {
  redirect,
} from "next/navigation";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export type AcceptInviteActionState = {
  error:
    string | null;
};

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

export async function acceptInviteAction(
  _previousState:
    AcceptInviteActionState,
  formData:
    FormData
): Promise<
  AcceptInviteActionState
> {
  const password =
    String(
      formData.get(
        "password"
      ) ??
      ""
    );

  const confirmation =
    String(
      formData.get(
        "passwordConfirmation"
      ) ??
      ""
    );

  const businessSlug =
    String(
      formData.get(
        "businessSlug"
      ) ??
      ""
    )
      .trim()
      .toLowerCase();

  const inviteEmail =
    normalizeEmail(
      String(
        formData.get(
          "inviteEmail"
        ) ??
        ""
      )
    );

  const hasStrictInviteContext =
    Boolean(
      businessSlug ||
      inviteEmail
    );

  if (
    password.length <
    10
  ) {
    return {
      error:
        "Lozinka mora imati najmanje 10 karaktera.",
    };
  }

  if (
    password !==
    confirmation
  ) {
    return {
      error:
        "Lozinke se ne podudaraju.",
    };
  }

  if (
    hasStrictInviteContext &&
    (
      !BUSINESS_SLUG_PATTERN.test(
        businessSlug
      ) ||
      !EMAIL_PATTERN.test(
        inviteEmail
      )
    )
  ) {
    return {
      error:
        "Invite nema ispravan salon ili email. Otvori originalni link iz emaila.",
    };
  }

  const supabase =
    await createClient();

  const {
    data:
      userData,
    error:
      userError,
  } =
    await supabase
      .auth
      .getUser();

  if (
    userError ||
    !userData.user
  ) {
    return {
      error:
        "Poziv nije aktivan ili je istekao. Otvori originalni link iz emaila ponovo.",
    };
  }

  const currentEmail =
    normalizeEmail(
      userData
        .user
        .email ??
      ""
    );

  if (
    hasStrictInviteContext &&
    currentEmail !==
      inviteEmail
  ) {
    await supabase
      .auth
      .signOut({
        scope:
          "local",
      });

    return {
      error:
        "Aktivna sesija ne pripada emailu iz ovog invite linka. Otvori originalni link u privatnom prozoru.",
    };
  }

  let expectedBusinessId:
    string | null =
      null;

  if (
    hasStrictInviteContext
  ) {
    const adminClient =
      createAdminClient();

    const {
      data:
        businessData,
      error:
        businessError,
    } =
      await adminClient
        .from(
          "businesses"
        )
        .select(
          "id"
        )
        .eq(
          "slug",
          businessSlug
        )
        .maybeSingle();

    if (
      businessError ||
      !businessData
    ) {
      return {
        error:
          "Salon iz invite linka nije pronađen.",
      };
    }

    expectedBusinessId =
      String(
        (
          businessData as {
            id:
              string;
          }
        ).id
      );
  }

  let membershipQuery =
    supabase
      .from(
        "business_members"
      )
      .select(
        "role, is_active, business_id"
      )
      .eq(
        "user_id",
        userData.user.id
      )
      .eq(
        "is_active",
        true
      );

  if (
    expectedBusinessId
  ) {
    membershipQuery =
      membershipQuery.eq(
        "business_id",
        expectedBusinessId
      );
  }

  const {
    data:
      membershipData,
    error:
      membershipError,
  } =
    await membershipQuery
      .order(
        "created_at",
        {
          ascending:
            true,
        }
      )
      .limit(
        1
      )
      .maybeSingle();

  if (
    membershipError ||
    !membershipData
  ) {
    return {
      error:
        hasStrictInviteContext
          ? "Prijavljeni nalog nema aktivan pristup salonu iz ovog invite linka."
          : "Aktivno članstvo salona nije pronađeno.",
    };
  }

  const membership =
    membershipData as unknown as {
      role:
        string;

      business_id:
        string;
    };

  if (
    expectedBusinessId &&
    membership.business_id !==
      expectedBusinessId
  ) {
    return {
      error:
        "Aktivna sesija ne pripada salonu iz invite linka.",
    };
  }

  const {
    error:
      passwordError,
  } =
    await supabase
      .auth
      .updateUser({
        password,
      });

  if (
    passwordError
  ) {
    return {
      error:
        "Lozinka nije sačuvana. Pokušaj ponovo.",
    };
  }

  if (
    membership.role ===
      "owner" ||
    membership.role ===
      "manager"
  ) {
    redirect(
      "/admin"
    );
  }

  redirect(
    "/staff"
  );
}
