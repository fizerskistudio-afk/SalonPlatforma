import type {
  LocaleCode,
  UiLocaleCode,
} from "@/lib/i18n/locales";
import type {
  ReviewBadgeKind,
  ReviewSource,
} from "@/lib/reviews/domain";

// ============================================
// LOCALE & TRANSLATIONS
// ============================================

/**
 * Jezici za koje je kompletan sistemski UI
 * trenutno preveden i pokriven readiness testom.
 */
export type UiLocale =
  UiLocaleCode;

/**
 * Javni runtime prosleđuje locale kroz mnogo
 * postojećih komponenti. Vrednosti se validiraju
 * na ulazu preko centralnog locale registry-ja.
 *
 * Ovaj kompatibilni alias omogućava postepenu
 * migraciju bez menjanja svih komponenti odjednom.
 */
export type Locale = string;

/**
 * Jezici sadržaja koje biznis može da koristi.
 * Lista dolazi iz centralnog locale registry-ja.
 */
export type ContentLocale = LocaleCode;

/**
 * Sistemski UI ima stroži readiness test za sve UiLocale jezike.
 *
 * Tenant sadržaj ostaje kompatibilan sa postojećim zapisima:
 * mk/sq/en su istorijski obavezni, dok su sr-Latn i svi ostali
 * content jezici opcioni po zapisu i koriste bezbedan fallback.
 */
export type LegacyRequiredUiLocale =
  | "mk"
  | "sq"
  | "en";

export type LocalizedText =
  Record<
    LegacyRequiredUiLocale,
    string
  > &
  Partial<
    Record<
      Exclude<
        ContentLocale,
        LegacyRequiredUiLocale
      >,
      string
    >
  >;

// ============================================
// BUSINESS CONFIG TYPES
// ============================================

export type DayOfWeek =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

// 0 = Sunday
// 1 = Monday
// 2 = Tuesday
// 3 = Wednesday
// 4 = Thursday
// 5 = Friday
// 6 = Saturday

export type WorkingHours = {
  dayOfWeek: DayOfWeek;
  openTime: string | null;
  closeTime: string | null;
  isClosed: boolean;
};

export type BusinessStats = {
  establishedYear?: number;
  clients?: number;
  rating?: number;
};

export type BusinessConfig = {
  id: string;
  slug: string;
  name: string;
  tagline: LocalizedText;
  description: LocalizedText;
  phone: string;
  email: string;
  address: LocalizedText;
  city: LocalizedText;
  country: LocalizedText;
  countryCode: string;
  instagramHandle: string;
  instagramUrl: string;
  defaultLocale: UiLocale;
  supportedLocales: UiLocale[];
  currency: string;
  timezone: string;
  workingHours: WorkingHours[];
  showStats: boolean;
  stats: BusinessStats;
  showReviews: boolean;
};

// ============================================
// THEME CONFIG TYPES
// ============================================

export type ThemeColors = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  muted: string;
  border: string;
};

export type ThemeRadius = {
  sm: string;
  md: string;
  lg: string;
};

export type ThemeConfig = {
  colors: ThemeColors;
  radius: ThemeRadius;
};

// ============================================
// SUPABASE CATALOG BUSINESS
// ============================================

export type CatalogBusiness = {
  id: string;
  slug: string;
  name: string;
  tagline: LocalizedText;
  description: LocalizedText;
  phone: string;
  email: string;
  address: LocalizedText;
  city: LocalizedText;
  country: LocalizedText;
  instagramHandle: string;
  instagramUrl: string;
  heroImageUrl: string;
  logoUrl: string;

  /**
   * UI-jezički sloj.
   * Trenutno su kompletno prevedeni sr-Latn/mk/sq/en.
   */
  defaultLocale: UiLocale;
  supportedLocales: UiLocale[];

  /**
   * Pravi globalni jezički izbor biznisa.
   * Ova polja dolaze direktno iz baze.
   */
  defaultContentLocale: ContentLocale;
  supportedContentLocales: ContentLocale[];

  currency: string;
  timezone: string;
  workingHours: WorkingHours[];

  theme: ThemeColors;
};

