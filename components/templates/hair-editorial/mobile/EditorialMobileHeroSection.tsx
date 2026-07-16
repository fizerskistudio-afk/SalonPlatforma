"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  MapPin,
} from "lucide-react";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

type EditorialMobileHeroSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  onBook: () => void;
};

export default function EditorialMobileHeroSection({
  business,
  locale,
  onBook,
}: EditorialMobileHeroSectionProps) {
  return (
    <section
      id="editorial-mobile-home"
      className="px-3 pt-3"
    >
      <div className="relative min-h-[72dvh] overflow-hidden rounded-[2rem] bg-[var(--brand-surface)]">
        {business.heroImageUrl ? (
          <Image
            src={
              business.heroImageUrl
            }
            alt={business.name}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_20%,color-mix(in_srgb,var(--brand-primary)_38%,transparent),transparent_38%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />

        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
            <MapPin
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            {t(
              business.city,
              locale
            )}
          </div>

          <h1 className="font-display text-[clamp(3.25rem,15vw,5.4rem)] font-medium leading-[0.82] tracking-[-0.055em]">
            {business.name}
          </h1>

          <p className="mt-5 max-w-sm text-base leading-6 text-white/75">
            {t(
              business.tagline,
              locale
            )}
          </p>

          <button
            type="button"
            onClick={onBook}
            className="mt-7 inline-flex min-h-13 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-semibold text-black transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/40 motion-reduce:transform-none motion-reduce:transition-none"
          >
            {t(
              translations.hero.bookNow,
              locale
            )}

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
              <ArrowUpRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>
      </div>

      <p className="px-3 pb-5 pt-6 text-sm leading-6 text-[var(--brand-muted)]">
        {t(
          business.description,
          locale
        )}
      </p>
    </section>
  );
}
