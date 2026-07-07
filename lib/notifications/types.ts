export type EmailDeliveryScope =
  | "platform"
  | "business";

export type EmailAudience =
  | "platform"
  | "business"
  | "owner"
  | "staff"
  | "customer";

export type EmailDeliveryStatus =
  | "pending"
  | "sent"
  | "failed"
  | "skipped";

export type EmailDeploymentMode =
  | "platform"
  | "standalone";

export type ResolvedEmailSender = {
  from: string;
  replyTo: string | null;
  mode:
    | "platform_system"
    | "platform_business"
    | "business_custom_domain"
    | "standalone";
};

export type NotificationEmailContent = {
  subject: string;
  html: string;
  text: string;
};

export type SendNotificationEmailInput =
  NotificationEmailContent & {
    scope: EmailDeliveryScope;
    audience: EmailAudience;
    templateKey: string;
    dedupeKey: string;
    recipient: string;

    businessId?: string | null;
    bookingId?: string | null;

    metadata?: Record<string, unknown>;
  };

export type SendNotificationEmailResult = {
  ok: boolean;
  status: EmailDeliveryStatus;
  message: string;
  deliveryId?: string;
  providerMessageId?: string;
  skippedBecauseAlreadySent?: boolean;
};
