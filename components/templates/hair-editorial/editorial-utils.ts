import {
  t,
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
    "sr-Latn": "Savremeni frizerski studio",
    mk: "Editorial beauty studio",
    hr: "Suvremeni frizerski studio",
    sq: "Editorial beauty studio",
    en: "Editorial beauty studio",
    de: "Modernes Friseuratelier",
    fr: "Studio de coiffure contemporain",
  },
  signatureServices: {
    "sr-Latn": "Izdvojene usluge",
    mk: "Избрани услуги",
    hr: "Izdvojene usluge",
    sq: "Shërbime të zgjedhura",
    en: "Signature services",
    de: "Ausgewählte Leistungen",
    fr: "Services signature",
  },
  servicesIntro: {
    "sr-Latn": "Precizan rad, jasne cene i rezervacija bez telefonskog poziva.",
    mk: "Прецизна работа, јасни цени и термин резервиран без повик.",
    hr: "Precizan rad, jasne cijene i rezervacija bez telefonskog poziva.",
    sq: "Punë precize, çmime të qarta dhe rezervim pa telefonatë.",
    en: "Precise work, clear pricing and booking without a phone call.",
    de: "Präzise Arbeit, klare Preise und Buchung ohne Telefonanruf.",
    fr: "Un travail précis, des prix clairs et une réservation sans appel téléphonique.",
  },
  meetArtists: {
    "sr-Latn": "Upoznajte naš tim",
    mk: "Запознајте ги артистите",
    hr: "Upoznajte naš tim",
    sq: "Njihuni me artistët",
    en: "Meet the artists",
    de: "Lernen Sie unser Team kennen",
    fr: "Découvrez notre équipe",
  },
  teamIntro: {
    "sr-Latn": "Izaberite profesionalca čiji stil vam najviše odgovara.",
    mk: "Изберете професионалец чиј стил ви одговара.",
    hr: "Odaberite profesionalca čiji vam stil najviše odgovara.",
    sq: "Zgjidhni profesionistin stili i të cilit ju përshtatet.",
    en: "Choose the professional whose style fits you.",
    de: "Wählen Sie den Profi, dessen Stil am besten zu Ihnen passt.",
    fr: "Choisissez le professionnel dont le style vous correspond le mieux.",
  },
  selectedWork: {
    "sr-Latn": "Izdvojeni radovi",
    mk: "Избрани работи",
    hr: "Izdvojeni radovi",
    sq: "Punë të zgjedhura",
    en: "Selected work",
    de: "Ausgewählte Arbeiten",
    fr: "Sélection de réalisations",
  },
  galleryIntro: {
    "sr-Latn": "Detalji, tekstura i forma iz našeg studija.",
    mk: "Детали, текстура и форма од нашето студио.",
    hr: "Detalji, tekstura i forma iz našeg studija.",
    sq: "Detaje, teksturë dhe formë nga studioja jonë.",
    en: "Detail, texture and form from our studio.",
    de: "Details, Textur und Form aus unserem Studio.",
    fr: "Détails, texture et forme issus de notre studio.",
  },
  visitStudio: {
    "sr-Latn": "Posetite studio",
    mk: "Посетете го студиото",
    hr: "Posjetite studio",
    sq: "Vizitoni studion",
    en: "Visit the studio",
    de: "Studio besuchen",
    fr: "Visitez le studio",
  },
  contactIntro: {
    "sr-Latn": "Sve što vam je potrebno za sledeću posetu, na jednom mestu.",
    mk: "Сè што ви е потребно за следната посета, на едно место.",
    hr: "Sve što vam je potrebno za sljedeći posjet, na jednom mjestu.",
    sq: "Gjithçka që ju duhet për vizitën e ardhshme, në një vend.",
    en: "Everything you need for your next visit, in one place.",
    de: "Alles, was Sie für Ihren nächsten Besuch brauchen, an einem Ort.",
    fr: "Tout ce dont vous avez besoin pour votre prochaine visite, au même endroit.",
  },
  bookService: {
    "sr-Latn": "Zakaži ovu uslugu",
    mk: "Закажи ја услугата",
    hr: "Rezerviraj ovu uslugu",
    sq: "Rezervo shërbimin",
    en: "Book this service",
    de: "Diese Leistung buchen",
    fr: "Réserver ce service",
  },
  bookArtist: {
    "sr-Latn": "Zakaži kod",
    mk: "Закажи кај",
    hr: "Rezerviraj kod",
    sq: "Rezervo me",
    en: "Book with",
    de: "Buchen bei",
    fr: "Réserver avec",
  },
  openDesktop: {
    "sr-Latn": "Otvori desktop verziju",
    mk: "Отвори desktop верзија",
    hr: "Otvori desktop verziju",
    sq: "Hap versionin desktop",
    en: "Open desktop version",
    de: "Desktop-Version öffnen",
    fr: "Ouvrir la version ordinateur",
  },
  followStudio: {
    "sr-Latn": "Pratite studio",
    mk: "Следете го студиото",
    hr: "Pratite studio",
    sq: "Ndiqni studion",
    en: "Follow the studio",
    de: "Studio folgen",
    fr: "Suivre le studio",
  },
  noGallery: {
    "sr-Latn": "Galerija će uskoro biti dopunjena.",
    mk: "Галеријата наскоро ќе биде дополнета.",
    hr: "Galerija će uskoro biti dopunjena.",
    sq: "Galeria do të plotësohet së shpejti.",
    en: "The gallery will be updated soon.",
    de: "Die Galerie wird in Kürze aktualisiert.",
    fr: "La galerie sera bientôt mise à jour.",
  },
} satisfies Record<
  string,
  LocalizedText
>;

function formatAmount(
  value: number,
  currency: string,
  locale: Locale
): string {
  const intlLocale =
    locale ===
    "sr-Latn"
      ? "sr-Latn-RS"
      : locale ||
        "en";

  try {
    return new Intl.NumberFormat(
      intlLocale,
      {
        style:
          "currency",

        currency,

        minimumFractionDigits:
          Number.isInteger(
            value
          )
            ? 0
            : 2,

        maximumFractionDigits:
          2,
      }
    ).format(
      value
    );
  } catch {
    const amount =
      Number.isInteger(
        value
      )
        ? String(
            value
          )
        : value.toFixed(
            2
          );

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
    service.priceTo !==
      undefined
  ) {
    return `${from} — ${formatAmount(
      service.priceTo,
      currency,
      locale
    )}`;
  }

  return `${t(
    translations
      .priceTypes
      .from,
    locale
  )} ${from}`;
}

export function getCategoryLabel(
  service: Service,
  categories:
    ServiceCategory[],
  locale: Locale
): string {
  const category =
    categories.find(
      (item) =>
        item.id ===
        service.categoryId
    );

  return category
    ? t(
        category.name,
        locale
      )
    : t(
        translations
          .common
          .service,
        locale
      );
}

export function getLocationLine(
  address:
    LocalizedText,
  city:
    LocalizedText,
  country:
    LocalizedText,
  locale:
    Locale
): string {
  return [
    t(
      address,
      locale
    ),

    t(
      city,
      locale
    ),

    t(
      country,
      locale
    ),
  ]
    .filter(
      Boolean
    )
    .join(
      ", "
    );
}
