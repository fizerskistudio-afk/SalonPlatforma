"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!email || !password) {
    return {
      error:
        "Unesi email adresu i lozinku.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

  if (
    error ||
    !data.user
  ) {
    return {
      error:
        "Email ili lozinka nisu ispravni.",
    };
  }

  const {
    data: membership,
    error: membershipError,
  } = await supabase
    .from("business_members")
    .select(
      "id, business_id, role, is_active"
    )
    .eq(
      "user_id",
      data.user.id
    )
    .eq("is_active", true)
    .in("role", [
      "owner",
      "manager",
    ])
    .limit(1)
    .maybeSingle();

  if (
    membershipError ||
    !membership
  ) {
    await supabase.auth.signOut();

    return {
      error:
        "Ovaj nalog nema aktivan administratorski pristup.",
    };
  }

  if (
    data.user
      .app_metadata
      ?.must_change_password ===
    true
  ) {
    redirect(
      "/admin/change-password"
    );
  }

  redirect("/admin");
}
