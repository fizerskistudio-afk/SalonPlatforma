# ORDUM-ADMIN-PERFORMANCE-01B

## Nalaz

Lokalno merenje:

- zagrejane admin rute: približno 0.5–0.8 s;
- `/admin/schedule`: 5.3 s ukupno;
- schedule application-code: približno 4.7 s.

## Uzrok

Staff time-off loader je radio poseban timezone query, staff request query,
employee/member lookup i zatim po jedan `auth.admin.getUserById()` poziv za
svakog člana.

Email je bio samo sekundarni prikaz uz ime zaposlenog i nije potreban za
odobravanje ili odbijanje zahteva.

## Promena

- koristi timezone iz canonical schedule loadera;
- učitava samo pending staff zahteve;
- uklanja member i auth-user N+1 lookup;
- zadržava employee-name lookup;
- dodaje opt-in timing za request i employee query;
- ne menja review akcije, auth, tenancy, bazu ili migracije.

## Acceptance

- nema `auth.admin.getUserById()` u schedule read hot path-u;
- pending zahtevi i odobri/odbij akcije ostaju funkcionalni;
- kompletan `npm run check` prolazi;
- `/admin/schedule` se ponovo meri hladno i toplo.
