import {
  CalendarDays,
  ChartNoAxesCombined,
  Globe2,
  MessagesSquare,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import {
  getCommercialOffer,
  getPrimaryCommercialOffer,
  getPublicCommercialOffers,
  type CommercialOffer,
  type CommercialOfferStatus,
} from "@/lib/product-strategy/commercial-offers";
import {
  PLATFORM_LEVELS,
  type PlatformLevelKey,
  type PlatformLevelStatus,
} from "@/lib/product-strategy/platform-levels";
import {
  getProductRolloutFeature,
  getPublicProductRoadmap,
  type ProductRolloutStatus,
} from "@/lib/product-strategy/rollout-registry";

export const capabilities = [
  {
    icon: Globe2,
    eyebrow: "Digitalni identitet",
    title: "Sajt koji izgleda kao vaš studio",
    copy: "Profesionalna tema, usluge, tim, radovi i kontakt na sopstvenom poddomenu — bez generičkog marketplace profila.",
  },
  {
    icon: CalendarDays,
    eyebrow: "Online zakazivanje",
    title: "Termin bez poziva i dopisivanja",
    copy: "Klijent bira uslugu, člana tima i slobodan termin. Salon zadržava kontrolu nad rasporedom i rezervacijama.",
  },
  {
    icon: UsersRound,
    eyebrow: "Tim i operacije",
    title: "Jedno mesto za svakodnevni rad",
    copy: "Owner, manager i staff površine povezuju rezervacije, smene, odsustva i operativne napomene.",
  },
  {
    icon: MessagesSquare,
    eyebrow: "Komunikacija",
    title: "Potvrde koje stižu automatski",
    copy: "Email potvrde i evidencija isporuke prate booking tok, dok rezervacija ostaje bezbedna i kada spoljni servis zastane.",
  },
  {
    icon: ChartNoAxesCombined,
    eyebrow: "Pregled poslovanja",
    title: "Jasna slika termina i statusa",
    copy: "Osnovni booking pokazatelji su deo platforme. Napredna growth analitika ostaje transparentno označena kao funkcija u razvoju.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Tenant sigurnost",
    title: "Podaci svakog studija ostaju odvojeni",
    copy: "Svaki salon ima svoj poslovni prostor, korisnike i javni sajt, uz server-side kontrole pristupa.",
  },
] as const;

const OFFER_STATUS_LABELS = {
  active: "AKTIVNA PONUDA",
  limited: "OGRANIČENA PONUDA",
  quote_only: "INDIVIDUALNA PROCENA",
  paused: "PAUZIRANO",
} as const satisfies
  Record<CommercialOfferStatus, string>;

const OFFER_CTA_LABELS = {
  launch_partner: "Prijavite studio",
  founding_partner: "Proverite Founding mesto",
  signature_custom: "Zatražite procenu",
} as const satisfies
  Record<CommercialOffer["key"], string>;

export const primaryOffer =
  getPrimaryCommercialOffer();

export const foundingPartnerOffer =
  getCommercialOffer("founding_partner");

export const commercialOffers =
  getPublicCommercialOffers().map(
    (offer) => ({
      ...offer,
      statusLabel:
        OFFER_STATUS_LABELS[offer.status],
      ctaLabel:
        OFFER_CTA_LABELS[offer.key],
      featureLabels:
        offer.includedLiveFeatures
          .slice(0, 6)
          .map(
            (featureKey) =>
              getProductRolloutFeature(
                featureKey
              ).label
          ),
      managedBetaCount:
        offer.managedBetaOptions.length,
    })
  );

const PUBLIC_ROLLOUT_GROUPS = [
  {
    status: "live",
    label: "LIVE",
    copy: "Funkcije koje su deo trenutnog Ordum obećanja i mogu da budu uključene u dogovoreni produkcioni setup.",
  },
  {
    status: "beta",
    label: "BETA",
    copy: "Postojeće funkcije koje se uključuju kontrolisano, nakon tehničke provere i uz našu podršku.",
  },
  {
    status: "coming_soon",
    label: "COMING SOON",
    copy: "Javno planirani pravci koji još nisu deo aktivne prodajne garancije ili trenutne cene.",
  },
] as const satisfies
  readonly {
    status: ProductRolloutStatus;
    label: string;
    copy: string;
  }[];

const publicRoadmap =
  getPublicProductRoadmap();

export const rolloutGroups =
  PUBLIC_ROLLOUT_GROUPS.map(
    (group) => {
      const features =
        publicRoadmap.filter(
          (feature) =>
            feature.status ===
            group.status
        );

      return {
        ...group,
        features:
          features
            .slice(0, 6)
            .map(
              (feature) => ({
                key: feature.key,
                label: feature.label,
              })
            ),
        remainingCount:
          Math.max(
            0,
            features.length - 6
          ),
      };
    }
  );

const LEVEL_STATUS_LABELS = {
  unlocked: "OTKLJUČAN",
  active: "AKTIVAN RAZVOJ",
  locked: "ZAKLJUČAN",
} as const satisfies
  Record<PlatformLevelStatus, string>;

const LEVEL_PUBLIC_COPY = {
  digital_salon:
    "Sajt, booking, administracija i vođeno postavljanje za aktivan beauty ili wellness studio.",
  growth_platform:
    "Jasna ponuda, lead tok, sadržajni kanal i merljiva veza između Ordum platforme i tenant studija.",
  local_discovery:
    "Grad, canonical usluga i realna dostupnost više eligible studija bez drugog booking sistema.",
  salon_operations:
    "Lager, nabavke, oprema i operativni moduli tek kada realni saloni potvrde prioritet.",
  business_os:
    "Fiskalni, payment, računovodstveni i customer lifecycle adapteri sa audit granicama.",
  regional_network:
    "Isto jezgro prilagođeno drugim tržištima, jezicima, valutama i lokalnim providerima.",
} as const satisfies
  Record<PlatformLevelKey, string>;

export const platformJourney =
  PLATFORM_LEVELS.map(
    (level) => ({
      ...level,
      statusLabel:
        LEVEL_STATUS_LABELS[
          level.status
        ],
      publicCopy:
        LEVEL_PUBLIC_COPY[
          level.key
        ],
    })
  );

export const faqs = [
  {
    question:
      "Da li klijenti moraju da instaliraju aplikaciju?",
    answer:
      "Ne. Javni sajt i zakazivanje rade direktno u browseru na telefonu ili računaru.",
  },
  {
    question:
      "Šta tačno znače LIVE, BETA i COMING SOON?",
    answer:
      "LIVE je deo trenutnog produkcionog obećanja. BETA postoji, ali se uključuje tek nakon naše provere. COMING SOON je javni pravac razvoja i još nije uključen u prodajnu garanciju.",
  },
  {
    question:
      "Kako funkcioniše Founding Partner ponuda?",
    answer:
      `Ponuda je ograničena na prvih ${foundingPartnerOffer.clientLimit ?? 5} prihvaćenih salona. Cena je zaključana ${foundingPartnerOffer.priceLockMonths ?? 12} meseci, a partner daje strukturiran feedback iz realne upotrebe.`,
  },
  {
    question:
      "Šta uključuje Launch Partner cena?",
    answer:
      `${primaryOffer.name} uključuje vođeno početno postavljanje od ${formatRsd(primaryOffer.setupPriceRsd)} RSD i platformu sa podrškom od ${formatRsd(primaryOffer.monthlyPriceRsd)} RSD mesečno, za do ${primaryOffer.maxBookableStaff ?? 5} bookable članova tima.`,
  },
  {
    question:
      "Da li unosimo postojeće usluge i tim?",
    answer:
      "Da. Početno podešavanje obuhvata strukturu usluga, zaposlene, radno vreme, osnovni sadržaj i izabrani vizuelni pravac u okviru dogovorene ponude.",
  },
  {
    question:
      "Mogu li da vidim kako platforma izgleda pre odluke?",
    answer:
      "Da. Možete otvoriti aktivne demo studije ispod, a zatim zakazati kratku prezentaciju prilagođenu vašem tipu poslovanja.",
  },
  {
    question:
      "Da li svaki studio dobija isti dizajn?",
    answer:
      "Ne. Platforma deli bezbedne booking i administrativne granice, dok javni renderer bira modularni theme pack prema identitetu i vertikali studija.",
  },
] as const;

export function formatRsd(
  value: number | null
): string {
  return value === null
    ? "Po proceni"
    : new Intl.NumberFormat(
        "sr-Latn-RS"
      ).format(value);
}
