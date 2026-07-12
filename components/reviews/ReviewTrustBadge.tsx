import {
  BadgeCheck,
  Globe2,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  ReactNode,
} from "react";

import {
  t,
  translations,
} from "@/lib/translations";
import type {
  Locale,
} from "@/lib/types";
import type {
  ReviewBadgeKind,
} from "@/lib/reviews/domain";

type ReviewTrustBadgeProps = {
  badge: ReviewBadgeKind;
  locale: Locale;
  className?: string;
};

function getBadgeContent(
  badge: ReviewBadgeKind,
  locale: Locale
): {
  icon: ReactNode;
  label: string;
} {
  switch (badge) {
    case "verified-visit":
      return {
        icon: (
          <BadgeCheck
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        ),
        label: t(
          translations.reviews
            .verifiedVisit,
          locale
        ),
      };

    case "google":
      return {
        icon: (
          <Globe2
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        ),
        label: t(
          translations.reviews
            .googleReview,
          locale
        ),
      };

    case "testimonial":
      return {
        icon: (
          <MessageSquareQuote
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        ),
        label: t(
          translations.reviews
            .salonTestimonial,
          locale
        ),
      };

    case "demo":
      return {
        icon: (
          <Sparkles
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        ),
        label: t(
          translations.reviews
            .demoReview,
          locale
        ),
      };

    case "platform":
      return {
        icon: (
          <ShieldCheck
            className="h-3.5 w-3.5"
            aria-hidden="true"
          />
        ),
        label: t(
          translations.reviews
            .platformReview,
          locale
        ),
      };
  }
}

export default function ReviewTrustBadge({
  badge,
  locale,
  className = "",
}: ReviewTrustBadgeProps) {
  const content =
    getBadgeContent(
      badge,
      locale
    );

  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border border-[var(--brand-border)] bg-[var(--brand-background)] px-2.5 py-1 text-[11px] font-semibold leading-none text-[var(--brand-muted)] ${className}`}
      data-review-badge={
        badge
      }
    >
      {content.icon}
      {content.label}
    </span>
  );
}
