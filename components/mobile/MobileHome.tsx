"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
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
    business,
  } = useCatalogData();

  const locationParts = [
    t(business.city, locale),
    t(business.country, locale),
  ].filter(Boolean);

  const location =
    locationParts.join(", ");

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-black">
      {business.heroImageUrl ? (
        <Image
          src={
            business.heroImageUrl
          }
          alt=""
          aria-hidden="true"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black"
          aria-hidden="true"
        />
      )}

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
        {location && (
          <div className="mb-5 inline-flex self-start items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur-sm">
            <MapPin
              className="h-3.5 w-3.5 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            <span className="text-xs font-medium text-white">
              {location}
            </span>
          </div>
        )}

        <h1 className="font-display mb-2 text-4xl font-semibold leading-tight text-white">
          {business.name}
        </h1>

        <p className="font-display mb-5 text-lg italic text-[var(--brand-primary)]">
          {t(
            business.tagline,
            locale
          )}
        </p>

        <p className="mb-8 max-w-md text-sm leading-relaxed text-white/80">
          {t(
            business.description,
            locale
          )}
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-full bg-[var(--brand-primary)] py-4 font-semibold text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none"
          >
            {t(
              translations.hero
                .bookNow,
              locale
            )}
          </button>

          <button
            type="button"
            onClick={
              onExploreServices
            }
            className="w-full rounded-full border border-white/20 bg-white/10 py-3.5 font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black motion-reduce:transition-none"
          >
            {t(
              translations.hero
                .viewServices,
              locale
            )}
          </button>
        </div>
      </div>
    </div>
  );
}