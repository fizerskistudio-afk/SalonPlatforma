"use client";
import Image from "next/image";
import { Scissors } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { t } from "@/lib/translations";
import type { CatalogBusiness, Locale } from "@/lib/types";
import { barberLabels } from "../barber-utils";
type Props = { business: CatalogBusiness; locale: Locale; onLocaleChange: (locale: Locale) => void };
export default function BarberMobileHeader({ business, locale, onLocaleChange }: Props) {
  return <header className="sticky top-0 z-40 border-b border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-background)_90%,transparent)] backdrop-blur-xl"><div className="flex min-h-16 items-center justify-between gap-3 px-4"><a href="#barber-mobile-home" className="flex min-w-0 items-center gap-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)]">{business.logoUrl ? <Image src={business.logoUrl} alt={`${business.name} — ${t(barberLabels.logoAlt, locale)}`} width={36} height={36} className="h-full w-full object-contain p-1"/> : <Scissors className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden="true"/>}</span><span className="min-w-0"><span className="block truncate font-display text-base font-semibold">{business.name}</span><span className="block truncate text-[8px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">Barber Heritage</span></span></a><LanguageSwitcher currentLocale={locale} onLocaleChange={onLocaleChange}/></div></header>;
}
