"use client";

import { useEffect, useRef, useId } from "react";
import type { Locale } from "@/lib/types";
import { t, translations } from "@/lib/translations";
import BookingFlow from "../booking/BookingFlow";
import { X } from "lucide-react";

type MobileBookingModalProps = {
  isOpen: boolean;
  locale: Locale;
  initialServiceId?: string | null;
  initialEmployeeId?: string | null;
  onClose: () => void;
};

/**
 * Full-screen mobilni booking modal.
 * Koristi BookingFlow za kompletnu booking logiku.
 * Upravlja fokus-om, Escape key-om i body scroll lock-om.
 */
export default function MobileBookingModal({
  isOpen,
  locale,
  initialServiceId = null,
  initialEmployeeId = null,
  onClose,
}: MobileBookingModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const modalTitleId = useId();

  // Escape key handler
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    return () => {
      const previousElement = previousFocusRef.current;

      if (previousElement && previousElement.isConnected) {
        previousElement.focus();
      }

      previousFocusRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-[var(--brand-background)] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalTitleId}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between px-4 py-3 border-b border-[var(--brand-border)] bg-[var(--brand-background)]">
        <h2
          id={modalTitleId}
          className="font-display text-lg font-semibold text-[var(--brand-text)]"
        >
          {t(translations.booking.title, locale)}
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-[var(--brand-surface)] border border-[var(--brand-border)] flex items-center justify-center text-[var(--brand-text)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-background)] transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
          aria-label={t(translations.common.close, locale)}
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <BookingFlow
          locale={locale}
          initialServiceId={initialServiceId}
          initialEmployeeId={initialEmployeeId}
          onDone={onClose}
        />
      </div>
    </div>
  );
}