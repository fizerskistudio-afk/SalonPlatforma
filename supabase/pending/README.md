# Pending database changes

Fajlovi u ovom folderu nisu deo automatskog Supabase migration reda.

Ne primenjivati ih lokalno, na staging ili production projektu bez eksplicitnog odobrenja, pregleda ciljnog projekta i zasebnog rollback plana.

Kada pending promena dobije odobrenje:

1. ponovo se pregleda SQL i zavisnosti;
2. pravi se numerisana migracija u `supabase/migrations`;
3. izvršavaju se verification upiti;
4. tek tada se aktivira odgovarajući application feature flag ili auth provider.
