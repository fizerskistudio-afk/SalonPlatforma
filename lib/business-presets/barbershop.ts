import {
  defineBusinessPreset,
  presetText,
} from "./types";

export const BARBERSHOP_PRESET =
  defineBusinessPreset({
    key: "barbershop",

    name: presetText(
      "Berbernica",
      "Barbershop",
      "Barbershop"
    ),

    description: presetText(
      "Preset za moderne i tradicionalne berbernice.",
      "Preset for modern and traditional barbershops.",
      "Preset für moderne und traditionelle Barbershops."
    ),

    recommendedTemplateKey:
      "hair-editorial",

    recommendedSections: [
      "hero",
      "services",
      "team",
      "gallery",
      "contact",
    ],

    terms: {
      businessSingular: presetText(
        "Berbernica",
        "Barbershop",
        "Barbershop"
      ),

      professionalSingular: presetText(
        "Berberin",
        "Barber",
        "Barber"
      ),

      professionalPlural: presetText(
        "Berberi",
        "Barbers",
        "Barber"
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
        "Book a visit",
        "Termin buchen"
      ),
    },

    bookingDefaults: {
      slotIntervalMinutes: 15,
      bookingWindowDays: 45,
      minimumAdvanceMinutes: 60,
      allowAnyEmployee: true,
      requireEmail: false,
      requirePhone: true,
      allowNotes: true,
      autoConfirm: false,
    },

    categories: [
      {
        slug: "haircuts",
        icon: "scissors",

        name: presetText(
          "Šišanje",
          "Haircuts",
          "Haarschnitte"
        ),

        description: presetText(
          "Klasično i moderno muško šišanje.",
          "Classic and modern men's haircuts.",
          "Klassische und moderne Herrenhaarschnitte."
        ),

        services: [
          {
            slug: "classic-haircut",

            name: presetText(
              "Klasično šišanje",
              "Classic haircut",
              "Klassischer Haarschnitt"
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
            slug: "skin-fade",

            name: presetText(
              "Skin fade",
              "Skin fade",
              "Skin Fade"
            ),

            durationMinutes: 45,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 2000,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 25,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 45,
              },
            },
          },

          {
            slug: "buzz-cut",

            name: presetText(
              "Šišanje mašinicom",
              "Buzz cut",
              "Maschinenschnitt"
            ),

            durationMinutes: 20,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 1000,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 15,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 25,
              },
            },
          },

          {
            slug: "kids-haircut",

            name: presetText(
              "Dečje šišanje",
              "Kids haircut",
              "Kinderhaarschnitt"
            ),

            durationMinutes: 30,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 1200,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 18,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 30,
              },
            },
          },
        ],
      },

      {
        slug: "beard-grooming",
        icon: "hand",

        name: presetText(
          "Brada i brijanje",
          "Beard and shaving",
          "Bart und Rasur"
        ),

        description: presetText(
          "Oblikovanje brade i tradicionalno brijanje.",
          "Beard shaping and traditional shaving.",
          "Bartformen und traditionelle Rasur."
        ),

        services: [
          {
            slug: "beard-trim",

            name: presetText(
              "Uređivanje brade",
              "Beard trim",
              "Bart trimmen"
            ),

            durationMinutes: 30,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 1000,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 15,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 25,
              },
            },
          },

          {
            slug: "hot-towel-shave",

            name: presetText(
              "Brijanje toplim peškirom",
              "Hot towel shave",
              "Rasur mit heißem Handtuch"
            ),

            durationMinutes: 45,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 1800,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 25,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 45,
              },
            },
          },

          {
            slug: "haircut-and-beard",

            name: presetText(
              "Šišanje i brada",
              "Haircut and beard",
              "Haarschnitt und Bart"
            ),

            durationMinutes: 60,

            prices: {
              RSD: {
                priceType: "fixed",
                priceFrom: 2500,
              },

              EUR: {
                priceType: "fixed",
                priceFrom: 35,
              },

              CHF: {
                priceType: "fixed",
                priceFrom: 60,
              },
            },
          },
        ],
      },
    ],
  });