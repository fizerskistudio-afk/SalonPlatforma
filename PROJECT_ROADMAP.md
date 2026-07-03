# SalonPlatforma — Master Progress & Roadmap

**Poslednje ažuriranje:** 3. jul 2026.  
**Repo:** `fizerskistudio-afk/SalonPlatforma`  
**Glavni izvor istine:** ovaj dokument + stanje na `main` grani  
**Trenutni demo tenant:** `lumiere-studio`  
**Trenutni template:** `hair-luxury`

---

## 1. Kako koristimo ovaj dokument

Ovaj fajl je centralna evidencija projekta. Chat služi za razradu i izvođenje rada, ali se završene odluke i promene prenose ovde.

### Statusi

- `[x]` Završeno i potvrđeno u repou.
- `[-]` Delimično završeno ili radi samo za demo tenant.
- `[ ]` Nije započeto.
- `[?]` Postoji trag ili ranija odluka, ali mora da se proveri u kodu ili produkciji.
- `[!]` Blokada, rizik ili produkcioni problem.

### Pravilo završavanja zadatka

Zadatak se označava kao završen tek kada su ispunjeni svi relevantni uslovi:

1. kod postoji na ciljnoj grani;
2. `npm run lint` prolazi;
3. `npm run build` prolazi;
4. ključni tok je ručno ili automatski testiran;
5. povezani dokumenti i env primeri su ažurirani;
6. ovaj roadmap je ažuriran.

---

## 2. Vizija proizvoda

SalonPlatforma je multi-tenant web i booking platforma za frizerske, beauty i kasnije druge uslužne biznise.

Osnovna UX odluka:

- **Desktop:** premium prezentacioni sajt za istraživanje salona, usluga, tima i sadržaja.
- **Mobilni uređaj:** app-like iskustvo fokusirano na brzo zakazivanje.
- **Booking engine:** jedna zajednička poslovna logika za desktop i mobile.
- **Podaci:** Supabase je izvor istine za biznis, katalog, raspored i rezervacije.
- **Dostupnost i rezervacije:** računaju se i kreiraju na serverskoj/baznoj strani, ne kroz klijentski mock.
- **Template sistem:** vizuelni template mora biti odvojen od podataka konkretnog biznisa.
- **Lokalizacija:** centralni locale registry, sa postepenim širenjem izvan `mk`, `sq` i `en`.

---

## 3. Trenutni pregled proizvoda

| Oblast | Status | Napomena |
|---|---:|---|
| Desktop javni sajt | `[x]` | Hero, usluge, tim, galerija, recenzije, kontakt i footer |
| Mobilni app shell | `[x]` | Tab navigacija, mobilne stranice i full-screen booking |
| Zajednički booking flow | `[x]` | Desktop i mobile koriste isti `BookingFlow` |
| Supabase katalog | `[x]` | Biznis, kategorije, usluge, zaposleni, veze, radno vreme, galerija |
| Stvarna dostupnost termina | `[x]` | `/api/availability` + PostgreSQL RPC `get_available_slots` |
| Stvarno kreiranje rezervacije | `[x]` | `/api/bookings` + RPC `create_public_booking` |
| Zaštita od zauzetog slota | `[x]` | Konflikt se vraća u UI i korisnik bira novi termin |
| Google Calendar sync | `[-]` | Kreiranje/sync postoji; pun admin OAuth i lifecycle treba potvrditi i završiti |
| Lokalizacija UI-ja | `[-]` | Kompletni UI jezici: `mk`, `sq`, `en`; registry je osnova za širenje |
| Template registry | `[-]` | `hair-luxury` postoji; `template_config` još nema stvarni uticaj na UI |
| Multi-tenant routing | `[ ]` | Tenant je još hardkodovan na `lumiere-studio` |
| Admin dashboard | `[ ]` | Auth session infrastruktura postoji, ali admin proizvod nije završen |
| Testovi i CI | `[ ]` | Nema potvrđenog automatizovanog test paketa ni CI quality gate-a |
| Produkciona zaštita bookinga | `[ ]` | Rate limit, anti-spam i monitoring nisu završeni |

