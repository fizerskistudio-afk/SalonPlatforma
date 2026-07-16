"use client";

import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
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
  editorialLabels,
} from "../editorial-utils";

type EditorialDesktopContactSectionProps = {
  business: CatalogBusiness;
  locale: Locale;
  locationLine: string;
  onBook: () => void;
};

export default function EditorialDesktopContactSection({
  business,
  locale,
  locationLine,
  onBook,
}: EditorialDesktopContactSectionProps) {
  return (
    <section
      id="editorial-contact"
      className="mx-auto max-w-[1500px] px-8 py-24 xl:px-12 xl:py-32"
    >
      <div className="overflow-hidden rounded-[2.5rem] border border-[var(--brand-border)] bg-[var(--brand-primary)] text-[var(--brand-background)]">
        <div className="grid grid-cols-[1.05fr_0.95fr]">
          <div className="border-r border-black/15 p-10 xl:p-16">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-60">
              04 /{" "}
              {t(
                translations.nav.contact,
                locale
              )}
            </p>

            <h2 className="font-display mt-8 max-w-3xl text-7xl font-medium leading-[0.88] tracking-[-0.05em]">
              {t(
                editorialLabels
                  .visitStudio,
                locale
              )}
            </h2>

            <p className="mt-8 max-w-xl text-lg leading-8 opacity-70">
              {t(
                editorialLabels
                  .contactIntro,
                locale
              )}
            </p>

            <button
              type="button"
              onClick={onBook}
              className="mt-12 inline-flex min-h-14 items-center gap-3 rounded-full bg-[var(--brand-background)] px-7 text-sm font-semibold text-[var(--brand-text)] transition hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--brand-background)] focus:ring-offset-2 focus:ring-offset-[var(--brand-primary)] motion-reduce:transform-none motion-reduce:transition-none"
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
          </div>

          <div className="flex flex-col justify-between gap-10 p-10 xl:p-16">
            <div className="space-y-7">
              {locationLine && (
                <div className="flex items-start gap-4">
                  <MapPin
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="text-base font-medium leading-7">
                    {locationLine}
                  </span>
                </div>
              )}

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-4 text-base font-medium transition-opacity hover:opacity-60"
                >
                  <Phone
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  {business.phone}
                </a>
              )}

              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-4 break-all text-base font-medium transition-opacity hover:opacity-60"
                >
                  <Mail
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  {business.email}
                </a>
              )}
            </div>

            {business.instagramUrl && (
              <a
                href={
                  business.instagramUrl
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-fit items-center gap-3 border-b border-black/35 pb-2 text-sm font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-60"
              >
                <InstagramIcon
                  className="h-5 w-5"
                  aria-hidden="true"
                />

                {business.instagramHandle ||
                  t(
                    editorialLabels
                      .followStudio,
                    locale
                  )}

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
