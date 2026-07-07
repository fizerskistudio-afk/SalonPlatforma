"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type ReviewStaffTimeOffResult = {
  ok: boolean;
  message: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function errorText(
  error: {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
    code?: string | null;
  }
): string {
  return [
    error.message,
    error.details,
    error.hint,
    error.code,
  ]
    .filter(
      (
        value
      ): value is string =>
        typeof value === "string"
    )
    .join(" ")
    .toUpperCase();
}

export async function reviewStaffTimeOffRequestAction(
  input: {
    requestId: string;
    decision:
      | "approved"
      | "rejected";
    reviewNote?: string;
  }
): Promise<ReviewStaffTimeOffResult> {
  await requireAdmin();

  const requestId =
    input.requestId.trim();

  const reviewNote =
    input.reviewNote?.trim() ??
    "";

  if (
    !UUID_PATTERN.test(
      requestId
    )
  ) {
    return {
      ok: false,
      message:
        "Zahtev nema ispravan ID.",
    };
  }

  if (
    input.decision !==
      "approved" &&
    input.decision !==
      "rejected"
  ) {
    return {
      ok: false,
      message:
        "Odluka nije ispravna.",
    };
  }

  if (
    reviewNote.length >
    500
  ) {
    return {
      ok: false,
      message:
        "Napomena može imati najviše 500 karaktera.",
    };
  }

  const supabase =
    await createClient();

  const {
    error,
  } = await supabase.rpc(
    "review_staff_time_off_request",
    {
      p_request_id:
        requestId,
      p_decision:
        input.decision,
      p_review_note:
        reviewNote ||
        null,
    }
  );

  if (error) {
    const text =
      errorText(error);

    if (
      text.includes(
        "TIME_OFF_BOOKING_CONFLICT"
      )
    ) {
      return {
        ok: false,
        message:
          "Zahtev se preklapa sa aktivnom rezervacijom. Prvo pomeri ili otkaži konfliktni termin.",
      };
    }

    if (
      text.includes(
        "TIME_OFF_REQUEST_NOT_PENDING"
      )
    ) {
      return {
        ok: false,
        message:
          "Zahtev je već obrađen.",
      };
    }

    console.error(
      "Unable to review staff time off request:",
      error
    );

    return {
      ok: false,
      message:
        "Odluka nije sačuvana.",
    };
  }

  revalidatePath(
    "/admin/schedule"
  );
  revalidatePath("/staff");

  return {
    ok: true,
    message:
      input.decision ===
      "approved"
        ? "Odsustvo je odobreno i termini su blokirani."
        : "Zahtev je odbijen.",
  };
}