---

## 4. Završene faze

### Faza 0 — Osnova projekta

- [x] Next.js App Router projekat.
- [x] React + TypeScript sa `strict` režimom.
- [x] Tailwind CSS 4.
- [x] Lucide ikone.
- [x] Osnovni SEO, manifest i PWA metadata.
- [x] Supabase browser/server/admin infrastruktura.
- [x] Next.js `proxy.ts` za osvežavanje Supabase sesije.

### Faza 1 — Demo sadržaj i tipovi

- [x] Definisani tipovi za biznis, temu, usluge, zaposlene, galeriju i booking draft.
- [x] Napravljen Lumière Studio demo identitet.
- [x] Napravljeni početni prevodi za makedonski, albanski i engleski.
- [x] Uvedeni aktivni statusi i sorting za katalog.
- [-] Stari mock tipovi i komentari još postoje u `lib/types.ts` i treba ih ukloniti.

### Faza 2 — Desktop iskustvo

- [x] `DesktopLanding` kao kompozicija zasebnih sekcija.
- [x] Header i jezički izbor.
- [x] Hero sa pozivom na booking.
- [x] Prikaz usluga i direktan booking iz kartice usluge.
- [x] Prikaz tima i direktan booking sa izabranim zaposlenim.
- [x] Galerija.
- [x] Recenzije.
- [x] Kontakt i radno vreme.
- [x] Footer.
- [x] Desktop booking modal.

### Faza 3 — Mobilno app iskustvo

- [x] `MobileAppShell`.
- [x] Bottom tab navigacija.
- [x] Home, services, team i contact mobilni prikazi.
- [x] Full-screen mobilni booking modal.
- [x] Safe-area podrška.
- [x] View preference: `auto`, `desktop`, `mobile`.
- [x] Čuvanje izbora prikaza u `localStorage`.
- [x] Čuvanje jezika po business slug-u.

### Faza 4 — Zajednički booking engine

- [x] Service step.
- [x] Employee step.
- [x] Any employee opcija kontrolisana booking podešavanjima.
- [x] Date step prema vremenskoj zoni salona.
- [x] Time step.
- [x] Customer data step.
- [x] Summary sa povratkom na pojedinačne korake.
- [x] Success ekran.
- [x] Validacija obaveznih kontakt podataka.
- [x] Različit success prikaz za `confirmed` i `pending` rezervacije.
- [x] Reference code, cena, trajanje, zaposleni, datum i vreme iz sačuvane rezervacije.

### Faza 5 — Supabase katalog

- [x] `/api/catalog` učitava aktivni biznis.
- [x] Učitavanje booking settings.
- [x] Učitavanje kategorija.
- [x] Učitavanje usluga.
- [x] Učitavanje zaposlenih.
- [x] Učitavanje employee-service veza.
- [x] Učitavanje opšteg radnog vremena.
- [x] Učitavanje galerije.
- [x] Normalizacija lokalizovanog sadržaja.
- [x] Theme colors iz baze postaju CSS varijable.
- [x] Loading, error i retry stanja kataloga.

### Faza 6 — Dostupnost termina

- [x] `/api/availability` validira business slug, UUID-jeve i datum.
- [x] PostgreSQL funkcija `get_available_slots` je izvor stvarne dostupnosti.
- [x] Podrška za izabranog zaposlenog ili bilo kog dostupnog zaposlenog.
- [x] Abort prethodnog request-a pri promeni izbora.
- [x] Formatiranje vremena u vremenskoj zoni salona.
- [x] Empty i loading stanja.

### Faza 7 — Kreiranje rezervacije

- [x] `/api/bookings` validira zahtev.
- [x] Server validira business, service, employee, početno vreme i customer podatke.
- [x] PostgreSQL RPC `create_public_booking` atomski kreira booking.
- [x] Konflikt zauzetog termina vraća `409 / SLOT_UNAVAILABLE`.
- [x] UI resetuje samo nevažeći deo drafta i vraća korisnika na odgovarajući korak.
- [x] Greška spoljne integracije ne briše uspešno kreiranu rezervaciju.

