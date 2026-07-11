import {
  UI_LOCALE_CODES,
  type UiLocaleCode,
} from "@/lib/i18n/locales";
import {
  t,
} from "@/lib/translations";
import type {
  LocalizedText,
} from "@/lib/types";

const REVIEW_COPY = {
  languageLabel: {
    "sr-Latn": "Jezik",
    mk: "Јазик",
    hr: "Jezik",
    sq: "Gjuha",
    en: "Language",
    de: "Sprache",
    fr: "Langue",
  },

  directBadge: {
    "sr-Latn": "Utisak klijenta",
    mk: "Впечаток од клиент",
    hr: "Dojam klijenta",
    sq: "Përshtypja e klientit",
    en: "Client feedback",
    de: "Kundenfeedback",
    fr: "Avis client",
  },

  verifiedBadge: {
    "sr-Latn": "Potvrđena poseta",
    mk: "Потврдена посета",
    hr: "Potvrđen posjet",
    sq: "Vizitë e konfirmuar",
    en: "Verified visit",
    de: "Bestätigter Besuch",
    fr: "Visite confirmée",
  },

  directTitle: {
    "sr-Latn": "Podeli svoje iskustvo",
    mk: "Споделете го вашето искуство",
    hr: "Podijelite svoje iskustvo",
    sq: "Ndani përvojën tuaj",
    en: "Share your experience",
    de: "Teilen Sie Ihre Erfahrung",
    fr: "Partagez votre expérience",
  },

  verifiedTitle: {
    "sr-Latn": "Kako je prošla poseta?",
    mk: "Како помина посетата?",
    hr: "Kako je prošao posjet?",
    sq: "Si shkoi vizita?",
    en: "How was your visit?",
    de: "Wie war Ihr Besuch?",
    fr: "Comment s'est passée votre visite ?",
  },

  directIntro: {
    "sr-Latn": "Iskren utisak pomaže salonu da bude bolji i drugim klijentima da lakše izaberu.",
    mk: "Искрениот впечаток му помага на салонот да биде подобар и на другите клиенти полесно да изберат.",
    hr: "Iskren dojam pomaže salonu da bude bolji i drugim klijentima da lakše odaberu.",
    sq: "Përshtypja juaj e sinqertë ndihmon sallonin të përmirësohet dhe klientët e tjerë të zgjedhin më lehtë.",
    en: "Honest feedback helps the salon improve and helps future clients choose.",
    de: "Ehrliches Feedback hilft dem Salon, besser zu werden, und zukünftigen Kunden bei der Auswahl.",
    fr: "Un avis sincère aide le salon à s'améliorer et les futurs clients à choisir.",
  },

  verifiedIntro: {
    "sr-Latn": "Ovaj link je povezan sa završenom posetom. Recenzija će imati oznaku potvrđene posete.",
    mk: "Овој линк е поврзан со завршена посета. Рецензијата ќе има ознака за потврдена посета.",
    hr: "Ova poveznica povezana je sa završenim posjetom. Recenzija će imati oznaku potvrđenog posjeta.",
    sq: "Kjo lidhje është e lidhur me një vizitë të përfunduar. Vlerësimi do të ketë shenjën e vizitës së konfirmuar.",
    en: "This link is connected to a completed visit. The review will carry a verified-visit badge.",
    de: "Dieser Link gehört zu einem abgeschlossenen Besuch. Die Bewertung erhält das Kennzeichen „Bestätigter Besuch“.",
    fr: "Ce lien correspond à une visite terminée. L'avis portera la mention « Visite confirmée ».",
  },

  visitDetails: {
    "sr-Latn": "Detalji posete",
    mk: "Детали за посетата",
    hr: "Detalji posjeta",
    sq: "Detajet e vizitës",
    en: "Visit details",
    de: "Besuchsdetails",
    fr: "Détails de la visite",
  },

  serviceLabel: {
    "sr-Latn": "Usluga",
    mk: "Услуга",
    hr: "Usluga",
    sq: "Shërbimi",
    en: "Service",
    de: "Leistung",
    fr: "Service",
  },

  employeeLabel: {
    "sr-Latn": "Član tima",
    mk: "Член на тимот",
    hr: "Član tima",
    sq: "Anëtari i ekipit",
    en: "Team member",
    de: "Teammitglied",
    fr: "Membre de l’équipe",
  },

  appointmentLabel: {
    "sr-Latn": "Termin",
    mk: "Термин",
    hr: "Termin",
    sq: "Termini",
    en: "Appointment",
    de: "Termin",
    fr: "Rendez-vous",
  },

  expiresLabel: {
    "sr-Latn": "Link važi do",
    mk: "Линкот важи до",
    hr: "Poveznica vrijedi do",
    sq: "Lidhja vlen deri më",
    en: "Link expires",
    de: "Link gültig bis",
    fr: "Lien valable jusqu’au",
  },

  authorLabel: {
    "sr-Latn": "Ime za prikaz",
    mk: "Име за приказ",
    hr: "Ime za prikaz",
    sq: "Emri për shfaqje",
    en: "Display name",
    de: "Anzeigename",
    fr: "Nom affiché",
  },

  authorPlaceholder: {
    "sr-Latn": "Unesi svoje ime",
    mk: "Внесете го вашето име",
    hr: "Unesite svoje ime",
    sq: "Shkruani emrin tuaj",
    en: "Enter your name",
    de: "Geben Sie Ihren Namen ein",
    fr: "Saisissez votre nom",
  },

  ratingLabel: {
    "sr-Latn": "Ocena",
    mk: "Оценка",
    hr: "Ocjena",
    sq: "Vlerësimi",
    en: "Rating",
    de: "Bewertung",
    fr: "Note",
  },

  starsWord: {
    "sr-Latn": "zvezdica",
    mk: "ѕвезди",
    hr: "zvjezdica",
    sq: "yje",
    en: "stars",
    de: "Sterne",
    fr: "étoiles",
  },

  bodyLabel: {
    "sr-Latn": "Tvoj utisak",
    mk: "Вашиот впечаток",
    hr: "Vaš dojam",
    sq: "Përshtypja juaj",
    en: "Your feedback",
    de: "Ihr Feedback",
    fr: "Votre avis",
  },

  bodyPlaceholder: {
    "sr-Latn": "Napiši šta ti se dopalo i šta salon može da unapredi...",
    mk: "Напишете што ви се допадна и што салонот може да подобри...",
    hr: "Napišite što vam se svidjelo i što salon može poboljšati...",
    sq: "Shkruani çfarë ju pëlqeu dhe çfarë mund të përmirësojë salloni...",
    en: "Tell us what you liked and what the salon could improve...",
    de: "Schreiben Sie, was Ihnen gefallen hat und was der Salon verbessern könnte...",
    fr: "Dites-nous ce qui vous a plu et ce que le salon pourrait améliorer...",
  },

  requiredNote: {
    "sr-Latn": "Sva polja su obavezna.",
    mk: "Сите полиња се задолжителни.",
    hr: "Sva polja su obavezna.",
    sq: "Të gjitha fushat janë të detyrueshme.",
    en: "All fields are required.",
    de: "Alle Felder sind erforderlich.",
    fr: "Tous les champs sont obligatoires.",
  },

  submit: {
    "sr-Latn": "Pošalji recenziju",
    mk: "Испрати рецензија",
    hr: "Pošalji recenziju",
    sq: "Dërgo vlerësimin",
    en: "Submit review",
    de: "Bewertung senden",
    fr: "Envoyer l’avis",
  },

  submitting: {
    "sr-Latn": "Slanje...",
    mk: "Се испраќа...",
    hr: "Slanje...",
    sq: "Duke dërguar...",
    en: "Submitting...",
    de: "Wird gesendet...",
    fr: "Envoi...",
  },

  successTitle: {
    "sr-Latn": "Hvala na utisku",
    mk: "Ви благодариме за рецензијата",
    hr: "Hvala na dojmu",
    sq: "Faleminderit për vlerësimin",
    en: "Thank you for your feedback",
    de: "Vielen Dank für Ihr Feedback",
    fr: "Merci pour votre avis",
  },

  successPending: {
    "sr-Latn": "Recenzija je primljena i biće prikazana nakon moderacije.",
    mk: "Рецензијата е примена и ќе биде прикажана по модерацијата.",
    hr: "Recenzija je zaprimljena i bit će prikazana nakon moderacije.",
    sq: "Vlerësimi u pranua dhe do të shfaqet pas moderimit.",
    en: "Your review was received and will appear after moderation.",
    de: "Ihre Bewertung wurde empfangen und wird nach der Moderation angezeigt.",
    fr: "Votre avis a été reçu et sera affiché après modération.",
  },

  successPublished: {
    "sr-Latn": "Recenzija je uspešno objavljena.",
    mk: "Рецензијата е успешно објавена.",
    hr: "Recenzija je uspješno objavljena.",
    sq: "Vlerësimi u publikua me sukses.",
    en: "Your review was published successfully.",
    de: "Ihre Bewertung wurde erfolgreich veröffentlicht.",
    fr: "Votre avis a été publié avec succès.",
  },

  backToSalon: {
    "sr-Latn": "Nazad na sajt salona",
    mk: "Назад на веб-страницата на салонот",
    hr: "Natrag na web-stranicu salona",
    sq: "Kthehu në faqen e sallonit",
    en: "Back to salon website",
    de: "Zurück zur Salon-Website",
    fr: "Retour au site du salon",
  },

  unavailableTitle: {
    "sr-Latn": "Recenzija trenutno nije dostupna",
    mk: "Рецензијата моментално не е достапна",
    hr: "Recenzija trenutačno nije dostupna",
    sq: "Vlerësimi nuk është i disponueshëm",
    en: "Review is currently unavailable",
    de: "Bewertung ist derzeit nicht verfügbar",
    fr: "L’avis n’est pas disponible",
  },

  unavailableBody: {
    "sr-Latn": "Link je nevažeći, istekao, već iskorišćen ili salon trenutno ne prima recenzije.",
    mk: "Линкот е неважечки, истечен, веќе искористен или салонот моментално не прима рецензии.",
    hr: "Poveznica je nevažeća, istekla, već iskorištena ili salon trenutačno ne prima recenzije.",
    sq: "Lidhja është e pavlefshme, ka skaduar, është përdorur ose salloni nuk pranon vlerësime.",
    en: "The link is invalid, expired, already used, or the salon is not accepting reviews.",
    de: "Der Link ist ungültig, abgelaufen, bereits verwendet oder der Salon nimmt derzeit keine Bewertungen an.",
    fr: "Le lien est invalide, expiré, déjà utilisé ou le salon n’accepte pas d’avis.",
  },

  invalidInput: {
    "sr-Latn": "Proveri obavezna polja i pokušaj ponovo.",
    mk: "Проверете ги задолжителните полиња и обидете се повторно.",
    hr: "Provjerite obavezna polja i pokušajte ponovno.",
    sq: "Kontrolloni fushat e detyrueshme dhe provoni përsëri.",
    en: "Check the required fields and try again.",
    de: "Prüfen Sie die Pflichtfelder und versuchen Sie es erneut.",
    fr: "Vérifiez les champs obligatoires et réessayez.",
  },

  alreadySubmitted: {
    "sr-Latn": "Za ovu posetu je recenzija već poslata.",
    mk: "За оваа посета веќе е испратена рецензија.",
    hr: "Za ovaj posjet recenzija je već poslana.",
    sq: "Për këtë vizitë është dërguar tashmë një vlerësim.",
    en: "A review has already been submitted for this visit.",
    de: "Für diesen Besuch wurde bereits eine Bewertung abgegeben.",
    fr: "Un avis a déjà été envoyé pour cette visite.",
  },

  rateLimited: {
    "sr-Latn": "Previše pokušaja. Sačekaj malo i pokušaj ponovo.",
    mk: "Премногу обиди. Почекајте и обидете се повторно.",
    hr: "Previše pokušaja. Pričekajte i pokušajte ponovno.",
    sq: "Shumë përpjekje. Prisni pak dhe provoni përsëri.",
    en: "Too many attempts. Wait a little and try again.",
    de: "Zu viele Versuche. Warten Sie kurz und versuchen Sie es erneut.",
    fr: "Trop de tentatives. Patientez puis réessayez.",
  },

  genericError: {
    "sr-Latn": "Recenzija trenutno ne može da se pošalje. Pokušaj ponovo.",
    mk: "Рецензијата моментално не може да се испрати. Обидете се повторно.",
    hr: "Recenziju trenutačno nije moguće poslati. Pokušajte ponovno.",
    sq: "Vlerësimi nuk mund të dërgohet tani. Provoni përsëri.",
    en: "The review cannot be submitted right now. Please try again.",
    de: "Die Bewertung kann derzeit nicht gesendet werden. Versuchen Sie es erneut.",
    fr: "L’avis ne peut pas être envoyé pour le moment. Réessayez.",
  },

  characters: {
    "sr-Latn": "karaktera",
    mk: "знаци",
    hr: "znakova",
    sq: "karaktere",
    en: "characters",
    de: "Zeichen",
    fr: "caractères",
  },
} satisfies Record<
  string,
  LocalizedText
>;

export type ReviewUiCopy = {
  [Key in keyof typeof REVIEW_COPY]:
    string;
};

export function resolveReviewUiLocale(
  value:
    | string
    | null
    | undefined
): UiLocaleCode {
  return (
    UI_LOCALE_CODES as readonly string[]
  ).includes(
    value ?? ""
  )
    ? value as UiLocaleCode
    : "sr-Latn";
}

export function getReviewUiCopy(
  locale: UiLocaleCode
): ReviewUiCopy {
  return Object.fromEntries(
    Object.entries(
      REVIEW_COPY
    ).map(
      (
        [
          key,
          value,
        ]
      ) => [
        key,
        t(
          value,
          locale,
          "sr-Latn"
        ),
      ]
    )
  ) as ReviewUiCopy;
}
