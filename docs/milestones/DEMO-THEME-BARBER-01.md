# DEMO-THEME-BARBER-01 — MODULAR HERITAGE EXPERIENCE

**Datum:** 16. jul 2026.
**Branch:** `backup/theme-core-barber-beta`
**Referentni standard:** Lumière / `hair-luxury`

## Cilj

Dovesti Barber Heritage iz osnovnog beta monolith prikaza do punog javnog theme standarda:

```text
availability=live
desktop=modular
mobile=modular
acceptance=passed
supportsReviews=true
```

Tema zadržava tamni heritage identitet, ali dobija premium visual hierarchy, jasne section granice i namenski mobile UX.

## Polazno stanje

- desktop i mobile imaju približno 600 linija;
- carousel state je u mobile root-u;
- manifest je `monolith/monolith/pending`;
- availability je `beta`;
- `supportsReviews=false` iako oba renderera koriste shared Reviews adapter;
- services i team nemaju potpune empty state granice.

## Lumière standard

Barber Heritage ne kopira Lumière dizajn. Preuzima arhitektonski standard: tanak composition root, modularan desktop, namenski mobile renderer, shared booking contract, centralni locale i Reviews sistem, tenant-neutralan sadržaj i testabilne sekcije.

## Moduli

Desktop: Header, Hero, Services, Team, Gallery, Reviews, Contact i Footer.

Mobile: Header, Hero, Services, Team, Gallery, Reviews, Contact i BottomNav.

Mobile carousel state pripada `BarberMobileTeamSection`, a safe-area navigacija `BarberMobileBottomNav` modulu.

## Starter Pack Business Builder

Podržani su hero fallback, service/team/gallery empty states, preview-safe Reviews, general/service/employee booking callback granice, contact podaci i desktop switch.

## Reviews contract

```text
BarberHeritageDesktopTemplate
  → BarberDesktopReviewsSection
      → CatalogReviewsSection

BarberHeritageMobileTemplate
  → BarberMobileReviewsSection
      → CatalogReviewsSection
```

Desktop review anchor pripada Header modulu.

## Optimizacija

`TemplateRenderer` dinamički učitava samo aktivni template i viewport. Sekcije ostaju stabilan composition graph bez dodatnog async waterfall-a.

## Ne menja se

Lumière, Editorial, booking engine, database, migracije, tenant podaci, publication status, email, cron, `ROADMAP.md` i `main`.

## Acceptance

- [ ] desktop root je composition-only;
- [ ] mobile root je composition-only;
- [ ] osam desktop i osam mobile modula postoji;
- [ ] carousel state nije u mobile root-u;
- [ ] empty states postoje;
- [ ] shared Reviews i booking contract su očuvani;
- [ ] manifest je `live/modular/modular/passed`;
- [ ] ciljani testovi, TypeScript i `npm run check` prolaze;
- [ ] ROADMAP nije menjan;
- [ ] commit i push nisu pokrenuti.

## Barber V2 — visual/app-shell pass

Browser audit je pokazao da je funkcionalni modularni paket prošao, ali da trenutni vizuelni rezultat nije prihvaćen kao završna tema.

### Desktop hero

Prethodni tvrdi split sa praznom desnom površinom zamenjuje se sledećim konceptom:

- hero slika ide full-bleed preko cele sekcije;
- sekcija koristi puni desktop viewport ispod headera;
- leva strana je semitransparentan gradient overlay, ne odvojena pravougaona kolona;
- slika ostaje vidljiva ispod celog layouta;
- podrazumevani fokus fotografije je desno (`68% center`);
- lokacija je kompaktan badge;
- trust red ostaje pri dnu;
- fizička vertikalna split granica se uklanja.

### Desktop microanimacije

Hero dobija CSS-only motion:

- početni cinematic image scale;
- overlay ulazi sleva;
- naslov ulazi po linijama;
- zlatna linija naslova koristi mask reveal;
- copy, CTA i trust red dobijaju mali stagger;
- hover strelice se pomeraju;
- `prefers-reduced-motion` potpuno isključuje motion.

Nema WebGL-a, Three.js-a, scroll lock-a ili teške runtime biblioteke.

### Mobile app-shell

Mobile više nije jedna duga landing stranica sa anchor navigacijom.

Novi app-shell koristi:

```text
Home
Services
Book
Barbers
Salon
```

- root je fiksiran na `100dvh`;
- body stranice se ne skroluje kroz sve sekcije;
- samo aktivni tab ima sopstveni scroll;
- tab menja mountovani ekran;
- Home prikazuje hero i quick-entry kartice;
- Services i Barbers su zasebni ekrani;
- Salon grupiše Gallery, Reviews i Contact;
- centralni Book CTA ostaje globalan;
- screen transition je kratka opacity/translate animacija;
- safe-area bottom navigation ostaje obavezna.

### Registry odluka

Dok V2 ne prođe ručni browser visual acceptance:

```text
availability=beta
desktop=modular
mobile=app-shell
architecture.acceptance=passed
supportsReviews=true
```

`architecture.acceptance=passed` znači da je tehnička arhitektura prihvaćena. `availability=beta` pošteno beleži da vizuelni closeout još nije potvrđen.

