"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type CustomerActionResult = {
  ok: boolean;
  message: string;
  customerId?: string;
};

export type UpdateCustomerNotesInput = {
  customerId: string;
  notes: string;
};

type CustomerRow = {
  id: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function updateCustomerNotesAction(
  input: UpdateCustomerNotesInput
): Promise<CustomerActionResult> {
  const admin = await requireAdmin();

  const customerId = input.customerId.trim();
  const notes = input.notes.trim();

  if (!isUuid(customerId)) {
    return {
      ok: false,
      message: "Klijent nema ispravan ID.",
    };
  }

  if (notes.length > 2000) {
    return {
      ok: false,
      message:
        "CRM napomena može imati najviše 2000 karaktera.",
    };
  }

  const supabase = await createClient();

  const {
    data: customerData,
    error: customerError,
  } = await supabase
    .from("customers")
    .update({
      notes: notes.length > 0 ? notes : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", customerId)
    .eq("business_id", admin.business.id)
    .select("id")
    .single();

  if (customerError || !customerData) {
    return {
      ok: false,
      message:
        "CRM napomena nije sačuvana. Proveri klijenta i pokušaj ponovo.",
    };
  }

  const customer =
    customerData as unknown as CustomerRow;

  revalidatePath("/admin/customers");

  return {
    ok: true,
    customerId: customer.id,
    message: "CRM napomena je sačuvana.",
  };
}