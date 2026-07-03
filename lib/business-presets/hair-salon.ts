import {
  defineBusinessPreset,
  presetText,
} from "./types";

export const HAIR_SALON_PRESET =
  defineBusinessPreset({
    key: "hair-salon",

    name: presetText(
      "Frizerski salon",
      "Hair salon",
      "Friseursalon"
    ),

    description: presetText(
      "Preset za ženske, muške i mešovite frizerske salone.",
      "Preset for women's, men's and mixed hair salons.",
      "Preset für Damen-, Herren- und gemischte Friseursalons."
    ),

    recommendedTemplateKey:
      "hair-luxury",

    recommendedSections: [
      "hero",
      "services",
      "team",
      "gallery",
      "reviews",
      "contact",
    ],

    terms: {
      businessSingular: presetText(
        "Frizerski salon",
        "Hair salon",
        "Friseursalon"
      ),

      professionalSingular: presetText(
        "Frizer",
        "Hair stylist",
        "Stylist"
      ),

      professionalPlural: presetText(
        "Frizeri",
        "Hair stylists",
        "Stylisten"
      ),

      serviceSingular: presetText(
        "Usluga",
        "Service",
        "Leistung"
      ),

      servicePlural: presetText(
        "Usluge",
        "Services",
        "Leistungen"
      ),

      bookingCta: presetText(
        "Zakaži termin",
        "Book an appointment",
        "Termin buchen"
      ),
    },

    bookingDefaults: {
      slotIntervalMinutes: 30,
      bookingWindowDays: 60,
      minimumAdvanceMinutes: 120,
      allowAnyEmployee: true,
      requireEmail: false,
      requirePhone: true,
      allowNotes: true,
      autoConfirm: false,
    },

    categories: [
      {
        slug: "haircuts-styling",
        icon: "scissors",

        name: presetText(
          "Šišanje i stilizovanje",
          "Haircuts and styling",
          "Haarschnitte und Styling"
        ),

        description: presetText(
          "Šišanje, feniranje i stilizovanje kose.",
          "Haircuts, blow-drying and hair styling.",
          "Haarschnitte, Föhnen und Haarstyling."
        ),

        services: [
          {
            slug: "womens-haircut",

            name: presetText(
              "Žensko šišanje",
              "Women's haircut",
              "Damenhaarschnitt"
            ),

            durationMinutes: 60,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 2500,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 30,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 55,
              },
            },
          },

          {
            slug: "mens-haircut",

            name: presetText(
              "Muško šišanje",
              "Men's haircut",
              "Herrenhaarschnitt"
            ),

            durationMinutes: 30,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 1500,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 20,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 35,
              },
            },
          },

          {
            slug: "blow-dry",

            name: presetText(
              "Feniranje",
              "Blow-dry",
              "Föhnen"
            ),

            durationMinutes: 45,

            prices: {
              RSD: {
                priceType: "from",
                priceFrom: 1800,
              },

              EUR: {
                priceType: "from",
                priceFrom: 25,
              },

              CHF: {
                priceType: "from",
                priceFrom: 40,
              },
            },
          },
        ],
      },

      {
        slug: "hair-color",
        icon: "palette",

        name: presetText(
          "Farbanje",
          "Hair colour",
          "Haarfarbe"
        ),

        description: presetText(
          "Farbanje korena, cele dužine i pramenovi.",
          "Root colour, full colour and highlights.",
          "Ansatzfarbe, Komplettfärbung und Strähnen."
        ),

        services: [
          {
            slug: "root-color",

            name: presetText(
              "Farbanje korena",
              "Root colour",
              "Ansatzfarbe"
            ),

            durationMinutes: 90,

            prices: {
              RSD: {
                priceType: "from",
                priceFrom: 3500,
              },

              EUR: {
                priceType: "from",
                priceFrom: 45,
              },

              CHF: {
                priceType: "from",
                priceFrom: 75,
              },
            },
          },

          {
            slug: "full-color",

            name: presetText(
              "Farbanje cele dužine",
              "Full hair colour",
              "Komplettfärbung"
            ),

            durationMinutes: 120,

            prices: {
              RSD: {
                priceType: "from",
                priceFrom: 5000,
              },

              EUR: {
                priceType: "from",
                priceFrom: 65,
              },

              CHF: {
                priceType: "from",
                priceFrom: 105,
              },
            },
          },

          {
            slug: "highlights",

            name: presetText(
              "Pramenovi",
              "Highlights",
              "Strähnen"
            ),

            durationMinutes: 180,

            prices: {
              RSD: {
                priceType: "from",
                priceFrom: 7000,
              },

              EUR: {
                priceType: "from",
                priceFrom: 90,
              },

              CHF: {
                priceType: "from",
                priceFrom: 145,
              },
            },
          },
        ],
      },

      {
        slug: "hair-treatments",
        icon: "sparkles",

        name: presetText(
          "Nega kose",
          "Hair treatments",
          "Haarpflege"
        ),

        description: presetText(
          "Tretmani za negu i obnovu kose.",
          "Treatments for hair care and repair.",
          "Behandlungen für Haarpflege und Reparatur."
        ),

        services: [
          {
            slug: "repair-treatment",

            name: presetText(
              "Tretman za obnovu kose",
              "Hair repair treatment",
              "Haaraufbau-Behandlung"
            ),

            durationMinutes: 45,

            prices: {
              RSD: {
                priceType: "from",
                priceFrom: 2500,
              },

              EUR: {
                priceType: "from",
                priceFrom: 30,
              },

              CHF: {
                priceType: "from",
                priceFrom: 50,
              },
            },
          },
        ],
      },
    ],
  });