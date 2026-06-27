"use client";

import type { BookingDraft, Locale } from "@/lib/types";
import { bookingConfig } from "@/lib/config";
import { t, translations } from "@/lib/translations";
import {
  Mail,
  Phone as PhoneIcon,
  StickyNote,
  User,
} from "lucide-react";
import SectionHeader from "../shared/SectionHeader";

type CustomerField = keyof BookingDraft["customer"];

type CustomerStepProps = {
  locale: Locale;
  customer: BookingDraft["customer"];
  onCustomerChange: (
    field: CustomerField,
    value: string
  ) => void;
};

export default function CustomerStep({
  locale,
  customer,
  onCustomerChange,
}: CustomerStepProps) {
  const {
    requirePhone,
    requireEmail,
    allowNotes,
  } = bookingConfig;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={translations.booking.yourInfo}
        subtitle={
          translations.booking.yourInfoDescription
        }
        locale={locale}
        align="left"
      />

      <div className="space-y-5">
        <div>
          <label
            htmlFor="customer-name"
            className="mb-2 block text-sm font-medium text-[var(--brand-text)]"
          >
            {t(
              translations.booking.fullName,
              locale
            )}

            <span
              className="ml-1 text-[var(--brand-primary)]"
              aria-hidden="true"
            >
              *
            </span>
          </label>

          <div className="relative">
            <User
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]"
              aria-hidden="true"
            />

            <input
              id="customer-name"
              type="text"
              value={customer.name}
              onChange={(event) =>
                onCustomerChange(
                  "name",
                  event.target.value
                )
              }
              autoComplete="name"
              required
              aria-required="true"
              placeholder={t(
                translations.customer.namePlaceholder,
                locale
              )}
              className="w-full rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] py-3.5 pl-11 pr-4 text-[var(--brand-text)] transition-colors placeholder:text-[var(--brand-muted)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 motion-reduce:transition-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="customer-phone"
            className="mb-2 block text-sm font-medium text-[var(--brand-text)]"
          >
            {t(translations.booking.phone, locale)}

            {requirePhone && (
              <span
                className="ml-1 text-[var(--brand-primary)]"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>

          <div className="relative">
            <PhoneIcon
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]"
              aria-hidden="true"
            />

            <input
              id="customer-phone"
              type="tel"
              inputMode="tel"
              value={customer.phone}
              onChange={(event) =>
                onCustomerChange(
                  "phone",
                  event.target.value
                )
              }
              autoComplete="tel"
              required={requirePhone}
              aria-required={requirePhone}
              placeholder={t(
                translations.customer.phonePlaceholder,
                locale
              )}
              className="w-full rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] py-3.5 pl-11 pr-4 text-[var(--brand-text)] transition-colors placeholder:text-[var(--brand-muted)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 motion-reduce:transition-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="customer-email"
            className="mb-2 block text-sm font-medium text-[var(--brand-text)]"
          >
            {t(translations.booking.email, locale)}

            {requireEmail && (
              <span
                className="ml-1 text-[var(--brand-primary)]"
                aria-hidden="true"
              >
                *
              </span>
            )}
          </label>

          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--brand-muted)]"
              aria-hidden="true"
            />

            <input
              id="customer-email"
              type="email"
              inputMode="email"
              value={customer.email}
              onChange={(event) =>
                onCustomerChange(
                  "email",
                  event.target.value
                )
              }
              autoComplete="email"
              required={requireEmail}
              aria-required={requireEmail}
              placeholder={t(
                translations.customer.emailPlaceholder,
                locale
              )}
              className="w-full rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] py-3.5 pl-11 pr-4 text-[var(--brand-text)] transition-colors placeholder:text-[var(--brand-muted)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 motion-reduce:transition-none"
            />
          </div>
        </div>

        {allowNotes && (
          <div>
            <label
              htmlFor="customer-note"
              className="mb-2 block text-sm font-medium text-[var(--brand-text)]"
            >
              {t(translations.booking.note, locale)}
            </label>

            <div className="relative">
              <StickyNote
                className="absolute left-4 top-4 h-4 w-4 text-[var(--brand-muted)]"
                aria-hidden="true"
              />

              <textarea
                id="customer-note"
                value={customer.note}
                onChange={(event) =>
                  onCustomerChange(
                    "note",
                    event.target.value
                  )
                }
                rows={3}
                placeholder={t(
                  translations.customer.notePlaceholder,
                  locale
                )}
                className="w-full resize-none rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] py-3 pl-11 pr-4 text-[var(--brand-text)] transition-colors placeholder:text-[var(--brand-muted)] focus:border-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 motion-reduce:transition-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}