# ORDUM-DOCUMENTATION-IA-01

## Status

Docs-only documentation information architecture closeout.

## Problem

Root `ROADMAP.md` je vremenom postao append-only dnevnik. Čuvao je vrednu istoriju, ali više nije brzo odgovarao na osnovna operativna pitanja:

- gde smo;
- šta je aktivno;
- šta ide sledeće;
- šta je blokirano;
- gde se nalazi detaljna evidencija.

Istovremeno nije postojao jedan stabilan manifest koji objašnjava ko je Ordum Studios, šta gradi i koje principe ne želi da prekrši.

## Cilj

Razdvojiti operativni plan, trenutni status, dugoročni identitet, detaljnu implementation evidenciju i istoriju bez gubitka postojećeg sadržaja.

## Uvedeno

- skraćen i fokusiran root `ROADMAP.md`;
- `docs/STATUS.md` kao current-state snapshot;
- `docs/MANIFESTO.md` kao proizvodni i kompanijski manifest;
- `docs/DOCUMENTATION-INDEX.md` kao mapa dokumentacije;
- `docs/history/ROADMAP-LEGACY-2026-07-22.md` kao potpuni snapshot starog roadmap-a;
- brzi dokumentacioni linkovi u root `README.md`;
- source-of-truth hijerarhija;
- preporučeni handoff redosled;
- pravilo šta se ažurira posle koje vrste promene.

## Dokumentacione uloge

### README.md

Stabilni javni/tehnički ulaz u projekat.

### docs/MANIFESTO.md

Ko smo, šta pokušavamo da postanemo i koje principe ne želimo da žrtvujemo.

### docs/STATUS.md

Šta danas stvarno postoji, koji slojevi su LIVE/BETA/COMING SOON/RESEARCH i koje granice nisu zatvorene.

### ROADMAP.md

Aktivni milestone, sledeći redosled, blockeri, non-blocker-i i delivery pravila.

### docs/architecture/

Dugoročne tehničke i proizvodne odluke.

### docs/milestones/

Detaljna implementation i acceptance evidencija.

### docs/history/

Neizmenjeni istorijski snapshot-i.

## Acceptance

1. kompletan prethodni roadmap je sačuvan u history snapshot-u;
2. novi roadmap može brzo da se pročita i ne pokušava da bude kompletna istorija;
3. current status ne predstavlja nedovršene module kao gotove;
4. manifest jasno razlikuje Ordum Studios, Workspace i Network;
5. dokumentaciona source-of-truth hijerarhija je eksplicitna;
6. README vodi ka glavnim dokumentima;
7. svi novi lokalni linkovi pokazuju na postojeće fajlove;
8. `git diff --cached --check` prolazi;
9. nema runtime, UI, baze, migracije, auth, booking ili PWA izmene.

## Poznata odluka

Workspace launcher visual polish nije deo ovog milestone-a. Zabeležen je kao budući compact Citrix Workspace-like pravac, ali sledeći code milestone ostaje `ORDUM-PWA-FOUNDATION-01`.

## Sledeći korak

`ORDUM-PWA-FOUNDATION-01`.
