"use server";

import {
  redirect,
} from "next/navigation";

import {
  requireAdmin,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  createClient,
} from "@/lib/supabase/server";

export type ChangePasswordActionState = {
  error: string | null;
};

function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

export async function changePasswordAction(
  _previousState:
    ChangePasswordActionState,
  formData: FormData
): Promise<ChangePasswordActionState> {
  const admin =
    await requireAdmin({
      allowPasswordChange:
        true,
    });

  if (
    !admin.mustChangePassword
  ) {
    redirect(
      "/admin"
    );
  }

  const password =
    String(
      formData.get(
        "password"
      ) ?? ""
    );

  const confirmation =
    String(
      formData.get(
        "passwordConfirmation"
      ) ?? ""
    );

  if (
    password.length <
    10
  ) {
    return {
      error:
        "Nova lozinka mora imati najmanje 10 karaktera.",
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

  const supabase =
    await createClient();

  const {
    error:
      passwordError,
  } = await supabase
    .auth
    .updateUser({
      password,
    });

  if (passwordError) {
    return {
      error:
        "Nova lozinka nije sačuvana. Pokušaj ponovo.",
    };
  }

  const adminClient =
    createAdminClient();

  const {
    data:
      userData,
    error:
      userError,
  } = await adminClient
    .auth
    .admin
    .getUserById(
      admin.userId
    );

  if (
    userError ||
    !userData.user
  ) {
    return {
      error:
        "Lozinka je promenjena, ali status prvog logina nije osvežen. Prijavi problem platform administratoru.",
    };
  }

  const appMetadata =
    isJsonRecord(
      userData.user
        .app_metadata
    )
      ? userData.user
          .app_metadata
      : {};

  const {
    error:
      metadataError,
  } = await adminClient
    .auth
    .admin
    .updateUserById(
      admin.userId,
      {
        app_metadata: {
          ...appMetadata,
          must_change_password:
            false,
          credential_completed_at:
            new Date().toISOString(),
        },
      }
    );

  if (metadataError) {
    return {
      error:
        "Lozinka je promenjena, ali obavezna promena nije završena. Prijavi problem platform administratoru.",
    };
  }

  const {
    error:
      refreshError,
  } = await supabase
    .auth
    .refreshSession();

  if (refreshError) {
    await supabase
      .auth
      .signOut();

    redirect(
      "/admin/login"
    );
  }

  redirect(
    "/admin"
  );
}
