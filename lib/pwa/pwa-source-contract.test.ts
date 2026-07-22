import {
  existsSync,
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

function readSource(
  relativePath: string
): string {
  return readFileSync(
    join(
      process.cwd(),
      relativePath
    ),
    "utf8"
  );
}

describe(
  "ORDUM-PWA-FOUNDATION-01 source contract",
  () => {
    it(
      "Workspace layout poseduje zaseban manifest i service-worker registraciju",
      () => {
        const layout =
          readSource(
            "app/workspace/layout.tsx"
          );

        expect(
          layout
        ).toContain(
          '"/workspace.webmanifest"'
        );

        expect(
          layout
        ).toContain(
          "WorkspaceServiceWorker"
        );

        const bridge =
          readSource(
            "components/pwa/WorkspaceServiceWorker.tsx"
          );

        expect(
          bridge
        ).toContain(
          '"/ordum-workspace-sw.js"'
        );

        expect(
          bridge
        ).toContain(
          'scope: "/"'
        );

        expect(
          bridge
        ).toContain(
          "updateViaCache"
        );
      }
    );

    it(
      "worker precache sadrži samo javni statični Workspace shell",
      () => {
        const worker =
          readSource(
            "public/ordum-workspace-sw.js"
          );

        const precacheStart =
          worker.indexOf(
            "const PRECACHE_URLS ="
          );

        const precacheEnd =
          worker.indexOf(
            "];",
            precacheStart
          );

        const precacheBlock =
          worker.slice(
            precacheStart,
            precacheEnd
          );

        expect(
          precacheBlock
        ).toContain(
          "OFFLINE_FALLBACK_URL"
        );

        expect(
          precacheBlock
        ).not.toContain(
          '"/admin"'
        );

        expect(
          precacheBlock
        ).not.toContain(
          '"/staff"'
        );

        expect(
          precacheBlock
        ).not.toContain(
          '"/api"'
        );

        expect(
          worker
        ).not.toContain(
          "cache.put("
        );
      }
    );

    it(
      "Workspace navigation koristi network-only odgovor i samo statični offline fallback",
      () => {
        const worker =
          readSource(
            "public/ordum-workspace-sw.js"
          );

        expect(
          worker
        ).toContain(
          'request.mode ==='
        );

        expect(
          worker
        ).toContain(
          'pathname.startsWith('
        );

        expect(
          worker
        ).toContain(
          '"/workspace"'
        );

        expect(
          worker
        ).toContain(
          'cache:'
        );

        expect(
          worker
        ).toContain(
          '"no-store"'
        );

        expect(
          worker
        ).toMatch(
          /caches\.match\(\s*OFFLINE_FALLBACK_URL\s*\)/
        );
      }
    );

    it(
      "private server odgovori imaju no-store granicu",
      () => {
        const proxy =
          readSource(
            "proxy.ts"
          );

        expect(
          proxy
        ).toContain(
          '"Cache-Control"'
        );

        expect(
          proxy
        ).toContain(
          '"private, no-store, max-age=0, must-revalidate"'
        );
      }
    );

    it(
      "Network nema izloženu manifest rutu pre Network shell milestone-a",
      () => {
        expect(
          existsSync(
            join(
              process.cwd(),
              "app/network.webmanifest/route.ts"
            )
          )
        ).toBe(false);
      }
    );
  }
);