// ============================================
// BOOKING CONFIG TYPES
// ============================================

export type BookingConfig = {
  slotIntervalMinutes: number;
  bookingWindowDays: number;
  minimumAdvanceMinutes: number;
  allowAnyEmployee: boolean;
  requireEmail: boolean;
  requirePhone: boolean;
  allowNotes: boolean;
};

export type CatalogBookingConfig =
  BookingConfig & {
    autoConfirm: boolean;
  };

// ============================================
// SERVICE & EMPLOYEE TYPES
// ============================================

export type ServiceCategoryIcon =
  | "scissors"
  | "palette"
  | "sparkles"
  | "heart"
  | "hand";

export type ServiceCategory = {
  id: string;
  slug?: string;
  icon: ServiceCategoryIcon;
  name: LocalizedText;
  description?: LocalizedText;
  imageUrl?: string;
  imagePosition?: string;
  sortOrder?: number;
  isActive: boolean;
};

export type ServicePriceType =
  | "fixed"
  | "from"
  | "range";

export type Service = {
  id: string;
  categoryId: string;
  slug?: string;
  name: LocalizedText;
  description?: LocalizedText;
  durationMinutes: number;
  priceType: ServicePriceType;
  priceFrom: number;
  priceTo?: number;
  sortOrder?: number;
  isActive: boolean;
};

export type Employee = {
  id: string;
  slug?: string;
  name: string;
  role: LocalizedText;
  image: string;
  bio: LocalizedText;
  serviceIds: string[];
  workingHours?: WorkingHours[];
  sortOrder?: number;
  isActive: boolean;
};

// ============================================
// CONTENT TYPES
// ============================================

export type CatalogReview = {
  id: string;
  source: ReviewSource;
  badge: ReviewBadgeKind;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number | null;
  body: string;
  languageCode: string | null;
  isVerifiedVisit: boolean;
  serviceId: string | null;
  employeeId: string | null;
  externalUrl: string | null;
  ownerReply: string | null;
  ownerReplyAt: string | null;
  publishedAt: string;
};

export type CatalogReviewSummary = {
  total: number;
  ratedCount: number;
  averageRating: number | null;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type CatalogReviewConfig = {
  enabled: boolean;
  directSubmissionEnabled: boolean;
  verifiedSubmissionEnabled: boolean;
  testimonialsEnabled: boolean;
  googleReviewsEnabled: boolean;
  showRatingSummary: boolean;
  googleReviewUrl: string | null;
};

export type GalleryItem = {
  id: string;
  url: string;
  category: string;
  alt: LocalizedText;
};

// ============================================
// COMPLETE CATALOG
// ============================================

export type CatalogData = {
  business: CatalogBusiness;
  booking: CatalogBookingConfig;
  categories: ServiceCategory[];
  services: Service[];
  employees: Employee[];
  gallery: GalleryItem[];

  reviews: CatalogReview[];
  reviewSummary: CatalogReviewSummary;
  reviewConfig: CatalogReviewConfig;
};

// ============================================
// BOOKING TYPES
// ============================================

export type BookingDraft = {
  serviceId: string | null;

  employeePreference:
    | "any"
    | string
    | null;

  date: string | null;
  time: string | null;

  customer: {
    name: string;
    phone: string;
    email: string;
    note: string;
  };
};

// Stari mock tipovi ostaju privremeno.
// Brišemo ih na kraju Faze 8.9.

export type AvailabilitySlot = {
  time: string;
  available: boolean;
};

export type MockAvailabilityParams = {
  employeePreference:
    | "any"
    | string
    | null;

  serviceId: string | null;
  date: string | null;
};

export type MockBusyPeriod = {
  employeeId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
};

// ============================================
// DEMO ASSETS
// ============================================

export type DemoAssets = {
  hero: string;
  employees: Record<string, string>;
  gallery: string[];
};
