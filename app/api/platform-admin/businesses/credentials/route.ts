import {
  randomBytes,
} from "node:crypto";

import {
  revalidatePath,
} from "next/cache";

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CredentialAction =
  | "create_owner"
  | "reset_owner_password";

type CredentialRequestBody = {
  action?: unknown;
  businessSlug?: unknown;
  email?: unknown;
  memberId?: unknown;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
};

type MembershipRow = {
  id: string;
  user_id: string;
  role:
    | "owner"
    | "manager"
    | "staff";
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

function getTrimmedString(
  value: unknown
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function isCredentialAction(
  value: unknown
): value is CredentialAction {
  return (
    value ===
      "create_owner" ||
    value ===
      "reset_owner_password"
  );
}

function jsonResponse(
  body: Record<
    string,
    unknown
  >,
  status: number
) {
  return NextResponse.json(
    body,
    {
      status,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
        Pragma:
          "no-cache",
      },
    }
  );
}

function jsonError(
  status: number,
  message: string,
  code: string
) {
  return jsonResponse(
    {
      ok: false,
      message,
      code,
    },
    status
  );
}

async function authorizePlatformAdmin() {
  const access =
    await getPlatformAdminAccess();

  if (
    "context" in
    access
  ) {
    return {
      context:
        access.context,
    } as const;
  }

  if (
    access.status ===
    "unauthenticated"
  ) {
    return {
      error:
        jsonError(
          401,
          "Platform admin sesija nije aktivna.",
          "PLATFORM_ADMIN_UNAUTHENTICATED"
        ),
    } as const;
  }

  return {
    error:
      jsonError(
        403,
        "Nemaš dozvolu za upravljanje owner pristupom.",
        "PLATFORM_ADMIN_FORBIDDEN"
      ),
  } as const;
}

function generateTemporaryPassword(): string {
  return `Tmp!${randomBytes(
    18
  ).toString(
    "base64url"
  )}9a`;
}

function getAppMetadata(
  value: unknown
): Record<
  string,
  unknown
> {
  return isJsonRecord(
    value
  )
    ? value
    : {};
}

async function getBusinessBySlug(
  businessSlug: string
): Promise<
  BusinessRow | null
> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "businesses"
    )
    .select(
      "id, name, slug"
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `BUSINESS_LOOKUP_FAILED: ${error.message}`
    );
  }

  return data
    ? data as unknown as
        BusinessRow
    : null;
}

async function findAuthUserByEmail(
  email: string
) {
  const adminClient =
    createAdminClient();

  const perPage =
    200;

  for (
    let page = 1;
    page <= 25;
    page += 1
  ) {
    const {
      data,
      error,
    } = await adminClient
      .auth
      .admin
      .listUsers({
        page,
        perPage,
      });

    if (error) {
      throw new Error(
        `AUTH_USER_LOOKUP_FAILED: ${error.message}`
      );
    }

    const matchingUser =
      data.users.find(
        (user) =>
          user.email
            ?.trim()
            .toLowerCase() ===
          email
      );

    if (matchingUser) {
      return matchingUser;
    }

    if (
      data.users.length <
      perPage
    ) {
      return null;
    }
  }

  throw new Error(
    "AUTH_USER_LOOKUP_LIMIT_REACHED"
  );
}

async function loadOwnerMembership(
  businessId: string,
  userId: string
): Promise<
  MembershipRow | null
> {
  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "business_members"
    )
    .select(
      "id, user_id, role, is_active, created_at, updated_at"
    )
    .eq(
      "business_id",
      businessId
    )
    .eq(
      "user_id",
      userId
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `MEMBERSHIP_LOOKUP_FAILED: ${error.message}`
    );
  }

  return data
    ? data as unknown as
        MembershipRow
    : null;
}

async function saveOwnerMembership(
  businessId: string,
  userId: string,
  existingMembership:
    MembershipRow | null
): Promise<MembershipRow> {
  const adminClient =
    createAdminClient();

  const result =
    existingMembership
      ? await adminClient
          .from(
            "business_members"
          )
          .update({
            role:
              "owner",
            is_active:
              true,
          })
          .eq(
            "id",
            existingMembership.id
          )
          .eq(
            "business_id",
            businessId
          )
          .select(
            "id, user_id, role, is_active, created_at, updated_at"
          )
          .single()
      : await adminClient
          .from(
            "business_members"
          )
          .insert({
            business_id:
              businessId,
            user_id:
              userId,
            role:
              "owner",
            is_active:
              true,
          })
          .select(
            "id, user_id, role, is_active, created_at, updated_at"
          )
          .single();

  if (
    result.error ||
    !result.data
  ) {
    throw new Error(
      `OWNER_MEMBERSHIP_SAVE_FAILED: ${result.error?.message ?? "unknown"}`
    );
  }

  return result.data as unknown as
    MembershipRow;
}

function revalidateBusinessAccess(
  businessSlug: string
) {
  revalidatePath(
    `/platform-admin/businesses/${businessSlug}`
  );

  revalidatePath(
    `/platform-admin/businesses/${businessSlug}/access`
  );

  revalidatePath(
    "/platform-admin/businesses"
  );
}

