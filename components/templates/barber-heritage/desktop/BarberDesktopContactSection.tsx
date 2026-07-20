"use client";

import {
  ArrowUpRight,
  Clock3,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import {
  useMemo,
} from "react";

import InstagramIcon from "@/components/shared/icons/InstagramIcon";
import {
  t,
} from "@/lib/translations";
import type {
  CatalogBusiness,
  DayOfWeek,
  Locale,
  LocalizedText,
  WorkingHours,
} from "@/lib/types";

import {
  barberLabels,
} from "../barber-utils";
import {
  useBarberSectionReveal,
} from "./useBarberSectionReveal";

type BarberDesktopContactSectionProps = {
  business:
    CatalogBusiness;
  locale:
    Locale;
  locationLine:
    string;
  onBook:
    () => void;
};

type ContactLabelKey =
  | "location"
  | "openMap"
  | "contactDetails"
  | "workingHours"
  | "closed"
  | "callSalon"
  | "emailSalon"
  | "followInstagram"
  | "bookingEyebrow";

const CONTACT_LABELS:
  Record<
    ContactLabelKey,
    LocalizedText
  > = {
  location: {
    "sr-Latn":
      "Lokacija",
    mk:
      "Локација",
    hr:
      "Lokacija",
    sq:
      "Vendndodhja",
    en:
      "Location",
    de:
      "Standort",
    fr:
      "Adresse",
  },

  openMap: {
    "sr-Latn":
      "Otvori u mapama",
    mk:
      "Отвори во мапи",
    hr:
      "Otvori u kartama",
    sq:
      "Hape në hartë",
    en:
      "Open in maps",
    de:
      "In Karten öffnen",
    fr:
      "Ouvrir dans Plans",
  },

  contactDetails: {
    "sr-Latn":
      "Direktan kontakt",
    mk:
      "Директен контакт",
    hr:
      "Izravan kontakt",
    sq:
      "Kontakt i drejtpërdrejtë",
    en:
      "Direct contact",
    de:
      "Direkter Kontakt",
    fr:
      "Contact direct",
  },

  workingHours: {
    "sr-Latn":
      "Radno vreme",
    mk:
      "Работно време",
    hr:
      "Radno vrijeme",
    sq:
      "Orari i punës",
    en:
      "Opening hours",
    de:
      "Öffnungszeiten",
    fr:
      "Horaires",
  },

  closed: {
    "sr-Latn":
      "Zatvoreno",
    mk:
      "Затворено",
    hr:
      "Zatvoreno",
    sq:
      "Mbyllur",
    en:
      "Closed",
    de:
      "Geschlossen",
    fr:
      "Fermé",
  },

  callSalon: {
    "sr-Latn":
      "Pozovi salon",
    mk:
      "Јави се во салонот",
    hr:
      "Nazovi salon",
    sq:
      "Telefono sallonin",
    en:
      "Call the salon",
    de:
      "Salon anrufen",
    fr:
      "Appeler le salon",
  },

  emailSalon: {
    "sr-Latn":
      "Pošalji email",
    mk:
      "Испрати е-пошта",
    hr:
      "Pošalji e-mail",
    sq:
      "Dërgo email",
    en:
      "Send an email",
    de:
      "E-Mail senden",
    fr:
      "Envoyer un e-mail",
  },

  followInstagram: {
    "sr-Latn":
      "Instagram",
    mk:
      "Instagram",
    hr:
      "Instagram",
    sq:
      "Instagram",
    en:
      "Instagram",
    de:
      "Instagram",
    fr:
      "Instagram",
  },

  bookingEyebrow: {
    "sr-Latn":
      "Tvoj sledeći termin",
    mk:
      "Твојот следен термин",
    hr:
      "Tvoj sljedeći termin",
    sq:
      "Termini yt i ardhshëm",
    en:
      "Your next appointment",
    de:
      "Ihr nächster Termin",
    fr:
      "Votre prochain rendez-vous",
  },
};

const DAY_ORDER:
  readonly DayOfWeek[] = [
  1,
  2,
  3,
  4,
  5,
  6,
  0,
];

type WorkingHoursGroup = {
  startDay:
    DayOfWeek;
  endDay:
    DayOfWeek;
  schedule:
    string | null;
};

function resolveIntlLocale(
  locale:
    Locale
): string {
  if (
    locale ===
    "sr-Latn"
  ) {
    return "sr-Latn-RS";
  }

  if (
    locale ===
    "sr-Cyrl"
  ) {
    return "sr-Cyrl-RS";
  }

  return (
    locale ||
    "en-GB"
  );
}

function formatDay(
  day:
    DayOfWeek,
  locale:
    Locale
): string {
  const referenceDate =
    new Date(
      Date.UTC(
        2024,
        0,
        7 +
          day
      )
    );

  try {
    return new Intl.DateTimeFormat(
      resolveIntlLocale(
        locale
      ),
      {
        weekday:
          "short",
        timeZone:
          "UTC",
      }
    ).format(
      referenceDate
    );
  } catch {
    return [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ][day];
  }
}

function formatClock(
  value:
    string
): string {
  const match =
    value.match(
      /^(\d{2}):(\d{2})/u
    );

  if (
    !match
  ) {
    return value;
  }

  return `${match[1]}:${match[2]}`;
}

function scheduleForDay(
  hours:
    WorkingHours
): string | null {
  if (
    hours.isClosed ||
    !hours.openTime ||
    !hours.closeTime
  ) {
    return null;
  }

  return `${formatClock(
    hours.openTime
  )}–${formatClock(
    hours.closeTime
  )}`;
}

function groupWorkingHours(
  workingHours:
    readonly WorkingHours[]
): WorkingHoursGroup[] {
  const byDay =
    new Map<
      DayOfWeek,
      WorkingHours
    >(
      workingHours.map(
        (
          hours
        ) => [
          hours.dayOfWeek,
          hours,
        ]
      )
    );

  const ordered =
    DAY_ORDER
      .map(
        (
          day
        ) => {
          const hours =
            byDay.get(
              day
            );

          return hours
            ? {
                day,
                schedule:
                  scheduleForDay(
                    hours
                  ),
              }
            : null;
        }
      )
      .filter(
        (
          item
        ): item is {
          day:
            DayOfWeek;
          schedule:
            string | null;
        } =>
          item !==
          null
      );

  const groups:
    WorkingHoursGroup[] = [];

  for (
    const item of
    ordered
  ) {
    const previous =
      groups[
        groups.length -
          1
      ];

    if (
      previous &&
      previous.schedule ===
        item.schedule
    ) {
      previous.endDay =
        item.day;

      continue;
    }

    groups.push({
      startDay:
        item.day,
      endDay:
        item.day,
      schedule:
        item.schedule,
    });
  }

  return groups;
}

function formatDayRange(
  group:
    WorkingHoursGroup,
  locale:
    Locale
): string {
  const start =
    formatDay(
      group.startDay,
      locale
    );

  if (
    group.startDay ===
    group.endDay
  ) {
    return start;
  }

  return `${start}–${formatDay(
    group.endDay,
    locale
  )}`;
}

export default function BarberDesktopContactSection({
  business,
  locale,
  locationLine,
  onBook,
}: BarberDesktopContactSectionProps) {
  const mapHref =
    locationLine
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          locationLine
        )}`
      : null;

  const workingHoursGroups =
    useMemo(
      () =>
        groupWorkingHours(
          business.workingHours
        ),
      [
        business.workingHours,
      ]
    );

  const {
    isRevealed,
    sectionRef,
  } =
    useBarberSectionReveal({
      rootMargin:
        "0px 0px -8% 0px",
      threshold:
        0.12,
    });

  return (
    <section
      ref={sectionRef}
      id="contact"
      data-barber-revealed={
        isRevealed
          ? "true"
          : "false"
      }
      className="relative isolate scroll-mt-20 overflow-hidden border-b border-[var(--brand-border)] bg-[var(--brand-background)] text-[var(--brand-text)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,color-mix(in_srgb,var(--brand-primary)_7%,transparent),transparent_30%)]" />

      <div className="pointer-events-none absolute -right-6 top-8 font-display text-[18rem] font-semibold leading-none tracking-[-0.09em] text-[var(--brand-primary)]/[0.025]">
        05
      </div>

      <div className="relative mx-auto max-w-[1500px] px-8 py-14 xl:px-12 xl:py-16">
        <header className="grid grid-cols-[minmax(0,0.82fr)_minmax(360px,1.18fr)] items-end gap-8">
          <div className="barber-contact-enter-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              05 /{" "}
              {t(
                barberLabels
                  .navContact,
                locale
              )}
            </p>

            <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(3.1rem,4.25vw,5.35rem)] font-medium leading-[0.89] tracking-[-0.055em]">
              {t(
                barberLabels
                  .contactTitle,
                locale
              )}
            </h2>
          </div>

          <div className="barber-contact-enter-right justify-self-end border-l border-[var(--brand-primary)]/55 pl-6">
            <p className="max-w-lg text-xs leading-6 text-[var(--brand-muted)]">
              {business.name}
            </p>

            <p className="mt-3 max-w-lg text-sm leading-7 text-[var(--brand-muted)]">
              {locationLine ||
                t(
                  CONTACT_LABELS
                    .bookingEyebrow,
                  locale
                )}
            </p>
          </div>
        </header>

        <div className="mt-8 grid items-stretch gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
          <article className="barber-contact-location relative isolate flex min-h-[560px] flex-col overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-primary)] p-8 text-[var(--brand-background)] xl:p-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.22]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,0,0,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.16) 1px, transparent 1px)",
                backgroundSize:
                  "64px 64px",
              }}
            />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_62%_38%,transparent_0,transparent_12%,rgba(0,0,0,0.08)_12.5%,transparent_13%),linear-gradient(135deg,transparent_38%,rgba(0,0,0,0.12)_38.5%,rgba(0,0,0,0.12)_39%,transparent_39.5%)]" />

            <div className="relative flex items-start justify-between gap-6">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-60">
                {t(
                  CONTACT_LABELS
                    .location,
                  locale
                )}
              </p>

              <span className="font-display text-sm uppercase tracking-[0.16em] opacity-55">
                {business.city
                  ? t(
                      business.city,
                      locale
                    )
                  : business.name}
              </span>
            </div>

            <MapPin
              className="relative m-auto h-28 w-28 opacity-20"
              strokeWidth={
                0.8
              }
              aria-hidden="true"
            />

            <div className="relative mt-auto border-t border-black/20 pt-7">
              <p className="max-w-[18ch] font-display text-[clamp(2.35rem,3.1vw,4rem)] font-medium leading-[0.96] tracking-[-0.04em]">
                {locationLine ||
                  business.name}
              </p>

              {mapHref && (
                <a
                  href={
                    mapHref
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-7 inline-flex min-h-11 items-center gap-3 border-b border-black/35 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] transition-opacity hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40 motion-reduce:transition-none"
                >
                  {t(
                    CONTACT_LABELS
                      .openMap,
                    locale
                  )}

                  <ArrowUpRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </a>
              )}
            </div>
          </article>

          <div className="grid min-w-0 grid-rows-[auto_1fr] gap-4">
            <article className="barber-contact-booking relative overflow-hidden border border-[var(--brand-primary)] bg-[var(--brand-surface)] p-7 xl:p-8">
              <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full border border-[var(--brand-primary)]/10" />
              <div className="pointer-events-none absolute -right-3 top-12 h-24 w-24 rounded-full border border-[var(--brand-primary)]/10" />

              <p className="relative text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
                {t(
                  CONTACT_LABELS
                    .bookingEyebrow,
                  locale
                )}
              </p>

              <div className="relative mt-5 flex items-end justify-between gap-8">
                <p className="max-w-[15ch] font-display text-[clamp(2.2rem,2.75vw,3.55rem)] font-medium leading-[0.96] tracking-[-0.04em]">
                  {t(
                    barberLabels
                      .bookAppointment,
                    locale
                  )}
                </p>

                <button
                  type="button"
                  onClick={
                    onBook
                  }
                  className="group inline-flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--brand-background)] transition-transform duration-300 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)] motion-reduce:transform-none motion-reduce:transition-none"
                  aria-label={t(
                    barberLabels
                      .bookAppointment,
                    locale
                  )}
                >
                  <ArrowUpRight
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </article>

            <div className="grid min-h-0 gap-4 xl:grid-cols-2">
              <article className="barber-contact-details border border-[var(--brand-border)] bg-black/[0.12] p-6">
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                  {t(
                    CONTACT_LABELS
                      .contactDetails,
                    locale
                  )}
                </p>

                <div className="mt-6 space-y-3">
                  {business.phone && (
                    <a
                      href={`tel:${business.phone}`}
                      className="group flex min-w-0 items-center gap-3 border-b border-[var(--brand-border)] pb-3 transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
                    >
                      <Phone
                        className="h-4 w-4 flex-none text-[var(--brand-primary)]"
                        aria-hidden="true"
                      />

                      <span className="min-w-0">
                        <span className="block text-[9px] uppercase tracking-[0.14em] text-[var(--brand-muted)]">
                          {t(
                            CONTACT_LABELS
                              .callSalon,
                            locale
                          )}
                        </span>

                        <span className="mt-1 block truncate text-sm font-medium">
                          {business.phone}
                        </span>
                      </span>
                    </a>
                  )}

                  {business.email && (
                    <a
                      href={`mailto:${business.email}`}
                      className="group flex min-w-0 items-center gap-3 border-b border-[var(--brand-border)] pb-3 transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
                    >
                      <Mail
                        className="h-4 w-4 flex-none text-[var(--brand-primary)]"
                        aria-hidden="true"
                      />

                      <span className="min-w-0">
                        <span className="block text-[9px] uppercase tracking-[0.14em] text-[var(--brand-muted)]">
                          {t(
                            CONTACT_LABELS
                              .emailSalon,
                            locale
                          )}
                        </span>

                        <span className="mt-1 block truncate text-sm font-medium">
                          {business.email}
                        </span>
                      </span>
                    </a>
                  )}

                  {business.instagramUrl && (
                    <a
                      href={
                        business.instagramUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="group flex min-w-0 items-center gap-3 border-b border-[var(--brand-border)] pb-3 transition-colors hover:border-[var(--brand-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transition-none"
                    >
                      <InstagramIcon
                        className="h-4 w-4 flex-none text-[var(--brand-primary)]"
                        aria-hidden="true"
                      />

                      <span className="min-w-0">
                        <span className="block text-[9px] uppercase tracking-[0.14em] text-[var(--brand-muted)]">
                          {t(
                            CONTACT_LABELS
                              .followInstagram,
                            locale
                          )}
                        </span>

                        <span className="mt-1 block truncate text-sm font-medium">
                          {business.instagramHandle ||
                            "Instagram"}
                        </span>
                      </span>
                    </a>
                  )}
                </div>
              </article>

              <article className="barber-contact-hours border border-[var(--brand-border)] bg-black/[0.12] p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-muted)]">
                    {t(
                      CONTACT_LABELS
                        .workingHours,
                      locale
                    )}
                  </p>

                  <Clock3
                    className="h-4 w-4 text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />
                </div>

                <div className="mt-6 space-y-3">
                  {workingHoursGroups.map(
                    (
                      group
                    ) => (
                      <div
                        key={`${group.startDay}-${group.endDay}-${group.schedule ?? "closed"}`}
                        className="flex items-center justify-between gap-4 border-b border-[var(--brand-border)] pb-3 text-xs"
                      >
                        <span className="font-semibold uppercase tracking-[0.12em] text-[var(--brand-muted)]">
                          {formatDayRange(
                            group,
                            locale
                          )}
                        </span>

                        <span className="tabular-nums">
                          {group.schedule ??
                            t(
                              CONTACT_LABELS
                                .closed,
                              locale
                            )}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {business.timezone && (
                  <p className="mt-5 truncate text-[9px] uppercase tracking-[0.14em] text-[var(--brand-muted)]">
                    {business.timezone}
                  </p>
                )}
              </article>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .barber-contact-enter-left,
          .barber-contact-enter-right,
          .barber-contact-location,
          .barber-contact-booking,
          .barber-contact-details,
          .barber-contact-hours {
            transition:
              opacity 760ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
            will-change:
              opacity,
              transform;
          }

          [data-barber-revealed="false"]
            .barber-contact-enter-left,
          [data-barber-revealed="false"]
            .barber-contact-location {
            opacity: 0;
            transform: translateX(-30px);
          }

          [data-barber-revealed="false"]
            .barber-contact-enter-right,
          [data-barber-revealed="false"]
            .barber-contact-booking,
          [data-barber-revealed="false"]
            .barber-contact-details,
          [data-barber-revealed="false"]
            .barber-contact-hours {
            opacity: 0;
            transform: translateX(30px);
          }

          [data-barber-revealed="true"]
            .barber-contact-enter-left,
          [data-barber-revealed="true"]
            .barber-contact-enter-right,
          [data-barber-revealed="true"]
            .barber-contact-location,
          [data-barber-revealed="true"]
            .barber-contact-booking,
          [data-barber-revealed="true"]
            .barber-contact-details,
          [data-barber-revealed="true"]
            .barber-contact-hours {
            opacity: 1;
            transform: translateX(0);
          }

          [data-barber-revealed="true"]
            .barber-contact-booking {
            transition-delay: 90ms;
          }

          [data-barber-revealed="true"]
            .barber-contact-details {
            transition-delay: 160ms;
          }

          [data-barber-revealed="true"]
            .barber-contact-hours {
            transition-delay: 230ms;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .barber-contact-enter-left,
          .barber-contact-enter-right,
          .barber-contact-location,
          .barber-contact-booking,
          .barber-contact-details,
          .barber-contact-hours {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
