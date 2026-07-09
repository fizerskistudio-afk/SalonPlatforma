# AUTH-ACCESS-REFACTOR-01

## Cilj

Razdvajanje testiranog owner credential endpointa na manje server module bez promene ponašanja.

## Promene

- `route.ts` ostaje tanak HTTP dispatcher;
- platform-admin autorizacija i no-store JSON odgovori su u `credentials/http.ts`;
- validacija, privremena lozinka i metadata helperi su u `credentials/validation.ts`;
- Supabase lookup i membership persistence su u `credentials/repository.ts`;
- create/reset poslovna logika je u `credentials/service.ts`;
- zajednički tipovi su u `credentials/types.ts`.

## Garantovano nepromenjeno

- API putanja i POST payload;
- akcije `create_owner` i `reset_owner_password`;
- status kodovi i korisničke poruke;
- privremena lozinka i `must_change_password`;
- tačno tenant/member targetiranje;
- postojeći owneri se ne resetuju automatski.

## Migracija

Nema migracije baze. Poslednja ostaje `021`.

## Provera

```cmd
rmdir /s /q .next
npm run lint
npm run build
```

Pošto je ovo refactor bez UI promene, dovoljan je smoke test kreiranja test ownera ili resetovanja test ownera.
