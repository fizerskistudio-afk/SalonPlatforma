# DEMO-THEME-EDITORIAL-01 — BROWSER ACCEPTANCE RUNBOOK

## Preduslovi

- branch `backup/theme-core-barber-beta`;
- 01B Starter Pack Business Builder je pushovan;
- lokalni server i Platform Admin sesija rade;
- test tenant ostaje draft.

## Demo identitet

```text
Naziv: Atelier Editorial Demo
Slug: atelier-editorial-demo
Grad: Beograd
Država: Serbia
Telefon: +381 60 111 2233
Timezone: Europe/Belgrade
Valuta: RSD
Starter pack: Hair Salon
Theme: Hair Editorial
```

## Starter Pack Business Builder

Otvori `/platform-admin/businesses/new/starter-pack`, izaberi Hair Salon i Hair Editorial, ostavi najmanje šest aktivnih usluga, potvrdi trajanja i cene i kreiraj draft salon.

Očekivano:

- atomski provisioning uspeva;
- workspace link radi;
- ponovni isti 01B apply ne pravi duplikat;
- slug conflict ne pregazi tenant;
- salon ostaje draft.

## Desktop preview

Otvori `/salon/atelier-editorial-demo?preview=1`.

Proveri:

- Hair Editorial renderer;
- hero fallback bez slike;
- starter services, trajanje i cene;
- service booking CTA;
- Team localized empty state;
- Gallery localized empty state;
- Reviews shared preview state;
- Contact;
- bez horizontalnog overflow-a na 1280, 1440 i 1920 px.

## Mobile preview

Proveri sticky header, hero, services, centralni booking CTA, Team empty state, Gallery empty state, Reviews, Contact, fixed bottom navigation, safe-area padding i desktop switch.

## Lumière regression

Otvori Lumière preview i potvrdi da Hair Luxury renderer i zaključani gallery layout nisu promenjeni.

## Rezultat

Acceptance je završen kada ciljane provere i `npm run check` prolaze, desktop/mobile preview prolaze i Lumière regression prolazi.


## Architecture granica

Hair Editorial ostaje `monolith/monolith` i zato:

```text
architecture.acceptance=pending
isTemplateArchitectureAccepted=false
```

To ne blokira kontrolisani demo preview. Modularizacija je poseban budući architecture posao i ne sme se lažno označiti kao završena kroz ovaj visual acceptance milestone.
