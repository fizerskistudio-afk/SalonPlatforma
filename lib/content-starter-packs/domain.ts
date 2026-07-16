import type {
  LocaleCode,
} from "@/lib/i18n/locales";

export const STARTER_PACK_VERTICALS = [
  "beauty-general",
  "hair-salon",
  "barber",
  "nails",
  "lashes-brows",
  "massage",
  "spa",
  "waxing",
  "laser-hair-removal",
  "solarium",
] as const;

export type StarterPackVertical =
  (typeof STARTER_PACK_VERTICALS)[number];

export const STARTER_PACK_MODULE_IDS = [
  "aftercare",
  "before-after-gallery",
  "bridal-services",
  "brow-lamination",
  "color-consultation",
  "consent",
  "couples-treatments",
  "deposits",
  "device-booking",
  "gift-cards",
  "health-intake",
  "kids-services",
  "lash-extensions",
  "loyalty",
  "memberships",
  "mens-grooming",
  "nail-art",
  "patch-test",
  "resource-booking",
  "service-packages",
  "walk-ins",
] as const;

export type StarterPackModuleId =
  (typeof STARTER_PACK_MODULE_IDS)[number];

export type StarterPackModuleSupport =
  | "required"
  | "recommended"
  | "optional"
  | "unsupported";

export type StarterPackPricingMode =
  | "fixed"
  | "from"
  | "consultation"
  | "by_length"
  | "by_duration"
  | "by_area";

export type StarterPackQuestionKind =
  | "text"
  | "boolean"
  | "select"
  | "notice";

export type StarterPackResourceKind =
  | "room"
  | "device"
  | "equipment"
  | "capacity";

export type StarterPackContentSectionKind =
  | "hero"
  | "about"
  | "services"
  | "benefits"
  | "team"
  | "gallery"
  | "reviews"
  | "booking"
  | "contact"
  | "safety"
  | "faq";

export type StarterPackCategory = {
  key: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type StarterPackStaffRole = {
  key: string;
  name: string;
  description: string;
  sortOrder: number;
};

export type StarterPackIntakeQuestion = {
  key: string;
  label: string;
  kind:
    StarterPackQuestionKind;
  required: boolean;
  options?: string[];
  helpText?: string;
};

export type StarterPackResource = {
  key: string;
  label: string;
  kind:
    StarterPackResourceKind;
  bookingCapability:
    "current_staff_only"
    | "future_resource_gate";
  description: string;
};

export type StarterPackService = {
  key: string;
  categoryKey: string;
  name: string;
  description: string;
  defaultDurationMinutes: number;
  suggestedBufferMinutes: number;
  pricingMode:
    StarterPackPricingMode;
  priceStatus:
    "unset";
  bookableByDefault: boolean;
  requiresConsultation: boolean;
  requiredQuestionKeys: string[];
  compatibleStaffRoleKeys: string[];
  requiredResourceKeys: string[];
  tags: string[];
  sortOrder: number;
};

export type StarterPackBookingDefaults = {
  minimumNoticeMinutes: number;
  maximumAdvanceDays: number;
  cancellationWindowHours: number;
  rescheduleWindowHours: number;
  slotIntervalMinutes: number;
  defaultBufferMinutes: number;
  allowAnyStaff: boolean;
  requiresOwnerConfirmation:
    true;
};

export type StarterPackPolicyTemplate = {
  key: string;
  title: string;
  body: string;
  status:
    "draft";
  requiresOwnerConfirmation:
    true;
};

export type StarterPackFaqItem = {
  key: string;
  question: string;
  answer: string;
  status:
    "draft";
  requiresOwnerConfirmation:
    true;
};

export type StarterPackContentSection = {
  key: string;
  kind:
    StarterPackContentSectionKind;
  title: string;
  subtitle?: string;
  body: string;
  ctaLabel?: string;
  tokens: string[];
  status:
    "draft";
};

export type StarterPackSeoDefaults = {
  titleTemplate: string;
  descriptionTemplate: string;
  serviceTitleTemplate: string;
  status:
    "draft";
};

export type StarterPackMediaSlot = {
  key: string;
  label: string;
  aspectRatio: string;
  minimumWidth: number;
  minimumHeight: number;
  required: boolean;
  altTextTemplate: string;
};

export type StarterPackModuleDefinition = {
  id:
    StarterPackModuleId;
  label: string;
  description: string;
  capabilities: string[];
  activationNotes: string[];
  requiresFutureCapability:
    boolean;
};

export type StarterPackManifest = {
  id:
    StarterPackVertical;
  version: 1;
  vertical:
    StarterPackVertical;
  defaultLocale:
    LocaleCode;
  supportedLocales:
    LocaleCode[];
  label: string;
  description: string;
  categories:
    StarterPackCategory[];
  services:
    StarterPackService[];
  staffRoles:
    StarterPackStaffRole[];
  intakeQuestions:
    StarterPackIntakeQuestion[];
  resources:
    StarterPackResource[];
  bookingDefaults:
    Partial<
      StarterPackBookingDefaults
    >;
  policies:
    StarterPackPolicyTemplate[];
  faq:
    StarterPackFaqItem[];
  contentSections:
    StarterPackContentSection[];
  seo:
    Partial<
      StarterPackSeoDefaults
    >;
  mediaSlots:
    StarterPackMediaSlot[];
  moduleSupport:
    Record<
      StarterPackModuleId,
      StarterPackModuleSupport
    >;
};

export type StarterPackPreviewModule = {
  definition:
    StarterPackModuleDefinition;
  support:
    Exclude<
      StarterPackModuleSupport,
      "unsupported"
    >;
  selected: boolean;
};

export type StarterPackPreview = {
  mode:
    "preview_only";
  packId:
    StarterPackVertical;
  version: 1;
  vertical:
    StarterPackVertical;
  locale:
    LocaleCode;
  label: string;
  description: string;
  categories:
    StarterPackCategory[];
  services:
    StarterPackService[];
  staffRoles:
    StarterPackStaffRole[];
  intakeQuestions:
    StarterPackIntakeQuestion[];
  resources:
    StarterPackResource[];
  bookingDefaults:
    StarterPackBookingDefaults;
  policies:
    StarterPackPolicyTemplate[];
  faq:
    StarterPackFaqItem[];
  contentSections:
    StarterPackContentSection[];
  seo:
    StarterPackSeoDefaults;
  mediaSlots:
    StarterPackMediaSlot[];
  modules:
    StarterPackPreviewModule[];
  warnings: string[];
  requiresOwnerConfirmation:
    true;
  applyAllowed:
    false;
  publishAllowed:
    false;
};
