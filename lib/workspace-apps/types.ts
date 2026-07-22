import type {
  ProductEntitlement,
} from "@/lib/product-packages/registry";
import type {
  ProductReleasePolicy,
  ProductRolloutStatus,
} from "@/lib/product-strategy/rollout-registry";

export const WORKSPACE_APP_KEYS = [
  "studio",
  "content",
  "finance",
  "operations",
  "store",
] as const;

export type WorkspaceAppKey =
  (typeof WORKSPACE_APP_KEYS)[number];

export const WORKSPACE_MEMBER_ROLES = [
  "owner",
  "manager",
  "staff",
] as const;

export type WorkspaceMemberRole =
  (typeof WORKSPACE_MEMBER_ROLES)[number];

export const WORKSPACE_APP_ICON_KEYS = [
  "studio",
  "content",
  "finance",
  "operations",
  "store",
] as const;

export type WorkspaceAppIconKey =
  (typeof WORKSPACE_APP_ICON_KEYS)[number];

export type WorkspaceAppNavigation =
  | "primary"
  | "secondary"
  | "hidden";

export type WorkspaceAppRoleAccess = {
  route: string;
  requiredEntitlements:
    readonly ProductEntitlement[];
};

export type WorkspaceAppDefinition = {
  key: WorkspaceAppKey;
  name: string;
  shortName: string;
  description: string;
  status: ProductRolloutStatus;
  releasePolicy: ProductReleasePolicy;
  iconKey: WorkspaceAppIconKey;
  navigation: WorkspaceAppNavigation;
  order: number;
  dependencies:
    readonly WorkspaceAppKey[];
  roleAccess:
    Partial<
      Record<
        WorkspaceMemberRole,
        WorkspaceAppRoleAccess
      >
    >;
};

export type WorkspaceAppVisibilityState =
  | "available"
  | "locked"
  | "hidden";

export type WorkspaceAppVisibilityReason =
  | "available"
  | "role_not_allowed"
  | "package"
  | "dependency"
  | "managed_beta"
  | "coming_soon"
  | "research"
  | "retired"
  | "hidden_release";

export type WorkspaceAppVisibilityDecision = {
  app: WorkspaceAppDefinition;
  state: WorkspaceAppVisibilityState;
  reason: WorkspaceAppVisibilityReason;
  route: string | null;
};
