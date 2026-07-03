import {
  translations,
} from "@/lib/translations";
import type {
  Locale,
  LocalizedText,
  Service,
  ServiceCategory,
} from "@/lib/types";

export const editorialLabels = {
  eyebrow: {
    mk: "Editorial beauty studio",
    sq: "Editorial beauty studio",
    en: "Editorial beauty studio",
  },

  signatureServices: {
    mk: "Избрани услуги",
    sq: "Shërbime të zgjedhura",
    en: "Signature services",
  },

  servicesIntro: {
    mk: "Прецизна работа, јасни цени и термин резервиран без повик.",
    sq: "Punë precize, çmime të qarta dhe rezervim pa telefonatë.",
    en: "Precise work, clear pricing and booking without a phone call.",
  },

  meetArtists: {
    mk: "Запознајте ги артистите",
    sq: "Njihuni me artistët",
    en: "Meet the artists",
  },

  teamIntro: {
    mk: "Изберете професионалец чиј стил ви одговара.",
    sq: "Zgjidhni profesionistin stili i të cilit ju përshtatet.",
    en: "Choose the professional whose style fits you.",
  },

  selectedWork: {
    mk: "Избрани работи",
    sq: "Punë të zgjedhura",
    en: "Selected work",
  },

  galleryIntro: {
    mk: "Детали, текстура и форма од нашето студио.",
    sq: "Detaje, teksturë dhe formë nga studioja jonë.",
    en: "Detail, texture and form from our studio.",
  },

  visitStudio: {
    mk: "Посетете го студиото",
    sq: "Vizitoni studion",
    en: "Visit the studio",
  },

  contactIntro: {
    mk: "Сè што ви е потребно за следната посета, на едно место.",
    sq: "Gjithçka që ju duhet për vizitën e ardhshme, në një vend.",
    en: "Everything you need for your next visit, in one place.",
  },

  bookService: {
    mk: "Закажи ја услугата",
    sq: "Rezervo shërbimin",
    en: "Book this service",
  },

  bookArtist: {
    mk: "Закажи кај",
    sq: "Rezervo me",
    en: "Book with",
  },

  openDesktop: {
    mk: "Отвори desktop верзија",
    sq: "Hap versionin desktop",
    en: "Open desktop version",
  },

  followStudio: {
    mk: "Следете го студиото",
    sq: "Ndiqni studion",
    en: "Follow the studio",
  },

  noGallery: {
    mk: "Галеријата наскоро ќе биде дополнета.",
    sq: "Galeria do të plotësohet së shpejti.",
    en: "The gallery will be updated soon.",
  },
} satisfies Record<
  string,
  LocalizedText
>;

export function translate(
  text: LocalizedText,
  locale: Locale
): string {
  const values =
    text as Record<
      string,
      string | undefined
    >;

  return (
    values[locale] ||
    text.en ||
    text.mk ||
    text.sq ||
    ""
  );
}

function formatAmount(
  value: number,
  currency: string,
  locale: Locale
): string {
  try {
    return new Intl.NumberFormat(
      locale || "en",
      {
        style: "currency",
        currency,
        minimumFractionDigits:
          Number.isInteger(value)
            ? 0
            : 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  } catch {
    const amount =
      Number.isInteger(value)
        ? String(value)
        : value.toFixed(2);

    return `${amount} ${currency}`;
  }
}

export function formatServicePrice(
  service: Service,
  currency: string,
  locale: Locale
): string {
  const from =
    formatAmount(
      service.priceFrom,
      currency,
      locale
    );

  if (
    service.priceType ===
    "fixed"
  ) {
    return from;
  }

  if (
    service.priceType ===
    "range" &&
    service.priceTo !== undefined
  ) {
    return `${from} — ${formatAmount(
      service.priceTo,
      currency,
      locale
    )}`;
  }

  return `${translate(
    translations.priceTypes.from,
    locale
  )} ${from}`;
}

export function getCategoryLabel(
  service: Service,
  categories: ServiceCategory[],
  locale: Locale
): string {
  const category =
    categories.find(
      (item) =>
        item.id ===
        service.categoryId
    );

  return category
    ? translate(
        category.name,
        locale
      )
    : translate(
        translations.common
          .service,
        locale
      );
}

export function getLocationLine(
  address: LocalizedText,
  city: LocalizedText,
  country: LocalizedText,
  locale: Locale
): string {
  return [
    translate(
      address,
      locale
    ),
    translate(
      city,
      locale
    ),
    translate(
      country,
      locale
    ),
  ]
    .filter(Boolean)
    .join(", ");
}
