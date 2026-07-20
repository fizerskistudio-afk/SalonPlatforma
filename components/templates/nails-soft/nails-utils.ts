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

export const nailsLabels = {
  currentEdit: {
    "sr-Latn": "Aktuelna nail art selekcija",
    mk: "Актуелна nail art селекција",
    hr: "Aktualna nail art selekcija",
    sq: "Përzgjedhja aktuale e nail art",
    en: "The current nail art edit",
    de: "Die aktuelle Nail-Art-Auswahl",
    fr: "La sélection nail art du moment",
  },
  lookbookLabel: {
    "sr-Latn": "Lookbook studija",
    mk: "Lookbook на студиото",
    hr: "Lookbook studija",
    sq: "Lookbook-u i studios",
    en: "The studio lookbook",
    de: "Das Studio-Lookbook",
    fr: "Le lookbook du studio",
  },
  lookLabel: {
    "sr-Latn": "Izgled",
    mk: "Изглед",
    hr: "Look",
    sq: "Pamja",
    en: "Look",
    de: "Look",
    fr: "Look",
  },
  treatmentMenu: {
    "sr-Latn": "Lacquer meni tretmana",
    mk: "Lacquer мени на третмани",
    hr: "Lacquer meni tretmana",
    sq: "Menuja lacquer e trajtimeve",
    en: "The lacquer treatment menu",
    de: "Das Lack-Behandlungsmenü",
    fr: "Le menu de soins lacquer",
  },
  allTreatments: {
    "sr-Latn": "Svi tretmani",
    mk: "Сите третмани",
    hr: "Svi tretmani",
    sq: "Të gjitha trajtimet",
    en: "All treatments",
    de: "Alle Behandlungen",
    fr: "Tous les soins",
  },
  artistDesk: {
    "sr-Latn": "Artist desk",
    mk: "Artist desk",
    hr: "Artist desk",
    sq: "Artist desk",
    en: "Artist desk",
    de: "Artist Desk",
    fr: "Artist desk",
  },
  loveNotes: {
    "sr-Latn": "Love notes naših klijentkinja",
    mk: "Love notes од нашите клиентки",
    hr: "Love notes naših klijentica",
    sq: "Love notes nga klientet tona",
    en: "Love notes from our clients",
    de: "Love Notes unserer Kundinnen",
    fr: "Love notes de nos clientes",
  },
  appointmentLabel: {
    "sr-Latn": "Vaš sledeći set počinje ovde",
    mk: "Вашиот следен сет започнува тука",
    hr: "Vaš sljedeći set počinje ovdje",
    sq: "Seti juaj i ardhshëm fillon këtu",
    en: "Your next set starts here",
    de: "Ihr nächstes Set beginnt hier",
    fr: "Votre prochaine pose commence ici",
  },
  swipeLooks: {
    "sr-Latn": "Prevuci za još radova",
    mk: "Повлечете за повеќе работи",
    hr: "Povucite za još radova",
    sq: "Rrëshqit për më shumë punime",
    en: "Swipe for more looks",
    de: "Für weitere Looks wischen",
    fr: "Faites glisser pour plus de looks",
  },
  eyebrow: {
    "sr-Latn": "Nail studio i atelier",
    mk: "Студио и ателје за нокти",
    hr: "Nail studio i atelier",
    sq: "Studio dhe atelie thonjsh",
    en: "Nail studio and atelier",
    de: "Nagelstudio und Atelier",
    fr: "Studio et atelier d’ongles",
  },
  heroKicker: {
    "sr-Latn": "Boja. Forma. Vaš potpis.",
    mk: "Боја. Форма. Ваш потпис.",
    hr: "Boja. Forma. Vaš potpis.",
    sq: "Ngjyrë. Formë. Firma juaj.",
    en: "Colour. Shape. Your signature.",
    de: "Farbe. Form. Ihre Signatur.",
    fr: "Couleur. Forme. Votre signature.",
  },
  portfolioTitle: {
    "sr-Latn": "Prvo izaberite osećaj",
    mk: "Прво изберете го чувството",
    hr: "Prvo odaberite osjećaj",
    sq: "Zgjidhni fillimisht ndjesinë",
    en: "Choose the feeling first",
    de: "Wählen Sie zuerst das Gefühl",
    fr: "Choisissez d’abord l’allure",
  },
  portfolioIntro: {
    "sr-Latn": "Portfolio je naš pravi meni: nijanse, teksture i detalji koji pomažu da pronađete sledeći izgled.",
    mk: "Портфолиото е нашето вистинско мени: нијанси, текстури и детали за вашиот следен изглед.",
    hr: "Portfolio je naš pravi meni: nijanse, teksture i detalji za vaš sljedeći izgled.",
    sq: "Portofoli është menuja jonë e vërtetë: nuanca, tekstura dhe detaje për pamjen tuaj të radhës.",
    en: "Our portfolio is the real menu: shades, textures and details for your next look.",
    de: "Unser Portfolio ist die eigentliche Karte: Nuancen, Texturen und Details für Ihren nächsten Look.",
    fr: "Notre portfolio est la vraie carte : nuances, textures et détails pour votre prochain look.",
  },
  viewPortfolio: {
    "sr-Latn": "Pogledaj radove",
    mk: "Погледнете ги работите",
    hr: "Pogledaj radove",
    sq: "Shiko punimet",
    en: "View the portfolio",
    de: "Arbeiten ansehen",
    fr: "Voir le portfolio",
  },
  servicesTitle: {
    "sr-Latn": "Tretmani, jasno i bez nagađanja",
    mk: "Третмани, јасно и без погодување",
    hr: "Tretmani, jasno i bez nagađanja",
    sq: "Trajtime të qarta, pa hamendësime",
    en: "Treatments, clear and considered",
    de: "Behandlungen, klar und durchdacht",
    fr: "Des soins clairs et bien pensés",
  },
  servicesIntro: {
    "sr-Latn": "Manikir, gel, nail art i pedikir sa vidljivim trajanjem, cenom i direktnim zakazivanjem.",
    mk: "Маникир, гел, nail art и педикир со јасно времетраење, цена и директно закажување.",
    hr: "Manikura, gel, nail art i pedikura s vidljivim trajanjem, cijenom i izravnom rezervacijom.",
    sq: "Manikyr, xhel, art thonjsh dhe pedikyr me kohëzgjatje, çmim dhe rezervim të qartë.",
    en: "Manicure, gel, nail art and pedicure with clear timing, pricing and direct booking.",
    de: "Maniküre, Gel, Nail Art und Pediküre mit klarer Dauer, Preis und direkter Buchung.",
    fr: "Manucure, gel, nail art et pédicure avec durée, prix et réservation directe.",
  },
  artistsTitle: {
    "sr-Latn": "Ruke iza detalja",
    mk: "Рацете зад деталите",
    hr: "Ruke iza detalja",
    sq: "Duart pas detajeve",
    en: "The hands behind the detail",
    de: "Die Hände hinter den Details",
    fr: "Les mains derrière chaque détail",
  },
  artistsIntro: {
    "sr-Latn": "Izaberite nail artista prema tehnici, estetici i energiji koja vam odgovara.",
    mk: "Изберете nail artist според техниката, естетиката и енергијата што ви одговара.",
    hr: "Odaberite nail artista prema tehnici, estetici i energiji koja vam odgovara.",
    sq: "Zgjidhni artistin sipas teknikës, estetikës dhe energjisë që ju përshtatet.",
    en: "Choose your nail artist by technique, aesthetic and the energy that suits you.",
    de: "Wählen Sie Ihren Nail Artist nach Technik, Ästhetik und passender Atmosphäre.",
    fr: "Choisissez votre nail artist selon sa technique, son esthétique et l’énergie qui vous correspond.",
  },
  visitTitle: {
    "sr-Latn": "Vaš sledeći termin počinje ovde",
    mk: "Вашиот следен термин започнува тука",
    hr: "Vaš sljedeći termin počinje ovdje",
    sq: "Takimi juaj i ardhshëm fillon këtu",
    en: "Your next appointment starts here",
    de: "Ihr nächster Termin beginnt hier",
    fr: "Votre prochain rendez-vous commence ici",
  },
  contactIntro: {
    "sr-Latn": "Pronađite studio, proverite kontakt i zakažite tretman bez dodatnog dopisivanja.",
    mk: "Пронајдете го студиото, проверете го контактот и закажете третман без дополнителни пораки.",
    hr: "Pronađite studio, provjerite kontakt i rezervirajte tretman bez dodatnog dopisivanja.",
    sq: "Gjeni studion, kontrolloni kontaktin dhe rezervoni trajtimin pa mesazhe shtesë.",
    en: "Find the studio, check the details and book without another message thread.",
    de: "Finden Sie das Studio, prüfen Sie die Details und buchen Sie ohne weitere Nachrichten.",
    fr: "Trouvez le studio, vérifiez les informations et réservez sans échanges supplémentaires.",
  },
  bookService: {
    "sr-Latn": "Zakaži tretman",
    mk: "Закажете третман",
    hr: "Rezerviraj tretman",
    sq: "Rezervo trajtimin",
    en: "Book treatment",
    de: "Behandlung buchen",
    fr: "Réserver le soin",
  },
  bookArtist: {
    "sr-Latn": "Zakaži kod",
    mk: "Закажете кај",
    hr: "Rezerviraj kod",
    sq: "Rezervo me",
    en: "Book with",
    de: "Buchen bei",
    fr: "Réserver avec",
  },
  noTeam: {
    "sr-Latn": "Nail artisti će uskoro biti predstavljeni.",
    mk: "Nail artist профилите наскоро ќе бидат претставени.",
    hr: "Nail artisti bit će uskoro predstavljeni.",
    sq: "Artistët e thonjve do të prezantohen së shpejti.",
    en: "Nail artist profiles will be introduced soon.",
    de: "Die Nail Artists werden in Kürze vorgestellt.",
    fr: "Les nail artists seront bientôt présentés.",
  },
  noGallery: {
    "sr-Latn": "Portfolio će uskoro dobiti prve radove.",
    mk: "Портфолиото наскоро ќе ги добие првите изработки.",
    hr: "Portfolio će uskoro dobiti prve radove.",
    sq: "Portofoli do të marrë së shpejti punimet e para.",
    en: "The first portfolio looks are coming soon.",
    de: "Die ersten Portfolio-Arbeiten folgen in Kürze.",
    fr: "Les premières créations du portfolio arrivent bientôt.",
  },
  followStudio: {
    "sr-Latn": "Pratite nove radove",
    mk: "Следете ги новите изработки",
    hr: "Pratite nove radove",
    sq: "Ndiqni punimet e reja",
    en: "Follow new work",
    de: "Neue Arbeiten verfolgen",
    fr: "Suivre les nouvelles créations",
  },
  openDesktop: {
    "sr-Latn": "Otvori desktop verziju",
    mk: "Отворете ја desktop верзијата",
    hr: "Otvori desktop verziju",
    sq: "Hap versionin desktop",
    en: "Open desktop version",
    de: "Desktop-Version öffnen",
    fr: "Ouvrir la version ordinateur",
  },
  studioDetails: {
    "sr-Latn": "Detalji studija",
    mk: "Детали за студиото",
    hr: "Detalji studija",
    sq: "Detajet e studios",
    en: "Studio details",
    de: "Studio-Details",
    fr: "Détails du studio",
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
    return `${value} ${currency}`;
  }
}

export function formatNailsServicePrice(
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
    translations.priceTypes.from,
    locale
  )} ${from}`;
}

export function getNailsCategoryLabel(
  service: Service,
  categories:
    ServiceCategory[],
  locale: Locale
): string {
  const category =
    categories.find(
      (
        item
      ) =>
        item.id ===
        service.categoryId
    );

  return category
    ? t(
        category.name,
        locale
      )
    : t(
        translations.common.service,
        locale
      );
}

export function getNailsLocationLine(
  values:
    readonly LocalizedText[],
  locale: Locale
): string {
  return values
    .map(
      (
        value
      ) =>
        t(
          value,
          locale
        )
    )
    .filter(
      Boolean
    )
    .join(
      ", "
    );
}
