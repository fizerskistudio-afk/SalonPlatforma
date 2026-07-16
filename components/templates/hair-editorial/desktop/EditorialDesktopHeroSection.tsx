"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

import {
  editorialLabels,
} from "../editorial-utils";

type EditorialDesktopHeroSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  locationLine: string;
  onBook: () => void;
};

export default function EditorialDesktopHeroSection({
  business,
  locale,
  locationLine,
  onBook,
}: EditorialDesktopHeroSectionProps) {
  return (
    <section
      id="editorial-top"
      className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1500px] grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]"
    >
      <div className="flex flex-col justify-between border-r border-[var(--brand-border)] px-8 py-14 xl:px-12 xl:py-20">
        <div className="flex items-center justify-between gap-5">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
            {t(
              editorialLabels.eyebrow,
              locale
            )}
          </p>

          <span className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">
            {t(
              business.city,
              locale
            )}
          </span>
        </div>

        <div className="my-auto max-w-3xl py-16">
          <h1 className="font-display text-[clamp(4.5rem,7vw,8.5rem)] font-medium leading-[0.82] tracking-[-0.055em]">
            {business.name}
          </h1>

          <p className="mt-10 max-w-xl text-[clamp(1.2rem,1.7vw,1.85rem)] leading-snug text-[var(--brand-muted)]">
            {t(
              business.tagline,
              locale
            )}
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-14 items-center gap-3 rounded-full bg-[var(--brand-text)] px-7 text-sm font-semibold text-[var(--brand-background)] transition hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
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
              href="#editorial-services"
              className="inline-flex min-h-14 items-center gap-3 rounded-full border border-[var(--brand-border)] px-7 text-sm font-semibold transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
            >
              {t(
                translations.hero
                  .viewServices,
                locale
              )}

              <ArrowDownRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>

        <p className="max-w-2xl text-sm leading-7 text-[var(--brand-muted)]">
          {t(
            business.description,
            locale
          )}
        </p>
      </div>

      <div className="relative min-h-[720px] overflow-hidden bg-[var(--brand-surface)]">
        {business.heroImageUrl ? (
          <Image
            src={
              business.heroImageUrl
            }
            alt={business.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1200px) 55vw, 850px"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_25%,color-mix(in_srgb,var(--brand-primary)_34%,transparent),transparent_40%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-background)]/70 via-transparent to-transparent" />

        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-8 rounded-[2rem] border border-white/15 bg-black/25 p-6 text-white backdrop-blur-md xl:bottom-10 xl:left-10 xl:right-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
              {t(
                editorialLabels
                  .visitStudio,
                locale
              )}
            </p>

            <p className="mt-2 max-w-md text-lg font-medium">
              {locationLine}
            </p>
          </div>

          <a
            href="#editorial-contact"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/40 motion-reduce:transform-none motion-reduce:transition-none"
            aria-label={t(
              translations.nav.contact,
              locale
            )}
          >
            <ArrowDownRight
              className="h-5 w-5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
