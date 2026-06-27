import type {
  ServiceCategory,
  Service,
  Employee,
  Review,
  GalleryItem,
  DemoAssets,
  BookingDraft,
} from "./types";

/**
 * DEMO PODACI - Ovo su primer podaci za frizerski salon.
 * Kada se poveže backend, ovi podaci će se učitavati iz baze.
 */

// ============================================
// DEMO ASSETS (SLIKE)
// ============================================

/**
 * DEMO SLIKE - Koristimo Unsplash slike za prototip.
 * Kada se poveže pravi klijent, ove URL-ove treba zameniti
 * slikama stvarnog salona, zaposlenih i radova.
 */
export const DEMO_ASSETS: DemoAssets = {
  hero: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80",
  employees: {
    e1: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
    e2: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
  },
  gallery: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
    "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
    "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&q=80",
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80",
  ],
};

// ============================================
// SERVICE CATEGORIES
// ============================================

export const serviceCategories: ServiceCategory[] = [
  {
    id: "hair",
    icon: "scissors",
    name: {
      mk: "Коса",
      sq: "Flokë",
      en: "Hair",
    },
    isActive: true,
  },
  {
    id: "coloring",
    icon: "palette",
    name: {
      mk: "Фарбање",
      sq: "Ngjyrosje",
      en: "Coloring",
    },
    isActive: true,
  },
  {
    id: "styling",
    icon: "sparkles",
    name: {
      mk: "Фризури",
      sq: "Stilim",
      en: "Styling",
    },
    isActive: true,
  },
  {
    id: "beauty",
    icon: "heart",
    name: {
      mk: "Убавина",
      sq: "Bukuri",
      en: "Beauty",
    },
    isActive: true,
  },
  {
    id: "nails",
    icon: "hand",
    name: {
      mk: "Нокти",
      sq: "Thonj",
      en: "Nails",
    },
    isActive: true,
  },
];

// ============================================
// SERVICES
// ============================================

export const services: Service[] = [
  // Hair
  {
    id: "s1",
    categoryId: "hair",
    name: {
      mk: "Машко стрижење",
      sq: "Prerje mashkullore",
      en: "Men's Cut",
    },
    durationMinutes: 30,
    priceType: "fixed",
    priceFrom: 15,
    isActive: true,
  },
  {
    id: "s2",
    categoryId: "hair",
    name: {
      mk: "Женско стрижење",
      sq: "Prerje femërore",
      en: "Women's Cut",
    },
    durationMinutes: 45,
    priceType: "fixed",
    priceFrom: 25,
    isActive: true,
  },
  {
    id: "s3",
    categoryId: "hair",
    name: {
      mk: "Детско стрижење",
      sq: "Prerje fëmijësh",
      en: "Kids Cut",
    },
    durationMinutes: 20,
    priceType: "fixed",
    priceFrom: 10,
    isActive: true,
  },

  // Coloring
  {
    id: "s4",
    categoryId: "coloring",
    name: {
      mk: "Целосно фарбање",
      sq: "Ngjyrosje e plotë",
      en: "Full Color",
    },
    durationMinutes: 90,
    priceType: "from",
    priceFrom: 45,
    isActive: true,
  },
  {
    id: "s5",
    categoryId: "coloring",
    name: {
      mk: "Балајаж",
      sq: "Balayage",
      en: "Balayage",
    },
    durationMinutes: 150,
    priceType: "range",
    priceFrom: 85,
    priceTo: 150,
    isActive: true,
  },
  {
    id: "s6",
    categoryId: "coloring",
    name: {
      mk: "Истакнување",
      sq: "Theksim",
      en: "Highlights",
    },
    durationMinutes: 120,
    priceType: "range",
    priceFrom: 65,
    priceTo: 120,
    isActive: true,
  },

  // Styling
  {
    id: "s7",
    categoryId: "styling",
    name: {
      mk: "Фенирање",
      sq: "Fenim",
      en: "Blow Dry",
    },
    durationMinutes: 30,
    priceType: "fixed",
    priceFrom: 15,
    isActive: true,
  },
  {
    id: "s8",
    categoryId: "styling",
    name: {
      mk: "Свечена фризура",
      sq: "Fryrë feste",
      en: "Special Occasion",
    },
    durationMinutes: 60,
    priceType: "from",
    priceFrom: 40,
    isActive: true,
  },

  // Beauty
  {
    id: "s9",
    categoryId: "beauty",
    name: {
      mk: "Обликување веѓи",
      sq: "Formë vetullash",
      en: "Brow Shaping",
    },
    durationMinutes: 20,
    priceType: "fixed",
    priceFrom: 10,
    isActive: true,
  },
  {
    id: "s10",
    categoryId: "beauty",
    name: {
      mk: "Третман за лице",
      sq: "Trajtim fytyre",
      en: "Facial Treatment",
    },
    durationMinutes: 60,
    priceType: "from",
    priceFrom: 35,
    isActive: true,
  },

  // Nails
  {
    id: "s11",
    categoryId: "nails",
    name: {
      mk: "Маникир",
      sq: "Manikyr",
      en: "Manicure",
    },
    durationMinutes: 45,
    priceType: "fixed",
    priceFrom: 20,
    isActive: true,
  },
  {
    id: "s12",
    categoryId: "nails",
    name: {
      mk: "Педикир",
      sq: "Pedikyr",
      en: "Pedicure",
    },
    durationMinutes: 60,
    priceType: "fixed",
    priceFrom: 30,
    isActive: true,
  },
];

