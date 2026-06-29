import type {
  GalleryItem,
  Review,
} from "@/lib/types";

/**
 * Statički marketinški sadržaj.
 *
 * Salon, usluge, zaposleni, booking podešavanja
 * i radno vreme dolaze iz Supabase-a.
 *
 * Galerija i recenzije ostaju statičke dok ne
 * napravimo njihove tabele i Supabase Storage.
 */

export const gallery: GalleryItem[] = [
  {
    id: "g1",
    url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    category: "hair",
    alt: {
      mk: "Фризура 1",
      sq: "Fryrë 1",
      en: "Haircut 1",
    },
  },
  {
    id: "g2",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80",
    category: "coloring",
    alt: {
      mk: "Фарбање 1",
      sq: "Ngjyrosje 1",
      en: "Coloring 1",
    },
  },
  {
    id: "g3",
    url: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=800&q=80",
    category: "styling",
    alt: {
      mk: "Стил 1",
      sq: "Stil 1",
      en: "Style 1",
    },
  },
  {
    id: "g4",
    url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&q=80",
    category: "coloring",
    alt: {
      mk: "Фарбање 2",
      sq: "Ngjyrosje 2",
      en: "Coloring 2",
    },
  },
  {
    id: "g5",
    url: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800&q=80",
    category: "beauty",
    alt: {
      mk: "Убавина 1",
      sq: "Bukuri 1",
      en: "Beauty 1",
    },
  },
  {
    id: "g6",
    url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80",
    category: "nails",
    alt: {
      mk: "Нокти 1",
      sq: "Thonj 1",
      en: "Nails 1",
    },
  },
  {
    id: "g7",
    url: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=800&q=80",
    category: "hair",
    alt: {
      mk: "Фризура 2",
      sq: "Fryrë 2",
      en: "Haircut 2",
    },
  },
  {
    id: "g8",
    url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80",
    category: "beauty",
    alt: {
      mk: "Убавина 2",
      sq: "Bukuri 2",
      en: "Beauty 2",
    },
  },
];

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