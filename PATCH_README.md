# TENANT-DOMAINS-01 Patch

Ovaj ZIP je napravljen za old-school raspakivanje direktno u root projekta.

## Pre raspakivanja

```powershell
git status
git add -A
git commit -m "chore: checkpoint before tenant domains patch"
```

## Posle raspakivanja

Dodaj u `.env.local`:

```env
PLATFORM_ROOT_DOMAIN=localhost:3000
PLATFORM_ROOT_PROTOCOL=http
```

Zatim:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run lint
npm run build
npm run dev
```

Detaljan ručni test je u:

`docs/milestones/TENANT-DOMAINS-01.md`
