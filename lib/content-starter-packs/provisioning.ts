import type {
  LocaleCode,
} from "@/lib/i18n/locales";

import {
  STARTER_PACK_MODULE_IDS,
  STARTER_PACK_VERTICALS,
  type StarterPackModuleId,
  type StarterPackPreview,
  type StarterPackPricingMode,
  type StarterPackVertical,
} from "@/lib/content-starter-packs/domain";

import {
  resolveStarterPackPreview,
} from "@/lib/content-starter-packs/preview";

import {
  getTemplateManifest,
  type TemplateKey,
} from "@/lib/templates/registry";

import type {
  ServiceCategoryIcon,
  ServicePriceType,
} from "@/lib/types";

export const STARTER_PACK_CURRENCIES = [
  "RSD",
  "EUR",
  "CHF",
] as const;

export type StarterPackCurrency =
  (typeof STARTER_PACK_CURRENCIES)[number];

export const STARTER_PACK_TEMPLATE_RECOMMENDATIONS:
  Record<
    StarterPackVertical,
    TemplateKey
  > = {
  "beauty-general":
    "hair-luxury",
  "hair-salon":
    "hair-luxury",
  barber:
    "barber-heritage",
  nails:
    "nails-soft",
  "lashes-brows":
    "hair-luxury",
  massage:
    "hair-luxury",
  spa:
    "hair-luxury",
  waxing:
    "hair-luxury",
  "laser-hair-removal":
    "hair-luxury",
  solarium:
    "hair-luxury",
};

export type StarterPackServiceDraft = {
  serviceKey: string;
  enabled: boolean;
  name: string;
  description: string;
  durationMinutes: number;
  priceType:
    ServicePriceType;
  priceFrom: number;
  priceTo: number | null;
};

type LocalizedStarterText =
  Record<
    "sr-Latn" | "en" | "de",
    string
  >;

export type MaterializedStarterPackCategory = {
  clientKey: string;
  slug: string;
  icon:
    ServiceCategoryIcon;
  name:
    LocalizedStarterText;
  description:
    LocalizedStarterText;
  displayName: string;
  displayDescription: string;
  sortOrder: number;
  isActive: true;
};

export type MaterializedStarterPackService = {
  clientKey: string;
  categoryClientKey: string;
  categorySlug: string;
  slug: string;
  name:
    LocalizedStarterText;
  description:
    LocalizedStarterText | null;
  displayName: string;
  displayDescription: string | null;
  durationMinutes: number;
  priceType:
    ServicePriceType;
  priceFrom: number;
  priceTo: number | null;
  currency:
    StarterPackCurrency;
  sortOrder: number;
  isActive: true;
};

export type MaterializedStarterPackProvisioning = {
  presetKey:
    StarterPackVertical;
  presetName: string;
  presetDescription: string;
  locale:
    "sr-Latn";
  supportedLocales:
    readonly ["sr-Latn"];
  currency:
    StarterPackCurrency;
  templateKey:
    TemplateKey;
  templateConfig: {
    businessPresetKey:
      StarterPackVertical;
    sections:
      readonly string[];
    starterPack: {
      packId:
        StarterPackVertical;
      version: 1;
      selectedModules:
        StarterPackModuleId[];
      applyKey: string;
      counts: {
        categories: number;
        services: number;
      };
    };
  };
  terms: {
    businessSingular: string;
    professionalSingular: string;
    professionalPlural: string;
    serviceSingular: string;
    servicePlural: string;
    bookingCta: string;
  };
  bookingSettings: {
    slotIntervalMinutes: number;
    bookingWindowDays: number;
    minimumAdvanceMinutes: number;
    allowAnyEmployee: boolean;
    requireEmail: boolean;
    requirePhone: boolean;
    allowNotes: boolean;
    autoConfirm: boolean;
  };
  categories:
    readonly MaterializedStarterPackCategory[];
  services:
    readonly MaterializedStarterPackService[];
  counts: {
    categories: number;
    services: number;
  };
};

