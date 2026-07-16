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

const ROOT =
  join(
    process.cwd(),
    "lib",
    "content-starter-packs"
  );

function source(
  file:
    string
): string {
  return readFileSync(
    join(
      ROOT,
      file
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

const MILESTONE =
  readFileSync(
    join(
      process.cwd(),
      "docs",
      "milestones",
      "CONTENT-STARTER-PACKS-01A-CONTRACT-REGISTRY-MANIFESTS.md"
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );

describe(
  "CONTENT-STARTER-PACKS-01A contract",
  () => {
    it.each([
      "domain.ts",
      "modules.ts",
      "universal-core.ts",
      "vertical-manifests.ts",
      "registry.ts",
      "validation.ts",
      "preview.ts",
      "registry.test.ts",
      "validation.test.ts",
      "preview.test.ts",
    ])(
      "ships %s",
      (
        file:
          string
      ) => {
        expect(
          existsSync(
            join(
              ROOT,
              file
            )
          )
        ).toBe(
          true
        );
      }
    );

    it(
      "locks all supported verticals and preview-only behavior",
      () => {
        for (
          const marker of [
            "beauty-general",
            "hair-salon",
            "barber",
            "nails",
            "lashes-brows",
            "massage",
            "spa",
            "waxing",
            "laser-hair-removal",
            "solarium",
            "preview → select → edit → confirm → apply",
            "01A ne menja `ROADMAP.md`",
          ]
        ) {
          expect(
            MILESTONE
          ).toContain(
            marker
          );
        }
      }
    );

    it(
      "contains no database or publishing boundary",
      () => {
        const inspected =
          [
            "registry.ts",
            "validation.ts",
            "preview.ts",
            "vertical-manifests.ts",
          ]
            .map(
              source
            )
            .join(
              "\n"
            );

        for (
          const marker of [
            "createAdminClient",
            "createBrowserClient",
            ".insert(",
            ".update(",
            ".upsert(",
            ".delete(",
            ".rpc(",
          ]
        ) {
          expect(
            inspected
          ).not.toContain(
            marker
          );
        }

        expect(
          inspected
        ).not.toContain(
          "applyStarterPack"
        );

        expect(
          inspected
        ).not.toContain(
          "publishStarterPack"
        );
      }
    );
  }
);
