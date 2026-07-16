import {
  STARTER_PACK_MODULE_IDS,
  type StarterPackModuleDefinition,
  type StarterPackModuleId,
  type StarterPackModuleSupport,
} from "@/lib/content-starter-packs/domain";

export const STARTER_PACK_MODULES:
  Record<
    StarterPackModuleId,
    StarterPackModuleDefinition
  > = {
  aftercare: {
    id: "aftercare",
    label:
      "Uputstva posle tretmana",
    description:
      "Draft aftercare sadržaj za usluge koje zahtevaju posebnu negu posle termina.",
    capabilities: [
      "service aftercare notes",
      "customer preparation copy",
    ],
    activationNotes: [
      "Vlasnik potvrđuje sadržaj pre objave.",
    ],
    requiresFutureCapability:
      false,
  },
  "before-after-gallery": {
    id:
      "before-after-gallery",
    label:
      "Pre i posle galerija",
    description:
      "Media slotovi i saglasnost za prikaz rezultata tretmana.",
    capabilities: [
      "before/after media slots",
      "photo consent reminder",
    ],
    activationNotes: [
      "Ne koristi izmišljene fotografije.",
    ],
    requiresFutureCapability:
      false,
  },
  "bridal-services": {
    id:
      "bridal-services",
    label:
      "Svadbene usluge",
    description:
      "Konsultacije, probni termin i paket za mladu ili grupu.",
    capabilities: [
      "bridal consultation",
      "group preparation notes",
    ],
    activationNotes: [
      "Konačno trajanje i depozit potvrđuje salon.",
    ],
    requiresFutureCapability:
      false,
  },
  "brow-lamination": {
    id:
      "brow-lamination",
    label:
      "Laminacija obrva",
    description:
      "Specijalizovani brow tretmani, priprema i aftercare sadržaj.",
    capabilities: [
      "brow treatment intake",
      "brow aftercare",
    ],
    activationNotes: [
      "Patch test pravilo zavisi od proizvoda i lokalne prakse.",
    ],
    requiresFutureCapability:
      false,
  },
  "color-consultation": {
    id:
      "color-consultation",
    label:
      "Konsultacije za bojenje",
    description:
      "Istorija bojenja, stanje kose i obavezna procena pre kompleksnih tehnika.",
    capabilities: [
      "color history intake",
      "consultation-first pricing",
    ],
    activationNotes: [
      "Ne obećava tačnu boju ili rezultat bez konsultacije.",
    ],
    requiresFutureCapability:
      false,
  },
  consent: {
    id: "consent",
    label:
      "Saglasnost klijenta",
    description:
      "Draft saglasnost za tretmane sa posebnim bezbednosnim zahtevima.",
    capabilities: [
      "consent draft",
      "confirmation checkpoint",
    ],
    activationNotes: [
      "Nije zamena za pravni ili medicinski savet.",
    ],
    requiresFutureCapability:
      false,
  },
  "couples-treatments": {
    id:
      "couples-treatments",
    label:
      "Tretmani za parove",
    description:
      "Usluge koje zahtevaju dve osobe, terapeute ili zajedničku prostoriju.",
    capabilities: [
      "couple capacity",
      "paired staff note",
    ],
    activationNotes: [
      "Pravi multi-resource booking se aktivira zasebno.",
    ],
    requiresFutureCapability:
      true,
  },
  deposits: {
    id: "deposits",
    label:
      "Depoziti",
    description:
      "Pravila depozita za duge, skupe ili grupne termine.",
    capabilities: [
      "deposit policy draft",
      "deposit-required tag",
    ],
    activationNotes: [
      "Naplata depozita nije deo starter-pack apply-a.",
    ],
    requiresFutureCapability:
      true,
  },
  "device-booking": {
    id:
      "device-booking",
    label:
      "Rezervacija uređaja",
    description:
      "Modeluje tretmane čiji kapacitet primarno zavisi od uređaja.",
    capabilities: [
      "device resource keys",
      "cleanup buffers",
    ],
    activationNotes: [
      "Zahteva poseban resource-booking milestone.",
    ],
    requiresFutureCapability:
      true,
  },
  "gift-cards": {
    id:
      "gift-cards",
    label:
      "Poklon vaučeri",
    description:
      "Sadržaj i pozicije za buduću prodaju poklon vaučera.",
    capabilities: [
      "gift card content",
      "gift CTA",
    ],
    activationNotes: [
      "Plaćanje i saldo nisu deo 01A.",
    ],
    requiresFutureCapability:
      true,
  },
  "health-intake": {
    id:
      "health-intake",
    label:
      "Zdravstveni upitnik",
    description:
      "Minimalna pitanja o kontraindikacijama bez dijagnostike.",
    capabilities: [
      "contraindication questions",
      "safety notice",
    ],
    activationNotes: [
      "Odgovore pregleda kvalifikovano osoblje.",
    ],
    requiresFutureCapability:
      false,
  },
  "kids-services": {
    id:
      "kids-services",
    label:
      "Dečje usluge",
    description:
      "Usluge i sadržaj prilagođen terminima za decu.",
    capabilities: [
      "child service category",
      "guardian note",
    ],
    activationNotes: [
      "Uzrast i pravila potvrđuje salon.",
    ],
    requiresFutureCapability:
      false,
  },
  "lash-extensions": {
    id:
      "lash-extensions",
    label:
      "Ekstenzije trepavica",
    description:
      "Početni, korekcioni i removal tok za ekstenzije.",
    capabilities: [
      "existing extension intake",
      "correction timing",
    ],
    activationNotes: [
      "Korekciju i removal pravila potvrđuje lash artist.",
    ],
    requiresFutureCapability:
      false,
  },
  loyalty: {
    id: "loyalty",
    label:
      "Loyalty program",
    description:
      "Pozicije i copy za budući program lojalnosti.",
    capabilities: [
      "loyalty CTA",
      "member benefit draft",
    ],
    activationNotes: [
      "Poeni i saldo nisu deo 01A.",
    ],
    requiresFutureCapability:
      true,
  },
  memberships: {
    id:
      "memberships",
    label:
      "Članarine",
    description:
      "Ponavljajući paketi i članski benefiti kao buduća mogućnost.",
    capabilities: [
      "membership copy",
      "recurring service notes",
    ],
    activationNotes: [
      "Billing nije deo 01A.",
    ],
    requiresFutureCapability:
      true,
  },
  "mens-grooming": {
    id:
      "mens-grooming",
    label:
      "Muški grooming",
    description:
      "Kombinovane usluge kose, brade i nege.",
    capabilities: [
      "hair and beard combo",
      "grooming content",
    ],
    activationNotes: [
      "Usluge se biraju prema stvarnoj ponudi.",
    ],
    requiresFutureCapability:
      false,
  },
  "nail-art": {
    id:
      "nail-art",
    label:
      "Nail art",
    description:
      "Kompleksnost dizajna, broj noktiju i dodatno trajanje.",
    capabilities: [
      "design complexity intake",
      "per-finger notes",
    ],
    activationNotes: [
      "Cena ostaje unset do potvrde salona.",
    ],
    requiresFutureCapability:
      false,
  },
  "patch-test": {
    id:
      "patch-test",
    label:
      "Patch test",
    description:
      "Evidentira obaveznu ili preporučenu proveru reakcije pre tretmana.",
    capabilities: [
      "patch test confirmation",
      "test timing note",
    ],
    activationNotes: [
      "Pravilo potvrđuje kvalifikovano osoblje.",
    ],
    requiresFutureCapability:
      false,
  },
  "resource-booking": {
    id:
      "resource-booking",
    label:
      "Rezervacija prostorija i resursa",
    description:
      "Modeluje sobu, opremu ili kapacitet pored zaposlenog.",
    capabilities: [
      "room resources",
      "equipment capacity",
    ],
    activationNotes: [
      "Runtime resource allocation nije deo 01A.",
    ],
    requiresFutureCapability:
      true,
  },
  "service-packages": {
    id:
      "service-packages",
    label:
      "Paketi usluga",
    description:
      "Više dolazaka ili kombinacija usluga bez automatskog billing-a.",
    capabilities: [
      "package content",
      "session count notes",
    ],
    activationNotes: [
      "Saldo i potrošnja paketa nisu deo 01A.",
    ],
    requiresFutureCapability:
      true,
  },
  "walk-ins": {
    id:
      "walk-ins",
    label:
      "Walk-in režim",
    description:
      "Sadržaj za salone koji kombinuju rezervacije i dolazak bez termina.",
    capabilities: [
      "walk-in copy",
      "availability notice",
    ],
    activationNotes: [
      "Live queue nije deo 01A.",
    ],
    requiresFutureCapability:
      true,
  },
};

export function createModuleSupport({
  required = [],
  recommended = [],
  optional = [],
}: {
  required?:
    StarterPackModuleId[];
  recommended?:
    StarterPackModuleId[];
  optional?:
    StarterPackModuleId[];
}): Record<
  StarterPackModuleId,
  StarterPackModuleSupport
> {
  const support =
    Object.fromEntries(
      STARTER_PACK_MODULE_IDS.map(
        (
          id
        ) => [
          id,
          "unsupported",
        ]
      )
    ) as Record<
      StarterPackModuleId,
      StarterPackModuleSupport
    >;

  for (
    const id of
    optional
  ) {
    support[
      id
    ] =
      "optional";
  }

  for (
    const id of
    recommended
  ) {
    support[
      id
    ] =
      "recommended";
  }

  for (
    const id of
    required
  ) {
    support[
      id
    ] =
      "required";
  }

  return support;
}
