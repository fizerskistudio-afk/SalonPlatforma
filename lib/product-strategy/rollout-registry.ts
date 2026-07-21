export const PRODUCT_ROLLOUT_CONTRACT_VERSION =
  1 as const;

export const PRODUCT_ROLLOUT_STATUSES = [
  "live",
  "beta",
  "coming_soon",
  "research",
  "retired",
] as const;

export type ProductRolloutStatus =
  (typeof PRODUCT_ROLLOUT_STATUSES)[number];

export const PRODUCT_PLATFORM_AREAS = [
  "tenant_platform",
  "growth_platform",
  "business_operations",
] as const;

export type ProductPlatformArea =
  (typeof PRODUCT_PLATFORM_AREAS)[number];

export const PRODUCT_RELEASE_POLICIES = [
  "public",
  "managed",
  "hidden",
] as const;

export type ProductReleasePolicy =
  (typeof PRODUCT_RELEASE_POLICIES)[number];

export type ProductRolloutFeatureDefinition = {
  key: string;
  label: string;
  description: string;
  status: ProductRolloutStatus;
  area: ProductPlatformArea;
  releasePolicy: ProductReleasePolicy;
  customerPromise: string;
};

export const PRODUCT_ROLLOUT_FEATURES = [
  {
    key: "tenant.public_site",
    label: "Profesionalni javni sajt",
    description:
      "Objavljeni tenant sajt sa identitetom, uslugama, timom, kontaktom i temom prilagođenom vertikali.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Salon dobija sopstveni digitalni prostor koji izgleda kao deo njegovog brenda.",
  },
  {
    key: "tenant.online_booking",
    label: "Online rezervacije",
    description:
      "Klijent bira uslugu, zaposlenog, datum i slobodan termin kroz tenant booking tok.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Klijenti mogu da zakažu termin bez poziva ili dopisivanja.",
  },
  {
    key: "tenant.any_employee_booking",
    label: "Bilo koji raspoloživi zaposleni",
    description:
      "Booking može da pronađe termine svih zaposlenih koji pružaju izabranu uslugu.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Klijent može da izabere prvi odgovarajući termin bez vezivanja za jednu osobu.",
  },
  {
    key: "tenant.owner_manager_admin",
    label: "Owner i manager administracija",
    description:
      "Zaštićeni tenant panel za rezervacije, klijente, usluge, tim, raspored i podešavanja.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Vlasnik i menadžer upravljaju svakodnevnim radom iz jednog prostora.",
  },
  {
    key: "tenant.staff_workspace",
    label: "Staff radni prostor",
    description:
      "Ograničeni panel za sopstvene rezervacije, raspored, napomene i odsustva zaposlenog.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Član tima vidi ono što mu je potrebno bez pristupa kompletnom poslovnom panelu.",
  },
  {
    key: "tenant.catalog_and_team",
    label: "Usluge, cene i tim",
    description:
      "Tenant katalog povezuje kategorije, usluge, trajanja, cene, zaposlene i njihove kompetencije.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Ponuda i tim ostaju usklađeni na javnom sajtu i u booking toku.",
  },
  {
    key: "tenant.schedule_management",
    label: "Radno vreme i odsustva",
    description:
      "Salon upravlja radnim vremenom, individualnim rasporedima, pauzama i odsustvima.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Dostupni termini prate stvarni kapacitet tima.",
  },
  {
    key: "tenant.gallery_and_reviews",
    label: "Galerija i recenzije",
    description:
      "Javni radovi i kontrolisani prikaz recenzija podržavaju digitalni identitet salona.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Salon može da pokaže rezultate rada i društveni dokaz na svom sajtu.",
  },
  {
    key: "tenant.email_notifications",
    label: "Email potvrde rezervacija",
    description:
      "Booking tok podržava transakcione email potvrde, delivery evidenciju i kontrolisane retry granice.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "Email potvrde se uključuju nakon production provere domena i primaoca.",
  },
  {
    key: "tenant.basic_seo",
    label: "Osnovni SEO sloj",
    description:
      "Tenant metadata, canonical URL, Open Graph, robots zaštita i sitemap osnova.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Objavljeni salon dobija tehničku osnovu za indeksiranje i deljenje.",
  },
  {
    key: "tenant.managed_onboarding",
    label: "Vođeno postavljanje",
    description:
      "Ordum tim priprema početni katalog, zaposlene, radno vreme, sadržaj i preview pre objave.",
    status: "live",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Salon ne mora sam da sastavlja početnu konfiguraciju platforme.",
  },
  {
    key: "tenant.google_calendar_business",
    label: "Google Calendar salona",
    description:
      "Kontrolisano povezivanje glavnog kalendara salona sa booking događajima.",
    status: "beta",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "Dostupno odabranim salonima uz našu proveru i podršku.",
  },
  {
    key: "tenant.google_calendar_employee",
    label: "Lični kalendari zaposlenih",
    description:
      "Povezivanje employee kalendara i busy availability granica.",
    status: "beta",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "Uključuje se kontrolisano kada je timu potrebna individualna sinhronizacija.",
  },
  {
    key: "tenant.review_management",
    label: "Upravljanje recenzijama",
    description:
      "Moderation inbox, owner odgovori, attention stanje i kontrolisani review tokovi.",
    status: "beta",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "Dostupno kroz vođeni rollout dok prikupljamo realan operativni feedback.",
  },
  {
    key: "tenant.ai_review_drafts",
    label: "AI nacrti odgovora na recenzije",
    description:
      "AI priprema nacrt koji vlasnik mora ručno da pregleda i odobri.",
    status: "beta",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "AI pomaže u pisanju, ali ne objavljuje odgovor bez čoveka.",
  },
  {
    key: "tenant.custom_domain_managed",
    label: "Povezivanje custom domena",
    description:
      "Managed domen setup bez javnog self-service provisioning toka.",
    status: "beta",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "Custom domen povezujemo uz tehničku proveru infrastrukture i DNS-a.",
  },
  {
    key: "tenant.multilingual_content",
    label: "Više jezika",
    description:
      "Više content i UI locale-a kroz postojeće tenant i theme granice.",
    status: "beta",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "Dodatni jezici se uključuju nakon pregleda prevoda i sadržaja.",
  },
  {
    key: "tenant.mobile_admin_navigation",
    label: "Novi mobile admin shell",
    description:
      "Primarna mobile navigacija Danas, Kalendar, Klijenti i Više postoji u source-u, uz odloženi browser acceptance.",
    status: "beta",
    area: "tenant_platform",
    releasePolicy: "managed",
    customerPromise:
      "Mobile admin se tretira kao test faza dok ne završi poseban UI acceptance.",
  },
  {
    key: "tenant.customer_self_service",
    label: "Klijentsko pomeranje i otkazivanje",
    description:
      "Bezbedan customer self-service tok za upravljanje postojećom rezervacijom.",
    status: "coming_soon",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Planirano, ali još nije deo aktivne prodajne garancije.",
  },
  {
    key: "tenant.sms_viber_notifications",
    label: "SMS i Viber obaveštenja",
    description:
      "Dodatni notification kanali preko budućih provider adaptera.",
    status: "coming_soon",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Planirano nakon stabilizacije osnovnih email i booking tokova.",
  },
  {
    key: "tenant.waitlist",
    label: "Lista čekanja",
    description:
      "Klijent ostavlja interesovanje za termin kada nema odgovarajuće dostupnosti.",
    status: "coming_soon",
    area: "tenant_platform",
    releasePolicy: "public",
    customerPromise:
      "Planirano kao growth funkcija, nije još aktivna.",
  },
  {
    key: "growth.blog_and_guides",
    label: "Blog i lokalni vodiči",
    description:
      "Editorial sadržaj, service vodiči, interlinking i odvojene sitemap grane.",
    status: "coming_soon",
    area: "growth_platform",
    releasePolicy: "public",
    customerPromise:
      "Ordum gradi sadržajni sloj koji povezuje edukaciju, lokalnu pretragu i salone.",
  },
  {
    key: "growth.local_discovery",
    label: "Lokalni discovery",
    description:
      "Pretraga grada i canonical usluge preko više eligible tenant salona.",
    status: "coming_soon",
    area: "growth_platform",
    releasePolicy: "public",
    customerPromise:
      "Korisnik će moći da pronađe relevantne lokalne salone kroz Ordum.",
  },
  {
    key: "growth.first_available_redirect",
    label: "Prvi slobodan termin",
    description:
      "Cross-tenant discovery bira najraniji eligible termin i vodi korisnika u pravi tenant booking tok.",
    status: "coming_soon",
    area: "growth_platform",
    releasePolicy: "public",
    customerPromise:
      "Planirani marketplace MVP, još nije aktivna funkcija.",
  },
  {
    key: "growth.google_business_profile",
    label: "Google Business Profile povezivanje",
    description:
      "Budući presence adapter za profile, objave, status i health evidenciju.",
    status: "coming_soon",
    area: "growth_platform",
    releasePolicy: "public",
    customerPromise:
      "Planirano kao zaseban integration milestone.",
  },
  {
    key: "growth.advanced_analytics",
    label: "Napredna growth analitika",
    description:
      "Attribution, conversion i funnel uvidi iz platformskog i tenant toka.",
    status: "coming_soon",
    area: "growth_platform",
    releasePolicy: "public",
    customerPromise:
      "Biće dostupno nakon uvođenja stabilnih događaja i attribution modela.",
  },
  {
    key: "operations.inventory",
    label: "Lager i potrošni materijal",
    description:
      "Praćenje zaliha, utroška i minimalnih količina po salonu.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Istraživački modul, bez javnog roka ili prodajne garancije.",
  },
  {
    key: "operations.procurement",
    label: "Nabavke i trebovanja",
    description:
      "Trebovanja zaposlenih, odobrenja, dobavljači i narudžbine.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Istraživački modul, prioritet zavisi od realnih potreba klijenata.",
  },
  {
    key: "operations.assets",
    label: "Oprema i održavanje",
    description:
      "Evidencija opreme, servisa, kvarova i preventivnog održavanja.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Istraživački modul za kasniji Business OS nivo.",
  },
  {
    key: "operations.fiscalization",
    label: "Fiskalizacija",
    description:
      "Adapteri ka lokalnim fiskalnim providerima i reconciliation tokovi.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Nije aktivna funkcija i zavisi od tržišta, države i provider partnera.",
  },
  {
    key: "operations.accounting_sef",
    label: "Knjigovodstvo i SEF",
    description:
      "Budući export i integration boundary za računovodstvo i elektronske fakture.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Istraživački modul bez javnog roka.",
  },
  {
    key: "operations.payments_deposits",
    label: "Plaćanja i depoziti",
    description:
      "Payment provider adapteri, depoziti, refund granice i reconciliation.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Istraživački modul za kasniji komercijalni nivo.",
  },
  {
    key: "operations.loyalty_memberships",
    label: "Loyalty i članarine",
    description:
      "Paketi usluga, bodovi, članarine i customer lifecycle pravila.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Istraživački modul koji se aktivira tek kada osnovni CRM dobije realne podatke.",
  },
  {
    key: "operations.multi_location",
    label: "Multi-location operacije",
    description:
      "Centralno upravljanje većim brojem lokacija, resursa i izveštaja.",
    status: "research",
    area: "business_operations",
    releasePolicy: "hidden",
    customerPromise:
      "Istraživački enterprise pravac, dostupan samo kroz posebnu procenu.",
  },
] as const satisfies readonly ProductRolloutFeatureDefinition[];

