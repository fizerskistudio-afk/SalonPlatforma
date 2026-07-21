import type {
  ProductRolloutFeatureKey,
} from "./rollout-registry";

export const PLATFORM_LEVEL_CONTRACT_VERSION =
  1 as const;

export const PLATFORM_LEVEL_STATUSES = [
  "unlocked",
  "active",
  "locked",
] as const;

export type PlatformLevelStatus =
  (typeof PLATFORM_LEVEL_STATUSES)[number];

export type PlatformLevelDefinition = {
  level: number;
  key: string;
  name: string;
  status: PlatformLevelStatus;
  mission: string;
  unlockCriteria: readonly string[];
  featureKeys:
    readonly ProductRolloutFeatureKey[];
  nextMilestones: readonly string[];
};

export const PLATFORM_LEVELS = [
  {
    level: 1,
    key: "digital_salon",
    name: "Digitalni salon",
    status: "unlocked",
    mission:
      "Prodati i podržati ponovljiv digitalni salon sa sajtom, bookingom, administracijom i vođenim onboardingom.",
    unlockCriteria: [
      "Tri do pet aktivnih salona",
      "Stabilan booking i onboarding tok",
      "Ponovljiv support proces",
      "Prve stvarne mesečne uplate",
    ],
    featureKeys: [
      "tenant.public_site",
      "tenant.online_booking",
      "tenant.any_employee_booking",
      "tenant.owner_manager_admin",
      "tenant.staff_workspace",
      "tenant.catalog_and_team",
      "tenant.schedule_management",
      "tenant.gallery_and_reviews",
      "tenant.email_notifications",
      "tenant.basic_seo",
      "tenant.managed_onboarding",
      "tenant.google_calendar_business",
      "tenant.google_calendar_employee",
      "tenant.review_management",
      "tenant.ai_review_drafts",
      "tenant.custom_domain_managed",
      "tenant.multilingual_content",
      "tenant.mobile_admin_navigation",
    ],
    nextMilestones: [
      "BARBER-PILOT-ONBOARDING-01",
      "ADMIN-MOBILE-ACCEPTANCE-01",
    ],
  },
  {
    level: 2,
    key: "growth_platform",
    name: "Growth Platform",
    status: "active",
    mission:
      "Pretvoriti Ordum iz tehničke platforme u sistem koji jasno prodaje vrednost, prikuplja leadove i gradi organski sadržajni kanal.",
    unlockCriteria: [
      "Nova landing stranica koristi product strategy registry",
      "Feature statusi su transparentni",
      "Blog i vodiči imaju stabilan content model",
      "Lead attribution ima merljiv događajni tok",
    ],
    featureKeys: [
      "tenant.customer_self_service",
      "tenant.sms_viber_notifications",
      "tenant.waitlist",
      "growth.blog_and_guides",
      "growth.advanced_analytics",
      "growth.google_business_profile",
    ],
    nextMilestones: [
      "ORDUM-PRODUCT-LADDER-01",
      "PLATFORM-GROWTH-ARCHITECTURE-01",
      "PLATFORM-LANDING-02",
      "CONTENT-FOUNDATION-01",
    ],
  },
  {
    level: 3,
    key: "local_discovery",
    name: "Local Discovery",
    status: "locked",
    mission:
      "Povezati grad, canonical uslugu i realnu dostupnost više eligible salona bez pravljenja drugog booking sistema.",
    unlockCriteria: [
      "Canonical service taxonomy postoji",
      "Tenant discovery opt-in i eligibility su definisani",
      "Cross-tenant availability query je bezbedan i merljiv",
      "Redirect zadržava service i attribution kontekst",
    ],
    featureKeys: [
      "growth.local_discovery",
      "growth.first_available_redirect",
    ],
    nextMilestones: [
      "DISCOVERY-FOUNDATION-01",
      "SVILAJNAC-DISCOVERY-MVP-01",
    ],
  },
  {
    level: 4,
    key: "salon_operations",
    name: "Salon Operations",
    status: "locked",
    mission:
      "Uvesti operativne module koje realni saloni potvrde kao najvrednije nakon stabilnog booking i growth baseline-a.",
    unlockCriteria: [
      "Aktivni saloni daju dovoljno operativnih podataka",
      "Prioritet modula je potvrđen prodajom ili retention signalom",
      "Domain granice i audit događaji su definisani",
    ],
    featureKeys: [
      "operations.inventory",
      "operations.procurement",
      "operations.assets",
    ],
    nextMilestones: [
      "OPERATIONS-DOMAIN-AUDIT-01",
    ],
  },
  {
    level: 5,
    key: "business_os",
    name: "Business OS",
    status: "locked",
    mission:
      "Povezati finansijske, fiskalne, payment i customer lifecycle module kroz provider adaptere i reconciliation granice.",
    unlockCriteria: [
      "Provider strategija je potvrđena za ciljno tržište",
      "Audit, idempotency i reconciliation foundation postoje",
      "Pravni i finansijski rizici su dokumentovani",
    ],
    featureKeys: [
      "operations.fiscalization",
      "operations.accounting_sef",
      "operations.payments_deposits",
      "operations.loyalty_memberships",
    ],
    nextMilestones: [
      "BUSINESS-OS-INTEGRATION-FOUNDATION-01",
    ],
  },
  {
    level: 6,
    key: "regional_network",
    name: "Regionalna i globalna mreža",
    status: "locked",
    mission:
      "Skalirati isto jezgro kroz lokalizovane payment, fiscal, legal i discovery adaptere bez tenant code forkova.",
    unlockCriteria: [
      "Core poslovni model je profitabilan na matičnom tržištu",
      "Multi-location i regionalni compliance zahtevi su potvrđeni",
      "Provider adapter contract je stabilan",
    ],
    featureKeys: [
      "operations.multi_location",
    ],
    nextMilestones: [
      "REGIONAL-EXPANSION-ARCHITECTURE-01",
    ],
  },
] as const satisfies
  readonly PlatformLevelDefinition[];

export type PlatformLevel =
  (typeof PLATFORM_LEVELS)[number];

export type PlatformLevelKey =
  PlatformLevel["key"];

export function getActivePlatformLevel():
  PlatformLevel {
  const activeLevel =
    PLATFORM_LEVELS.find(
      (level) => level.status === "active"
    );

  if (!activeLevel) {
    throw new Error(
      "An active Ordum platform level is required."
    );
  }

  return activeLevel;
}

export function getPlatformLevel(
  key: PlatformLevelKey
): PlatformLevel {
  const level =
    PLATFORM_LEVELS.find(
      (candidate) => candidate.key === key
    );

  if (!level) {
    throw new Error(
      `Unknown Ordum platform level: ${key}`
    );
  }

  return level;
}

export function getNextLockedPlatformLevel():
  PlatformLevel | null {
  const activeLevel =
    getActivePlatformLevel();

  return (
    PLATFORM_LEVELS.find(
      (level) =>
        level.level > activeLevel.level &&
        level.status === "locked"
    ) ?? null
  );
}
