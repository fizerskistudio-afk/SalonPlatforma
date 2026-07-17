import {
  t,
} from "@/lib/translations";

import type {
  Locale,
  LocalizedText,
  Service,
  ServiceCategory,
} from "@/lib/types";

export const barberLabels: Record<
  string,
  LocalizedText
> = {
  navServices: {
    "sr-Latn": "Usluge",
    mk: "Услуги",
    hr: "Usluge",
    sq: "Shërbimet",
    en: "Services",
    de: "Leistungen",
    fr: "Services",
  },
  navBarbers: {
    "sr-Latn": "Berberi",
    mk: "Бербери",
    hr: "Barberi",
    sq: "Berberët",
    en: "Barbers",
    de: "Barbiere",
    fr: "Barbiers",
  },
  navGallery: {
    "sr-Latn": "Galerija",
    mk: "Галерија",
    hr: "Galerija",
    sq: "Galeria",
    en: "Gallery",
    de: "Galerie",
    fr: "Galerie",
  },
  navContact: {
    "sr-Latn": "Kontakt",
    mk: "Контакт",
    hr: "Kontakt",
    sq: "Kontakti",
    en: "Contact",
    de: "Kontakt",
    fr: "Contact",
  },
  bookAppointment: {
    "sr-Latn": "Zakaži termin",
    mk: "Закажи термин",
    hr: "Rezerviraj termin",
    sq: "Rezervo termin",
    en: "Book appointment",
    de: "Termin buchen",
    fr: "Réserver un rendez-vous",
  },
  bookService: {
    "sr-Latn": "Zakaži uslugu",
    mk: "Закажи услуга",
    hr: "Rezerviraj uslugu",
    sq: "Rezervo shërbimin",
    en: "Book service",
    de: "Leistung buchen",
    fr: "Réserver le service",
  },
  bookBarber: {
    "sr-Latn": "Zakaži",
    mk: "Закажи",
    hr: "Rezerviraj",
    sq: "Rezervo",
    en: "Book",
    de: "Buchen",
    fr: "Réserver",
  },
  heroEyebrow: {
    "sr-Latn": "Klasičan zanat. Savremena rezervacija.",
    mk: "Класичен занает. Современа резервација.",
    hr: "Klasičan zanat. Moderna rezervacija.",
    sq: "Zanat klasik. Rezervim modern.",
    en: "Classic craft. Modern booking.",
    de: "Klassisches Handwerk. Moderne Buchung.",
    fr: "Savoir-faire classique. Réservation moderne.",
  },
  heroHeadline1: {
    "sr-Latn": "Precizan rez.",
    mk: "Прецизно сечење.",
    hr: "Precizan rez.",
    sq: "Prerje e saktë.",
    en: "Precise cut.",
    de: "Präziser Schnitt.",
    fr: "Coupe précise.",
  },
  heroHeadline2: {
    "sr-Latn": "Čista linija.",
    mk: "Чиста линија.",
    hr: "Čista linija.",
    sq: "Vijë e pastër.",
    en: "Clean line.",
    de: "Klare Kontur.",
    fr: "Ligne nette.",
  },
  heroTrust1: {
    "sr-Latn": "Online zakazivanje",
    mk: "Онлајн закажување",
    hr: "Online rezervacija",
    sq: "Rezervim online",
    en: "Online booking",
    de: "Online-Buchung",
    fr: "Réservation en ligne",
  },
  heroTrust2: {
    "sr-Latn": "Proveren kvalitet",
    mk: "Проверен квалитет",
    hr: "Provjerena kvaliteta",
    sq: "Cilësi e provuar",
    en: "Proven quality",
    de: "Bewährte Qualität",
    fr: "Qualité éprouvée",
  },
  viewServices: {
    "sr-Latn": "Pogledaj usluge",
    mk: "Погледни услуги",
    hr: "Pogledaj usluge",
    sq: "Shiko shërbimet",
    en: "View services",
    de: "Leistungen ansehen",
    fr: "Voir les services",
  },
  servicesTitle: {
    "sr-Latn": "Usluge bez komplikovanja",
    mk: "Услуги без компликации",
    hr: "Usluge bez komplikacija",
    sq: "Shërbime pa komplikime",
    en: "Services without complications",
    de: "Leistungen ohne Umwege",
    fr: "Des services sans complications",
  },
  minutes: {
    "sr-Latn": "min",
    mk: "мин",
    hr: "min",
    sq: "min",
    en: "min",
    de: "Min.",
    fr: "min",
  },
  barbersTitle: {
    "sr-Latn": "Izaberi svog berberina",
    mk: "Избери го твојот бербер",
    hr: "Odaberi svog barbera",
    sq: "Zgjidh berberin tënd",
    en: "Choose your barber",
    de: "Wählen Sie Ihren Barbier",
    fr: "Choisissez votre barbier",
  },
  galleryTitle: {
    "sr-Latn": "Radovi iz stolice",
    mk: "Работи од столчето",
    hr: "Radovi iz barber stolca",
    sq: "Punë nga karrigia",
    en: "Work from the chair",
    de: "Arbeiten aus dem Barberstuhl",
    fr: "Réalisations au fauteuil",
  },
  galleryEmpty: {
    "sr-Latn": "Galerija je trenutno prazna",
    mk: "Галеријата е моментално празна",
    hr: "Galerija je trenutačno prazna",
    sq: "Galeria është aktualisht bosh",
    en: "Gallery is currently empty",
    de: "Die Galerie ist derzeit leer",
    fr: "La galerie est vide pour le moment",
  },
  contactTitle: {
    "sr-Latn": "Sledeći termin je nekoliko klikova daleko.",
    mk: "Следниот термин е на неколку клика.",
    hr: "Sljedeći termin udaljen je samo nekoliko klikova.",
    sq: "Termi tjetër është disa klikime larg.",
    en: "Your next appointment is a few clicks away.",
    de: "Ihr nächster Termin ist nur wenige Klicks entfernt.",
    fr: "Votre prochain rendez-vous n’est qu’à quelques clics.",
  },
  openDesktop: {
    "sr-Latn": "Otvori desktop verziju",
    mk: "Отвори десктоп верзија",
    hr: "Otvori desktop verziju",
    sq: "Hap versionin desktop",
    en: "Open desktop version",
    de: "Desktop-Version öffnen",
    fr: "Ouvrir la version ordinateur",
  },
  footerTheme: {
    "sr-Latn": "Barber Heritage / 01",
    mk: "Barber Heritage / 01",
    hr: "Barber Heritage / 01",
    sq: "Barber Heritage / 01",
    en: "Barber Heritage / 01",
    de: "Barber Heritage / 01",
    fr: "Barber Heritage / 01",
  },
  allRightsReserved: {
    "sr-Latn": "Sva prava zadržana.",
    mk: "Сите права задржани.",
    hr: "Sva prava pridržana.",
    sq: "Të gjitha të drejtat e rezervuara.",
    en: "All rights reserved.",
    de: "Alle Rechte vorbehalten.",
    fr: "Tous droits réservés.",
  },
  genericService: {
    "sr-Latn": "Usluga",
    mk: "Услуга",
    hr: "Usluga",
    sq: "Shërbim",
    en: "Service",
    de: "Leistung",
    fr: "Service",
  },
  priceFrom: {
    "sr-Latn": "Od",
    mk: "Од",
    hr: "Od",
    sq: "Nga",
    en: "From",
    de: "Ab",
    fr: "À partir de",
  },
  logoAlt: {
    "sr-Latn": "Logo salona",
    mk: "Лого на салонот",
    hr: "Logo salona",
    sq: "Logoja e sallonit",
    en: "Salon logo",
    de: "Salonlogo",
    fr: "Logo du salon",
  },
  galleryImageAlt: {
    "sr-Latn": "Fotografija iz galerije",
    mk: "Фотографија од галеријата",
    hr: "Fotografija iz galerije",
    sq: "Fotografi nga galeria",
    en: "Gallery image",
    de: "Galeriebild",
    fr: "Photo de la galerie",
  },
  previousBarber: {
    "sr-Latn": "Prethodni berberin",
    mk: "Претходен бербер",
    hr: "Prethodni barber",
    sq: "Berberi i mëparshëm",
    en: "Previous barber",
    de: "Vorheriger Barbier",
    fr: "Barbier précédent",
  },
  nextBarber: {
    "sr-Latn": "Sledeći berberin",
    mk: "Следен бербер",
    hr: "Sljedeći barber",
    sq: "Berberi tjetër",
    en: "Next barber",
    de: "Nächster Barbier",
    fr: "Barbier suivant",
  },
  servicesEmpty: {
    "sr-Latn": "Usluge će uskoro biti dodate.",
    mk: "Услугите наскоро ќе бидат додадени.",
    hr: "Usluge će uskoro biti dodane.",
    sq: "Shërbimet do të shtohen së shpejti.",
    en: "Services will be added soon.",
    de: "Leistungen werden in Kürze hinzugefügt.",
    fr: "Les services seront bientôt ajoutés.",
  },
  barbersEmpty: {
    "sr-Latn": "Tim berberina će uskoro biti predstavljen.",
    mk: "Тимот бербери наскоро ќе биде претставен.",
    hr: "Tim barbera uskoro će biti predstavljen.",
    sq: "Ekipi i berberëve do të prezantohet së shpejti.",
    en: "The barber team will be introduced soon.",
    de: "Das Barbier-Team wird in Kürze vorgestellt.",
    fr: "L’équipe de barbiers sera bientôt présentée.",
  },
  navProfile: {
    "sr-Latn": "Salon",
    mk: "Салон",
    hr: "Salon",
    sq: "Salloni",
    en: "Salon",
    de: "Salon",
    fr: "Salon",
  },
};