### Faza 8 — Google Calendar osnova

- [x] Google OAuth klijent i scope konfiguracija.
- [x] Potpisan i vremenski ograničen OAuth state.
- [x] Enkripcija refresh tokena je predviđena.
- [x] Kreiranje privatnog Calendar eventa sa booking detaljima.
- [x] Deterministički event ID radi idempotentnosti.
- [x] Čuvanje Google sync statusa i greške u bazi je podržano u sync sloju.
- [x] Potvrđena rezervacija pokreće Calendar sync.
- [?] Potvrditi kompletne connect/callback/disconnect HTTP rute na trenutnoj grani.
- [?] Potvrditi update/cancel/delete lifecycle iz admin toka.
- [ ] Napraviti admin UI za povezivanje i status Google Calendar naloga.

### Faza 9 — Template i locale osnova

- [x] Centralni `TEMPLATE_REGISTRY`.
- [x] Prvi template: `hair-luxury`.
- [x] Template manifest sa niche, version, sections i capabilities.
- [x] Server-side čitanje `template_key` i `template_config` iz `businesses`.
- [x] Stabilan fallback na podrazumevani template.
- [x] Poseban desktop i mobile renderer unutar template-a.
- [x] Centralni locale registry postoji kao pravac migracije.
- [-] `template_config` se učitava, ali se ne koristi za stvarno konfigurisanje template-a.
- [-] `Locale` je privremeno širok `string`, dok su kompletni UI prevodi i dalje samo `mk/sq/en`.

---

## 5. Aktivni milestone — Platform Core Stabilization

**Cilj:** ukloniti demo ograničenja i napraviti stabilnu osnovu pre admin dashboarda i drugog template-a.

### P0 — Obavezno pre nastavka platforme

- [ ] **PCS-01: Renderovati samo jedan viewport template**
  - U `auto` režimu ne mountovati istovremeno desktop i mobile aplikaciju.
  - Sprečiti duple sekcijske ID-jeve, nepotrebne efekte i dupli render.
  - Zadržati korektnu reakciju na promenu viewporta.

- [ ] **PCS-02: Jedan centralni default tenant**
  - Ukloniti duplikate konstante `lumiere-studio`.
  - Svi API-jevi i UI koriste isti centralni izvor.
  - Default tenant ostaje samo development/demo fallback.

- [ ] **PCS-03: Tenant resolver**
  - Definisati prioritet: custom domain → subdomain/path → development fallback.
  - Dodati validaciju i business-not-found stranicu.
  - Ne dozvoliti da nepoznat tenant tiho prikaže podatke Lumière salona.

- [ ] **PCS-04: Stvarni typed template config**
  - Napraviti `HairLuxuryTemplateConfig`.
  - Validirati bazni JSON pre upotrebe.
  - Proslediti config kroz `TemplateRenderer` do desktop/mobile template-a.
  - Prva podržana podešavanja: redosled/vidljivost sekcija, hero poravnanje, CTA tekst/ponašanje i layout varijante.

- [ ] **PCS-05: Server-side initial catalog**
  - Izdvojiti zajednički server data loader iz `/api/catalog` rute.
  - `page.tsx` učitava initial catalog na serveru.
  - `CatalogProvider` prima `initialCatalog` i ne prikazuje nepotreban loading pri prvom renderu.
  - Klijentski reload ostaje dostupan.

- [ ] **PCS-06: Produkciona podrška za slike**
  - Dodati Supabase Storage hostname u Next image konfiguraciju.
  - Definisati dozvoljene hostove ili bezbedan image proxy pristup.
  - Uvesti fallback sliku/placeholder za pogrešan URL.

- [ ] **PCS-07: Booking anti-abuse zaštita**
  - Rate limiting po IP-u i/ili business tenant-u.
  - Honeypot polje ili Turnstile.
  - Ograničiti ponovljene rezervacije istog kontakta u kratkom periodu.
  - Logovati odbijene pokušaje bez čuvanja suvišnih ličnih podataka.