// ============================================
// EMPLOYEES
// ============================================

export const employees: Employee[] = [
  {
    id: "e1",
    name: "Arben",
    role: {
      mk: "Сениор фризер",
      sq: "Stilist senior flokësh",
      en: "Senior Hair Stylist",
    },
    image: DEMO_ASSETS.employees.e1,
    bio: {
      mk: "15 години искуство. Специјалист за модерно машко и женско стрижење и фризури.",
      sq: "15 vite përvojë. Specialist për prerje moderne mashkullore e femërore.",
      en: "15 years of experience. Specialist in modern men's and women's cuts.",
    },
    serviceIds: ["s1", "s2", "s3", "s7", "s8"],
    workingHours: [
      {
        dayOfWeek: 1,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 2,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 3,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 4,
        openTime: "09:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 5,
        openTime: "09:00",
        closeTime: "20:00",
        isClosed: false,
      },
      {
        dayOfWeek: 6,
        openTime: "10:00",
        closeTime: "14:00",
        isClosed: false,
      },
      {
        dayOfWeek: 0,
        openTime: null,
        closeTime: null,
        isClosed: true,
      },
    ],
    isActive: true,
  },
  {
    id: "e2",
    name: "Elira",
    role: {
      mk: "Специјалист за боја и убавина",
      sq: "Specialiste ngjyrash & bukurie",
      en: "Color & Beauty Specialist",
    },
    image: DEMO_ASSETS.employees.e2,
    bio: {
      mk: "Експерт за балајаж, фарбање и третмани за лице.",
      sq: "Experte e balayage, ngjyrosjes dhe trajtimeve të fytyrës.",
      en: "Expert in balayage, coloring, and facial treatments.",
    },
    serviceIds: [
      "s2",
      "s4",
      "s5",
      "s6",
      "s9",
      "s10",
      "s11",
      "s12",
    ],
    workingHours: [
      {
        dayOfWeek: 1,
        openTime: null,
        closeTime: null,
        isClosed: true,
      },
      {
        dayOfWeek: 2,
        openTime: "10:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 3,
        openTime: "10:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 4,
        openTime: "10:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 5,
        openTime: "10:00",
        closeTime: "18:00",
        isClosed: false,
      },
      {
        dayOfWeek: 6,
        openTime: "10:00",
        closeTime: "16:00",
        isClosed: false,
      },
      {
        dayOfWeek: 0,
        openTime: null,
        closeTime: null,
        isClosed: true,
      },
    ],
    isActive: true,
  },
];

