import {
  ArrowDownRight,
  ArrowRight,
  CalendarCheck2,
  Check,
  Clock3,
  ExternalLink,
  Menu,
  Sparkles,
} from "lucide-react";

import { OrdumContactForm } from "./OrdumContactForm";
import {
  capabilities,
  commercialOffers,
  faqs,
  formatRsd,
  foundingPartnerOffer,
  platformJourney,
  primaryOffer,
  rolloutGroups,
} from "./ordum-content";
import "./ordum-landing.css";

type OrdumLandingPageProps = {
  demos: {
    barber: string;
    lumiere: string;
  };
};

function BrandMark() {
  return (
    <span
      className="ordum-mark"
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </span>
  );
}

function Header() {
  return (
    <header className="ordum-header">
      <a
        className="ordum-brand"
        href="#top"
        aria-label="Ordum Studios — početna"
      >
        <BrandMark />
        <span>
          <strong>ORDUM</strong>
          <small>STUDIOS</small>
        </span>
      </a>

      <nav aria-label="Glavna navigacija">
        <a href="#platforma">
          Platforma
        </a>
        <a href="#status">
          Status
        </a>
        <a href="#ponude">
          Ponude
        </a>
        <a href="#demo">
          Demo
        </a>
        <a href="#pitanja">
          Pitanja
        </a>
      </nav>

      <a
        className="ordum-header-cta"
        href="#kontakt"
      >
        Prijavi studio
        <ArrowRight />
      </a>

      <a
        className="ordum-menu"
        href="#kontakt"
        aria-label="Otvori kontakt"
      >
        <Menu />
      </a>
    </header>
  );
}