- [ ] **PCS-08: Env i setup dokumentacija**
  - Dodati `.env.example` bez tajni.
  - Dokumentovati Supabase, Google OAuth i site URL varijable.
  - Zameniti generički create-next-app README stvarnim setup uputstvom.
  - Dokumentovati migracije i seed/demo tenant proceduru.

### P1 — Čišćenje i pouzdanost

- [ ] **PCS-09: Ukloniti stare mock ostatke**
  - `AvailabilitySlot`, `MockAvailabilityParams`, `MockBusyPeriod` i neupotrebljene demo asset tipove ukloniti nakon provere referenci.
  - Ukloniti zastarele komentare o prethodnim fazama.

- [ ] **PCS-10: Konsolidovati zajedničke tipove API odgovora**
  - Booking, availability i catalog response tipovi da ne budu ručno duplirani između API-ja i klijenta.
  - Uvesti stabilne error code unije.

- [ ] **PCS-11: Popraviti locale type safety**
  - Zameniti `Locale = string` kontrolisanim registry tipom.
  - Uvesti bezbedan fallback za Intl locale mapiranje.
  - Ne indeksirati fiksne mape proizvoljnim stringom.

- [ ] **PCS-12: Accessibility modal hardening**
  - Pravi focus trap u oba modala.
  - Sprečiti fokusiranje sadržaja iza modala.
  - Proveriti screen reader najave po koracima.
  - Proveriti keyboard navigaciju i reduced motion.

- [ ] **PCS-13: Booking state reset**
  - Potvrditi da zatvaranje i ponovno otvaranje modala uvek kreira čist flow.
  - Potvrditi ponašanje kada se modal otvara direktno sa service/employee kartice.
  - Dodati eksplicitan `key` ili reset mehanizam ako je potreban.

- [ ] **PCS-14: Error observability**
  - Strukturisani server logovi sa request/booking correlation ID-em.
  - Ne logovati pune lične podatke korisnika.
  - Dodati error tracking pre javnog lansiranja.

### Definition of Done za milestone

- [ ] Jedan viewport template je mountovan.
- [ ] Tenant se rešava centralno.
- [ ] `template_config` menja najmanje tri vidljiva ponašanja template-a.
- [ ] Prvi render dobija katalog sa servera.
- [ ] Booking API ima anti-abuse zaštitu.
- [ ] README i `.env.example` omogućavaju čist lokalni setup.
- [ ] Lint, build i osnovni integration testovi prolaze.

---

## 6. Sledeće faze po redosledu

## Faza 10 — Pravi multi-tenant javni runtime

- [ ] Dinamički tenant preko URL putanje za razvoj i staging.
- [ ] Custom domain mapping za produkciju.
- [ ] Dinamički metadata po salonu.
- [ ] Dinamički canonical URL.
- [ ] Open Graph/Twitter podaci po salonu.
- [ ] JSON-LD za `HairSalon`/lokalni biznis, kontakt, lokaciju i usluge.
- [ ] Tenant-specific manifest, naziv aplikacije, ikone i theme color.
- [ ] Bezbedno cache ponašanje po tenant-u.
- [ ] 404/disabled/maintenance stanja biznisa.

**DoD:** dva demo biznisa sa različitim domenom ili putanjom prikazuju različite podatke, temu, metadata i template bez promene koda.

---

## Faza 11 — Admin autentifikacija i osnova dashboarda

- [ ] Login stranica.
- [ ] Logout.
- [ ] Password reset / magic link odluka i implementacija.
- [ ] Zaštićene admin rute.
- [ ] Business membership i role model.
- [ ] Role minimum: owner, manager, staff.
- [ ] Tenant izolacija u svim admin upitima.
- [ ] Dashboard shell: sidebar, header, mobile navigation.
- [ ] Dashboard overview sa današnjim terminima i osnovnim metrikama.
- [ ] Audit log za kritične admin izmene.

**DoD:** owner vidi samo svoj biznis i može bezbedno da uđe/izađe iz dashboarda.

---

## Faza 12 — Admin upravljanje katalogom

