# DEMO-I18N-01D — Runtime Language Smoke

## Scope

Automatizovani smoke pokriva sedam spremnih sistemskih UI jezika:

1. `sr-Latn`
2. `mk`
3. `hr`
4. `sq`
5. `en`
6. `de`
7. `fr`

## Automatizovano pokriveno

- svih 105 globalnih translation leaf-ova;
- booking i customer label contract;
- 14 Hair Editorial labela;
- 28 Barber Heritage labela;
- centralni `t()` fallback redosled;
- spremnost locale registry-ja;
- language switcher filtriranje samo na UI-ready jezike;
- stabilan redosled jezika;
- compact select prag;
- fallback kada tenant current locale nema spreman sistemski UI;
- Hair Luxury desktop/mobile wrapper contract;
- Hair Editorial desktop/mobile centralni `t()` contract;
- Barber Heritage desktop/mobile centralni `t()` contract;
- odsustvo lokalnih `translate()` helpera;
- odsustvo hardkodovanih Barber `logo` i `galerija` alt fallback-a;
- lint, unit test i production build kroz `npm run check`.

## Granica ovog milestone-a

Ovaj milestone potvrđuje runtime translation contract i production build.

Vizuelni browser pregled preloma teksta, overflow-a, CTA širine i realnog klikanja kroz svaki jezik ostaje u:

- `DEMO-THEME-LUMIERE-01`;
- `DEMO-THEME-EDITORIAL-01`;
- `DEMO-THEME-BARBER-01`;
- završnom `DEMO-DEPLOY-QA-01`.

To se ne predstavlja kao već izvršen ručni QA.
