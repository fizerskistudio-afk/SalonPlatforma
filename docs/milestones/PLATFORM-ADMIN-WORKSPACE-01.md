# PLATFORM-ADMIN-WORKSPACE-01

**Status:** application implementation prepared; installer i stvarni lokalni output su obavezni pre PASS.

## Cilj

Tenant više nije kolekcija nepovezanih platform-admin stranica. Sve postojeće rute ulaze u jedan permission-aware i responsive workspace sa stabilnim kontekstom salona i jasnom razlikom između glavnih oblasti i operativnih podstranica.

## Information architecture

| Glavna oblast | Postojeće rute | Odgovornost |
| --- | --- | --- |
| Pregled | `/platform-admin/businesses/[businessSlug]` | lifecycle, readiness, javni URL, osnovni statusi i jedan sledeći korak |
| Branding | `edit`, `branding` | naziv, kontakt, lokalizovani osnovni sadržaj, logo, hero i mediji |
| Tema | `theme` | izbor template-a i javni preview |
| Pristup | `access` | owner nalog, membership i credentials tokovi |
| Operacije | `catalog`, `employees`, `settings`, `time-off`, `bookings` | katalog, tim, dodele, radno vreme, booking, blokade i rezervacije |

`Reviews` je vidljiv kao onemogućena planirana operativna stavka. Ne vodi na `/admin/reviews`, jer bi to ponovo pomešalo platform-admin i tenant-admin granice. Prava platform-admin reviews ruta pripada `PLATFORM-ADMIN-OPERATIONS-01`.

## Permission ponašanje

- shell koristi isti capability contract kao server layout-i i API rute;
- nedostupna glavna oblast se ne prikazuje;
- nedostupna podstranica se ne prikazuje kao mrtav link;
- Sales vidi Branding, Temu i dozvoljene Operacije, ali ne Pristup ili Rezervacije;
- Launch manager i super-admin vide sve trenutno implementirane oblasti;
- IT sa read/preview dozvolama ostaje na Pregledu i ne dobija mutation prečice;
- server-side layout guards ostaju autoritativni čak i kada UI sakrije link.

## Responsive contract

- primarna navigacija je grid bez horizontalnog overflow-a;
- mobile koristi dve kolone i touch target od najmanje 44px;
- desktop koristi pet stabilnih oblasti;
- kontekstualna podnavigacija se prelama u više redova;
- aktivna oblast i aktivna ruta imaju `aria-current="page"`;
- planirane stavke imaju `aria-disabled="true"` i nisu klikabilne;
- tenant ime i slug koriste truncation umesto širenja layout-a;
- workspace navigacija ostaje sticky tokom rada u dugim editorima.

## Overview refactor

Prethodni tenant detail je imao više od 2.000 linija i ponavljao katalog, zaposlene, dodele i radno vreme koji već imaju pune editore. Novi pregled:

- učitava autoritativni lifecycle/readiness context;
- prikazuje status, preview, production i poslednju verziju;
- zadržava canonical public URL i preview;
- zadržava lifecycle kontrole;
- koristi readiness karticu kao jedini onboarding next-step izvor;
- uklanja osam dekorativnih management dugmadi iz public-link komponente;
- ne briše nijednu postojeću management rutu ili mutation akciju.

## Nije deo milestone-a

- nema database, email ili cron promene;
- nema promene RBAC membership režima;
- nema promene Lumière teme, galerije ili javnog layout-a;
- nema implementacije platform-admin reviews operacija;
- nema access state-machine ili invitation recovery refactora;
- nema spajanja operativnih editora u jednu ogromnu client komponentu.

## Acceptance

- [ ] svih pet glavnih oblasti se prikazuje super-adminu;
- [ ] Sales/Launch manager/IT linkovi prate capability matricu;
- [ ] nested employee ruta ostaje aktivna pod `Operacije → Tim`;
- [ ] mobile nema horizontalni overflow u primarnoj navigaciji;
- [ ] keyboard focus i `aria-current` su vidljivi;
- [ ] Reviews je disabled, nije dead link i ne vodi u tenant-admin;
- [ ] canonical public URL je prisutan u initial HTML-u;
- [ ] overview koristi lifecycle servis i jedan readiness next step;
- [ ] svi postojeći editori i API tokovi ostaju dostupni kroz novu navigaciju;
- [ ] TypeScript, lint, svi testovi i production build prolaze;
- [ ] installer rollback i staging scope su potvrđeni;
- [ ] stvarni lokalni output i read-only browser smoke su pregledani pre PASS.