### Biznis i branding

- [ ] Naziv, tagline, opis, kontakt, adresa i društvene mreže.
- [ ] Logo i hero slika.
- [ ] Boje teme.
- [ ] Currency, timezone i jezici.
- [ ] Template izbor i template konfiguracija.

### Kategorije i usluge

- [ ] CRUD kategorija.
- [ ] CRUD usluga.
- [ ] Cena: fixed/from/range.
- [ ] Trajanje i sorting.
- [ ] Aktivacija/deaktivacija.
- [ ] Lokalizovani sadržaj.

### Zaposleni

- [ ] CRUD zaposlenih.
- [ ] Fotografija, naziv uloge i bio.
- [ ] Dodela usluga zaposlenom.
- [ ] Custom cena i trajanje po zaposlenom.
- [ ] Sorting i active status.

**DoD:** novi salon može kroz admin bez SQL-a da podesi identitet, usluge i tim.

---

## Faza 13 — Raspored i booking operacije

- [ ] Opšte radno vreme biznisa.
- [ ] Radno vreme po zaposlenom.
- [ ] Pauze i blokirani periodi.
- [ ] Neradni dani, praznici i posebni datumi.
- [ ] Ručno kreiranje termina iz admina.
- [ ] Pregled dnevnog, nedeljnog i mesečnog kalendara.
- [ ] Promena statusa: pending, confirmed, completed, cancelled, no_show.
- [ ] Reschedule sa ponovnom proverom konflikta.
- [ ] Otkazivanje sa razlogom.
- [ ] Internal note.
- [ ] Search i filter po mušteriji, zaposlenom, usluzi i statusu.
- [ ] Google Calendar update/delete sync pri promenama.

**DoD:** salon može voditi svakodnevni raspored bez direktnog rada u Supabase-u ili Google Calendar-u.

---

## Faza 14 — Google Calendar upravljanje

- [ ] Potvrditi i završiti OAuth start rutu.
- [ ] Potvrditi i završiti callback rutu.
- [ ] Disconnect/revoke tok.
- [ ] Admin kartica sa statusom konekcije.
- [ ] Izbor ciljnog kalendara.
- [ ] Prikaz poslednje sync greške.
- [ ] Manual retry.
- [ ] Reconciliation job za `pending/failed` sync zapise.
- [ ] Update eventa pri reschedule-u.
- [ ] Delete/cancel eventa pri otkazivanju.
- [ ] Jasna politika šta se dešava sa ručno izmenjenim Google eventom.

**DoD:** admin može povezati Calendar bez ručnog unosa tokena i vidi pouzdan sync status.

---

## Faza 15 — Galerija, recenzije i sadržaj

- [ ] Supabase Storage upload.
- [ ] Crop/compression pipeline.
- [ ] CRUD galerije.
- [ ] Category i sorting galerije.
- [ ] Tabela recenzija.
- [ ] CRUD i approval recenzija.
- [ ] Ukloniti statičke Lumière recenzije iz `lib/contentData.ts`.
- [ ] Business setting za prikaz/sakrivanje sekcija.
- [ ] Empty-state dizajn kada sadržaj ne postoji.

**DoD:** sadržaj nijednog tenant-a nije hardkodovan u source kodu template-a.

---

## Faza 16 — Lokalizacija platforme

- [ ] Završiti centralni locale registry.
- [ ] Odvojiti UI locale od content locale bez privremenog `string` aliasa.
- [ ] Dodati srpski (`sr-Latn` i/ili `sr-Cyrl`) kao kompletan UI jezik.
- [ ] Postepeno dodati nemački, danski i druge ciljane jezike.
- [ ] Admin editor lokalizovanih polja.
- [ ] Fallback lanac po biznisu.
- [ ] Locale-aware SEO i canonical/hreflang strategija.
- [ ] Locale-aware email/SMS sadržaj.
- [ ] RTL spremnost ostaje registry capability, čak i ako prvi template nije odmah RTL-optimizovan.

**DoD:** novi kompletan UI jezik dodaje se centralno, bez izmene desetina komponenti.

