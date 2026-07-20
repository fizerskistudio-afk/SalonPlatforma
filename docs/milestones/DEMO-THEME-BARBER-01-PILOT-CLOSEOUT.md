# DEMO-THEME-BARBER-01 — PILOT VISUAL CLOSEOUT

**Datum:** 20. jul 2026.
**Status:** lokalni code PASS, ručni browser vizuelni PASS, staged; commit, tag i push čekaju eksplicitnu autorizaciju.
**Branch:** `backup/theme-core-barber-beta`

## Cilj

Zatvoriti `barber-heritage` kao vizuelno spremnu pilot temu za prve stvarne salone, bez promene booking domena, tenant podataka, baze, migracija ili mobile app-shella.

## Prihvaćeni desktop tok

Kompletan desktop prikaz je ručno pregledan i prihvaćen:

- Hero;
- Usluge;
- Berberi;
- Galerija;
- Recenzije;
- Kontakt i lokacija.

Sekcije zadržavaju postojeće booking ulaze, lokalizaciju i tenant podatke. Vizuelni rad ne uvodi novu baznu zavisnost niti hardkodovani demo tenant.

## Implementirano

### Usluge

- interaktivni category navigator;
- aktivna kategorija menja listu usluga i pozadinski kadar;
- direktan service booking ostaje povezan;
- ulazni motion koordinisan preko zajedničkog reveal hook-a.

### Berberi

- dominantan aktivni portret;
- numerisani interaktivni roster;
- localized role/bio sadržaj;
- direktan employee booking;
- empty state i reduced-motion podrška.

### Galerija

- dominantna aktivna fotografija;
- dvokolonska arhiva radova;
- hover, fokus i klik menjaju aktivnu fotografiju;
- kompaktna viewport varijanta prihvaćena u browseru;
- prazno stanje i reduced-motion podrška.

### Recenzije

- Barber tema ostaje na zajedničkom `CatalogReviewsSection` adapteru;
- editorial variant je izdvojen u `components/reviews`;
- dominantna aktivna recenzija;
- rating summary i distribucija ocena;
- interaktivni indeks;
- trust badge, owner reply i bezbedni Google linkovi;
- preview režim ne aktivira review akcije;
- mobile reviews ostaju na postojećem shared prikazu.

### Kontakt i lokacija

- sekcija pravilno označena kao `05`;
- premium lokacijski kadar;
- postojeća adresa otvara Google Maps pretragu;
- booking CTA;
- telefon, email i Instagram;
- grupisano radno vreme i timezone;
- viewport reveal i reduced-motion podrška.

## Arhitektonske granice

- `barber-heritage` desktop ostaje modularan;
- mobile app-shell nije menjan;
- Reviews data logika ostaje u shared adapter sloju;
- nema nove animation biblioteke;
- nema database write-a ili migracije;
- nema promene `main` grane;
- nema commita, taga ili push-a u installerima.

## Validacija

Tokom prihvaćenih paketa potvrđeni su:

- ciljani Barber acceptance testovi;
- kompletni Reviews integration contract testovi;
- TypeScript `--noEmit`;
- `npm run check`, koji uključuje lint, kompletan Vitest suite i production build;
- staged diff provera;
- ručni desktop browser pregled.

Završni kontakt paket je završio sa devet staged source fajlova i vizuelno je prihvaćen bez blocker-a.

## Poznata ograničenja

Lokacijski kadar je trenutno stilizovana mapa, ne pravi Google Maps embed. Link otvara stvarnu Google Maps pretragu iz postojeće adrese.

Ovo ostaje namerni pilot baseline. `BARBER-V2-CONTACT-MAP-01` je planiran kao prvi kontrolisani theme update dok jedan pilot salon već aktivno koristi platformu. Update mora imati fallback kada API ključ ili embed nisu dostupni.

## Pilot odluka

Prvi pilot obuhvata dva do tri stvarna salona iz Svilajnca:

- do 30 dana kontrolisanog besplatnog korišćenja;
- stvarni unos usluga, zaposlenih, fotografija i radnog vremena;
- stvarne rezervacije i operativni feedback;
- problemi se dele na blocker, UX problem, vizuelnu doradu i kasniji backlog;
- popust ili Founding Partner uslovi ostaju komercijalna odluka, ne hardkodovan platformski entitlement.

Detaljan runbook: `docs/qa/BARBER-PILOT-ONBOARDING-01-RUNBOOK.md`.

## Release checkpoint

Predloženi commit:

```text
feat(theme): complete barber pilot visual experience
```

Predloženi annotated tag:

```text
barber-v2-pilot-01
```

Commit, tag i push se izvršavaju tek posle eksplicitne autorizacije vlasnika projekta.
