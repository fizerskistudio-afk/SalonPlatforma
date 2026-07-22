# PLATFORM-GROWTH-ARCHITECTURE-01B

## Status

`01B` uvodi source-only canonical registry i mapping policy za prvi Ordum local discovery slice.

Ne uvodi baznu migraciju, cross-tenant availability, marketplace UI, javnu rutu, booking preselection runtime ili attribution persistence.

## Cilj

Tenant katalog ostaje vlasnik sopstvenih naziva, slugova, cena i service UUID vrednosti.

Growth sloj dobija stabilne platformske identitete koji omogućavaju da različiti tenant nazivi budu mapirani na istu korisničku nameru bez menjanja tenant booking domena.

## Početni canonical seed

### Lokacija

```text
key: rs:svilajnac
countryCode: RS
citySlug: svilajnac
displayName: Svilajnac
```

Podržani početni aliasi:

- `Svilajnac`;
- `Свилајнац`.

### Usluga

```text
key: barber:musko-sisanje
vertical: barber
slug: musko-sisanje
displayName: Muško šišanje
```

Podržani početni aliasi ostaju namerno uski:

- `Muško šišanje`;
- `Musko sisanje`;
- `Мушко шишање`;
- `Šišanje za muškarce`;
- `Sisanje za muskarce`.

Generičko `šišanje` se ne mapira automatski jer može označavati više različitih usluga, ciljnih grupa i trajanja.

## Normalizacija

Lookup normalizacija:

1. uklanja spoljne razmake;
2. prevodi u lowercase;
3. transliteriše srpsku ćirilicu;
4. normalizuje dijakritike;
5. čuva `đ` kao `dj`;
6. pretvara separator u jedan `-`;
7. uklanja prazne početne i završne separatore.

Normalizacija služi za lookup i suggestion. Ne menja javni display copy tenant-a.

## Mapping policy

Alias pogodak ne objavljuje mapiranje.

Tok je:

```text
tenant service
    |
    v
exact alias suggestion
    |
    v
status: suggested
    |
    v
platform-admin review
    |
    +-- approved
    +-- rejected
    +-- disabled
```

Za discovery publication moraju istovremeno važiti:

- mapping status je `approved`;
- postoje reviewer i review timestamp;
- canonical service je aktivan;
- tenant je aktivan;
- tenant je objavljen;
- tenant je eksplicitno uključio discovery;
- tenant service je aktivan.

## Zašto nema automatskog approval-a

Tenant može koristiti isti naziv za različitu poslovnu logiku:

- različito trajanje;
- različitu ciljnu grupu;
- paket ili pojedinačnu uslugu;
- drugačiji employee eligibility;
- posebnu cenu ili pripremu;
- naziv koji izgleda isto, ali pripada drugoj vertikali.

Zato exact alias samo smanjuje ručni rad. Ne zamenjuje platformski review.

## Source contract

### `canonical-normalization.ts`

Stabilna lookup normalizacija za Latin/Cyrillic input.

### `canonical-locations.ts`

Versioned source registry, lookup po ključu i alias resolution.

### `canonical-services.ts`

Versioned source registry, lookup po ključu i namerno uska alias resolution.

### `discovery-mapping-policy.ts`

Suggestion, manual candidate, approval i publication eligibility contract.

## Buduća DB projekcija

Kada bude odobrena `DISCOVERY-DATA-FOUNDATION-01` migracija, source contract treba projektovati u tabele ili read model bez promene javnih ključeva:

```text
canonical_locations
canonical_services
business_discovery_profiles
service_discovery_mappings
```

Source registry u 01B nije production baza podataka i nije dovoljan za cross-tenant runtime.

## Ne-menjani sistemi

`01B` ne menja:

- `businesses`;
- tenant localized city/country sadržaj;
- `services`;
- `employee_services`;
- `get_available_slots`;
- `/api/availability`;
- `/api/bookings`;
- booking modal;
- tenant routing;
- sitemap;
- landing;
- admin UI;
- RLS;
- migracije.

## Sledeći korak

Nakon 01B:

1. `PLATFORM-LANDING-02` koristi Product Ladder registry i prikazuje discovery kao `COMING SOON`;
2. `CONTENT-FOUNDATION-01` uvodi blog i guide model;
3. `DISCOVERY-DATA-FOUNDATION-01` projektuje canonical i mapping contract u odobrenu baznu migraciju;
4. `SVILAJNAC-DISCOVERY-MVP-01` uvodi cross-tenant search, redirect i booking handoff.