---

## Faza 17 — Drugi template i template SDK

- [ ] Završiti stabilan config contract za `hair-luxury`.
- [ ] Definisati template capability API.
- [ ] Uvesti shared template primitives.
- [ ] Napraviti `hair-editorial` kao drugi hair/beauty template.
- [ ] Različit desktop layout.
- [ ] Različit mobile layout gde ima smisla, uz isti booking engine.
- [ ] Preview template-a u adminu.
- [ ] Safe migration template_config verzija.
- [ ] Dokumentovati proces dodavanja novog template-a.
- [ ] Kasnije dodavati template-e za druge uslužne niše.

**DoD:** isti tenant može promeniti `hair-luxury` u `hair-editorial` iz admina bez promene koda ili podataka kataloga.

---

## Faza 18 — Notifikacije i customer self-service

- [ ] Email potvrda rezervacije.
- [ ] Email za pending/confirmed status.
- [ ] Reminder pre termina.
- [ ] Otkazivanje preko sigurnog linka.
- [ ] Reschedule preko sigurnog linka.
- [ ] Opcioni SMS/WhatsApp provider sloj.
- [ ] Notification log i retry.
- [ ] Tenant-level notification podešavanja.
- [ ] GDPR/privacy tekst i retention pravila za customer podatke.

---

## Faza 19 — Testiranje, CI i release hardening

### Testovi

- [ ] Unit testovi za locale i normalizaciju podataka.
- [ ] Unit testovi za booking validaciju.
- [ ] Unit testovi za timezone/date formatiranje.
- [ ] Integration test za availability API.
- [ ] Integration test za booking API.
- [ ] Test za slot race condition.
- [ ] Test za Calendar sync failure bez rollback-a bookinga.
- [ ] E2E booking happy path.
- [ ] E2E slot-unavailable recovery.
- [ ] E2E mobile i desktop tok.

### CI/CD

- [ ] GitHub Actions: install, lint, typecheck, test, build.
- [ ] Preview deployment po PR-u.
- [ ] Staging Supabase projekat ili izolovana test baza.
- [ ] Migration check pre deploy-a.
- [ ] Production deploy checklist.
- [ ] Rollback procedura.

### Security/operations

- [ ] RLS audit.
- [ ] Secret rotation procedura.
- [ ] Dependency audit.
- [ ] Database backup/restore proba.
- [ ] Error monitoring.
- [ ] Uptime monitoring.
- [ ] Osnovni analytics sa privacy-aware konfiguracijom.
- [ ] Performance i Core Web Vitals audit.

**DoD:** nijedna promena ne ide u produkciju bez automatskog lint/type/test/build quality gate-a.

---

## Faza 20 — SaaS i komercijalni sloj

Ova faza se ne radi pre stabilnog admina i najmanje dva stvarna pilot salona.

- [ ] Self-service onboarding ili kontrolisani internal onboarding.
- [ ] Kreiranje novog business tenant-a.
- [ ] Pozivanje članova tima.
- [ ] Planovi i feature entitlements.
- [ ] Subscription billing.
- [ ] Trial i grace period.
- [ ] Custom domain onboarding.
- [ ] Usage limits.
- [ ] Super-admin/support panel.
- [ ] Export i offboarding tenant podataka.

---

## 7. Poznati tehnički dug i rizici

### Kritični

- [!] Default business slug je hardkodovan i dupliran.
- [!] Auto prikaz mountuje desktop i mobile template istovremeno.
- [!] Javni booking endpoint nema potvrđen rate limit/anti-spam zaštitu.
- [!] Prvi render kataloga zavisi od klijentskog fetch-a.
- [!] Ne postoji potvrđen CI quality gate.

### Srednji

- [!] `template_config` se učitava, ali se ne koristi.
- [!] SEO je hardkodovan na Lumière Studio.
- [!] Recenzije su demo sadržaj u source kodu.
- [!] `Locale = string` slabi type safety.
- [!] Remote image konfiguracija nije spremna za Supabase Storage i proizvoljne tenant assete.
- [!] API response i error tipovi su delimično duplirani.
- [!] Nema stvarnog focus trap-a u modalima.

