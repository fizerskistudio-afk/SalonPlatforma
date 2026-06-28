"use client";

import {
  useEffect,
  useId,
  useRef,
} from "react";
import { X } from "lucide-react";

import type { Locale } from "@/lib/types";
import {
  t,
  translations,
} from "@/lib/translations";
import BookingFlow from "../booking/BookingFlow";

type DesktopBookingModalProps = {
  isOpen: boolean;
  locale: Locale;
  initialServiceId?: string | null;
  initialEmployeeId?: string | null;
  onClose: () => void;
};

export default function DesktopBookingModal({
  isOpen,
  locale,
  initialServiceId = null,
  initialEmployeeId = null,
  onClose,
}: DesktopBookingModalProps) {
  const titleId = useId();

  const closeButtonRef =
    useRef<HTMLButtonElement>(null);

  const previousFocusedElementRef =
    useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previousFocusedElementRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    return () => {
      const previousElement =
        previousFocusedElementRef.current;

      if (
        previousElement &&
        previousElement.isConnected
      ) {
        previousElement.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--brand-text)] opacity-60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-background)] text-[var(--brand-text)] shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex flex-shrink-0 items-center justify-between border-b border-[var(--brand-border)] px-6 py-4">
          <h2
            id={titleId}
            className="font-display text-xl font-semibold text-[var(--brand-text)]"
          >
            {t(
              translations.booking.title,
              locale
            )}
          </h2>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t(
              translations.common.close,
              locale
            )}
            className="rounded-full p-2 text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
          >
            <X
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden">
          <BookingFlow
            locale={locale}
            initialServiceId={
              initialServiceId
            }
            initialEmployeeId={
              initialEmployeeId
            }
            onDone={onClose}
          />
        </div>
      </div>
    </div>
  );
}