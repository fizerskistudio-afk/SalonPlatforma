# PLATFORM-ADMIN-LIFECYCLE-READINESS-01

**Status:** PASS; installer, runtime pregled i radna grana potvrđeni u commitu `79952de`.

## Cilj

Publishing više ne sme da bude običan status update. Platform-admin koristi jedan readiness ugovor, eksplicitne lifecycle prelaze i server-side enforcement kako polugotov tenant ne bi bio objavljen slučajno ili direktnim API pozivom.

## Readiness ugovor

Centralni `lib/platform-admin/tenant-lifecycle.ts` razlikuje:

| Pogled | Kriterijumi | Posledica |
| --- | --- | --- |
| technical | eksplicitna tema i validan default/supported locale odnos | tenant može koristiti očekivani template i jezički contract |
| content | kontakt, aktivna kategorija i aktivna usluga u aktivnoj kategoriji | sadržaj je dovoljan za klijentski pregled |
| booking | booking settings, aktivan zaposleni, validna dodela usluge i salonsko radno vreme | availability i booking imaju osnovne operativne podatke |
| owner access | najmanje jedan aktivan owner membership | klijent ima operativni pristup |
| preview | technical + content | interni preview je sadržajno smislen |
| production | preview + booking + owner access | publish može da prođe |

Svaki blocker sadrži direktan platform-admin `href`. Isti pure evaluator koriste overview UI i server-side publish gate.

## Lifecycle contract

- `draft → published | suspended | archived`;
- `published → draft | suspended | archived`;
- `suspended → draft | published | archived`;
- `archived → draft`;
- arhiviran tenant ne može direktno u `published`;
- povratak iz `suspended` ili `archived` u draft zahteva `tenant.reactivate`;
- `published` zahteva `tenant.publish` i kompletan production readiness;
- `publication_status` i `is_active` menjaju se zajedno u jednoj update operaciji.

## Concurrency i recovery

Lifecycle request mora poslati `expectedUpdatedAt`. Server:

1. ponovo učitava tenant i readiness;
2. odbija zastarelu verziju sa `LIFECYCLE_CHANGED`;
3. proverava rolu, dozvoljeni prelaz i publish readiness;
4. update ograničava sa `id` i očekivanim `updated_at`;
5. ako je tenant promenjen pre čuvanja, vraća recovery poruku za refresh i retry.

## UI granica

- status i akcije su vizuelno i tekstualno razdvojeni;
- publish dugme je disabled kada production readiness nije kompletan;
- server ostaje autoritativan čak i ako se UI zaobiđe;
- destructive i release akcije imaju confirmation;
- blocker poruke vode direktno na Tema, Branding, Profil, Katalog, Tim, Podešavanja ili Pristup;
- nezavisni `is_active` checkbox je uklonjen iz profile editora;
- profile API eksplicitno odbija legacy `isActive` payload.

## Audit granica

Uspešna promena emituje strukturisan server event `tenant.lifecycle.changed` sa actor ID/email/rolom, tenant ID/slug-om, starim i novim statusom, operativnim stanjem i verzijama. Event ne sadrži credentials ili tajne.

Ovo nije trajni database audit trail. Nova audit tabela, retention i pristup logovima zahtevaju kasniju eksplicitno odobrenu migraciju i nisu prikriveni database write ovog milestone-a.

## Nije deo milestone-a

- nema Supabase migracije;
- nema promene production env-a;
- nema aktivacije database RBAC režima;
- nema email ili cron aktivacije;
- nema promene Lumière teme, galerije ili javnog layout-a;
- nema eksternog expiring preview tokena — to pripada `CLIENT-PREVIEW-SHARING-01`.

## Acceptance

- [x] installer preflight potvrđuje granu, commit tree i čist working tree/index;
- [x] targeted lifecycle/readiness behavior testovi prolaze;
- [x] Sales je odbijen pre lifecycle data access-a;
- [x] incomplete tenant dobija `TENANT_NOT_READY` i direktne blocker CTA podatke;
- [x] stale lifecycle request dobija `LIFECYCLE_CHANGED` bez mutation-a;
- [x] archived direct publish je odbijen;
- [x] validan publish atomarno usklađuje `publication_status` i `is_active`;
- [x] legacy profile `isActive` write je odbijen pre database access-a;
- [x] TypeScript, lint, svi testovi i production build prolaze;
- [x] desktop i mobile tenant overview smoke potvrđuju akcije, blocker linkove i confirmation;
- [x] stvarni installer output je pregledan pre PASS oznake.
