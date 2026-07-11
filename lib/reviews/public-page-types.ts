export type PublicReviewMode =
  | "direct"
  | "verified";

export type PublicReviewPageContext = {
  businessSlug: string;
  businessName: string;
  defaultLocale: string;
  salonUrl: string;
  moderationRequired: boolean;
  timezone: string;

  serviceName:
    | string
    | null;

  employeeName:
    | string
    | null;

  bookingStartsAt:
    | string
    | null;

  expiresAt:
    | string
    | null;
};
