import type {
  Locale,
  LocalizedText,
  Service,
  ServiceCategory,
} from "@/lib/types";

export function translate(
  text: LocalizedText | undefined | null,
  locale: Locale
): string {
  if (!text) {
    return "";
  }

  const values = text as Record<string, string | undefined>;

  return (
    values[locale] ||
    values["sr-Latn"] ||
    values.en ||
    values.mk ||
    values.sq ||
    ""
  );
}

export const barberLabels: Record<string, LocalizedText> = {
  navServices: {
    "sr-Latn": "Usluge",
    mk: "Услуги",
    sq: "Shërbimet",
    en: "Services",
  },
  navBarbers: {
    "sr-Latn": "Berberi",
    mk: "Бербери",
    sq: "Berberët",
    en: "Barbers",
  },
  navGallery: {
    "sr-Latn": "Galerija",
    mk: "Галерија",
    sq: "Galeria",
    en: "Gallery",
  },
  navContact: {
    "sr-Latn": "Kontakt",
    mk: "Контакт",
    sq: "Kontakti",
    en: "Contact",
  },
  bookAppointment: {
    "sr-Latn": "Zakaži termin",
    mk: "Закажи термин",
    sq: "Rezervo termin",
    en: "Book appointment",
  },
  bookService: {
    "sr-Latn": "Zakaži uslugu",
    mk: "Закажи услуга",
    sq: "Rezervo shërbimin",
    en: "Book service",
  },
  bookBarber: {
    "sr-Latn": "Zakaži",
    mk: "Закажи",
    sq: "Rezervo",
    en: "Book",
  },
  heroEyebrow: {
    "sr-Latn": "Klasičan zanat. Savremena rezervacija.",
    mk: "Класичен занает. Современа резервација.",
    sq: "Zanat klasik. Rezervim modern.",
    en: "Classic craft. Modern booking.",
  },
  heroHeadline1: {
    "sr-Latn": "Precizan rez.",
    mk: "Прецизно сечење.",
    sq: "Prerje e saktë.",
    en: "Precise cut.",
  },
  heroHeadline2: {
    "sr-Latn": "Čista linija.",
    mk: "Чиста линија.",
    sq: "Vijë e pastër.",
    en: "Clean line.",
  },
  heroTrust1: {
    "sr-Latn": "Online zakazivanje",
    mk: "Онлајн закажување",
    sq: "Rezervim online",
    en: "Online booking",
  },
  heroTrust2: {
    "sr-Latn": "Proveren kvalitet",
    mk: "Проверен квалитет",
    sq: "Cilësi e provuar",
    en: "Proven quality",
  },
  viewServices: {
    "sr-Latn": "Pogledaj usluge",
    mk: "Погледни услуги",
    sq: "Shiko shërbimet",
    en: "View services",
  },
  servicesTitle: {
    "sr-Latn": "Usluge bez komplikovanja",
    mk: "Услуги без компликации",
    sq: "Shërbime pa komplikime",
    en: "Services without complications",
  },
  minutes: {
    "sr-Latn": "min",
    mk: "мин",
    sq: "min",
    en: "min",
  },
  barbersTitle: {
    "sr-Latn": "Izaberi svog berberina",
    mk: "Избери го твојот бербер",
    sq: "Zgjidh berberin tënd",
    en: "Choose your barber",
  },
  galleryTitle: {
    "sr-Latn": "Radovi iz stolice",
    mk: "Работи од столчето",
    sq: "Punë nga karrigia",
    en: "Work from the chair",
  },
  galleryEmpty: {
    "sr-Latn": "Galerija je trenutno prazna",
    mk: "Галеријата е моментално празна",
    sq: "Galeria është aktualisht bosh",
    en: "Gallery is currently empty",
  },
  contactTitle: {
    "sr-Latn": "Sledeći termin je nekoliko klikova daleko.",
    mk: "Следниот термин е на неколку клика.",
    sq: "Termi tjetër është disa klikime larg.",
    en: "Your next appointment is a few clicks away.",
  },
  openDesktop: {
    "sr-Latn": "Otvori desktop verziju",
    mk: "Отвори десктоп верзија",
    sq: "Hap versionin desktop",
    en: "Open desktop version",
  },
  footerTheme: {
    "sr-Latn": "Barber Heritage / 01",
    mk: "Barber Heritage / 01",
    sq: "Barber Heritage / 01",
    en: "Barber Heritage / 01",
  },
  allRightsReserved: {
    "sr-Latn": "Sva prava zadržana.",
    mk: "Сите права задржани.",
    sq: "Të gjitha të drejtat e rezervuara.",
    en: "All rights reserved.",
  },
  genericService: {
    "sr-Latn": "Usluga",
    mk: "Услуга",
    sq: "Shërbim",
    en: "Service",
  },
  priceFrom: {
    "sr-Latn": "Od",
    mk: "Од",
    sq: "Nga",
    en: "From",
  },
  previousBarber: {
    "sr-Latn": "Prethodni berberin",
    mk: "Претходен бербер",
    sq: "Berberi i mëparshëm",
    en: "Previous barber",
  },
  nextBarber: {
    "sr-Latn": "Sledeći berberin",
    mk: "Следен бербер",
    sq: "Berberi tjetër",
    en: "Next barber",
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
    return `${translate(barberLabels.priceFrom, locale)} ${formatNumber(priceFrom, locale)} ${currency}`;
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
      return translate(category.name, locale);
    }
  }
  return translate(barberLabels.genericService, locale);
}

export function getLocationLine(
  address: LocalizedText | undefined,
  city: LocalizedText | undefined,
  country: LocalizedText | undefined,
  locale: Locale
): string {
  const parts = [
    translate(address, locale),
    translate(city, locale),
    translate(country, locale),
  ].filter(Boolean);
  return parts.join(", ");
}
