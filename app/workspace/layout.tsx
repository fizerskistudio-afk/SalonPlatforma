import type {
  Metadata,
} from "next";
import type {
  ReactNode,
} from "react";

import WorkspaceServiceWorker from "@/components/pwa/WorkspaceServiceWorker";

export const metadata:
  Metadata = {
    applicationName:
      "Ordum Workspace",

    manifest:
      "/workspace.webmanifest",

    icons: {
      icon: [
        {
          url:
            "/pwa/workspace/icon-192.png",
          sizes:
            "192x192",
          type:
            "image/png",
        },
        {
          url:
            "/pwa/workspace/icon-512.png",
          sizes:
            "512x512",
          type:
            "image/png",
        },
      ],

      apple: [
        {
          url:
            "/pwa/workspace/apple-touch-icon.png",
          sizes:
            "180x180",
          type:
            "image/png",
        },
      ],
    },

    appleWebApp: {
      capable: true,
      title:
        "Ordum Workspace",
      statusBarStyle:
        "black-translucent",
    },
  };

type WorkspaceLayoutProps = {
  children:
    ReactNode;
};

export default function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  return (
    <>
      <WorkspaceServiceWorker />
      {children}
    </>
  );
}