function ProductProof() {
  return (
    <div
      className="ordum-product-proof"
      aria-label="Prikaz platforme"
    >
      <div className="ordum-proof-bar">
        <span>
          <BrandMark />
          Studio panel
        </span>
        <span className="ordum-proof-live">
          <i />
          Danas
        </span>
      </div>

      <div className="ordum-proof-body">
        <aside>
          <span className="active">
            <i />
            Pregled
          </span>
          <span>
            <i />
            Rezervacije
          </span>
          <span>
            <i />
            Tim
          </span>
          <span>
            <i />
            Raspored
          </span>
        </aside>

        <div className="ordum-proof-main">
          <div className="ordum-proof-heading">
            <div>
              <small>
                Utorak, 21. jul
              </small>
              <strong>
                Dobar dan, Luna
              </strong>
            </div>
            <button type="button">
              + Nova rezervacija
            </button>
          </div>

          <div className="ordum-proof-stats">
            <article>
              <CalendarCheck2 />
              <span>
                <small>
                  Današnji termini
                </small>
                <strong>8</strong>
              </span>
            </article>
            <article>
              <Clock3 />
              <span>
                <small>
                  Sledeći termin
                </small>
                <strong>10:30</strong>
              </span>
            </article>
          </div>

          <div className="ordum-proof-schedule">
            <div className="ordum-proof-schedule-head">
              <strong>
                Današnji raspored
              </strong>
              <span>
                Prikaži sve
              </span>
            </div>

            {[
              [
                "09:00",
                "Milica J.",
                "Gel lak",
                "Potvrđeno",
              ],
              [
                "10:30",
                "Sara M.",
                "Nail art",
                "Sledeće",
              ],
              [
                "12:00",
                "Jovana P.",
                "Manikir",
                "Potvrđeno",
              ],
            ].map(
              ([
                time,
                name,
                service,
                state,
              ]) => (
                <div
                  className="ordum-proof-row"
                  key={time}
                >
                  <b>{time}</b>
                  <span>
                    <strong>{name}</strong>
                    <small>{service}</small>
                  </span>
                  <em>{state}</em>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <span className="ordum-floating-note">
        <Sparkles />
        Novi termin je potvrđen
      </span>
    </div>
  );
}

function DemoCard({
  kind,
  title,
  copy,
  href,
}: {
  kind: "barber" | "lumiere";
  title: string;
  copy: string;
  href: string;
}) {
  return (
    <article
      className={`ordum-demo-card ordum-demo-${kind}`}
    >
      <div className="ordum-demo-preview">
        <div className="ordum-demo-browser">
          <i />
          <i />
          <i />
          <span>{title}</span>
        </div>

        {kind === "barber" ? (
          <div className="ordum-barber-art">
            <small>
              HERITAGE / CRAFT
            </small>
            <strong>
              Vaš stil.
              <br />
              Vaš ritual.
            </strong>
            <span>
              Rezerviši termin →
            </span>
          </div>
        ) : (
          <div className="ordum-lumiere-art">
            <small>
              LUMIÈRE / BEAUTY STUDIO
            </small>
            <strong>
              Nega koja
              <br />
              <em>postaje ritual.</em>
            </strong>
            <span>
              Beauty · Hair · Care
            </span>
          </div>
        )}
      </div>

      <div className="ordum-demo-copy">
        <span>
          {kind === "barber"
            ? "Barbershop"
            : "Beauty salon"}
        </span>
        <h3>{title}</h3>
        <p>{copy}</p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
        >
          Otvori live demo
          <ExternalLink />
        </a>
      </div>
    </article>
  );
}

export function OrdumLandingPage({
  demos,
}: OrdumLandingPageProps) {
  return (
    <main
      id="top"
      className="ordum-site"
    >
      <Header />

      <section className="ordum-hero">
        <div className="ordum-hero-copy">
          <p className="ordum-kicker">
            <span />
            Level 1 je otvoren · Growth Platform u razvoju
          </p>

          <h1>
            Vaš posao zaslužuje više od
            <em>
              još jednog booking linka.
            </em>
          </h1>

          <p className="ordum-lead">
            Ordum spaja profesionalni
            sajt, online zakazivanje,
            tim i svakodnevne operacije
            — u platformu koja izgleda
            i radi kao deo vašeg brenda.
          </p>

          <div className="ordum-actions">
            <a
              className="ordum-primary-button"
              href="#ponude"
            >
              Pogledaj Launch Partner
              <ArrowRight />
            </a>
            <a
              className="ordum-text-link"
              href="#demo"
            >
              Pogledaj live studije
              <ArrowDownRight />
            </a>
          </div>

          <ul className="ordum-trust-row">
            <li>
              <Check />
              Jasan LIVE / BETA status
            </li>
            <li>
              <Check />
              Podešavanje uz našu podršku
            </li>
          </ul>

          <p className="ordum-hero-offer-note">
            <strong>
              {foundingPartnerOffer.name}
            </strong>
            {" · "}
            do {
              foundingPartnerOffer.clientLimit ??
              5
            } salona
            {" · "}
            {formatRsd(
              foundingPartnerOffer.monthlyPriceRsd
            )} RSD mesečno
          </p>
        </div>

        <ProductProof />
      </section>

      <section
        className="ordum-statement"
        id="platforma"
      >
        <p>
          OD FRAGMENTISANIH ALATA DO
          JEDNOG SISTEMA
        </p>
        <h2>
          Manje vremena u porukama.
          <br />
          <em>
            Više prostora za dobar rad.
          </em>
        </h2>

        <div className="ordum-statement-grid">
          <p>
            Instagram gradi pažnju.
            Kalendar čuva vreme. Poruke
            dogovaraju detalje. Ordum
            povezuje taj put u iskustvo
            koje klijent razume, a tim
            može da vodi.
          </p>
          <span>
            Javni sajt
            <i />
            Rezervacije
            <i />
            Tim
            <i />
            Operacije
          </span>
        </div>
      </section>

      <section className="ordum-capabilities">
        <div className="ordum-section-heading">
          <span>
            01 / Platforma
          </span>
          <h2>
            Sve važno radi zajedno.
          </h2>
          <p>
            Modularno ispod površine.
            Jednostavno za vaš tim i
            klijente.
          </p>
        </div>

        <div className="ordum-capability-grid">
          {capabilities.map(
            ({
              icon: Icon,
              eyebrow,
              title,
              copy,
            }) => (
              <article key={title}>
                <div>
                  <Icon />
                </div>
                <span>{eyebrow}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            )
          )}
        </div>
      </section>

      <section
        className="ordum-status"
        id="status"
      >
        <div className="ordum-section-heading">
          <span>
            02 / Stvarno stanje
          </span>
          <h2>
            Bez magle oko onoga što
            <em> postoji danas.</em>
          </h2>
          <p>
            Tehnička mogućnost nije isto
            što i javno obećanje. Zato
            svaka funkcija ima jasan
            rollout status.
          </p>
        </div>

        <div className="ordum-status-grid">
          {rolloutGroups.map(
            (group) => (
              <article
                key={group.status}
                className={`ordum-status-card ordum-status-${group.status}`}
              >
                <strong>
                  {group.label}
                </strong>
                <p>{group.copy}</p>
                <ul>
                  {group.features.map(
                    (feature) => (
                      <li key={feature.key}>
                        <Check />
                        {feature.label}
                      </li>
                    )
                  )}
                </ul>
                {group.remainingCount > 0 ? (
                  <small>
                    + još {
                      group.remainingCount
                    } stavki u registry-ju
                  </small>
                ) : null}
              </article>
            )
          )}
        </div>
      </section>

      <section
        className="ordum-demos"
        id="demo"
      >
        <div className="ordum-section-heading ordum-section-heading-light">
          <span>
            03 / Uživo
          </span>
          <h2>
            Nije mockup.
            <em> Otvorite studio.</em>
          </h2>
          <p>
            Dva različita identiteta,
            jedna zajednička i bezbedna
            platformska osnova.
          </p>
        </div>

        <div className="ordum-demo-grid">
          <DemoCard
            kind="barber"
            title="Heritage Barber Demo"
            copy="Editorial heritage iskustvo sa uslugama, timom, radovima, recenzijama i direktnim booking tokom."
            href={demos.barber}
          />
          <DemoCard
            kind="lumiere"
            title="Lumière Studio"
            copy="Luksuzno editorial beauty iskustvo sa jasnom ponudom, timom, galerijom i direktnim booking tokom."
            href={demos.lumiere}
          />
        </div>
      </section>

      <section className="ordum-process">
        <div className="ordum-section-heading">
          <span>
            04 / Od ideje do objave
          </span>
          <h2>
            Mi postavljamo sistem.
            <br />
            <em>
              Vi zadržavate fokus.
            </em>
          </h2>
        </div>

        <ol>
          <li>
            <b>01</b>
            <div>
              <span>
                Upoznajemo studio
              </span>
              <h3>
                Razumemo ponudu, tim i
                način rada.
              </h3>
              <p>
                Biramo komercijalnu
                ponudu, sadržajni pravac
                i vizuelni identitet koji
                odgovara stvarnom poslu.
              </p>
            </div>
          </li>
          <li>
            <b>02</b>
            <div>
              <span>
                Podešavamo platformu
              </span>
              <h3>
                Unosimo osnovu i
                povezujemo tokove.
              </h3>
              <p>
                Usluge, zaposleni, radno
                vreme, sadržaj i booking
                granice pripremamo za
                kontrolisanu proveru.
              </p>
            </div>
          </li>
          <li>
            <b>03</b>
            <div>
              <span>
                Objavljujemo i pratimo
              </span>
              <h3>
                Studio ide uživo uz jasan
                handoff.
              </h3>
              <p>
                Proveravamo kritične
                tokove, prolazimo kroz rad
                sa timom i beležimo
                feedback iz realne
                upotrebe.
              </p>
            </div>
          </li>
        </ol>
      </section>

      <section
        className="ordum-pricing"
        id="ponude"
      >
        <span
          id="paketi"
          className="ordum-anchor-alias"
          aria-hidden="true"
        />

        <div className="ordum-section-heading">
          <span>
            05 / Ponude
          </span>
          <h2>
            Kupujete poslovni rezultat,
            <em> ne interni paket.</em>
          </h2>
          <p>
            Javni landing koristi
            Commercial Offer registry.
            Tehnički entitlement ostaje
            interna platformska granica.
          </p>
        </div>

        <div className="ordum-package-grid">
          {commercialOffers.map(
            (offer) => {
              const isPrimary =
                offer.key ===
                primaryOffer.key;

              return (
                <article
                  className={[
                    isPrimary
                      ? "featured"
                      : "",
                    offer.status ===
                    "limited"
                      ? "ordum-offer-limited"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  key={offer.key}
                >
                  <strong
                    className={`ordum-package-badge ordum-badge-${offer.status}`}
                  >
                    {offer.statusLabel}
                  </strong>

                  <span>
                    Do {
                      offer.maxBookableStaff ??
                      "više"
                    } bookable članova
                  </span>

                  <h3>{offer.name}</h3>
                  <p>
                    {offer.shortDescription}
                  </p>

                  <div className="ordum-price">
                    <b>
                      {formatRsd(
                        offer.monthlyPriceRsd
                      )}
                    </b>
                    <small>
                      {offer.monthlyPriceRsd ===
                      null
                        ? "individualna procena"
                        : "RSD / mesečno"}
                    </small>
                  </div>

                  <p className="ordum-setup">
                    Početno postavljanje:
                    {" "}
                    <strong>
                      {formatRsd(
                        offer.setupPriceRsd
                      )}
                      {offer.setupPriceRsd ===
                      null
                        ? ""
                        : " RSD"}
                    </strong>
                  </p>

                  {offer.priceLockMonths ? (
                    <p className="ordum-offer-condition">
                      Cena zaključana {
                        offer.priceLockMonths
                      } meseci.
                    </p>
                  ) : null}

                  {offer.clientLimit ? (
                    <p className="ordum-offer-condition">
                      Ograničeno na {
                        offer.clientLimit
                      } prihvaćenih salona.
                    </p>
                  ) : null}

                  <ul>
                    {offer.featureLabels.map(
                      (feature) => (
                        <li key={feature}>
                          <Check />
                          {feature}
                        </li>
                      )
                    )}
                  </ul>

                  <p className="ordum-offer-beta-note">
                    {offer.managedBetaCount}
                    {" "}
                    managed BETA opcija
                    dostupno je uz proveru.
                  </p>

                  <a href="#kontakt">
                    {offer.ctaLabel}
                    <ArrowRight />
                  </a>
                </article>
              );
            }
          )}
        </div>

        <p className="ordum-pricing-note">
          BETA opcije se ne garantuju bez
          tehničke provere. COMING SOON
          funkcije nisu uključene u
          trenutnu cenu ili rok.
        </p>
      </section>

      <section
        className="ordum-levels"
        id="razvoj"
      >
        <div className="ordum-section-heading">
          <span>
            06 / Razvojni pravac
          </span>
          <h2>
            Šest nivoa.
            <em> Jedan stabilan korak po korak.</em>
          </h2>
          <p>
            Level nije marketinški rok.
            Sledeći nivo se otključava tek
            kada prethodni ima tehnički i
            poslovni signal.
          </p>
        </div>

        <div className="ordum-level-grid">
          {platformJourney.map(
            (level) => (
              <article
                key={level.key}
                className={`ordum-level-card ordum-level-${level.status}`}
              >
                <div>
                  <span>
                    LEVEL {level.level}
                  </span>
                  <strong>
                    {level.statusLabel}
                  </strong>
                </div>
                <h3>{level.name}</h3>
                <p>{level.publicCopy}</p>
              </article>
            )
          )}
        </div>
      </section>

      <section
        className="ordum-faq"
        id="pitanja"
      >
        <div className="ordum-section-heading">
          <span>
            07 / Česta pitanja
          </span>
          <h2>
            Pre nego što se čujemo.
          </h2>
        </div>

        <div>
          {faqs.map(
            (faq, index) => (
              <details key={faq.question}>
                <summary>
                  <b>
                    0{index + 1}
                  </b>
                  {faq.question}
                  <span>+</span>
                </summary>
                <p>{faq.answer}</p>
              </details>
            )
          )}
        </div>
      </section>

      <section
        className="ordum-contact"
        id="kontakt"
      >
        <div className="ordum-contact-intro">
          <span>
            08 / Sledeći korak
          </span>
          <h2>
            Hajde da vidimo kako bi Ordum
            radio za
            <em> vaš studio.</em>
          </h2>
          <p>
            Prijavite se za Launch Partner
            razgovor ili proverite da li
            postoji slobodno Founding
            Partner mesto. Pokazaćemo samo
            ono što je relevantno za vaš
            tip poslovanja.
          </p>
          <div>
            <BrandMark />
            <p>
              <strong>
                Ordum Studios
              </strong>
              <small>
                Beauty & wellness
                business platform
              </small>
            </p>
          </div>
        </div>

        <OrdumContactForm />
      </section>

      <footer className="ordum-footer">
        <a
          className="ordum-brand"
          href="#top"
        >
          <BrandMark />
          <span>
            <strong>ORDUM</strong>
            <small>STUDIOS</small>
          </span>
        </a>
        <p>
          Digitalni identitet,
          rezervacije i operacije za
          beauty i wellness studije.
        </p>
        <span>
          © {new Date().getFullYear()}
          {" "}
          Ordum Studios
        </span>
      </footer>
    </main>
  );
}
