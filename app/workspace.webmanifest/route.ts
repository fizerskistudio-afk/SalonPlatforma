import {
  createWorkspaceWebManifest,
} from "@/lib/pwa/workspace-manifest";

export const dynamic =
  "force-static";

export function GET():
  Response {
  return Response.json(
    createWorkspaceWebManifest(),
    {
      headers: {
        "Cache-Control":
          "public, max-age=3600, must-revalidate",
        "Content-Type":
          "application/manifest+json; charset=utf-8",
      },
    }
  );
}
