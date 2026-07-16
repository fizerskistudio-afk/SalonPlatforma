import {
  STARTER_PACK_MODULE_IDS,
  STARTER_PACK_VERTICALS,
  type StarterPackManifest,
  type StarterPackModuleSupport,
  type StarterPackVertical,
} from "@/lib/content-starter-packs/domain";
import {
  STARTER_PACK_MANIFESTS,
} from "@/lib/content-starter-packs/vertical-manifests";

export type StarterPackValidationIssue = {
  packId:
    StarterPackVertical | "registry";
  path: string;
  message: string;
};

const MODULE_SUPPORT_VALUES =
  new Set<
    StarterPackModuleSupport
  >([
    "required",
    "recommended",
    "optional",
    "unsupported",
  ]);

function duplicateKeys(
  values:
    string[]
): string[] {
  const seen =
    new Set<
      string
    >();

  const duplicates =
    new Set<
      string
    >();

  for (
    const value of
    values
  ) {
    if (
      seen.has(
        value
      )
    ) {
      duplicates.add(
        value
      );
    }

    seen.add(
      value
    );
  }

  return [
    ...duplicates,
  ];
}

function validateKeyCollection(
  issues:
    StarterPackValidationIssue[],
  manifest:
    StarterPackManifest,
  path:
    string,
  keys:
    string[]
): void {
  for (
    const duplicate of
    duplicateKeys(
      keys
    )
  ) {
    issues.push({
      packId:
        manifest.id,
      path,
      message:
        `Dupliran key: ${duplicate}`,
    });
  }
}

