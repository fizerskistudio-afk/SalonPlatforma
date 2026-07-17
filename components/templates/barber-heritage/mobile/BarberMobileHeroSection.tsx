
"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  MapPin,
  Scissors,
} from "lucide-react";

import {
  t,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

import {
  barberLabels,
} from "../barber-utils";

type BarberMobileHeroSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  locationLine: string;
  onBook: () => void;
};

export default function BarberMobileHeroSection({
  business,
  locale,
  locationLine,
  onBook,
}: BarberMobileHeroSectionProps) {
  return (
    <section
      id="barber-mobile-home"
      className="h-full min-h-0 px-3 pb-3 pt-3"
    >
      <div className="relative h-full min-h-0 overflow-hidden rounded-[1.7rem] border border-[var(--brand-border)] bg-[var(--brand-surface)]">
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
          <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_55%_20%,color-mix(in_srgb,var(--brand-primary)_30%,transparent),transparent_38%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]">
            <Scissors
              className="h-20 w-20 text-[var(--brand-primary)]/20"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10" />

        <div className="absolute inset-x-0 bottom-0 p-6 pb-7 text-white">
          {locationLine && (
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] backdrop-blur-md">
              <MapPin
                className="h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />

              <span className="truncate">
                {locationLine}
              </span>
            </div>
          )}

          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
            {t(
              barberLabels.heroEyebrow,
              locale
            )}
          </p>

          <h1 className="mt-3 font-display text-[clamp(3.05rem,15vw,5.2rem)] font-medium leading-[0.82] tracking-[-0.06em]">
            {t(
              barberLabels.heroHeadline1,
              locale
            )}

            <br />

            <span className="text-[var(--brand-primary)]">
              {t(
                barberLabels.heroHeadline2,
                locale
              )}
            </span>
          </h1>

          {business.tagline && (
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/70">
              {t(
                business.tagline,
                locale
              )}
            </p>
          )}

          <button
            type="button"
            onClick={onBook}
            className="mt-5 inline-flex min-h-13 w-full items-center justify-between rounded-full bg-[var(--brand-primary)] px-5 text-sm font-semibold text-[var(--brand-background)] transition duration-200 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transform-none motion-reduce:transition-none"
          >
            {t(
              barberLabels.bookAppointment,
              locale
            )}

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-background)] text-[var(--brand-primary)]">
              <ArrowUpRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