### V2 acceptance

- [ ] full-bleed desktop hero radi sa stvarnom fotografijom;
- [ ] semitransparentni levi overlay ostavlja fotografiju vidljivom;
- [ ] hero motion je fluidan i ne blokira interakciju;
- [ ] reduced-motion putanja radi;
- [ ] mobile Home ne skroluje u Services/Team/Gallery sekcije;
- [ ] svaki bottom-nav tab menja aktivni ekran;
- [ ] samo aktivni ekran skroluje;
- [ ] centralni Book CTA ostaje dostupan;
- [ ] preview booking guard ostaje aktivan;
- [ ] browser visual acceptance prolazi;
- [ ] tek posle toga availability može da pređe sa `beta` na `live`.

## Barber V2 — mobile Home closeout

Nakon prvog V2 browser pregleda potvrđeno je:

```text
desktop hero=accepted
mobile hero=accepted
mobile app-shell direction=accepted
```

Home ekran više nema quick-entry kartice za Services i Barbers, jer te akcije već postoje kao stalni bottom-nav tabovi.

Implementirana pravila:

- Home sadrži samo namenski hero ekran;
- spoljni `business.description` blok je uklonjen sa Home prikaza;
- hero ispunjava raspoloživu visinu app-shell-a;
- Home koristi `overflow-hidden`;
- Services, Barbers i Salon zadržavaju sopstveni `overflow-y-auto`;
- centralni Book CTA i preview booking guard ostaju nepromenjeni;
- Services, Team, Gallery i Reviews vizuelni redizajn ostaje za sledeće zajednički zaključane prolaze.

### Home browser acceptance

- [ ] nema quick-entry kartice `Pogledaj usluge`;
- [ ] nema quick-entry kartice `Izaberi berberina`;
- [ ] Home ne pokazuje vertikalni scroll;
- [ ] hero, header i bottom navigation staju u jedan viewport;
- [ ] Services i Barbers tabovi i dalje otvaraju zasebne ekrane;
- [ ] Book CTA i preview guard i dalje rade.

## Barber V2 — desktop Services category navigator

Desktop Services je odvojen od već prihvaćenog mobile prikaza.

Zaključani desktop koncept:

- leva kolona počinje oznakom `Usluge`;
- slogan `Preciznost se ne podrazumeva. Ona se vežba.` ostaje na vrhu;
- ispod slogana je vertikalna lista samo kategorija koje imaju aktivne usluge;
- aktivna kategorija je obeležena zlatnim tekstom i animiranom donjom linijom;
- desna kolona prikazuje samo usluge aktivne kategorije;
- promena kategorije koristi kratki opacity/translate panel transition;
- usluga se prikazuje kao klasičan cenovnik: naziv, dotted linija i cena;
- hover otkriva blagu zlatnu površinu i booking strelicu;
- klik na red zadržava postojeću service-preselection booking granicu;
- `prefers-reduced-motion` gasi tranziciju;
- mobile Services komponenta nije menjana.

### Desktop Services browser acceptance

- [ ] slogan i kategorije počinju pri vrhu leve kolone;
- [ ] samo kategorije sa uslugama su vidljive;
- [ ] aktivna kategorija je nedvosmisleno označena;
- [ ] klik kategorije menja desni sadržaj bez skrolovanja stranice;
- [ ] desno se vide samo usluge iz aktivne kategorije;
- [ ] price-list redovi ostaju čitljivi na 1280 px i 1440 px;
- [ ] klik usluge prosleđuje tačan service preselection;
- [ ] mobile Services izgleda isto kao pre ovog prolaza.

## Barber V2 — desktop Services visual refinement

Prvi category-navigator browser pregled potvrdio je da je koncept dobar, ali da finalne proporcije nisu prihvatljive.

R2 korekcije:

- leva kolona je sužena na približno 36%, desna proširena na 64%;
- slogan je promenjen u `Preciznost nije detalj. Ona je standard.`;
- slogan koristi manju sekcijsku, a ne hero tipografsku skalu;
- active category dobija zlatnu vertikalnu liniju, blagu zlatnu pozadinu i `Aktivno` oznaku;
- dodat je klizni category indicator;
- uklonjena je tvrda fizička border podela između kolona;
- desni naslov kategorije je smanjen;
- desni panel dobija veliki providni indeks, radial highlight i tamni depth gradient;
- service redovi su viši i imaju više vizuelne mase;
- opis usluge može zauzeti dva reda;
- category transition je skraćen na 320ms i koristi mali X/Y pomak;
- mobile Services ostaje netaknut.

### R2 browser acceptance

- [ ] slogan ostaje u najviše tri čitljiva reda na 1440px;
- [ ] leva kolona ne dominira sekcijom;
- [ ] active category izgleda kao kontrola, ne kao obična lista;
- [ ] desna strana nema osećaj praznog prototipa;
- [ ] naslov kategorije ne konkuriše hero naslovu;
- [ ] dve usluge vizuelno popunjavaju panel bez ogromnog mrtvog prostora;
- [ ] hover i category transition ostaju suptilni;
- [ ] mobile Services ostaje vizuelno nepromenjen.
