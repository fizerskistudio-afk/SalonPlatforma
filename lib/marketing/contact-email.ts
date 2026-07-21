import "server-only";

import { createHash } from "node:crypto";

import { getNotificationEmailConfig } from "@/lib/notifications/config";
import { sendResendEmail } from "@/lib/notifications/resend";
import type { ContactRequest } from "./contact-validation";

const TYPE_LABELS: Record<string, string> = {
  "beauty-salon": "Beauty salon",
  "hair-salon": "Frizerski salon",
  barbershop: "Barbershop",
  nails: "Nail studio",
  "spa-wellness": "Spa / wellness",
  other: "Drugo",
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  })[character] ?? character);
}

export async function sendContactRequestEmail(input: ContactRequest, requestId: string) {
  const config = getNotificationEmailConfig();
  if (!config.enabled) throw new Error("Email delivery is disabled.");

  const recipient = config.testMode
    ? config.testRecipient
    : config.platformBusinessEmailAddress;
  if (!recipient) throw new Error("Contact recipient is missing.");

  const type = TYPE_LABELS[input.studioType] ?? "Drugo";
  const lines = [
    `Ime: ${input.name}`,
    `Studio: ${input.studio}`,
    `Tip: ${type}`,
    `Email: ${input.email}`,
    `Telefon: ${input.phone || "nije naveden"}`,
    "",
    input.message,
  ];
  const idempotencyKey = createHash("sha256")
    .update(`${requestId}\u001f${input.email}\u001f${input.studio}`)
    .digest("hex");

  return sendResendEmail({
    from: config.platformFrom,
    to: recipient,
    replyTo: input.email,
    subject: `Novi Ordum upit — ${input.studio}`,
    text: lines.join("\n"),
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#20201f"><h1 style="font-size:22px">Novi upit sa Ordum landing stranice</h1><p><strong>Ime:</strong> ${escapeHtml(input.name)}<br><strong>Studio:</strong> ${escapeHtml(input.studio)}<br><strong>Tip:</strong> ${escapeHtml(type)}<br><strong>Email:</strong> ${escapeHtml(input.email)}<br><strong>Telefon:</strong> ${escapeHtml(input.phone || "nije naveden")}</p><hr><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p></div>`,
    idempotencyKey,
    tags: [{ name: "category", value: "platform_contact" }],
  });
}
