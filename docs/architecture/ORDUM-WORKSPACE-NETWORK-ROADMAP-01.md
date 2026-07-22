# ORDUM-WORKSPACE-NETWORK-ROADMAP-01

## Status

Docs-only master architecture and delivery roadmap.

Ovaj dokument zaključava najbolji trenutni pravac za širenje Orduma iz booking platforme u modularni poslovni sistem i javnu korisničku mrežu.

Ne uvodi runtime, bazu, migracije, PWA manifest, service worker, novu rutu ili UI.

---

## 1. Glavna odluka

Ordum se deli na dve jasno odvojene korisničke površine:

### Ordum Workspace

Privatni poslovni sistem za owner-a, manager-a, staff i buduće specijalizovane tenant role.

### Ordum Network

Javna korisnička aplikacija za discovery, booking handoff, customer account i budući marketplace.

Ispod obe površine ostaje isti platformski core, ali auth, role, UI, podatkovne projekcije i privacy granice nisu iste.

---

## 2. Zaključane arhitektonske odluke

### 2.1 Dve aplikacije, ne aplikacija po ulozi

Ne pravimo zasebne Owner, Staff, Finance, Social i Store mobilne aplikacije.

Pravimo:

1. `Ordum Workspace`;
2. `Ordum Network`.

Workspace prikazuje aplikacije i funkcije prema tenant-u, ulozi, entitlement-u, rollout statusu i eksplicitnoj aktivaciji modula.

### 2.2 Modularni monolit pre mikroservisa

Trenutni Next.js projekat ostaje glavni runtime. Domeni se odvajaju kroz module, registry-je, server granice i događaje, ne kroz preranu mrežu mikroservisa.

Mikroservis se razmatra tek kada domen ima zaseban scaling profil, provider zahteva izolaciju, compliance granica to opravdava ili deployment coupling postane stvarni problem.

### 2.3 Postojeći admin se ne prepisuje

Trenutni `/admin` sistem postaje postojeća `Studio` aplikacija.

Prvi Workspace AppShell koristi adapter/deep link prema postojećem admin panelu. Veliki route rewrite nije deo prvog milestone-a.

### 2.4 PWA dolazi posle stabilnog AppShell-a

Prvo se zaključavaju aplikacije, role, route granice, entitlement resolution i shell navigacija. Tek zatim se uvode manifesti, installability, safe caching, shortcuts i push foundation.

### 2.5 Native put je progresivan

Redosled:

1. responsive web aplikacija;
2. installable PWA;
3. Android Trusted Web Activity kada je PWA stabilna;
4. Capacitor kada stvarne native potrebe opravdaju container;
5. specifični native modul samo gde web platforma nije dovoljna.

Pun React Native/Flutter rewrite nema opravdanje bez dokazanog ograničenja.

---

## 3. Ordum Workspace mapa

### Studio — LIVE osnova

Postojeći sistem:

- Danas;
- rezervacije;
- kalendar;
- klijenti;
- zaposleni;
- usluge;
- raspored i odsustva;
- galerija i recenzije;
- javni sajt;
- booking podešavanja;
- email i calendar integracije;
- tenant podešavanja.

### Content — prvi novi growth modul

Planirano:

- blog;
- novosti;
- promocije;
- galerija/radovi;
- content calendar;
- AI draft pomoć;
- objava na tenant sajtu;
- buduća projekcija na Network;
- budući adapteri za spoljne društvene mreže.

Open-source social engine može kasnije biti zaseban servis sa Ordum SSO granicom. Ne dobija direktno vlasništvo nad booking, tenant ili finance podacima.

### Finance — operativne finansije pre knjigovodstva

Prva realna vrednost:

- prihod po periodu;
- prihod po zaposlenom i usluzi;
- troškovi;
- metode plaćanja;
- provizije;
- osnovni cash-flow;
- dokumenti;
- izvoz za knjigovođu.

Fiskalizacija, SEF, bankarski feed i automatsko knjiženje ostaju posebni provider/compliance milestone-i.

### Operations — potvrditi realnim korisnicima

Planirano:

- dobavljači;
- nabavke;
- trebovanja;
- lager;
- minimalne zalihe;
- oprema;
- kvarovi i održavanje;
- zadaci;
- interne procedure.

Ne gradi se pre product discovery razgovora sa aktivnim salonima.

### Store — tenant commerce

Planirano:

- proizvodi;
- cena i dostupnost;
- slike/opisi;
- click & collect;
- porudžbine;
- akcije i paketi;
- kasnije online payment i dostava.

Store počinje kao tenant katalog. Network marketplace dolazi tek kada katalog, porudžbine, ownership i payment granice budu stabilne.

---

## 4. Ordum Network mapa

### Prvi javni MVP

- grad;
- canonical usluga;
- dan;
- vremenski prozor;
- određeni ili bilo koji zaposleni;
- eligible saloni;
- najraniji termin;
- merljiv redirect u postojeći tenant booking.

Network u prvoj fazi ne pravi drugi booking engine.

### Kasniji customer sloj

