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
import {
  completeTemporaryPasswordMetadata,
} from "@/lib/auth/temporary-password";

export type ChangePasswordActionState = {
  error: string | null;
};

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
        "Nalog trenutno nije moguće proveriti. Lozinka nije menjana; pokušaj ponovo.",
    };
  }

  const {
    error:
      completionError,
  } = await adminClient
    .auth
    .admin
    .updateUserById(
      admin.userId,
      {
        password,
        app_metadata: {
          ...completeTemporaryPasswordMetadata(
            userData.user
              .app_metadata,
            new Date().toISOString()
          ),
        },
      }
    );

  if (completionError) {
    return {
      error:
        "Promena nije potvrđena. Ostani na ovoj stranici i pošalji formu ponovo; isti postupak bezbedno završava i ranije prekinutu aktivaciju.",
    };
  }

  const supabase =
    await createClient();

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
