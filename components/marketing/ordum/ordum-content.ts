import {
  CalendarDays,
  ChartNoAxesCombined,
  Globe2,
  MessagesSquare,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { PRODUCT_PACKAGES } from "@/lib/product-packages/registry";

export const capabilities = [
  {
    icon: Globe2,
    eyebrow: "Digitalni identitet",
    title: "Sajt koji izgleda kao vaš studio",
    copy: "Profesionalna tema, usluge, tim, radovi i kontakt na sopstvenom poddomenu — bez generičkog marketplace profila.",
  },
  {
    icon: CalendarDays,
    eyebrow: "Online zakazivanje",
    title: "Termin bez poziva i dopisivanja",
    copy: "Klijent bira uslugu, člana tima i slobodan termin. Salon zadržava kontrolu nad rasporedom i rezervacijama.",
  },
  {
    icon: UsersRound,
    eyebrow: "Tim i operacije",
    title: "Jedno mesto za svakodnevni rad",
    copy: "Owner, manager i staff površine povezuju rezervacije, smene, odsustva i operativne napomene.",
  },
  {
    icon: MessagesSquare,
    eyebrow: "Komunikacija",
    title: "Potvrde koje stižu automatski",
    copy: "Email potvrde i evidencija isporuke prate booking tok, dok rezervacija ostaje bezbedna i kada spoljni servis zastane.",
  },
  {
    icon: ChartNoAxesCombined,
    eyebrow: "Pregled poslovanja",
    title: "Jasna slika termina i statusa",
    copy: "Osnovni booking pokazatelji su deo platforme, a napredniji operativni uvidi rastu zajedno sa paketom.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Tenant sigurnost",
    title: "Podaci svakog studija ostaju odvojeni",
    copy: "Svaki salon ima svoj poslovni prostor, korisnike i javni sajt, uz server-side kontrole pristupa.",
  },
] as const;

const { booking_page, digital_studio, operations_pro } = PRODUCT_PACKAGES;

export const packages = [
  {
    ...booking_page,
    label: "Za uredan početak",
    features: [
      "Javna booking stranica",
      "Admin i staff panel",
      "Email potvrde rezervacija",
      `Do ${booking_page.limits.bookableStaff} bookable člana`,
    ],
  },
  {
    ...digital_studio,
    label: "Najpotpuniji prvi korak",
    featured: true,
    features: [
      "Sve iz Booking Page paketa",
      "Kompletan javni sajt i branding",
      "Galerija, SEO i theme biblioteka",
      "Salon Google Calendar sync",
      `Do ${digital_studio.limits.bookableStaff} bookable članova`,
    ],
  },
  {
    ...operations_pro,
    label: "Za tim koji raste",
    features: [
      "Sve iz Digital Studio paketa",
      "Lični kalendari zaposlenih",
      "Two-way busy availability",
      "Napredna analitika i prioritetna podrška",
      `Do ${operations_pro.limits.bookableStaff} bookable članova`,
    ],
  },
] as const;

export const faqs = [
  {
    question: "Da li klijenti moraju da instaliraju aplikaciju?",
    answer:
      "Ne. Javni sajt i zakazivanje rade direktno u browseru na telefonu ili računaru.",
  },
  {
    question: "Da li unosimo postojeće usluge i tim?",
    answer:
      "Da. Početno podešavanje obuhvata strukturu usluga, zaposlene, radno vreme, osnovni sadržaj i izabrani vizuelni pravac u okviru dogovorenog paketa.",
  },
  {
    question: "Mogu li da vidim kako platforma izgleda pre odluke?",
    answer:
      "Da. Možete otvoriti aktivne demo studije ispod, a zatim zakazati kratku prezentaciju prilagođenu vašem tipu poslovanja.",
  },
  {
    question: "Da li svaki studio dobija isti dizajn?",
    answer:
      "Ne. Platforma deli bezbedne booking i administrativne granice, dok javni renderer bira modularni theme pack prema identitetu i vertikali studija.",
  },
] as const;

export function formatRsd(value: number | null) {
  return value === null
    ? "Po dogovoru"
    : new Intl.NumberFormat("sr-Latn-RS").format(value);
}