- customer account;
- istorija termina;
- omiljeni saloni i zaposleni;
- zakaži ponovo;
- waitlist;
- cancel/reschedule;
- notification preferences;
- recenzije;
- loyalty;
- personalizovane preporuke.

### Marketplace

- tenant proizvodi;
- lokalno preuzimanje;
- povezivanje proizvoda sa uslugama;
- preporuke posle termina;
- promoted placement;
- provizija;
- payment/delivery tek kroz poseban commerce foundation.

---

## 5. Workspace App Registry

Centralni registry je obavezan pre vidljivog AppShell-a.

Minimalni contract:

```ts
type OrdumWorkspaceAppDefinition = {
  key:
    | "studio"
    | "content"
    | "finance"
    | "operations"
    | "store";

  name: string;
  description: string;
  route: string;

  status:
    | "live"
    | "beta"
    | "coming_soon"
    | "research"
    | "retired";

  releasePolicy:
    | "public"
    | "managed"
    | "hidden";

  requiredRoles: readonly string[];
  requiredEntitlements: readonly string[];
  dependencies: readonly string[];

  navigation:
    | "primary"
    | "secondary"
    | "hidden";
};
```

Registry ne daje pristup sam po sebi. Server-side resolver mora da spoji authenticated user, aktivni business, membership, role, entitlement, rollout status, managed beta odobrenje i dependency uslove.

---

## 6. Početni registry

### `studio`

- status: `live`;
- route: `/admin`;
- policy: `public`;
- koristi postojeći admin;
- nema route rewrite-a u 01A/01B.

### `content`

- status: `coming_soon`;
- route: `/workspace/content`;
- zavisi od `studio`;
- budući most ka `CONTENT-FOUNDATION-01`.

### `finance`

- status: `research`;
- route: `/workspace/finance`;
- prikazuje se samo u roadmap/dev kontekstu dok se scope ne potvrdi.

### `operations`

- status: `research`;
- route: `/workspace/operations`;
- ne obećava lager ili nabavke kao gotove funkcije.

### `store`

- status: `research`;
- route: `/workspace/store`;
- prvo tenant catalog, marketplace kasnije.

---

## 7. Identity i role granice

### Workspace identity

Koristi postojeću tenant auth i membership osnovu.

Početne role:

- `owner`;
- `manager`;
- `staff`.

Buduće specijalizovane role:

- `accountant`;
- `content_manager`;
- `inventory_manager`.

Specijalizovane role se ne dodaju u bazu dok permission audit ne potvrdi potrebu.

### Network identity

Customer account nije tenant staff account.

Ista email adresa može jednog dana imati oba konteksta, ali session intent mora biti jasan, role model odvojen, customer podaci zaštićeni i tenant membership ne sme dati Network platform privilegije.

### Platform Admin

Platform Admin ostaje zaseban control plane i nije Workspace aplikacija salona.

---

## 8. Data ownership

### Salon poseduje

- svoje klijente;
- rezervacije;
- usluge;
- zaposlene;
- raspored;
- sadržaj;
- operativne podatke;
- finansijske podatke;
- lager i proizvode.

### Ordum platforma poseduje

- canonical taxonomy;
- discovery indeks;
- attribution događaje;
- platform-wide moderation;
- Network ranking contract;
- app/rollout registry;
- marketplace infrastrukturu.

Discovery i Network projekcija zahtevaju tenant opt-in i eligibility.

---

## 9. Modularni domeni

Ciljni source smer:

```text
lib/workspace/
lib/workspace-apps/
lib/content/
lib/finance/
lib/operations/
lib/commerce/
lib/network/
lib/growth/
lib/customers/
```

Svaki domen definiše tipove, server funkcije, permission granice, događaje, audit, vlasništvo nad tabelama i javne adaptere.

Jedan modul ne sme nasumično da čita ili menja interne tabele drugog modula.

---

## 10. Event foundation

Dugoročni cross-module tok koristi stabilne događaje, ne direktno spajanje svih modula.

Početni kandidati:

```text
booking.created
booking.confirmed
booking.completed
booking.cancelled
payment.recorded
expense.recorded
inventory.low_stock
order.created
content.published
network.redirected
```

Primer: `booking.completed` kasnije mogu da koriste Finance, Operations, CRM, Loyalty i Analytics.

Prvi AppShell milestone ne uvodi event persistence. Zaključava samo buduću granicu.

---

## 11. PWA arhitektura

### Workspace PWA

Ciljna identity površina:

```text
workspace.ordumstudios.com
```

### Network PWA

Ciljna identity površina:

```text
app.ordumstudios.com
```

ili budući kraći consumer domen kada bude potvrđen.

Ne pravimo manifest po ulozi. Owner, manager i staff koriste isti Workspace app identitet; server i registry određuju šta se prikazuje.

---

## 12. Safe caching granice

PWA cache može da sadrži AppShell, statične ikonice, CSS/JS, fontove, javne assete, bezopasan skeleton i eksplicitno odobrene read-only podatke sa kratkim TTL-om.

Ne sme automatski da kešira customer PII, finansijske izveštaje, bankarske podatke, privatne napomene, auth odgovore, booking/payment mutation rezultate ili admin API odgovore bez posebne politike.