function validateManifest(
  manifest:
    StarterPackManifest
): StarterPackValidationIssue[] {
  const issues:
    StarterPackValidationIssue[] = [];

  if (
    manifest.id !==
    manifest.vertical
  ) {
    issues.push({
      packId:
        manifest.id,
      path:
        "vertical",
      message:
        "Manifest id i vertical moraju biti isti.",
    });
  }

  if (
    manifest.version !==
    1
  ) {
    issues.push({
      packId:
        manifest.id,
      path:
        "version",
      message:
        "Podržana je samo verzija 1.",
    });
  }

  if (
    !manifest
      .supportedLocales
      .includes(
        manifest.defaultLocale
      )
  ) {
    issues.push({
      packId:
        manifest.id,
      path:
        "supportedLocales",
      message:
        "Default locale mora biti podržan.",
    });
  }

  for (
    const [
      path,
      length,
    ] of [
      [
        "categories",
        manifest
          .categories
          .length,
      ],
      [
        "services",
        manifest
          .services
          .length,
      ],
      [
        "staffRoles",
        manifest
          .staffRoles
          .length,
      ],
    ] as const
  ) {
    if (
      length ===
      0
    ) {
      issues.push({
        packId:
          manifest.id,
        path,
        message:
          "Kolekcija ne sme biti prazna.",
      });
    }
  }

  validateKeyCollection(
    issues,
    manifest,
    "categories",
    manifest
      .categories
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "services",
    manifest
      .services
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "staffRoles",
    manifest
      .staffRoles
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "intakeQuestions",
    manifest
      .intakeQuestions
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "resources",
    manifest
      .resources
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "policies",
    manifest
      .policies
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "faq",
    manifest
      .faq
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "contentSections",
    manifest
      .contentSections
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  validateKeyCollection(
    issues,
    manifest,
    "mediaSlots",
    manifest
      .mediaSlots
      .map(
        (
          item
        ) =>
          item.key
      )
  );

  const categoryKeys =
    new Set(
      manifest
        .categories
        .map(
          (
            item
          ) =>
            item.key
        )
    );

  const staffRoleKeys =
    new Set(
      manifest
        .staffRoles
        .map(
          (
            item
          ) =>
            item.key
        )
    );

  const questionKeys =
    new Set(
      manifest
        .intakeQuestions
        .map(
          (
            item
          ) =>
            item.key
        )
    );

  const resourceKeys =
    new Set(
      manifest
        .resources
        .map(
          (
            item
          ) =>
            item.key
        )
    );

  for (
    const service of
    manifest.services
  ) {
    const servicePath =
      `services.${service.key}`;

    if (
      !categoryKeys.has(
        service.categoryKey
      )
    ) {
      issues.push({
        packId:
          manifest.id,
        path:
          `${servicePath}.categoryKey`,
        message:
          "Service category ne postoji.",
      });
    }

    if (
      service
        .compatibleStaffRoleKeys
        .length ===
      0
    ) {
      issues.push({
        packId:
          manifest.id,
        path:
          `${servicePath}.compatibleStaffRoleKeys`,
        message:
          "Usluga mora imati najmanje jednu kompatibilnu ulogu.",
      });
    }

    for (
      const roleKey of
      service
        .compatibleStaffRoleKeys
    ) {
      if (
        !staffRoleKeys.has(
          roleKey
        )
      ) {
        issues.push({
          packId:
            manifest.id,
          path:
            `${servicePath}.compatibleStaffRoleKeys`,
          message:
            `Nepoznata staff uloga: ${roleKey}`,
        });
      }
    }

    for (
      const questionKey of
      service
        .requiredQuestionKeys
    ) {
      if (
        !questionKeys.has(
          questionKey
        )
      ) {
        issues.push({
          packId:
            manifest.id,
          path:
            `${servicePath}.requiredQuestionKeys`,
          message:
            `Nepoznato intake pitanje: ${questionKey}`,
        });
      }
    }

    for (
      const resourceKey of
      service
        .requiredResourceKeys
    ) {
      if (
        !resourceKeys.has(
          resourceKey
        )
      ) {
        issues.push({
          packId:
            manifest.id,
          path:
            `${servicePath}.requiredResourceKeys`,
          message:
            `Nepoznat resource: ${resourceKey}`,
        });
      }
    }

    if (
      service
        .defaultDurationMinutes <=
        0 ||
      service
        .suggestedBufferMinutes <
        0
    ) {
      issues.push({
        packId:
          manifest.id,
        path:
          servicePath,
        message:
          "Trajanje mora biti pozitivno, a buffer nenegativan.",
      });
    }

    if (
      service.priceStatus !==
      "unset"
    ) {
      issues.push({
        packId:
          manifest.id,
        path:
          `${servicePath}.priceStatus`,
        message:
          "Starter cena mora ostati unset.",
      });
    }

    if (
      Object
        .prototype
        .hasOwnProperty
        .call(
          service,
          "price"
        ) ||
      Object
        .prototype
        .hasOwnProperty
        .call(
          service,
          "suggestedPrice"
        )
    ) {
      issues.push({
        packId:
          manifest.id,
        path:
          servicePath,
        message:
          "Starter service ne sme sadržati numeričku cenu.",
      });
    }
  }

  const supportKeys =
    Object.keys(
      manifest.moduleSupport
    );

  if (
    supportKeys.length !==
    STARTER_PACK_MODULE_IDS.length
  ) {
    issues.push({
      packId:
        manifest.id,
      path:
        "moduleSupport",
      message:
        "Module support mora pokriti kompletan registry.",
    });
  }

  for (
    const moduleId of
    STARTER_PACK_MODULE_IDS
  ) {
    const support =
      manifest
        .moduleSupport[
          moduleId
        ];

    if (
      !MODULE_SUPPORT_VALUES.has(
        support
      )
    ) {
      issues.push({
        packId:
          manifest.id,
        path:
          `moduleSupport.${moduleId}`,
        message:
          "Module support vrednost nije validna.",
      });
    }
  }

  if (
    manifest.resources.length >
      0 &&
    manifest
      .moduleSupport[
        "resource-booking"
      ] ===
      "unsupported" &&
    manifest
      .moduleSupport[
        "device-booking"
      ] ===
      "unsupported"
  ) {
    issues.push({
      packId:
        manifest.id,
      path:
        "resources",
      message:
        "Pack sa resursima mora deklarisati resource ili device booking modul.",
    });
  }

  return issues;
}

export function validateStarterPackRegistry():
  StarterPackValidationIssue[] {
  const issues:
    StarterPackValidationIssue[] = [];

  const ids =
    STARTER_PACK_MANIFESTS.map(
      (
        manifest
      ) =>
        manifest.id
    );

  for (
    const duplicate of
    duplicateKeys(
      ids
    )
  ) {
    issues.push({
      packId:
        "registry",
      path:
        "ids",
      message:
        `Dupliran pack id: ${duplicate}`,
    });
  }

  for (
    const vertical of
    STARTER_PACK_VERTICALS
  ) {
    if (
      !ids.includes(
        vertical
      )
    ) {
      issues.push({
        packId:
          "registry",
        path:
          "verticals",
        message:
          `Nedostaje vertical pack: ${vertical}`,
      });
    }
  }

  if (
    ids.length !==
    STARTER_PACK_VERTICALS.length
  ) {
    issues.push({
      packId:
        "registry",
      path:
        "count",
      message:
        "Registry mora imati tačno jedan pack za svaku podržanu vertikalu.",
    });
  }

  for (
    const manifest of
    STARTER_PACK_MANIFESTS
  ) {
    issues.push(
      ...validateManifest(
        manifest
      )
    );
  }

  return issues;
}
