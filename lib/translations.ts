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
 * - hr
 * - sq
 * - en
 * - de
 * - fr
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
      hr: "Početna",
      sq: "Kryefaqja",
      en: "Home",
      de: "Startseite",
      fr: "Accueil",
    },

    services: {
      "sr-Latn": "Usluge",
      mk: "Услуги",
      hr: "Usluge",
      sq: "Shërbimet",
      en: "Services",
      de: "Leistungen",
      fr: "Services",
    },

    team: {
      "sr-Latn": "Tim",
      mk: "Тим",
      hr: "Tim",
      sq: "Ekipi",
      en: "Team",
      de: "Team",
      fr: "Équipe",
    },

    gallery: {
      "sr-Latn": "Galerija",
      mk: "Галерија",
      hr: "Galerija",
      sq: "Galeria",
      en: "Gallery",
      de: "Galerie",
      fr: "Galerie",
    },

    reviews: {
      "sr-Latn": "Utisci",
      mk: "Рецензии",
      hr: "Recenzije",
      sq: "Vlerësime",
      en: "Reviews",
      de: "Bewertungen",
      fr: "Avis",
    },

    contact: {
      "sr-Latn": "Kontakt",
      mk: "Контакт",
      hr: "Kontakt",
      sq: "Kontakt",
      en: "Contact",
      de: "Kontakt",
      fr: "Contact",
    },

    book: {
      "sr-Latn": "Zakaži",
      mk: "Закажи",
      hr: "Rezerviraj",
      sq: "Prenoto",
      en: "Book",
      de: "Buchen",
      fr: "Réserver",
    },
  },

  // Hero Section
  hero: {
    bookNow: {
      "sr-Latn": "Zakaži termin",
      mk: "Закажи термин",
      hr: "Rezerviraj termin",
      sq: "Prenoto tani",
      en: "Book Now",
      de: "Termin buchen",
      fr: "Réserver un rendez-vous",
    },

    viewServices: {
      "sr-Latn": "Pogledaj usluge",
      mk: "Погледни услуги",
      hr: "Pogledaj usluge",
      sq: "Shiko shërbimet",
      en: "View Services",
      de: "Leistungen ansehen",
      fr: "Voir les services",
    },

    since: {
      "sr-Latn": "Osnovano",
      mk: "Основано",
      hr: "Osn.",
      sq: "Themeluar",
      en: "Est.",
      de: "Gegr.",
      fr: "Fondé",
    },

    nextAvailable: {
      "sr-Latn": "Sledeći slobodan termin",
      mk: "Следен слободен",
      hr: "Sljedeći slobodan termin",
      sq: "I disponueshëm",
      en: "Next available",
      de: "Nächster freier Termin",
      fr: "Prochaine disponibilité",
    },
  },

  // Section Headers
  sections: {
    servicesTitle: {
      "sr-Latn": "Naše usluge",
      mk: "Наши услуги",
      hr: "Naše usluge",
      sq: "Shërbimet tona",
      en: "Our Services",
      de: "Unsere Leistungen",
      fr: "Nos services",
    },

    servicesSub: {
      "sr-Latn": "Izaberite iz naše ponude",
      mk: "Изберете од нашата понуда",
      hr: "Odaberite iz naše ponude",
      sq: "Zgjidhni nga oferta jonë",
      en: "Choose from our offerings",
      de: "Wählen Sie aus unserem Angebot",
      fr: "Choisissez parmi nos prestations",
    },

    teamTitle: {
      "sr-Latn": "Upoznajte tim",
      mk: "Запознајте го тимот",
      hr: "Upoznajte tim",
      sq: "Njihuni me ekipin",
      en: "Meet the Team",
      de: "Lernen Sie das Team kennen",
      fr: "Découvrez l’équipe",
    },

    teamSub: {
      "sr-Latn": "Naši stručnjaci su tu za vas",
      mk: "Нашите стручњаци се тука за вас",
      hr: "Naši stručnjaci su tu za vas",
      sq: "Ekspertët tanë janë këtu për ju",
      en: "Our experts are here for you",
      de: "Unsere Experten sind für Sie da",
      fr: "Nos experts sont à votre service",
    },

    galleryTitle: {
      "sr-Latn": "Galerija",
      mk: "Галерија",
      hr: "Galerija",
      sq: "Galeria",
      en: "Gallery",
      de: "Galerie",
      fr: "Galerie",
    },

    gallerySub: {
      "sr-Latn": "Pogledajte naše radove",
      mk: "Погледнете ги нашите работи",
      hr: "Pogledajte naše radove",
      sq: "Shikoni punën tonë",
      en: "Take a look at our work",
      de: "Werfen Sie einen Blick auf unsere Arbeiten",
      fr: "Découvrez notre travail",
    },

    reviewsTitle: {
      "sr-Latn": "Šta kažu klijenti",
      mk: "Што велат клиентите",
      hr: "Što kažu klijenti",
      sq: "Çfarë thonë klientët",
      en: "What clients say",
      de: "Was Kunden sagen",
      fr: "Ce que disent nos clients",
    },

    reviewsSub: {
      "sr-Latn": "Prava iskustva",
      mk: "Вистински искуства",
      hr: "Stvarna iskustva",
      sq: "Përvoja të vërteta",
      en: "Real experiences",
      de: "Echte Erfahrungen",
      fr: "Expériences authentiques",
    },

    contactTitle: {
      "sr-Latn": "Kontakt",
      mk: "Контакт",
      hr: "Kontakt",
      sq: "Kontakt",
      en: "Contact",
      de: "Kontakt",
      fr: "Contact",
    },

    contactSub: {
      "sr-Latn": "Posetite nas",
      mk: "Дојдете нè посетете",
      hr: "Posjetite nas",
      sq: "Ejani na vizitoni",
      en: "Come visit us",
      de: "Besuchen Sie uns",
      fr: "Venez nous rendre visite",
    },

    hours: {
      "sr-Latn": "Radno vreme",
      mk: "Работно време",
      hr: "Radno vrijeme",
      sq: "Orari",
      en: "Working Hours",
      de: "Öffnungszeiten",
      fr: "Horaires d’ouverture",
    },

    popularServices: {
      "sr-Latn": "Popularne usluge",
      mk: "Популарни услуги",
      hr: "Popularne usluge",
      sq: "Shërbimet popullore",
      en: "Popular Services",
      de: "Beliebte Leistungen",
      fr: "Services populaires",
    },
  },

  // Days of Week
  days: {
    sunday: {
      "sr-Latn": "Nedelja",
      mk: "Недела",
      hr: "Nedjelja",
      sq: "E Diel",
      en: "Sunday",
      de: "Sonntag",
      fr: "Dimanche",
    },

    monday: {
      "sr-Latn": "Ponedeljak",
      mk: "Понеделник",
      hr: "Ponedjeljak",
      sq: "E Hënë",
      en: "Monday",
      de: "Montag",
      fr: "Lundi",
    },

    tuesday: {
      "sr-Latn": "Utorak",
      mk: "Вторник",
      hr: "Utorak",
      sq: "E Martë",
      en: "Tuesday",
      de: "Dienstag",
      fr: "Mardi",
    },

    wednesday: {
      "sr-Latn": "Sreda",
      mk: "Среда",
      hr: "Srijeda",
      sq: "E Mërkurë",
      en: "Wednesday",
      de: "Mittwoch",
      fr: "Mercredi",
    },

    thursday: {
      "sr-Latn": "Četvrtak",
      mk: "Четврток",
      hr: "Četvrtak",
      sq: "E Enjte",
      en: "Thursday",
      de: "Donnerstag",
      fr: "Jeudi",
    },

    friday: {
      "sr-Latn": "Petak",
      mk: "Петок",
      hr: "Petak",
      sq: "E Premte",
      en: "Friday",
      de: "Freitag",
      fr: "Vendredi",
    },

    saturday: {
      "sr-Latn": "Subota",
      mk: "Сабота",
      hr: "Subota",
      sq: "E Shtunë",
      en: "Saturday",
      de: "Samstag",
      fr: "Samedi",
    },
  },

  // Price Types
  priceTypes: {
    fixed: {
      "sr-Latn": "",
      mk: "",
      hr: "",
      sq: "",
      en: "",
      de: "",
      fr: "",
    },

    from: {
      "sr-Latn": "od",
      mk: "од",
      hr: "od",
      sq: "nga",
      en: "from",
      de: "ab",
      fr: "à partir de",
    },

    range: {
      "sr-Latn": "–",
      mk: "-",
      hr: "-",
      sq: "-",
      en: "-",
      de: "-",
      fr: "-",
    },
  },

  // Stats
  stats: {
    years: {
      "sr-Latn": "godina",
      mk: "години",
      hr: "godina",
      sq: "vite",
      en: "years",
      de: "Jahre",
      fr: "ans",
    },

    clients: {
      "sr-Latn": "klijenata",
      mk: "клиенти",
      hr: "klijenata",
      sq: "klientë",
      en: "clients",
      de: "Kunden",
      fr: "clients",
    },

    rating: {
      "sr-Latn": "ocena",
      mk: "оцена",
      hr: "ocjena",
      sq: "vlerësim",
      en: "rating",
      de: "Bewertung",
      fr: "note",
    },

    since: {
      "sr-Latn": "Od",
      mk: "Од",
      hr: "Od",
      sq: "Që nga",
      en: "Since",
      de: "Seit",
      fr: "Depuis",
    },
  },

  // Booking Flow
  booking: {
    title: {
      "sr-Latn": "Zakaži termin",
      mk: "Закажи термин",
      hr: "Rezerviraj termin",
      sq: "Rezervo termin",
      en: "Book an appointment",
      de: "Termin buchen",
      fr: "Réserver un rendez-vous",
    },

    selectService: {
      "sr-Latn": "Izaberi uslugu",
      mk: "Избери услуга",
      hr: "Odaberi uslugu",
      sq: "Zgjidh shërbimin",
      en: "Select Service",
      de: "Leistung auswählen",
      fr: "Sélectionner un service",
    },

    selectEmployee: {
      "sr-Latn": "Izaberi člana tima",
      mk: "Избери фризер",
      hr: "Odaberi člana tima",
      sq: "Zgjidh stilistin",
      en: "Select Stylist",
      de: "Teammitglied auswählen",
      fr: "Sélectionner un membre de l’équipe",
    },

    selectDate: {
      "sr-Latn": "Izaberi datum",
      mk: "Избери датум",
      hr: "Odaberi datum",
      sq: "Zgjidh datën",
      en: "Select Date",
      de: "Datum auswählen",
      fr: "Sélectionner une date",
    },

    selectTime: {
      "sr-Latn": "Izaberi termin",
      mk: "Избери термин",
      hr: "Odaberi termin",
      sq: "Zgjidh orarin",
      en: "Select Time",
      de: "Uhrzeit auswählen",
      fr: "Sélectionner une heure",
    },

    yourInfo: {
      "sr-Latn": "Tvoji podaci",
      mk: "Твои податоци",
      hr: "Vaši podaci",
      sq: "Të dhënat e tua",
      en: "Your Info",
      de: "Ihre Daten",
      fr: "Vos informations",
    },

    success: {
      "sr-Latn": "Gotovo!",
      mk: "Готово!",
      hr: "Uspješno!",
      sq: "Sukses!",
      en: "Success!",
      de: "Erfolg!",
      fr: "Succès !",
    },

    next: {
      "sr-Latn": "Dalje",
      mk: "Следно",
      hr: "Dalje",
      sq: "Vazhdo",
      en: "Next",
      de: "Weiter",
      fr: "Suivant",
    },

    back: {
      "sr-Latn": "Nazad",
      mk: "Назад",
      hr: "Natrag",
      sq: "Prapa",
      en: "Back",
      de: "Zurück",
      fr: "Retour",
    },

    confirm: {
      "sr-Latn": "Potvrdi",
      mk: "Потврди",
      hr: "Potvrdi",
      sq: "Konfirmo",
      en: "Confirm",
      de: "Bestätigen",
      fr: "Confirmer",
    },

    done: {
      "sr-Latn": "Završi",
      mk: "Во ред",
      hr: "Završi",
      sq: "Në rregull",
      en: "Done",
      de: "Fertig",
      fr: "Terminer",
    },

    fullName: {
      "sr-Latn": "Ime i prezime",
      mk: "Целосно име",
      hr: "Ime i prezime",
      sq: "Emri i plotë",
      en: "Full Name",
      de: "Vor- und Nachname",
      fr: "Nom complet",
    },

    phone: {
      "sr-Latn": "Telefon",
      mk: "Телефон",
      hr: "Telefon",
      sq: "Telefoni",
      en: "Phone",
      de: "Telefon",
      fr: "Téléphone",
    },

    email: {
      "sr-Latn": "Email",
      mk: "Email",
      hr: "E-pošta",
      sq: "Email",
      en: "Email",
      de: "E-Mail",
      fr: "E-mail",
    },

    note: {
      "sr-Latn": "Napomena (opciono)",
      mk: "Забелешка (опционално)",
      hr: "Napomena (neobavezno)",
      sq: "Shënim (opsionale)",
      en: "Note (optional)",
      de: "Notiz (optional)",
      fr: "Note (facultatif)",
    },

    successMsg: {
      "sr-Latn": "Tvoj termin je uspešno zakazan! Uskoro ćemo te kontaktirati.",
      mk: "Твојот термин е закажан! Ќе те контактираме наскоро.",
      hr: "Vaš je termin uspješno rezerviran! Uskoro ćemo vas kontaktirati.",
      sq: "Takimi yt u rezervua! Do të të kontaktojmë së shpejti.",
      en: "Your appointment is booked! We'll contact you soon.",
      de: "Ihr Termin wurde erfolgreich gebucht! Wir melden uns in Kürze bei Ihnen.",
      fr: "Votre rendez-vous est réservé ! Nous vous contacterons prochainement.",
    },

    summary: {
      "sr-Latn": "Pregled rezervacije",
      mk: "Резиме",
      hr: "Pregled rezervacije",
      sq: "Përmbledhje",
      en: "Summary",
      de: "Zusammenfassung",
      fr: "Récapitulatif",
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

    any: {
      "sr-Latn": "Bilo ko",
      mk: "Било кој",
      hr: "Bilo tko",
      sq: "Cilido",
      en: "Any",
      de: "Beliebig",
      fr: "N’importe qui",
    },

    anyAvailable: {
      "sr-Latn": "Prvi slobodan",
      mk: "Прв слободен",
      hr: "Prvi slobodan",
      sq: "I pari i disponueshëm",
      en: "First available",
      de: "Erster verfügbarer Termin",
      fr: "Premier disponible",
    },

    step: {
      "sr-Latn": "Korak",
      mk: "Чекор",
      hr: "Korak",
      sq: "Hapi",
      en: "Step",
      de: "Schritt",
      fr: "Étape",
    },

    of: {
      "sr-Latn": "od",
      mk: "од",
      hr: "od",
      sq: "nga",
      en: "of",
      de: "von",
      fr: "sur",
    },

    change: {
      "sr-Latn": "Promeni",
      mk: "Промени",
      hr: "Promijeni",
      sq: "Ndrysho",
      en: "Change",
      de: "Ändern",
      fr: "Modifier",
    },

    selectServiceFirst: {
      "sr-Latn": "Prvo izaberi uslugu",
      mk: "Избери услуга прво",
      hr: "Prvo odaberite uslugu",
      sq: "Zgjidh shërbimin fillimisht",
      en: "Select a service first",
      de: "Wählen Sie zuerst eine Leistung aus",
      fr: "Sélectionnez d’abord un service",
    },

    selectServiceFirstDescription: {
      "sr-Latn": "Moraš izabrati uslugu pre nego što izabereš člana tima.",
      mk: "Мора да избереш услуга пред да избереш фризер.",
      hr: "Morate odabrati uslugu prije nego što odaberete člana tima.",
      sq: "Duhet të zgjedhësh një shërbim para se të zgjedhësh stilistin.",
      en: "You need to select a service before choosing a stylist.",
      de: "Sie müssen eine Leistung auswählen, bevor Sie ein Teammitglied auswählen.",
      fr: "Vous devez sélectionner un service avant de choisir un membre de l’équipe.",
    },

    progressLabel: {
      "sr-Latn": "Napredak rezervacije",
      mk: "Напредок на закажувањето",
      hr: "Napredak rezervacije",
      sq: "Progresi i rezervimit",
      en: "Booking progress",
      de: "Buchungsfortschritt",
      fr: "Progression de la réservation",
    },

    selectDateDescription: {
      "sr-Latn": "Izaberi datum svog termina",
      mk: "Избери датум за твојот термин",
      hr: "Odaberite datum svog termina",
      sq: "Zgjidh datën për takimin tënd",
      en: "Select a date for your appointment",
      de: "Wählen Sie das Datum Ihres Termins",
      fr: "Sélectionnez la date de votre rendez-vous",
    },

    selectTimeDescription: {
      "sr-Latn": "Izaberi slobodan termin",
      mk: "Избери слободен термин",
      hr: "Odaberite slobodan termin",
      sq: "Zgjidh një orar të lirë",
      en: "Select an available time slot",
      de: "Wählen Sie einen freien Termin",
      fr: "Sélectionnez un créneau disponible",
    },

    yourInfoDescription: {
      "sr-Latn": "Unesi svoje kontakt podatke",
      mk: "Внеси ги твоите податоци за контакт",
      hr: "Unesite svoje kontaktne podatke",
      sq: "Plotëso të dhënat e tua të kontaktit",
      en: "Enter your contact information",
      de: "Geben Sie Ihre Kontaktdaten ein",
      fr: "Saisissez vos coordonnées",
    },

    noAvailableDates: {
      "sr-Latn": "Nema dostupnih datuma u narednom periodu",
      mk: "Нема достапни датуми во наредниот период",
      hr: "Nema dostupnih datuma u nadolazećem razdoblju",
      sq: "Nuk ka data të disponueshme në periodën e ardhshme",
      en: "No available dates in the upcoming period",
      de: "In nächster Zeit sind keine Termine verfügbar",
      fr: "Aucune date disponible prochainement",
    },

    completePreviousSteps: {
      "sr-Latn": "Završi prethodne korake",
      mk: "Заврши претходните чекори",
      hr: "Dovršite prethodne korake",
      sq: "Përfundo hapat e mëparshëm",
      en: "Complete previous steps",
      de: "Vorherige Schritte abschließen",
      fr: "Terminez les étapes précédentes",
    },

    completePreviousStepsDescription: {
      "sr-Latn": "Izaberi uslugu, člana tima i datum da vidiš slobodne termine",
      mk: "Избери услуга, фризер и датум за да видиш слободни термини",
      hr: "Odaberite uslugu, člana tima i datum kako biste vidjeli slobodne termine",
      sq: "Zgjidh shërbimin, stilistin dhe datën për të parë oraret e lira",
      en: "Select a service, stylist, and date to see available times",
      de: "Wählen Sie Leistung, Teammitglied und Datum aus, um freie Termine zu sehen",
      fr: "Sélectionnez un service, un membre de l’équipe et une date pour voir les créneaux disponibles",
    },
  },

  // Contact
  contact: {
    closed: {
      "sr-Latn": "Zatvoreno",
      mk: "Затворено",
      hr: "Zatvoreno",
      sq: "Mbyllur",
      en: "Closed",
      de: "Geschlossen",
      fr: "Fermé",
    },

    address: {
      "sr-Latn": "Adresa",
      mk: "Адреса",
      hr: "Adresa",
      sq: "Adresa",
      en: "Address",
      de: "Adresse",
      fr: "Adresse",
    },

    phone: {
      "sr-Latn": "Telefon",
      mk: "Телефон",
      hr: "Telefon",
      sq: "Telefoni",
      en: "Phone",
      de: "Telefon",
      fr: "Téléphone",
    },

    email: {
      "sr-Latn": "Email",
      mk: "Email",
      hr: "E-pošta",
      sq: "Email",
      en: "Email",
      de: "E-Mail",
      fr: "E-mail",
    },

    instagram: {
      "sr-Latn": "Instagram",
      mk: "Instagram",
      hr: "Instagram",
      sq: "Instagram",
      en: "Instagram",
      de: "Instagram",
      fr: "Instagram",
    },

    mapPlaceholder: {
      "sr-Latn": "Mapa",
      mk: "Мапа",
      hr: "Karta",
      sq: "Harta",
      en: "Map",
      de: "Karte",
      fr: "Carte",
    },
  },

  // Common
  common: {
    loading: {
      "sr-Latn": "Učitavanje",
      mk: "Вчитување",
      hr: "Učitavanje",
      sq: "Ngarkimi",
      en: "Loading",
      de: "Wird geladen",
      fr: "Chargement",
    },

    noAppointments: {
      "sr-Latn": "Nema termina",
      mk: "Нема термини",
      hr: "Nema termina",
      sq: "Nuk ka takime",
      en: "No appointments",
      de: "Keine Termine",
      fr: "Aucun rendez-vous",
    },

    noEmployees: {
      "sr-Latn": "Nema dostupnih članova tima",
      mk: "Нема вработени",
      hr: "Nema dostupnih članova tima",
      sq: "Nuk ka punonjës",
      en: "No available employees",
      de: "Keine verfügbaren Teammitglieder",
      fr: "Aucun membre de l’équipe disponible",
    },

    noTimes: {
      "sr-Latn": "Nema slobodnih termina",
      mk: "Нема слободни термини",
      hr: "Nema slobodnih termina",
      sq: "Nuk ka orare",
      en: "No available times",
      de: "Keine freien Termine",
      fr: "Aucun créneau disponible",
    },

    bookWith: {
      "sr-Latn": "Zakaži kod",
      mk: "Закажи кај",
      hr: "Rezerviraj kod",
      sq: "Prenoto me",
      en: "Book with",
      de: "Buchen bei",
      fr: "Réserver avec",
    },

    total: {
      "sr-Latn": "Ukupno",
      mk: "Вкупно",
      hr: "Ukupno",
      sq: "Totali",
      en: "Total",
      de: "Gesamt",
      fr: "Total",
    },

    service: {
      "sr-Latn": "Usluga",
      mk: "Услуга",
      hr: "Usluga",
      sq: "Shërbimi",
      en: "Service",
      de: "Leistung",
      fr: "Service",
    },

    stylist: {
      "sr-Latn": "Član tima",
      mk: "Фризер",
      hr: "Član tima",
      sq: "Stilisti",
      en: "Stylist",
      de: "Teammitglied",
      fr: "Membre de l’équipe",
    },

    date: {
      "sr-Latn": "Datum",
      mk: "Датум",
      hr: "Datum",
      sq: "Data",
      en: "Date",
      de: "Datum",
      fr: "Date",
    },

    time: {
      "sr-Latn": "Vreme",
      mk: "Време",
      hr: "Vrijeme",
      sq: "Koha",
      en: "Time",
      de: "Uhrzeit",
      fr: "Heure",
    },

    premiumService: {
      "sr-Latn": "Premium usluga",
      mk: "Премиум услуга",
      hr: "Premium usluga",
      sq: "Shërbim premium",
      en: "Premium Service",
      de: "Premium-Leistung",
      fr: "Service premium",
    },

    languageSelector: {
      "sr-Latn": "Izbor jezika",
      mk: "Избор на јазик",
      hr: "Odabir jezika",
      sq: "Përzgjedhja e gjuhës",
      en: "Language selector",
      de: "Sprachauswahl",
      fr: "Sélection de la langue",
    },

    switchToLanguage: {
      "sr-Latn": "Prebaci na",
      mk: "Премини на",
      hr: "Prebaci na",
      sq: "Kalo në",
      en: "Switch to",
      de: "Wechseln zu",
      fr: "Passer à",
    },

    selected: {
      "sr-Latn": "izabrano",
      mk: "избрано",
      hr: "odabrano",
      sq: "zgjedhur",
      en: "selected",
      de: "ausgewählt",
      fr: "sélectionné",
    },

    noServices: {
      "sr-Latn": "Nema usluga",
      mk: "Нема услуги",
      hr: "Nema usluga",
      sq: "Nuk ka shërbime",
      en: "No services",
      de: "Keine Leistungen",
      fr: "Aucun service",
    },

    noServicesDescription: {
      "sr-Latn": "Trenutno nema dostupnih usluga.",
      mk: "Моментално нема достапни услуги.",
      hr: "Trenutačno nema dostupnih usluga.",
      sq: "Nuk ka shërbime të disponueshme.",
      en: "No services available at the moment.",
      de: "Derzeit sind keine Leistungen verfügbar.",
      fr: "Aucun service n’est disponible pour le moment.",
    },

    noEmployeesForService: {
      "sr-Latn": "Nema dostupnih članova tima za ovu uslugu.",
      mk: "Нема вработени за оваа услуга.",
      hr: "Nema dostupnih članova tima za ovu uslugu.",
      sq: "Nuk ka punonjës për këtë shërbim.",
      en: "No employees available for this service.",
      de: "Für diese Leistung sind keine Teammitglieder verfügbar.",
      fr: "Aucun membre de l’équipe n’est disponible pour ce service.",
    },

    noTimesDescription: {
      "sr-Latn": "Nema slobodnih termina za izabrani datum. Probaj drugi datum ili uslugu.",
      mk: "Нема слободни термини за избраниот датум. Пробај друг датум или услуга.",
      hr: "Nema slobodnih termina za odabrani datum. Pokušajte s drugim datumom ili uslugom.",
      sq: "Nuk ka orare të lira për datën e zgjedhur. Provo një datë ose shërbim tjetër.",
      en: "No available time slots for the selected date. Try a different date or service.",
      de: "Für das ausgewählte Datum sind keine freien Termine verfügbar. Versuchen Sie ein anderes Datum oder eine andere Leistung.",
      fr: "Aucun créneau n’est disponible à la date sélectionnée. Essayez une autre date ou un autre service.",
    },

    notSelected: {
      "sr-Latn": "Nije izabrano",
      mk: "Не е избрано",
      hr: "Nije odabrano",
      sq: "Nuk është zgjedhur",
      en: "Not selected",
      de: "Nicht ausgewählt",
      fr: "Non sélectionné",
    },

    mainNavigation: {
      "sr-Latn": "Glavna navigacija",
      mk: "Главна навигација",
      hr: "Glavna navigacija",
      sq: "Navigimi kryesor",
      en: "Main navigation",
      de: "Hauptnavigation",
      fr: "Navigation principale",
    },

    noEmployeesDescription: {
      "sr-Latn": "Trenutno nema dostupnih članova tima.",
      mk: "Моментално нема достапни членови на тимот.",
      hr: "Trenutačno nema dostupnih članova tima.",
      sq: "Aktualisht nuk ka anëtarë të ekipit në dispozicion.",
      en: "No team members are available at the moment.",
      de: "Derzeit sind keine Teammitglieder verfügbar.",
      fr: "Aucun membre de l’équipe n’est disponible pour le moment.",
    },

    allRightsReserved: {
      "sr-Latn": "Sva prava zadržana",
      mk: "Сите права се задржани",
      hr: "Sva prava pridržana",
      sq: "Të gjitha të drejtat e rezervuara",
      en: "All rights reserved",
      de: "Alle Rechte vorbehalten",
      fr: "Tous droits réservés",
    },

    footerNavigation: {
      "sr-Latn": "Navigacija u podnožju",
      mk: "Навигација во подножјето",
      hr: "Navigacija u podnožju",
      sq: "Navigimi i fundit të faqes",
      en: "Footer navigation",
      de: "Fußzeilennavigation",
      fr: "Navigation du pied de page",
    },

    close: {
      "sr-Latn": "Zatvori",
      mk: "Затвори",
      hr: "Zatvori",
      sq: "Mbyll",
      en: "Close",
      de: "Schließen",
      fr: "Fermer",
    },

    openFullWebsite: {
      "sr-Latn": "Otvori punu verziju sajta",
      mk: "Отвори веб верзија",
      hr: "Otvori punu verziju web-stranice",
      sq: "Hap versionin e plotë",
      en: "Open full website",
      de: "Vollständige Website öffnen",
      fr: "Ouvrir le site complet",
    },

    mobileNavigation: {
      "sr-Latn": "Mobilna navigacija",
      mk: "Мобилна навигација",
      hr: "Mobilna navigacija",
      sq: "Navigimi mobil",
      en: "Mobile navigation",
      de: "Mobile Navigation",
      fr: "Navigation mobile",
    },
  },

  // Customer
  customer: {
    namePlaceholder: {
      "sr-Latn": "Unesi ime i prezime",
      mk: "Внеси го твоето име",
      hr: "Unesite ime i prezime",
      sq: "Shkruaj emrin tënd",
      en: "Enter your name",
      de: "Vor- und Nachnamen eingeben",
      fr: "Saisissez votre nom complet",
    },

    phonePlaceholder: {
      "sr-Latn": "+381 60 000 0000",
      mk: "+389 70 000 000",
      hr: "+385 91 000 0000",
      sq: "+389 70 000 000",
      en: "+381 60 000 0000",
      de: "+49 151 00000000",
      fr: "+33 6 00 00 00 00",
    },

    emailPlaceholder: {
      "sr-Latn": "email@primer.rs",
      mk: "email@primer.com",
      hr: "email@primjer.hr",
      sq: "email@shembull.com",
      en: "email@example.com",
      de: "email@beispiel.de",
      fr: "email@exemple.fr",
    },

    notePlaceholder: {
      "sr-Latn": "Dodaj napomenu (opciono)",
      mk: "Додај забелешка (опционално)",
      hr: "Dodajte napomenu (neobavezno)",
      sq: "Shto një shënim (opsionale)",
      en: "Add a note (optional)",
      de: "Notiz hinzufügen (optional)",
      fr: "Ajouter une note (facultatif)",
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
