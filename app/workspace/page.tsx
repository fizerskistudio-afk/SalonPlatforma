import type {
  Metadata,
} from "next";

import WorkspaceLauncher from "@/components/workspace/WorkspaceLauncher";
import {
  normalizeWorkspaceContextIntent,
} from "@/lib/workspace/context";
import {
  requireWorkspaceContext,
} from "@/lib/workspace/context-server";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export const metadata:
  Metadata = {
    title:
      "Ordum Workspace",
    description:
      "Privatni launcher poslovnih aplikacija aktivnog salona.",
    robots: {
      index: false,
      follow: false,
    },
  };

type WorkspacePageProps = {
  searchParams:
    Promise<{
      context?:
        | string
        | string[];
    }>;
};

export default async function WorkspacePage({
  searchParams,
}: WorkspacePageProps) {
  const query =
    await searchParams;

  const workspace =
    await requireWorkspaceContext(
      normalizeWorkspaceContextIntent(
        query.context
      )
    );

  return (
    <WorkspaceLauncher
      workspace={
        workspace
      }
    />
  );
}
