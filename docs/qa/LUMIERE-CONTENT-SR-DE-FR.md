# Lumière SR / DE / FR Content Closeout

## Scope

Populate these values through the Lumière tenant admin. Do not hard-code them into the theme.

The booking modal uses the same catalog translations, so localized categories and services will automatically appear after saving.

## Hero content

| Field | sr-Latn | de | fr |
|---|---|---|---|
| Tagline | Gde se stil susreće sa umetnošću | Wo Stil auf Kunst trifft | Quand le style rencontre l’art |
| Description | Premium frizerski i beauty studio u srcu Skoplja. Posvećeni smo tome da izgledate sjajno i osećate se još bolje. | Ein exklusives Haar- und Beauty-Studio im Herzen von Skopje. Unser Ziel ist, dass Sie großartig aussehen und sich noch besser fühlen. | Un studio de coiffure et de beauté haut de gamme au cœur de Skopje. Notre mission : vous faire rayonner et vous sentir encore mieux. |

## Visible service categories

| English | sr-Latn | de | fr |
|---|---|---|---|
| Hair | Kosa | Haare | Cheveux |
| Coloring | Farbanje | Coloration | Coloration |
| Styling | Stilizovanje | Styling | Coiffage |
| Beauty | Lepota | Kosmetik | Beauté |
| Nails | Nokti | Nägel | Ongles |

## Visible services

| English | sr-Latn | de | fr |
|---|---|---|---|
| Men's Cut | Muško šišanje | Herrenhaarschnitt | Coupe homme |
| Women's Cut | Žensko šišanje | Damenhaarschnitt | Coupe femme |
| Kids Cut | Dečje šišanje | Kinderhaarschnitt | Coupe enfant |

## Required complete-service audit

The table above covers only the services visible during the browser QA screenshot.

For every additional active Lumière service:

- [ ] Serbian name
- [ ] German name
- [ ] French name
- [ ] localized description when the service uses one
- [ ] category translation
- [ ] price unchanged
- [ ] duration unchanged
- [ ] employee assignment unchanged
- [ ] active/booking status unchanged

## Browser verification after saving

For `sr-Latn`, `de` and `fr`:

- [ ] hero tagline is localized
- [ ] hero description is localized
- [ ] service cards are localized
- [ ] booking category pills are localized
- [ ] booking service names are localized
- [ ] no raw translation key is visible
- [ ] no English fallback remains for fields intentionally populated
- [ ] German and French labels do not overflow buttons or cards

## Safety boundary

Content entry must not change:

- service IDs;
- prices;
- durations;
- employee assignments;
- booking availability;
- tenant slug;
- review trust data.
