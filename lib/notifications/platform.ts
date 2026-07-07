import "server-only";

import {
  sendNotificationEmail,
} from "@/lib/notifications/delivery";
import {
  renderPlatformSystemEmail,
} from "@/lib/notifications/templates";

export async function sendPlatformSystemNotification({
  recipient,
  templateKey,
  dedupeKey,
  title,
  intro,
  lines,
  businessId,
  metadata,
}: {
  recipient: string;
  templateKey: string;
  dedupeKey: string;
  title: string;
  intro: string;
  lines: Array<{
    label: string;
    value: string;
  }>;
  businessId?: string | null;
  metadata?: Record<
    string,
    unknown
  >;
}) {
  const content =
    renderPlatformSystemEmail({
      title,
      intro,
      lines,
    });

  return sendNotificationEmail({
    scope: "platform",
    audience: "platform",
    templateKey,
    dedupeKey,
    recipient,
    businessId:
      businessId ?? null,
    ...content,
    metadata,
  });
}
