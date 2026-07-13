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
  "admin dynamic tenant locale contract",
  () => {
    const serviceEditor =
      source(
        "components/admin/services/ServiceCatalogActions.tsx"
      );

    const teamEditor =
      source(
        "components/admin/team/TeamManagementActions.tsx"
      );

    const serviceActions =
      source(
        "app/admin/(protected)/services/actions.ts"
      );

    const teamActions =
      source(
        "app/admin/(protected)/team/actions.ts"
      );

    const servicesLoader =
      source(
        "lib/admin/services.ts"
      );

    const teamLoader =
      source(
        "lib/admin/team.ts"
      );

    it(
      "does not hard-code the original three-language editor union",
      () => {
        expect(
          serviceEditor
        ).not.toContain(
          'type LanguageKey = "mk" | "sq" | "en"'
        );

        expect(
          teamEditor
        ).not.toContain(
          'type LanguageKey = "mk" | "sq" | "en"'
        );
      }
    );

    it(
      "builds editor languages from tenant-supported locales",
      () => {
        for (
          const editor of
          [
            serviceEditor,
            teamEditor,
          ]
        ) {
          expect(
            editor
          ).toContain(
            "supportedLocales"
          );

          expect(
            editor
          ).toContain(
            "defaultLocale"
          );

          expect(
            editor
          ).toContain(
            "LOCALE_REGISTRY"
          );

          expect(
            editor
          ).toContain(
            "createLanguageDefinitions"
          );
        }
      }
    );

    it(
      "accepts all registered locale keys in server actions",
      () => {
        for (
          const action of
          [
            serviceActions,
            teamActions,
          ]
        ) {
          expect(
            action
          ).toContain(
            "Partial<"
          );

          expect(
            action
          ).toContain(
            "Record<"
          );

          expect(
            action
          ).toContain(
            "LocaleCode"
          );

          expect(
            action
          ).toContain(
            "LOCALE_CODES"
          );
        }
      }
    );

    it(
      "loads tenant locale configuration for services and team",
      () => {
        for (
          const loader of
          [
            servicesLoader,
            teamLoader,
          ]
        ) {
          expect(
            loader
          ).toContain(
            "default_locale"
          );

          expect(
            loader
          ).toContain(
            "supported_locales"
          );

          expect(
            loader
          ).toContain(
            "normalizeLocaleList"
          );
        }
      }
    );
  }
);
