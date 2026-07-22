# ORDUM-WORKSPACE-APPSHELL-01B

## Status

Visible Workspace shell milestone.

## Cilj

Uvesti tenant-aware `/workspace` launcher koji koristi registry i visibility resolver iz 01A, bez prepisivanja postojećeg `/admin` ili `/staff` sistema.

## Uvedeno

- privatna `/workspace` ruta;
- `/workspace/login` intent selector;
- centralni `server-only` Workspace context adapter;
- postojeći owner/manager tenant context;
- postojeći staff membership context;
- eksplicitni `context=admin|staff` ulazi iz postojećih shell-ova;
- postojeći Product Package access;
- registry-backed launcher kartice;
- LIVE Studio kartica;
- zaključana Content `COMING SOON` kartica;
- skrivene research aplikacije;
- multi-tenant ulaz ka postojećem izboru salona;
- javni tenant link;
- desktop i mobile responsive layout;
- privacy/noindex proxy granica;
- ciljani context i source-contract testovi.

## Runtime tok

### Owner ili manager

```text
/admin
  -> Ordum Workspace
  -> /workspace?context=admin
  -> postojeći AdminContext
  -> aktivni tenant
  -> ProductPackageAccess
  -> Workspace visibility resolver
  -> Studio /admin
```

### Staff

```text
/staff
  -> Ordum Workspace
  -> /workspace?context=staff
  -> postojeći StaffContext
  -> aktivni business
  -> ProductPackageAccess
  -> Workspace visibility resolver
  -> Studio /staff
```

## Važne odluke

- Workspace ne uvodi novu sesiju ni novu lozinku;
- eksplicitni admin/staff intent ne prelazi automatski u drugi membership kontekst;
- direktni `/workspace` bez intenta proverava admin pa staff;
- privremena lozinka i dalje vodi u postojeći change-password tok;
- multi-tenant admin i dalje koristi postojeći `/admin/select-business`;
- staff bez employee veze i dalje koristi `/staff/setup-required`;
- Platform Admin nije Workspace identitet;
- Studio ostaje postojeći admin/staff runtime;
- Content je zaključan i nema lažnu funkcionalnu rutu;
- Finance, Operations i Store se ne prikazuju krajnjem korisniku;
- launcher prikazuje samo odluke server-side resolvera.

## Nije menjano

- booking;
- availability;
- admin navigacioni registry;
- staff permissions;
- Product Package registry;
- Product Strategy registry;
- baza;
- RLS;
- migracije;
- PWA manifest;
- service worker;
- Network;
- commit ili push.

## Code acceptance

1. `/workspace` koristi centralni server adapter;
2. owner/manager vidi Studio i Content coming-soon;
3. staff vidi samo Studio;
4. Studio vodi na postojeću role rutu;
5. research moduli nisu korisničke kartice;
6. paket može da zaključa Studio;
7. Platform Admin nije podržan Workspace intent;
8. admin i staff shell imaju vidljiv Workspace ulaz;
9. `/workspace` je noindex privatna površina;
10. ciljani lint/testovi, kompletan `npm run check` i staged diff check prolaze.

## Browser acceptance

Obavezno posle code PASS-a:

### Desktop

- owner/manager otvara Workspace iz admin shell-a;
- vidi aktivni salon, ulogu, LIVE Studio i zaključani Content;
- Studio vodi na postojeći `/admin`;
- javni sajt se otvara u novom tabu;
- multi-tenant link se prikazuje samo kada postoji više tenant-a.

### Mobile

- header i hero ne overflow-uju viewport;
- kartice su čitljive u jednoj koloni;
- admin Workspace ulaz postoji kroz mobile `Više` meni;
- staff Workspace ikona ostaje dostupna u header-u;
- LIVE i zaključani statusi su jasno različiti.

### Staff

- staff launcher prikazuje samo Studio;
- Studio vodi na postojeći `/staff`;
- owner/manager Content kartica se ne prikazuje staff-u.

## Sledeći korak

Posle code i browser PASS-a:

1. zaseban full-file `ROADMAP.md` closeout;
2. commit/push i fast-forward u `main`;
3. `ORDUM-DOCUMENTATION-IA-01`;
4. zatim `ORDUM-PWA-FOUNDATION-01`.
