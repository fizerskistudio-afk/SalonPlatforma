import { revalidatePath } from "next/cache";
import {
  type NextRequest,
  NextResponse,
} from "next/server";

import { getAdminContext } from "@/lib/auth/admin";
import {
  BUSINESS_MEMBER_ROLES,
  type BusinessMemberRole,
} from "@/lib/admin/member-types";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type InviteRequestBody = {
  email?: unknown;
  role?: unknown;
};

type UpdateRequestBody = {
  memberId?: unknown;
  role?: unknown;
  isActive?: unknown;
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

function isMemberRole(
  value: unknown
): value is BusinessMemberRole {
  return (
    typeof value === "string" &&
    BUSINESS_MEMBER_ROLES.includes(
      value as BusinessMemberRole
    )
  );
}

function getDatabaseErrorText(
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
      (value): value is string =>
        typeof value === "string"
    )
    .join(" ")
    .toUpperCase();
}

async function findAuthUserByEmail(
  email: string
) {
  const adminClient = createAdminClient();
  const perPage = 200;

  for (
    let page = 1;
    page <= 25;
    page += 1
  ) {
    const { data, error } =
      await adminClient.auth.admin.listUsers({
        page,
        perPage,
      });

    if (error) {
      throw new Error(
        `AUTH_USER_LOOKUP_FAILED: ${error.message}`
      );
    }

    const match = data.users.find(
      (user) =>
        user.email?.trim().toLowerCase() === email
    );

    if (match) {
      return match;
    }

    if (data.users.length < perPage) {
      return null;
    }
  }

  throw new Error(
    "AUTH_USER_LOOKUP_LIMIT_REACHED"
  );
}

function getInviteRedirectUrl(
  request: NextRequest
): string {
  const callbackUrl = new URL(
    "/auth/callback",
    request.nextUrl.origin
  );

  callbackUrl.searchParams.set(
    "next",
    "/admin/accept-invite"
  );

  return callbackUrl.toString();
}

async function authorizeOwner() {
  const admin = await getAdminContext();

  if (!admin) {
    return {
      error: jsonError(
        401,
        "Administratorska sesija nije aktivna.",
        "UNAUTHENTICATED"
      ),
    } as const;
  }

  if (admin.role !== "owner") {
    return {
      error: jsonError(
        403,
        "Samo vlasnik salona može da upravlja članovima i ulogama.",
        "OWNER_REQUIRED"
      ),
    } as const;
  }

  return {
    admin,
  } as const;
}

