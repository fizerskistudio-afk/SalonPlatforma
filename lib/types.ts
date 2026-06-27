// ============================================
// LOCALE & TRANSLATIONS
// ============================================

export type Locale = "mk" | "sq" | "en";

export type LocalizedText = Record<Locale, string>;

// ============================================
// BUSINESS CONFIG TYPES
// ============================================

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday

export type WorkingHours = {
  dayOfWeek: DayOfWeek;
  openTime: string | null; // "HH:MM" format or null if closed
  closeTime: string | null; // "HH:MM" format or null if closed
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
  defaultLocale: Locale;
  supportedLocales: Locale[];
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
  icon: ServiceCategoryIcon;
  name: LocalizedText;
};

export type ServicePriceType = "fixed" | "from" | "range";

export type Service = {
  id: string;
  categoryId: string;
  name: LocalizedText;
  durationMinutes: number;
  priceType: ServicePriceType;
  priceFrom: number;
  priceTo?: number;
};

export type Employee = {
  id: string;
  name: string;
  role: LocalizedText;
  image: string;
  bio: LocalizedText;
  serviceIds: string[];
  workingHours?: WorkingHours[]; // Optional: ako nema, koristi se businessConfig.workingHours
};

// ============================================
// CONTENT TYPES
// ============================================

export type Review = {
  id: string;
  author: string;
  rating: number;
  text: LocalizedText;
  date: string;
};

export type GalleryItem = {
  id: string;
  url: string;
  category: string;
  alt: LocalizedText;
};

// ============================================
// BOOKING TYPES
// ============================================

export type BookingDraft = {
  serviceId: string | null;
  employeePreference: "any" | string | null;
  date: string | null;
  time: string | null;
  customer: {
    name: string;
    phone: string;
    email: string;
    note: string;
  };
};

export type AvailabilitySlot = {
  time: string;
  available: boolean;
};

export type MockAvailabilityParams = {
  employeePreference: "any" | string | null;
  serviceId: string | null;
  date: string | null;
};

export type MockBusyPeriod = {
  employeeId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
};

// ============================================
// DEMO ASSETS
// ============================================

export type DemoAssets = {
  hero: string;
  employees: Record<string, string>;
  gallery: string[];
};