"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  CalendarPlus,
  Clock3,
  Home,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Scissors,
  Users,
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

export default function HairEditorialMobileTemplate({
  locale,
  previewMode,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
  onSwitchToDesktop,
}: PublicTemplateProps) {
  const {
    business,
    categories,
    services,
    employees,
    gallery,
  } = useCatalogData();

  const visibleServices =
    services.slice(0, 6);

  const visibleEmployees =
    employees.slice(0, 6);

  const visibleGallery =
    gallery.slice(0, 8);

  const locationLine =
    getLocationLine(
      business.address,
      business.city,
      business.country,
      locale
    );

  return (
    <div className="min-h-[100dvh] bg-[var(--brand-background)] pb-28 text-[var(--brand-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-background)_90%,transparent)] backdrop-blur-xl">
        <div className="flex min-h-16 items-center justify-between gap-3 px-4">
          <a
            href="#editorial-mobile-home"
            className="min-w-0"
          >
            <p className="truncate font-display text-lg font-semibold tracking-[0.02em]">
              {business.name}
            </p>

            <p className="truncate text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
              {t(
                editorialLabels.eyebrow,
                locale
              )}
            </p>
          </a>

          <LanguageSwitcher
            currentLocale={locale}
            onLocaleChange={
              onLocaleChange
            }
          />
        </div>
      </header>

      <main>
        <section
          id="editorial-mobile-home"
          className="px-3 pt-3"
        >
          <div className="relative min-h-[72dvh] overflow-hidden rounded-[2rem] bg-[var(--brand-surface)]">
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
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_20%,color-mix(in_srgb,var(--brand-primary)_38%,transparent),transparent_38%),linear-gradient(145deg,var(--brand-secondary),var(--brand-surface))]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />

            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md">
                <MapPin
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />

                {t(
                  business.city,
                  locale
                )}
              </div>

              <h1 className="font-display text-[clamp(3.25rem,15vw,5.4rem)] font-medium leading-[0.82] tracking-[-0.055em]">
                {business.name}
              </h1>

              <p className="mt-5 max-w-sm text-base leading-6 text-white/75">
                {t(
                  business.tagline,
                  locale
                )}
              </p>

              <button
                type="button"
                onClick={onBook}
                className="mt-7 inline-flex min-h-13 w-full items-center justify-between rounded-full bg-white px-5 text-sm font-semibold text-black transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/40 motion-reduce:transform-none motion-reduce:transition-none"
              >
                {t(
                  translations.hero.bookNow,
                  locale
                )}

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
                  <ArrowUpRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>
          </div>

          <p className="px-3 pb-5 pt-6 text-sm leading-6 text-[var(--brand-muted)]">
            {t(
              business.description,
              locale
            )}
          </p>
        </section>

        <section
          id="editorial-mobile-services"
          className="border-y border-[var(--brand-border)] py-10"
        >
          <div className="px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              01 /{" "}
              {t(
                translations.nav.services,
                locale
              )}
            </p>

            <h2 className="font-display mt-4 text-4xl font-medium leading-[0.95] tracking-[-0.035em]">
              {t(
                editorialLabels
                  .signatureServices,
                locale
              )}
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--brand-muted)]">
              {t(
                editorialLabels
                  .servicesIntro,
                locale
              )}
            </p>
          </div>

          <div className="mt-8 space-y-2 px-3">
            {visibleServices.map(
              (
                service,
                index
              ) => (
                <article
                  key={service.id}
                  className="rounded-[1.5rem] border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}{" "}
                        /{" "}
                        {getCategoryLabel(
                          service,
                          categories,
                          locale
                        )}
                      </p>

                      <h3 className="font-display mt-2 text-2xl font-medium leading-tight">
                        {t(
                          service.name,
                          locale
                        )}
                      </h3>
                    </div>

                    <p className="shrink-0 text-sm font-semibold">
                      {formatServicePrice(
                        service,
                        business.currency,
                        locale
                      )}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--brand-border)] pt-4">
                    <span className="inline-flex items-center gap-2 text-xs text-[var(--brand-muted)]">
                      <Clock3
                        className="h-3.5 w-3.5"
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

                    <button
                      type="button"
                      onClick={() =>
                        onBookService(
                          service.id
                        )
                      }
                      className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--brand-text)] px-4 text-xs font-semibold text-[var(--brand-background)] transition active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transform-none motion-reduce:transition-none"
                    >
                      {t(
                        translations.nav.book,
                        locale
                      )}

                      <ArrowUpRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              )
            )}

            {visibleServices.length ===
              0 && (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--brand-border)] px-5 py-12 text-center text-sm text-[var(--brand-muted)]">
                {t(
                  translations.common
                    .noServicesDescription,
                  locale
                )}
              </div>
            )}
          </div>
        </section>

        <section
          id="editorial-mobile-team"
          className="py-12"
        >
          <div className="px-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              02 /{" "}
              {t(
                translations.nav.team,
                locale
              )}
            </p>

            <h2 className="font-display mt-4 text-4xl font-medium leading-[0.95] tracking-[-0.035em]">
              {t(
                editorialLabels
                  .meetArtists,
                locale
              )}
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--brand-muted)]">
              {t(
                editorialLabels
                  .teamIntro,
                locale
              )}
            </p>
          </div>

          <div className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-3 pb-2">
            {visibleEmployees.map(
              (employee) => (
                <article
                  key={employee.id}
                  className="w-[78vw] max-w-[330px] shrink-0 snap-center overflow-hidden rounded-[1.8rem] border border-[var(--brand-border)] bg-[var(--brand-surface)]"
                >
                  <div className="relative aspect-[4/5] bg-[var(--brand-secondary)]">
                    {employee.image ? (
                      <Image
                        src={
                          employee.image
                        }
                        alt={employee.name}
                        fill
                        className="object-cover"
                        sizes="78vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-secondary)] to-[var(--brand-surface)]" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <h3 className="font-display text-3xl font-medium">
                        {employee.name}
                      </h3>

                      <p className="mt-1 text-sm text-white/70">
                        {t(
                          employee.role,
                          locale
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-sm leading-6 text-[var(--brand-muted)]">
                      {t(
                        employee.bio,
                        locale
                      )}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        onBookEmployee(
                          employee.id
                        )
                      }
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-between rounded-full border border-[var(--brand-border)] px-4 text-xs font-semibold transition hover:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                    >
                      <span>
                        {t(
                          editorialLabels
                            .bookArtist,
                          locale
                        )}{" "}
                        {employee.name}
                      </span>

                      <ArrowUpRight
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </article>
              )
            )}

            {visibleEmployees.length ===
              0 && (
              <div className="w-full rounded-[1.5rem] border border-dashed border-[var(--brand-border)] px-5 py-12 text-center text-sm text-[var(--brand-muted)]">
                {t(
                  editorialLabels.noTeam,
                  locale
                )}
              </div>
            )}
          </div>
        </section>

        <section
          id="editorial-mobile-gallery"
          className="border-y border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-12"
        >
          <div className="px-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              03 /{" "}
              {t(
                translations.nav.gallery,
                locale
              )}
            </p>

            <h2 className="font-display mt-4 text-4xl font-medium leading-[0.95] tracking-[-0.035em]">
              {t(
                editorialLabels
                  .selectedWork,
                locale
              )}
            </h2>
          </div>

          {visibleGallery.length >
          0 ? (
            <div className="mt-8 grid grid-cols-2 gap-2">
              {visibleGallery.map(
                (
                  item,
                  index
                ) => (
                  <figure
                    key={item.id}
                    className={`relative overflow-hidden rounded-[1.35rem] bg-[var(--brand-secondary)] ${
                      index === 0 ||
                      index === 5
                        ? "col-span-2 aspect-[16/10]"
                        : "aspect-[4/5]"
                    }`}
                  >
                    <Image
                      src={item.url}
                      alt={t(
                        item.alt,
                        locale
                      )}
                      fill
                      className="object-cover"
                      sizes={
                        index === 0 ||
                        index === 5
                          ? "100vw"
                          : "50vw"
                      }
                    />

                    <figcaption className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                      {item.category}
                    </figcaption>
                  </figure>
                )
              )}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--brand-border)] px-5 py-12 text-center text-sm text-[var(--brand-muted)]">
              {t(
                editorialLabels.noGallery,
                locale
              )}
            </div>
          )}
        </section>

        <CatalogReviewsSection
          locale={locale}
          previewMode={
            previewMode
          }
          id="editorial-mobile-reviews"
          className="border-b border-[var(--brand-border)] pb-32"
        />

        <section
          id="editorial-mobile-contact"
          className="px-3 py-12"
        >
          <div className="rounded-[2rem] bg-[var(--brand-primary)] p-6 text-[var(--brand-background)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] opacity-60">
              04 /{" "}
              {t(
                translations.nav.contact,
                locale
              )}
            </p>

            <h2 className="font-display mt-5 text-5xl font-medium leading-[0.9] tracking-[-0.045em]">
              {t(
                editorialLabels
                  .visitStudio,
                locale
              )}
            </h2>

            <div className="mt-8 space-y-5">
              {locationLine && (
                <div className="flex items-start gap-3">
                  <MapPin
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  <span className="text-sm font-medium leading-6">
                    {locationLine}
                  </span>
                </div>
              )}

              {business.phone && (
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center gap-3 text-sm font-medium"
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
                  className="flex items-center gap-3 break-all text-sm font-medium"
                >
                  <Mail
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  {business.email}
                </a>
              )}

              {business.instagramUrl && (
                <a
                  href={
                    business.instagramUrl
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 text-sm font-medium"
                >
                  <InstagramIcon
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  {business.instagramHandle ||
                    t(
                      editorialLabels
                        .followStudio,
                      locale
                    )}
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onBook}
              className="mt-8 inline-flex min-h-13 w-full items-center justify-between rounded-full bg-[var(--brand-background)] px-5 text-sm font-semibold text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-background)] focus:ring-offset-2 focus:ring-offset-[var(--brand-primary)]"
            >
              {t(
                translations.hero.bookNow,
                locale
              )}

              <CalendarPlus
                className="h-5 w-5"
                aria-hidden="true"
              />
            </button>
          </div>

          <button
            type="button"
            onClick={
              onSwitchToDesktop
            }
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--brand-border)] text-xs font-semibold text-[var(--brand-muted)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
          >
            <Monitor
              className="h-4 w-4"
              aria-hidden="true"
            />

            {t(
              editorialLabels
                .openDesktop,
              locale
            )}
          </button>
        </section>
      </main>

      <nav
        className="fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 items-end rounded-[1.6rem] border border-[var(--brand-border)] bg-[color-mix(in_srgb,var(--brand-surface)_92%,transparent)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur-xl"
        aria-label={t(
          translations.common
            .mobileNavigation,
          locale
        )}
      >
        <a
          href="#editorial-mobile-home"
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
        >
          <Home
            className="h-4 w-4"
            aria-hidden="true"
          />

          {t(
            translations.nav.home,
            locale
          )}
        </a>

        <a
          href="#editorial-mobile-services"
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
        >
          <Scissors
            className="h-4 w-4"
            aria-hidden="true"
          />

          {t(
            translations.nav.services,
            locale
          )}
        </a>

        <button
          type="button"
          onClick={onBook}
          className="-mt-7 flex h-16 w-16 justify-self-center items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-background)] shadow-xl ring-4 ring-[var(--brand-background)] focus:outline-none focus:ring-[6px] focus:ring-[var(--brand-background)]"
          aria-label={t(
            translations.hero.bookNow,
            locale
          )}
        >
          <CalendarPlus
            className="h-6 w-6"
            aria-hidden="true"
          />
        </button>

        <a
          href="#editorial-mobile-team"
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
        >
          <Users
            className="h-4 w-4"
            aria-hidden="true"
          />

          {t(
            translations.nav.team,
            locale
          )}
        </a>

        <a
          href="#editorial-mobile-contact"
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[9px] font-medium text-[var(--brand-muted)]"
        >
          <MapPin
            className="h-4 w-4"
            aria-hidden="true"
          />

          {t(
            translations.nav.contact,
            locale
          )}
        </a>
      </nav>
    </div>
  );
}
