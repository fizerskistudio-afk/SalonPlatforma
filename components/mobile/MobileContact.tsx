"use client";

import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";
import { t, getDayTranslation, translations } from "@/lib/translations";
import SectionHeader from "../shared/SectionHeader";
import { MapPin, Phone, Mail, Clock, AtSign } from "lucide-react";

type MobileContactProps = {
  locale: Locale;
};

/**
 * Mobilni kontakt ekran.
 * Prikazuje kontakt informacije i radno vreme.
 * Kompaktan dizajn prilagođen mobilnim uređajima.
 */
export default function MobileContact({ locale }: MobileContactProps) {
  const { address, city, country, phone, email, instagramHandle, instagramUrl, workingHours } =
    businessConfig;

  return (
    <div
      className="min-h-screen bg-[var(--brand-background)] px-4"
      style={{
        paddingTop: "calc(4.5rem + env(safe-area-inset-top))",
        paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
      }}
    >
      {/* Header */}
      <div className="pt-6 pb-4">
        <SectionHeader
          title={translations.sections.contactTitle}
          subtitle={translations.sections.contactSub}
          locale={locale}
          align="left"
        />
      </div>

      {/* Contact info cards */}
      <div className="space-y-3 mb-8">
        {/* Address */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 border border-[var(--brand-border)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-background)] border border-[var(--brand-border)] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)] mb-1">
                {t(translations.contact.address, locale)}
              </div>
              <div className="text-sm text-[var(--brand-text)] leading-relaxed">
                {t(address, locale)}
                <br />
                {t(city, locale)}, {t(country, locale)}
              </div>
            </div>
          </div>
        </div>

        {/* Phone */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 border border-[var(--brand-border)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-background)] border border-[var(--brand-border)] flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)] mb-1">
                {t(translations.contact.phone, locale)}
              </div>
              <a
                href={`tel:${phone}`}
                className="text-sm text-[var(--brand-text)] hover:text-[var(--brand-primary)] transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] rounded"
              >
                {phone}
              </a>
            </div>
          </div>
        </div>

        {/* Email */}
        <div className="bg-[var(--brand-surface)] rounded-2xl p-4 border border-[var(--brand-border)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-background)] border border-[var(--brand-border)] flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)] mb-1">
                {t(translations.contact.email, locale)}
              </div>
              <a
                href={`mailto:${email}`}
                className="text-sm text-[var(--brand-text)] hover:text-[var(--brand-primary)] transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] rounded"
              >
                {email}
              </a>
            </div>
          </div>
        </div>

        {/* Instagram */}
        {instagramHandle && instagramUrl && (
          <div className="bg-[var(--brand-surface)] rounded-2xl p-4 border border-[var(--brand-border)]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--brand-background)] border border-[var(--brand-border)] flex items-center justify-center flex-shrink-0">
                <AtSign className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider text-[var(--brand-muted)] mb-1">
                  {t(translations.contact.instagram, locale)}
                </div>
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-[var(--brand-text)] hover:text-[var(--brand-primary)] transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] rounded"
                >
                  {instagramHandle}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Working hours */}
      <div className="bg-[var(--brand-surface)] rounded-2xl p-4 border border-[var(--brand-border)]">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
          <h3 className="font-display text-base font-semibold text-[var(--brand-text)]">
            {t(translations.sections.hours, locale)}
          </h3>
        </div>
        <div className="space-y-2">
          {workingHours.map((item) => {
            const dayName = getDayTranslation(item.dayOfWeek, locale);
            const hoursDisplay = item.isClosed
              ? t(translations.contact.closed, locale)
              : item.openTime && item.closeTime
              ? `${item.openTime} – ${item.closeTime}`
              : "";

            return (
              <div
                key={item.dayOfWeek}
                className="flex items-center justify-between py-2 border-b border-[var(--brand-border)] last:border-0"
              >
                <span className="text-sm text-[var(--brand-muted)]">{dayName}</span>
                <span
                  className={`text-sm font-medium ${
                    item.isClosed ? "text-[var(--brand-muted)]" : "text-[var(--brand-text)]"
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
  );
}