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
  faqs,
  formatRsd,
  packages,
} from "./ordum-content";
import "./ordum-landing.css";

type OrdumLandingPageProps = {
  demos: {
    barber: string;
    nails: string;
  };
};

function BrandMark() {
  return <span className="ordum-mark" aria-hidden="true"><i /><i /><i /></span>;
}

function Header() {
  return (
    <header className="ordum-header">
      <a className="ordum-brand" href="#top" aria-label="Ordum Studios — početna">
        <BrandMark />
        <span><strong>ORDUM</strong><small>STUDIOS</small></span>
      </a>
      <nav aria-label="Glavna navigacija">
        <a href="#platforma">Platforma</a>
        <a href="#demo">Demo</a>
        <a href="#paketi">Paketi</a>
        <a href="#pitanja">Pitanja</a>
      </nav>
      <a className="ordum-header-cta" href="#kontakt">Zakaži demo <ArrowRight /></a>
      <a className="ordum-menu" href="#kontakt" aria-label="Otvori kontakt"><Menu /></a>
    </header>
  );
}

function ProductProof() {
  return (
    <div className="ordum-product-proof" aria-label="Prikaz platforme">
      <div className="ordum-proof-bar">
        <span><BrandMark /> Studio panel</span>
        <span className="ordum-proof-live"><i /> Danas</span>
      </div>
      <div className="ordum-proof-body">
        <aside>
          <span className="active"><i /> Pregled</span>
          <span><i /> Rezervacije</span>
          <span><i /> Tim</span>
          <span><i /> Raspored</span>
        </aside>
        <div className="ordum-proof-main">
          <div className="ordum-proof-heading">
            <div><small>Utorak, 21. jul</small><strong>Dobar dan, Luna</strong></div>
            <button type="button">+ Nova rezervacija</button>
          </div>
          <div className="ordum-proof-stats">
            <article><CalendarCheck2 /><span><small>Današnji termini</small><strong>8</strong></span></article>
            <article><Clock3 /><span><small>Sledeći termin</small><strong>10:30</strong></span></article>
          </div>
          <div className="ordum-proof-schedule">
            <div className="ordum-proof-schedule-head"><strong>Današnji raspored</strong><span>Prikaži sve</span></div>
            {[
              ["09:00", "Milica J.", "Gel lak", "Potvrđeno"],
              ["10:30", "Sara M.", "Nail art", "Sledeće"],
              ["12:00", "Jovana P.", "Manikir", "Potvrđeno"],
            ].map(([time, name, service, state]) => (
              <div className="ordum-proof-row" key={time}>
                <b>{time}</b><span><strong>{name}</strong><small>{service}</small></span><em>{state}</em>
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="ordum-floating-note"><Sparkles /> Novi termin je potvrđen</span>
    </div>
  );
}

function DemoCard({ kind, title, copy, href }: { kind: "barber" | "nails"; title: string; copy: string; href: string }) {
  return (
    <article className={`ordum-demo-card ordum-demo-${kind}`}>
      <div className="ordum-demo-preview">
        <div className="ordum-demo-browser"><i /><i /><i /><span>{title}</span></div>
        {kind === "barber" ? (
          <div className="ordum-barber-art"><small>HERITAGE / CRAFT</small><strong>Vaš stil.<br />Vaš ritual.</strong><span>Rezerviši termin →</span></div>
        ) : (
          <div className="ordum-nails-art"><small>NAIL ART ATELIER</small><strong>Boja. Forma.<br /><em>Vaš potpis.</em></strong><div><i /><i /><i /><i /></div></div>
        )}
      </div>
      <div className="ordum-demo-copy">
        <span>{kind === "barber" ? "Barbershop" : "Nail studio"}</span>
        <h3>{title}</h3>
        <p>{copy}</p>
        <a href={href} target="_blank" rel="noreferrer">Otvori live demo <ExternalLink /></a>
      </div>
    </article>
  );
}

export function OrdumLandingPage({ demos }: OrdumLandingPageProps) {
  return (
    <main id="top" className="ordum-site">
      <Header />

      <section className="ordum-hero">
        <div className="ordum-hero-copy">
          <p className="ordum-kicker"><span /> Digitalni studio za vaš studio</p>
          <h1>Vaš posao zaslužuje više od <em>još jednog booking linka.</em></h1>
          <p className="ordum-lead">Ordum spaja profesionalni sajt, online zakazivanje, tim i svakodnevne operacije — u platformu koja izgleda i radi kao deo vašeg brenda.</p>
          <div className="ordum-actions">
            <a className="ordum-primary-button" href="#kontakt">Zakaži prezentaciju <ArrowRight /></a>
            <a className="ordum-text-link" href="#demo">Pogledaj live studije <ArrowDownRight /></a>
          </div>
          <ul className="ordum-trust-row">
            <li><Check /> Bez aplikacije za klijente</li>
            <li><Check /> Podešavanje uz našu podršku</li>
          </ul>
        </div>
        <ProductProof />
      </section>

      <section className="ordum-statement" id="platforma">
        <p>OD FRAGMENTISANIH ALATA DO JEDNOG SISTEMA</p>
        <h2>Manje vremena u porukama.<br /><em>Više prostora za dobar rad.</em></h2>
        <div className="ordum-statement-grid">
          <p>Instagram gradi pažnju. Kalendar čuva vreme. Poruke dogovaraju detalje. Ordum povezuje taj put u iskustvo koje klijent razume, a tim može da vodi.</p>
          <span>Javni sajt <i /> Rezervacije <i /> Tim <i /> Operacije</span>
        </div>
      </section>

      <section className="ordum-capabilities">
        <div className="ordum-section-heading">
          <span>01 / Platforma</span>
          <h2>Sve važno radi zajedno.</h2>
          <p>Modularno ispod površine. Jednostavno za vaš tim i klijente.</p>
        </div>
        <div className="ordum-capability-grid">
          {capabilities.map(({ icon: Icon, eyebrow, title, copy }) => (
            <article key={title}>
              <div><Icon /></div><span>{eyebrow}</span><h3>{title}</h3><p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="ordum-demos" id="demo">
        <div className="ordum-section-heading ordum-section-heading-light">
          <span>02 / Uživo</span>
          <h2>Nije mockup. <em>Otvorite studio.</em></h2>
          <p>Dva različita identiteta, jedna zajednička i bezbedna platformska osnova.</p>
        </div>
        <div className="ordum-demo-grid">
          <DemoCard kind="barber" title="Heritage Barber Demo" copy="Editorial heritage iskustvo sa uslugama, timom, radovima, recenzijama i direktnim booking tokom." href={demos.barber} />
          <DemoCard kind="nails" title="Atelier Luna Nails" copy="Svetli nail art atelier sa portfolio-first iskustvom, mobilnom navigacijom i povezanim rezervacijama." href={demos.nails} />
        </div>
      </section>

      <section className="ordum-process">
        <div className="ordum-section-heading">
          <span>03 / Od ideje do objave</span>
          <h2>Mi postavljamo sistem.<br /><em>Vi zadržavate fokus.</em></h2>
        </div>
        <ol>
          <li><b>01</b><div><span>Upoznajemo studio</span><h3>Razumemo ponudu, tim i način rada.</h3><p>Biramo paket, sadržajni pravac i vizuelni identitet koji odgovara stvarnom poslu.</p></div></li>
          <li><b>02</b><div><span>Podešavamo platformu</span><h3>Unosimo osnovu i povezujemo tokove.</h3><p>Usluge, zaposleni, radno vreme, sadržaj i booking granice pripremamo za kontrolisanu proveru.</p></div></li>
          <li><b>03</b><div><span>Objavljujemo i pratimo</span><h3>Studio ide uživo uz jasan handoff.</h3><p>Proveravamo kritične tokove, prolazimo kroz rad sa timom i beležimo feedback iz realne upotrebe.</p></div></li>
        </ol>
      </section>

      <section className="ordum-pricing" id="paketi">
        <div className="ordum-section-heading">
          <span>04 / Paketi</span>
          <h2>Počnite na nivou koji vam sada treba.</h2>
          <p>Paketi su kumulativni. Viši nivo zadržava osnovu i dodaje nove mogućnosti.</p>
        </div>
        <div className="ordum-package-grid">
          {packages.map((item) => (
            <article className={"featured" in item && item.featured ? "featured" : ""} key={item.key}>
              {"featured" in item && item.featured ? <strong className="ordum-package-badge">PREPORUKA</strong> : null}
              <span>{item.label}</span><h3>{item.name}</h3><p>{item.shortDescription}</p>
              <div className="ordum-price"><b>{formatRsd(item.monthlyPriceRsd)}</b><small>RSD / mesečno</small></div>
              <p className="ordum-setup">Početno podešavanje: <strong>{formatRsd(item.setupPriceRsd)} RSD</strong></p>
              <ul>{item.features.map((feature) => <li key={feature}><Check /> {feature}</li>)}</ul>
              <a href="#kontakt">Razgovarajmo o paketu <ArrowRight /></a>
            </article>
          ))}
        </div>
        <p className="ordum-pricing-note">Za lance, klinike i više lokacija postoji Signature paket po individualnoj proceni.</p>
      </section>

      <section className="ordum-faq" id="pitanja">
        <div className="ordum-section-heading"><span>05 / Česta pitanja</span><h2>Pre nego što se čujemo.</h2></div>
        <div>{faqs.map((faq, index) => <details key={faq.question}><summary><b>0{index + 1}</b>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div>
      </section>

      <section className="ordum-contact" id="kontakt">
        <div className="ordum-contact-intro">
          <span>06 / Sledeći korak</span>
          <h2>Hajde da vidimo kako bi Ordum radio za <em>vaš studio.</em></h2>
          <p>Pošaljite osnovne informacije. Javićemo se da dogovorimo kratak razgovor i pokažemo najrelevantniji pravac.</p>
          <div><BrandMark /><p><strong>Ordum Studios</strong><small>Beauty & wellness business platform</small></p></div>
        </div>
        <OrdumContactForm />
      </section>

      <footer className="ordum-footer">
        <a className="ordum-brand" href="#top"><BrandMark /><span><strong>ORDUM</strong><small>STUDIOS</small></span></a>
        <p>Digitalni identitet, rezervacije i operacije za beauty i wellness studije.</p>
        <span>© {new Date().getFullYear()} Ordum Studios</span>
      </footer>
    </main>
  );
}
