import type { BusinessConfig } from "../types";

/**
 * DEMO PODACI - Ovo su primer podaci za frizerski salon u Makedoniji.
 * Kada se poveže pravi klijent, ove vrednosti se menjaju stvarnim podacima.
 * 
 * NAPOMENA: Valuta je postavljena na EUR za demo, ali treba je potvrditi
 * sa konkretnim klijentom (može biti MKD, EUR, ili druga).
 */
export const businessConfig: BusinessConfig = {
  id: "lumiere-studio",
  slug: "lumiere-studio",
  name: "Lumière Studio",
  tagline: {
    mk: "Каде стилот среќава уметност",
    sq: "Ku stili takon artin",
    en: "Where style meets art",
  },
  description: {
    mk: "Премиум фризерски и beauty салон во срцето на Скопје. Посветени на тоа да се чувствувате и изгледате најдобро.",
    sq: "Salon parës për flokë dhe bukuri në zemër të Shkupit. Të përkushtuar që të ndiheni dhe të dukeni sa më mirë.",
    en: "A premium hair & beauty studio in the heart of Skopje. Dedicated to making you look and feel your absolute best.",
  },
  phone: "+389 70 123 456",
  email: "hello@lumiere.mk",
  address: {
    mk: "ул. Македонија 25",
    sq: "rr. Maqedonia 25",
    en: "25 Macedonia St.",
  },
  city: {
    mk: "Скопје",
    sq: "Shkup",
    en: "Skopje",
  },
  country: {
    mk: "Северна Македонија",
    sq: "Maqedonia e Veriut",
    en: "North Macedonia",
  },
  countryCode: "MK",
  instagramHandle: "@lumiere.studio",
  instagramUrl: "https://instagram.com/lumiere.studio",
  defaultLocale: "mk",
  supportedLocales: ["mk", "sq", "en"],
  currency: "EUR", // DEMO: Potvrditi sa klijentom
  timezone: "Europe/Skopje",
  workingHours: [
    { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Monday
    { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Tuesday
    { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Wednesday
    { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false }, // Thursday
    { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false }, // Friday
    { dayOfWeek: 6, openTime: "10:00", closeTime: "16:00", isClosed: false }, // Saturday
    { dayOfWeek: 0, openTime: null, closeTime: null, isClosed: true }, // Sunday
  ],
  showStats: false, // DEMO: Postaviti na true ako klijent želi statistike
  stats: {
    establishedYear: 2015, // DEMO PODATAK
    clients: 2500, // DEMO PODATAK
    rating: 4.9, // DEMO PODATAK
  },
  showReviews: false, // DEMO: Postaviti na true ako klijent želi recenzije
};