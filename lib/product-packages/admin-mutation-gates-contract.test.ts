import {
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
  ...segments:
    string[]
): string {
  return readFileSync(
    join(
      process.cwd(),
      ...segments
    ),
    "utf8"
  );
}

function functionSlice(
  source: string,
  functionName: string,
  nextFunctionName?: string
): string {
  const startMarker =
    `export async function ${functionName}`;

  const start =
    source.indexOf(
      startMarker
    );

  expect(
    start
  ).toBeGreaterThanOrEqual(
    0
  );

  if (!nextFunctionName) {
    return source.slice(
      start
    );
  }

  const end =
    source.indexOf(
      `export async function ${nextFunctionName}`,
      start +
        startMarker.length
    );

  expect(
    end
  ).toBeGreaterThan(
    start
  );

  return source.slice(
    start,
    end
  );
}

const ADMIN_GATE_SOURCE =
  readSource(
    "lib",
    "product-packages",
    "admin-gates-server.ts"
  );

const GALLERY_ACTION_SOURCE =
  readSource(
    "app",
    "admin",
    "(protected)",
    "gallery",
    "actions.ts"
  );

const GALLERY_UPLOAD_ROUTE_SOURCE =
  readSource(
    "app",
    "api",
    "admin",
    "gallery",
    "upload-url",
    "route.ts"
  );

const REVIEW_ACTION_SOURCE =
  readSource(
    "app",
    "admin",
    "(protected)",
    "reviews",
    "actions.ts"
  );

describe(
  "tenant-admin mutation package gates",
  () => {
    it(
      "exposes a shared package-only mutation access result",
      () => {
        expect(
          ADMIN_GATE_SOURCE
        ).toContain(
          "loadAdminProductFeatureMutationAccess"
        );

        expect(
          ADMIN_GATE_SOURCE
        ).toContain(
          '"PRODUCT_PACKAGE_REQUIRED"'
        );

        expect(
          ADMIN_GATE_SOURCE
        ).toMatch(
          /context\s*\.decision\s*\.entitled/
        );

        expect(
          ADMIN_GATE_SOURCE
        ).toContain(
          "getProductFeatureUpgradeGuidance"
        );
      }
    );

    it(
      "guards every gallery mutation before storage or database work",
      () => {
        const actionNames = [
          "createGalleryItemAction",
          "updateGalleryItemAction",
          "moveGalleryItemAction",
          "deleteGalleryItemAction",
        ] as const;

        for (
          let index = 0;
          index <
          actionNames.length;
          index += 1
        ) {
          const actionName =
            actionNames[
              index
            ];

          const nextActionName =
            actionNames[
              index +
              1
            ];

          const slice =
            functionSlice(
              GALLERY_ACTION_SOURCE,
              actionName,
              nextActionName
            );

          expect(
            slice
          ).toMatch(
            /await\s+loadAdminProductFeatureMutationAccess\(\s*"admin\.gallery"\s*\)/
          );

          const gateIndex =
            slice.indexOf(
              "await loadAdminProductFeatureMutationAccess("
            );

          const mutationCandidates = [
            ".insert(",
            ".update(",
            ".delete()",
            ".remove(",
          ]
            .map(
              (token) =>
                slice.indexOf(
                  token
                )
            )
            .filter(
              (position) =>
                position >=
                0
            );

          for (
            const mutationIndex of
            mutationCandidates
          ) {
            expect(
              gateIndex
            ).toBeLessThan(
              mutationIndex
            );
          }
        }
      }
    );

    it(
      "guards the signed gallery upload endpoint before parsing or signing",
      () => {
        expect(
          GALLERY_UPLOAD_ROUTE_SOURCE
        ).toMatch(
          /await\s+loadAdminProductFeatureMutationAccess\(\s*"admin\.gallery"\s*\)/
        );

        const gateIndex =
          GALLERY_UPLOAD_ROUTE_SOURCE.indexOf(
            "await loadAdminProductFeatureMutationAccess("
          );

        expect(
          gateIndex
        ).toBeLessThan(
          GALLERY_UPLOAD_ROUTE_SOURCE.indexOf(
            "await request.json()"
          )
        );

        expect(
          gateIndex
        ).toBeLessThan(
          GALLERY_UPLOAD_ROUTE_SOURCE.indexOf(
            ".createSignedUploadUrl("
          )
        );

        expect(
          GALLERY_UPLOAD_ROUTE_SOURCE
        ).toContain(
          "featureAccess.code"
        );

        expect(
          GALLERY_UPLOAD_ROUTE_SOURCE
        ).toContain(
          "403"
        );
      }
    );

    it(
      "guards both review mutation actions before RPC execution",
      () => {
        const moderateSlice =
          functionSlice(
            REVIEW_ACTION_SOURCE,
            "moderateReviewAction",
            "updateReviewOwnerReplyAction"
          );

        const replySlice =
          functionSlice(
            REVIEW_ACTION_SOURCE,
            "updateReviewOwnerReplyAction"
          );

        for (
          const slice of [
            moderateSlice,
            replySlice,
          ]
        ) {
          expect(
            slice
          ).toMatch(
            /await\s+loadAdminProductFeatureMutationAccess\(\s*"admin\.reviews"\s*\)/
          );

          expect(
            slice.indexOf(
              "await loadAdminProductFeatureMutationAccess("
            )
          ).toBeLessThan(
            slice.indexOf(
              "await supabase.rpc("
            )
          );
        }
      }
    );

    it(
      "returns controlled package messages instead of throwing after authentication",
      () => {
        for (
          const source of [
            GALLERY_ACTION_SOURCE,
            REVIEW_ACTION_SOURCE,
          ]
        ) {
          expect(
            source
          ).toContain(
            "featureAccess.message"
          );

          expect(
            source
          ).not.toContain(
            "PRODUCT_PACKAGE_REQUIRED_ERROR"
          );
        }
      }
    );

    it(
      "does not alter base Booking Page mutations",
      () => {
        expect(
          GALLERY_ACTION_SOURCE
        ).not.toContain(
          '"admin.bookings"'
        );

        expect(
          REVIEW_ACTION_SOURCE
        ).not.toContain(
          '"admin.settings"'
        );

        expect(
          GALLERY_UPLOAD_ROUTE_SOURCE
        ).not.toContain(
          '"booking.management"'
        );
      }
    );
  }
);
