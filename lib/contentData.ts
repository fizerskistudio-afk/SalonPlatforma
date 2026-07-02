import type {
  Review,
} from "@/lib/types";

/**
 * Statički marketinški sadržaj.
 *
 * Salon, usluge, zaposleni, booking podešavanja,
 * radno vreme i galerija dolaze iz Supabase-a.
 *
 * Recenzije ostaju statičke dok ne napravimo
 * njihovu tabelu i admin upravljanje.
 */

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
