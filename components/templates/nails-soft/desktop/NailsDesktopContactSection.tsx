"use client";

import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Sparkle,
} from "lucide-react";

import InstagramIcon from "@/components/shared/icons/InstagramIcon";
import {
  t,
  translations,
} from "@/lib/translations";

import type {
  CatalogBusiness,
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

type NailsDesktopContactSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  locationLine: string;
  onBook: () => void;
};

const APPOINTMENT_SHADES = [
  "#f3b0c2",
  "#c12f69",
  "#742a49",
  "#e98b6c",
] as const;

export default function NailsDesktopContactSection({
  business,
  locale,
  locationLine,
  onBook,
}: NailsDesktopContactSectionProps) {
  const mapsHref =
    locationLine
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          locationLine
        )}`
      : null;

  return (
    <section
      id="nails-contact"
      className="relative isolate overflow-hidden bg-[var(--brand-background)] px-8 py-20 xl:px-10 xl:py-24"
      data-nails-atelier="appointment-card"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,color-mix(in_srgb,var(--brand-secondary)_70%,transparent),transparent_28%),radial-gradient(circle_at_88%_80%,color-mix(in_srgb,var(--brand-primary)_14%,transparent),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1320px]">
        <div className="grid min-h-[560px] overflow-hidden rounded-[4rem_1.5rem_4rem_1.5rem] border border-white/60 bg-[var(--brand-surface)] shadow-[0_30px_80px_rgba(55,28,42,0.12)] lg:grid-cols-[minmax(0,1.05fr)_minmax(400px,0.95fr)]">
          <div className="relative isolate flex flex-col justify-between overflow-hidden bg-[var(--brand-primary)] p-10 text-[var(--brand-background)] xl:p-12">
            <div className="pointer-events-none absolute -right-36 -top-36 h-[34rem] w-[34rem] rounded-full border-[5rem] border-white/10" />
            <div className="pointer-events-none absolute bottom-[-12rem] left-[-8rem] h-[30rem] w-[30rem] rounded-full bg-white/10 blur-3xl" />

            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                <Sparkle
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                {t(
                  nailsLabels.appointmentLabel,
                  locale
                )}
              </p>

              <h2 className="mt-7 max-w-[10ch] font-display text-[clamp(3.7rem,5vw,5.7rem)] font-medium italic leading-[0.85] tracking-[-0.052em]">
                {t(
                  nailsLabels.visitTitle,
                  locale
                )}
              </h2>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/72">
                {t(
                  nailsLabels.contactIntro,
                  locale
                )}
              </p>
            </div>

            <div className="relative flex items-end justify-between gap-8">
              <button
                type="button"
                onClick={onBook}
                className="inline-flex min-h-13 items-center gap-3 rounded-full bg-[var(--brand-background)] px-6 text-sm font-semibold text-[var(--brand-text)] transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)] motion-reduce:transform-none motion-reduce:transition-none"
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

              <div className="flex items-end gap-2" aria-hidden="true">
                {APPOINTMENT_SHADES.map(
                  (
                    shade,
                    index
                  ) => (
                    <span
                      key={shade}
                      className="rounded-[999px_999px_45%_45%] shadow-lg"
                      style={{
                        width:
                          `${33 + index * 2}px`,
                        height:
                          `${92 + (index % 2) * 20}px`,
                        backgroundColor:
                          shade,
                      }}
                    />
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-rows-[1fr_auto]">
            <div className="relative flex flex-col justify-center p-10 xl:p-12">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                {t(
                  nailsLabels.studioDetails,
                  locale
                )}
              </p>

              <div className="mt-6 space-y-3">
                {mapsHref && (
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-4 rounded-[1.75rem_1.75rem_1.75rem_0.75rem] border border-[var(--brand-border)] bg-[var(--brand-background)] p-4 text-sm font-medium leading-6 transition hover:border-[var(--brand-primary)] motion-reduce:transition-none"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-background)]">
                      <MapPin
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="pt-2">
                      {locationLine}
                    </span>

                    <ArrowUpRight
                      className="ml-auto mt-2 h-4 w-4 text-[var(--brand-primary)]"
                      aria-hidden="true"
                    />
                  </a>
                )}

                {business.phone && (
                  <a
                    href={`tel:${business.phone}`}
                    className="flex items-center gap-4 rounded-full border border-[var(--brand-border)] px-5 py-4 text-sm font-medium transition hover:border-[var(--brand-primary)] motion-reduce:transition-none"
                  >
                    <Phone
                      className="h-4 w-4 text-[var(--brand-primary)]"
                      aria-hidden="true"
                    />

                    {business.phone}
                  </a>
                )}

                {business.email && (
                  <a
                    href={`mailto:${business.email}`}
                    className="flex items-center gap-4 rounded-full border border-[var(--brand-border)] px-5 py-4 text-sm font-medium transition hover:border-[var(--brand-primary)] motion-reduce:transition-none"
                  >
                    <Mail
                      className="h-4 w-4 text-[var(--brand-primary)]"
                      aria-hidden="true"
                    />

                    <span className="break-all">
                      {business.email}
                    </span>
                  </a>
                )}

                <div className="flex items-center gap-4 rounded-full border border-[var(--brand-border)] px-5 py-4 text-sm text-[var(--brand-muted)]">
                  <Clock3
                    className="h-4 w-4 text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />

                  {business.timezone}
                </div>
              </div>
            </div>

            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 border-t border-[var(--brand-border)] bg-[var(--brand-background)] px-12 py-7 text-xs font-semibold uppercase tracking-[0.16em] transition hover:text-[var(--brand-primary)] motion-reduce:transition-none xl:px-16"
              >
                <span className="inline-flex items-center gap-3">
                  <InstagramIcon
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  {business.instagramHandle ||
                    t(
                      nailsLabels.followStudio,
                      locale
                    )}
                </span>

                <ArrowUpRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
