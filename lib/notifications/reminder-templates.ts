import "server-only";

import type {
  BookingNotificationTemplateContext,
} from "@/lib/notifications/templates";

export type BookingReminderKind =
  | "24h"
  | "2h";

export type BookingReminderEmailContent = {
  subject: string;
  html: string;
  text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatAppointment(
  startsAt: string,
  timezone: string
): {
  date: string;
  time: string;
} {
  const date = new Date(startsAt);

  if (Number.isNaN(date.getTime())) {
    return {
      date: startsAt,
      time: "",
    };
  }

  return {
    date: new Intl.DateTimeFormat(
      "sr-Latn-RS",
      {
        dateStyle: "full",
        timeZone: timezone,
      }
    ).format(date),
    time: new Intl.DateTimeFormat(
      "sr-Latn-RS",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone,
      }
    ).format(date),
  };
}

function getLeadText(
  kind: BookingReminderKind
): string {
  return kind === "24h"
    ? "sutra"
    : "za približno dva sata";
}

function getTitle(
  kind: BookingReminderKind
): string {
  return kind === "24h"
    ? "Podsetnik za sutrašnji termin"
    : "Vaš termin je uskoro";
}

export function renderBookingReminderEmail(
  context: BookingNotificationTemplateContext,
  kind: BookingReminderKind
): BookingReminderEmailContent {
  const appointment = formatAppointment(
    context.startsAt,
    context.timezone
  );

  const title = getTitle(kind);
  const leadText = getLeadText(kind);
  const subject = `${title} — ${context.businessName}`;
  const address = context.businessAddress
    ? `<div style="margin-top:6px;color:#71717a;">${escapeHtml(context.businessAddress)}</div>`
    : "";
  const phone = context.businessPhone
    ? `<div style="margin-top:6px;color:#71717a;">Telefon: ${escapeHtml(context.businessPhone)}</div>`
    : "";

  const html = `
    <div style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:Arial,sans-serif;color:#18181b;">
      <div style="max-width:620px;margin:0 auto;border:1px solid #e4e4e7;border-radius:20px;background:#ffffff;overflow:hidden;">
        <div style="padding:28px 30px;background:#18181b;color:#ffffff;">
          <div style="font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fbbf24;">${escapeHtml(context.businessName)}</div>
          <h1 style="margin:10px 0 0;font-size:25px;line-height:1.25;">${escapeHtml(title)}</h1>
        </div>

        <div style="padding:30px;">
          <p style="margin:0;font-size:16px;line-height:1.65;">
            Zdravo ${escapeHtml(context.customerName)}, podsećamo vas da imate zakazan termin ${escapeHtml(leadText)}.
          </p>

          <div style="margin:24px 0;padding:20px;border:1px solid #e4e4e7;border-radius:16px;background:#fafafa;">
            <div style="font-size:14px;color:#71717a;">Datum i vreme</div>
            <div style="margin-top:5px;font-size:18px;font-weight:700;">${escapeHtml(appointment.date)}${appointment.time ? ` u ${escapeHtml(appointment.time)}` : ""}</div>

            <div style="margin-top:18px;font-size:14px;color:#71717a;">Usluga</div>
            <div style="margin-top:5px;font-size:16px;font-weight:600;">${escapeHtml(context.serviceName)}</div>

            <div style="margin-top:18px;font-size:14px;color:#71717a;">Frizer</div>
            <div style="margin-top:5px;font-size:16px;font-weight:600;">${escapeHtml(context.employeeName)}</div>

            <div style="margin-top:18px;font-size:14px;color:#71717a;">Broj rezervacije</div>
            <div style="margin-top:5px;font-family:monospace;font-size:15px;font-weight:700;">${escapeHtml(context.referenceCode)}</div>
          </div>

          <p style="margin:0;font-size:14px;line-height:1.65;color:#52525b;">
            Ako ne možete da dođete, kontaktirajte salon što pre kako bi termin mogao da bude oslobođen.
          </p>

          <div style="margin-top:26px;padding-top:22px;border-top:1px solid #e4e4e7;font-size:13px;line-height:1.55;color:#71717a;">
            <strong style="color:#27272a;">${escapeHtml(context.businessName)}</strong>
            ${address}
            ${phone}
          </div>
        </div>
      </div>
    </div>
  `;

  const text = [
    title,
    "",
    `Zdravo ${context.customerName}, podsećamo vas da imate zakazan termin ${leadText}.`,
    "",
    `Datum: ${appointment.date}`,
    appointment.time
      ? `Vreme: ${appointment.time}`
      : null,
    `Usluga: ${context.serviceName}`,
    `Frizer: ${context.employeeName}`,
    `Broj rezervacije: ${context.referenceCode}`,
    "",
    "Ako ne možete da dođete, kontaktirajte salon što pre.",
    context.businessPhone
      ? `Telefon salona: ${context.businessPhone}`
      : null,
    context.businessAddress
      ? `Adresa: ${context.businessAddress}`
      : null,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string"
    )
    .join("\n");

  return {
    subject,
    html,
    text,
  };
}