function formatNumber(value: number, locale: Locale): string {
  const localeCode =
    locale === "sr-Latn" ? "sr-Latn-RS" : locale || "en";

  try {
    return new Intl.NumberFormat(localeCode, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
}

export function formatServicePrice(
  service: Service,
  currency: string,
  locale: Locale
): string {
  const priceFrom =
    service.priceFrom;

  const priceTo =
    service.priceTo;

  if (
    service.priceType === "fixed" &&
    Number.isFinite(priceFrom)
  ) {
    return `${formatNumber(priceFrom, locale)} ${currency}`;
  }

  if (
    service.priceType === "range" &&
    Number.isFinite(priceFrom) &&
    typeof priceTo === "number" &&
    Number.isFinite(priceTo)
  ) {
    return `${formatNumber(priceFrom, locale)}–${formatNumber(priceTo, locale)} ${currency}`;
  }

  if (
    service.priceType === "from" &&
    Number.isFinite(priceFrom)
  ) {
    return `${t(barberLabels.priceFrom, locale)} ${formatNumber(priceFrom, locale)} ${currency}`;
  }

  if (
    Number.isFinite(priceFrom)
  ) {
    if (
      typeof priceTo === "number" &&
      Number.isFinite(priceTo) &&
      priceTo !== priceFrom
    ) {
      return `${formatNumber(priceFrom, locale)}–${formatNumber(priceTo, locale)} ${currency}`;
    }

    return `${formatNumber(priceFrom, locale)} ${currency}`;
  }

  return "—";
}

export function getCategoryLabel(
  service: Service,
  categories: ServiceCategory[],
  locale: Locale
): string {
  if (service.categoryId) {
    const category = categories.find((c) => c.id === service.categoryId);
    if (category) {
      return t(category.name, locale);
    }
  }
  return t(barberLabels.genericService, locale);
}

export function getLocationLine(
  address: LocalizedText | undefined,
  city: LocalizedText | undefined,
  country: LocalizedText | undefined,
  locale: Locale
): string {
  const parts = [
    address
      ? t(
          address,
          locale
        )
      : "",
    city
      ? t(
          city,
          locale
        )
      : "",
    country
      ? t(
          country,
          locale
        )
      : "",
  ].filter(Boolean);
  return parts.join(", ");
}
