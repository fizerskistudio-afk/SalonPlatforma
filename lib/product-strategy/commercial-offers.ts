import type {
  ProductPackageKey,
} from "@/lib/product-packages/registry";

import type {
  ProductRolloutFeatureKey,
} from "./rollout-registry";

export const COMMERCIAL_OFFER_CONTRACT_VERSION =
  1 as const;

export const COMMERCIAL_PRICING_MODELS = [
  "setup_subscription",
  "subscription_only",
  "founding_partner",
  "free_pilot",
  "custom_quote",
  "pay_per_lead",
  "commission",
  "hybrid",
] as const;

export type CommercialPricingModel =
  (typeof COMMERCIAL_PRICING_MODELS)[number];

export const COMMERCIAL_OFFER_STATUSES = [
  "active",
  "limited",
  "quote_only",
  "paused",
] as const;

export type CommercialOfferStatus =
  (typeof COMMERCIAL_OFFER_STATUSES)[number];

export type CommercialOfferDefinition = {
  key: string;
  name: string;
  shortDescription: string;
  status: CommercialOfferStatus;
  pricingModel: CommercialPricingModel;
  technicalPackage: ProductPackageKey;
  setupPriceRsd: number | null;
  monthlyPriceRsd: number | null;
  priceLockMonths: number | null;
  clientLimit: number | null;
  maxBookableStaff: number | null;
  includedLiveFeatures:
    readonly ProductRolloutFeatureKey[];
  managedBetaOptions:
    readonly ProductRolloutFeatureKey[];
  salesNotes: readonly string[];
};

const LAUNCH_LIVE_FEATURES = [
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
] as const satisfies
  readonly ProductRolloutFeatureKey[];

const LAUNCH_MANAGED_BETA_OPTIONS = [
  "tenant.google_calendar_business",
  "tenant.google_calendar_employee",
  "tenant.review_management",
  "tenant.ai_review_drafts",
  "tenant.custom_domain_managed",
  "tenant.multilingual_content",
  "tenant.mobile_admin_navigation",
] as const satisfies
  readonly ProductRolloutFeatureKey[];

export const COMMERCIAL_OFFERS = [
  {
    key: "launch_partner",
    name: "Ordum Launch Partner",
    shortDescription:
      "Kompletan digitalni salon sa vođenim onboardingom, javnim sajtom, bookingom i podrškom.",
    status: "active",
    pricingModel: "setup_subscription",
    technicalPackage: "digital_studio",
    setupPriceRsd: 24_900,
    monthlyPriceRsd: 6_990,
    priceLockMonths: null,
    clientLimit: null,
    maxBookableStaff: 5,
    includedLiveFeatures:
      LAUNCH_LIVE_FEATURES,
    managedBetaOptions:
      LAUNCH_MANAGED_BETA_OPTIONS,
    salesNotes: [
      "Prodaje se poslovni rezultat, ne naziv internog entitlement paketa.",
      "Beta opcije se ne garantuju bez prethodne tehničke provere.",
      "Production email i domen zahtevaju managed setup.",
    ],
  },
  {
    key: "founding_partner",
    name: "Ordum Founding Partner",
    shortDescription:
      "Ograničena početna ponuda za prve salone koji aktivno učestvuju u product feedback-u.",
    status: "limited",
    pricingModel: "founding_partner",
    technicalPackage: "digital_studio",
    setupPriceRsd: 19_900,
    monthlyPriceRsd: 4_990,
    priceLockMonths: 12,
    clientLimit: 5,
    maxBookableStaff: 5,
    includedLiveFeatures:
      LAUNCH_LIVE_FEATURES,
    managedBetaOptions:
      LAUNCH_MANAGED_BETA_OPTIONS,
    salesNotes: [
      "Ograničeno na prvih pet prihvaćenih salona.",
      "Cena se zaključava na dvanaest meseci.",
      "Partner daje strukturiran feedback iz realne upotrebe.",
    ],
  },
  {
    key: "signature_custom",
    name: "Ordum Signature",
    shortDescription:
      "Individualna procena za lance, klinike, više lokacija ili složenije operativne zahteve.",
    status: "quote_only",
    pricingModel: "custom_quote",
    technicalPackage: "signature",
    setupPriceRsd: null,
    monthlyPriceRsd: null,
    priceLockMonths: null,
    clientLimit: null,
    maxBookableStaff: null,
    includedLiveFeatures:
      LAUNCH_LIVE_FEATURES,
    managedBetaOptions:
      LAUNCH_MANAGED_BETA_OPTIONS,
    salesNotes: [
      "Ne obećava research module bez zasebnog ugovora i tehničke procene.",
      "Multi-location ostaje individualni arhitektonski pravac.",
    ],
  },
] as const satisfies
  readonly CommercialOfferDefinition[];

export type CommercialOffer =
  (typeof COMMERCIAL_OFFERS)[number];

export type CommercialOfferKey =
  CommercialOffer["key"];

const COMMERCIAL_OFFER_MAP =
  new Map<CommercialOfferKey, CommercialOffer>(
    COMMERCIAL_OFFERS.map(
      (offer) => [offer.key, offer]
    )
  );

export function getCommercialOffer(
  key: CommercialOfferKey
): CommercialOffer {
  const offer =
    COMMERCIAL_OFFER_MAP.get(key);

  if (!offer) {
    throw new Error(
      `Unknown commercial offer: ${key}`
    );
  }

  return offer;
}

export function getPublicCommercialOffers():
  readonly CommercialOffer[] {
  return COMMERCIAL_OFFERS.filter(
    (offer) =>
      (offer as CommercialOfferDefinition)
        .status !== "paused"
  );
}

export function getPrimaryCommercialOffer():
  CommercialOffer {
  return getCommercialOffer(
    "launch_partner"
  );
}
