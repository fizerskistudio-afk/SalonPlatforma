import "server-only";

import {
  revalidatePath,
} from "next/cache";

import type {
  AdminContext,
} from "@/lib/auth/admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  jsonError,
  jsonResponse,
} from "./http";

import {
  findAuthUserByEmail,
  hasOtherActiveMembership,
  loadActiveEmployee,
  loadExactDirectMember,
  loadMembershipByUser,
  saveDirectMembership,
} from "./repository";

import type {
  DirectMemberRole,
  MemberCredentialRequestBody,
  MembershipRow,
} from "./types";

import {
  EMAIL_PATTERN,
  UUID_PATTERN,
  generateTemporaryPassword,
  getAppMetadata,
  getTrimmedString,
  isDirectMemberRole,
} from "./validation";

function revalidateMembers() {
  revalidatePath(
    "/admin/members"
  );
}

function getLoginPath(
  role: DirectMemberRole
): string {
  return role === "staff"
    ? "/staff/login"
    : "/admin/login";
}

export async function createMemberCredentials(
  admin: AdminContext,
  body: MemberCredentialRequestBody
) {
  const email =
    getTrimmedString(
      body.email
    ).toLowerCase();

  if (
    !email ||
    email.length > 254 ||
    !EMAIL_PATTERN.test(
      email
    )
  ) {
    return jsonError(
      400,
      "Unesi ispravnu email adresu.",
      "INVALID_EMAIL"
    );
  }

  if (
    !isDirectMemberRole(
      body.role
    )
  ) {
    return jsonError(
      400,
      "Direktni kredencijali su dostupni samo za manager i staff uloge.",
      "INVALID_ROLE"
    );
  }

  const role =
    body.role;

  const employeeId =
    role === "staff"
      ? getTrimmedString(
          body.employeeId
        )
      : null;

  if (
    role === "staff" &&
    !UUID_PATTERN.test(
      employeeId ?? ""
    )
  ) {
    return jsonError(
      400,
      "Izaberi zaposlenog za staff nalog.",
      "STAFF_EMPLOYEE_REQUIRED"
    );
  }

  if (
    role === "staff" &&
    employeeId
  ) {
    try {
      const employee =
        await loadActiveEmployee(
          admin.business.id,
          employeeId
        );

      if (!employee) {
        return jsonError(
          404,
          "Izabrani zaposleni nije aktivan ili ne pripada ovom salonu.",
          "EMPLOYEE_NOT_FOUND"
        );
      }
    } catch (error) {
      console.error(
        "Unable to validate staff employee before credential creation:",
        error
      );

      return jsonError(
        500,
        "Zaposleni trenutno ne može da se proveri.",
        "EMPLOYEE_LOOKUP_FAILED"
      );
    }
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
      "Unable to find auth user before direct member credential creation:",
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
            "tenant_owner",
          credential_issued_at:
            issuedAt,
          credential_business_id:
            admin.business.id,
          credential_role:
            role,
        },
      });

    if (
      error ||
      !data.user
    ) {
      console.error(
        "Unable to create direct member auth user:",
        error
      );

      return jsonError(
        502,
        "Korisnički nalog nije kreiran.",
        "MEMBER_AUTH_CREATE_FAILED"
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
      await loadMembershipByUser(
        admin.business.id,
        authUser.id
      );
  } catch (error) {
    if (createdUserId) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          createdUserId
        );
    }

    console.error(
      "Unable to inspect direct member membership:",
      error
    );

    return jsonError(
      500,
      "Postojeće članstvo nije moglo da se proveri.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (
    existingMembership?.is_active
  ) {
    if (createdUserId) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          createdUserId
        );
    }

    return jsonError(
      409,
      "Ovaj korisnik već ima aktivan pristup salonu.",
      "MEMBER_ALREADY_ACTIVE"
    );
  }

  let membership:
    MembershipRow;

  try {
    membership =
      await saveDirectMembership({
        businessId:
          admin.business.id,
        userId:
          authUser.id,
        role,
        employeeId,
        existingMembership,
      });
  } catch (error) {
    if (createdUserId) {
      await adminClient
        .auth
        .admin
        .deleteUser(
          createdUserId
        );
    }

    console.error(
      "Unable to save direct member membership:",
      error
    );

    return jsonError(
      500,
      "Članstvo nije sačuvano.",
      "MEMBERSHIP_SAVE_FAILED"
    );
  }

  revalidateMembers();

  if (temporaryPassword) {
    return jsonResponse(
      {
        ok: true,
        message:
          `${role === "staff" ? "Staff" : "Manager"} nalog ${email} je kreiran. Privremena lozinka se prikazuje samo sada.`,
        delivery:
          "temporary_password",
        member:
          membership,
        credentials: {
          email,
          temporaryPassword,
          loginPath:
            getLoginPath(
              role
            ),
          memberId:
            membership.id,
          role,
        },
      },
      201
    );
  }

  return jsonResponse(
    {
      ok: true,
      message:
        `Postojeći nalog ${email} je povezan sa salonom ${admin.business.name}. Lozinka nije menjana.`,
      delivery:
        "existing_user",
      member:
        membership,
    },
    201
  );
}

