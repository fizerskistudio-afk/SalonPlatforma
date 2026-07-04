import {
  isLocaleCode,
} from "@/lib/i18n/locales";

import type {
  Locale,
  LocalizedText,
} from "./types";

/**
 * Sistemski UI je trenutno preveden na:
 *
 * - sr-Latn
 * - mk
 * - sq
 * - en
 *
 * Sadržaj biznisa može koristiti sve jezike iz
 * centralnog locale registry-ja. Funkcija t()
 * koristi bezbedan fallback kada prevod ne postoji.
 */

export const translations = {
  // Navigation
  nav: {
    home: {
      "sr-Latn": "Početna",
      mk: "Дома",
      sq: "Kryefaqja",
      en: "Home",
    },

    services: {
      "sr-Latn": "Usluge",
      mk: "Услуги",
      sq: "Shërbimet",
      en: "Services",
    },

    team: {
      "sr-Latn": "Tim",
      mk: "Тим",
      sq: "Ekipi",
      en: "Team",
    },

    gallery: {
      "sr-Latn": "Galerija",
      mk: "Галерија",
      sq: "Galeria",
      en: "Gallery",
    },

    reviews: {
      "sr-Latn": "Utisci",
      mk: "Рецензии",
      sq: "Vlerësime",
      en: "Reviews",
    },

    contact: {
      "sr-Latn": "Kontakt",
      mk: "Контакт",
      sq: "Kontakt",
      en: "Contact",
    },

    book: {
      "sr-Latn": "Zakaži",
      mk: "Закажи",
      sq: "Prenoto",
      en: "Book",
    },
  },

  // Hero Section
  hero: {
    bookNow: {
      "sr-Latn": "Zakaži termin",
      mk: "Закажи термин",
      sq: "Prenoto tani",
      en: "Book Now",
    },

    viewServices: {
      "sr-Latn": "Pogledaj usluge",
      mk: "Погледни услуги",
      sq: "Shiko shërbimet",
      en: "View Services",
    },

    since: {
      "sr-Latn": "Osnovano",
      mk: "Основано",
      sq: "Themeluar",
      en: "Est.",
    },

    nextAvailable: {
      "sr-Latn": "Sledeći slobodan termin",
      mk: "Следен слободен",
      sq: "I disponueshëm",
      en: "Next available",
    },
  },

  // Section Headers
  sections: {
    servicesTitle: {
      "sr-Latn": "Naše usluge",
      mk: "Наши услуги",
      sq: "Shërbimet tona",
      en: "Our Services",
    },

    servicesSub: {
      "sr-Latn": "Izaberite iz naše ponude",
      mk: "Изберете од нашата понуда",
      sq: "Zgjidhni nga oferta jonë",
      en: "Choose from our offerings",
    },

    teamTitle: {
      "sr-Latn": "Upoznajte tim",
      mk: "Запознајте го тимот",
      sq: "Njihuni me ekipin",
      en: "Meet the Team",
    },

    teamSub: {
      "sr-Latn": "Naši stručnjaci su tu za vas",
      mk: "Нашите стручњаци се тука за вас",
      sq: "Ekspertët tanë janë këtu për ju",
      en: "Our experts are here for you",
    },

    galleryTitle: {
      "sr-Latn": "Galerija",
      mk: "Галерија",
      sq: "Galeria",
      en: "Gallery",
    },

    gallerySub: {
      "sr-Latn": "Pogledajte naše radove",
      mk: "Погледнете ги нашите работи",
      sq: "Shikoni punën tonë",
      en: "Take a look at our work",
    },

    reviewsTitle: {
      "sr-Latn": "Šta kažu klijenti",
      mk: "Што велат клиентите",
      sq: "Çfarë thonë klientët",
      en: "What clients say",
    },

    reviewsSub: {
      "sr-Latn": "Prava iskustva",
      mk: "Вистински искуства",
      sq: "Përvoja të vërteta",
      en: "Real experiences",
    },

    contactTitle: {
      "sr-Latn": "Kontakt",
      mk: "Контакт",
      sq: "Kontakt",
      en: "Contact",
    },

    contactSub: {
      "sr-Latn": "Posetite nas",
      mk: "Дојдете нè посетете",
      sq: "Ejani na vizitoni",
      en: "Come visit us",
    },

    hours: {
      "sr-Latn": "Radno vreme",
      mk: "Работно време",
      sq: "Orari",
      en: "Working Hours",
    },

    popularServices: {
      "sr-Latn": "Popularne usluge",
      mk: "Популарни услуги",
      sq: "Shërbimet popullore",
      en: "Popular Services",
    },
  },

  // Days of Week
  days: {
    sunday: {
      "sr-Latn": "Nedelja",
      mk: "Недела",
      sq: "E Diel",
      en: "Sunday",
    },

    monday: {
      "sr-Latn": "Ponedeljak",
      mk: "Понеделник",
      sq: "E Hënë",
      en: "Monday",
    },

    tuesday: {
      "sr-Latn": "Utorak",
      mk: "Вторник",
      sq: "E Martë",
      en: "Tuesday",
    },

    wednesday: {
      "sr-Latn": "Sreda",
      mk: "Среда",
      sq: "E Mërkurë",
      en: "Wednesday",
    },

    thursday: {
      "sr-Latn": "Četvrtak",
      mk: "Четврток",
      sq: "E Enjte",
      en: "Thursday",
    },

    friday: {
      "sr-Latn": "Petak",
      mk: "Петок",
      sq: "E Premte",
      en: "Friday",
    },

    saturday: {
      "sr-Latn": "Subota",
      mk: "Сабота",
      sq: "E Shtunë",
      en: "Saturday",
    },
  },

  // Price Types
  priceTypes: {
    fixed: {
      "sr-Latn": "",
      mk: "",
      sq: "",
      en: "",
    },

    from: {
      "sr-Latn": "od",
      mk: "од",
      sq: "nga",
      en: "from",
    },

    range: {
      "sr-Latn": "–",
      mk: "-",
      sq: "-",
      en: "-",
    },
  },

  // Stats
  stats: {
    years: {
      "sr-Latn": "godina",
      mk: "години",
      sq: "vite",
      en: "years",
    },

    clients: {
      "sr-Latn": "klijenata",
      mk: "клиенти",
      sq: "klientë",
      en: "clients",
    },

    rating: {
      "sr-Latn": "ocena",
      mk: "оцена",
      sq: "vlerësim",
      en: "rating",
    },

    since: {
      "sr-Latn": "Od",
      mk: "Од",
      sq: "Që nga",
      en: "Since",
    },
  },

  // Booking Flow
  booking: {
    title: {
      "sr-Latn": "Zakaži termin",
      mk: "Закажи термин",
      sq: "Rezervo termin",
      en: "Book an appointment",
    },

    selectService: {
      "sr-Latn": "Izaberi uslugu",
      mk: "Избери услуга",
      sq: "Zgjidh shërbimin",
      en: "Select Service",
    },

    selectEmployee: {
      "sr-Latn": "Izaberi člana tima",
      mk: "Избери фризер",
      sq: "Zgjidh stilistin",
      en: "Select Stylist",
    },

    selectDate: {
      "sr-Latn": "Izaberi datum",
      mk: "Избери датум",
      sq: "Zgjidh datën",
      en: "Select Date",
    },

    selectTime: {
      "sr-Latn": "Izaberi termin",
      mk: "Избери термин",
      sq: "Zgjidh orarin",
      en: "Select Time",
    },

    yourInfo: {
      "sr-Latn": "Tvoji podaci",
      mk: "Твои податоци",
      sq: "Të dhënat e tua",
      en: "Your Info",
    },

    success: {
      "sr-Latn": "Gotovo!",
      mk: "Готово!",
      sq: "Sukses!",
      en: "Success!",
    },

    next: {
      "sr-Latn": "Dalje",
      mk: "Следно",
      sq: "Vazhdo",
      en: "Next",
    },

    back: {
      "sr-Latn": "Nazad",
      mk: "Назад",
      sq: "Prapa",
      en: "Back",
    },

    confirm: {
      "sr-Latn": "Potvrdi",
      mk: "Потврди",
      sq: "Konfirmo",
      en: "Confirm",
    },

    done: {
      "sr-Latn": "Završi",
      mk: "Во ред",
      sq: "Në rregull",
      en: "Done",
    },

    fullName: {
      "sr-Latn": "Ime i prezime",
      mk: "Целосно име",
      sq: "Emri i plotë",
      en: "Full Name",
    },

    phone: {
      "sr-Latn": "Telefon",
      mk: "Телефон",
      sq: "Telefoni",
      en: "Phone",
    },

    email: {
      "sr-Latn": "Email",
      mk: "Email",
      sq: "Email",
      en: "Email",
    },

    note: {
      "sr-Latn": "Napomena (opciono)",
      mk: "Забелешка (опционално)",
      sq: "Shënim (opsionale)",
      en: "Note (optional)",
    },

    successMsg: {
      "sr-Latn": "Tvoj termin je uspešno zakazan! Uskoro ćemo te kontaktirati.",
      mk: "Твојот термин е закажан! Ќе те контактираме наскоро.",
      sq: "Takimi yt u rezervua! Do të të kontaktojmë së shpejti.",
      en: "Your appointment is booked! We'll contact you soon.",
    },

    summary: {
      "sr-Latn": "Pregled rezervacije",
      mk: "Резиме",
      sq: "Përmbledhje",
      en: "Summary",
    },

    minutes: {
      "sr-Latn": "min",
      mk: "мин",
      sq: "min",
      en: "min",
    },

    any: {
      "sr-Latn": "Bilo ko",
      mk: "Било кој",
      sq: "Cilido",
      en: "Any",
    },

    anyAvailable: {
      "sr-Latn": "Prvi slobodan",
      mk: "Прв слободен",
      sq: "I pari i disponueshëm",
      en: "First available",
    },

    step: {
      "sr-Latn": "Korak",
      mk: "Чекор",
      sq: "Hapi",
      en: "Step",
    },

    of: {
      "sr-Latn": "od",
      mk: "од",
      sq: "nga",
      en: "of",
    },

    change: {
      "sr-Latn": "Promeni",
      mk: "Промени",
      sq: "Ndrysho",
      en: "Change",
    },

    selectServiceFirst: {
      "sr-Latn": "Prvo izaberi uslugu",
      mk: "Избери услуга прво",
      sq: "Zgjidh shërbimin fillimisht",
      en: "Select a service first",
    },

    selectServiceFirstDescription: {
      "sr-Latn": "Moraš izabrati uslugu pre nego što izabereš člana tima.",
      mk: "Мора да избереш услуга пред да избереш фризер.",
      sq: "Duhet të zgjedhësh një shërbim para se të zgjedhësh stilistin.",
      en: "You need to select a service before choosing a stylist.",
    },

    progressLabel: {
      "sr-Latn": "Napredak rezervacije",
      mk: "Напредок на закажувањето",
      sq: "Progresi i rezervimit",
      en: "Booking progress",
    },

    selectDateDescription: {
      "sr-Latn": "Izaberi datum svog termina",
      mk: "Избери датум за твојот термин",
      sq: "Zgjidh datën për takimin tënd",
      en: "Select a date for your appointment",
    },

    selectTimeDescription: {
      "sr-Latn": "Izaberi slobodan termin",
      mk: "Избери слободен термин",
      sq: "Zgjidh një orar të lirë",
      en: "Select an available time slot",
    },

    yourInfoDescription: {
      "sr-Latn": "Unesi svoje kontakt podatke",
      mk: "Внеси ги твоите податоци за контакт",
      sq: "Plotëso të dhënat e tua të kontaktit",
      en: "Enter your contact information",
    },

    noAvailableDates: {
      "sr-Latn": "Nema dostupnih datuma u narednom periodu",
      mk: "Нема достапни датуми во наредниот период",
      sq: "Nuk ka data të disponueshme në periodën e ardhshme",
      en: "No available dates in the upcoming period",
    },

    completePreviousSteps: {
      "sr-Latn": "Završi prethodne korake",
      mk: "Заврши претходните чекори",
      sq: "Përfundo hapat e mëparshëm",
      en: "Complete previous steps",
    },

    completePreviousStepsDescription: {
      "sr-Latn": "Izaberi uslugu, člana tima i datum da vidiš slobodne termine",
      mk: "Избери услуга, фризер и датум за да видиш слободни термини",
      sq: "Zgjidh shërbimin, stilistin dhe datën për të parë oraret e lira",
      en: "Select a service, stylist, and date to see available times",
    },
  },

  // Contact
  contact: {
    closed: {
      "sr-Latn": "Zatvoreno",
      mk: "Затворено",
      sq: "Mbyllur",
      en: "Closed",
    },

    address: {
      "sr-Latn": "Adresa",
      mk: "Адреса",
      sq: "Adresa",
      en: "Address",
    },

    phone: {
      "sr-Latn": "Telefon",
      mk: "Телефон",
      sq: "Telefoni",
      en: "Phone",
    },

    email: {
      "sr-Latn": "Email",
      mk: "Email",
      sq: "Email",
      en: "Email",
    },

    instagram: {
      "sr-Latn": "Instagram",
      mk: "Instagram",
      sq: "Instagram",
      en: "Instagram",
    },

    mapPlaceholder: {
      "sr-Latn": "Mapa",
      mk: "Мапа",
      sq: "Harta",
      en: "Map",
    },
  },

  // Common
  common: {
    loading: {
      "sr-Latn": "Učitavanje",
      mk: "Вчитување",
      sq: "Ngarkimi",
      en: "Loading",
    },

    noAppointments: {
      "sr-Latn": "Nema termina",
      mk: "Нема термини",
      sq: "Nuk ka takime",
      en: "No appointments",
    },

    noEmployees: {
      "sr-Latn": "Nema dostupnih članova tima",
      mk: "Нема вработени",
      sq: "Nuk ka punonjës",
      en: "No available employees",
    },

    noTimes: {
      "sr-Latn": "Nema slobodnih termina",
      mk: "Нема слободни термини",
      sq: "Nuk ka orare",
      en: "No available times",
    },

    bookWith: {
      "sr-Latn": "Zakaži kod",
      mk: "Закажи кај",
      sq: "Prenoto me",
      en: "Book with",
    },

    total: {
      "sr-Latn": "Ukupno",
      mk: "Вкупно",
      sq: "Totali",
      en: "Total",
    },

    service: {
      "sr-Latn": "Usluga",
      mk: "Услуга",
      sq: "Shërbimi",
      en: "Service",
    },

    stylist: {
      "sr-Latn": "Član tima",
      mk: "Фризер",
      sq: "Stilisti",
      en: "Stylist",
    },

    date: {
      "sr-Latn": "Datum",
      mk: "Датум",
      sq: "Data",
      en: "Date",
    },

    time: {
      "sr-Latn": "Vreme",
      mk: "Време",
      sq: "Koha",
      en: "Time",
    },

    premiumService: {
      "sr-Latn": "Premium usluga",
      mk: "Премиум услуга",
      sq: "Shërbim premium",
      en: "Premium Service",
    },

    languageSelector: {
      "sr-Latn": "Izbor jezika",
      mk: "Избор на јазик",
      sq: "Përzgjedhja e gjuhës",
      en: "Language selector",
    },

    switchToLanguage: {
      "sr-Latn": "Prebaci na",
      mk: "Премини на",
      sq: "Kalo në",
      en: "Switch to",
    },

    selected: {
      "sr-Latn": "izabrano",
      mk: "избрано",
      sq: "zgjedhur",
      en: "selected",
    },

    noServices: {
      "sr-Latn": "Nema usluga",
      mk: "Нема услуги",
      sq: "Nuk ka shërbime",
      en: "No services",
    },

    noServicesDescription: {
      "sr-Latn": "Trenutno nema dostupnih usluga.",
      mk: "Моментално нема достапни услуги.",
      sq: "Nuk ka shërbime të disponueshme.",
      en: "No services available at the moment.",
    },

    noEmployeesForService: {
      "sr-Latn": "Nema dostupnih članova tima za ovu uslugu.",
      mk: "Нема вработени за оваа услуга.",
      sq: "Nuk ka punonjës për këtë shërbim.",
      en: "No employees available for this service.",
    },

    noTimesDescription: {
      "sr-Latn": "Nema slobodnih termina za izabrani datum. Probaj drugi datum ili uslugu.",
      mk: "Нема слободни термини за избраниот датум. Пробај друг датум или услуга.",
      sq: "Nuk ka orare të lira për datën e zgjedhur. Provo një datë ose shërbim tjetër.",
      en: "No available time slots for the selected date. Try a different date or service.",
    },

    notSelected: {
      "sr-Latn": "Nije izabrano",
      mk: "Не е избрано",
      sq: "Nuk është zgjedhur",
      en: "Not selected",
    },

    mainNavigation: {
      "sr-Latn": "Glavna navigacija",
      mk: "Главна навигација",
      sq: "Navigimi kryesor",
      en: "Main navigation",
    },

    noEmployeesDescription: {
      "sr-Latn": "Trenutno nema dostupnih članova tima.",
      mk: "Моментално нема достапни членови на тимот.",
      sq: "Aktualisht nuk ka anëtarë të ekipit në dispozicion.",
      en: "No team members are available at the moment.",
    },

    allRightsReserved: {
      "sr-Latn": "Sva prava zadržana",
      mk: "Сите права се задржани",
      sq: "Të gjitha të drejtat e rezervuara",
      en: "All rights reserved",
    },

    footerNavigation: {
      "sr-Latn": "Navigacija u podnožju",
      mk: "Навигација во подножјето",
      sq: "Navigimi i fundit të faqes",
      en: "Footer navigation",
    },

    close: {
      "sr-Latn": "Zatvori",
      mk: "Затвори",
      sq: "Mbyll",
      en: "Close",
    },

    openFullWebsite: {
      "sr-Latn": "Otvori punu verziju sajta",
      mk: "Отвори веб верзија",
      sq: "Hap versionin e plotë",
      en: "Open full website",
    },

    mobileNavigation: {
      "sr-Latn": "Mobilna navigacija",
      mk: "Мобилна навигација",
      sq: "Navigimi mobil",
      en: "Mobile navigation",
    },
  },

  // Customer
  customer: {
    namePlaceholder: {
      "sr-Latn": "Unesi ime i prezime",
      mk: "Внеси го твоето име",
      sq: "Shkruaj emrin tënd",
      en: "Enter your name",
    },

    phonePlaceholder: {
      "sr-Latn": "+381 60 000 0000",
      mk: "+389 70 000 000",
      sq: "+389 70 000 000",
      en: "+381 60 000 0000",
    },

    emailPlaceholder: {
      "sr-Latn": "email@primer.rs",
      mk: "email@primer.com",
      sq: "email@shembull.com",
      en: "email@example.com",
    },

    notePlaceholder: {
      "sr-Latn": "Dodaj napomenu (opciono)",
      mk: "Додај забелешка (опционално)",
      sq: "Shto një shënim (opsionale)",
      en: "Add a note (optional)",
    },
  },
};

