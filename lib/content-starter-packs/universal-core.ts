import type {
  StarterPackBookingDefaults,
  StarterPackContentSection,
  StarterPackFaqItem,
  StarterPackMediaSlot,
  StarterPackPolicyTemplate,
  StarterPackSeoDefaults,
} from "@/lib/content-starter-packs/domain";

export const UNIVERSAL_BOOKING_DEFAULTS:
  StarterPackBookingDefaults = {
  minimumNoticeMinutes:
    120,
  maximumAdvanceDays:
    60,
  cancellationWindowHours:
    24,
  rescheduleWindowHours:
    24,
  slotIntervalMinutes:
    15,
  defaultBufferMinutes:
    0,
  allowAnyStaff:
    true,
  requiresOwnerConfirmation:
    true,
};

export const UNIVERSAL_POLICY_TEMPLATES:
  StarterPackPolicyTemplate[] = [
  {
    key:
      "cancellation",
    title:
      "Otkazivanje termina",
    body:
      "Molimo vas da termin otkažete ili pomerite najmanje {cancellationHours} sati unapred. Konačno pravilo potvrđuje salon.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "late-arrival",
    title:
      "Kašnjenje",
    body:
      "Kašnjenje može skratiti trajanje usluge ili zahtevati novi termin, u zavisnosti od rasporeda salona.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "no-show",
    title:
      "Nedolazak",
    body:
      "Salon može uvesti depozit ili ograničenje budućih rezervacija posle nedolaska bez obaveštenja.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "children-and-guests",
    title:
      "Deca i pratnja",
    body:
      "Pravila za decu i pratnju zavise od prostora, bezbednosti i vrste usluge.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "photo-consent",
    title:
      "Fotografisanje rezultata",
    body:
      "Fotografije se koriste samo uz jasnu saglasnost klijenta i potvrđenu politiku privatnosti.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "health-information",
    title:
      "Zdravstvene informacije",
    body:
      "Klijent treba da prijavi relevantne alergije, terapije ili kontraindikacije pre usluge. Ovaj tekst nije medicinski savet.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
];

export const UNIVERSAL_FAQ:
  StarterPackFaqItem[] = [
  {
    key:
      "how-to-book",
    question:
      "Kako mogu da rezervišem termin?",
    answer:
      "Izaberite uslugu, zaposlenog ili opciju bilo koji dostupni zaposleni, zatim datum i slobodan termin.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "reschedule",
    question:
      "Mogu li da pomerim termin?",
    answer:
      "Termin možete pomeriti u okviru pravila salona i dostupnih termina.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "preparation",
    question:
      "Da li treba da se pripremim za uslugu?",
    answer:
      "Priprema zavisi od usluge. Salon će prikazati posebne napomene pre potvrde termina.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
  {
    key:
      "pricing",
    question:
      "Da li je prikazana cena konačna?",
    answer:
      "Cena može zavisiti od trajanja, dužine, površine, utroška materijala ili konsultacije. Salon potvrđuje konačnu cenu.",
    status:
      "draft",
    requiresOwnerConfirmation:
      true,
  },
];

export const UNIVERSAL_CONTENT_SECTIONS:
  StarterPackContentSection[] = [
  {
    key:
      "hero",
    kind:
      "hero",
    title:
      "{businessName}",
    subtitle:
      "Nega i usluge prilagođene vama",
    body:
      "Otkrijte pažljivo odabrane usluge i rezervišite termin u salonu {businessName}.",
    ctaLabel:
      "Rezerviši termin",
    tokens: [
      "businessName",
    ],
    status:
      "draft",
  },
  {
    key:
      "about",
    kind:
      "about",
    title:
      "O nama",
    body:
      "{businessName} spaja stručnost, posvećenost i prijatan ambijent. Vlasnik salona potvrđuje konačan tekst.",
    tokens: [
      "businessName",
    ],
    status:
      "draft",
  },
  {
    key:
      "services",
    kind:
      "services",
    title:
      "Naše usluge",
    body:
      "Izaberite uslugu koja odgovara vašim potrebama. Stvarna ponuda, trajanje i cena potvrđuju se tokom onboarding-a.",
    ctaLabel:
      "Pogledaj usluge",
    tokens: [],
    status:
      "draft",
  },
  {
    key:
      "benefits",
    kind:
      "benefits",
    title:
      "Zašto nas klijenti biraju",
    body:
      "Stručan pristup, jasna komunikacija i jednostavna online rezervacija.",
    tokens: [],
    status:
      "draft",
  },
  {
    key:
      "team",
    kind:
      "team",
    title:
      "Upoznajte tim",
    body:
      "Profili zaposlenih se objavljuju tek nakon unosa stvarnih članova tima.",
    tokens: [],
    status:
      "draft",
  },
  {
    key:
      "gallery",
    kind:
      "gallery",
    title:
      "Galerija",
    body:
      "Dodajte originalne fotografije prostora, tima i rezultata uz potrebne saglasnosti.",
    tokens: [],
    status:
      "draft",
  },
  {
    key:
      "reviews",
    kind:
      "reviews",
    title:
      "Iskustva klijenata",
    body:
      "Prikazuju se samo stvarne recenzije iz potvrđenih izvora.",
    tokens: [],
    status:
      "draft",
  },
  {
    key:
      "booking",
    kind:
      "booking",
    title:
      "Rezervišite svoj termin",
    body:
      "Izaberite uslugu, datum i vreme koje vam odgovara.",
    ctaLabel:
      "Započni rezervaciju",
    tokens: [],
    status:
      "draft",
  },
  {
    key:
      "contact",
    kind:
      "contact",
    title:
      "Kontakt i lokacija",
    body:
      "Pozovite nas ili pronađite salon na adresi {address}, {city}.",
    tokens: [
      "address",
      "city",
    ],
    status:
      "draft",
  },
];

export const UNIVERSAL_SEO_DEFAULTS:
  StarterPackSeoDefaults = {
  titleTemplate:
    "{businessName} — salon u {city}",
  descriptionTemplate:
    "Rezervišite termin u salonu {businessName} u gradu {city}. Pogledajte usluge, tim i dostupne termine.",
  serviceTitleTemplate:
    "{serviceName} | {businessName} — {city}",
  status:
    "draft",
};

export const UNIVERSAL_MEDIA_SLOTS:
  StarterPackMediaSlot[] = [
  {
    key:
      "logo",
    label:
      "Logo",
    aspectRatio:
      "1:1",
    minimumWidth:
      512,
    minimumHeight:
      512,
    required:
      true,
    altTextTemplate:
      "Logo salona {businessName}",
  },
  {
    key:
      "hero-desktop",
    label:
      "Hero fotografija — desktop",
    aspectRatio:
      "16:9",
    minimumWidth:
      1600,
    minimumHeight:
      900,
    required:
      true,
    altTextTemplate:
      "Ambijent salona {businessName}",
  },
  {
    key:
      "hero-mobile",
    label:
      "Hero fotografija — mobilni",
    aspectRatio:
      "4:5",
    minimumWidth:
      1080,
    minimumHeight:
      1350,
    required:
      true,
    altTextTemplate:
      "Ambijent salona {businessName}",
  },
  {
    key:
      "interior",
    label:
      "Enterijer",
    aspectRatio:
      "4:3",
    minimumWidth:
      1200,
    minimumHeight:
      900,
    required:
      false,
    altTextTemplate:
      "Enterijer salona {businessName}",
  },
  {
    key:
      "team",
    label:
      "Tim",
    aspectRatio:
      "3:2",
    minimumWidth:
      1200,
    minimumHeight:
      800,
    required:
      false,
    altTextTemplate:
      "Tim salona {businessName}",
  },
  {
    key:
      "service-category",
    label:
      "Fotografija kategorije usluga",
    aspectRatio:
      "4:3",
    minimumWidth:
      1200,
    minimumHeight:
      900,
    required:
      false,
    altTextTemplate:
      "{categoryName} u salonu {businessName}",
  },
  {
    key:
      "gallery",
    label:
      "Galerija",
    aspectRatio:
      "mixed",
    minimumWidth:
      1200,
    minimumHeight:
      1200,
    required:
      false,
    altTextTemplate:
      "Galerija salona {businessName}",
  },
  {
    key:
      "social-preview",
    label:
      "Social preview",
    aspectRatio:
      "1.91:1",
    minimumWidth:
      1200,
    minimumHeight:
      630,
    required:
      false,
    altTextTemplate:
      "{businessName}",
  },
];
