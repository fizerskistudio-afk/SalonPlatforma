"use client";

import Image from "next/image";
import {
  ArrowRight,
  MapPin,
} from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

type HeroProps = {
  locale: Locale;
  onBook: () => void;
  onExploreServices?: () => void;
};

export default function Hero({
  locale,
  onBook,
  onExploreServices,
}: HeroProps) {
  const {
    business,
  } = useCatalogData();

  const locationParts = [
    t(business.city, locale),
    t(business.country, locale),
  ].filter(Boolean);

  const location =
    locationParts.join(", ");

  return (
    <section
      id="home"
      className="relative min-h-screen scroll-mt-20 overflow-hidden bg-black"
    >
      {business.heroImageUrl ? (
        <Image
          src={
            business.heroImageUrl
          }
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          aria-hidden="true"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black"
          aria-hidden="true"
        />
      )}

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
          {location && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-4 py-2 backdrop-blur-md">
              <MapPin
                className="h-4 w-4 text-[var(--brand-primary)]"
                aria-hidden="true"
              />

              <span className="text-sm font-medium text-white">
                {location}
              </span>
            </div>
          )}

          <h1 className="mb-5 font-serif text-4xl font-semibold leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            {business.name}
          </h1>

          <div className="mb-6 max-w-xl font-serif text-3xl font-normal italic leading-[1.04] text-[var(--brand-primary)] sm:text-4xl lg:text-5xl">
            {t(
              business.tagline,
              locale
            )}
          </div>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t(
              business.description,
              locale
            )}
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-7 py-3.5 font-semibold text-black transition-all hover:gap-3 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none"
            >
              {t(
                translations.hero
                  .bookNow,
                locale
              )}

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

            <a
              href="#services"
              onClick={
                onExploreServices
              }
              className="inline-flex min-h-12 items-center rounded-full border border-white/25 bg-black/30 px-7 py-3.5 font-medium text-white backdrop-blur-md transition-colors hover:border-[var(--brand-primary)] hover:bg-black/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none"
            >
              {t(
                translations.hero
                  .viewServices,
                locale
              )}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}