export async function resetMemberPassword(
  admin: AdminContext,
  body: MemberCredentialRequestBody
) {
  const memberId =
    getTrimmedString(
      body.memberId
    );

  if (
    !UUID_PATTERN.test(
      memberId
    )
  ) {
    return jsonError(
      400,
      "Članstvo nema ispravan ID.",
      "INVALID_MEMBER_ID"
    );
  }

  let membership:
    MembershipRow | null;

  try {
    membership =
      await loadExactDirectMember(
        admin.business.id,
        memberId
      );
  } catch (error) {
    console.error(
      "Unable to load exact direct member before password reset:",
      error
    );

    return jsonError(
      500,
      "Članstvo trenutno ne može da se učita.",
      "MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  if (!membership) {
    return jsonError(
      404,
      "Manager ili staff članstvo nije pronađeno za ovaj salon.",
      "MEMBERSHIP_NOT_FOUND"
    );
  }

  if (!membership.is_active) {
    return jsonError(
      409,
      "Članstvo je deaktivirano. Prvo ga ponovo aktiviraj.",
      "MEMBERSHIP_INACTIVE"
    );
  }

  if (
    membership.role ===
      "staff" &&
    !membership.employee_id
  ) {
    return jsonError(
      409,
      "Poveži staff nalog sa zaposlenim pre resetovanja lozinke.",
      "STAFF_EMPLOYEE_REQUIRED"
    );
  }

  try {
    const sharedAccount =
      await hasOtherActiveMembership(
        admin.business.id,
        membership.user_id
      );

    if (sharedAccount) {
      return jsonError(
        409,
        "Ovaj korisnički nalog je aktivan i u drugom salonu. Tenant owner ne sme menjati njegovu globalnu lozinku; koristi email recovery ili platform-admin.",
        "SHARED_ACCOUNT_PASSWORD_RESET_BLOCKED"
      );
    }
  } catch (error) {
    console.error(
      "Unable to check other memberships before password reset:",
      error
    );

    return jsonError(
      500,
      "Bezbednosna provera naloga nije uspela.",
      "OTHER_MEMBERSHIP_LOOKUP_FAILED"
    );
  }

  const adminClient =
    createAdminClient();

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
      "Unable to load member auth user before password reset:",
      userError
    );

    return jsonError(
      500,
      "Korisnički nalog trenutno nije moguće učitati.",
      "MEMBER_AUTH_USER_LOOKUP_FAILED"
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
      "Korisnički nalog nema ispravnu email adresu.",
      "MEMBER_EMAIL_MISSING"
    );
  }

  const role =
    membership.role as
      DirectMemberRole;

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
            "tenant_owner_reset",
          credential_issued_at:
            new Date().toISOString(),
          credential_business_id:
            admin.business.id,
          credential_role:
            role,
        },
      }
    );

  if (updateError) {
    console.error(
      "Unable to reset direct member password:",
      updateError
    );

    return jsonError(
      502,
      "Privremena lozinka nije postavljena.",
      "MEMBER_PASSWORD_RESET_FAILED"
    );
  }

  revalidateMembers();

  return jsonResponse({
    ok: true,
    message:
      `Nova privremena lozinka je generisana za ${email}. Prikazuje se samo sada.`,
    delivery:
      "temporary_password",
    credentials: {
      email,
      temporaryPassword,
      loginPath:
        getLoginPath(
          role
        ),
      memberId:
        membership.id,
      role,
    },
  });
}
