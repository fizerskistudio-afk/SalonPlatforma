"use client";

import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react";

import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";
import { DEMO_ASSETS } from "@/lib/mockData";
import {
  t,
  translations,
} from "@/lib/translations";

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

  const location = `${t(
    city,
    locale
  )}, ${t(country, locale)}`;

  return (
    <section
      id="home"
      className="relative min-h-screen scroll-mt-20 overflow-hidden"
    >
      <Image
        src={DEMO_ASSETS.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-black/35"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/10"
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-16 pt-32 sm:px-8 sm:pt-36">
        <div className="max-w-xl lg:max-w-2xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 backdrop-blur-md">
            <MapPin
              className="h-4 w-4 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            <span className="text-sm font-medium text-white">
              {location}
            </span>
          </div>

          <h1 className="mb-5 font-serif text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {businessConfig.name}
          </h1>

          <div className="mb-6 max-w-xl font-serif text-3xl font-normal italic leading-[1.04] text-[var(--brand-primary)] sm:text-4xl lg:text-5xl">
            {t(
              businessConfig.tagline,
              locale
            )}
          </div>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t(
              businessConfig.description,
              locale
            )}
          </p>

          <div className="mb-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-7 py-3.5 font-semibold text-black transition-all hover:gap-3 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none"
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
              className="inline-flex min-h-12 items-center rounded-full border border-white/25 bg-black/30 px-7 py-3.5 font-medium text-white backdrop-blur-md transition-colors hover:border-[var(--brand-primary)] hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none"
            >
              {t(
                translations.hero.viewServices,
                locale
              )}
            </a>
          </div>

          {showStats && stats && (
            <div className="flex flex-wrap items-center gap-6 sm:gap-8">
              {stats.establishedYear && (
                <div>
                  <div className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                    {new Date().getFullYear() -
                      stats.establishedYear}
                    +
                  </div>

                  <div className="text-xs uppercase tracking-wider text-white/55">
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
                    className="hidden h-10 w-px bg-white/20 sm:block"
                    aria-hidden="true"
                  />

                  <div>
                    <div className="font-serif text-2xl font-semibold text-white sm:text-3xl">
                      {stats.clients.toLocaleString(
                        intlLocaleMap[locale]
                      )}
                      +
                    </div>

                    <div className="text-xs uppercase tracking-wider text-white/55">
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
                    className="hidden h-10 w-px bg-white/20 sm:block"
                    aria-hidden="true"
                  />

                  <div>
                    <div className="flex items-center gap-1 font-serif text-2xl font-semibold text-white sm:text-3xl">
                      {stats.rating}

                      <Star
                        className="h-5 w-5 fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="text-xs uppercase tracking-wider text-white/55">
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
      </div>
    </section>
  );
}