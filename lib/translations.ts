import type { Locale, LocalizedText } from "./types";

/**
 * Svi tekstovi u aplikaciji moraju biti prevedeni za mk, sq i en.
 */
export const translations = {
  // Navigation
  nav: {
    home: {
      mk: "Дома",
      sq: "Kryefaqja",
      en: "Home",
    },
    services: {
      mk: "Услуги",
      sq: "Shërbimet",
      en: "Services",
    },
    team: {
      mk: "Тим",
      sq: "Ekipi",
      en: "Team",
    },
    gallery: {
      mk: "Галерија",
      sq: "Galeria",
      en: "Gallery",
    },
    reviews: {
      mk: "Рецензии",
      sq: "Vlerësime",
      en: "Reviews",
    },
    contact: {
      mk: "Контакт",
      sq: "Kontakt",
      en: "Contact",
    },
    book: {
      mk: "Закажи",
      sq: "Prenoto",
      en: "Book",
    },
  },

  // Hero
  hero: {
    bookNow: {
      mk: "Закажи термин",
      sq: "Prenoto tani",
      en: "Book Now",
    },
    viewServices: {
      mk: "Погледни услуги",
      sq: "Shiko shërbimet",
      en: "View Services",
    },
    since: {
      mk: "Основано",
      sq: "Themeluar",
      en: "Est.",
    },
    nextAvailable: {
      mk: "Следен слободен",
      sq: "I disponueshëm",
      en: "Next available",
    },
  },

  // Statistics
  stats: {
    years: {
      mk: "Години",
      sq: "Vite",
      en: "Years",
    },
    clients: {
      mk: "Клиенти",
      sq: "Klientë",
      en: "Clients",
    },
    rating: {
      mk: "Оцена",
      sq: "Vlerësim",
      en: "Rating",
    },
  },

  // Section Headers
  sections: {
    servicesTitle: {
      mk: "Наши услуги",
      sq: "Shërbimet tona",
      en: "Our Services",
    },
    servicesSub: {
      mk: "Изберете од нашата понуда",
      sq: "Zgjidhni nga oferta jonë",
      en: "Choose from our offerings",
    },
    teamTitle: {
      mk: "Запознајте го тимот",
      sq: "Njihuni me ekipin",
      en: "Meet the Team",
    },
    teamSub: {
      mk: "Нашите стручњаци се тука за вас",
      sq: "Ekspertët tanë janë këtu për ju",
      en: "Our experts are here for you",
    },
    galleryTitle: {
      mk: "Галерија",
      sq: "Galeria",
      en: "Gallery",
    },
    gallerySub: {
      mk: "Погледнете ги нашите работи",
      sq: "Shikoni punën tonë",
      en: "Take a look at our work",
    },
    reviewsTitle: {
      mk: "Што велат клиентите",
      sq: "Çfarë thonë klientët",
      en: "What clients say",
    },
    reviewsSub: {
      mk: "Вистински искуства",
      sq: "Përvoja të vërteta",
      en: "Real experiences",
    },
    contactTitle: {
      mk: "Контакт",
      sq: "Kontakt",
      en: "Contact",
    },
    contactSub: {
      mk: "Дојдете нè посетете",
      sq: "Ejani na vizitoni",
      en: "Come visit us",
    },
    hours: {
      mk: "Работно време",
      sq: "Orari",
      en: "Working Hours",
    },
    popularServices: {
      mk: "Популарни услуги",
      sq: "Shërbimet popullore",
      en: "Popular Services",
    },
  },

  // Days of Week
  days: {
    sunday: {
      mk: "Недела",
      sq: "E Diel",
      en: "Sunday",
    },
    monday: {
      mk: "Понеделник",
      sq: "E Hënë",
      en: "Monday",
    },
    tuesday: {
      mk: "Вторник",
      sq: "E Martë",
      en: "Tuesday",
    },
    wednesday: {
      mk: "Среда",
      sq: "E Mërkurë",
      en: "Wednesday",
    },
    thursday: {
      mk: "Четврток",
      sq: "E Enjte",
      en: "Thursday",
    },
    friday: {
      mk: "Петок",
      sq: "E Premte",
      en: "Friday",
    },
    saturday: {
      mk: "Сабота",
      sq: "E Shtunë",
      en: "Saturday",
    },
  },

  // Price Types
  priceTypes: {
    fixed: {
      mk: "",
      sq: "",
      en: "",
    },
    from: {
      mk: "од",
      sq: "nga",
      en: "from",
    },
    range: {
      mk: "–",
      sq: "–",
      en: "–",
    },
  },

  // Booking Flow
  booking: {
    title: {
      mk: "Закажи",
      sq: "Prenoto",
      en: "Book",
    },
    selectService: {
      mk: "Избери услуга",
      sq: "Zgjidh shërbimin",
      en: "Select Service",
    },
    selectEmployee: {
      mk: "Избери фризер",
      sq: "Zgjidh stilistin",
      en: "Select Stylist",
    },
    selectDate: {
      mk: "Избери датум",
      sq: "Zgjidh datën",
      en: "Select Date",
    },
    selectTime: {
      mk: "Избери термин",
      sq: "Zgjidh orarin",
      en: "Select Time",
    },
    yourInfo: {
      mk: "Твои податоци",
      sq: "Të dhënat e tua",
      en: "Your Info",
    },
    success: {
      mk: "Готово!",
      sq: "Sukses!",
      en: "Success!",
    },
    next: {
      mk: "Следно",
      sq: "Vazhdo",
      en: "Next",
    },
    back: {
      mk: "Назад",
      sq: "Prapa",
      en: "Back",
    },
    confirm: {
      mk: "Потврди",
      sq: "Konfirmo",
      en: "Confirm",
    },
    done: {
      mk: "Во ред",
      sq: "Në rregull",
      en: "Done",
    },
    fullName: {
      mk: "Целосно име",
      sq: "Emri i plotë",
      en: "Full Name",
    },
    phone: {
      mk: "Телефон",
      sq: "Telefoni",
      en: "Phone",
    },
    email: {
      mk: "Email",
      sq: "Email",
      en: "Email",
    },
    note: {
      mk: "Забелешка (опционално)",
      sq: "Shënim (opsionale)",
      en: "Note (optional)",
    },
    successMsg: {
      mk: "Твојот термин е закажан! Ќе те контактираме наскоро.",
      sq: "Takimi yt u rezervua! Do të të kontaktojmë së shpejti.",
      en: "Your appointment is booked! We'll contact you soon.",
    },
    summary: {
      mk: "Резиме",
      sq: "Përmbledhje",
      en: "Summary",
    },
    minutes: {
      mk: "мин",
      sq: "min",
      en: "min",
    },
    any: {
      mk: "Било кој",
      sq: "Cilido",
      en: "Any",
    },
    anyAvailable: {
      mk: "Прв слободен",
      sq: "I pari i disponueshëm",
      en: "First available",
    },
    step: {
      mk: "Чекор",
      sq: "Hapi",
      en: "Step",
    },
    of: {
      mk: "од",
      sq: "nga",
      en: "of",
    },
    change: {
      mk: "Промени",
      sq: "Ndrysho",
      en: "Change",
    },
    progressLabel: {
      mk: "Напредок на закажувањето",
      sq: "Progresi i rezervimit",
      en: "Booking progress",
    },
    selectServiceFirst: {
      mk: "Избери услуга прво",
      sq: "Zgjidh shërbimin fillimisht",
      en: "Select a service first",
    },
    selectServiceFirstDescription: {
      mk: "Мора да избереш услуга пред да избереш фризер.",
      sq: "Duhet të zgjedhësh një shërbim para se të zgjedhësh stilistin.",
      en: "You need to select a service before choosing a stylist.",
    },
    selectDateDescription: {
      mk: "Избери датум за твојот термин",
      sq: "Zgjidh datën për takimin tënd",
      en: "Select a date for your appointment",
    },
    selectTimeDescription: {
      mk: "Избери слободен термин",
      sq: "Zgjidh një orar të lirë",
      en: "Select an available time slot",
    },
    yourInfoDescription: {
      mk: "Внеси ги твоите податоци за контакт",
      sq: "Plotëso të dhënat e tua të kontaktit",
      en: "Enter your contact information",
    },
    noAvailableDates: {
      mk: "Нема достапни датуми во наредниот период",
      sq: "Nuk ka data të disponueshme në periudhën e ardhshme",
      en: "No available dates in the upcoming period",
    },
    completePreviousSteps: {
      mk: "Заврши претходните чекори",
      sq: "Përfundo hapat e mëparshëm",
      en: "Complete previous steps",
    },
    completePreviousStepsDescription: {
      mk: "Избери услуга, фризер и датум за да видиш слободни термини",
      sq: "Zgjidh shërbimin, stilistin dhe datën për të parë oraret e lira",
      en: "Select a service, stylist, and date to see available times",
    },
  },

  // Contact
  contact: {
    closed: {
      mk: "Затворено",
      sq: "Mbyllur",
      en: "Closed",
    },
    address: {
      mk: "Адреса",
      sq: "Adresa",
      en: "Address",
    },
    phone: {
      mk: "Телефон",
      sq: "Telefoni",
      en: "Phone",
    },
    email: {
      mk: "Email",
      sq: "Email",
      en: "Email",
    },
    instagram: {
      mk: "Instagram",
      sq: "Instagram",
      en: "Instagram",
    },
    mapPlaceholder: {
      mk: "Мапа",
      sq: "Harta",
      en: "Map",
    },
  },

  // Common
  common: {
    loading: {
      mk: "Вчитување",
      sq: "Ngarkimi",
      en: "Loading",
    },
    noAppointments: {
      mk: "Нема термини",
      sq: "Nuk ka takime",
      en: "No appointments",
    },
    noEmployees: {
      mk: "Нема вработени",
      sq: "Nuk ka punonjës",
      en: "No available employees",
    },
    noEmployeesDescription: {
      mk: "Моментално нема достапни членови на тимот.",
      sq: "Aktualisht nuk ka anëtarë të ekipit në dispozicion.",
      en: "No team members are available at the moment.",
    },
    noTimes: {
      mk: "Нема слободни термини",
      sq: "Nuk ka orare",
      en: "No available times",
    },
    noTimesDescription: {
      mk: "Нема слободни термини за избраниот датум. Пробај друг датум или услуга.",
      sq: "Nuk ka orare të lira për datën e zgjedhur. Provo një datë ose shërbim tjetër.",
      en: "No available time slots for the selected date. Try a different date or service.",
    },
    noServices: {
      mk: "Нема услуги",
      sq: "Nuk ka shërbime",
      en: "No services",
    },
    noServicesDescription: {
      mk: "Моментално нема достапни услуги.",
      sq: "Nuk ka shërbime të disponueshme.",
      en: "No services available at the moment.",
    },
    noEmployeesForService: {
      mk: "Нема вработени за оваа услуга.",
      sq: "Nuk ka punonjës për këtë shërbim.",
      en: "No employees available for this service.",
    },
    bookWith: {
      mk: "Закажи кај",
      sq: "Prenoto me",
      en: "Book with",
    },
    total: {
      mk: "Вкупно",
      sq: "Totali",
      en: "Total",
    },
    service: {
      mk: "Услуга",
      sq: "Shërbimi",
      en: "Service",
    },
    stylist: {
      mk: "Фризер",
      sq: "Stilisti",
      en: "Stylist",
    },
    date: {
      mk: "Датум",
      sq: "Data",
      en: "Date",
    },
    time: {
      mk: "Време",
      sq: "Koha",
      en: "Time",
    },
    premiumService: {
      mk: "Премиум услуга",
      sq: "Shërbim premium",
      en: "Premium Service",
    },
    languageSelector: {
      mk: "Избор на јазик",
      sq: "Përzgjedhja e gjuhës",
      en: "Language selector",
    },
    switchToLanguage: {
      mk: "Премини на",
      sq: "Kalo në",
      en: "Switch to",
    },
    selected: {
      mk: "избрано",
      sq: "zgjedhur",
      en: "selected",
    },
    notSelected: {
      mk: "Не е избрано",
      sq: "Nuk është zgjedhur",
      en: "Not selected",
    },
    mainNavigation: {
      mk: "Главна навигација",
      sq: "Navigimi kryesor",
      en: "Main navigation",
    },
    allRightsReserved: {
      mk: "Сите права се задржани",
      sq: "Të gjitha të drejtat e rezervuara",
      en: "All rights reserved",
    },
    footerNavigation: {
      mk: "Навигација во подножјето",
      sq: "Navigimi i fundit të faqes",
      en: "Footer navigation",
    },
  },

  // Customer Form
  customer: {
    namePlaceholder: {
      mk: "Внеси го твоето име",
      sq: "Shkruaj emrin tënd",
      en: "Enter your name",
    },
    phonePlaceholder: {
      mk: "+389 70 000 000",
      sq: "+389 70 000 000",
      en: "+389 70 000 000",
    },
    emailPlaceholder: {
      mk: "email@primer.com",
      sq: "email@shembull.com",
      en: "email@example.com",
    },
    notePlaceholder: {
      mk: "Додај забелешка (опционално)",
      sq: "Shto një shënim (opsionale)",
      en: "Add a note (optional)",
    },
  },
};

/**
 * Helper funkcija za pristup lokalizovanom tekstu.
 */
export function t(text: LocalizedText, locale: Locale): string {
  return text[locale];
}

/**
 * Vraća prevedeni naziv dana u nedelji.
 */
export function getDayTranslation(dayOfWeek: number, locale: Locale): string {
  const dayMap: Record<number, LocalizedText> = {
    0: translations.days.sunday,
    1: translations.days.monday,
    2: translations.days.tuesday,
    3: translations.days.wednesday,
    4: translations.days.thursday,
    5: translations.days.friday,
    6: translations.days.saturday,
  };

  return t(dayMap[dayOfWeek], locale);
}
