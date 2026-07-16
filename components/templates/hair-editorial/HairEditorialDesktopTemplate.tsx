"use client";

import Image from "next/image";
import {
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Scissors,
} from "lucide-react";

import CatalogReviewsSection from "@/components/reviews/CatalogReviewsSection";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import InstagramIcon from "@/components/shared/icons/InstagramIcon";
import {
  useCatalogData,
} from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";

import type {
  PublicTemplateProps,
} from "../template-props";
import {
  editorialLabels,
  formatServicePrice,
  getCategoryLabel,
  getLocationLine,
} from "./editorial-utils";

const galleryLayouts = [
  "col-span-7 row-span-3",
  "col-span-5 row-span-2",
  "col-span-5 row-span-2",
  "col-span-4 row-span-2",
  "col-span-4 row-span-2",
  "col-span-4 row-span-2",
] as const;

export default function HairEditorialDesktopTemplate({
  locale,
  previewMode,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
}: PublicTemplateProps) {
  const {
    business,
    categories,
    services,
    employees,
    gallery,
  } = useCatalogData();

  const visibleServices =
    services.slice(0, 8);

  const visibleEmployees =
    employees.slice(0, 6);

  const visibleGallery =
    gallery.slice(0, 6);

  const locationLine =
    getLocationLine(
      business.address,
      business.city,
      business.country,
      locale
    );

  const currentYear =
    new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[var(--brand-background)] text-[var(--brand-text)]">
      <header className="sticky top-0 z-50 border-b border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-background)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1500px] items-center justify-between px-8 xl:px-12">
          <a
            href="#editorial-top"
            className="group flex min-w-0 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)]">
              <Scissors
                className="h-4 w-4 text-[var(--brand-primary)]"
                aria-hidden="true"
              />
            </span>

            <span className="truncate font-display text-lg font-semibold tracking-[0.04em]">
              {business.name}
            </span>
          </a>

          <nav
            className="flex items-center gap-7 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-muted)]"
            aria-label={t(
              translations.common
                .mainNavigation,
              locale
            )}
          >
            <a
              href="#editorial-services"
              className="transition-colors hover:text-[var(--brand-text)]"
            >
              {t(
                translations.nav.services,
                locale
              )}
            </a>

            <a
              href="#editorial-team"
              className="transition-colors hover:text-[var(--brand-text)]"
            >
              {t(
                translations.nav.team,
                locale
              )}
            </a>

            <a
              href="#editorial-gallery"
              className="transition-colors hover:text-[var(--brand-text)]"
            >
              {t(
                translations.nav.gallery,
                locale
              )}
            </a>

            <a
              href="#editorial-reviews"
              className="transition-colors hover:text-[var(--brand-text)]"
            >
              {t(
                translations.nav.reviews,
                locale
              )}
            </a>

            <a
              href="#editorial-contact"
              className="transition-colors hover:text-[var(--brand-text)]"
            >
              {t(
                translations.nav.contact,
                locale
              )}
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher
              currentLocale={locale}
              onLocaleChange={
                onLocaleChange
              }
            />

            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 text-sm font-semibold text-[var(--brand-background)] transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transform-none motion-reduce:transition-none"
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
        </div>
      </header>

      <main>
        <section
          id="editorial-top"
          className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1500px] grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]"
        >
          <div className="flex flex-col justify-between border-r border-[var(--brand-border)] px-8 py-14 xl:px-12 xl:py-20">
            <div className="flex items-center justify-between gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
                {t(
                  editorialLabels.eyebrow,
                  locale
                )}
              </p>

              <span className="text-xs uppercase tracking-[0.16em] text-[var(--brand-muted)]">
                {t(
                  business.city,
                  locale
                )}
              </span>
            </div>

            <div className="my-auto max-w-3xl py-16">
              <h1 className="font-display text-[clamp(4.5rem,7vw,8.5rem)] font-medium leading-[0.82] tracking-[-0.055em]">
                {business.name}
              </h1>

              <p className="mt-10 max-w-xl text-[clamp(1.2rem,1.7vw,1.85rem)] leading-snug text-[var(--brand-muted)]">
                {t(
                  business.tagline,
                  locale
                )}
              </p>

              <div className="mt-12 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onBook}
                  className="inline-flex min-h-14 items-center gap-3 rounded-full bg-[var(--brand-text)] px-7 text-sm font-semibold text-[var(--brand-background)] transition hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
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

                <a
                  href="#editorial-services"
                  className="inline-flex min-h-14 items-center gap-3 rounded-full border border-[var(--brand-border)] px-7 text-sm font-semibold transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                >
                  {t(
                    translations.hero
                      .viewServices,
                    locale
                  )}

                  <ArrowDownRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-7 text-[var(--brand-muted)]">
              {t(
                business.description,
                locale
              )}
            </p>
          </div>

          <div className="relative min-h-[720px] overflow-hidden bg-[var(--brand-surface)]">
            {business.heroImageUrl ? (
              <Image
                src={
                  business.heroImageUrl
                }
                alt={business.name}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1200px) 55vw, 850px"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_25%,color-mix(in_srgb,var(--brand-primary)_34%,transparent),transparent_40%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-[var(--brand-background)]/70 via-transparent to-transparent" />

            <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between gap-8 rounded-[2rem] border border-white/15 bg-black/25 p-6 text-white backdrop-blur-md xl:bottom-10 xl:left-10 xl:right-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/65">
                  {t(
                    editorialLabels
                      .visitStudio,
                    locale
                  )}
                </p>

                <p className="mt-2 max-w-md text-lg font-medium">
                  {locationLine}
                </p>
              </div>

              <a
                href="#editorial-contact"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-black transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/40 motion-reduce:transform-none motion-reduce:transition-none"
                aria-label={t(
                  translations.nav.contact,
                  locale
                )}
              >
                <ArrowDownRight
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
        </section>

        <section
          id="editorial-services"
          className="border-y border-[var(--brand-border)]"
        >
          <div className="mx-auto grid max-w-[1500px] grid-cols-[0.68fr_1.32fr]">
            <div className="border-r border-[var(--brand-border)] px-8 py-20 xl:px-12 xl:py-28">
              <div className="sticky top-32">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
                  01 /{" "}
                  {t(
                    translations.nav.services,
                    locale
                  )}
                </p>

                <h2 className="font-display mt-6 max-w-lg text-6xl font-medium leading-[0.92] tracking-[-0.04em]">
                  {t(
                    editorialLabels
                      .signatureServices,
                    locale
                  )}
                </h2>

                <p className="mt-8 max-w-md text-base leading-7 text-[var(--brand-muted)]">
                  {t(
                    editorialLabels
                      .servicesIntro,
                    locale
                  )}
                </p>
              </div>
            </div>

            <div>
              {visibleServices.map(
                (
                  service,
                  index
                ) => (
                  <article
                    key={service.id}
                    className="group grid grid-cols-[60px_minmax(0,1fr)_auto] items-center gap-6 border-b border-[var(--brand-border)] px-8 py-8 last:border-b-0 xl:px-12"
                  >
                    <span className="font-display text-2xl text-[var(--brand-muted)]/60">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>

                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                        {getCategoryLabel(
                          service,
                          categories,
                          locale
                        )}
                      </p>

                      <h3 className="font-display mt-2 text-3xl font-medium tracking-[-0.02em] transition-colors group-hover:text-[var(--brand-primary)] motion-reduce:transition-none">
                        {t(
                          service.name,
                          locale
                        )}
                      </h3>

                      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-[var(--brand-muted)]">
                        <span className="inline-flex items-center gap-2">
                          <Clock3
                            className="h-4 w-4"
                            aria-hidden="true"
                          />

                          {
                            service.durationMinutes
                          }{" "}
                          {t(
                            translations.booking
                              .minutes,
                            locale
                          )}
                        </span>

                        {service.description && (
                          <span className="line-clamp-1 max-w-xl">
                            {t(
                              service.description,
                              locale
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <span className="whitespace-nowrap text-base font-semibold">
                        {formatServicePrice(
                          service,
                          business.currency,
                          locale
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onBookService(
                            service.id
                          )
                        }
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] transition group-hover:border-[var(--brand-primary)] group-hover:bg-[var(--brand-primary)] group-hover:text-[var(--brand-background)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                        aria-label={`${t(
                          editorialLabels
                            .bookService,
                          locale
                        )}: ${t(
                          service.name,
                          locale
                        )}`}
                      >
                        <ArrowUpRight
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </article>
                )
              )}

              {visibleServices.length ===
                0 && (
                <div className="px-8 py-24 text-center text-[var(--brand-muted)] xl:px-12">
                  {t(
                    translations.common
                      .noServicesDescription,
                    locale
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <section
          id="editorial-team"
          className="mx-auto max-w-[1500px] px-8 py-24 xl:px-12 xl:py-32"
        >
          <div className="flex items-end justify-between gap-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
                02 /{" "}
                {t(
                  translations.nav.team,
                  locale
                )}
              </p>

              <h2 className="font-display mt-6 max-w-3xl text-6xl font-medium leading-[0.92] tracking-[-0.04em]">
                {t(
                  editorialLabels
                    .meetArtists,
                  locale
                )}
              </h2>
            </div>

            <p className="max-w-md text-right text-base leading-7 text-[var(--brand-muted)]">
              {t(
                editorialLabels
                  .teamIntro,
                locale
              )}
            </p>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-5">
            {visibleEmployees.map(
              (
                employee,
                index
              ) => (
                <article
                  key={employee.id}
                  className={`group ${
                    index === 1
                      ? "mt-14"
                      : ""
                  }`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[var(--brand-surface)]">
                    {employee.image ? (
                      <Image
                        src={
                          employee.image
                        }
                        alt={employee.name}
                        fill
                        className="object-cover grayscale-[20%] transition duration-700 group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transform-none motion-reduce:transition-none"
                        sizes="(max-width: 1200px) 33vw, 470px"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-surface)]" />
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        onBookEmployee(
                          employee.id
                        )
                      }
                      className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-text)] text-[var(--brand-background)] shadow-xl transition hover:scale-105 hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-black/40 motion-reduce:transform-none motion-reduce:transition-none"
                      aria-label={`${t(
                        editorialLabels
                          .bookArtist,
                        locale
                      )} ${employee.name}`}
                    >
                      <ArrowUpRight
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-5 px-1 pt-5">
                    <div>
                      <h3 className="font-display text-2xl font-medium">
                        {employee.name}
                      </h3>

                      <p className="mt-1 text-sm text-[var(--brand-primary)]">
                        {t(
                          employee.role,
                          locale
                        )}
                      </p>
                    </div>

                    <span className="pt-1 text-xs text-[var(--brand-muted)]">
                      {String(
                        index + 1
                      ).padStart(2, "0")}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 max-w-md px-1 text-sm leading-6 text-[var(--brand-muted)]">
                    {t(
                      employee.bio,
                      locale
                    )}
                  </p>
                </article>
              )
            )}

            {visibleEmployees.length ===
              0 && (
              <div className="col-span-3 rounded-[2rem] border border-dashed border-[var(--brand-border)] px-8 py-20 text-center text-[var(--brand-muted)]">
                {t(
                  editorialLabels.noTeam,
                  locale
                )}
              </div>
            )}
          </div>
        </section>

        <section
          id="editorial-gallery"
          className="border-y border-[var(--brand-border)] bg-[var(--brand-surface)]"
        >
          <div className="mx-auto max-w-[1500px] px-8 py-24 xl:px-12 xl:py-32">
            <div className="grid grid-cols-[0.8fr_1.2fr] items-end gap-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
                  03 /{" "}
                  {t(
                    translations.nav.gallery,
                    locale
                  )}
                </p>

                <h2 className="font-display mt-6 text-6xl font-medium leading-[0.92] tracking-[-0.04em]">
                  {t(
                    editorialLabels
                      .selectedWork,
                    locale
                  )}
                </h2>
              </div>

              <p className="max-w-xl justify-self-end text-right text-base leading-7 text-[var(--brand-muted)]">
                {t(
                  editorialLabels
                    .galleryIntro,
                  locale
                )}
              </p>
            </div>

            {visibleGallery.length >
            0 ? (
              <div className="mt-16 grid auto-rows-[125px] grid-cols-12 gap-4">
                {visibleGallery.map(
                  (
                    item,
                    index
                  ) => (
                    <figure
                      key={item.id}
                      className={`group relative overflow-hidden rounded-[1.6rem] bg-[var(--brand-secondary)] ${
                        galleryLayouts[
                          index %
                            galleryLayouts.length
                        ]
                      }`}
                    >
                      <Image
                        src={item.url}
                        alt={t(
                          item.alt,
                          locale
                        )}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                        sizes="(max-width: 1200px) 50vw, 900px"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 transition group-hover:opacity-40 motion-reduce:transition-none" />

                      <figcaption className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                        {item.category}
                      </figcaption>
                    </figure>
                  )
                )}
              </div>
            ) : (
              <div className="mt-16 rounded-[2rem] border border-dashed border-[var(--brand-border)] px-8 py-20 text-center text-[var(--brand-muted)]">
                {t(
                  editorialLabels.noGallery,
                  locale
                )}
              </div>
            )}
          </div>
        </section>

        <CatalogReviewsSection
          locale={locale}
          previewMode={
            previewMode
          }
          id="editorial-reviews"
          className="border-b border-[var(--brand-border)]"
          contentClassName="max-w-[1500px]"
        />

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
      </main>

      <footer className="border-t border-[var(--brand-border)]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-8 px-8 py-8 text-xs text-[var(--brand-muted)] xl:px-12">
          <p>
            © {currentYear}{" "}
            {business.name}.{" "}
            {t(
              translations.common
                .allRightsReserved,
              locale
            )}.
          </p>

          <p className="uppercase tracking-[0.16em]">
            Hair Editorial / 01
          </p>
        </div>
      </footer>
    </div>
  );
}