export type MaterializeStarterPackProvisioningInput = {
  packId: unknown;
  selectedModules: unknown;
  locale: unknown;
  currency: unknown;
  templateKey:
    TemplateKey;
  applyKey: unknown;
  confirmed: unknown;
  serviceEdits: unknown;
};

export type StarterPackProvisioningErrorCode =
  | "INVALID_STARTER_PACK"
  | "INVALID_STARTER_PACK_MODULES"
  | "INVALID_STARTER_PACK_LOCALE"
  | "INVALID_STARTER_PACK_CURRENCY"
  | "INVALID_STARTER_PACK_APPLY_KEY"
  | "STARTER_PACK_CONFIRMATION_REQUIRED"
  | "INVALID_STARTER_PACK_SERVICE_EDITS"
  | "STARTER_PACK_SERVICE_MISSING"
  | "STARTER_PACK_SERVICE_DUPLICATE"
  | "STARTER_PACK_SERVICE_INVALID"
  | "STARTER_PACK_HAS_NO_ACTIVE_SERVICES";

export class StarterPackProvisioningError
  extends Error {
  readonly code:
    StarterPackProvisioningErrorCode;

  constructor(
    code:
      StarterPackProvisioningErrorCode,
    message: string
  ) {
    super(
      message
    );

    this.name =
      "StarterPackProvisioningError";

    this.code =
      code;
  }
}

function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function readString(
  value: unknown
): string {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}

function readFiniteNumber(
  value: unknown
): number | null {
  return (
    typeof value ===
      "number" &&
    Number.isFinite(
      value
    )
  )
    ? value
    : null;
}

export function isStarterPackVertical(
  value: unknown
): value is StarterPackVertical {
  return (
    typeof value ===
      "string" &&
    STARTER_PACK_VERTICALS.includes(
      value as
        StarterPackVertical
    )
  );
}

export function isStarterPackModuleId(
  value: unknown
): value is StarterPackModuleId {
  return (
    typeof value ===
      "string" &&
    STARTER_PACK_MODULE_IDS.includes(
      value as
        StarterPackModuleId
    )
  );
}

export function isStarterPackCurrency(
  value: unknown
): value is StarterPackCurrency {
  return (
    typeof value ===
      "string" &&
    STARTER_PACK_CURRENCIES.includes(
      value as
        StarterPackCurrency
    )
  );
}

export function getRecommendedStarterPackTemplate(
  packId:
    StarterPackVertical
): TemplateKey {
  return STARTER_PACK_TEMPLATE_RECOMMENDATIONS[
    packId
  ];
}

function defaultPriceType(
  pricingMode:
    StarterPackPricingMode
): ServicePriceType {
  switch (
    pricingMode
  ) {
    case "fixed":
      return "fixed";

    case "from":
    case "consultation":
    case "by_length":
    case "by_duration":
    case "by_area":
      return "from";
  }
}

export function createStarterPackServiceDrafts(
  preview:
    StarterPackPreview
): StarterPackServiceDraft[] {
  return preview.services.map(
    (
      service
    ) => ({
      serviceKey:
        service.key,
      enabled:
        service.bookableByDefault,
      name:
        service.name,
      description:
        service.description,
      durationMinutes:
        service.defaultDurationMinutes,
      priceType:
        defaultPriceType(
          service.pricingMode
        ),
      priceFrom:
        0,
      priceTo:
        null,
    })
  );
}

function normalizeModuleIds(
  value: unknown
): StarterPackModuleId[] {
  if (
    !Array.isArray(
      value
    )
  ) {
    throw new StarterPackProvisioningError(
      "INVALID_STARTER_PACK_MODULES",
      "Lista starter-pack modula nije ispravna."
    );
  }

  const result:
    StarterPackModuleId[] = [];

  for (
    const moduleId of
    value
  ) {
    if (
      !isStarterPackModuleId(
        moduleId
      )
    ) {
      throw new StarterPackProvisioningError(
        "INVALID_STARTER_PACK_MODULES",
        "Starter-pack modul nije podržan."
      );
    }

    if (
      !result.includes(
        moduleId
      )
    ) {
      result.push(
        moduleId
      );
    }
  }

  return result;
}

