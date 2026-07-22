"use client";

import {
  useEffect,
} from "react";

const WORKSPACE_SERVICE_WORKER_PATH =
  "/ordum-workspace-sw.js";

export default function WorkspaceServiceWorker() {
  useEffect(
    () => {
      if (
        !(
          "serviceWorker" in
          navigator
        ) ||
        !window.isSecureContext
      ) {
        return;
      }

      let disposed =
        false;

      async function registerWorkspaceServiceWorker() {
        const registration =
          await navigator.serviceWorker.register(
            WORKSPACE_SERVICE_WORKER_PATH,
            {
              scope: "/",
              updateViaCache:
                "none",
            }
          );

        if (!disposed) {
          await registration.update();
        }
      }

      void registerWorkspaceServiceWorker().catch(
        () => undefined
      );

      return () => {
        disposed = true;
      };
    },
    []
  );

  return null;
}
