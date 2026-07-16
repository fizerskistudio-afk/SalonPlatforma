import type {
  LocaleCode,
} from "@/lib/i18n/locales";
import {
  STARTER_PACK_MODULE_IDS,
  type StarterPackModuleId,
  type StarterPackModuleSupport,
  type StarterPackPreview,
  type StarterPackPreviewModule,
  type StarterPackVertical,
} from "@/lib/content-starter-packs/domain";
import {
  STARTER_PACK_MODULES,
} from "@/lib/content-starter-packs/modules";
import {
  getStarterPackManifest,
} from "@/lib/content-starter-packs/registry";
import {
  UNIVERSAL_BOOKING_DEFAULTS,
  UNIVERSAL_CONTENT_SECTIONS,
  UNIVERSAL_FAQ,
  UNIVERSAL_MEDIA_SLOTS,
  UNIVERSAL_POLICY_TEMPLATES,
  UNIVERSAL_SEO_DEFAULTS,
} from "@/lib/content-starter-packs/universal-core";

export type StarterPackPreviewErrorCode =
  | "STARTER_PACK_LOCALE_UNSUPPORTED"
  | "STARTER_PACK_MODULE_UNSUPPORTED";

export class StarterPackPreviewError
  extends Error {
  readonly code:
    StarterPackPreviewErrorCode;

  constructor(
    code:
      StarterPackPreviewErrorCode,
    message: string
  ) {
    super(
      message
    );

    this.name =
      "StarterPackPreviewError";

    this.code =
      code;
  }
}

function unique<
  TValue
>(
  values:
    TValue[]
): TValue[] {
  return [
    ...new Set(
      values
    ),
  ];
}

function resolveModules({
  packId,
  selectedModules,
}: {
  packId:
    StarterPackVertical;
  selectedModules:
    StarterPackModuleId[];
}): StarterPackPreviewModule[] {
  const manifest =
    getStarterPackManifest(
      packId
    );

  const requested =
    unique(
      selectedModules
    );

  for (
    const moduleId of
    requested
  ) {
    if (
      manifest
        .moduleSupport[
          moduleId
        ] ===
      "unsupported"
    ) {
      throw new StarterPackPreviewError(
        "STARTER_PACK_MODULE_UNSUPPORTED",
        `Modul ${moduleId} nije podržan za ${packId}.`
      );
    }
  }

  return STARTER_PACK_MODULE_IDS
    .map(
      (
        moduleId
      ) => ({
        moduleId,
        support:
          manifest
            .moduleSupport[
              moduleId
            ],
      })
    )
    .filter(
      (
        item
      ) =>
        item.support !==
        "unsupported"
    )
    .map(
      (
        item
      ) => {
        const support =
          item.support as Exclude<
            StarterPackModuleSupport,
            "unsupported"
          >;

        return {
          definition:
            STARTER_PACK_MODULES[
              item.moduleId
            ],
          support,
          selected:
            support ===
              "required" ||
            requested.includes(
              item.moduleId
            ),
        };
      }
    );
}

export function resolveStarterPackPreview({
  packId,
  locale,
  selectedModules = [],
}: {
  packId:
    StarterPackVertical;
  locale?:
    LocaleCode;
  selectedModules?:
    StarterPackModuleId[];
}): StarterPackPreview {
  const manifest =
    getStarterPackManifest(
      packId
    );

  const resolvedLocale =
    locale ??
    manifest.defaultLocale;

  if (
    !manifest
      .supportedLocales
      .includes(
        resolvedLocale
      )
  ) {
    throw new StarterPackPreviewError(
      "STARTER_PACK_LOCALE_UNSUPPORTED",
      `Locale ${resolvedLocale} nije podržan za ${packId}.`
    );
  }

  const modules =
    resolveModules({
      packId,
      selectedModules,
    });

  const warnings = [
    "Sve cene su unset dok ih vlasnik ne potvrdi.",
    "Radno vreme i booking defaults su predlozi koji zahtevaju potvrdu.",
    "Politike, FAQ, SEO i website copy ostaju draft.",
    "Ne kreiraju se izmišljene recenzije, članovi tima ili fotografije.",
    "Preview se ne može automatski primeniti ili objaviti.",
  ];

  if (
    manifest.resources.length >
    0
  ) {
    warnings.push(
      "Room/device resursi su forward-compatible i ne znače da je runtime resource booking aktiviran."
    );
  }

  if (
    modules.some(
      (
        item
      ) =>
        item.selected &&
        item
          .definition
          .requiresFutureCapability
    )
  ) {
    warnings.push(
      "Najmanje jedan izabrani modul zahteva budući product capability pre aktivacije."
    );
  }

  const preview:
    StarterPackPreview = {
    mode:
      "preview_only",
    packId:
      manifest.id,
    version:
      manifest.version,
    vertical:
      manifest.vertical,
    locale:
      resolvedLocale,
    label:
      manifest.label,
    description:
      manifest.description,
    categories:
      manifest.categories,
    services:
      manifest.services,
    staffRoles:
      manifest.staffRoles,
    intakeQuestions:
      manifest.intakeQuestions,
    resources:
      manifest.resources,
    bookingDefaults: {
      ...UNIVERSAL_BOOKING_DEFAULTS,
      ...manifest.bookingDefaults,
      requiresOwnerConfirmation:
        true,
    },
    policies: [
      ...UNIVERSAL_POLICY_TEMPLATES,
      ...manifest.policies,
    ],
    faq: [
      ...UNIVERSAL_FAQ,
      ...manifest.faq,
    ],
    contentSections: [
      ...UNIVERSAL_CONTENT_SECTIONS,
      ...manifest.contentSections,
    ],
    seo: {
      ...UNIVERSAL_SEO_DEFAULTS,
      ...manifest.seo,
      status:
        "draft",
    },
    mediaSlots: [
      ...UNIVERSAL_MEDIA_SLOTS,
      ...manifest.mediaSlots,
    ],
    modules,
    warnings,
    requiresOwnerConfirmation:
      true,
    applyAllowed:
      false,
    publishAllowed:
      false,
  };

  return structuredClone(
    preview
  );
}