function normalizeServiceEdits(
  value: unknown,
  preview:
    StarterPackPreview
): StarterPackServiceDraft[] {
  if (
    !Array.isArray(
      value
    )
  ) {
    throw new StarterPackProvisioningError(
      "INVALID_STARTER_PACK_SERVICE_EDITS",
      "Lista izmena usluga nije ispravna."
    );
  }

  const sourceByKey =
    new Map(
      preview.services.map(
        (
          service
        ) => [
          service.key,
          service,
        ]
      )
    );

  const normalized:
    StarterPackServiceDraft[] = [];

  const seen =
    new Set<string>();

  for (
    const rawEdit of
    value
  ) {
    if (
      !isJsonRecord(
        rawEdit
      )
    ) {
      throw new StarterPackProvisioningError(
        "INVALID_STARTER_PACK_SERVICE_EDITS",
        "Izmena starter usluge mora biti objekat."
      );
    }

    const serviceKey =
      readString(
        rawEdit.serviceKey
      );

    if (
      !sourceByKey.has(
        serviceKey
      )
    ) {
      throw new StarterPackProvisioningError(
        "STARTER_PACK_SERVICE_MISSING",
        `Starter usluga ne postoji: ${serviceKey || "unknown"}.`
      );
    }

    if (
      seen.has(
        serviceKey
      )
    ) {
      throw new StarterPackProvisioningError(
        "STARTER_PACK_SERVICE_DUPLICATE",
        `Starter usluga je poslata više puta: ${serviceKey}.`
      );
    }

    seen.add(
      serviceKey
    );

    if (
      typeof rawEdit.enabled !==
      "boolean"
    ) {
      throw new StarterPackProvisioningError(
        "STARTER_PACK_SERVICE_INVALID",
        `Status usluge nije ispravan: ${serviceKey}.`
      );
    }

    const name =
      readString(
        rawEdit.name
      );

    const description =
      readString(
        rawEdit.description
      );

    const durationMinutes =
      readFiniteNumber(
        rawEdit.durationMinutes
      );

    const priceFrom =
      readFiniteNumber(
        rawEdit.priceFrom
      );

    const rawPriceTo =
      rawEdit.priceTo;

    const priceTo =
      rawPriceTo ===
        null
        ? null
        : readFiniteNumber(
            rawPriceTo
          );

    const priceType =
      rawEdit.priceType;

    if (
      (
        priceType !==
          "fixed" &&
        priceType !==
          "from" &&
        priceType !==
          "range"
      ) ||
      name.length <
        2 ||
      name.length >
        120 ||
      description.length >
        600 ||
      durationMinutes ===
        null ||
      !Number.isInteger(
        durationMinutes
      ) ||
      durationMinutes <
        5 ||
      durationMinutes >
        480 ||
      priceFrom ===
        null ||
      priceFrom <
        0 ||
      priceFrom >
        100_000_000 ||
      (
        priceType ===
          "range" &&
        (
          priceTo ===
            null ||
          priceTo <
            priceFrom ||
          priceTo >
            100_000_000
        )
      ) ||
      (
        priceType !==
          "range" &&
        priceTo !==
          null
      )
    ) {
      throw new StarterPackProvisioningError(
        "STARTER_PACK_SERVICE_INVALID",
        `Podaci usluge nisu ispravni: ${serviceKey}.`
      );
    }

    normalized.push({
      serviceKey,
      enabled:
        rawEdit.enabled,
      name,
      description,
      durationMinutes,
      priceType,
      priceFrom,
      priceTo,
    });
  }

  if (
    normalized.length !==
    preview.services.length
  ) {
    throw new StarterPackProvisioningError(
      "STARTER_PACK_SERVICE_MISSING",
      "Svaka starter usluga mora biti potvrđena ili isključena."
    );
  }

  return normalized;
}

function localizedText(
  value: string
): LocalizedStarterText {
  return {
    "sr-Latn":
      value,
    en:
      value,
    de:
      value,
  };
}

