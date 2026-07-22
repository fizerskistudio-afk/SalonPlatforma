import type {
  CanonicalServiceDefinition,
} from "./discovery-contract";
import {
  createNormalizedAliasSet,
  normalizeCanonicalLookupValue,
} from "./canonical-normalization";

export const CANONICAL_SERVICE_REGISTRY_VERSION =
  1 as const;

export const CANONICAL_SERVICES = [
  {
    key: "barber:musko-sisanje",
    vertical: "barber",
    slug: "musko-sisanje",
    displayName: "Muško šišanje",
    aliases: [
      "Muško šišanje",
      "Musko sisanje",
      "Мушко шишање",
      "Šišanje za muškarce",
      "Sisanje za muskarce",
    ],
    active: true,
  },
] as const satisfies
  readonly CanonicalServiceDefinition[];

export type CanonicalServiceKey =
  (typeof CANONICAL_SERVICES)[number]["key"];

const SERVICES_BY_KEY =
  new Map(
    CANONICAL_SERVICES.map(
      (service) => [
        service.key,
        service,
      ]
    )
  );

const SERVICE_ALIAS_INDEX =
  new Map<string, CanonicalServiceKey>();

for (
  const service of
  CANONICAL_SERVICES
) {
  const aliases =
    createNormalizedAliasSet([
      service.key,
      service.slug,
      service.displayName,
      ...service.aliases,
    ]);

  for (
    const alias of
    aliases
  ) {
    const existing =
      SERVICE_ALIAS_INDEX.get(
        alias
      );

    if (
      existing &&
      existing !==
        service.key
    ) {
      throw new Error(
        `Duplicate canonical service alias: ${alias}`
      );
    }

    SERVICE_ALIAS_INDEX.set(
      alias,
      service.key
    );
  }
}

export function getCanonicalService(
  key: string
):
  | (typeof CANONICAL_SERVICES)[number]
  | null {
  return (
    SERVICES_BY_KEY.get(
      key as CanonicalServiceKey
    ) ?? null
  );
}

export function resolveCanonicalService(
  value: string
):
  | (typeof CANONICAL_SERVICES)[number]
  | null {
  const normalized =
    normalizeCanonicalLookupValue(
      value
    );

  if (!normalized) {
    return null;
  }

  const key =
    SERVICE_ALIAS_INDEX.get(
      normalized
    );

  return key
    ? getCanonicalService(
        key
      )
    : null;
}