### Za proveru

- [?] Ponašanje BookingFlow state-a posle zatvaranja i ponovnog otvaranja modala.
- [?] Sve SQL migracije i seed podaci moraju biti inventarisani u roadmapu nakon kompletnog lokalnog checkout-a.
- [?] Pun Google Calendar connect/callback/disconnect i cancellation lifecycle.
- [?] Build status trenutnog `main` commit-a sa pravim env varijablama.
- [?] PWA instalacija i standalone ponašanje na Android/iOS produkcionom URL-u.

---

## 8. Nepromenljive arhitektonske odluke

Ove odluke menjamo samo eksplicitnim zapisom razloga:

1. Desktop i mobile mogu imati različit UI, ali dele booking domen i API contract.
2. Klijent ne određuje konačnu dostupnost niti direktno upisuje booking.
3. Baza mora atomski sprečiti dupli termin.
4. Google Calendar je integracija, ne primarni izvor istine.
5. Calendar greška ne poništava uspešan booking.
6. Template ne sadrži podatke konkretnog salona.
7. Tenant izolacija mora važiti na serveru i u bazi, ne samo u UI-ju.
8. Jezici se dodaju kroz centralni registry i prevodilački contract.
9. Tajne se nikada ne commituju u repo.
10. Roadmap se ažurira u istom PR-u koji menja status faze.

---

## 9. Sledećih 10 konkretnih poteza

Redosled rada od trenutnog stanja:

1. [ ] Napraviti branch `platform-core-stabilization`.
2. [ ] Lokalno pokrenuti čist install, lint i build sa bezbednim env podešavanjem.
3. [ ] Popisati kompletno stablo repoa, SQL migracije i sve Google Calendar rute.
4. [ ] Popraviti dupli desktop/mobile mount u `SalonPlatform.tsx`.
5. [ ] Konsolidovati `DEFAULT_BUSINESS_SLUG`.
6. [ ] Uvesti typed `HairLuxuryTemplateConfig` i provući ga do template komponenti.
7. [ ] Izdvojiti server catalog loader i dodati `initialCatalog`.
8. [ ] Dodati `.env.example` i zameniti README stvarnim uputstvom.
9. [ ] Dodati osnovni rate limit/honeypot za booking.
10. [ ] Dodati prvi CI workflow i minimalne integration testove za availability/booking.

---

## 10. Evidencija rada

Svaka veća radna sesija dodaje jednu kratku stavku na vrh ovog odeljka.

### 2026-07-03 — Roadmap reset

- Pregledan trenutni javni runtime, katalog, availability, booking, template i Calendar sync kod.
- Potvrđeno da je booking end-to-end povezan sa Supabase backendom.
- Projekat više nije samo UI prototip; javni booking MVP funkcioniše kao proizvodni vertikalni presek.
- Aktivni fokus postavljen na **Platform Core Stabilization** pre admin dashboarda i drugog template-a.
- Napravljen ovaj master roadmap da chat više ne bude jedini izvor projektnog stanja.

---

## 11. Commit pravilo

Pre svakog commita:

```bash
git status
npm run lint
npm run build
```

Preporučeni format commita:

```text
<type>(<scope>): <kratak opis>
```

Primeri:

```text
fix(runtime): render only active viewport template
refactor(tenant): centralize default business slug
feat(template): apply typed hair luxury configuration
feat(admin): add protected dashboard shell
test(booking): cover slot conflict recovery
docs(roadmap): update platform core milestone
```

---

## 12. Pravilo za nove ideje

Nova ideja ne ulazi odmah u aktivni milestone. Prvo se dodaje u odgovarajuću buduću fazu i ocenjuje prema tri pitanja:

1. Da li rešava stvaran problem korisnika ili salona?
2. Da li se uklapa u postojeći domain model bez nepotrebnog komplikovanja?
3. Da li je važnija od trenutnog P0/P1 rada?

Samo ideje koje prođu sva tri pitanja mogu promeniti trenutni redosled.
