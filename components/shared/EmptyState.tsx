"use client";

import type {
  Locale,
  LocalizedText,
} from "@/lib/types";
import type { LucideIcon } from "lucide-react";
import { InboxIcon } from "lucide-react";
import { t } from "@/lib/translations";

type EmptyStateProps = {
  title: LocalizedText;
  description: LocalizedText;
  actionLabel?: LocalizedText;
  onAction?: () => void;
  icon?: LucideIcon;
  locale: Locale;
};

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = InboxIcon,
  locale,
}: EmptyStateProps) {
  const hasAction = actionLabel && onAction;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-secondary)]">
        <Icon
          className="h-8 w-8 text-[var(--brand-muted)]"
          aria-hidden="true"
        />
      </div>

      <h3 className="font-display mb-2 text-xl font-semibold text-[var(--brand-text)]">
        {t(title, locale)}
      </h3>

      <p className="mb-6 max-w-sm text-sm leading-relaxed text-[var(--brand-muted)]">
        {t(description, locale)}
      </p>

      {hasAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-xl bg-[var(--brand-text)] px-6 py-2.5 text-sm font-medium text-[var(--brand-surface)] transition-colors hover:bg-[var(--brand-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 motion-reduce:transition-none"
          aria-label={t(actionLabel, locale)}
        >
          {t(actionLabel, locale)}
        </button>
      )}
    </div>
  );
}