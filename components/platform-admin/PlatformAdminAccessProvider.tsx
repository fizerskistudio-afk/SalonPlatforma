"use client";

import {
  createContext,
  useContext,
  type PropsWithChildren,
} from "react";

import type {
  PlatformAdminPermission,
  PlatformAdminRole,
} from "@/lib/auth/platform-admin-policy";

type PlatformAdminClientAccess = {
  role: PlatformAdminRole;
  permissions:
    readonly PlatformAdminPermission[];
};

const PlatformAdminAccessContext =
  createContext<
    PlatformAdminClientAccess |
    null
  >(
    null
  );

export default function PlatformAdminAccessProvider({
  access,
  children,
}: PropsWithChildren<{
  access:
    PlatformAdminClientAccess;
}>) {
  return (
    <PlatformAdminAccessContext.Provider
      value={access}
    >
      {children}
    </PlatformAdminAccessContext.Provider>
  );
}

export function usePlatformAdminAccess():
  PlatformAdminClientAccess {
  const access =
    useContext(
      PlatformAdminAccessContext
    );

  if (!access) {
    throw new Error(
      "PlatformAdminAccessProvider is missing."
    );
  }

  return access;
}

export function usePlatformAdminPermission(
  permission: PlatformAdminPermission
): boolean {
  return usePlatformAdminAccess()
    .permissions
    .includes(
      permission
    );
}
