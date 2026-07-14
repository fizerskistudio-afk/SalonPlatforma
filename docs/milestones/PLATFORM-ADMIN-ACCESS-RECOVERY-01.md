# PLATFORM-ADMIN-ACCESS-RECOVERY-01

**Status:** 01A je prošao lokalni installer, browser smoke i pushovan je na radnu granu kao `b857432`. 01B application implementation je pripremljen; root installer, stvarni lokalni output i browser smoke su obavezni pre završnog PASS-a.

## Audit rezultat

Postojeći access ekran je imao dva owner onboarding toka:

- Supabase email invitation kroz `BusinessOwnerAccessManager`;
- direktne privremene credentials kroz `BusinessOwnerCredentialManager`.

Membership, email confirmation i poslednja prijava su postojali, ali UI je heuristički nazivao stanje naloga. `must_change_password`, credential provenance i Auth lookup failure nisu bili deo page contract-a. Resend je koristio slučajni provider idempotency ključ, pa je svaki retry bio nova isporuka. Obavezna promena lozinke menjala je password i Auth metadata u dve odvojene operacije, što je ostavljalo moguć parcijalni failure.

## 01A — owner state i recovery

### Autoritativna stanja

`resolveOwnerAccessState` izvodi stanje iz aktivnog membership-a i server-side Auth podataka:

| Stanje | Značenje | Dozvoljeni recovery |
| --- | --- | --- |
| `invited` | email poziv nije potvrđen | kontrolisani resend poziva |
| `password_pending` | privremena lozinka ili potvrđen invite još traže završetak | credential reset ili recovery link, zavisno od izvora |
| `active` | Auth nalog i aktivni owner membership su spremni | standardni login/reset tok |
| `disabled` | membership je deaktiviran | eksplicitna reaktivacija |
| `recovery_required` | membership postoji, ali Auth nalog nije potvrđen | platform-admin dijagnostika; tenant se ne smatra owner-ready |

Direktni temporary-password nalog ne dobija email resend CTA. Njegov recovery ostaje eksplicitno generisanje nove privremene lozinke. Invitation nalog koristi invite/recovery link.

### Password completion

- Auth user se učitava pre bilo kakve izmene;
- nova privatna lozinka i `must_change_password=false` šalju se u jednoj Auth admin update operaciji;
- credential provenance se čuva;
- postojeći parcijalno završeni nalog može bezbedno ponoviti istu formu;
- neuspešan refresh sesije završava lokalnim sign-out-om umesto rada sa zastarelim claims-ima.

### Domain idempotency

- invitation resend koristi postojeći `notification_deliveries` servis;
- deterministički dedupe domen čine business, membership, link type i 15-minutni resend prozor;
- paralelni klik ili retry u istom prozoru ne šalje drugi email;
- delivery disabled/test režim poštuju centralnu email konfiguraciju;
- action link se ne upisuje u delivery metadata;
- paket ne menja email konfiguraciju i tokom testova ne šalje email.

## 01B — multi-tenant owner selector

Paket uvodi:

- eksplicitan izbor salona kada owner/manager ima više aktivnih membership-a;
- `HttpOnly`, `SameSite=Lax` active-business cookie;
- server-side proveru izabranog business ID-a prema stvarnom user membership-u na svakom requestu;
- selector posle login-a i switch CTA u tenant-admin shell-u;
- automatski fallback samo kada postoji tačno jedan važeći tenant;
- čišćenje active-business cookie-ja na logout-u.

Cookie nije authorization izvor. Izmenjen ili zastareo cookie nikada ne daje pristup tenant-u bez aktivnog membership-a.

### Serverski selection contract

- lista opcija nastaje samo iz aktivnih owner/manager membership-a i aktivnih business zapisa;
- kada postoji jedan važeći tenant, server ga bezbedno koristi bez obaveznog selector ekrana;
- kada postoji više tenant-a i nema validne preference, zaštićene stranice idu na `/admin/select-business`;
- selector action proverava UUID i ponovo ga uparuje sa server-validiranom listom trenutnog korisnika pre postavljanja cookie-ja;
- promenjen, stran ili zastareo cookie ne bira tenant i zahteva novi eksplicitan izbor;
- direktni admin API mutation tokovi vraćaju `TENANT_SELECTION_REQUIRED` dok izbor nije završen;
- logout briše i Supabase sesiju i active-business cookie;
- promena privremene lozinke ima prioritet, a multi-tenant selector sledi tek posle uspešnog završetka.

### 01B browser smoke

1. single-tenant owner posle login-a ide direktno na `/admin`;
2. multi-tenant owner bez preference ide na `/admin/select-business`;
3. izbor svakog salona otvara odgovarajući dashboard i podatke tog salona;
4. `Promeni salon` ponovo otvara selector na desktopu i mobilnom;
5. ručno izmenjen cookie na strani business ID ne daje pristup i vraća selector;
6. logout, pa novi login, ne zadržava prethodni izbor;
7. owner sa privremenom lozinkom prvo završava `/admin/change-password`, zatim bira salon.

## Granice milestone-a

- nema SQL migracije ili database schema promene;
- nema izmene produkcionog email/cron režima;
- nema email slanja tokom installer provera;
- nema promene platform-admin RBAC migration source-a;
- nema promene Lumière teme, galerije ili javnog layout-a;
- nema čitanja `.env.local`.

## 01A acceptance

- [x] invited, password-pending, active, disabled i recovery-required se renderuju iz server state contract-a;
- [x] direct credential pending owner nema invitation resend CTA;
- [x] pending ili recovery-required owner više ne zadovoljava production readiness/publish gate;
- [x] invitation resend je deduplikovan u istom 15-minutnom domenu;
- [x] delivery disabled stanje ne tvrdi da je email poslat;
- [x] password completion može da oporavi ranije prekinut `must_change_password` tok;
- [x] TypeScript, lint, svi testovi i production build prolaze;
- [x] installer briše `.next`, radi `npm run check`, rollbackuje na bilo koji failure i stage-uje samo svoje fajlove;
- [x] stvarni lokalni installer output i browser smoke su pregledani pre PASS.

## 01B acceptance

- [ ] single-tenant fallback i multi-tenant obavezni izbor prolaze stvarni browser smoke;
- [ ] cookie je `HttpOnly`, `SameSite=Lax`, secure u produkciji i nije authorization izvor;
- [ ] strani, neaktivan ili zastareo business ID ne može da promeni tenant scope;
- [ ] selector, switch CTA, post-password redirect i logout cleanup rade na desktopu i mobilnom;
- [ ] direktne admin API mutacije su blokirane pre završenog tenant izbora;
- [ ] TypeScript, lint, svi testovi i production build prolaze;
- [ ] installer briše `.next`, radi `npm run check`, rollbackuje na bilo koji failure i stage-uje samo svoje fajlove;
- [ ] stvarni lokalni installer output i browser smoke su pregledani pre PASS.
