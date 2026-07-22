import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  commercialOffers,
  foundingPartnerOffer,
  platformJourney,
  primaryOffer,
  rolloutGroups,
} from "../../components/marketing/ordum/ordum-content";

describe(
  "Ordum landing product truth",
  () => {
    it(
      "uses commercial offers instead of technical package presentation",
      () => {
        expect(
          commercialOffers.map(
            (offer) => offer.key
          )
        ).toEqual([
          "launch_partner",
          "founding_partner",
          "signature_custom",
        ]);

        expect(
          primaryOffer.key
        ).toBe(
          "launch_partner"
        );

        expect(
          foundingPartnerOffer.status
        ).toBe(
          "limited"
        );
      }
    );

    it(
      "publishes only live, beta and coming-soon groups",
      () => {
        expect(
          rolloutGroups.map(
            (group) => group.status
          )
        ).toEqual([
          "live",
          "beta",
          "coming_soon",
        ]);

        const comingSoon =
          rolloutGroups.find(
            (group) =>
              group.status ===
              "coming_soon"
          );

        expect(
          comingSoon?.features.map(
            (feature) =>
              feature.key
          )
        ).toContain(
          "growth.local_discovery"
        );
      }
    );

    it(
      "renders the six registry-backed platform levels",
      () => {
        expect(
          platformJourney
        ).toHaveLength(6);

        expect(
          platformJourney.map(
            (level) =>
              level.status
          )
        ).toEqual([
          "unlocked",
          "active",
          "locked",
          "locked",
          "locked",
          "locked",
        ]);
      }
    );

    it(
      "keeps the new offers anchor and the legacy packages deep link",
      () => {
        const landingSource =
          readFileSync(
            join(
              process.cwd(),
              "components/marketing/ordum/OrdumLandingPage.tsx"
            ),
            "utf8"
          );

        expect(
          landingSource
        ).toContain(
          'id="ponude"'
        );

        expect(
          landingSource
        ).toContain(
          'id="paketi"'
        );
      }
    );

    it(
      "uses Heritage Barber and Lumière as the landing showcase pair",
      () => {
        const pageSource =
          readFileSync(
            join(
              process.cwd(),
              "app/page.tsx"
            ),
            "utf8"
          );

        const landingSource =
          readFileSync(
            join(
              process.cwd(),
              "components/marketing/ordum/OrdumLandingPage.tsx"
            ),
            "utf8"
          );

        expect(
          pageSource
        ).toContain(
          'buildTenantPublicUrl("lumiere-studio")'
        );

        expect(
          pageSource
        ).not.toContain(
          'buildTenantPublicUrl("atelier-luna-nails")'
        );

        expect(
          landingSource
        ).toContain(
          'title="Lumière Studio"'
        );

        expect(
          landingSource
        ).not.toContain(
          'title="Atelier Luna Nails"'
        );
      }
    );

    it(
      "keeps public offer data separate from technical entitlement names",
      () => {
        expect(
          commercialOffers.every(
            (offer) =>
              ![
                "booking_page",
                "digital_studio",
                "operations_pro",
                "signature",
              ].includes(
                offer.name
              )
          )
        ).toBe(true);

        expect(
          commercialOffers.map(
            (offer) =>
              offer.statusLabel
          )
        ).toEqual([
          "AKTIVNA PONUDA",
          "OGRANIČENA PONUDA",
          "INDIVIDUALNA PROCENA",
        ]);
      }
    );
  }
);
