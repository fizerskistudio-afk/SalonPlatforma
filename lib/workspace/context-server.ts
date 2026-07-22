import "server-only";

import {
  redirect,
} from "next/navigation";

import {
  getAdminContext,
} from "@/lib/auth/admin";
import {
  getStaffContext,
} from "@/lib/auth/staff";
import {
  loadProductPackageAccessForBusinessId,
} from "@/lib/product-packages/access-server";
import {
  buildBusinessPublicLinks,
} from "@/lib/platform-admin/business-public-links";
import {
  getVisibleWorkspaceAppsForServer,
} from "@/lib/workspace-apps/server";

import {
  getWorkspaceIdentityOrder,
  type WorkspaceContext,
  type WorkspaceContextIntent,
  type WorkspaceIdentityKind,
} from "./context";

async function loadWorkspaceApps(
  input: {
    businessId: string;
    role:
      WorkspaceContext["role"];
  }
): Promise<
  WorkspaceContext["apps"]
> {
  const productAccess =
    await loadProductPackageAccessForBusinessId(
      input.businessId
    );

  if (!productAccess) {
    throw new Error(
      "Paket aktivnog salona nije moguće učitati."
    );
  }

  return getVisibleWorkspaceAppsForServer({
    role:
      input.role,
    productAccess:
      productAccess.access,
  });
}

async function resolveAdminWorkspaceContext():
  Promise<WorkspaceContext | null> {
  const admin =
    await getAdminContext();

  if (!admin) {
    return null;
  }

  if (
    admin.mustChangePassword
  ) {
    redirect(
      "/admin/change-password"
    );
  }

  if (
    admin.requiresTenantSelection
  ) {
    redirect(
      "/admin/select-business"
    );
  }

  const publicLinks =
    buildBusinessPublicLinks(
      admin.business.slug
    );

  return {
    identityKind: "admin",
    userId:
      admin.userId,
    email:
      admin.email,
    displayName:
      admin.business.name,
    role:
      admin.role,
    tenantCount:
      admin.tenants.length,

    business: {
      id:
        admin.business.id,
      name:
        admin.business.name,
      slug:
        admin.business.slug,
      publicUrl:
        publicLinks.publicUrl,
    },

    apps:
      await loadWorkspaceApps({
        businessId:
          admin.business.id,
        role:
          admin.role,
      }),
  };
}

async function resolveStaffWorkspaceContext():
  Promise<WorkspaceContext | null> {
  const staff =
    await getStaffContext();

  if (!staff) {
    return null;
  }

  if (
    staff.mustChangePassword
  ) {
    redirect(
      "/staff/change-password"
    );
  }

  if (!staff.employee) {
    redirect(
      "/staff/setup-required"
    );
  }

  const publicLinks =
    buildBusinessPublicLinks(
      staff.business.slug
    );

  return {
    identityKind: "staff",
    userId:
      staff.userId,
    email:
      staff.email,
    displayName:
      staff.employee.name,
    role: "staff",
    tenantCount: 1,

    business: {
      id:
        staff.business.id,
      name:
        staff.business.name,
      slug:
        staff.business.slug,
      publicUrl:
        publicLinks.publicUrl,
    },

    apps:
      await loadWorkspaceApps({
        businessId:
          staff.business.id,
        role: "staff",
      }),
  };
}

async function resolveWorkspaceIdentity(
  identityKind:
    WorkspaceIdentityKind
): Promise<WorkspaceContext | null> {
  return identityKind ===
    "staff"
    ? resolveStaffWorkspaceContext()
    : resolveAdminWorkspaceContext();
}

export async function requireWorkspaceContext(
  intent:
    WorkspaceContextIntent | null
): Promise<WorkspaceContext> {
  for (
    const identityKind of
    getWorkspaceIdentityOrder(
      intent
    )
  ) {
    const context =
      await resolveWorkspaceIdentity(
        identityKind
      );

    if (context) {
      return context;
    }
  }

  if (intent === "admin") {
    redirect(
      "/admin/login"
    );
  }

  if (intent === "staff") {
    redirect(
      "/staff/login"
    );
  }

  redirect(
    "/workspace/login"
  );
}
