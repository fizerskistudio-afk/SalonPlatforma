import type {
  WorkspaceAppKey,
  WorkspaceMemberRole,
} from "./types";

export const WORKSPACE_ROOT_ROUTE =
  "/workspace" as const;

export const WORKSPACE_APP_ROUTES = {
  studio: {
    owner: "/admin",
    manager: "/admin",
    staff: "/staff",
  },
  content: {
    owner: "/workspace/content",
    manager: "/workspace/content",
  },
  finance: {
    owner: "/workspace/finance",
    manager: "/workspace/finance",
  },
  operations: {
    owner:
      "/workspace/operations",
    manager:
      "/workspace/operations",
  },
  store: {
    owner: "/workspace/store",
    manager: "/workspace/store",
  },
} as const satisfies
  Record<
    WorkspaceAppKey,
    Partial<
      Record<
        WorkspaceMemberRole,
        string
      >
    >
  >;

export function getWorkspaceAppRoute(
  appKey: WorkspaceAppKey,
  role: WorkspaceMemberRole
): string | null {
  const roleRoutes =
    WORKSPACE_APP_ROUTES[
      appKey
    ] as Partial<
      Record<
        WorkspaceMemberRole,
        string
      >
    >;

  return (
    roleRoutes[role] ??
    null
  );
}
