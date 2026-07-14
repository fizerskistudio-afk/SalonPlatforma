"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { clearPreferredAdminBusinessId } from "@/lib/auth/admin-active-business";

export async function signOutAction() {
  const supabase =
    await createClient();

  await supabase.auth.signOut();
  await clearPreferredAdminBusinessId();

  redirect("/admin/login");
}