async function createOwnerCredentials(
  body: CredentialRequestBody
) {
  const businessSlug =
    getTrimmedString(
      body.businessSlug
    ).toLowerCase();

  const email =
    getTrimmedString(
      body.email
    ).toLowerCase();

  if (
    !businessSlug ||
    businessSlug.length >
      80 ||
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return jsonError(
      400,
      "Slug salona nije ispravan.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  if (
    !email ||
    email.length >
      254 ||
    !EMAIL_PATTERN.test(
      email
    )
  ) {
    return jsonError(
      400,
      "Unesi ispravnu owner email adresu.",
      "INVALID_EMAIL"
    );
  }

  let business:
    BusinessRow | null;

  try {
    business =
      await getBusinessBySlug(
        businessSlug
      );
  } catch (error) {
    console.error(
      "Unable to load business for credential provisioning:",
      error
    );

    return jsonError(
      500,
      "Salon trenutno nije moguće učitati.",
      "BUSINESS_LOOKUP_FAILED"
    );
  }

  if (!business) {
    return jsonError(
      404,
      "Salon nije pronađen.",
      "BUSINESS_NOT_FOUND"
    );
  }

  let authUser:
    Awaited<
      ReturnType<
        typeof findAuthUserByEmail
      >
    >;

  try {
    authUser =
      await findAuthUserByEmail(
        email
      );
  } catch (error) {
    console.error(
      "Unable to find auth user for credential provisioning:",
      error
    );

    return jsonError(
      500,
      "Korisnički nalog trenutno ne može da se proveri.",
      "AUTH_LOOKUP_FAILED"
    );
  }

  const adminClient =
    createAdminClient();

  let createdUserId:
    string | null =
      null;

  let temporaryPassword:
    string | null =
      null;

  if (!authUser) {
    temporaryPassword =
      generateTemporaryPassword();

    const issuedAt =
      new Date().toISOString();

    const {
      data,
      error,
    } = await adminClient
      .auth
      .admin
      .createUser({
        email,
        password:
          temporaryPassword,
        email_confirm:
          true,
        app_metadata: {
          must_change_password:
            true,
          credential_source:
            "platform_admin",
          credential_issued_at:
            issuedAt,
          credential_business_id:
            business.id,
        },
      });

    if (
      error ||
      !data.user
    ) {
      console.error(
        "Unable to create credential owner auth user:",
        error
      );

      return jsonError(
        502,
        "Owner nalog nije kreiran.",
        "OWNER_AUTH_CREATE_FAILED"
      );
    }

    authUser =
      data.user;

    createdUserId =
      data.user.id;
  }

  let existingMembership:
    MembershipRow | null;

  try {
    existingMembership =
      await loadOwnerMembership(
        business.id,
        authUser.id
      );
  } catch (error) {
    if (
      createdUserId
    ) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          createdUserId
        );
    }

    console.error(
      "Unable to inspect owner membership during credential provisioning:",
      error
    );

    return jsonError(
      500,
      "Postojeći pristup salonu nije mogao da se proveri.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (
    existingMembership &&
    existingMembership.role ===
      "owner" &&
    existingMembership.is_active
  ) {
    if (
      createdUserId
    ) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          createdUserId
        );
    }

    return jsonError(
      409,
      "Ovaj korisnik već ima aktivan owner pristup salonu.",
      "OWNER_ALREADY_ACTIVE"
    );
  }

  let membership:
    MembershipRow;

  try {
    membership =
      await saveOwnerMembership(
        business.id,
        authUser.id,
        existingMembership
      );
  } catch (error) {
    if (
      createdUserId
    ) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          createdUserId
        );
    }

    console.error(
      "Unable to save credential owner membership:",
      error
    );

    return jsonError(
      500,
      "Owner pristup nije sačuvan.",
      "OWNER_MEMBERSHIP_SAVE_FAILED"
    );
  }

  revalidateBusinessAccess(
    businessSlug
  );

  if (
    temporaryPassword
  ) {
    return jsonResponse(
      {
        ok: true,
        message:
          `Owner nalog ${email} je kreiran za salon ${business.name}. Privremena lozinka se prikazuje samo sada.`,
        delivery:
          "temporary_password",
        member:
          membership,
        credentials: {
          email,
          temporaryPassword,
          loginPath:
            "/admin/login",
          memberId:
            membership.id,
        },
      },
      201
    );
  }

  return jsonResponse(
    {
      ok: true,
      message:
        `Postojeći nalog ${email} je povezan sa salonom ${business.name}. Lozinka nije menjana.`,
      delivery:
        "existing_user",
      member:
        membership,
    },
    201
  );
}

