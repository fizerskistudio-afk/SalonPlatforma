"use client";

import {
  useEffect,
  useId,
  useRef,
  type CSSProperties,
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

type CSSVariables = CSSProperties & {
  [key: `--${string}`]: string | number;
};

const modalTheme: CSSVariables = {
  "--brand-primary": "#d6b98c",
  "--brand-secondary": "rgba(255, 255, 255, 0.09)",
  "--brand-background": "rgba(18, 18, 20, 0.91)",
  "--brand-surface": "rgba(35, 35, 38, 0.88)",
  "--brand-text": "#f7f7f7",
  "--brand-muted": "rgba(247, 247, 247, 0.66)",
  "--brand-border": "rgba(255, 255, 255, 0.17)",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        onClick={onClose}
        aria-label={t(
          translations.common.close,
          locale
        )}
        className="absolute inset-0 cursor-default bg-black/20"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={modalTheme}
        className="relative z-10 flex h-[calc(100dvh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-background)] text-[var(--brand-text)] shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:h-[min(88dvh,850px)] sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--brand-border)] bg-[var(--brand-surface)] px-4 py-3 sm:px-6 sm:py-4">
          <h2
            id={titleId}
            className="font-display text-lg font-semibold text-[var(--brand-text)] sm:text-xl"
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
            className="rounded-full p-2 text-[var(--brand-muted)] transition-colors hover:bg-[var(--brand-secondary)] hover:text-[var(--brand-text)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
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