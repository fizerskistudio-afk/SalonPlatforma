# Ordum Studios — Operativni Roadmap

**Ažurirano:** 22. jul 2026.
**Production baseline:** `main` @ `1343df48`
**Sledeći milestone:** `ORDUM-PWA-FOUNDATION-01`

> Ovaj dokument odgovara samo na pet pitanja: gde smo, šta je aktivno, šta ide sledeće, šta je blokirano i po kojim pravilima isporučujemo. Kompletna istorija je u [`docs/history/ROADMAP-LEGACY-2026-07-22.md`](docs/history/ROADMAP-LEGACY-2026-07-22.md).

## 1. Trenutni checkpoint

Ordum je multi-tenant platforma za uslužne biznise, trenutno fokusirana na beauty i wellness tržište.

Završeni temelji:

- profesionalni tenant sajtovi i više theme renderer-a;
- online booking, availability, klijenti, usluge, zaposleni i raspored;
- owner/manager administracija i ograničeni staff prostor;
- Platform Admin lifecycle, provisioning, preview, package i entitlement kontrola;
- Product Ladder, rollout registry i Growth Architecture;
- `Ordum Workspace` app registry, server-side visibility resolver i tenant-aware launcher;
- `Studio` kao postojeća LIVE poslovna aplikacija;
- `Content` kao pošteno označen `COMING SOON` modul;
- `Finance`, `Operations` i `Store` ostaju `RESEARCH` dok realni korisnici ne potvrde scope.

Najnoviji završeni milestone:

```text
ORDUM-DOCUMENTATION-IA-01
```

Dokumentacija je razdvojena na operativni roadmap, trenutni status, manifest, arhitekturu, milestone zapise i istoriju.

## 2. Proizvodne površine

| Površina | Uloga | Status |
|---|---|---|
| Tenant sajt | Javni digitalni prostor svakog biznisa | LIVE |
| Booking core | Usluge, zaposleni, dostupnost i rezervacije | LIVE |
| Studio | Owner/manager operativni sistem na postojećem `/admin` toku | LIVE |
| Staff | Ograničen radni prostor zaposlenog na `/staff` toku | LIVE |
| Workspace | Launcher dozvoljenih poslovnih aplikacija | LIVE foundation |
| Content | Sadržaj, blog, promocije i buduća Network projekcija | COMING SOON |
| Ordum Network | Javno otkrivanje biznisa i booking handoff | PLANNED |
| Finance | Operativne finansije i izvoz za knjigovođu | RESEARCH |
| Operations | Nabavke, lager, oprema i zadaci | RESEARCH |
| Store | Tenant katalog i kasniji commerce sloj | RESEARCH |

Status znači:

- **LIVE** — postoji i može da se koristi u podržanom toku;
- **BETA** — postoji, ali se uključuje kontrolisano;
- **COMING SOON** — odobren smer, još nije spreman za korišćenje;
- **PLANNED** — definisana buduća faza bez obećanog roka;
- **RESEARCH** — problem i ROI još moraju biti potvrđeni.

## 3. Aktivni milestone — ORDUM-PWA-FOUNDATION-01

### Cilj

Uvesti instalabilnu Workspace PWA osnovu bez ugrožavanja privatnih podataka, auth tokova ili booking pouzdanosti.

### Scope

- Workspace web manifest i identity;
- Network manifest contract bez lažnog Network runtime-a;
- icon i screenshot ownership;
- installability provera;
- bezbedna service-worker i caching politika;
- offline fallback za shell, ne za mutirajuće poslovne podatke;
- korisni shortcuts;
- desktop/mobile browser acceptance.

### Ne radimo u ovom milestone-u

- TWA ili Capacitor binary;
- offline rezervacije;
- agresivno keširanje admin/staff podataka;
- background write queue;
- customer account;
- Network discovery runtime;
- veliki redesign Workspace launchera.

### Acceptance

1. Workspace se može instalirati iz podržanog browser-a;
2. privatni admin/staff odgovori nisu trajno keširani;
3. mutacije nikada ne glume uspeh offline;
4. logout i promena tenant-a ne ostavljaju tuđe podatke u cache-u;
5. postojeći `/admin`, `/staff` i booking tokovi ostaju funkcionalni;
6. ciljane provere i kompletan `npm run check` prolaze;
7. ručni desktop/mobile PWA acceptance je dokumentovan.

## 4. Redosled isporuke

### 1. ORDUM-PWA-FOUNDATION-01

Instalabilni i bezbedni Workspace shell.

### 2. CONTENT-FOUNDATION-01

