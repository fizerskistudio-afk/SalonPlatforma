export const BUSINESS_PUBLICATION_STATUSES = [
  "draft",
  "published",
  "suspended",
  "archived",
] as const;

export type BusinessPublicationStatus =
  (typeof BUSINESS_PUBLICATION_STATUSES)[number];

export const BUSINESS_PUBLICATION_LABELS:
  Record<
    BusinessPublicationStatus,
    string
  > = {
  draft:
    "Draft",
  published:
    "Objavljen",
  suspended:
    "Suspendovan",
  archived:
    "Arhiviran",
};

export const BUSINESS_PUBLICATION_DESCRIPTIONS:
  Record<
    BusinessPublicationStatus,
    string
  > = {
  draft:
    "Tenant je aktivan u platformi, ali javni sajt i booking nisu dostupni.",
  published:
    "Javni sajt, dostupnost termina i booking su aktivni.",
  suspended:
    "Javni sajt i booking su privremeno isključeni.",
  archived:
    "Tenant je sklonjen iz aktivnog rada i javno nije dostupan.",
};

export function isBusinessPublicationStatus(
  value: unknown
): value is BusinessPublicationStatus {
  return (
    typeof value ===
      "string" &&
    BUSINESS_PUBLICATION_STATUSES.includes(
      value as
        BusinessPublicationStatus
    )
  );
}

export function resolveBusinessPublicationStatus(
  value: unknown,
  isActive: boolean
): BusinessPublicationStatus {
  if (
    isBusinessPublicationStatus(
      value
    )
  ) {
    return value;
  }

  return isActive
    ? "published"
    : "suspended";
}

export function isBusinessPubliclyAvailable(
  status:
    BusinessPublicationStatus,
  isActive: boolean
): boolean {
  return (
    status ===
      "published" &&
    isActive
  );
}

export function shouldBusinessBeOperational(
  status:
    BusinessPublicationStatus
): boolean {
  return (
    status ===
      "draft" ||
    status ===
      "published"
  );
}
