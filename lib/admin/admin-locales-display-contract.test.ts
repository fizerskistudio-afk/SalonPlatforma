import {
  readFileSync,
} from "node:fs";
import {
  resolve,
} from "node:path";
import {
  describe,
  expect,
  it,
} from "vitest";

function source(
  path: string
): string {
  return readFileSync(
    resolve(
      process.cwd(),
      path
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

describe(
  "admin locale display completion contract",
  () => {
    const helper =
      source(
        "lib/admin/localized-text.ts"
      );

    const services =
      source(
        "components/admin/AdminServicesView.tsx"
      );

    const team =
      source(
        "components/admin/AdminTeamView.tsx"
      );

    const assignments =
      source(
        "components/admin/team/EmployeeServiceManagement.tsx"
      );

    const settings =
      source(
        "components/admin/AdminSettingsView.tsx"
      );

    const settingsLoader =
      source(
        "lib/admin/settings.ts"
      );

    const bookings =
      source(
        "lib/admin/bookings.ts"
      );

    const bookingView =
      source(
        "components/admin/AdminBookingsView.tsx"
      );

    const dashboard =
      source(
        "app/admin/(protected)/page.tsx"
      );

    const pending =
      source(
        "components/admin/DashboardPendingBookings.tsx"
      );

    const catalog =
      source(
        "lib/catalog/server.ts"
      );

    it(
      "centralizes tenant-aware localized display and search",
      () => {
        expect(
          helper
        ).toContain(
          "getAdminLocalizedText"
        );

        expect(
          helper
        ).toContain(
          "getAdminLocalizedSearchValues"
        );

        expect(
          helper
        ).toContain(
          "getAdminLocaleOptions"
        );
      }
    );

    it(
      "preserves unrelated team presentation helpers",
      () => {
        expect(
          team
        ).toContain(
          "function getInitials"
        );

        expect(
          team
        ).toContain(
          "getInitials("
        );
      }
    );

    it(
      "removes the original three-language display/search assumptions",
      () => {
        for (
          const view of
          [
            services,
            team,
            assignments,
            settings,
            bookingView,
            dashboard,
            pending,
          ]
        ) {
          expect(
            view
          ).not.toContain(
            "name.en ||"
          );

          expect(
            view
          ).not.toContain(
            "name.mk ||"
          );

          expect(
            view
          ).not.toContain(
            "name.sq ||"
          );
        }

        expect(
          services
        ).not.toContain(
          "service.name.en"
        );

        expect(
          team
        ).not.toContain(
          "employee.title.en"
        );

        expect(
          settings
        ).not.toContain(
          "const locales: AdminDefaultLocale[]"
        );
      }
    );

    it(
      "passes tenant locale configuration through admin views",
      () => {
        for (
          const view of
          [
            services,
            team,
            assignments,
            bookingView,
            dashboard,
            pending,
          ]
        ) {
          expect(
            view
          ).toContain(
            "defaultLocale"
          );

          expect(
            view
          ).toContain(
            "supportedLocales"
          );
        }
      }
    );

    it(
      "keeps the real content default locale in settings",
      () => {
        expect(
          settingsLoader
        ).toContain(
          "export type AdminDefaultLocale =\n  LocaleCode;"
        );

        expect(
          settingsLoader
        ).not.toContain(
          'defaultContentLocale === "mk"'
        );

        expect(
          settings
        ).toContain(
          "business.defaultContentLocale"
        );
      }
    );

    it(
      "loads booking locale configuration from the tenant",
      () => {
        expect(
          bookings
        ).toContain(
          "default_locale"
        );

        expect(
          bookings
        ).toContain(
          "supported_locales"
        );

        expect(
          bookings
        ).toContain(
          "defaultLocale"
        );

        expect(
          bookings
        ).toContain(
          "supportedLocales"
        );
      }
    );

    it(
      "uses the central UI locale registry in the public catalog",
      () => {
        expect(
          catalog
        ).toContain(
          "UI_LOCALE_CODES"
        );

        expect(
          catalog
        ).not.toContain(
          'value === "mk" ||'
        );
      }
    );
  }
);
