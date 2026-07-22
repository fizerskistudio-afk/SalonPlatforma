import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getOrdumPwaSurface,
  ORDUM_PWA_SURFACE_KEYS,
  ORDUM_PWA_SURFACES,
} from "./registry";

describe(
  "ORDUM-PWA-FOUNDATION-01 registry",
  () => {
    it(
      "razdvaja Workspace i Network identity contract",
      () => {
        expect(
          ORDUM_PWA_SURFACE_KEYS
        ).toEqual([
          "workspace",
          "network",
        ]);

        expect(
          Object.keys(
            ORDUM_PWA_SURFACES
          )
        ).toEqual([
          "workspace",
          "network",
        ]);
      }
    );

    it(
      "izlaže samo instalabilni Workspace foundation",
      () => {
        const workspace =
          getOrdumPwaSurface(
            "workspace"
          );

        expect(
          workspace.status
        ).toBe(
          "live_foundation"
        );

        expect(
          workspace.exposure
        ).toBe(
          "manifest"
        );

        expect(
          workspace.startUrl
        ).toBe(
          "/workspace"
        );

        expect(
          workspace.scope
        ).toBe("/");

        expect(
          workspace.serviceWorkerPath
        ).toBe(
          "/ordum-workspace-sw.js"
        );

        expect(
          workspace.offlineFallbackPath
        ).toBe(
          "/pwa/workspace/offline.html"
        );
      }
    );

    it(
      "drži Network kao contract-only bez lažne instalabilnosti",
      () => {
        const network =
          getOrdumPwaSurface(
            "network"
          );

        expect(
          network.status
        ).toBe(
          "planned"
        );

        expect(
          network.exposure
        ).toBe(
          "contract_only"
        );

        expect(
          network.serviceWorkerPath
        ).toBeNull();

        expect(
          network.offlineFallbackPath
        ).toBeNull();
      }
    );

    it(
      "dodeljuje screenshot ownership bez izmišljanja screenshot fajlova",
      () => {
        expect(
          ORDUM_PWA_SURFACES
            .workspace
            .screenshotOwner
        ).toBe(
          "workspace"
        );

        expect(
          ORDUM_PWA_SURFACES
            .network
            .screenshotOwner
        ).toBe(
          "network"
        );

        expect(
          ORDUM_PWA_SURFACES
            .workspace
            .screenshots
        ).toEqual([]);

        expect(
          ORDUM_PWA_SURFACES
            .network
            .screenshots
        ).toEqual([]);
      }
    );
  }
);
