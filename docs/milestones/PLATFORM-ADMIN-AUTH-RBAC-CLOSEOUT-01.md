# PLATFORM-ADMIN-AUTH-RBAC-CLOSEOUT-01

**Status:** application closeout implemented; database activation intentionally pending.

## Ishod

Platform-admin autentikacija i autorizacija imaju zasebnu application granicu:

- `/platform-admin/login` ne zavisi od tenant `business_members` članstva;
- postojeći bootstrap nalog ostaje `super_admin` u `legacy` režimu;
- sve platform role koriste centralni capability registry;
- server API mutacije odbijaju nedozvoljenu rolu nezavisno od UI-ja;
- platform shell više ne usmerava korisnika u tenant-admin panel;
- auth callback prihvata samo normalizovanu same-origin putanju;
- role resolver je spreman za kontrolisani `legacy → hybrid → database` rollout.

## Membership režimi

| Režim | Database RPC | Allowlist | Namenjena faza |
| --- | --- | --- | --- |
| `legacy` | ne | da, kao `super_admin` | trenutno stanje pre migracije |
| `hybrid` | da, prioritetno | da, break-glass fallback | migracija i kontrolisani smoke |
| `database` | da | ne | završno produkciono stanje |

Nepoznata vrednost konfiguracije fail-uje zatvoreno. `database` režim nikada ne koristi legacy allowlistu kao fallback.

## Role contract

- `super_admin`: sve registrovane platformske capability dozvole;
- `sales`: kreiranje i uređivanje klijentskog preview-a, bez owner pristupa i lifecycle release-a;
- `launch_manager`: QA, owner access, rezervacije i publish/deactivate/reactivate;
- `it`: read-only tenant dijagnostika, audit i monitoring osnova, bez tenant mutacija.

Department sloj nije potreban za aktivaciju ovih pravila. Kasnije može grupisati članove bez promene permission contracta.

## Odložena aktivacija baze

`supabase/pending/029_platform_admin_rbac_foundation.sql` ostaje source-only. Ovaj milestone:

- ne izvršava SQL;
- ne kreira ili menja auth korisnike;
- ne menja environment;
- ne uključuje `hybrid` ili `database` režim;
- ne uklanja bootstrap pristup postojećeg super-admina.

Aktivacija se radi tek posle četiri završene teme i spremnog domena, kroz zasebnu migraciju, verification paket, bootstrap i rollback plan.

## Main source integration i production-launch gate

Source integracija u `main` dozvoljena je kada:

1. `main` i razvojna grana imaju pregledanu, konflikt-free topologiju;
2. kompletan lint/test/TypeScript/build prolazi nad tačnim kandidatom;
3. postoji rollback checkpoint starog `main`-a;
4. vlasnik eksplicitno odobri commit, push i integraciju.

Ovo ne aktivira niti proglašava završenim database RBAC rollout. Komercijalni production launch ostaje blokiran dok nisu završeni:

1. kompletan platform-admin workflow i `MASTER-SYSTEM-QA-01`;
2. domen, backup/restore i legal gate;
3. zasebno odobrena RBAC database odluka za pending `029`;
4. stvarni deployment/browser smoke;
5. eksplicitna production-launch dozvola vlasnika projekta.
