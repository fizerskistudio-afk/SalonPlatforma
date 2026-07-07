"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type StaffLoginActionState = {
  error: string | null;
};

export async function staffLoginAction(
  _previousState: StaffLoginActionState,
  formData: FormData
): Promise<StaffLoginActionState> {
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
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error || !data.user) {
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
      "id, employee_id, is_active"
    )
    .eq("user_id", data.user.id)
    .eq("role", "staff")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (
    membershipError ||
    !membership
  ) {
    await supabase.auth.signOut();

    return {
      error:
        "Ovaj nalog nema aktivan staff pristup.",
    };
  }

  redirect("/staff");
}
