"use client";

import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";
import { t, translations } from "@/lib/translations";
import { DEMO_ASSETS } from "@/lib/mockData";
import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";

type HeroProps = {
  locale: Locale;
  onBook: () => void;
  onExploreServices?: () => void;
};

const intlLocaleMap: Record<Locale, string> = {
  mk: "mk-MK",
  sq: "sq-MK",
  en: "en-GB",
};

export default function Hero({
  locale,
  onBook,
  onExploreServices,
}: HeroProps) {
  const {
    showStats,
    stats,
    city,
    country,
  } = businessConfig;

  const intlLocale = intlLocaleMap[locale];

  const location = `${t(
    city,
    locale
  )}, ${t(country, locale)}`;

  return (
    <section
      id="home"
      className="relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)]/30 via-[var(--brand-background)] to-[var(--brand-secondary)]/20" />

      <div
        className="absolute right-20 top-20 h-96 w-96 rounded-full bg-[var(--brand-primary)]/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute bottom-20 left-20 h-80 w-80 rounded-full bg-[var(--brand-secondary)]/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-8 py-24 lg:grid-cols-2 lg:py-32">
        <div>
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)]/60 px-4 py-2 backdrop-blur">
            <MapPin
              className="h-4 w-4 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            <span className="text-sm font-medium text-[var(--brand-text)]">
              {location}
            </span>
          </div>

          <h1 className="font-display mb-6 text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--brand-text)] lg:text-7xl">
            {businessConfig.name}

            <span className="mt-2 block font-normal italic text-[var(--brand-primary)]">
              {t(
                businessConfig.tagline,
                locale
              )}
            </span>
          </h1>

          <p className="mb-10 max-w-lg text-lg leading-relaxed text-[var(--brand-muted)]">
            {t(
              businessConfig.description,
              locale
            )}
          </p>

          <div className="mb-12 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-text)] px-8 py-4 font-medium text-[var(--brand-surface)] transition-all hover:gap-3 hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
            >
              {t(
                translations.hero.bookNow,
                locale
              )}

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

            <a
              href="#services"
              onClick={onExploreServices}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] px-8 py-4 font-medium text-[var(--brand-text)] transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
            >
              {t(
                translations.hero.viewServices,
                locale
              )}
            </a>
          </div>

          {showStats && stats && (
            <div className="flex items-center gap-8">
              {stats.establishedYear && (
                <div>
                  <div className="font-display text-3xl font-semibold text-[var(--brand-text)]">
                    {new Date().getFullYear() -
                      stats.establishedYear}
                    +
                  </div>

                  <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {t(
                      translations.stats.years,
                      locale
                    )}
                  </div>
                </div>
              )}

              {stats.clients && (
                <>
                  <div
                    className="h-10 w-px bg-[var(--brand-border)]"
                    aria-hidden="true"
                  />

                  <div>
                    <div className="font-display text-3xl font-semibold text-[var(--brand-text)]">
                      {stats.clients.toLocaleString(
                        intlLocale
                      )}
                      +
                    </div>

                    <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                      {t(
                        translations.stats.clients,
                        locale
                      )}
                    </div>
                  </div>
                </>
              )}

              {stats.rating && (
                <>
                  <div
                    className="h-10 w-px bg-[var(--brand-border)]"
                    aria-hidden="true"
                  />

                  <div>
                    <div className="font-display flex items-center gap-1 text-3xl font-semibold text-[var(--brand-text)]">
                      {stats.rating}

                      <Star
                        className="h-5 w-5 fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                      {t(
                        translations.stats.rating,
                        locale
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative hidden lg:block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl">
            <Image
              src={DEMO_ASSETS.hero}
              alt={`${businessConfig.name} - ${t(
                businessConfig.tagline,
                locale
              )}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 0vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}