async function resetOwnerPassword(
  body: CredentialRequestBody
) {
  const businessSlug =
    getTrimmedString(
      body.businessSlug
    ).toLowerCase();

  const memberId =
    getTrimmedString(
      body.memberId
    );

  if (
    !businessSlug ||
    businessSlug.length >
      80 ||
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return jsonError(
      400,
      "Slug salona nije ispravan.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  if (
    !UUID_PATTERN.test(
      memberId
    )
  ) {
    return jsonError(
      400,
      "Owner članstvo nema ispravan ID.",
      "INVALID_MEMBER_ID"
    );
  }

  let business:
    BusinessRow | null;

  try {
    business =
      await getBusinessBySlug(
        businessSlug
      );
  } catch (error) {
    console.error(
      "Unable to load business before credential reset:",
      error
    );

    return jsonError(
      500,
      "Salon trenutno nije moguće učitati.",
      "BUSINESS_LOOKUP_FAILED"
    );
  }

  if (!business) {
    return jsonError(
      404,
      "Salon nije pronađen.",
      "BUSINESS_NOT_FOUND"
    );
  }

  const adminClient =
    createAdminClient();

  const {
    data:
      membershipData,
    error:
      membershipError,
  } = await adminClient
    .from(
      "business_members"
    )
    .select(
      "id, user_id, role, is_active, created_at, updated_at"
    )
    .eq(
      "id",
      memberId
    )
    .eq(
      "business_id",
      business.id
    )
    .eq(
      "role",
      "owner"
    )
    .maybeSingle();

  if (
    membershipError
  ) {
    console.error(
      "Unable to load exact owner membership before credential reset:",
      membershipError
    );

    return jsonError(
      500,
      "Owner pristup trenutno ne može da se učita.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (
    !membershipData
  ) {
    return jsonError(
      404,
      "Owner pristup nije pronađen za ovaj salon.",
      "OWNER_MEMBERSHIP_NOT_FOUND"
    );
  }

  const membership =
    membershipData as unknown as
      MembershipRow;

  if (
    !membership.is_active
  ) {
    return jsonError(
      409,
      "Owner pristup je deaktiviran. Prvo ga ponovo aktiviraj.",
      "OWNER_MEMBERSHIP_INACTIVE"
    );
  }

  const {
    data:
      userData,
    error:
      userError,
  } = await adminClient
    .auth
    .admin
    .getUserById(
      membership.user_id
    );

  if (
    userError ||
    !userData.user
  ) {
    console.error(
      "Unable to load exact owner auth user before credential reset:",
      userError
    );

    return jsonError(
      500,
      "Owner korisnički nalog trenutno nije moguće učitati.",
      "OWNER_AUTH_USER_LOOKUP_FAILED"
    );
  }

  const email =
    userData.user.email
      ?.trim()
      .toLowerCase() ??
    "";

  if (
    !EMAIL_PATTERN.test(
      email
    )
  ) {
    return jsonError(
      409,
      "Owner nalog nema ispravnu email adresu.",
      "OWNER_EMAIL_MISSING"
    );
  }

  const temporaryPassword =
    generateTemporaryPassword();

  const appMetadata =
    getAppMetadata(
      userData.user
        .app_metadata
    );

  const {
    error:
      updateError,
  } = await adminClient
    .auth
    .admin
    .updateUserById(
      membership.user_id,
      {
        password:
          temporaryPassword,
        app_metadata: {
          ...appMetadata,
          must_change_password:
            true,
          credential_source:
            "platform_admin",
          credential_issued_at:
            new Date().toISOString(),
          credential_business_id:
            business.id,
          credential_membership_id:
            membership.id,
        },
      }
    );

  if (updateError) {
    console.error(
      "Unable to reset exact owner credentials:",
      updateError
    );

    return jsonError(
      502,
      "Privremena lozinka nije generisana.",
      "OWNER_CREDENTIAL_RESET_FAILED"
    );
  }

  revalidateBusinessAccess(
    businessSlug
  );

  return jsonResponse(
    {
      ok: true,
      message:
        `Nova privremena lozinka je generisana za ${email}. Prethodna lozinka više ne važi.`,
      delivery:
        "temporary_password_reset",
      credentials: {
        email,
        temporaryPassword,
        loginPath:
          "/admin/login",
        memberId:
          membership.id,
      },
    },
    200
  );
}

export async function POST(
  request: NextRequest
) {
  const authorization =
    await authorizePlatformAdmin();

  if (
    "error" in
    authorization
  ) {
    return authorization.error;
  }

  let bodyValue:
    unknown;

  try {
    bodyValue =
      await request.json();
  } catch {
    return jsonError(
      400,
      "Zahtev nije ispravan JSON.",
      "INVALID_JSON"
    );
  }

  if (
    !isJsonRecord(
      bodyValue
    )
  ) {
    return jsonError(
      400,
      "Zahtev mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const body =
    bodyValue as
      CredentialRequestBody;

  if (
    !isCredentialAction(
      body.action
    )
  ) {
    return jsonError(
      400,
      "Credential akcija nije podržana.",
      "INVALID_CREDENTIAL_ACTION"
    );
  }

  if (
    body.action ===
    "create_owner"
  ) {
    return createOwnerCredentials(
      body
    );
  }

  return resetOwnerPassword(
    body
  );
}
