"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  MapPin,
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

type NailsDesktopHeroSectionProps = {
  business: CatalogBusiness;
  gallery: GalleryItem[];
  locale: Locale;
  locationLine: string;
  onBook: () => void;
};

const POLISH_SHADES = [
  "#be2f68",
  "#f29ab4",
  "#6b2946",
  "#efc5cf",
  "#df875f",
] as const;

export default function NailsDesktopHeroSection({
  business,
  gallery,
  locale,
  locationLine,
  onBook,
}: NailsDesktopHeroSectionProps) {
  const heroImage =
    business.heroImageUrl ||
    gallery[0]?.url ||
    "";
  const firstDetail =
    gallery[1]?.url ||
    gallery[0]?.url ||
    business.heroImageUrl ||
    "";
  const secondDetail =
    gallery[2]?.url ||
    gallery[1]?.url ||
    gallery[0]?.url ||
    "";

  return (
    <section
      id="nails-top"
      className="relative isolate min-h-[800px] overflow-hidden bg-[var(--brand-background)] pt-24"
      data-nails-atelier="hero"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--brand-primary)_13%,transparent)_1px,transparent_0)] bg-[size:26px_26px] opacity-45" />
      <div className="pointer-events-none absolute -left-32 top-24 h-[38rem] w-[38rem] rounded-full bg-[var(--brand-secondary)]/65 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-[-12rem] h-[42rem] w-[42rem] rounded-full bg-[var(--brand-primary)]/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[690px] max-w-[1320px] grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-8 px-8 pb-12 pt-5 xl:px-10">
        <div className="relative z-20 flex flex-col justify-center pb-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--brand-primary)]/25 bg-[var(--brand-surface)] text-[var(--brand-primary)] shadow-sm">
              <Sparkle
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>

            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              {t(
                nailsLabels.currentEdit,
                locale
              )}
            </p>
          </div>

          <h1 className="mt-7 max-w-[10ch] font-display text-[clamp(4.8rem,6.6vw,7.8rem)] font-medium italic leading-[0.76] tracking-[-0.068em]">
            {business.name}
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--brand-muted)]">
            {t(
              business.tagline,
              locale
            )}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-13 items-center gap-3 rounded-full bg-[var(--brand-primary)] px-6 text-sm font-semibold text-[var(--brand-background)] shadow-[0_16px_38px_color-mix(in_srgb,var(--brand-primary)_22%,transparent)] transition hover:-translate-y-1 hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {t(
                translations.hero.bookNow,
                locale
              )}

              <ArrowUpRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

            <a
              href="#nails-portfolio"
              className="inline-flex min-h-13 items-center gap-3 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)]/80 px-6 text-sm font-semibold shadow-sm backdrop-blur transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
            >
              {t(
                nailsLabels.viewPortfolio,
                locale
              )}

              <ArrowDownRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </a>
          </div>

          <div className="mt-9 grid max-w-2xl grid-cols-[1fr_190px] gap-6 border-t border-[var(--brand-border)] pt-5">
            <p className="text-xs leading-6 text-[var(--brand-muted)]">
              {t(
                business.description,
                locale
              )}
            </p>

            {locationLine && (
              <p className="flex items-start gap-2 text-xs leading-6 text-[var(--brand-muted)]">
                <MapPin
                  className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />

                {locationLine}
              </p>
            )}
          </div>
        </div>

        <div className="relative min-h-[630px]" aria-label={t(
          nailsLabels.lookbookLabel,
          locale
        )}>
          <div className="absolute left-[9%] top-[7%] z-10 h-[70%] w-[68%] rotate-[2.5deg] overflow-hidden rounded-[4rem_1.5rem_4rem_1.5rem] border-[10px] border-[var(--brand-surface)] bg-[var(--brand-secondary)] shadow-[0_32px_80px_rgba(57,28,44,0.18)]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={business.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 52vw, 760px"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.9),transparent_18%),radial-gradient(circle_at_38%_42%,color-mix(in_srgb,var(--brand-primary)_62%,white),transparent_34%),linear-gradient(145deg,var(--brand-surface),var(--brand-secondary))]">
                <div className="absolute left-[18%] top-[18%] h-[58%] w-[24%] rotate-[-16deg] rounded-[999px_999px_48%_48%] bg-[#bd346c] shadow-2xl" />
                <div className="absolute left-[42%] top-[11%] h-[64%] w-[24%] rotate-[3deg] rounded-[999px_999px_48%_48%] bg-[#f0a4b8] shadow-2xl" />
                <div className="absolute left-[66%] top-[22%] h-[55%] w-[22%] rotate-[16deg] rounded-[999px_999px_48%_48%] bg-[#6d2947] shadow-2xl" />
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />
            <p className="absolute bottom-7 left-8 rounded-full border border-white/30 bg-black/15 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {t(
                nailsLabels.lookbookLabel,
                locale
              )}
            </p>
          </div>

          <div className="absolute bottom-[7%] right-[3%] z-20 h-[38%] w-[40%] rotate-[-5deg] overflow-hidden rounded-[1.75rem_4rem_1.75rem_4rem] border-[8px] border-[var(--brand-surface)] bg-[var(--brand-secondary)] shadow-[0_24px_60px_rgba(57,28,44,0.17)]">
            {firstDetail ? (
              <Image
                src={firstDetail}
                alt=""
                fill
                className="object-cover"
                sizes="340px"
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(140deg,#f1b3c4,#8f3158)]" />
            )}
          </div>

          <div className="absolute right-[2%] top-[3%] z-20 h-[29%] w-[29%] rotate-[7deg] overflow-hidden rounded-[50%_50%_1.4rem_1.4rem] border-[8px] border-[var(--brand-surface)] bg-[var(--brand-secondary)] shadow-xl">
            {secondDetail ? (
              <Image
                src={secondDetail}
                alt=""
                fill
                className="object-cover"
                sizes="260px"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,#fff8fa,transparent_22%),linear-gradient(145deg,#7d2c4c,#e9a0b5)]" />
            )}
          </div>

          <div className="absolute bottom-[4%] left-0 z-30 flex rotate-[-8deg] items-end gap-2 rounded-[1.75rem] border border-white/60 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-xl" aria-hidden="true">
            {POLISH_SHADES.map(
              (
                shade,
                index
              ) => (
                <span
                  key={shade}
                  className="rounded-[999px_999px_45%_45%] shadow-md"
                  style={{
                    width:
                      `${28 + index * 2}px`,
                    height:
                      `${72 + (index % 3) * 14}px`,
                    backgroundColor:
                      shade,
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
