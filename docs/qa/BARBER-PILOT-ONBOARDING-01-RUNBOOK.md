# BARBER-PILOT-ONBOARDING-01 — REAL SALON TEST RUNBOOK

**Datum:** 20. jul 2026.
**Opseg:** 2–3 pilot salona u Svilajncu.
**Pilot trajanje:** do 30 dana po salonu.

## Cilj

Potvrditi da platforma radi u realnom salonskom okruženju, sa stvarnim vlasnicima, uslugama, zaposlenima i rezervacijama. Pilot nije samo vizuelni test sajta.

Glavna pitanja:

1. Da li vlasnik može samostalno da upravlja osnovnim podacima?
2. Da li mušterija bez objašnjenja može da zakaže termin?
3. Da li sistem sprečava konflikte i nepotrebnu ručnu intervenciju?
4. Da li theme update može bezbedno da se isporuči aktivnom tenant-u?
5. Da li salonu platforma nedostaje kada se ukloni iz svakodnevnog toka?

## Izbor pilot salona

Poželjna kombinacija:

- jedan manji salon sa jednom ili dve osobe;
- jedan salon sa više zaposlenih;
- jedan salon koji već prima veći broj termina preko telefona ili Instagrama.

Ne uključivati više od tri salona u prvom talasu.

## Baseline pre početka

Za svaki salon zabeležiti:

- tenant slug;
- theme;
- publication status;
- vlasnika i članove;
- broj kategorija i usluga;
- broj zaposlenih;
- radno vreme;
- booking pravila;
- kontakt podatke;
- broj početnih rezervacija;
- datum i verziju deploy-a.

Ne čuvati lozinke, raw tokene ili privatne customer podatke u QA dokumentima.

## Onboarding checklist

- [ ] kreiran tenant kroz postojeći provisioning tok;
- [ ] salon ostaje draft dok sadržaj nije potvrđen;
- [ ] uneti branding, logo i fotografije;
- [ ] potvrđene kategorije, usluge, trajanja i cene;
- [ ] uneti zaposleni i radno vreme;
- [ ] provereni telefon, email, Instagram i adresa;
- [ ] vlasnik dobio pristup i promenio privremenu lozinku;
- [ ] desktop i mobile preview pregledani;
- [ ] booking ostaje onemogućen u preview režimu;
- [ ] pre objave potvrđena lifecycle readiness pravila;
- [ ] javni URL radi tek nakon kontrolisanog publish-a.

## Zadaci za vlasnika salona

Bez unapred objašnjenog idealnog toka vlasnik treba da:

1. promeni cenu jedne usluge;
2. promeni trajanje jedne usluge;
3. doda ili izmeni zaposlenog;
4. promeni radno vreme jednog dana;
5. pronađe novu rezervaciju;
6. pomeri ili otkaže test rezervaciju;
7. pronađe kontakt i lokaciju na javnom sajtu;
8. prijavi svaki korak koji nije razumeo bez pomoći.

## Zadaci za mušteriju

Tester mušterija treba da:

1. pronađe željenu uslugu;
2. izabere zaposlenog ili opciju bilo kog zaposlenog;
3. izabere datum i slobodan termin;
4. završi rezervaciju;
5. pronađe adresu, telefon i radno vreme;
6. oceni koliko je tok bio jasan bez instrukcija.

## Feedback format

Za svaki problem zabeležiti:

```text
salon:
datum i vreme:
uređaj:
browser:
tenant URL:
uloga korisnika:
stranica ili sekcija:
šta je korisnik pokušao:
šta je očekivao:
šta se dogodilo:
da li je mogao da nastavi:
screenshot ili video:
```

## Prioritet problema

### P0 — blocker

- booking ne može da se završi;
- dupla rezervacija;
- pogrešan tenant ili cross-tenant podatak;
- owner nema pristup sopstvenom salonu;
- objavljen salon nije dostupan;
- gubitak ili neželjena promena podataka.

P0 zaustavlja rollout i zahteva trenutni rollback ili hotfix.

### P1 — ozbiljan UX ili operativni problem

- korisnik ne nalazi ključnu akciju;
- pogrešan termin ili zaposleni se prikazuje;
- admin akcija daje nejasan rezultat;
- mobile ili desktop tok je praktično neupotrebljiv.

### P2 — vizuelna ili manja UX dorada

- prevelik tekst;
- neidealni razmaci;
- nejasna labela koja ne blokira tok;
- sitna responsive nepravilnost.

### P3 — ideja za backlog

- nova funkcija;
- custom zahtev jednog salona;
- napredna automatizacija;
- integracija koja nije potrebna za pilot stabilnost.

## Dnevni minimum praćenja

Po salonu pratiti:

- broj kreiranih rezervacija;
- broj otkazanih i pomerenih rezervacija;
- neuspele pokušaje;
- ručne pozive zbog nejasnog sajta;
- broj owner intervencija;
- prijavljene P0/P1 probleme;
- vreme potrebno da se problem reprodukuje i reši.

## Prvi live theme update

`BARBER-V2-CONTACT-MAP-01` je kandidat za prvi update aktivnog tenant-a.

Redosled:

1. prikupiti najmanje nekoliko dana stabilnog baseline-a;
2. uključiti novu mapu samo jednom pilot salonu;
3. zadržati fallback na trenutni stilizovani lokacijski kadar;
4. proveriti javni sajt, booking i admin pre i posle deploy-a;
5. pratiti performance i browser greške;
6. tek nakon PASS-a uključiti ostalim pilot salonima.

Update ne sme da menja booking, rezervacije, korisničke naloge, usluge, zaposlene, bazu ili migracije.

## Rollback dokaz

Pre svakog live update-a zabeležiti:

- prethodni commit SHA;
- prethodni deploy;
- feature flag ili tenant allowlist stanje;
- tačan rollback korak;
- osobu koja potvrđuje post-update smoke.

Prvi odgovor na problem treba da bude isključivanje feature flag-a ili vraćanje prethodnog deploymenta, ne naslepo popravljanje produkcije.

## Završni razgovor posle 30 dana

Postaviti direktna pitanja:

- Koji deo ti je najviše uštedeo vreme?
- Šta si ipak nastavio da radiš telefonom ili porukama?
- Gde si morao da tražiš pomoć?
- Šta bi te sprečilo da nastaviš da koristiš platformu?
- Da platforma sutra nestane, da li bi ti dovoljno nedostajala da je platiš?
- Da li bi je preporučio drugom salonu?

Rezultat pilota mora da razdvoji kritične popravke od custom zahteva jednog salona.
