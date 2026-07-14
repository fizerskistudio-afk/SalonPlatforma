export type OwnerActivationLinkType =
  | "invite"
  | "recovery";

export const OWNER_ACTIVATION_RESEND_WINDOW_MS =
  15 * 60 * 1000;

export function getOwnerActivationDedupeKey({
  businessId,
  memberId,
  linkType,
  now = Date.now(),
}: {
  businessId: string;
  memberId: string;
  linkType: OwnerActivationLinkType;
  now?: number;
}): string {
  const resendWindow =
    Math.floor(
      now /
        OWNER_ACTIVATION_RESEND_WINDOW_MS
    );

  return [
    "owner-activation",
    businessId,
    memberId,
    linkType,
    resendWindow,
  ].join(":");
}

function escapeHtml(
  value: string
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function buildOwnerActivationEmail({
  businessName,
  email,
  actionLink,
  linkType,
}: {
  businessName: string;
  email: string;
  actionLink: string;
  linkType: OwnerActivationLinkType;
}) {
  const subject =
    linkType === "invite"
      ? `Ponovni poziv za ${businessName}`
      : `Postavi lozinku za ${businessName}`;

  const introText =
    linkType === "invite"
      ? "Ponovo ti šaljemo poziv za owner pristup."
      : "Email je potvrđen, ali nalog još nije korišćen. Ovim linkom postavljaš lozinku.";

  return {
    subject,
    html: `
      <div style="margin:0;padding:32px;background:#09090b;color:#f4f4f5;font-family:Arial,sans-serif;">
        <div style="max-width:560px;margin:0 auto;border:1px solid #27272a;border-radius:20px;background:#18181b;padding:28px;">
          <p style="margin:0 0 10px;color:#fbbf24;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;">
            Salon Platforma
          </p>
          <h1 style="margin:0;color:#ffffff;font-size:26px;line-height:1.25;">
            ${escapeHtml(
              businessName
            )}
          </h1>
          <p style="margin:18px 0 0;color:#a1a1aa;font-size:15px;line-height:1.7;">
            ${escapeHtml(
              introText
            )}
          </p>
          <p style="margin:12px 0 0;color:#71717a;font-size:13px;line-height:1.6;">
            Owner nalog: ${escapeHtml(
              email
            )}
          </p>
          <a href="${escapeHtml(
            actionLink
          )}" style="display:inline-block;margin-top:24px;border-radius:12px;background:#ffffff;color:#09090b;padding:13px 18px;text-decoration:none;font-size:14px;font-weight:700;">
            Aktiviraj owner nalog
          </a>
          <p style="margin:24px 0 0;color:#52525b;font-size:12px;line-height:1.6;">
            Ako nisi očekivao ovaj email, možeš ga ignorisati.
          </p>
        </div>
      </div>
    `,
    text: [
      businessName,
      "",
      introText,
      `Owner nalog: ${email}`,
      "",
      `Aktivacioni link: ${actionLink}`,
      "",
      "Ako nisi očekivao ovaj email, možeš ga ignorisati.",
    ].join("\n"),
  };
}
