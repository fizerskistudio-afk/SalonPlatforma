# PLATFORM-GROWTH-ARCHITECTURE-01

## Status

`01A` zaključava read-only audit i typed contracts.

Ovaj milestone ne uvodi marketplace, blog, novu javnu rutu, baznu migraciju ili booking izmenu. Njegova svrha je da spreči da growth sloj duplira tenant booking sistem ili prerano zaključa Ordum na jedan poslovni model.

## Potvrđeni postojeći baseline

### Tenant catalog

Objavljeni tenant već ima:

- `business_id` i stabilan business slug;
- lokalizovane `address`, `city` i `country` tekstove;
- tenant-specifične service kategorije, service UUID i service slug;
- trajanje, price type, cenu i valutu;
- aktivne zaposlene;
- employee-service mapiranje;
- radno vreme salona i zaposlenog;
- odsustva i blokade;
- `allow_any_employee`.

### Availability

`public.get_available_slots`:

- prima jedan `business_id`;
- prima jedan tenant `service_id`;
- prima datum;
- prima opcioni `employee_id`;
- kada je `employee_id = null`, vraća eligible slotove svih aktivnih zaposlenih koji pružaju uslugu;
- poštuje booking window, minimalno vreme unapred, timezone, radno vreme, odsustva i postojeće rezervacije;
- dostupan je samo server-side `service_role` pozivu.

Trenutni `/api/availability` zahteva `businessSlug`, pa nije cross-tenant discovery API.

### Booking

Javni booking:

- zahteva business slug;
- zahteva tenant service UUID;
- zahteva employee UUID;
- zahteva konkretan `startsAt`;
- koristi postojeći atomski `create_public_booking` RPC;
- nema attribution input;
- nema discovery source ili pseudonymous referral token.

Tenant UI već ume interno da otvori booking sa service ili employee preselection stanjem, ali javna tenant ruta trenutno čita samo `preview` search param. URL contract za automatsko otvaranje booking-a i preselection još nije implementiran.

### SEO

Postoje:

- platformski root metadata;
- tenant metadata i canonical URL;
- host-aware sitemap;
- robots zabrana za admin, staff, platform-admin, auth i API;
- public tenant indeksiranje;
- private/unknown tenant noindex granica.

Ne postoje:

- blog rute;
- editorial content model;
- service vodiči;
- city directory;
- city-service directory;
- growth sitemap grupe;
- marketplace redirect ruta;
- attribution događaji.

## Zaključani arhitektonski principi

1. **Tenant booking ostaje jedini booking engine.**
   Discovery bira kandidata i preusmerava u postojeći tenant booking tok. Ne pravi paralelni marketplace booking zapis.

2. **Canonical taxonomy je platformska, tenant katalog ostaje tenant-owned.**
   Tenant service UUID ne postaje globalni service identitet. Uvodi se eksplicitno mapiranje na canonical service key.

3. **Lokacija mora biti canonical podatak.**
   Lokalizovani city JSON ostaje za prikaz, ali discovery zahteva stabilan country code i city slug.

4. **Marketplace je opt-in.**
   Objavljen i aktivan tenant nije automatski marketplace kandidat. Potreban je poseban `discoveryOptIn`.

5. **Samo aktivno mapirane usluge ulaze u discovery.**
   Tenant odlučuje koje usluge su discoverable.

6. **Prvi rezultat se sortira po najranijem terminu.**
   Stabilni tie-breaker je business slug, zatim ime zaposlenog. Kasniji ranking može dodati cenu, kvalitet i distance signale bez promene osnovnog contract-a.

7. **Redirect je noindex i nije salon profil.**
   `/go/[attributionId]` služi samo za meren redirect. Platforma u 01A ne uvodi duplikat `/saloni/[businessSlug]`; directory vodi na tenant canonical URL.

8. **Filteri nisu SEO stranice.**
   Datum, vreme, zaposleni, cena i sort su runtime search state. Canonical ostaje čista city ili city-service ruta.

