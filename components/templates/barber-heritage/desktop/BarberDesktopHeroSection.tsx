
"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  Award,
  CalendarCheck,
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

type BarberDesktopHeroSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  locationLine: string;
  onBook: () => void;
};

export default function BarberDesktopHeroSection({
  business,
  locale,
  locationLine,
  onBook,
}: BarberDesktopHeroSectionProps) {
  return (
    <section
      id="barber-top"
      className="relative isolate min-h-[calc(100dvh-5rem)] overflow-hidden bg-[var(--brand-background)]"
    >
      {business.heroImageUrl ? (
        <Image
          src={
            business.heroImageUrl
          }
          alt={business.name}
          fill
          priority
          className="barber-hero-image object-cover [object-position:68%_center]"
          sizes="100vw"
        />
      ) : (
        <div className="barber-hero-image absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_72%_24%,color-mix(in_srgb,var(--brand-primary)_27%,transparent),transparent_28%),radial-gradient(circle_at_84%_68%,color-mix(in_srgb,var(--brand-secondary)_80%,transparent),transparent_42%),linear-gradient(125deg,#090806_0%,var(--brand-secondary)_62%,#090806_100%)]">
          <p className="pointer-events-none absolute right-[4%] top-[8%] font-display text-[clamp(8rem,18vw,22rem)] font-semibold leading-none tracking-[-0.08em] text-white/[0.025]">
            HERITAGE
          </p>

          <Scissors
            className="absolute right-[20%] top-1/2 h-28 w-28 -translate-y-1/2 text-[var(--brand-primary)]/20"
            aria-hidden="true"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-black/25" />

      <div className="barber-hero-overlay absolute inset-y-0 left-0 w-[68%] bg-[linear-gradient(90deg,rgba(7,6,4,0.97)_0%,rgba(7,6,4,0.91)_42%,rgba(7,6,4,0.72)_67%,rgba(7,6,4,0.18)_91%,transparent_100%)]" />

      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-5rem)] max-w-[1500px] flex-col px-8 py-10 text-white xl:px-12 xl:py-12">
        <div className="flex items-start justify-between gap-8">
          <p className="barber-hero-eyebrow max-w-xl text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
            {t(
              barberLabels.heroEyebrow,
              locale
            )}
          </p>

          {locationLine && (
            <div className="barber-hero-location inline-flex max-w-sm items-center gap-2 rounded-full border border-white/20 bg-black/25 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.17em] text-white/85 backdrop-blur-md">
              <MapPin
                className="h-3.5 w-3.5 shrink-0 text-[var(--brand-primary)]"
                aria-hidden="true"
              />

              <span className="truncate">
                {locationLine}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-1 items-center py-14">
          <div className="max-w-[790px]">
            <p className="barber-hero-kicker font-display text-sm italic text-white/55">
              Est. / Heritage
            </p>

            <h1 className="mt-6 font-display text-[clamp(5rem,7.8vw,9rem)] font-medium leading-[0.78] tracking-[-0.065em]">
              <span className="barber-hero-title-line block">
                {t(
                  barberLabels.heroHeadline1,
                  locale
                )}
              </span>

              <span className="barber-hero-title-accent mt-2 block text-[var(--brand-primary)]">
                {t(
                  barberLabels.heroHeadline2,
                  locale
                )}
              </span>
            </h1>

            {business.description && (
              <p className="barber-hero-copy mt-10 max-w-xl text-base leading-8 text-white/68">
                {t(
                  business.description,
                  locale
                )}
              </p>
            )}

            <div className="barber-hero-actions mt-11 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onBook}
                className="group inline-flex min-h-14 items-center gap-3 rounded-full bg-[var(--brand-primary)] px-7 text-sm font-semibold text-[var(--brand-background)] transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black/50 motion-reduce:transform-none motion-reduce:transition-none"
              >
                {t(
                  barberLabels.bookAppointment,
                  locale
                )}

                <ArrowUpRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </button>

              <a
                href="#services"
                className="group inline-flex min-h-14 items-center gap-3 rounded-full border border-white/25 bg-black/15 px-7 text-sm font-semibold text-white backdrop-blur-sm transition duration-200 hover:-translate-y-0.5 hover:border-[var(--brand-primary)] hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transform-none motion-reduce:transition-none"
              >
                {t(
                  barberLabels.viewServices,
                  locale
                )}

                <ArrowDownRight
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="barber-hero-trust grid max-w-3xl grid-cols-3 items-center gap-5 border-t border-white/18 pt-6">
          <div className="flex items-center gap-3">
            <CalendarCheck
              className="h-5 w-5 shrink-0 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            <span className="text-sm text-white/65">
              {t(
                barberLabels.heroTrust1,
                locale
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Award
              className="h-5 w-5 shrink-0 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            <span className="text-sm text-white/65">
              {t(
                barberLabels.heroTrust2,
                locale
              )}
            </span>
          </div>

          <div className="justify-self-end text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
            {business.name}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes barberHeroImageIn {
          from {
            transform: scale(1.065);
            filter: saturate(0.78) brightness(0.72);
          }

          to {
            transform: scale(1.015);
            filter: saturate(1) brightness(0.9);
          }
        }

        @keyframes barberHeroOverlayIn {
          from {
            opacity: 0;
            transform: translateX(-7%);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes barberHeroFadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes barberHeroAccentReveal {
          from {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
            transform: translateY(18px);
          }

          to {
            opacity: 1;
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
          }
        }

        .barber-hero-image {
          animation: barberHeroImageIn 14s cubic-bezier(0.16, 1, 0.3, 1)
            both;
        }

        .barber-hero-overlay {
          animation: barberHeroOverlayIn 900ms cubic-bezier(0.16, 1, 0.3, 1)
            both;
        }

        .barber-hero-eyebrow,
        .barber-hero-location,
        .barber-hero-kicker,
        .barber-hero-title-line,
        .barber-hero-copy,
        .barber-hero-actions,
        .barber-hero-trust {
          animation: barberHeroFadeUp 680ms cubic-bezier(0.16, 1, 0.3, 1)
            both;
        }

        .barber-hero-location {
          animation-delay: 80ms;
        }

        .barber-hero-kicker {
          animation-delay: 130ms;
        }

        .barber-hero-title-line {
          animation-delay: 190ms;
        }

        .barber-hero-title-accent {
          animation: barberHeroAccentReveal 820ms
            cubic-bezier(0.16, 1, 0.3, 1) 290ms both;
        }

        .barber-hero-copy {
          animation-delay: 390ms;
        }

        .barber-hero-actions {
          animation-delay: 480ms;
        }

        .barber-hero-trust {
          animation-delay: 570ms;
        }

        @media (prefers-reduced-motion: reduce) {
          .barber-hero-image,
          .barber-hero-overlay,
          .barber-hero-eyebrow,
          .barber-hero-location,
          .barber-hero-kicker,
          .barber-hero-title-line,
          .barber-hero-title-accent,
          .barber-hero-copy,
          .barber-hero-actions,
          .barber-hero-trust {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  );
}
