"use client";

import {
  AtSign,
  Clock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  getDayTranslation,
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import SectionHeader from "../shared/SectionHeader";

type ContactSectionProps = {
  locale: Locale;
};

function formatClockTime(
  value: string | null
): string {
  if (!value) {
    return "";
  }

  const match =
    value.match(
      /^(\d{2}):(\d{2})/
    );

  if (!match) {
    return value;
  }

  return `${match[1]}:${match[2]}`;
}

function getMondayFirstOrder(
  dayOfWeek: number
): number {
  return (
    dayOfWeek + 6
  ) % 7;
}

export default function ContactSection({
  locale,
}: ContactSectionProps) {
  const {
    business,
  } = useCatalogData();

  const {
    address,
    city,
    country,
    phone,
    email,
    instagramHandle,
    instagramUrl,
  } = business;

  const phoneHref = phone
    ? `tel:${phone.replace(
        /[^\d+]/g,
        ""
      )}`
    : null;

  const locationParts = [
    t(address, locale),
    t(city, locale),
    t(country, locale),
  ].filter(Boolean);

  const workingHours = [
    ...business.workingHours,
  ].sort(
    (first, second) =>
      getMondayFirstOrder(
        first.dayOfWeek
      ) -
      getMondayFirstOrder(
        second.dayOfWeek
      )
  );

  return (
    <section
      id="contact"
      className="mx-auto max-w-7xl px-8 py-24"
    >
      <SectionHeader
        title={
          translations.sections
            .contactTitle
        }
        subtitle={
          translations.sections
            .contactSub
        }
        locale={locale}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <address className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-10 not-italic shadow-lg">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-secondary)]">
                <MapPin
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div>
                <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {t(
                    translations.contact
                      .address,
                    locale
                  )}
                </div>

                <div className="font-medium text-[var(--brand-text)]">
                  {locationParts.join(
                    ", "
                  )}
                </div>
              </div>
            </div>

            {phone &&
              phoneHref && (
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-secondary)]">
                    <Phone
                      className="h-5 w-5 text-[var(--brand-primary)]"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                      {t(
                        translations
                          .contact
                          .phone,
                        locale
                      )}
                    </div>

                    <a
                      href={phoneHref}
                      className="rounded font-medium text-[var(--brand-text)] transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
                    >
                      {phone}
                    </a>
                  </div>
                </div>
              )}

            {email && (
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-secondary)]">
                  <Mail
                    className="h-5 w-5 text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {t(
                      translations.contact
                        .email,
                      locale
                    )}
                  </div>

                  <a
                    href={`mailto:${email}`}
                    className="rounded font-medium text-[var(--brand-text)] transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
                  >
                    {email}
                  </a>
                </div>
              </div>
            )}

            {instagramUrl &&
              instagramHandle && (
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-secondary)]">
                    <AtSign
                      className="h-5 w-5 text-[var(--brand-primary)]"
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                      {t(
                        translations
                          .contact
                          .instagram,
                        locale
                      )}
                    </div>

                    <a
                      href={
                        instagramUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="rounded font-medium text-[var(--brand-text)] transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
                    >
                      {
                        instagramHandle
                      }
                    </a>
                  </div>
                </div>
              )}
          </div>
        </address>

        <div className="rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-10 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <Clock
              className="h-5 w-5 text-[var(--brand-primary)]"
              aria-hidden="true"
            />

            <h3 className="font-display text-xl font-semibold text-[var(--brand-text)]">
              {t(
                translations.sections
                  .hours,
                locale
              )}
            </h3>
          </div>

          <div className="space-y-3">
            {workingHours.map(
              (item) => {
                const dayName =
                  getDayTranslation(
                    item.dayOfWeek,
                    locale
                  );

                const hoursDisplay =
                  item.isClosed
                    ? t(
                        translations
                          .contact
                          .closed,
                        locale
                      )
                    : item.openTime &&
                        item.closeTime
                      ? `${formatClockTime(
                          item.openTime
                        )} – ${formatClockTime(
                          item.closeTime
                        )}`
                      : t(
                          translations
                            .contact
                            .closed,
                          locale
                        );

                return (
                  <div
                    key={
                      item.dayOfWeek
                    }
                    className="flex items-center justify-between border-b border-[var(--brand-border)] py-2 last:border-0"
                  >
                    <span className="text-[var(--brand-muted)]">
                      {dayName}
                    </span>

                    <span
                      className={`font-medium ${
                        item.isClosed
                          ? "text-[var(--brand-muted)]"
                          : "text-[var(--brand-text)]"
                      }`}
                    >
                      {hoursDisplay}
                    </span>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>
    </section>
  );
}