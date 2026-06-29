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

type MobileContactProps = {
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

export default function MobileContact({
  locale,
}: MobileContactProps) {
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
    <div
      className="min-h-screen bg-[var(--brand-background)] px-4"
      style={{
        paddingTop:
          "calc(4.5rem + env(safe-area-inset-top))",

        paddingBottom:
          "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      <div className="pb-4 pt-6">
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
          align="left"
        />
      </div>

      <div className="mb-8 space-y-3">
        {locationParts.length > 0 && (
          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)]">
                <MapPin
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {t(
                    translations.contact
                      .address,
                    locale
                  )}
                </div>

                <div className="text-sm leading-relaxed text-[var(--brand-text)]">
                  {locationParts.join(
                    ", "
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {phone && phoneHref && (
          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)]">
                <Phone
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {t(
                    translations.contact
                      .phone,
                    locale
                  )}
                </div>

                <a
                  href={phoneHref}
                  className="rounded text-sm text-[var(--brand-text)] transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                >
                  {phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {email && (
          <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)]">
                <Mail
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                  {t(
                    translations.contact
                      .email,
                    locale
                  )}
                </div>

                <a
                  href={`mailto:${email}`}
                  className="rounded text-sm text-[var(--brand-text)] transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                >
                  {email}
                </a>
              </div>
            </div>
          </div>
        )}

        {instagramHandle &&
          instagramUrl && (
            <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--brand-border)] bg-[var(--brand-background)]">
                  <AtSign
                    className="h-5 w-5 text-[var(--brand-primary)]"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-xs uppercase tracking-wider text-[var(--brand-muted)]">
                    {t(
                      translations.contact
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
                    className="rounded text-sm text-[var(--brand-text)] transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] motion-reduce:transition-none"
                  >
                    {
                      instagramHandle
                    }
                  </a>
                </div>
              </div>
            </div>
          )}
      </div>

      <div className="rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-4">
        <div className="mb-4 flex items-center gap-2">
          <Clock
            className="h-5 w-5 text-[var(--brand-primary)]"
            aria-hidden="true"
          />

          <h3 className="font-display text-base font-semibold text-[var(--brand-text)]">
            {t(
              translations.sections
                .hours,
              locale
            )}
          </h3>
        </div>

        <div className="space-y-2">
          {workingHours.map(
            (item) => {
              const dayName =
                getDayTranslation(
                  item.dayOfWeek,
                  locale
                );

              const closedLabel = t(
                translations.contact
                  .closed,
                locale
              );

              const hoursDisplay =
                item.isClosed
                  ? closedLabel
                  : item.openTime &&
                      item.closeTime
                    ? `${formatClockTime(
                        item.openTime
                      )} – ${formatClockTime(
                        item.closeTime
                      )}`
                    : closedLabel;

              return (
                <div
                  key={
                    item.dayOfWeek
                  }
                  className="flex items-center justify-between border-b border-[var(--brand-border)] py-2 last:border-0"
                >
                  <span className="text-sm text-[var(--brand-muted)]">
                    {dayName}
                  </span>

                  <span
                    className={`text-sm font-medium ${
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
  );
}