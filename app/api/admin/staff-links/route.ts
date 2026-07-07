import { revalidatePath } from "next/cache";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { getAdminContext } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RequestBody = {
  memberId?: unknown;
  employeeId?: unknown;
  expectedUpdatedAt?: unknown;
};

function jsonError(
  status: number,
  message: string,
  code: string
) {
  return NextResponse.json(
    {
      ok: false,
      message,
      code,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function PUT(
  request: NextRequest
) {
  const admin = await getAdminContext();

  if (!admin) {
    return jsonError(
      401,
      "Administratorska sesija nije aktivna.",
      "UNAUTHENTICATED"
    );
  }

  if (admin.role !== "owner") {
    return jsonError(
      403,
      "Samo vlasnik može da povezuje staff naloge sa zaposlenima.",
      "OWNER_REQUIRED"
    );
  }

  let body: RequestBody;

  try {
    body =
      (await request.json()) as RequestBody;
  } catch {
    return jsonError(
      400,
      "Zahtev nije ispravan JSON.",
      "INVALID_JSON"
    );
  }

  const memberId =
    typeof body.memberId === "string"
      ? body.memberId.trim()
      : "";

  const employeeId =
    body.employeeId === null ||
    body.employeeId === ""
      ? null
      : typeof body.employeeId === "string"
        ? body.employeeId.trim()
        : "";

  const expectedUpdatedAt =
    typeof body.expectedUpdatedAt === "string"
      ? body.expectedUpdatedAt.trim()
      : "";

  if (!UUID_PATTERN.test(memberId)) {
    return jsonError(
      400,
      "Član nema ispravan ID.",
      "INVALID_MEMBER_ID"
    );
  }

  if (
    employeeId !== null &&
    !UUID_PATTERN.test(employeeId)
  ) {
    return jsonError(
      400,
      "Zaposleni nema ispravan ID.",
      "INVALID_EMPLOYEE_ID"
    );
  }

  if (
    !expectedUpdatedAt ||
    Number.isNaN(
      Date.parse(expectedUpdatedAt)
    )
  ) {
    return jsonError(
      400,
      "Verzija članstva nije ispravna.",
      "INVALID_EXPECTED_UPDATED_AT"
    );
  }

  const adminClient = createAdminClient();

  const {
    data: memberData,
    error: memberError,
  } = await adminClient
    .from("business_members")
    .select(
      "id, role, is_active, employee_id, updated_at"
    )
    .eq("id", memberId)
    .eq("business_id", admin.business.id)
    .maybeSingle();

  if (memberError) {
    return jsonError(
      500,
      "Članstvo trenutno ne može da se učita.",
      "MEMBER_LOOKUP_FAILED"
    );
  }

  if (!memberData) {
    return jsonError(
      404,
      "Članstvo nije pronađeno.",
      "MEMBER_NOT_FOUND"
    );
  }

  if (String(memberData.role) !== "staff") {
    return jsonError(
      409,
      "Samo staff član može biti povezan sa zaposlenim.",
      "MEMBER_NOT_STAFF"
    );
  }

  if (employeeId) {
    const {
      data: employeeData,
      error: employeeError,
    } = await adminClient
      .from("employees")
      .select("id, is_active")
      .eq("id", employeeId)
      .eq("business_id", admin.business.id)
      .maybeSingle();

    if (employeeError) {
      return jsonError(
        500,
        "Zaposleni trenutno ne može da se proveri.",
        "EMPLOYEE_LOOKUP_FAILED"
      );
    }

    if (!employeeData) {
      return jsonError(
        404,
        "Zaposleni nije pronađen.",
        "EMPLOYEE_NOT_FOUND"
      );
    }

    if (!employeeData.is_active) {
      return jsonError(
        409,
        "Neaktivan zaposleni ne može dobiti staff pristup.",
        "EMPLOYEE_INACTIVE"
      );
    }
  }

  const {
    data: updatedData,
    error: updateError,
  } = await adminClient
    .from("business_members")
    .update({
      employee_id: employeeId,
    })
    .eq("id", memberId)
    .eq("business_id", admin.business.id)
    .eq("updated_at", expectedUpdatedAt)
    .select(
      "id, employee_id, updated_at"
    )
    .maybeSingle();

  if (updateError) {
    const errorText = [
      updateError.message,
      updateError.details,
      updateError.hint,
      updateError.code,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    if (
      errorText.includes(
        "business_members_business_employee_unique"
      ) ||
      errorText.includes("duplicate")
    ) {
      return jsonError(
        409,
        "Ovaj zaposleni je već povezan sa drugim staff nalogom.",
        "EMPLOYEE_ALREADY_LINKED"
      );
    }

    console.error(
      "Unable to update staff employee link:",
      updateError
    );

    return jsonError(
      500,
      "Staff veza nije sačuvana.",
      "STAFF_LINK_UPDATE_FAILED"
    );
  }

  if (!updatedData) {
    return jsonError(
      409,
      "Članstvo je promenjeno u drugom tabu. Osveži stranicu.",
      "MEMBER_VERSION_CONFLICT"
    );
  }

  revalidatePath("/admin/members");
  revalidatePath("/staff");

  return NextResponse.json(
    {
      ok: true,
      message: employeeId
        ? "Staff nalog je povezan sa zaposlenim."
        : "Staff nalog je odvezan od zaposlenog.",
      member: updatedData,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
