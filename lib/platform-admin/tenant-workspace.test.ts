import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildTenantWorkspaceSections,
  getTenantWorkspaceSection,
  isTenantWorkspaceItemActive,
} from "./tenant-workspace";

describe(
  "platform-admin tenant workspace",
  () => {
    it(
      "builds the five-section information architecture for a super admin",
      () => {
        const sections =
          buildTenantWorkspaceSections(
            "lumiere-studio",
            [
              "tenant.profile.write",
              "tenant.branding.write",
              "tenant.theme.write",
              "tenant.owner_access.read",
              "tenant.catalog.write",
              "tenant.team.write",
              "tenant.settings.write",
              "tenant.schedule.write",
              "tenant.bookings.read",
            ]
          );

        expect(
          sections.map(
            (section) =>
              section.label
          )
        ).toEqual([
          "Pregled",
          "Branding",
          "Tema",
          "Pristup",
          "Operacije",
        ]);

        expect(
          sections.find(
            (section) =>
              section.id === "operations"
          )?.items
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              label: "Katalog",
            }),
            expect.objectContaining({
              label: "Rezervacije",
            }),
            expect.objectContaining({
              label: "Reviews",
              href: null,
              planned: true,
            }),
          ])
        );
      }
    );

    it(
      "hides inaccessible workspace sections instead of exposing dead links",
      () => {
        const sections =
          buildTenantWorkspaceSections(
            "lumiere-studio",
            [
              "tenant.read",
              "tenant.preview.read",
            ]
          );

        expect(
          sections.map(
            (section) =>
              section.id
          )
        ).toEqual([
          "overview",
        ]);
      }
    );

    it(
      "keeps Sales inside permitted branding and operations routes",
      () => {
        const sections =
          buildTenantWorkspaceSections(
            "demo-salon",
            [
              "tenant.profile.write",
              "tenant.branding.write",
              "tenant.theme.write",
              "tenant.catalog.write",
              "tenant.team.write",
              "tenant.settings.write",
              "tenant.schedule.write",
            ]
          );
        const operations =
          sections.find(
            (section) =>
              section.id === "operations"
          );

        expect(
          sections.some(
            (section) =>
              section.id === "access"
          )
        ).toBe(false);
        expect(
          operations?.items.some(
            (item) =>
              item.id === "bookings"
          )
        ).toBe(false);
      }
    );

    it(
      "maps nested employee routes to Operations and their parent item",
      () => {
        const pathname =
          "/platform-admin/businesses/demo-salon/employees/jelena/edit";

        expect(
          getTenantWorkspaceSection(
            pathname,
            "demo-salon"
          )
        ).toBe(
          "operations"
        );
        expect(
          isTenantWorkspaceItemActive(
            pathname,
            "/platform-admin/businesses/demo-salon/employees"
          )
        ).toBe(true);
      }
    );
  }
);