9. **Indexable directory zahteva stvarnu vrednost.**
   Potreban je curated sadržaj i stvaran eligible inventory. Prazne kombinacije nisu indeksabilne.

10. **Attribution je pseudonymous.**
    Event contract ne čuva customer ime, telefon, email, napomenu ili raw IP.

## Ciljni budući data model

Sledeća migracija, kada bude odobrena, treba da razmotri:

### `canonical_locations`

- `key`
- `country_code`
- `city_slug`
- display name
- aliases
- active

### `canonical_services`

- `key`
- vertical
- slug
- display name
- aliases
- active

### `business_discovery_profiles`

- `business_id`
- canonical location key
- discovery opt-in
- eligibility status
- eventualni ranking policy
- timestamps

### `service_discovery_mappings`

- `business_id`
- tenant `service_id`
- canonical service key
- discoverable
- active
- timestamps

### `growth_attribution_events`

- pseudonymous attribution ID
- event type
- canonical location key
- canonical service key
- business slug
- tenant service ID
- employee ID
- slot timestamp
- occurred timestamp

Customer PII nije deo ove tabele.

## Planirane rute

### Indexable

- `/`
- `/blog`
- `/blog/[articleSlug]`
- `/vodici/[serviceSlug]`
- `/frizeri/[citySlug]`
- `/frizeri/[citySlug]/[serviceSlug]`
- `/pronadji-termin`

### Nikada indexable

- `/go/[attributionId]`

### Namerno nije uvedeno

- `/saloni/[businessSlug]`

Tenant javni sajt ostaje canonical salon destinacija.

## Redirect i booking preselection

Planirani redirect query:

```text
?book=1
&serviceId=<tenant-service-uuid>
&employeeId=<employee-uuid>
&startsAt=<iso-timestamp>
&ordum_ref=<pseudonymous-attribution-id>
```

Tenant stranica u budućem milestone-u treba da:

1. validira query;
2. potvrdi da service i employee pripadaju tenant-u;
3. po potrebi ponovo proveri availability;
4. otvori postojeći booking modal;
5. prenese attribution ID do booking completion događaja;
6. nikada ne veruje redirect parametrima kao zameni za server-side booking validaciju.

## Svilajnac MVP

Prvi discovery slice:

- država: Srbija;
- grad: Svilajnac;
- vertikala: hair/barber;
- prva canonical usluga: muško šišanje;
- datum: danas, sutra ili ručni izbor;
- employee preference: bilo koji;
- ranking: earliest available;
- destinacija: tenant canonical URL;
- booking: postojeći tenant booking;
- attribution: pseudonymous Ordum referral.

## Milestone sequence

### `PLATFORM-GROWTH-ARCHITECTURE-01A`

- audit;
- typed contracts;
- SEO/index policy;
- attribution privacy boundary;
- bez runtime implementacije.

### `PLATFORM-GROWTH-ARCHITECTURE-01B`

- canonical location registry;
- canonical service registry;
- početni Svilajnac i muško šišanje seed contract;
- mapping admin policy;
- bez cross-tenant availability još.

### `PLATFORM-LANDING-02`

- landing koristi Product Ladder registry;
- transparentni LIVE/BETA/COMING SOON statusi;
- Launch Partner CTA;
- discovery prikazan kao coming soon ili kontrolisana test faza.

### `CONTENT-FOUNDATION-01`

- content model;
- blog i guide rute;
- metadata;
- structured data;
- sitemap grupe;
- editorial workflow.

### `DISCOVERY-DATA-FOUNDATION-01`

- odobrena migracija;
- opt-in;
- canonical mappings;
- read model;
- read-only verification.

### `SVILAJNAC-DISCOVERY-MVP-01`

- cross-tenant search;
- earliest slot;
- redirect;
- booking preselection;
- attribution događaji;
- browser acceptance.
