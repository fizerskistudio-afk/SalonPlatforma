import type {
  WorkspaceAppVisibilityDecision,
  WorkspaceMemberRole,
} from "@/lib/workspace-apps/types";

export const WORKSPACE_CONTEXT_INTENTS = [
  "admin",
  "staff",
] as const;

export type WorkspaceContextIntent =
  (typeof WORKSPACE_CONTEXT_INTENTS)[number];

export type WorkspaceIdentityKind =
  WorkspaceContextIntent;

export function normalizeWorkspaceContextIntent(
  value:
    | string
    | string[]
    | undefined
): WorkspaceContextIntent | null {
  const candidate =
    Array.isArray(value)
      ? value[0]
      : value;

  return candidate === "admin" ||
    candidate === "staff"
    ? candidate
    : null;
}

export function getWorkspaceIdentityOrder(
  intent:
    WorkspaceContextIntent | null
): readonly WorkspaceIdentityKind[] {
  if (intent) {
    return [
      intent,
    ];
  }

  return [
    "admin",
    "staff",
  ];
}

export type WorkspaceContext = {
  identityKind:
    WorkspaceIdentityKind;
  userId: string;
  email: string | null;
  displayName: string;
  role: WorkspaceMemberRole;
  tenantCount: number;

  business: {
    id: string;
    name: string;
    slug: string;
    publicUrl: string;
  };

  apps:
    readonly WorkspaceAppVisibilityDecision[];
};
