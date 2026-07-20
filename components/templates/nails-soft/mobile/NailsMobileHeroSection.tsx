"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  CalendarPlus,
  Sparkle,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  GalleryItem,
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

type NailsMobileHeroSectionProps = {
  business: CatalogBusiness;
  gallery: GalleryItem[];
  locale: Locale;
  onBook: () => void;
  onViewPortfolio:
    () => void;
};

const MOBILE_SHADES = [
  "#bf336b",
  "#ef9fb7",
  "#752b4a",
  "#e98b6c",
] as const;

export default function NailsMobileHeroSection({
  business,
  gallery,
  locale,
  onBook,
  onViewPortfolio,
}: NailsMobileHeroSectionProps) {
  const heroImage =
    business.heroImageUrl ||
    gallery[0]?.url ||
    "";
  const detailImage =
    gallery[1]?.url ||
    gallery[0]?.url ||
    "";

  return (
    <section
      id="nails-mobile-home"
      className="relative isolate h-full min-h-0 overflow-hidden px-3 pb-2 pt-2"
      data-nails-atelier="mobile-hero"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--brand-primary)_13%,transparent)_1px,transparent_0)] bg-[size:22px_22px] opacity-45" />

      <div className="relative grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2 overflow-hidden rounded-[2.35rem_0.9rem_2.35rem_0.9rem] border border-white/65 bg-[var(--brand-surface)] p-3 shadow-[0_20px_55px_rgba(55,28,42,0.12)]">
        <div className="relative min-h-0">
          <div className="absolute left-0 top-0 h-[72%] w-[80%] rotate-[-2deg] overflow-hidden rounded-[2.8rem_0.8rem_2.8rem_0.8rem] bg-[var(--brand-secondary)] shadow-xl">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={business.name}
                fill
                priority
                className="object-cover"
                sizes="82vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_64%_20%,rgba(255,255,255,0.9),transparent_18%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]">
                <div className="absolute inset-x-0 top-[18%] flex rotate-[-7deg] items-end justify-center gap-2" aria-hidden="true">
                  {MOBILE_SHADES.map(
                    (
                      shade,
                      index
                    ) => (
                      <span
                        key={shade}
                        className="rounded-[999px_999px_45%_45%] shadow-xl"
                        style={{
                          width:
                            `${42 + index * 2}px`,
                          height:
                            `${150 + (index % 2) * 35}px`,
                          backgroundColor:
                            shade,
                        }}
                      />
                    )
                  )}
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/5" />
          </div>

          <div className="absolute right-0 top-[7%] h-[31%] w-[40%] rotate-[5deg] overflow-hidden rounded-[0.8rem_2.5rem_0.8rem_2.5rem] border-[5px] border-[var(--brand-surface)] bg-[var(--brand-secondary)] shadow-xl">
            {detailImage ? (
              <Image
                src={detailImage}
                alt=""
                fill
                className="object-cover"
                sizes="42vw"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#f0a4b9,#792c4c)]" />
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 rounded-[2rem_0.8rem_2rem_0.8rem] bg-[color-mix(in_srgb,var(--brand-surface)_94%,transparent)] p-4 shadow-xl backdrop-blur-xl">
            <p className="inline-flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              <Sparkle
                className="h-3 w-3"
                aria-hidden="true"
              />

              {t(
                nailsLabels.currentEdit,
                locale
              )}
            </p>

            <h1 className="mt-2 max-w-[11ch] font-display text-[clamp(2.65rem,12.5vw,4.4rem)] font-medium italic leading-[0.78] tracking-[-0.06em]">
              {business.name}
            </h1>

            <p className="mt-2 line-clamp-1 text-[11px] leading-4 text-[var(--brand-muted)] [@media(max-height:620px)]:hidden">
              {t(
                business.tagline,
                locale
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_3rem] gap-2">
          <button
            type="button"
            onClick={onBook}
            className="inline-flex min-h-11 items-center justify-between rounded-full bg-[var(--brand-primary)] px-4 text-xs font-semibold text-[var(--brand-background)] shadow-[0_12px_30px_color-mix(in_srgb,var(--brand-primary)_22%,transparent)] transition active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {t(
              translations.hero.bookNow,
              locale
            )}
            <CalendarPlus
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            onClick={onViewPortfolio}
            className="flex min-h-11 items-center justify-center rounded-full border border-[var(--brand-primary)]/25 text-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
            aria-label={t(
              nailsLabels.viewPortfolio,
              locale
            )}
          >
            <ArrowDownRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </section>
  );
}