function resolveCategoryIcon({
  packId,
  categoryKey,
}: {
  packId:
    StarterPackVertical;
  categoryKey:
    string;
}): ServiceCategoryIcon {
  const normalized =
    categoryKey.toLowerCase();

  if (
    packId ===
      "hair-salon" ||
    packId ===
      "barber" ||
    normalized.includes(
      "hair"
    ) ||
    normalized.includes(
      "cut"
    )
  ) {
    return "scissors";
  }

  if (
    packId ===
      "nails" ||
    normalized.includes(
      "manicure"
    ) ||
    normalized.includes(
      "pedicure"
    )
  ) {
    return "hand";
  }

  if (
    normalized.includes(
      "color"
    ) ||
    normalized.includes(
      "highlight"
    ) ||
    normalized.includes(
      "art"
    )
  ) {
    return "palette";
  }

  if (
    packId ===
      "massage" ||
    packId ===
      "spa" ||
    normalized.includes(
      "wellness"
    ) ||
    normalized.includes(
      "care"
    ) ||
    normalized.includes(
      "relax"
    )
  ) {
    return "heart";
  }

  return "sparkles";
}

function createCategoryClientKey(
  categoryKey: string
): string {
  return `category:${categoryKey}`;
}

function createServiceClientKey(
  categoryKey: string,
  serviceKey: string
): string {
  return [
    "service",
    categoryKey,
    serviceKey,
  ].join(
    ":"
  );
}

function assertApplyKey(
  value: unknown
): string {
  const applyKey =
    readString(
      value
    );

  const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (
    !UUID_PATTERN.test(
      applyKey
    )
  ) {
    throw new StarterPackProvisioningError(
      "INVALID_STARTER_PACK_APPLY_KEY",
      "Starter-pack apply ključ nije ispravan."
    );
  }

  return applyKey;
}

