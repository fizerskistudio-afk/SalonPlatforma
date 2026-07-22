import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createWorkspaceWebManifest,
} from "./workspace-manifest";

describe(
  "ORDUM-PWA-FOUNDATION-01 Workspace manifest",
  () => {
    it(
      "ima stabilan Workspace identitet i root scope",
      () => {
        const manifest =
          createWorkspaceWebManifest();

        expect(
          manifest.id
        ).toBe(
          "/workspace"
        );

        expect(
          manifest.name
        ).toBe(
          "Ordum Workspace"
        );

        expect(
          manifest.start_url
        ).toBe(
          "/workspace"
        );

        expect(
          manifest.scope
        ).toBe("/");

        expect(
          manifest.display
        ).toBe(
          "standalone"
        );
      }
    );

    it(
      "poseduje installability ikone",
      () => {
        const manifest =
          createWorkspaceWebManifest();

        expect(
          manifest.icons
            .map(
              (icon) =>
                icon.sizes
            )
        ).toEqual(
          expect.arrayContaining([
            "192x192",
            "512x512",
          ])
        );

        expect(
          manifest.icons.some(
            (icon) =>
              icon.purpose ===
              "maskable"
          )
        ).toBe(true);
      }
    );

    it(
      "koristi postojeće admin i staff tokove kao shortcut-e",
      () => {
        const manifest =
          createWorkspaceWebManifest();

        expect(
          manifest.shortcuts
            .map(
              (shortcut) =>
                shortcut.url
            )
        ).toEqual([
          "/admin",
          "/staff",
        ]);
      }
    );
  }
);
