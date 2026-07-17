"use client";
import Image from "next/image";
import { ArrowUpRight, Scissors } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { t, translations } from "@/lib/translations";
import type { CatalogBusiness, Locale } from "@/lib/types";
import { barberLabels } from "../barber-utils";

type Props = { business: CatalogBusiness; locale: Locale; onLocaleChange: (locale: Locale) => void; onBook: () => void };
export default function BarberDesktopHeader({ business, locale, onLocaleChange, onBook }: Props) {
  return <header className="sticky top-0 z-50 border-b border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-background)_90%,transparent)] backdrop-blur-xl">
    <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-8 xl:px-12">
      <a href="#barber-top" className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)]">
          {business.logoUrl ? <Image src={business.logoUrl} alt={`${business.name} — ${t(barberLabels.logoAlt, locale)}`} width={44} height={44} className="h-full w-full object-contain p-1.5" /> : <Scissors className="h-5 w-5 text-[var(--brand-primary)]" aria-hidden="true" />}
        </span>
        <span className="min-w-0"><span className="block truncate font-display text-lg font-semibold tracking-[0.04em]">{business.name}</span><span className="block truncate text-[9px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">Barber Heritage</span></span>
      </a>
      <nav className="flex items-center gap-7 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-muted)]" aria-label={t(translations.common.mainNavigation, locale)}>
        <a href="#services" className="transition-colors hover:text-[var(--brand-text)]">{t(barberLabels.navServices, locale)}</a>
        <a href="#barbers" className="transition-colors hover:text-[var(--brand-text)]">{t(barberLabels.navBarbers, locale)}</a>
        <a href="#gallery" className="transition-colors hover:text-[var(--brand-text)]">{t(barberLabels.navGallery, locale)}</a>
        <a href="#reviews" className="transition-colors hover:text-[var(--brand-text)]">{t(translations.nav.reviews, locale)}</a>
        <a href="#contact" className="transition-colors hover:text-[var(--brand-text)]">{t(barberLabels.navContact, locale)}</a>
      </nav>
      <div className="flex items-center gap-3"><LanguageSwitcher currentLocale={locale} onLocaleChange={onLocaleChange} /><button type="button" onClick={onBook} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-sm font-semibold text-[var(--brand-background)] transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transform-none"><span>{t(barberLabels.bookAppointment, locale)}</span><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></button></div>
    </div>
  </header>;
}