export async function POST(
  request: NextRequest
) {
  const authorization = await authorizeOwner();

  if ("error" in authorization) {
    return authorization.error;
  }

  const { admin } = authorization;

  let body: InviteRequestBody;

  try {
    body =
      (await request.json()) as InviteRequestBody;
  } catch {
    return jsonError(
      400,
      "Zahtev nije ispravan JSON.",
      "INVALID_JSON"
    );
  }

  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  if (
    !email ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(email)
  ) {
    return jsonError(
      400,
      "Unesi ispravnu email adresu.",
      "INVALID_EMAIL"
    );
  }

  if (!isMemberRole(body.role)) {
    return jsonError(
      400,
      "Izabrana uloga nije ispravna.",
      "INVALID_ROLE"
    );
  }

  const role = body.role;
  const adminClient = createAdminClient();

  let authUser:
    | Awaited<
        ReturnType<
          typeof findAuthUserByEmail
        >
      >
    | null = null;

  let createdNewAuthUser = false;

  try {
    authUser =
      await findAuthUserByEmail(email);
  } catch (error) {
    console.error(
      "Unable to find auth user before member invite:",
      error
    );

    return jsonError(
      500,
      "Korisnički nalog trenutno ne može da se proveri.",
      "AUTH_LOOKUP_FAILED"
    );
  }

  if (!authUser) {
    const { data, error } =
      await adminClient.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo:
            getInviteRedirectUrl(request),
        }
      );

    if (error || !data.user) {
      console.error(
        "Unable to invite business member:",
        error
      );

      return jsonError(
        502,
        "Poziv nije poslat. Proveri Supabase Auth email podešavanja i pokušaj ponovo.",
        "INVITE_FAILED"
      );
    }

    authUser = data.user;
    createdNewAuthUser = true;
  }

  const {
    data: existingMembershipData,
    error: existingMembershipError,
  } = await adminClient
    .from("business_members")
    .select(
      "id, business_id, user_id, role, is_active, updated_at"
    )
    .eq("business_id", admin.business.id)
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (existingMembershipError) {
    if (createdNewAuthUser) {
      await adminClient.auth.admin.deleteUser(
        authUser.id
      );
    }

    return jsonError(
      500,
      "Postojeće članstvo nije moglo da se proveri.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (
    existingMembershipData &&
    Boolean(
      (existingMembershipData as {
        is_active?: boolean;
      }).is_active
    )
  ) {
    return jsonError(
      409,
      "Ovaj korisnik već ima aktivan pristup salonu.",
      "MEMBER_ALREADY_ACTIVE"
    );
  }

  const membershipResult =
    existingMembershipData
      ? await adminClient
          .from("business_members")
          .update({
            role,
            is_active: true,
          })
          .eq(
            "id",
            String(
              (
                existingMembershipData as {
                  id: string;
                }
              ).id
            )
          )
          .eq(
            "business_id",
            admin.business.id
          )
          .select(
            "id, user_id, role, is_active, updated_at"
          )
          .single()
      : await adminClient
          .from("business_members")
          .insert({
            business_id:
              admin.business.id,
            user_id: authUser.id,
            role,
            is_active: true,
          })
          .select(
            "id, user_id, role, is_active, updated_at"
          )
          .single();

  if (
    membershipResult.error ||
    !membershipResult.data
  ) {
    if (createdNewAuthUser) {
      await adminClient.auth.admin.deleteUser(
        authUser.id
      );
    }

    console.error(
      "Unable to save business membership:",
      membershipResult.error
    );

    return jsonError(
      500,
      "Članstvo nije sačuvano.",
      "MEMBERSHIP_SAVE_FAILED"
    );
  }

  revalidatePath("/admin/members");

  return NextResponse.json(
    {
      ok: true,
      message: createdNewAuthUser
        ? "Poziv je poslat i članstvo je kreirano."
        : "Postojeći korisnički nalog je povezan sa salonom.",
      delivery: createdNewAuthUser
        ? "invite_sent"
        : "existing_user",
    },
    {
      status: 201,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function PUT(
  request: NextRequest
) {
  const authorization = await authorizeOwner();

  if ("error" in authorization) {
    return authorization.error;
  }

  const { admin } = authorization;

  let body: UpdateRequestBody;

  try {
    body =
      (await request.json()) as UpdateRequestBody;
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

  if (!isMemberRole(body.role)) {
    return jsonError(
      400,
      "Izabrana uloga nije ispravna.",
      "INVALID_ROLE"
    );
  }

  if (typeof body.isActive !== "boolean") {
    return jsonError(
      400,
      "Status članstva nije ispravan.",
      "INVALID_ACTIVE_STATUS"
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
    data: currentMembershipData,
    error: currentMembershipError,
  } = await adminClient
    .from("business_members")
    .select("id")
    .eq("id", memberId)
    .eq("business_id", admin.business.id)
    .maybeSingle();

  if (currentMembershipError) {
    return jsonError(
      500,
      "Članstvo trenutno ne može da se učita.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (!currentMembershipData) {
    return jsonError(
      404,
      "Članstvo nije pronađeno.",
      "MEMBERSHIP_NOT_FOUND"
    );
  }

  const {
    data: updatedMembershipData,
    error: updateError,
  } = await adminClient
    .from("business_members")
    .update({
      role: body.role,
      is_active: body.isActive,
    })
    .eq("id", memberId)
    .eq("business_id", admin.business.id)
    .eq("updated_at", expectedUpdatedAt)
    .select(
      "id, user_id, role, is_active, updated_at"
    )
    .maybeSingle();

  if (updateError) {
    const errorText =
      getDatabaseErrorText(updateError);

    if (
      errorText.includes(
        "LAST_ACTIVE_OWNER"
      )
    ) {
      return jsonError(
        409,
        "Poslednji aktivni vlasnik ne može biti deaktiviran ili promenjen u drugu ulogu.",
        "LAST_ACTIVE_OWNER"
      );
    }

    console.error(
      "Unable to update business membership:",
      updateError
    );

    return jsonError(
      500,
      "Članstvo nije promenjeno.",
      "MEMBERSHIP_UPDATE_FAILED"
    );
  }

  if (!updatedMembershipData) {
    return jsonError(
      409,
      "Članstvo je u međuvremenu promenjeno u drugom tabu. Osveži stranicu.",
      "MEMBERSHIP_VERSION_CONFLICT"
    );
  }

  revalidatePath("/admin/members");

  return NextResponse.json(
    {
      ok: true,
      message:
        "Članstvo je uspešno promenjeno.",
      member: updatedMembershipData,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