export type ProductRolloutFeature =
  (typeof PRODUCT_ROLLOUT_FEATURES)[number];

export type ProductRolloutFeatureKey =
  ProductRolloutFeature["key"];

const PRODUCT_ROLLOUT_FEATURE_MAP =
  new Map<ProductRolloutFeatureKey, ProductRolloutFeature>(
    PRODUCT_ROLLOUT_FEATURES.map(
      (feature) => [feature.key, feature]
    )
  );

export function getProductRolloutFeature(
  key: ProductRolloutFeatureKey
): ProductRolloutFeature {
  const feature =
    PRODUCT_ROLLOUT_FEATURE_MAP.get(key);

  if (!feature) {
    throw new Error(
      `Unknown product rollout feature: ${key}`
    );
  }

  return feature;
}

export function getProductRolloutFeaturesByStatus(
  status: ProductRolloutStatus
): readonly ProductRolloutFeature[] {
  return PRODUCT_ROLLOUT_FEATURES.filter(
    (feature) => feature.status === status
  );
}

export function getProductRolloutFeaturesByArea(
  area: ProductPlatformArea
): readonly ProductRolloutFeature[] {
  return PRODUCT_ROLLOUT_FEATURES.filter(
    (feature) => feature.area === area
  );
}

export function isProductFeatureLive(
  key: ProductRolloutFeatureKey
): boolean {
  return getProductRolloutFeature(key).status === "live";
}

export function isProductFeaturePubliclyMarketable(
  key: ProductRolloutFeatureKey
): boolean {
  const feature =
    getProductRolloutFeature(key);

  return (
    feature.status === "live" &&
    feature.releasePolicy === "public"
  );
}

export function getPublicProductRoadmap():
  readonly ProductRolloutFeature[] {
  return PRODUCT_ROLLOUT_FEATURES.filter(
    (feature) => {
      const definition =
        feature as ProductRolloutFeatureDefinition;

      return (
        definition.releasePolicy !== "hidden" &&
        definition.status !== "retired"
      );
    }
  );
}
