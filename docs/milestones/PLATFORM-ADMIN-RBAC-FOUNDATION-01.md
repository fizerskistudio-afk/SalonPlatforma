# PLATFORM-ADMIN-RBAC-FOUNDATION-01

**Status:** application foundation active; database membership activation pending explicit approval.

## Cilj

Platform-admin ovlašćenja više se ne vezuju za hardkodovane provere role u UI-ju. Svaka platformska rola dobija capability skup, a API mutacije proveravaju odgovarajuću dozvolu na serveru.

Postojeći `PLATFORM_ADMIN_EMAILS` rollout ostaje aktivan i mapira postojeći dozvoljeni nalog na `super_admin`. Ovaj milestone ne menja korisnike, lozinke, environment ili bazu.

## Početne role

| Rola | Namenjena upotreba | Preview | Publish/lifecycle | Owner access | Monitoring |
| --- | --- | --- | --- | --- | --- |
| `super_admin` | puna platformska kontrola | da | da | da | da |
| `sales` | brzo kreiranje i uređivanje klijentskog preview-a | da | ne | ne | ne |
| `launch_manager` | QA, owner access i kontrolisano puštanje live | da | da | da | audit read |
| `it` | dijagnostika, incidenti i monitoring | read-only | ne | ne | da |

Department sloj se sada ne uvodi. Kasnije može grupisati članove i role bez promene permission contracta.

## Server-side granica

UI skrivanje nije authorization mehanizam. Svaka `/api/platform-admin` ruta zahteva capability koji odgovara operaciji:

- provision → `tenant.create`;
- profile → `tenant.profile.write`;
- media → `tenant.branding.write`;
- theme → `tenant.theme.write`;
- catalog → `tenant.catalog.write`;
- employees → `tenant.team.write`;
- schedule/time-off → `tenant.schedule.write`;
- settings → `tenant.settings.write`;
- bookings → `tenant.bookings.write`;
- credentials/access → `tenant.owner_access.write`;
- preview/public URL → `tenant.preview.read`;
- publication → status-specifični `tenant.publish`, `tenant.unpublish` ili `tenant.deactivate`.

Sales zato može da napravi i pregleda preview, ali direktan API poziv ne može da zaobiđe zabranu objavljivanja.

## Pending database model

`supabase/pending/029_platform_admin_rbac_foundation.sql` je source-only predlog i nije automatska migracija. Definiše:

- `platform_admin_role` enum;
- `platform_admin_members`, potpuno odvojen od tenant `business_members`;
- RLS bez direktnog authenticated pristupa;
- caller-only role RPC;
- zaštitu poslednjeg aktivnog `super_admin` naloga.

## Obavezni activation redosled

1. eksplicitno odobrenje za database promenu;
2. potvrda ciljnog Supabase projekta;
3. pretvaranje pending SQL-a u numerisanu migraciju i verification paket;
4. bootstrap postojećeg platform vlasnika kao `super_admin`, bez deljenja credentiala;
5. login i API smoke sa postojećim nalogom;
6. prebacivanje `PLATFORM_ADMIN_MEMBERSHIP_MODE` sa `legacy` na `hybrid`;
7. login i permission smoke za database Sales/IT naloge, uz potvrdu bootstrap fallback-a;
8. tek posle stabilnog smoke-a prelazak sa `hybrid` na `database`;
9. test Sales zabrane publish-a i zaštite poslednjeg super-admina;
10. kasnije team/department UI i immutable audit log.

Ako bilo koji bootstrap ili smoke korak ne prođe, aplikacija ostaje u legacy allowlist režimu.