/**
 * Bezbedno čita prevod samo kada locale postoji
 * u centralnom registry-ju.
 */
function getLocalizedValue(
  text: LocalizedText,
  locale: Locale
): string | undefined {
  if (!isLocaleCode(locale)) {
    return undefined;
  }

  const value =
    text[locale];

  return typeof value ===
    "string"
    ? value
    : undefined;
}

/**
 * Vraća prvi postojeći prevod ovim redosledom:
 *
 * 1. traženi jezik
 * 2. podrazumevani jezik biznisa
 * 3. srpski — latinica
 * 4. engleski
 * 5. makedonski
 * 6. albanski
 * 7. prva postojeća neprazna vrednost
 */
export function t(
  text: LocalizedText,
  locale: Locale,
  fallbackLocale: Locale = "en"
): string {
  const preferredLocales:
    Locale[] = [
      locale,
      fallbackLocale,
      "sr-Latn",
      "en",
      "mk",
      "sq",
    ];

  const visited =
    new Set<string>();

  for (
    const candidateLocale of
    preferredLocales
  ) {
    if (
      visited.has(
        candidateLocale
      )
    ) {
      continue;
    }

    visited.add(
      candidateLocale
    );

    const value =
      getLocalizedValue(
        text,
        candidateLocale
      );

    if (
      value &&
      value.trim().length >
        0
    ) {
      return value;
    }
  }

  for (
    const value of
    Object.values(text)
  ) {
    if (
      typeof value ===
        "string" &&
      value.trim().length >
        0
    ) {
      return value;
    }
  }

  return "";
}

/**
 * Helper za dan u nedelji.
 */
export function getDayTranslation(
  dayOfWeek: number,
  locale: Locale
): string {
  const dayMap: Record<
    number,
    LocalizedText
  > = {
    0: translations.days.sunday,
    1: translations.days.monday,
    2: translations.days.tuesday,
    3: translations.days.wednesday,
    4: translations.days.thursday,
    5: translations.days.friday,
    6: translations.days.saturday,
  };

  const dayTranslation =
    dayMap[dayOfWeek];

  return dayTranslation
    ? t(
        dayTranslation,
        locale
      )
    : "";
}