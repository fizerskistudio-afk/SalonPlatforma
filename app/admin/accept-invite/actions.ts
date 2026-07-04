"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AcceptInviteActionState = {
  error: string | null;
};

export async function acceptInviteAction(
  _previousState:
    AcceptInviteActionState,
  formData: FormData
): Promise<AcceptInviteActionState> {
  const password = String(
    formData.get("password") ?? ""
  );

  const confirmation = String(
    formData.get(
      "passwordConfirmation"
    ) ?? ""
  );

  if (password.length < 10) {
    return {
      error:
        "Lozinka mora imati najmanje 10 karaktera.",
    };
  }

  if (password !== confirmation) {
    return {
      error:
        "Lozinke se ne podudaraju.",
    };
  }

  const supabase = await createClient();

  const {
    data: userData,
    error: userError,
  } = await supabase.auth.getUser();

  if (
    userError ||
    !userData.user
  ) {
    return {
      error:
        "Poziv nije aktivan ili je istekao. Otvori link iz emaila ponovo.",
    };
  }

  const {
    data: membershipData,
    error: membershipError,
  } = await supabase
    .from("business_members")
    .select("role, is_active")
    .eq("user_id", userData.user.id)
    .eq("is_active", true)
    .order("created_at", {
      ascending: true,
    })
    .limit(1)
    .maybeSingle();

  if (
    membershipError ||
    !membershipData
  ) {
    return {
      error:
        "Aktivno članstvo salona nije pronađeno.",
    };
  }

  const {
    error: passwordError,
  } = await supabase.auth.updateUser({
    password,
  });

  if (passwordError) {
    return {
      error:
        "Lozinka nije sačuvana. Pokušaj ponovo.",
    };
  }

  const role = String(
    membershipData.role
  );

  if (
    role === "owner" ||
    role === "manager"
  ) {
    redirect("/admin");
  }

  redirect(
    "/admin/accept-invite?status=staff-ready"
  );
}
