import "server-only";

import type {
  ProductPackageAccess,
} from "@/lib/product-packages/resolver";

import {
  getVisibleWorkspaceApps,
  resolveWorkspaceApps,
} from "./visibility";
import type {
  WorkspaceAppKey,
  WorkspaceAppVisibilityDecision,
  WorkspaceMemberRole,
} from "./types";

export type ResolveWorkspaceAppsForServerInput = {
  role: WorkspaceMemberRole;
  productAccess: ProductPackageAccess;
  managedAppKeys?:
    readonly WorkspaceAppKey[];
  includeResearch?: boolean;
};

export function resolveWorkspaceAppsForServer(
  input:
    ResolveWorkspaceAppsForServerInput
): readonly WorkspaceAppVisibilityDecision[] {
  return resolveWorkspaceApps(
    input
  );
}

export function getVisibleWorkspaceAppsForServer(
  input:
    ResolveWorkspaceAppsForServerInput
): readonly WorkspaceAppVisibilityDecision[] {
  return getVisibleWorkspaceApps(
    input
  );
}