Kritične write operacije zahtevaju mrežu u prvoj verziji. Service worker ne sme da simulira uspešnu rezervaciju, uplatu, porudžbinu ili trošak iz starog cache-a.

---

## 13. Native distribucija

### Android TWA

Razmatra se nakon stabilnog manifest-a, validnog HTTPS-a, installability PASS-a, deep-link ugovora, kontrolisanog update procesa i Digital Asset Links konfiguracije.

Signing keys ostaju pod Ordum kontrolom.

### Capacitor

Uvodi se kada je potvrđena potreba za pouzdanijim native push-em, biometrijom, kamerom/skenerom računa, barcode skenerom, filesystem pristupom ili dubljim calendar/share/deep-link funkcijama.

---

## 14. Faze isporuke

### Faza 0 — master roadmap

`ORDUM-WORKSPACE-NETWORK-ROADMAP-01`

- ovaj dokument;
- ROADMAP integracija;
- nema runtime promene.

### Faza 1 — AppShell contract

`ORDUM-WORKSPACE-APPSHELL-01A`

- typed Workspace App Registry;
- app status/release policy;
- role/entitlement/dependency resolution;
- `studio` seed;
- `content`, `finance`, `operations`, `store` roadmap seed;
- route contract;
- testovi;
- bez vidljivog UI-ja i baze.

### Faza 2 — visible Workspace shell

`ORDUM-WORKSPACE-APPSHELL-01B`

- `/workspace`;
- tenant-aware launcher;
- Studio kartica vodi u postojeći `/admin`;
- coming-soon/research kartice ne lažu o dostupnosti;
- owner/manager/staff visibility;
- desktop/mobile acceptance;
- nema admin route rewrite-a.

### Faza 3 — PWA foundation

`ORDUM-PWA-FOUNDATION-01`

- Workspace manifest;
- Network manifest contract;
- installability;
- icons/screenshots ownership;
- safe service-worker policy;
- offline fallback;
- shortcuts;
- browser acceptance;
- bez TWA/Capacitor binary-ja.

### Faza 4 — Content kao prvi novi Workspace modul

`CONTENT-FOUNDATION-01`

- shared content model;
- Workspace Content admin;
- tenant public posts;
- blog/vodiči;
- SEO/sitemap/structured data;
- buduća Network projekcija.

### Faza 5 — Network shell

`ORDUM-NETWORK-SHELL-01`

- consumer AppShell;
- search entry;
- city/service inputs;
- account placeholder bez lažne auth funkcionalnosti;
- PWA identity;
- discovery feature-gated.

### Faza 6 — Discovery data

`DISCOVERY-DATA-FOUNDATION-01`

- canonical DB model;
- approved tenant service mapping;
- opt-in/eligibility;
- cross-tenant query;
- attribution persistence;
- privacy i RLS.

### Faza 7 — Svilajnac MVP

`SVILAJNAC-DISCOVERY-MVP-01`

- `rs:svilajnac`;
- `barber:musko-sisanje`;
- earliest available;
- tenant booking handoff;
- merljiv redirect;
- revalidacija termina.

### Faza 8 — Store catalog

`ORDUM-STORE-CATALOG-01`

- tenant products;
- read-only public catalog;
- click & collect inquiry/order foundation;
- bez marketplace payment obećanja.

### Faza 9 — Finance i Operations discovery

Pre koda: razgovori sa aktivnim salonima, domain audit, provider/compliance audit i potvrda prioriteta/ROI-ja.

---

## 15. Prvi code milestone — acceptance

`ORDUM-WORKSPACE-APPSHELL-01A` mora da dokaže:

1. postoji jedan typed app registry;
2. `studio` je jedina LIVE aplikacija;
3. Content je `coming_soon`;
4. Finance, Operations i Store nisu predstavljeni kao gotovi;
5. role nisu hardkodovane u UI karticama;
6. resolver radi server-side;
7. Platform Admin nije tenant Workspace aplikacija;
8. `/admin` ostaje postojeća Studio ruta;
9. nema baze, migracije, PWA manifest-a ili service worker-a;
10. ciljani testovi i kompletan `npm run check` prolaze.

---

## 16. Ne-radimo sada

- poseban native binary po roli;
- React Native/Flutter rewrite;
- pet mikroservisa;
- potpuno knjigovodstvo;
- bankarski feed;
- fiskalizaciju;
- SEF;
- marketplace payment;
- dostavu;
- social network fork unutar booking baze;
- automatski offline booking;
- veliki `/admin` route rewrite;
- customer account pre Network identity audita.

---

## 17. Merilo uspeha

Prva verzija je uspešna kada vlasnik salona može da otvori jedan Ordum Workspace, vidi samo aplikacije koje su mu stvarno dostupne i uđe u postojeći Studio sistem bez gubitka trenutne funkcionalnosti.

Network je uspešan kada korisnik može da pronađe realan termin i bude bezbedno prebačen u postojeći tenant booking bez paralelnog booking engine-a.

Sve ostalo se gradi tek kada ta dva jezgra daju realan signal.
