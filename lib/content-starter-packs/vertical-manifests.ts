import type {
  StarterPackManifest,
} from "@/lib/content-starter-packs/domain";

export const STARTER_PACK_MANIFESTS =
  [
  {
    "id": "beauty-general",
    "version": 1,
    "vertical": "beauty-general",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Beauty General",
    "description": "Neutralni starter pack za kombinovane beauty i wellness salone.",
    "categories": [
      {
        "key": "hair",
        "name": "Kosa",
        "description": "Osnovne frizerske usluge.",
        "sortOrder": 1
      },
      {
        "key": "nails",
        "name": "Nokti",
        "description": "Manikir, pedikir i gel lak.",
        "sortOrder": 2
      },
      {
        "key": "lashes-brows",
        "name": "Trepavice i obrve",
        "description": "Oblikovanje, lift i nega.",
        "sortOrder": 3
      },
      {
        "key": "face-body",
        "name": "Lice i telo",
        "description": "Beauty tretmani lica i tela.",
        "sortOrder": 4
      },
      {
        "key": "wellness",
        "name": "Wellness",
        "description": "Masaža i relaksacija.",
        "sortOrder": 5
      }
    ],
    "services": [
      {
        "key": "women-haircut",
        "categoryKey": "hair",
        "name": "Žensko šišanje",
        "description": "Početna usluga šišanja uz konsultaciju o željenom obliku.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 5,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "service-notes"
        ],
        "compatibleStaffRoleKeys": [
          "hair-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "blow-dry",
        "categoryKey": "hair",
        "name": "Feniranje",
        "description": "Stilizovanje prema dužini i gustini kose.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 5,
        "pricingMode": "by_length",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "service-notes"
        ],
        "compatibleStaffRoleKeys": [
          "hair-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "classic-manicure",
        "categoryKey": "nails",
        "name": "Klasičan manikir",
        "description": "Oblikovanje i osnovna nega noktiju.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "gel-polish",
        "categoryKey": "nails",
        "name": "Gel lak",
        "description": "Priprema nokta i nanošenje gel laka.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "service-notes"
        ],
        "compatibleStaffRoleKeys": [
          "nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "brow-shaping",
        "categoryKey": "lashes-brows",
        "name": "Oblikovanje obrva",
        "description": "Konsultacija i oblikovanje obrva.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "lash-brow-artist",
          "beauty-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "lash-lift",
        "categoryKey": "lashes-brows",
        "name": "Lash lift",
        "description": "Podizanje i stilizovanje prirodnih trepavica.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "lash-brow-artist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "facial-care",
        "categoryKey": "face-body",
        "name": "Osnovni tretman lica",
        "description": "Tretman se prilagođava stanju i potrebama kože.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 10,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "beauty-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "body-care",
        "categoryKey": "face-body",
        "name": "Tretman tela",
        "description": "Početni tretman tela koji salon precizno definiše.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "beauty-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "relax-massage-30",
        "categoryKey": "wellness",
        "name": "Relax masaža 30 min",
        "description": "Kraći termin za relaksaciju ili parcijalni tretman.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "massage-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "relax-massage-60",
        "categoryKey": "wellness",
        "name": "Relax masaža 60 min",
        "description": "Celovit relax tretman u trajanju od 60 minuta.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "massage-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 10
      }
    ],
    "staffRoles": [
      {
        "key": "beauty-therapist",
        "name": "Beauty terapeut",
        "description": "Opšte beauty i wellness usluge.",
        "sortOrder": 1
      },
      {
        "key": "hair-stylist",
        "name": "Frizer",
        "description": "Šišanje, stilizovanje i osnovna nega kose.",
        "sortOrder": 2
      },
      {
        "key": "nail-technician",
        "name": "Nail tehničar",
        "description": "Manikir, gel lak i osnovni tretmani noktiju.",
        "sortOrder": 3
      },
      {
        "key": "lash-brow-artist",
        "name": "Lash & brow artist",
        "description": "Tretmani trepavica i obrva.",
        "sortOrder": 4
      },
      {
        "key": "massage-therapist",
        "name": "Masažni terapeut",
        "description": "Relax i parcijalne masaže.",
        "sortOrder": 5
      }
    ],
    "intakeQuestions": [
      {
        "key": "service-notes",
        "label": "Da li imate posebnu napomenu za uslugu?",
        "kind": "text",
        "required": false
      },
      {
        "key": "allergies",
        "label": "Da li imate poznate alergije ili osetljivosti?",
        "kind": "text",
        "required": false
      }
    ],
    "resources": [],
    "bookingDefaults": {},
    "policies": [
      {
        "key": "mixed-services",
        "title": "Kombinovane usluge",
        "body": "Salon potvrđuje koje kategorije i usluge stvarno pruža pre objave.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "service-selection",
        "question": "Kako da izaberem pravu uslugu?",
        "answer": "Izaberite najbližu opciju ili kontaktirajte salon za konsultaciju.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "general-focus",
        "kind": "benefits",
        "title": "Sve na jednom mestu",
        "body": "Kombinujte odabrane beauty i wellness usluge u jednom salonu.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — beauty salon u {city}",
      "descriptionTemplate": "Beauty i wellness usluge u salonu {businessName}, {city}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [],
    "moduleSupport": {
      "aftercare": "optional",
      "before-after-gallery": "recommended",
      "bridal-services": "optional",
      "brow-lamination": "unsupported",
      "color-consultation": "optional",
      "consent": "unsupported",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "unsupported",
      "kids-services": "optional",
      "lash-extensions": "unsupported",
      "loyalty": "optional",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "unsupported",
      "resource-booking": "unsupported",
      "service-packages": "optional",
      "walk-ins": "optional"
    }
  },
  {
    "id": "hair-salon",
    "version": 1,
    "vertical": "hair-salon",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Hair Salon",
    "description": "Starter katalog za frizerske salone, koloriste i stiliste.",
    "categories": [
      {
        "key": "haircuts",
        "name": "Šišanje",
        "description": "Žensko, muško i dečje šišanje.",
        "sortOrder": 1
      },
      {
        "key": "blow-dry",
        "name": "Feniranje i stilizovanje",
        "description": "Stilizovanje prema dužini i gustini.",
        "sortOrder": 2
      },
      {
        "key": "color",
        "name": "Farbanje",
        "description": "Izrastak, cela dužina i preliv.",
        "sortOrder": 3
      },
      {
        "key": "highlights",
        "name": "Pramenovi i tehnike",
        "description": "Pramenovi, balayage i kompleksne tehnike.",
        "sortOrder": 4
      },
      {
        "key": "care",
        "name": "Nega kose",
        "description": "Dubinska nega i tretmani.",
        "sortOrder": 5
      },
      {
        "key": "special",
        "name": "Svečane frizure",
        "description": "Frizure za događaje i posebne prilike.",
        "sortOrder": 6
      },
      {
        "key": "kids",
        "name": "Dečje usluge",
        "description": "Usluge prilagođene deci.",
        "sortOrder": 7
      }
    ],
    "services": [
      {
        "key": "women-haircut",
        "categoryKey": "haircuts",
        "name": "Žensko šišanje",
        "description": "Konsultacija, šišanje i završno stilizovanje prema dogovoru.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 5,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "hair-length",
          "desired-style"
        ],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "senior-stylist",
          "junior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "men-haircut",
        "categoryKey": "haircuts",
        "name": "Muško šišanje",
        "description": "Šišanje makazama i/ili mašinicom.",
        "defaultDurationMinutes": 40,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "desired-style"
        ],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "senior-stylist",
          "junior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "kids-haircut",
        "categoryKey": "kids",
        "name": "Dečje šišanje",
        "description": "Šišanje za uzrast koji salon potvrđuje.",
        "defaultDurationMinutes": 35,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "junior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "blow-dry-short",
        "categoryKey": "blow-dry",
        "name": "Feniranje kratke kose",
        "description": "Pranje i feniranje kratke kose.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "junior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "blow-dry-medium",
        "categoryKey": "blow-dry",
        "name": "Feniranje srednje kose",
        "description": "Pranje i feniranje srednje dužine.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "junior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "blow-dry-long",
        "categoryKey": "blow-dry",
        "name": "Feniranje duge kose",
        "description": "Pranje i feniranje duge ili guste kose.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 5,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "hair-length",
          "hair-density"
        ],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "root-color",
        "categoryKey": "color",
        "name": "Farbanje izrastka",
        "description": "Bojenje izrastka uz procenu nijanse i stanja kose.",
        "defaultDurationMinutes": 120,
        "suggestedBufferMinutes": 15,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "hair-length",
          "color-history",
          "allergy-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "colorist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "full-color",
        "categoryKey": "color",
        "name": "Farbanje cele dužine",
        "description": "Bojenje cele dužine sa cenom prema materijalu i dužini.",
        "defaultDurationMinutes": 150,
        "suggestedBufferMinutes": 15,
        "pricingMode": "by_length",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "hair-length",
          "hair-density",
          "color-history",
          "allergy-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "colorist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "toner",
        "categoryKey": "color",
        "name": "Preliv",
        "description": "Osvežavanje tona uz prethodnu procenu.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "hair-length",
          "color-history"
        ],
        "compatibleStaffRoleKeys": [
          "colorist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "highlights",
        "categoryKey": "highlights",
        "name": "Pramenovi",
        "description": "Pramenovi prema odabranoj tehnici, dužini i gustini.",
        "defaultDurationMinutes": 210,
        "suggestedBufferMinutes": 20,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "hair-length",
          "hair-density",
          "color-history",
          "allergy-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "colorist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 10
      },
      {
        "key": "balayage",
        "categoryKey": "highlights",
        "name": "Balayage",
        "description": "Kompleksna tehnika sa obaveznom procenom stanja i istorije kose.",
        "defaultDurationMinutes": 240,
        "suggestedBufferMinutes": 30,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "hair-length",
          "hair-density",
          "color-history",
          "desired-style",
          "allergy-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "colorist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 11
      },
      {
        "key": "deep-care",
        "categoryKey": "care",
        "name": "Dubinska nega",
        "description": "Tretman nege koji se bira prema stanju kose.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "hair-length"
        ],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "colorist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 12
      },
      {
        "key": "formal-updo",
        "categoryKey": "special",
        "name": "Svečana frizura",
        "description": "Frizura za događaj uz dogovor o stilu i pripremi.",
        "defaultDurationMinutes": 90,
        "suggestedBufferMinutes": 15,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "hair-length",
          "hair-density",
          "desired-style"
        ],
        "compatibleStaffRoleKeys": [
          "hair-stylist",
          "senior-stylist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 13
      }
    ],
    "staffRoles": [
      {
        "key": "hair-stylist",
        "name": "Hair stylist",
        "description": "Šišanje, feniranje i stilizovanje.",
        "sortOrder": 1
      },
      {
        "key": "colorist",
        "name": "Kolorista",
        "description": "Bojenje, pramenovi i kompleksne tehnike.",
        "sortOrder": 2
      },
      {
        "key": "senior-stylist",
        "name": "Senior stylist",
        "description": "Napredne usluge i konsultacije.",
        "sortOrder": 3
      },
      {
        "key": "junior-stylist",
        "name": "Junior stylist",
        "description": "Odabrane usluge uz definisan nivo iskustva.",
        "sortOrder": 4
      },
      {
        "key": "salon-assistant",
        "name": "Salon asistent",
        "description": "Pranje, priprema i podrška timu.",
        "sortOrder": 5
      }
    ],
    "intakeQuestions": [
      {
        "key": "hair-length",
        "label": "Dužina kose",
        "kind": "select",
        "required": true,
        "options": [
          "kratka",
          "srednja",
          "duga",
          "veoma duga"
        ]
      },
      {
        "key": "hair-density",
        "label": "Gustina kose",
        "kind": "select",
        "required": false,
        "options": [
          "retka",
          "srednja",
          "gusta"
        ]
      },
      {
        "key": "color-history",
        "label": "Opišite prethodno bojenje ili hemijske tretmane.",
        "kind": "text",
        "required": false
      },
      {
        "key": "allergy-confirmation",
        "label": "Da li imate poznatu reakciju na boje ili preparate?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "desired-style",
        "label": "Opišite željeni rezultat ili stil.",
        "kind": "text",
        "required": false
      }
    ],
    "resources": [],
    "bookingDefaults": {
      "defaultBufferMinutes": 5
    },
    "policies": [
      {
        "key": "color-consultation",
        "title": "Konsultacije za bojenje",
        "body": "Kompleksne tehnike i korekcije boje mogu zahtevati konsultaciju, patch test i procenu cene.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "hair-price",
        "question": "Zašto cena zavisi od dužine?",
        "answer": "Utrošak vremena i materijala može zavisiti od dužine, gustine i željenog rezultata.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "hair-expertise",
        "kind": "benefits",
        "title": "Stručna nega kose",
        "body": "Od šišanja do kompleksnih kolor tehnika, usluga se prilagođava vašoj kosi.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — frizerski salon u {city}",
      "descriptionTemplate": "Šišanje, feniranje, bojenje i nega kose u salonu {businessName}, {city}.",
      "serviceTitleTemplate": "{serviceName} | {businessName} — {city}",
      "status": "draft"
    },
    "mediaSlots": [
      {
        "key": "hair-result",
        "label": "Rezultat na kosi",
        "aspectRatio": "4:5",
        "minimumWidth": 1080,
        "minimumHeight": 1350,
        "required": false,
        "altTextTemplate": "{serviceName} u salonu {businessName}"
      }
    ],
    "moduleSupport": {
      "aftercare": "optional",
      "before-after-gallery": "recommended",
      "bridal-services": "optional",
      "brow-lamination": "unsupported",
      "color-consultation": "recommended",
      "consent": "unsupported",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "unsupported",
      "kids-services": "optional",
      "lash-extensions": "unsupported",
      "loyalty": "optional",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "optional",
      "resource-booking": "unsupported",
      "service-packages": "optional",
      "walk-ins": "optional"
    }
  },
  {
    "id": "barber",
    "version": 1,
    "vertical": "barber",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Barber",
    "description": "Starter katalog za barber shop, grooming i usluge brade.",
    "categories": [
      {
        "key": "haircuts",
        "name": "Šišanje",
        "description": "Klasično, fade i mašinica.",
        "sortOrder": 1
      },
      {
        "key": "beard",
        "name": "Brada",
        "description": "Skraćivanje i oblikovanje brade.",
        "sortOrder": 2
      },
      {
        "key": "combos",
        "name": "Kombinovani tretmani",
        "description": "Kosa i brada u jednom terminu.",
        "sortOrder": 3
      },
      {
        "key": "shaving",
        "name": "Brijanje",
        "description": "Klasično brijanje i hot towel ritual.",
        "sortOrder": 4
      },
      {
        "key": "care",
        "name": "Nega",
        "description": "Pranje, stilizovanje i nega brade.",
        "sortOrder": 5
      }
    ],
    "services": [
      {
        "key": "classic-haircut",
        "categoryKey": "haircuts",
        "name": "Klasično šišanje",
        "description": "Šišanje makazama i mašinicom prema dogovoru.",
        "defaultDurationMinutes": 40,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "desired-style"
        ],
        "compatibleStaffRoleKeys": [
          "barber",
          "senior-barber",
          "master-barber",
          "apprentice"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "fade-haircut",
        "categoryKey": "haircuts",
        "name": "Fade šišanje",
        "description": "Fade tehnika sa završnim stilizovanjem.",
        "defaultDurationMinutes": 50,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "desired-style"
        ],
        "compatibleStaffRoleKeys": [
          "barber",
          "senior-barber",
          "master-barber"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "clipper-cut",
        "categoryKey": "haircuts",
        "name": "Mašinica — jedna dužina",
        "description": "Brzo šišanje mašinicom u jednoj dužini.",
        "defaultDurationMinutes": 25,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "barber",
          "apprentice"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "kids-haircut",
        "categoryKey": "haircuts",
        "name": "Dečje šišanje",
        "description": "Barber šišanje za uzrast koji salon potvrđuje.",
        "defaultDurationMinutes": 35,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "barber",
          "apprentice"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "beard-shape",
        "categoryKey": "beard",
        "name": "Oblikovanje brade",
        "description": "Skraćivanje, konture i završna nega.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "beard-length"
        ],
        "compatibleStaffRoleKeys": [
          "barber",
          "senior-barber",
          "master-barber"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "beard-trim",
        "categoryKey": "beard",
        "name": "Skraćivanje brade",
        "description": "Ujednačavanje dužine i osnovne konture.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "beard-length"
        ],
        "compatibleStaffRoleKeys": [
          "barber",
          "apprentice"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "hot-towel-shave",
        "categoryKey": "shaving",
        "name": "Hot towel shave",
        "description": "Klasično brijanje sa toplim peškirom.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity"
        ],
        "compatibleStaffRoleKeys": [
          "senior-barber",
          "master-barber"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "hair-beard-combo",
        "categoryKey": "combos",
        "name": "Hair & beard combo",
        "description": "Kompletno šišanje i oblikovanje brade.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "desired-style",
          "beard-length"
        ],
        "compatibleStaffRoleKeys": [
          "barber",
          "senior-barber",
          "master-barber"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "wash-style",
        "categoryKey": "care",
        "name": "Pranje i stilizovanje",
        "description": "Pranje kose i završno stilizovanje.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "barber",
          "apprentice"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "beard-care",
        "categoryKey": "care",
        "name": "Nega brade",
        "description": "Pranje, ulje ili balzam i stilizovanje.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "barber",
          "senior-barber"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 10
      }
    ],
    "staffRoles": [
      {
        "key": "barber",
        "name": "Barber",
        "description": "Šišanje, brada i grooming usluge.",
        "sortOrder": 1
      },
      {
        "key": "senior-barber",
        "name": "Senior barber",
        "description": "Napredne tehnike i konsultacije.",
        "sortOrder": 2
      },
      {
        "key": "master-barber",
        "name": "Master barber",
        "description": "Premium grooming i mentorska uloga.",
        "sortOrder": 3
      },
      {
        "key": "apprentice",
        "name": "Barber apprentice",
        "description": "Odabrane usluge uz definisan nivo iskustva.",
        "sortOrder": 4
      }
    ],
    "intakeQuestions": [
      {
        "key": "desired-style",
        "label": "Opišite željeni stil ili fade.",
        "kind": "text",
        "required": false
      },
      {
        "key": "beard-length",
        "label": "Trenutna dužina brade",
        "kind": "select",
        "required": false,
        "options": [
          "kratka",
          "srednja",
          "duga"
        ]
      },
      {
        "key": "skin-sensitivity",
        "label": "Da li je koža osetljiva na brijanje?",
        "kind": "boolean",
        "required": false
      }
    ],
    "resources": [],
    "bookingDefaults": {
      "minimumNoticeMinutes": 60,
      "maximumAdvanceDays": 30,
      "defaultBufferMinutes": 5
    },
    "policies": [
      {
        "key": "barber-lateness",
        "title": "Kašnjenje na kratke termine",
        "body": "Kod kratkih barber termina kašnjenje može zahtevati skraćenje usluge ili novi termin.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "fade-choice",
        "question": "Koji fade da izaberem?",
        "answer": "Barber može preporučiti visinu i prelaz prema obliku glave i željenom stilu.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "barber-craft",
        "kind": "benefits",
        "title": "Preciznost i zanat",
        "body": "Šišanje, brada i grooming sa jasnim terminima i pažnjom prema detalju.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — barber shop u {city}",
      "descriptionTemplate": "Barber šišanje, fade, brada i grooming u {businessName}, {city}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [],
    "moduleSupport": {
      "aftercare": "unsupported",
      "before-after-gallery": "optional",
      "bridal-services": "unsupported",
      "brow-lamination": "unsupported",
      "color-consultation": "unsupported",
      "consent": "unsupported",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "unsupported",
      "kids-services": "optional",
      "lash-extensions": "unsupported",
      "loyalty": "optional",
      "memberships": "optional",
      "mens-grooming": "recommended",
      "nail-art": "unsupported",
      "patch-test": "unsupported",
      "resource-booking": "unsupported",
      "service-packages": "optional",
      "walk-ins": "recommended"
    }
  },
  {
    "id": "nails",
    "version": 1,
    "vertical": "nails",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Nails",
    "description": "Starter katalog za nail studio, manikir, pedikir i nail art.",
    "categories": [
      {
        "key": "manicure",
        "name": "Manikir",
        "description": "Nega i oblikovanje prirodnih noktiju.",
        "sortOrder": 1
      },
      {
        "key": "gel-polish",
        "name": "Gel lak",
        "description": "Gel lak i ojačavanje prirodnih noktiju.",
        "sortOrder": 2
      },
      {
        "key": "extensions",
        "name": "Nadogradnja",
        "description": "Izlivanje ili nadogradnja prema dužini.",
        "sortOrder": 3
      },
      {
        "key": "correction",
        "name": "Korekcija",
        "description": "Korekcija postojećeg materijala.",
        "sortOrder": 4
      },
      {
        "key": "pedicure",
        "name": "Pedikir",
        "description": "Estetski pedikir i gel lak na nogama.",
        "sortOrder": 5
      },
      {
        "key": "nail-art",
        "name": "Nail art",
        "description": "French, dizajn i dekoracija.",
        "sortOrder": 6
      },
      {
        "key": "removal-repair",
        "name": "Skidanje i popravke",
        "description": "Skidanje materijala i pojedinačne popravke.",
        "sortOrder": 7
      }
    ],
    "services": [
      {
        "key": "classic-manicure",
        "categoryKey": "manicure",
        "name": "Klasičan manikir",
        "description": "Oblikovanje i osnovna nega prirodnih noktiju.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "nail-technician",
          "senior-nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "gel-polish",
        "categoryKey": "gel-polish",
        "name": "Gel lak",
        "description": "Priprema i gel lak na prirodnim noktima.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "existing-material"
        ],
        "compatibleStaffRoleKeys": [
          "nail-technician",
          "senior-nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "natural-overlay",
        "categoryKey": "gel-polish",
        "name": "Ojačavanje prirodnih noktiju",
        "description": "Ojačavanje baze prema stanju nokta.",
        "defaultDurationMinutes": 90,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "existing-material",
          "nail-length"
        ],
        "compatibleStaffRoleKeys": [
          "nail-technician",
          "senior-nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "nail-extensions",
        "categoryKey": "extensions",
        "name": "Nadogradnja noktiju",
        "description": "Nadogradnja prema dužini, obliku i tehnici.",
        "defaultDurationMinutes": 150,
        "suggestedBufferMinutes": 15,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "existing-material",
          "nail-length",
          "nail-shape"
        ],
        "compatibleStaffRoleKeys": [
          "senior-nail-technician",
          "nail-artist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "correction-short",
        "categoryKey": "correction",
        "name": "Korekcija kratkih noktiju",
        "description": "Korekcija postojećeg materijala na kraćoj dužini.",
        "defaultDurationMinutes": 120,
        "suggestedBufferMinutes": 15,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "existing-material"
        ],
        "compatibleStaffRoleKeys": [
          "nail-technician",
          "senior-nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "correction-long",
        "categoryKey": "correction",
        "name": "Korekcija dugih noktiju",
        "description": "Korekcija duge forme ili kompleksnijeg materijala.",
        "defaultDurationMinutes": 150,
        "suggestedBufferMinutes": 15,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "existing-material",
          "nail-length"
        ],
        "compatibleStaffRoleKeys": [
          "senior-nail-technician",
          "nail-artist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "material-removal",
        "categoryKey": "removal-repair",
        "name": "Skidanje materijala",
        "description": "Bezbedno skidanje gela ili drugog materijala.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "existing-material"
        ],
        "compatibleStaffRoleKeys": [
          "nail-technician",
          "senior-nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "aesthetic-pedicure",
        "categoryKey": "pedicure",
        "name": "Estetski pedikir",
        "description": "Estetska nega stopala i noktiju.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 15,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "pedicure-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "toe-gel-polish",
        "categoryKey": "pedicure",
        "name": "Gel lak na nogama",
        "description": "Priprema i gel lak na noktima stopala.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "existing-material"
        ],
        "compatibleStaffRoleKeys": [
          "pedicure-specialist",
          "nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "french",
        "categoryKey": "nail-art",
        "name": "French",
        "description": "French dizajn kao dodatak osnovnoj usluzi.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 5,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "nail-art-level"
        ],
        "compatibleStaffRoleKeys": [
          "nail-artist",
          "senior-nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 10
      },
      {
        "key": "nail-art",
        "categoryKey": "nail-art",
        "name": "Nail art",
        "description": "Dizajn prema broju noktiju i kompleksnosti.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 10,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "nail-art-level"
        ],
        "compatibleStaffRoleKeys": [
          "nail-artist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 11
      },
      {
        "key": "single-nail-repair",
        "categoryKey": "removal-repair",
        "name": "Popravka jednog nokta",
        "description": "Popravka pojedinačnog nokta kada je tehnički moguća.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 5,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "nail-technician",
          "senior-nail-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 12
      }
    ],
    "staffRoles": [
      {
        "key": "nail-technician",
        "name": "Nail tehničar",
        "description": "Manikir, gel lak i korekcije.",
        "sortOrder": 1
      },
      {
        "key": "senior-nail-technician",
        "name": "Senior nail tehničar",
        "description": "Napredne nadogradnje i korekcije.",
        "sortOrder": 2
      },
      {
        "key": "pedicure-specialist",
        "name": "Pedikir specijalista",
        "description": "Estetski tretmani stopala i noktiju.",
        "sortOrder": 3
      },
      {
        "key": "nail-artist",
        "name": "Nail artist",
        "description": "Dizajn, french i kompleksan nail art.",
        "sortOrder": 4
      }
    ],
    "intakeQuestions": [
      {
        "key": "existing-material",
        "label": "Da li trenutno imate materijal na noktima?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "nail-length",
        "label": "Željena dužina",
        "kind": "select",
        "required": false,
        "options": [
          "kratka",
          "srednja",
          "duga",
          "veoma duga"
        ]
      },
      {
        "key": "nail-shape",
        "label": "Željeni oblik",
        "kind": "select",
        "required": false,
        "options": [
          "oval",
          "badem",
          "kocka",
          "coffin",
          "drugo"
        ]
      },
      {
        "key": "nail-art-level",
        "label": "Nivo dizajna",
        "kind": "select",
        "required": false,
        "options": [
          "bez dizajna",
          "jednostavan",
          "srednji",
          "kompleksan"
        ]
      }
    ],
    "resources": [],
    "bookingDefaults": {
      "defaultBufferMinutes": 10
    },
    "policies": [
      {
        "key": "existing-material",
        "title": "Postojeći materijal",
        "body": "Salon može promeniti trajanje ili odbiti korekciju materijala drugog salona nakon pregleda.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "nail-art-time",
        "question": "Da li nail art produžava termin?",
        "answer": "Da. Trajanje zavisi od broja noktiju i kompleksnosti dizajna.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "nail-detail",
        "kind": "benefits",
        "title": "Detalji koji traju",
        "body": "Od urednog manikira do kompleksnog dizajna, izaberite uslugu prema svom stilu.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — nail studio u {city}",
      "descriptionTemplate": "Manikir, gel lak, nadogradnja, korekcija i pedikir u {businessName}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [
      {
        "key": "nail-result",
        "label": "Fotografija noktiju",
        "aspectRatio": "1:1",
        "minimumWidth": 1200,
        "minimumHeight": 1200,
        "required": false,
        "altTextTemplate": "{serviceName} u studiju {businessName}"
      }
    ],
    "moduleSupport": {
      "aftercare": "optional",
      "before-after-gallery": "recommended",
      "bridal-services": "unsupported",
      "brow-lamination": "unsupported",
      "color-consultation": "unsupported",
      "consent": "unsupported",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "unsupported",
      "kids-services": "unsupported",
      "lash-extensions": "unsupported",
      "loyalty": "optional",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "recommended",
      "patch-test": "unsupported",
      "resource-booking": "unsupported",
      "service-packages": "optional",
      "walk-ins": "unsupported"
    }
  },
  {
    "id": "lashes-brows",
    "version": 1,
    "vertical": "lashes-brows",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Lashes & Brows",
    "description": "Starter katalog za lash, brow i kombinovane studije.",
    "categories": [
      {
        "key": "lash-extensions",
        "name": "Ekstenzije trepavica",
        "description": "Klasične i volumenske tehnike.",
        "sortOrder": 1
      },
      {
        "key": "lash-correction",
        "name": "Korekcija i skidanje",
        "description": "Korekcije i removal postojećih ekstenzija.",
        "sortOrder": 2
      },
      {
        "key": "lash-natural",
        "name": "Prirodne trepavice",
        "description": "Lash lift i farbanje.",
        "sortOrder": 3
      },
      {
        "key": "brows",
        "name": "Obrve",
        "description": "Oblikovanje i bojenje obrva.",
        "sortOrder": 4
      },
      {
        "key": "brow-lamination",
        "name": "Laminacija obrva",
        "description": "Brow lift, laminacija i henna.",
        "sortOrder": 5
      }
    ],
    "services": [
      {
        "key": "classic-lashes",
        "categoryKey": "lash-extensions",
        "name": "Klasična nadogradnja 1:1",
        "description": "Početni set klasičnih ekstenzija.",
        "defaultDurationMinutes": 150,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "current-extensions",
          "contact-lenses",
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "volume-2d",
        "categoryKey": "lash-extensions",
        "name": "2D volumen",
        "description": "Početni set lakšeg volumena.",
        "defaultDurationMinutes": 165,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "current-extensions",
          "contact-lenses",
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "volume-3d",
        "categoryKey": "lash-extensions",
        "name": "3D volumen",
        "description": "Početni set izraženijeg volumena.",
        "defaultDurationMinutes": 180,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "current-extensions",
          "contact-lenses",
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "mega-volume",
        "categoryKey": "lash-extensions",
        "name": "Mega volumen",
        "description": "Kompleksan volumenski set uz konsultaciju.",
        "defaultDurationMinutes": 210,
        "suggestedBufferMinutes": 20,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "current-extensions",
          "contact-lenses",
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "lash-correction",
        "categoryKey": "lash-correction",
        "name": "Korekcija ekstenzija",
        "description": "Korekcija prema stanju i vremenu od poslednjeg termina.",
        "defaultDurationMinutes": 120,
        "suggestedBufferMinutes": 15,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "current-extensions",
          "last-lash-appointment"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "lash-removal",
        "categoryKey": "lash-correction",
        "name": "Skidanje ekstenzija",
        "description": "Profesionalno skidanje postojećih ekstenzija.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "current-extensions"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "lash-lift",
        "categoryKey": "lash-natural",
        "name": "Lash lift",
        "description": "Podizanje i oblikovanje prirodnih trepavica.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "contact-lenses",
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "lash-tint",
        "categoryKey": "lash-natural",
        "name": "Farbanje trepavica",
        "description": "Farbanje prirodnih trepavica uz proveru osetljivosti.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "lash-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "brow-shaping",
        "categoryKey": "brows",
        "name": "Oblikovanje obrva",
        "description": "Oblikovanje prema licu i željenom rezultatu.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [],
        "compatibleStaffRoleKeys": [
          "brow-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "brow-tint",
        "categoryKey": "brows",
        "name": "Farbanje obrva",
        "description": "Farbanje obrva uz odabir nijanse.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "brow-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 10
      },
      {
        "key": "brow-lift",
        "categoryKey": "brow-lamination",
        "name": "Brow lift / laminacija",
        "description": "Oblikovanje i fiksiranje dlačica obrva.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "brow-artist",
          "lash-brow-technician"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 11
      },
      {
        "key": "henna-brows",
        "categoryKey": "brow-lamination",
        "name": "Henna brows",
        "description": "Oblikovanje i bojenje kanom uz proveru osetljivosti.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "eye-sensitivity",
          "patch-test-confirmation"
        ],
        "compatibleStaffRoleKeys": [
          "brow-artist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 12
      }
    ],
    "staffRoles": [
      {
        "key": "lash-artist",
        "name": "Lash artist",
        "description": "Ekstenzije, korekcije i lash lift.",
        "sortOrder": 1
      },
      {
        "key": "brow-artist",
        "name": "Brow artist",
        "description": "Oblikovanje, bojenje i laminacija obrva.",
        "sortOrder": 2
      },
      {
        "key": "lash-brow-technician",
        "name": "Lash & brow tehničar",
        "description": "Kombinovane lash i brow usluge.",
        "sortOrder": 3
      }
    ],
    "intakeQuestions": [
      {
        "key": "current-extensions",
        "label": "Da li trenutno imate ekstenzije trepavica?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "last-lash-appointment",
        "label": "Kada je rađen poslednji lash tretman?",
        "kind": "text",
        "required": false
      },
      {
        "key": "contact-lenses",
        "label": "Da li nosite kontaktna sočiva?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "eye-sensitivity",
        "label": "Da li imate osetljivost očiju ili poznate alergije?",
        "kind": "text",
        "required": false
      },
      {
        "key": "patch-test-confirmation",
        "label": "Da li je patch test urađen kada ga salon zahteva?",
        "kind": "boolean",
        "required": false
      }
    ],
    "resources": [],
    "bookingDefaults": {
      "defaultBufferMinutes": 10
    },
    "policies": [
      {
        "key": "lash-correction",
        "title": "Korekcija ekstenzija",
        "body": "Korekcija zavisi od preostalog materijala, vremena od poslednjeg termina i tehnike.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "contact-lenses",
        "question": "Da li treba skinuti kontaktna sočiva?",
        "answer": "Salon potvrđuje pravilo pripreme za konkretnu lash uslugu.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "eye-focus",
        "kind": "benefits",
        "title": "Preciznost za pogled i obrve",
        "body": "Tretmani se biraju prema prirodnim trepavicama, obrvama i željenom efektu.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — lash & brow studio u {city}",
      "descriptionTemplate": "Ekstenzije, lash lift, oblikovanje i laminacija obrva u {businessName}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [
      {
        "key": "lash-brow-result",
        "label": "Lash ili brow rezultat",
        "aspectRatio": "4:5",
        "minimumWidth": 1080,
        "minimumHeight": 1350,
        "required": false,
        "altTextTemplate": "{serviceName} u studiju {businessName}"
      }
    ],
    "moduleSupport": {
      "aftercare": "recommended",
      "before-after-gallery": "recommended",
      "bridal-services": "unsupported",
      "brow-lamination": "recommended",
      "color-consultation": "unsupported",
      "consent": "unsupported",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "unsupported",
      "kids-services": "unsupported",
      "lash-extensions": "recommended",
      "loyalty": "optional",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "recommended",
      "resource-booking": "unsupported",
      "service-packages": "optional",
      "walk-ins": "unsupported"
    }
  },
  {
    "id": "massage",
    "version": 1,
    "vertical": "massage",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Massage",
    "description": "Starter katalog za masažne studije i terapeutske wellness usluge.",
    "categories": [
      {
        "key": "relax",
        "name": "Relax masaže",
        "description": "Masaže za opuštanje u više trajanja.",
        "sortOrder": 1
      },
      {
        "key": "therapeutic",
        "name": "Terapeutske masaže",
        "description": "Ciljane masaže u okviru kvalifikacija terapeuta.",
        "sortOrder": 2
      },
      {
        "key": "sports",
        "name": "Sportske masaže",
        "description": "Priprema i oporavak fizički aktivnih klijenata.",
        "sortOrder": 3
      },
      {
        "key": "partial",
        "name": "Parcijalne masaže",
        "description": "Leđa, vrat, stopala i druge regije.",
        "sortOrder": 4
      },
      {
        "key": "special",
        "name": "Specijalne masaže",
        "description": "Aromaterapija i tretmani za parove.",
        "sortOrder": 5
      }
    ],
    "services": [
      {
        "key": "relax-30",
        "categoryKey": "relax",
        "name": "Relax masaža 30 min",
        "description": "Kraći relax ili parcijalni tretman.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "pressure-preference"
        ],
        "compatibleStaffRoleKeys": [
          "massage-therapist",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "relax-60",
        "categoryKey": "relax",
        "name": "Relax masaža 60 min",
        "description": "Celovit tretman za opuštanje.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "pressure-preference"
        ],
        "compatibleStaffRoleKeys": [
          "massage-therapist",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "relax-90",
        "categoryKey": "relax",
        "name": "Relax masaža 90 min",
        "description": "Produženi relax tretman.",
        "defaultDurationMinutes": 90,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "pressure-preference"
        ],
        "compatibleStaffRoleKeys": [
          "massage-therapist",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "therapeutic-massage",
        "categoryKey": "therapeutic",
        "name": "Terapeutska masaža",
        "description": "Ciljani tretman koji izvodi odgovarajuće kvalifikovano osoblje.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "health-conditions",
          "injury",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "physiotherapist",
          "massage-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "sports-massage",
        "categoryKey": "sports",
        "name": "Sportska masaža",
        "description": "Masaža prilagođena fizičkoj aktivnosti i oporavku.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "health-conditions",
          "injury"
        ],
        "compatibleStaffRoleKeys": [
          "sports-massage-therapist",
          "physiotherapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "back-neck",
        "categoryKey": "partial",
        "name": "Masaža leđa i vrata",
        "description": "Parcijalni tretman leđa, vrata i ramenog pojasa.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "injury",
          "pressure-preference"
        ],
        "compatibleStaffRoleKeys": [
          "massage-therapist",
          "physiotherapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "foot-massage",
        "categoryKey": "partial",
        "name": "Masaža stopala",
        "description": "Relaksacioni tretman stopala.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions"
        ],
        "compatibleStaffRoleKeys": [
          "massage-therapist",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "aromatherapy",
        "categoryKey": "special",
        "name": "Aromaterapijska masaža",
        "description": "Relax tretman uz odabrana ulja i proveru osetljivosti.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "spa-therapist",
          "massage-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "couples-massage",
        "categoryKey": "special",
        "name": "Masaža za parove",
        "description": "Istovremeni tretman za dve osobe kada salon ima kapacitet.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 20,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "massage-therapist",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "couple-room"
        ],
        "tags": [],
        "sortOrder": 9
      }
    ],
    "staffRoles": [
      {
        "key": "massage-therapist",
        "name": "Masažni terapeut",
        "description": "Relax i klasične masaže.",
        "sortOrder": 1
      },
      {
        "key": "physiotherapist",
        "name": "Fizioterapeut",
        "description": "Terapeutske usluge u okviru kvalifikacija.",
        "sortOrder": 2
      },
      {
        "key": "sports-massage-therapist",
        "name": "Sportski masažni terapeut",
        "description": "Sportska masaža i oporavak.",
        "sortOrder": 3
      },
      {
        "key": "spa-therapist",
        "name": "Spa terapeut",
        "description": "Aromaterapija i wellness rituali.",
        "sortOrder": 4
      }
    ],
    "intakeQuestions": [
      {
        "key": "health-conditions",
        "label": "Da li imate zdravstveno stanje važno za masažu?",
        "kind": "text",
        "required": true
      },
      {
        "key": "injury",
        "label": "Da li imate aktuelnu povredu ili bolnu regiju?",
        "kind": "text",
        "required": false
      },
      {
        "key": "pregnancy",
        "label": "Da li ste trudni ili postoji mogućnost trudnoće?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "pressure-preference",
        "label": "Željeni intenzitet pritiska",
        "kind": "select",
        "required": false,
        "options": [
          "blag",
          "srednji",
          "jači"
        ]
      }
    ],
    "resources": [
      {
        "key": "treatment-room",
        "label": "Masažna soba",
        "kind": "room",
        "bookingCapability": "future_resource_gate",
        "description": "Prostorija potrebna za pojedinačni tretman."
      },
      {
        "key": "couple-room",
        "label": "Soba za parove",
        "kind": "capacity",
        "bookingCapability": "future_resource_gate",
        "description": "Prostor za dve osobe i dva terapeuta."
      }
    ],
    "bookingDefaults": {
      "defaultBufferMinutes": 15,
      "allowAnyStaff": false
    },
    "policies": [
      {
        "key": "massage-safety",
        "title": "Bezbednost masaže",
        "body": "Klijent prijavljuje relevantna stanja i povrede. Usluga se ne predstavlja kao dijagnoza ili lečenje.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "massage-choice",
        "question": "Koju masažu da izaberem?",
        "answer": "Za zdravstvene tegobe ili povredu prvo kontaktirajte odgovarajuće kvalifikovano osoblje.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "massage-calm",
        "kind": "benefits",
        "title": "Vreme za oporavak i relaksaciju",
        "body": "Izaberite trajanje i vrstu masaže prema svojim potrebama i preporuci terapeuta.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — masaža u {city}",
      "descriptionTemplate": "Relax, sportske i parcijalne masaže u {businessName}, {city}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [],
    "moduleSupport": {
      "aftercare": "recommended",
      "before-after-gallery": "unsupported",
      "bridal-services": "unsupported",
      "brow-lamination": "unsupported",
      "color-consultation": "unsupported",
      "consent": "optional",
      "couples-treatments": "optional",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "required",
      "kids-services": "unsupported",
      "lash-extensions": "unsupported",
      "loyalty": "unsupported",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "unsupported",
      "resource-booking": "recommended",
      "service-packages": "optional",
      "walk-ins": "unsupported"
    }
  },
  {
    "id": "spa",
    "version": 1,
    "vertical": "spa",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Spa",
    "description": "Starter katalog za spa centre, wellness rituale i day-spa pakete.",
    "categories": [
      {
        "key": "massage",
        "name": "Masaže",
        "description": "Relax i spa masaže.",
        "sortOrder": 1
      },
      {
        "key": "body",
        "name": "Tretmani tela",
        "description": "Piling, obloge i rituali tela.",
        "sortOrder": 2
      },
      {
        "key": "face",
        "name": "Tretmani lica",
        "description": "Nega lica prema stanju kože.",
        "sortOrder": 3
      },
      {
        "key": "thermal",
        "name": "Sauna i termalni sadržaji",
        "description": "Sauna, parno kupatilo i relax zona.",
        "sortOrder": 4
      },
      {
        "key": "couples",
        "name": "Paketi za parove",
        "description": "Zajednički tretmani i privatni rituali.",
        "sortOrder": 5
      },
      {
        "key": "day-spa",
        "name": "Day spa paketi",
        "description": "Kombinacije više sadržaja u jednom dolasku.",
        "sortOrder": 6
      }
    ],
    "services": [
      {
        "key": "spa-relax-massage",
        "categoryKey": "massage",
        "name": "Spa relax masaža",
        "description": "Relax masaža u spa ambijentu.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "spa-therapist",
          "massage-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "aroma-massage",
        "categoryKey": "massage",
        "name": "Aromaterapijska masaža",
        "description": "Masaža sa odabranim aromatičnim preparatima.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "spa-therapist",
          "massage-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "body-scrub",
        "categoryKey": "body",
        "name": "Piling tela",
        "description": "Piling i priprema kože prema odabranom protokolu.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 20,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "spa-therapist",
          "esthetician"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "body-wrap",
        "categoryKey": "body",
        "name": "Obloga tela",
        "description": "Tretman tela sa oblogom i vremenom odmora.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 20,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "spa-therapist",
          "esthetician"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "facial-ritual",
        "categoryKey": "face",
        "name": "Spa tretman lica",
        "description": "Tretman lica prema stanju kože i odabranom protokolu.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "esthetician",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "treatment-room"
        ],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "sauna-session",
        "categoryKey": "thermal",
        "name": "Sauna termin",
        "description": "Termin u sauni prema pravilima kapaciteta i bezbednosti.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "spa-host",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "sauna"
        ],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "steam-session",
        "categoryKey": "thermal",
        "name": "Parno kupatilo",
        "description": "Termin u parnom kupatilu prema kapacitetu.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "spa-host",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "steam-room"
        ],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "couples-ritual",
        "categoryKey": "couples",
        "name": "Spa ritual za parove",
        "description": "Kombinovani privatni tretman za dve osobe.",
        "defaultDurationMinutes": 120,
        "suggestedBufferMinutes": 30,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "allergies",
          "couple-booking"
        ],
        "compatibleStaffRoleKeys": [
          "spa-therapist",
          "massage-therapist"
        ],
        "requiredResourceKeys": [
          "couple-suite"
        ],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "day-spa-basic",
        "categoryKey": "day-spa",
        "name": "Day spa paket",
        "description": "Kombinacija tretmana i relax sadržaja koju salon potvrđuje.",
        "defaultDurationMinutes": 180,
        "suggestedBufferMinutes": 30,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "allergies"
        ],
        "compatibleStaffRoleKeys": [
          "spa-therapist",
          "spa-host"
        ],
        "requiredResourceKeys": [
          "treatment-room",
          "relax-zone"
        ],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "private-spa",
        "categoryKey": "day-spa",
        "name": "Privatni spa termin",
        "description": "Privatno korišćenje odabranih spa sadržaja prema kapacitetu.",
        "defaultDurationMinutes": 120,
        "suggestedBufferMinutes": 30,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "health-conditions",
          "pregnancy",
          "couple-booking"
        ],
        "compatibleStaffRoleKeys": [
          "spa-host",
          "spa-therapist"
        ],
        "requiredResourceKeys": [
          "sauna",
          "steam-room",
          "relax-zone"
        ],
        "tags": [],
        "sortOrder": 10
      }
    ],
    "staffRoles": [
      {
        "key": "spa-therapist",
        "name": "Spa terapeut",
        "description": "Wellness rituali, tretmani tela i masaže.",
        "sortOrder": 1
      },
      {
        "key": "massage-therapist",
        "name": "Masažni terapeut",
        "description": "Relax i specijalizovane masaže.",
        "sortOrder": 2
      },
      {
        "key": "esthetician",
        "name": "Kozmetičar / estetičar",
        "description": "Tretmani lica i tela u okviru kvalifikacija.",
        "sortOrder": 3
      },
      {
        "key": "spa-host",
        "name": "Spa host",
        "description": "Prijem, priprema i koordinacija prostora.",
        "sortOrder": 4
      }
    ],
    "intakeQuestions": [
      {
        "key": "health-conditions",
        "label": "Da li imate zdravstveno stanje važno za spa tretman?",
        "kind": "text",
        "required": true
      },
      {
        "key": "pregnancy",
        "label": "Da li ste trudni ili postoji mogućnost trudnoće?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "allergies",
        "label": "Da li imate alergije ili osetljivost na preparate?",
        "kind": "text",
        "required": false
      },
      {
        "key": "couple-booking",
        "label": "Da li rezervišete za dve osobe?",
        "kind": "boolean",
        "required": false
      }
    ],
    "resources": [
      {
        "key": "treatment-room",
        "label": "Tretmanska soba",
        "kind": "room",
        "bookingCapability": "future_resource_gate",
        "description": "Soba za pojedinačni tretman."
      },
      {
        "key": "couple-suite",
        "label": "Spa soba za parove",
        "kind": "capacity",
        "bookingCapability": "future_resource_gate",
        "description": "Soba ili apartman za dve osobe."
      },
      {
        "key": "sauna",
        "label": "Sauna",
        "kind": "capacity",
        "bookingCapability": "future_resource_gate",
        "description": "Sauna sa ograničenim kapacitetom."
      },
      {
        "key": "steam-room",
        "label": "Parno kupatilo",
        "kind": "capacity",
        "bookingCapability": "future_resource_gate",
        "description": "Parno kupatilo sa ograničenim kapacitetom."
      },
      {
        "key": "relax-zone",
        "label": "Relax zona",
        "kind": "capacity",
        "bookingCapability": "future_resource_gate",
        "description": "Zajednički prostor za odmor."
      }
    ],
    "bookingDefaults": {
      "minimumNoticeMinutes": 240,
      "defaultBufferMinutes": 20,
      "allowAnyStaff": false
    },
    "policies": [
      {
        "key": "spa-capacity",
        "title": "Kapacitet i korišćenje spa sadržaja",
        "body": "Dostupnost zavisi od prostorija, uređaja, kapaciteta i bezbednosnih pravila.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "spa-duration",
        "question": "Šta je uključeno u trajanje?",
        "answer": "Salon potvrđuje da li vreme uključuje presvlačenje, pripremu i korišćenje relax zone.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "spa-ritual",
        "kind": "benefits",
        "title": "Rituali za telo i um",
        "body": "Kombinujte tretmane, termalne sadržaje i odmor prema stvarnom kapacitetu centra.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — spa i wellness u {city}",
      "descriptionTemplate": "Spa rituali, masaže, sauna i day-spa paketi u {businessName}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [
      {
        "key": "spa-facility",
        "label": "Spa sadržaj",
        "aspectRatio": "16:9",
        "minimumWidth": 1600,
        "minimumHeight": 900,
        "required": false,
        "altTextTemplate": "{resourceName} u centru {businessName}"
      }
    ],
    "moduleSupport": {
      "aftercare": "recommended",
      "before-after-gallery": "unsupported",
      "bridal-services": "unsupported",
      "brow-lamination": "unsupported",
      "color-consultation": "unsupported",
      "consent": "recommended",
      "couples-treatments": "recommended",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "required",
      "kids-services": "unsupported",
      "lash-extensions": "unsupported",
      "loyalty": "unsupported",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "unsupported",
      "resource-booking": "required",
      "service-packages": "recommended",
      "walk-ins": "unsupported"
    }
  },
  {
    "id": "waxing",
    "version": 1,
    "vertical": "waxing",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Depilation / Waxing",
    "description": "Starter katalog za depilaciju voskom, šećernom pastom i pakete regija.",
    "categories": [
      {
        "key": "face",
        "name": "Lice",
        "description": "Nausnice, brada i celo lice.",
        "sortOrder": 1
      },
      {
        "key": "arms",
        "name": "Ruke",
        "description": "Pazuh, podlaktice i cele ruke.",
        "sortOrder": 2
      },
      {
        "key": "legs",
        "name": "Noge",
        "description": "Potkolenice i cele noge.",
        "sortOrder": 3
      },
      {
        "key": "intimate",
        "name": "Intimna regija",
        "description": "Bikini i brazilka prema ponudi salona.",
        "sortOrder": 4
      },
      {
        "key": "torso",
        "name": "Telo",
        "description": "Leđa, grudi i druge regije.",
        "sortOrder": 5
      },
      {
        "key": "packages",
        "name": "Paketi regija",
        "description": "Kombinacije više regija.",
        "sortOrder": 6
      }
    ],
    "services": [
      {
        "key": "upper-lip",
        "categoryKey": "face",
        "name": "Nausnice",
        "description": "Depilacija regije iznad usana.",
        "defaultDurationMinutes": 15,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "retinoid-use",
          "skin-sensitivity"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist",
          "beauty-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "chin",
        "categoryKey": "face",
        "name": "Brada",
        "description": "Depilacija regije brade.",
        "defaultDurationMinutes": 15,
        "suggestedBufferMinutes": 5,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "retinoid-use",
          "skin-sensitivity"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist",
          "beauty-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "full-face",
        "categoryKey": "face",
        "name": "Celo lice",
        "description": "Depilacija više regija lica prema dogovoru.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 10,
        "pricingMode": "from",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "retinoid-use",
          "skin-sensitivity"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist",
          "beauty-therapist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "underarms",
        "categoryKey": "arms",
        "name": "Pazuh",
        "description": "Depilacija pazuha.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "forearms",
        "categoryKey": "arms",
        "name": "Podlaktice",
        "description": "Depilacija podlaktica.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "full-arms",
        "categoryKey": "arms",
        "name": "Cele ruke",
        "description": "Depilacija celih ruku.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "lower-legs",
        "categoryKey": "legs",
        "name": "Potkolenice",
        "description": "Depilacija potkolenica.",
        "defaultDurationMinutes": 40,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "full-legs",
        "categoryKey": "legs",
        "name": "Cele noge",
        "description": "Depilacija celih nogu.",
        "defaultDurationMinutes": 75,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "bikini",
        "categoryKey": "intimate",
        "name": "Bikini",
        "description": "Depilacija bikini regije prema jasno definisanoj ponudi.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready",
          "treatment-area"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "brazilian",
        "categoryKey": "intimate",
        "name": "Brazilka",
        "description": "Intimna depilacija prema protokolu salona.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready",
          "treatment-area"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 10
      },
      {
        "key": "back",
        "categoryKey": "torso",
        "name": "Leđa",
        "description": "Depilacija leđa prema površini.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 15,
        "pricingMode": "by_area",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready",
          "treatment-area"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 11
      },
      {
        "key": "chest",
        "categoryKey": "torso",
        "name": "Grudi",
        "description": "Depilacija grudi prema površini.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 15,
        "pricingMode": "by_area",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-sensitivity",
          "hair-length-ready",
          "treatment-area"
        ],
        "compatibleStaffRoleKeys": [
          "waxing-specialist"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 12
      }
    ],
    "staffRoles": [
      {
        "key": "waxing-specialist",
        "name": "Depilacija specijalista",
        "description": "Depilacija voskom i šećernom pastom.",
        "sortOrder": 1
      },
      {
        "key": "beauty-therapist",
        "name": "Beauty terapeut",
        "description": "Odabrane depilacione i beauty usluge.",
        "sortOrder": 2
      }
    ],
    "intakeQuestions": [
      {
        "key": "retinoid-use",
        "label": "Da li koristite retinoide ili terapiju koja utiče na kožu?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "skin-sensitivity",
        "label": "Da li imate osetljivu, oštećenu ili iritiranu kožu?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "hair-length-ready",
        "label": "Da li je dužina dlačica odgovarajuća za tretman?",
        "kind": "boolean",
        "required": false
      },
      {
        "key": "treatment-area",
        "label": "Navedite regiju i posebne napomene.",
        "kind": "text",
        "required": false
      }
    ],
    "resources": [],
    "bookingDefaults": {
      "defaultBufferMinutes": 10
    },
    "policies": [
      {
        "key": "waxing-preparation",
        "title": "Priprema kože",
        "body": "Klijent prijavljuje retinoide, terapiju, iritaciju ili oštećenje kože pre tretmana.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "wax-length",
        "question": "Kolika treba da bude dužina dlačica?",
        "answer": "Salon potvrđuje preporučenu dužinu prema tehnici i regiji.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "waxing-care",
        "kind": "safety",
        "title": "Priprema i nega kože",
        "body": "Pročitajte pripremu i aftercare uputstva za izabranu regiju.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — depilacija u {city}",
      "descriptionTemplate": "Depilacija lica, ruku, nogu i tela u {businessName}, {city}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [],
    "moduleSupport": {
      "aftercare": "recommended",
      "before-after-gallery": "optional",
      "bridal-services": "unsupported",
      "brow-lamination": "unsupported",
      "color-consultation": "unsupported",
      "consent": "optional",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "unsupported",
      "gift-cards": "optional",
      "health-intake": "recommended",
      "kids-services": "unsupported",
      "lash-extensions": "unsupported",
      "loyalty": "unsupported",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "unsupported",
      "resource-booking": "unsupported",
      "service-packages": "optional",
      "walk-ins": "unsupported"
    }
  },
  {
    "id": "laser-hair-removal",
    "version": 1,
    "vertical": "laser-hair-removal",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Laser Hair Removal",
    "description": "Starter katalog za lasersku epilaciju sa konsultacijom, patch testom i safety granicama.",
    "categories": [
      {
        "key": "consultation",
        "name": "Konsultacije",
        "description": "Procena, patch test i plan tretmana.",
        "sortOrder": 1
      },
      {
        "key": "face",
        "name": "Lice",
        "description": "Nausnice, brada i druge regije lica.",
        "sortOrder": 2
      },
      {
        "key": "upper-body",
        "name": "Gornji deo tela",
        "description": "Pazuh, ruke, leđa i grudi.",
        "sortOrder": 3
      },
      {
        "key": "lower-body",
        "name": "Donji deo tela",
        "description": "Potkolenice, noge i druge regije.",
        "sortOrder": 4
      },
      {
        "key": "intimate",
        "name": "Intimna regija",
        "description": "Bikini i druge potvrđene regije.",
        "sortOrder": 5
      },
      {
        "key": "packages",
        "name": "Paketi i održavanje",
        "description": "Više sesija i maintenance tretmani.",
        "sortOrder": 6
      }
    ],
    "services": [
      {
        "key": "laser-consultation",
        "categoryKey": "consultation",
        "name": "Konsultacija za lasersku epilaciju",
        "description": "Procena kože, dlačica, kontraindikacija i plana tretmana.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "skin-type",
          "recent-tanning",
          "medications",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician",
          "medical-supervisor"
        ],
        "requiredResourceKeys": [
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "laser-patch-test",
        "categoryKey": "consultation",
        "name": "Patch test",
        "description": "Kontrolisana proba prema protokolu uređaja i salona.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "skin-type",
          "recent-tanning",
          "medications",
          "pregnancy"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "upper-lip",
        "categoryKey": "face",
        "name": "Nausnice",
        "description": "Laserski tretman male regije lica.",
        "defaultDurationMinutes": 15,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "chin",
        "categoryKey": "face",
        "name": "Brada",
        "description": "Laserski tretman regije brade.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "underarms",
        "categoryKey": "upper-body",
        "name": "Pazuh",
        "description": "Laserski tretman pazuha.",
        "defaultDurationMinutes": 20,
        "suggestedBufferMinutes": 15,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "full-arms",
        "categoryKey": "upper-body",
        "name": "Cele ruke",
        "description": "Laserski tretman celih ruku.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 6
      },
      {
        "key": "back",
        "categoryKey": "upper-body",
        "name": "Leđa",
        "description": "Laserski tretman leđa prema površini.",
        "defaultDurationMinutes": 60,
        "suggestedBufferMinutes": 20,
        "pricingMode": "by_area",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 7
      },
      {
        "key": "lower-legs",
        "categoryKey": "lower-body",
        "name": "Potkolenice",
        "description": "Laserski tretman potkolenica.",
        "defaultDurationMinutes": 45,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 8
      },
      {
        "key": "full-legs",
        "categoryKey": "lower-body",
        "name": "Cele noge",
        "description": "Laserski tretman celih nogu.",
        "defaultDurationMinutes": 90,
        "suggestedBufferMinutes": 25,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 9
      },
      {
        "key": "bikini",
        "categoryKey": "intimate",
        "name": "Bikini regija",
        "description": "Laserski tretman regije prema potvrđenoj ponudi.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 20,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 10
      },
      {
        "key": "multi-session-package",
        "categoryKey": "packages",
        "name": "Paket više sesija",
        "description": "Plan više tretmana bez automatskog billing-a ili salda.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 15,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": false,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "patch-test-confirmed",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 11
      },
      {
        "key": "maintenance",
        "categoryKey": "packages",
        "name": "Maintenance tretman",
        "description": "Održavanje nakon završenog plana tretmana.",
        "defaultDurationMinutes": 30,
        "suggestedBufferMinutes": 15,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "consultation-confirmed",
          "recent-tanning",
          "medications",
          "pregnancy",
          "session-number"
        ],
        "compatibleStaffRoleKeys": [
          "laser-technician",
          "senior-laser-technician"
        ],
        "requiredResourceKeys": [
          "laser-device",
          "laser-room"
        ],
        "tags": [],
        "sortOrder": 12
      }
    ],
    "staffRoles": [
      {
        "key": "laser-technician",
        "name": "Laser tehničar",
        "description": "Izvodi tretmane u okviru obuke i protokola.",
        "sortOrder": 1
      },
      {
        "key": "senior-laser-technician",
        "name": "Senior laser tehničar",
        "description": "Konsultacije, procena i napredni protokoli.",
        "sortOrder": 2
      },
      {
        "key": "medical-supervisor",
        "name": "Medicinski supervizor",
        "description": "Uloga samo kada je stvarno angažovana i zakonski relevantna.",
        "sortOrder": 3
      }
    ],
    "intakeQuestions": [
      {
        "key": "consultation-confirmed",
        "label": "Da li je konsultacija završena?",
        "kind": "boolean",
        "required": true
      },
      {
        "key": "patch-test-confirmed",
        "label": "Da li je patch test završen prema protokolu?",
        "kind": "boolean",
        "required": true
      },
      {
        "key": "skin-type",
        "label": "Tip kože prema protokolu salona",
        "kind": "select",
        "required": true,
        "options": [
          "I",
          "II",
          "III",
          "IV",
          "V",
          "VI",
          "nije određeno"
        ]
      },
      {
        "key": "recent-tanning",
        "label": "Da li ste se nedavno sunčali ili koristili solarijum?",
        "kind": "boolean",
        "required": true
      },
      {
        "key": "medications",
        "label": "Navedite terapiju ili preparate koji mogu izazvati fotosenzitivnost.",
        "kind": "text",
        "required": true
      },
      {
        "key": "pregnancy",
        "label": "Da li ste trudni ili postoji mogućnost trudnoće?",
        "kind": "boolean",
        "required": true
      },
      {
        "key": "session-number",
        "label": "Broj sesije ili prethodni tretmani",
        "kind": "text",
        "required": false
      }
    ],
    "resources": [
      {
        "key": "laser-device",
        "label": "Laser uređaj",
        "kind": "device",
        "bookingCapability": "future_resource_gate",
        "description": "Uređaj i raspoloživost moraju pripadati aktivnom salonu."
      },
      {
        "key": "laser-room",
        "label": "Laser tretmanska soba",
        "kind": "room",
        "bookingCapability": "future_resource_gate",
        "description": "Prostorija pripremljena za tretman."
      }
    ],
    "bookingDefaults": {
      "minimumNoticeMinutes": 240,
      "maximumAdvanceDays": 90,
      "defaultBufferMinutes": 15,
      "allowAnyStaff": false
    },
    "policies": [
      {
        "key": "laser-safety",
        "title": "Bezbednost laserskog tretmana",
        "body": "Konsultacija, patch test, terapija, sunčanje i kontraindikacije proveravaju se pre svake relevantne sesije.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "laser-results",
        "question": "Da li je rezultat trajan i zagarantovan?",
        "answer": "Starter sadržaj ne daje garanciju rezultata. Ishod i broj sesija zavise od individualnih faktora i protokola.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "laser-safety",
        "kind": "safety",
        "title": "Konsultacija pre tretmana",
        "body": "Bezbednost ima prednost: prijavite terapiju, sunčanje, trudnoću i relevantne promene pre termina.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — laserska epilacija u {city}",
      "descriptionTemplate": "Konsultacije i laserski tretmani odabranih regija u {businessName}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [
      {
        "key": "laser-device",
        "label": "Laser uređaj",
        "aspectRatio": "4:3",
        "minimumWidth": 1200,
        "minimumHeight": 900,
        "required": false,
        "altTextTemplate": "Uređaj u centru {businessName}"
      }
    ],
    "moduleSupport": {
      "aftercare": "required",
      "before-after-gallery": "recommended",
      "bridal-services": "unsupported",
      "brow-lamination": "unsupported",
      "color-consultation": "unsupported",
      "consent": "required",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "required",
      "gift-cards": "unsupported",
      "health-intake": "required",
      "kids-services": "unsupported",
      "lash-extensions": "unsupported",
      "loyalty": "unsupported",
      "memberships": "optional",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "required",
      "resource-booking": "required",
      "service-packages": "recommended",
      "walk-ins": "unsupported"
    }
  },
  {
    "id": "solarium",
    "version": 1,
    "vertical": "solarium",
    "defaultLocale": "sr-Latn",
    "supportedLocales": [
      "sr-Latn"
    ],
    "label": "Solarium",
    "description": "Starter katalog za solarijum studio sa device kapacitetom i safety sadržajem.",
    "categories": [
      {
        "key": "horizontal",
        "name": "Ležeći solarijum",
        "description": "Termini na ležećem uređaju.",
        "sortOrder": 1
      },
      {
        "key": "vertical",
        "name": "Stojeći solarijum",
        "description": "Termini na stojećem uređaju.",
        "sortOrder": 2
      },
      {
        "key": "minute-packages",
        "name": "Paketi minuta",
        "description": "Paketi bez automatskog salda u 01A.",
        "sortOrder": 3
      },
      {
        "key": "care",
        "name": "Nega i priprema",
        "description": "Informacije o zaštiti i pripremi.",
        "sortOrder": 4
      }
    ],
    "services": [
      {
        "key": "horizontal-5",
        "categoryKey": "horizontal",
        "name": "Ležeći solarijum — 5 min",
        "description": "Početni kratki termin koji studio potvrđuje prema proceni.",
        "defaultDurationMinutes": 5,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "age-confirmed",
          "skin-type",
          "medications",
          "recent-exposure",
          "eye-protection"
        ],
        "compatibleStaffRoleKeys": [
          "solarium-attendant",
          "studio-manager"
        ],
        "requiredResourceKeys": [
          "horizontal-device"
        ],
        "tags": [],
        "sortOrder": 1
      },
      {
        "key": "horizontal-8",
        "categoryKey": "horizontal",
        "name": "Ležeći solarijum — 8 min",
        "description": "Termin od 8 minuta uz potvrdu pravila izlaganja.",
        "defaultDurationMinutes": 8,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "age-confirmed",
          "skin-type",
          "medications",
          "recent-exposure",
          "eye-protection"
        ],
        "compatibleStaffRoleKeys": [
          "solarium-attendant",
          "studio-manager"
        ],
        "requiredResourceKeys": [
          "horizontal-device"
        ],
        "tags": [],
        "sortOrder": 2
      },
      {
        "key": "horizontal-10",
        "categoryKey": "horizontal",
        "name": "Ležeći solarijum — 10 min",
        "description": "Termin koji se aktivira samo ako studio potvrdi bezbednosna pravila.",
        "defaultDurationMinutes": 10,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "age-confirmed",
          "skin-type",
          "medications",
          "recent-exposure",
          "eye-protection"
        ],
        "compatibleStaffRoleKeys": [
          "solarium-attendant",
          "studio-manager"
        ],
        "requiredResourceKeys": [
          "horizontal-device"
        ],
        "tags": [],
        "sortOrder": 3
      },
      {
        "key": "vertical-5",
        "categoryKey": "vertical",
        "name": "Stojeći solarijum — 5 min",
        "description": "Kraći termin na stojećem uređaju.",
        "defaultDurationMinutes": 5,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "age-confirmed",
          "skin-type",
          "medications",
          "recent-exposure",
          "eye-protection"
        ],
        "compatibleStaffRoleKeys": [
          "solarium-attendant",
          "studio-manager"
        ],
        "requiredResourceKeys": [
          "vertical-device"
        ],
        "tags": [],
        "sortOrder": 4
      },
      {
        "key": "vertical-8",
        "categoryKey": "vertical",
        "name": "Stojeći solarijum — 8 min",
        "description": "Termin od 8 minuta uz procenu i potvrdu pravila.",
        "defaultDurationMinutes": 8,
        "suggestedBufferMinutes": 10,
        "pricingMode": "fixed",
        "priceStatus": "unset",
        "bookableByDefault": true,
        "requiresConsultation": false,
        "requiredQuestionKeys": [
          "age-confirmed",
          "skin-type",
          "medications",
          "recent-exposure",
          "eye-protection"
        ],
        "compatibleStaffRoleKeys": [
          "solarium-attendant",
          "studio-manager"
        ],
        "requiredResourceKeys": [
          "vertical-device"
        ],
        "tags": [],
        "sortOrder": 5
      },
      {
        "key": "minutes-package",
        "categoryKey": "minute-packages",
        "name": "Paket minuta",
        "description": "Preview-only paket; saldo, potrošnja i naplata nisu deo 01A.",
        "defaultDurationMinutes": 15,
        "suggestedBufferMinutes": 10,
        "pricingMode": "consultation",
        "priceStatus": "unset",
        "bookableByDefault": false,
        "requiresConsultation": true,
        "requiredQuestionKeys": [
          "age-confirmed",
          "skin-type",
          "medications",
          "recent-exposure"
        ],
        "compatibleStaffRoleKeys": [
          "studio-manager"
        ],
        "requiredResourceKeys": [],
        "tags": [],
        "sortOrder": 6
      }
    ],
    "staffRoles": [
      {
        "key": "solarium-attendant",
        "name": "Solarium operater",
        "description": "Prijem, uputstva i higijena uređaja.",
        "sortOrder": 1
      },
      {
        "key": "studio-manager",
        "name": "Studio manager",
        "description": "Nadzor pravila, paketa i rada studija.",
        "sortOrder": 2
      }
    ],
    "intakeQuestions": [
      {
        "key": "age-confirmed",
        "label": "Potvrđujem da ispunjavam starosne uslove salona i lokalnih pravila.",
        "kind": "boolean",
        "required": true
      },
      {
        "key": "skin-type",
        "label": "Tip kože ili procena osetljivosti",
        "kind": "select",
        "required": true,
        "options": [
          "veoma svetla",
          "svetla",
          "srednja",
          "tamna",
          "nije određeno"
        ]
      },
      {
        "key": "medications",
        "label": "Da li koristite terapiju ili preparate koji povećavaju fotosenzitivnost?",
        "kind": "text",
        "required": true
      },
      {
        "key": "recent-exposure",
        "label": "Kada ste poslednji put koristili solarijum ili se intenzivno sunčali?",
        "kind": "text",
        "required": true
      },
      {
        "key": "eye-protection",
        "label": "Potvrđujem korišćenje odgovarajuće zaštite za oči.",
        "kind": "boolean",
        "required": true
      }
    ],
    "resources": [
      {
        "key": "horizontal-device",
        "label": "Ležeći solarijum",
        "kind": "device",
        "bookingCapability": "future_resource_gate",
        "description": "Ležeći uređaj sa cleanup bufferom."
      },
      {
        "key": "vertical-device",
        "label": "Stojeći solarijum",
        "kind": "device",
        "bookingCapability": "future_resource_gate",
        "description": "Stojeći uređaj sa cleanup bufferom."
      }
    ],
    "bookingDefaults": {
      "minimumNoticeMinutes": 30,
      "maximumAdvanceDays": 30,
      "slotIntervalMinutes": 5,
      "defaultBufferMinutes": 10,
      "allowAnyStaff": false
    },
    "policies": [
      {
        "key": "solarium-exposure",
        "title": "Izlaganje i bezbednost",
        "body": "Studio potvrđuje starosna ograničenja, intervale, maksimalno izlaganje, zaštitu očiju i kontraindikacije.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "faq": [
      {
        "key": "solarium-time",
        "question": "Koliko minuta treba da rezervišem?",
        "answer": "Trajanje određuje studio prema tipu kože, prethodnom izlaganju, uređaju i pravilima bezbednosti.",
        "status": "draft",
        "requiresOwnerConfirmation": true
      }
    ],
    "contentSections": [
      {
        "key": "solarium-safety",
        "kind": "safety",
        "title": "Bezbednost pre izlaganja",
        "body": "Pre termina prijavite terapiju, fotosenzitivnost i prethodno UV izlaganje. Zaštita očiju je obavezna prema pravilima studija.",
        "tokens": [],
        "status": "draft"
      }
    ],
    "seo": {
      "titleTemplate": "{businessName} — solarijum u {city}",
      "descriptionTemplate": "Rezervacija solarijuma i paketa minuta u studiju {businessName}, {city}.",
      "serviceTitleTemplate": "{serviceName} | {businessName}",
      "status": "draft"
    },
    "mediaSlots": [
      {
        "key": "solarium-device",
        "label": "Solarijum uređaj",
        "aspectRatio": "4:3",
        "minimumWidth": 1200,
        "minimumHeight": 900,
        "required": true,
        "altTextTemplate": "{resourceName} u studiju {businessName}"
      }
    ],
    "moduleSupport": {
      "aftercare": "recommended",
      "before-after-gallery": "unsupported",
      "bridal-services": "unsupported",
      "brow-lamination": "unsupported",
      "color-consultation": "unsupported",
      "consent": "required",
      "couples-treatments": "unsupported",
      "deposits": "optional",
      "device-booking": "required",
      "gift-cards": "optional",
      "health-intake": "required",
      "kids-services": "unsupported",
      "lash-extensions": "unsupported",
      "loyalty": "optional",
      "memberships": "recommended",
      "mens-grooming": "unsupported",
      "nail-art": "unsupported",
      "patch-test": "unsupported",
      "resource-booking": "unsupported",
      "service-packages": "recommended",
      "walk-ins": "unsupported"
    }
  }
] satisfies
    StarterPackManifest[];