export function materializeStarterPackProvisioning({
  packId,
  selectedModules,
  locale,
  currency,
  templateKey,
  applyKey,
  confirmed,
  serviceEdits,
}: MaterializeStarterPackProvisioningInput): MaterializedStarterPackProvisioning {
  if (
    !isStarterPackVertical(
      packId
    )
  ) {
    throw new StarterPackProvisioningError(
      "INVALID_STARTER_PACK",
      "Starter pack nije podržan."
    );
  }

  if (
    locale !==
    "sr-Latn"
  ) {
    throw new StarterPackProvisioningError(
      "INVALID_STARTER_PACK_LOCALE",
      "01B trenutno podržava sr-Latn starter sadržaj."
    );
  }

  if (
    !isStarterPackCurrency(
      currency
    )
  ) {
    throw new StarterPackProvisioningError(
      "INVALID_STARTER_PACK_CURRENCY",
      "Valuta starter packa nije podržana."
    );
  }

  if (
    confirmed !==
    true
  ) {
    throw new StarterPackProvisioningError(
      "STARTER_PACK_CONFIRMATION_REQUIRED",
      "Potvrdi usluge, trajanja i cene pre kreiranja salona."
    );
  }

  const normalizedApplyKey =
    assertApplyKey(
      applyKey
    );

  const requestedModules =
    normalizeModuleIds(
      selectedModules
    );

  const preview =
    resolveStarterPackPreview({
      packId,
      locale:
        locale as
          LocaleCode,
      selectedModules:
        requestedModules,
    });

  const normalizedEdits =
    normalizeServiceEdits(
      serviceEdits,
      preview
    );

  const enabledEdits =
    normalizedEdits.filter(
      (
        edit
      ) =>
        edit.enabled
    );

  if (
    enabledEdits.length ===
    0
  ) {
    throw new StarterPackProvisioningError(
      "STARTER_PACK_HAS_NO_ACTIVE_SERVICES",
      "Starter pack mora imati najmanje jednu aktivnu uslugu."
    );
  }

  const editByKey =
    new Map(
      normalizedEdits.map(
        (
          edit
        ) => [
          edit.serviceKey,
          edit,
        ]
      )
    );

  const activeCategoryKeys =
    new Set(
      preview.services
        .filter(
          (
            service
          ) =>
            editByKey.get(
              service.key
            )?.enabled ===
            true
        )
        .map(
          (
            service
          ) =>
            service.categoryKey
        )
    );

  const categories:
    MaterializedStarterPackCategory[] =
      preview.categories
        .filter(
          (
            category
          ) =>
            activeCategoryKeys.has(
              category.key
            )
        )
        .map(
          (
            category,
            index
          ) => ({
            clientKey:
              createCategoryClientKey(
                category.key
              ),
            slug:
              category.key,
            icon:
              resolveCategoryIcon({
                packId,
                categoryKey:
                  category.key,
              }),
            name:
              localizedText(
                category.name
              ),
            description:
              localizedText(
                category.description
              ),
            displayName:
              category.name,
            displayDescription:
              category.description,
            sortOrder:
              index +
              1,
            isActive:
              true,
          })
        );

  const serviceOrderByCategory =
    new Map<
      string,
      number
    >();

  const services:
    MaterializedStarterPackService[] =
      [];

  for (
    const sourceService of
    preview.services
  ) {
    const edit =
      editByKey.get(
        sourceService.key
      );

    if (
      !edit ||
      !edit.enabled
    ) {
      continue;
    }

    const nextServiceOrder =
      (
        serviceOrderByCategory.get(
          sourceService.categoryKey
        ) ??
        0
      ) +
      1;

    serviceOrderByCategory.set(
      sourceService.categoryKey,
      nextServiceOrder
    );

    services.push({
      clientKey:
        createServiceClientKey(
          sourceService.categoryKey,
          sourceService.key
        ),
      categoryClientKey:
        createCategoryClientKey(
          sourceService.categoryKey
        ),
      categorySlug:
        sourceService.categoryKey,
      slug:
        sourceService.key,
      name:
        localizedText(
          edit.name
        ),
      description:
        edit.description.length >
        0
          ? localizedText(
              edit.description
            )
          : null,
      displayName:
        edit.name,
      displayDescription:
        edit.description.length >
        0
          ? edit.description
          : null,
      durationMinutes:
        edit.durationMinutes,
      priceType:
        edit.priceType,
      priceFrom:
        edit.priceFrom,
      priceTo:
        edit.priceType ===
          "range"
          ? edit.priceTo
          : null,
      currency,
      sortOrder:
        nextServiceOrder,
      isActive:
        true,
    });
  }

  const selectedModuleIds =
    preview.modules
      .filter(
        (
          module
        ) =>
          module.selected
      )
      .map(
        (
          module
        ) =>
          module
            .definition
            .id
      );

  const template =
    getTemplateManifest(
      templateKey
    );

  return {
    presetKey:
      packId,
    presetName:
      preview.label,
    presetDescription:
      preview.description,
    locale:
      "sr-Latn",
    supportedLocales: [
      "sr-Latn",
    ],
    currency,
    templateKey,
    templateConfig: {
      businessPresetKey:
        packId,
      sections: [
        ...template.sections,
      ],
      starterPack: {
        packId,
        version:
          preview.version,
        selectedModules:
          selectedModuleIds,
        applyKey:
          normalizedApplyKey,
        counts: {
          categories:
            categories.length,
          services:
            services.length,
        },
      },
    },
    terms: {
      businessSingular:
        "salon",
      professionalSingular:
        "član tima",
      professionalPlural:
        "tim",
      serviceSingular:
        "usluga",
      servicePlural:
        "usluge",
      bookingCta:
        "Rezerviši termin",
    },
    bookingSettings: {
      slotIntervalMinutes:
        preview
          .bookingDefaults
          .slotIntervalMinutes,
      bookingWindowDays:
        preview
          .bookingDefaults
          .maximumAdvanceDays,
      minimumAdvanceMinutes:
        preview
          .bookingDefaults
          .minimumNoticeMinutes,
      allowAnyEmployee:
        preview
          .bookingDefaults
          .allowAnyStaff,
      requireEmail:
        false,
      requirePhone:
        true,
      allowNotes:
        true,
      autoConfirm:
        false,
    },
    categories:
      Object.freeze(
        categories
      ),
    services:
      Object.freeze(
        services
      ),
    counts: {
      categories:
        categories.length,
      services:
        services.length,
    },
  };
}
