# ORDUM-WORKSPACE-APPSHELL-01A

## Status

Source-only foundation milestone.

## Cilj

Uvesti jedan typed izvor istine za buduće Ordum Workspace aplikacije bez vidljivog `/workspace` UI-ja i bez paralelnog auth, entitlement ili routing sistema.

## Uvedeno

- `WorkspaceAppKey`: `studio`, `content`, `finance`, `operations`, `store`;
- role contract: `owner`, `manager`, `staff`;
- početni Workspace App Registry;
- postojeći rollout status i release policy tipovi iz Product Strategy sloja;
- role-specific route contract;
- role-specific product entitlement zahtevi;
- dependency contract;
- čist visibility resolver;
- `server-only` entrypoint za budući AppShell;
- ciljani registry i visibility testovi.

## Početni rollout

| App | Status | Route |
|---|---|---|
| Studio | LIVE | owner/manager `/admin`, staff `/staff` |
| Content | COMING SOON | `/workspace/content` |
| Finansije | RESEARCH | `/workspace/finance` |
| Operacije | RESEARCH | `/workspace/operations` |
| Store | RESEARCH | `/workspace/store` |

## Važne odluke

- `Studio` koristi postojeće admin/staff tokove;
- ne uvodi se novi auth context;
- Platform Admin nije tenant Workspace aplikacija;
- owner/manager Studio traži `booking.management`;
- staff Studio traži `staff.portal`;
- Content se prikazuje samo kao zaključan `COMING SOON`;
- research moduli su podrazumevano skriveni;
- research se može eksplicitno prikazati samo kao zaključan interni signal;
- registry ne daje pristup sam po sebi;
- server resolver mora dobiti već potvrđenu rolu i `ProductPackageAccess`.

## Nije menjano

- `/admin` UI ili rute;
- `/staff` UI ili rute;
- booking;
- availability;
- customer podaci;
- baza;
- RLS;
- migracije;
- Product Package registry;
- Product Strategy registry;
- PWA manifest;
- service worker;
- Workspace UI;
- Network UI;
- commit ili push.

## Acceptance

1. samo je `studio` LIVE;
2. Content je pošteno `COMING SOON`;
3. Finance, Operations i Store su `RESEARCH`;
4. owner/manager Studio vodi na `/admin`;
5. staff Studio vodi na `/staff`;
6. package entitlement može da zaključa Studio;
7. staff ne vidi owner/manager module;
8. research je skriven osim eksplicitnog internog prikaza;
9. server entrypoint je `server-only`;
10. ciljani lint/testovi, kompletan `npm run check` i staged diff check prolaze.

## Sledeći korak

Posle code PASS-a i ROADMAP closeout-a sledi `ORDUM-WORKSPACE-APPSHELL-01B`:

- tenant-aware `/workspace` launcher;
- server-side učitavanje aktivnog tenant-a, role i package access-a;
- Studio kartica ka postojećem `/admin` ili `/staff`;
- pošten locked/coming-soon prikaz;
- desktop/mobile browser acceptance;
- bez velikog admin route rewrite-a.
