"use client";

import Image from "next/image";
import {
  MapPin,
  Star,
} from "lucide-react";

import { businessConfig } from "@/lib/config";
import { DEMO_ASSETS } from "@/lib/mockData";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

type MobileHomeProps = {
  locale: Locale;
  onBook: () => void;
  onExploreServices: () => void;
};

export default function MobileHome({
  locale,
  onBook,
  onExploreServices,
}: MobileHomeProps) {
  const {
    showStats,
    stats,
    city,
    country,
  } = businessConfig;

  const location = `${t(
    city,
    locale
  )}, ${t(country, locale)}`;

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden">
      <Image
        src={DEMO_ASSETS.hero}
        alt=""
        aria-hidden="true"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      <div
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/95"
        aria-hidden="true"
      />

      <div
        className="relative z-10 flex min-h-[100dvh] flex-col justify-end px-5"
        style={{
          paddingTop:
            "calc(4.5rem + env(safe-area-inset-top))",
          paddingBottom:
            "calc(6rem + env(safe-area-inset-bottom))",
        }}
      >
        <div className="mb-5 inline-flex self-start items-center gap-1.5 rounded-full border border-[var(--brand-text)]/20 bg-[var(--brand-text)]/10 px-3 py-1.5 backdrop-blur-sm">
          <MapPin
            className="h-3.5 w-3.5 text-[var(--brand-primary)]"
            aria-hidden="true"
          />

          <span className="text-xs font-medium text-[var(--brand-text)]">
            {location}
          </span>
        </div>

        <h1 className="font-display mb-2 text-4xl font-semibold leading-tight text-[var(--brand-text)]">
          {businessConfig.name}
        </h1>

        <p className="font-display mb-5 text-lg italic text-[var(--brand-primary)]">
          {t(
            businessConfig.tagline,
            locale
          )}
        </p>

        <p className="mb-8 max-w-md text-sm leading-relaxed text-[var(--brand-text)]/80">
          {t(
            businessConfig.description,
            locale
          )}
        </p>

        <div className="mb-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-full bg-[var(--brand-primary)] py-4 font-semibold text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
          >
            {t(
              translations.hero.bookNow,
              locale
            )}
          </button>

          <button
            type="button"
            onClick={onExploreServices}
            className="w-full rounded-full border border-[var(--brand-text)]/20 bg-[var(--brand-text)]/10 py-3.5 font-medium text-[var(--brand-text)] backdrop-blur-sm transition-colors hover:bg-[var(--brand-text)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
          >
            {t(
              translations.hero
                .viewServices,
              locale
            )}
          </button>
        </div>

        {showStats && stats && (
          <div className="flex items-center gap-4 border-t border-[var(--brand-text)]/10 pt-6">
            {stats.establishedYear && (
              <div className="text-center">
                <div className="font-display text-xl font-semibold leading-tight text-[var(--brand-primary)]">
                  {stats.establishedYear}
                </div>

                <div className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--brand-text)]/60">
                  {t(
                    translations.stats.since,
                    locale
                  )}
                </div>
              </div>
            )}

            {stats.clients && (
              <>
                <div
                  className="h-8 w-px bg-[var(--brand-text)]/20"
                  aria-hidden="true"
                />

                <div className="text-center">
                  <div className="font-display text-xl font-semibold leading-tight text-[var(--brand-primary)]">
                    {String(
                      stats.clients
                    )}
                    +
                  </div>

                  <div className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--brand-text)]/60">
                    {t(
                      translations.stats
                        .clients,
                      locale
                    )}
                  </div>
                </div>
              </>
            )}

            {stats.rating && (
              <>
                <div
                  className="h-8 w-px bg-[var(--brand-text)]/20"
                  aria-hidden="true"
                />

                <div className="text-center">
                  <div className="font-display flex items-center justify-center gap-1 text-xl font-semibold leading-tight text-[var(--brand-primary)]">
                    <span>
                      {String(
                        stats.rating
                      )}
                    </span>

                    <Star
                      className="h-3.5 w-3.5 fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--brand-text)]/60">
                    {t(
                      translations.stats
                        .rating,
                      locale
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}