# Ordum Studios — Documentation Index

Ovaj dokument objašnjava gde se nalazi koja vrsta informacije i kojim redom treba čitati repo.

## Brzi ulazi

| Dokument | Odgovara na pitanje | Ažuriranje |
|---|---|---|
| [`docs/MANIFESTO.md`](MANIFESTO.md) | Ko smo i kakvu firmu gradimo? | Kada se promeni dugoročni identitet ili princip |
| [`docs/STATUS.md`](STATUS.md) | Šta danas stvarno radi? | Posle većeg production ili architecture checkpoint-a |
| [`ROADMAP.md`](../ROADMAP.md) | Šta radimo sada i šta ide sledeće? | Posle svakog prihvaćenog milestone-a |
| `docs/architecture/` | Zašto je sistem organizovan ovako? | Kada se zaključa ili promeni dugoročna odluka |
| `docs/milestones/` | Šta je tačno urađeno i kako je prihvaćeno? | Jedan dokument po milestone-u |
| `docs/history/` | Kako je plan izgledao ranije? | Snapshot, bez retroaktivnog prepravljanja |

## Source-of-truth hijerarhija

Kada dokumenti deluju kontradiktorno, koristi sledeći redosled:

1. stvarni production kod i primenjene migracije;
2. najnoviji prihvaćeni milestone dokument;
3. `docs/STATUS.md`;
4. root `ROADMAP.md`;
5. architecture dokumenti;
6. root `README.md`;
7. istorijski snapshot-i.

Istorijski dokument nikada ne pobeđuje noviji prihvaćeni contract.

## Preporučeni handoff redosled

Novi chat ili saradnik treba da pročita:

1. root `README.md`;
2. `docs/MANIFESTO.md`;
3. `docs/STATUS.md`;
4. root `ROADMAP.md`;
5. milestone dokument poslednjeg završenog milestone-a;
6. architecture dokument direktno povezan sa sledećim milestone-om;
7. tek zatim relevantni source kod.

## Glavni architecture dokumenti

### Product i platforma

- [`docs/architecture/ORDUM-WORKSPACE-NETWORK-ROADMAP-01.md`](architecture/ORDUM-WORKSPACE-NETWORK-ROADMAP-01.md)
- [`docs/architecture/PLATFORM-GROWTH-ARCHITECTURE-01.md`](architecture/PLATFORM-GROWTH-ARCHITECTURE-01.md)
- [`docs/product/ORDUM-PRODUCT-LADDER-01.md`](product/ORDUM-PRODUCT-LADDER-01.md)

### Runtime izvori istine

- `lib/product-packages/` — technical package i entitlement;
- `lib/product-strategy/` — rollout, commercial offer i platform level;
- `lib/workspace-apps/` — Workspace app registry i visibility;
- `lib/workspace/` — Workspace identity/context adapter;
- `lib/growth/` — canonical discovery source foundation;
- `lib/auth/` — admin, staff i platform-admin identity granice.

## Milestone dokumenti

`docs/milestones/` je implementation evidencija, ne glavni roadmap.

Svaki novi milestone dokument treba da sadrži:

- cilj;
- scope;
- šta je uvedeno;
- šta nije menjano;
- security/tenancy odluke;
- code acceptance;
- browser/runtime acceptance kada je primenljiv;
- poznata ograničenja;
- sledeći konkretan korak.

Završeni milestone se ne briše i ne prepisuje samo zato što je kasnije urađen bolji sistem. Novi dokument treba da objasni šta ga je zamenilo.

## Istorija

[`docs/history/ROADMAP-LEGACY-2026-07-22.md`](history/ROADMAP-LEGACY-2026-07-22.md) čuva originalni append-only roadmap pre dokumentacionog cleanup-a.

Istorija služi za:

- dokaz redosleda odluka;
- handoff starih milestone-a;
- pronalaženje odloženih obaveza;
- razumevanje zašto je sistem došao do trenutnog stanja.

Istorija nije dnevna operativna lista.

## Pravilo izmene dokumentacije

- promena runtime-a mora imati milestone zapis;
- promena prioriteta mora ažurirati `ROADMAP.md`;
- promena stvarnog production stanja mora ažurirati `STATUS.md`;
- promena dugoročnog identiteta ili principa mora eksplicitno ažurirati `MANIFESTO.md`;
- stari snapshot se ne prepravlja retroaktivno;
- dokument koji tvrdi da je nešto završeno mora navesti dokaz ili povezani milestone.
