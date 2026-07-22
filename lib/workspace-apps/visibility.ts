import {
  hasProductEntitlement,
  type ProductPackageAccess,
} from "@/lib/product-packages/resolver";

import {
  WORKSPACE_APP_REGISTRY,
} from "./registry";
import type {
  WorkspaceAppDefinition,
  WorkspaceAppKey,
  WorkspaceAppVisibilityDecision,
  WorkspaceMemberRole,
} from "./types";

export type ResolveWorkspaceAppsInput = {
  role: WorkspaceMemberRole;
  productAccess: ProductPackageAccess;
  managedAppKeys?:
    readonly WorkspaceAppKey[];
  includeResearch?: boolean;
  registry?:
    readonly WorkspaceAppDefinition[];
};

function hasRequiredEntitlements(
  input: {
    app: WorkspaceAppDefinition;
    role: WorkspaceMemberRole;
    productAccess:
      ProductPackageAccess;
  }
): boolean {
  const roleAccess =
    input.app.roleAccess[
      input.role
    ];

  if (!roleAccess) {
    return false;
  }

  return roleAccess
    .requiredEntitlements
    .every(
      (entitlement) =>
        hasProductEntitlement(
          input.productAccess,
          entitlement
        )
    );
}

function hiddenDecision(
  app: WorkspaceAppDefinition,
  reason:
    WorkspaceAppVisibilityDecision[
      "reason"
    ]
): WorkspaceAppVisibilityDecision {
  return {
    app,
    state: "hidden",
    reason,
    route: null,
  };
}

function lockedDecision(
  app: WorkspaceAppDefinition,
  reason:
    WorkspaceAppVisibilityDecision[
      "reason"
    ]
): WorkspaceAppVisibilityDecision {
  return {
    app,
    state: "locked",
    reason,
    route: null,
  };
}

export function resolveWorkspaceApps(
  input: ResolveWorkspaceAppsInput
): readonly WorkspaceAppVisibilityDecision[] {
  const registry:
    readonly WorkspaceAppDefinition[] =
      input.registry ??
      WORKSPACE_APP_REGISTRY;

  const managedAppKeys =
    new Set(
      input.managedAppKeys ??
        []
    );

  const decisions =
    new Map<
      WorkspaceAppKey,
      WorkspaceAppVisibilityDecision
    >();

  for (
    const app of
    [...registry].sort(
      (left, right) =>
        left.order -
        right.order
    )
  ) {
    const roleAccess =
      app.roleAccess[
        input.role
      ];

    if (!roleAccess) {
      decisions.set(
        app.key,
        hiddenDecision(
          app,
          "role_not_allowed"
        )
      );
      continue;
    }

    if (
      app.status ===
      "retired"
    ) {
      decisions.set(
        app.key,
        hiddenDecision(
          app,
          "retired"
        )
      );
      continue;
    }

    if (
      app.status ===
      "research"
    ) {
      decisions.set(
        app.key,
        input.includeResearch
          ? lockedDecision(
              app,
              "research"
            )
          : hiddenDecision(
              app,
              "research"
            )
      );
      continue;
    }

    if (
      app.releasePolicy ===
      "hidden"
    ) {
      decisions.set(
        app.key,
        hiddenDecision(
          app,
          "hidden_release"
        )
      );
      continue;
    }

    if (
      app.status ===
      "coming_soon"
    ) {
      decisions.set(
        app.key,
        lockedDecision(
          app,
          "coming_soon"
        )
      );
      continue;
    }

    if (
      app.status === "beta" &&
      app.releasePolicy ===
        "managed" &&
      !managedAppKeys.has(
        app.key
      )
    ) {
      decisions.set(
        app.key,
        lockedDecision(
          app,
          "managed_beta"
        )
      );
      continue;
    }

    if (
      !hasRequiredEntitlements({
        app,
        role:
          input.role,
        productAccess:
          input.productAccess,
      })
    ) {
      decisions.set(
        app.key,
        lockedDecision(
          app,
          "package"
        )
      );
      continue;
    }

    const dependencyBlocked =
      app.dependencies.some(
        (dependencyKey) =>
          decisions.get(
            dependencyKey
          )?.state !==
          "available"
      );

    if (dependencyBlocked) {
      decisions.set(
        app.key,
        lockedDecision(
          app,
          "dependency"
        )
      );
      continue;
    }

    decisions.set(
      app.key,
      {
        app,
        state: "available",
        reason: "available",
        route:
          roleAccess.route,
      }
    );
  }

  return [...decisions.values()];
}

export function getVisibleWorkspaceApps(
  input: ResolveWorkspaceAppsInput
): readonly WorkspaceAppVisibilityDecision[] {
  return resolveWorkspaceApps(
    input
  ).filter(
    (decision) =>
      decision.state !==
      "hidden"
  );
}
