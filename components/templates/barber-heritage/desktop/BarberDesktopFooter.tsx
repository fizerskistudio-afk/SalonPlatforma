"use client";
import { t } from "@/lib/translations";
import type { CatalogBusiness, Locale } from "@/lib/types";
import { barberLabels } from "../barber-utils";
type Props = { business: CatalogBusiness; locale: Locale };
export default function BarberDesktopFooter({ business, locale }: Props) {
  return <footer className="border-t border-[var(--brand-border)]"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-8 px-8 py-8 text-xs text-[var(--brand-muted)] xl:px-12"><p>© {new Date().getFullYear()} {business.name}. {t(barberLabels.allRightsReserved, locale)}</p><p className="uppercase tracking-[0.18em]">{t(barberLabels.footerTheme, locale)}</p></div></footer>;
}
