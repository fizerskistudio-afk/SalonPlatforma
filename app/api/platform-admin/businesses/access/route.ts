import {
  revalidatePath,
} from "next/cache";

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  jsonError,
} from "@/lib/api/http";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  sendNotificationEmail,
} from "@/lib/notifications/delivery";

import {
  buildOwnerActivationEmail,
  getOwnerActivationDedupeKey,
  type OwnerActivationLinkType,
} from "@/lib/platform-admin/owner-activation";

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

type CreateOwnerRequestBody = {
  businessSlug?: unknown;
  email?: unknown;
};

type UpdateOwnerRequestBody = {
  businessSlug?: unknown;
  memberId?: unknown;
  isActive?: unknown;
  expectedUpdatedAt?: unknown;
};

type ResendOwnerActivationRequestBody = {
  businessSlug?: unknown;
  memberId?: unknown;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
};

type ExistingMembershipRow = {
  id: string;
  role:
    | "owner"
    | "manager"
    | "staff";
  is_active: boolean;
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

async function authorizePlatformAdmin() {
  const access =
    await getPlatformAdminAccess(
      "tenant.owner_access.write"
    );

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
    } =
      await adminClient
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

function getInviteRedirectUrl(
  request: NextRequest,
  businessSlug: string,
  email: string
): string {
  const callbackUrl =
    new URL(
      "/auth/callback",
      request.nextUrl.origin
    );

  const activationUrl =
    new URL(
      "/admin/accept-invite",
      request.nextUrl.origin
    );

  activationUrl.searchParams.set(
    "businessSlug",
    businessSlug
  );

  activationUrl.searchParams.set(
    "inviteEmail",
    email
  );

  callbackUrl
    .searchParams
    .set(
      "next",
      `${activationUrl.pathname}${activationUrl.search}`
    );

  return callbackUrl.toString();
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
      CreateOwnerRequestBody;

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
      "Unable to load business for owner access:",
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
      "Unable to find auth user for platform owner access:",
      error
    );

    return jsonError(
      500,
      "Korisnički nalog trenutno ne može da se proveri.",
      "AUTH_LOOKUP_FAILED"
    );
  }

  let createdNewAuthUser =
    false;

  if (!authUser) {
    const {
      data,
      error,
    } =
      await adminClient
        .auth
        .admin
        .inviteUserByEmail(
          email,
          {
            redirectTo:
              getInviteRedirectUrl(
                request,
                businessSlug,
                email
              ),
          }
        );

    if (
      error ||
      !data.user
    ) {
      console.error(
        "Unable to invite first business owner:",
        error
      );

      return jsonError(
        502,
        "Owner poziv nije poslat. Proveri Supabase Auth email podešavanja i redirect URL.",
        "OWNER_INVITE_FAILED"
      );
    }

    authUser =
      data.user;

    createdNewAuthUser =
      true;
  }

  const {
    data:
      existingMembershipData,
    error:
      existingMembershipError,
  } = await adminClient
    .from(
      "business_members"
    )
    .select(
      "id, role, is_active, updated_at"
    )
    .eq(
      "business_id",
      business.id
    )
    .eq(
      "user_id",
      authUser.id
    )
    .maybeSingle();

  if (
    existingMembershipError
  ) {
    if (
      createdNewAuthUser
    ) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          authUser.id
        );
    }

    console.error(
      "Unable to inspect owner membership:",
      existingMembershipError
    );

    return jsonError(
      500,
      "Postojeći pristup salonu nije mogao da se proveri.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  const existingMembership =
    existingMembershipData
      ? existingMembershipData as unknown as
          ExistingMembershipRow
      : null;

  if (
    existingMembership &&
    existingMembership.role ===
      "owner" &&
    existingMembership.is_active
  ) {
    return jsonError(
      409,
      "Ovaj korisnik već ima aktivan owner pristup salonu.",
      "OWNER_ALREADY_ACTIVE"
    );
  }

  const membershipResult =
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
            business.id
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
              business.id,

            user_id:
              authUser.id,

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
    membershipResult.error ||
    !membershipResult.data
  ) {
    if (
      createdNewAuthUser
    ) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          authUser.id
        );
    }

    console.error(
      "Unable to save platform owner membership:",
      membershipResult.error
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

  return NextResponse.json(
    {
      ok:
        true,

      message:
        createdNewAuthUser
          ? `Owner poziv je poslat na ${email} i pristup salonu ${business.name} je kreiran.`
          : `Postojeći nalog ${email} je povezan sa salonom ${business.name} kao owner.`,

      delivery:
        createdNewAuthUser
          ? "invite_sent"
          : "existing_user",

      member:
        membershipResult.data,
    },
    {
      status:
        201,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

export async function PUT(
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
      UpdateOwnerRequestBody;

  const businessSlug =
    getTrimmedString(
      body.businessSlug
    ).toLowerCase();

  const memberId =
    getTrimmedString(
      body.memberId
    );

  const expectedUpdatedAt =
    getTrimmedString(
      body.expectedUpdatedAt
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

  if (
    typeof body.isActive !==
    "boolean"
  ) {
    return jsonError(
      400,
      "Status owner pristupa nije ispravan.",
      "INVALID_ACTIVE_STATUS"
    );
  }

  if (
    !expectedUpdatedAt ||
    Number.isNaN(
      Date.parse(
        expectedUpdatedAt
      )
    )
  ) {
    return jsonError(
      400,
      "Verzija owner pristupa nije ispravna.",
      "INVALID_EXPECTED_UPDATED_AT"
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
      "Unable to load business before owner update:",
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
      currentMembershipData,
    error:
      currentMembershipError,
  } = await adminClient
    .from(
      "business_members"
    )
    .select(
      "id, role, is_active, updated_at"
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
    currentMembershipError
  ) {
    return jsonError(
      500,
      "Owner pristup trenutno ne može da se učita.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (
    !currentMembershipData
  ) {
    return jsonError(
      404,
      "Owner pristup nije pronađen.",
      "OWNER_MEMBERSHIP_NOT_FOUND"
    );
  }

  const {
    data:
      updatedMembershipData,
    error:
      updateError,
  } = await adminClient
    .from(
      "business_members"
    )
    .update({
      is_active:
        body.isActive,
    })
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
    .eq(
      "updated_at",
      expectedUpdatedAt
    )
    .select(
      "id, user_id, role, is_active, created_at, updated_at"
    )
    .maybeSingle();

  if (updateError) {
    const errorText =
      [
        updateError.message,
        updateError.details,
        updateError.hint,
        updateError.code,
      ]
        .filter(
          (
            value
          ): value is string =>
            typeof value ===
            "string"
        )
        .join(
          " "
        )
        .toUpperCase();

    if (
      errorText.includes(
        "LAST_ACTIVE_OWNER"
      )
    ) {
      return jsonError(
        409,
        "Poslednji aktivni owner ne može biti deaktiviran. Prvo dodaj drugog ownera.",
        "LAST_ACTIVE_OWNER"
      );
    }

    console.error(
      "Unable to update platform owner access:",
      updateError
    );

    return jsonError(
      500,
      "Owner pristup nije promenjen.",
      "OWNER_ACCESS_UPDATE_FAILED"
    );
  }

  if (
    !updatedMembershipData
  ) {
    return jsonError(
      409,
      "Owner pristup je promenjen u drugom tabu. Osveži stranicu i pokušaj ponovo.",
      "OWNER_ACCESS_VERSION_CONFLICT"
    );
  }

  revalidateBusinessAccess(
    businessSlug
  );

  return NextResponse.json(
    {
      ok:
        true,

      message:
        body.isActive
          ? "Owner pristup je ponovo aktiviran."
          : "Owner pristup je deaktiviran.",

      member:
        updatedMembershipData,
    },
    {
      status:
        200,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

export async function PATCH(
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
      ResendOwnerActivationRequestBody;

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
      "Unable to load business before owner activation resend:",
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
      "id, user_id, role, is_active"
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
      "Owner pristup nije pronađen.",
      "OWNER_MEMBERSHIP_NOT_FOUND"
    );
  }

  const membership =
    membershipData as unknown as {
      id: string;
      user_id: string;
      is_active: boolean;
    };

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
  } =
    await adminClient
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
      "Unable to load owner auth user before activation resend:",
      userError
    );

    return jsonError(
      500,
      "Owner korisnički nalog trenutno nije moguće učitati.",
      "OWNER_AUTH_USER_LOOKUP_FAILED"
    );
  }

  const authUser =
    userData.user;

  const email =
    authUser.email
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

  if (
    authUser.last_sign_in_at
  ) {
    return jsonError(
      409,
      "Owner je već koristio nalog. Za zaboravljenu lozinku koristićemo poseban password recovery tok.",
      "OWNER_ALREADY_SIGNED_IN"
    );
  }

  const linkType:
    OwnerActivationLinkType =
      authUser
        .email_confirmed_at
        ? "recovery"
        : "invite";

  const {
    data:
      generatedLinkData,
    error:
      generatedLinkError,
  } =
    await adminClient
      .auth
      .admin
      .generateLink({
        type:
          linkType,

        email,

        options: {
          redirectTo:
            getInviteRedirectUrl(
              request,
              businessSlug,
              email
            ),
        },
      });

  const actionLink =
    generatedLinkData
      ?.properties
      ?.action_link;

  if (
    generatedLinkError ||
    typeof actionLink !==
      "string" ||
    !actionLink
  ) {
    console.error(
      "Unable to generate owner activation link:",
      generatedLinkError
    );

    return jsonError(
      502,
      "Novi aktivacioni link nije mogao da se generiše.",
      "OWNER_ACTIVATION_LINK_FAILED"
    );
  }

  const content =
    buildOwnerActivationEmail({
      businessName:
        business.name,
      email,
      actionLink,
      linkType,
    });

  const delivery =
    await sendNotificationEmail({
      scope: "business",
      audience: "owner",
      templateKey:
        `owner_access_${linkType}`,
      dedupeKey:
        getOwnerActivationDedupeKey({
          businessId:
            business.id,
          memberId,
          linkType,
        }),
      recipient: email,
      businessId:
        business.id,
      subject:
        content.subject,
      html: content.html,
      text: content.text,
      metadata: {
        memberId,
        linkType,
      },
    });

  if (!delivery.ok) {
    return jsonError(
      502,
      "Aktivacioni email nije poslat. Pokušaj ponovo kasnije.",
      "OWNER_ACTIVATION_EMAIL_FAILED"
    );
  }

  if (
    delivery.status ===
    "skipped"
  ) {
    return jsonError(
      503,
      "Email delivery trenutno nije uključen. Aktivacioni email nije poslat.",
      "OWNER_ACTIVATION_DELIVERY_DISABLED"
    );
  }

  return NextResponse.json(
    {
      ok:
        true,

      message:
        delivery.skippedBecauseAlreadySent
          ? "Aktivacioni email je već obrađen u poslednjih 15 minuta; duplikat nije poslat."
          : "Aktivacioni email je obrađen kroz kontrolisani delivery tok.",

      delivery:
        linkType ===
          "invite"
          ? "invite"
          : "recovery",
    },
    {
      status:
        200,

      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}