Prvi novi Workspace modul: strukturisan tenant sadržaj, blog/vodiči, promocije, SEO i buduća Network projekcija.

### 3. ORDUM-NETWORK-SHELL-01

Javna consumer površina sa search entry tačkom, gradom, uslugom i pošteno feature-gated discovery smerom.

### 4. DISCOVERY-DATA-FOUNDATION-01

Canonical DB model, approved tenant-service mapping, tenant opt-in, eligibility, cross-tenant query i attribution persistence.

### 5. SVILAJNAC-DISCOVERY-MVP-01

Prvi mali tržišni dokaz: `rs:svilajnac` + `barber:musko-sisanje`, najraniji raspoloživ termin i merljiv handoff u postojeći tenant booking.

### 6. ORDUM-STORE-CATALOG-01

Tenant katalog proizvoda i read-only javni prikaz bez marketplace payment obećanja.

### 7. FINANCE / OPERATIONS DISCOVERY

Intervjui sa aktivnim biznisima, domain audit, provider/compliance provera i potvrda prioriteta pre koda.

## 5. Otvoreni blockeri i obaveze

### Production i QA

- `MASTER-SYSTEM-QA-01B`: authenticated i mutating regression;
- puni live booking → admin calendar → staff workflow tok;
- Google Calendar production regression;
- production recipient email i cron provera;
- puni cross-tenant test;
- production contact-form Resend smoke;
- mobile preview booking guard smoke.

### Data i operacije

- formalni read-only verification za migraciju `032`;
- odluka o migraciji `029`;
- backup/restore dokument i kontrolisani restore test;
- monitoring i alerting foundation;
- audit log i incident runbook.

### Business readiness

- Privacy Policy i Uslovi korišćenja;
- onboarding checklist za prvog klijenta;
- server-side entitlement enforcement audit;
- billing i payment ostaju nedovršeni i ne predstavljaju se kao gotovi;
- Google Business Profile integracija ostaje rani research zahtev.

## 6. Prihvaćeni non-blocker-i

- trenutni Workspace launcher je funkcionalan, ali nije finalni UX;
- budući visual polish ide ka jednostavnijem Citrix Workspace modelu: kompaktniji app grid, manje hero prostora i brži ulaz;
- mobile admin shell ima osnovu, ali kasniji polish i dodatni acceptance ostaju otvoreni;
- Builder success feedback može biti vidljiviji;
- pojedine demo i live-tenant vizuelne dorade ostaju P2 dok core platforma ne bude stabilnija.

## 7. Pravila isporuke

1. Jedan milestone ima jasan cilj, scope i acceptance.
2. Code installer ne menja `ROADMAP.md`.
3. Posle code i browser PASS-a sledi zaseban roadmap closeout.
4. Ne radimo commit, push ili merge bez eksplicitne dozvole.
5. Ne predstavljamo BETA, COMING SOON ili RESEARCH kao gotovu funkciju.
6. Auth, tenancy, package i permission odluke ostaju server-side.
7. Ne pravimo paralelni booking engine za Network.
8. Ne pravimo veliku rewrite migraciju dok adapter može bezbedno da sačuva postojeći runtime.
9. Baza i migracije zahtevaju poseban guard, rollback i verification.
10. Završen milestone mora ostaviti čist tracked state, dokaz provera i detaljan zapis u `docs/milestones/`.

## 8. Dokumentacioni izvori istine

Čitaj ovim redom:

1. [`docs/MANIFESTO.md`](docs/MANIFESTO.md) — ko smo i kakvu firmu pokušavamo da izgradimo;
2. [`docs/STATUS.md`](docs/STATUS.md) — šta danas stvarno postoji;
3. ovaj `ROADMAP.md` — šta radimo sledeće;
4. [`docs/DOCUMENTATION-INDEX.md`](docs/DOCUMENTATION-INDEX.md) — gde se nalazi detaljna dokumentacija;
5. `docs/architecture/` — dugoročne sistemske odluke;
6. `docs/milestones/` — implementation i acceptance evidencija;
7. `docs/history/` — istorijski snapshot-i i zastarele operativne mape.

## 9. Promena prioriteta

Redosled se menja samo kada postoji najmanje jedan od sledećih signala:

- production blocker ili bezbednosni rizik;
- aktivni klijent ne može da završi osnovni poslovni tok;
- merljiv tržišni signal menja očekivani ROI;
- zakonska ili provider promena zahteva reakciju;
- prethodni milestone otkrije novu obaveznu zavisnost.

Nova ideja sama po sebi nije dovoljan razlog da se prekine aktivni milestone.
