import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";
import {
  getDayTranslation,
  t,
  translations,
} from "@/lib/translations";
import SectionHeader from "../shared/SectionHeader";
import {
  AtSign,
  Clock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

type ContactSectionProps = {
  locale: Locale;
};

export default function ContactSection({
  locale,
}: ContactSectionProps) {
  const {
    address,
    city,
    country,
    phone,
    email,
    instagramHandle,
    instagramUrl,
    workingHours,
  } = businessConfig;

  const phoneHref = `tel:${phone.replace(
    /[^\d+]/g,
    ""
  )}`;

  return (
    <section
      id="contact"
      className="mx-auto max-w-7xl px-8 py-24"
    >
      <SectionHeader
        title={translations.sections.contactTitle}
        subtitle={translations.sections.contactSub}
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
                    translations.contact.address,
                    locale
                  )}
                </div>

                <div className="font-medium text-[var(--brand-text)]">
                  {t(address, locale)},{" "}
                  {t(city, locale)},{" "}
                  {t(country, locale)}
                </div>
              </div>
            </div>

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
                    translations.contact.phone,
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
                    translations.contact.email,
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
                    translations.contact.instagram,
                    locale
                  )}
                </div>

                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded font-medium text-[var(--brand-text)] transition-colors hover:text-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
                >
                  {instagramHandle}
                </a>
              </div>
            </div>
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
                translations.sections.hours,
                locale
              )}
            </h3>
          </div>

          <div className="space-y-3">
            {workingHours.map((item) => {
              const dayName = getDayTranslation(
                item.dayOfWeek,
                locale
              );

              const hoursDisplay = item.isClosed
                ? t(
                    translations.contact.closed,
                    locale
                  )
                : item.openTime &&
                    item.closeTime
                  ? `${item.openTime} – ${item.closeTime}`
                  : "";

              return (
                <div
                  key={item.dayOfWeek}
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
            })}
          </div>
        </div>
      </div>
    </section>
  );
}