// ============================================
// REVIEWS
// ============================================

export const reviews: Review[] = [
  {
    id: "r1",
    author: "Marija S.",
    rating: 5,
    text: {
      mk: "Апсолутно најдобриот салон во градот! Arben точно знае што работи.",
      sq: "Absolisht saloni më i mirë në qytet! Arben saktësisht e di çfarë bën.",
      en: "Absolutely the best salon in town! Arben knows exactly what he's doing.",
    },
    date: "2024-11-15",
  },
  {
    id: "r2",
    author: "Besa K.",
    rating: 5,
    text: {
      mk: "Elira ми го направи најубавиот балајаж досега. Препорачувам!",
      sq: "Elira më bëri balayage-n më të bukur deri tani. Rekomandoj!",
      en: "Elira gave me the most beautiful balayage ever. Highly recommend!",
    },
    date: "2024-11-10",
  },
  {
    id: "r3",
    author: "Stefan D.",
    rating: 5,
    text: {
      mk: "Професионална услуга, чист простор и одлична атмосфера.",
      sq: "Shërbim profesional, ambient i pastër dhe atmosferë e shkëlqyer.",
      en: "Professional service, clean space and great atmosphere.",
    },
    date: "2024-10-28",
  },
  {
    id: "r4",
    author: "Ana P.",
    rating: 5,
    text: {
      mk: "Секогаш излезам насмеана. Најдобриот тим!",
      sq: "Gjithmonë dal e buzëqeshur. Ekipi më i mirë!",
      en: "I always leave smiling. The best team!",
    },
    date: "2024-10-20",
  },
];

// ============================================
// GALLERY
// ============================================

export const gallery: GalleryItem[] = [
  { id: "g1", url: DEMO_ASSETS.gallery[0], category: "hair", alt: { mk: "Фризура 1", sq: "Fryrë 1", en: "Haircut 1" } },
  { id: "g2", url: DEMO_ASSETS.gallery[1], category: "coloring", alt: { mk: "Фарбање 1", sq: "Ngjyrosje 1", en: "Coloring 1" } },
  { id: "g3", url: DEMO_ASSETS.gallery[2], category: "styling", alt: { mk: "Стил 1", sq: "Stil 1", en: "Style 1" } },
  { id: "g4", url: DEMO_ASSETS.gallery[3], category: "coloring", alt: { mk: "Фарбање 2", sq: "Ngjyrosje 2", en: "Coloring 2" } },
  { id: "g5", url: DEMO_ASSETS.gallery[4], category: "beauty", alt: { mk: "Убавина 1", sq: "Bukuri 1", en: "Beauty 1" } },
  { id: "g6", url: DEMO_ASSETS.gallery[5], category: "nails", alt: { mk: "Нокти 1", sq: "Thonj 1", en: "Nails 1" } },
  { id: "g7", url: DEMO_ASSETS.gallery[6], category: "hair", alt: { mk: "Фризура 2", sq: "Fryrë 2", en: "Haircut 2" } },
  { id: "g8", url: DEMO_ASSETS.gallery[7], category: "beauty", alt: { mk: "Убавина 2", sq: "Bukuri 2", en: "Beauty 2" } },
];

// ============================================
// BOOKING DRAFT FACTORY
// ============================================

/**
 * Kreira nov početni booking draft objekat.
 * Svaki poziv vraća nov objekat sa default vrednostima.
 */
export function createInitialBookingDraft(): BookingDraft {
  return {
    serviceId: null,
    employeePreference: null,
    date: null,
    time: null,
    customer: {
      name: "",
      phone: "",
      email: "",
      note: "",
    },
  };
}