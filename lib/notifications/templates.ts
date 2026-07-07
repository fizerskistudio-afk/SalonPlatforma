import type {
  NotificationEmailContent,
} from "@/lib/notifications/types";

export type BookingNotificationTemplateContext = {
  businessName: string;
  businessPhone: string | null;
  businessEmail: string | null;
  businessAddress: string | null;
  timezone: string;

  referenceCode: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;

  serviceName: string;
  employeeName: string;

  startsAt: string;
  endsAt: string;
  durationMinutes: number;

  priceAmount:
    | number
    | string;
  currency: string;

  cancellationReason:
    | string
    | null;
};

function escapeHtml(
  value: string
): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDateTime(
  value: string,
  timezone: string
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat(
      "sr-Latn-RS",
      {
        dateStyle: "full",
        timeStyle: "short",
        timeZone: timezone,
      }
    ).format(date);
  } catch {
    return date.toISOString();
  }
}

function formatPrice(
  amount:
    | number
    | string,
  currency: string
): string {
  const numericAmount =
    typeof amount === "number"
      ? amount
      : Number(amount);

  if (
    !Number.isFinite(
      numericAmount
    )
  ) {
    return `${amount} ${currency}`;
  }

  try {
    return new Intl.NumberFormat(
      "sr-Latn-RS",
      {
        style: "currency",
        currency,
        minimumFractionDigits:
          Number.isInteger(
            numericAmount
          )
            ? 0
            : 2,
        maximumFractionDigits: 2,
      }
    ).format(numericAmount);
  } catch {
    return `${numericAmount.toFixed(2)} ${currency}`;
  }
}

function detailRows(
  context:
    BookingNotificationTemplateContext
): Array<{
  label: string;
  value: string;
}> {
  return [
    {
      label: "Usluga",
      value:
        context.serviceName,
    },
    {
      label: "Frizer",
      value:
        context.employeeName,
    },
    {
      label: "Termin",
      value:
        formatDateTime(
          context.startsAt,
          context.timezone
        ),
    },
    {
      label: "Trajanje",
      value:
        `${context.durationMinutes} min`,
    },
    {
      label: "Cena",
      value:
        formatPrice(
          context.priceAmount,
          context.currency
        ),
    },
    {
      label: "Referenca",
      value:
        context.referenceCode,
    },
  ];
}

function renderDetailsTable(
  rows: Array<{
    label: string;
    value: string;
  }>
): string {
  return rows
    .map(
      (row) => `
        <tr>
          <td style="padding:10px 0;color:#71717a;font-size:13px;vertical-align:top;width:110px;">
            ${escapeHtml(row.label)}
          </td>
          <td style="padding:10px 0;color:#18181b;font-size:14px;font-weight:600;vertical-align:top;">
            ${escapeHtml(row.value)}
          </td>
        </tr>
      `
    )
    .join("");
}

function renderLayout({
  businessName,
  eyebrow,
  title,
  intro,
  details,
  notice,
  footer,
}: {
  businessName: string;
  eyebrow: string;
  title: string;
  intro: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  notice?: string | null;
  footer: string;
}): string {
  return `
    <!doctype html>
    <html lang="sr-Latn">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;color:#18181b;font-family:Arial,Helvetica,sans-serif;">
        <div style="padding:28px 12px;">
          <div style="max-width:620px;margin:0 auto;overflow:hidden;border:1px solid #e4e4e7;border-radius:20px;background:#ffffff;box-shadow:0 12px 30px rgba(24,24,27,0.06);">
            <div style="padding:24px 28px;border-bottom:1px solid #e4e4e7;background:#18181b;color:#ffffff;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#a1a1aa;">
                ${escapeHtml(eyebrow)}
              </div>
              <div style="margin-top:7px;font-size:21px;font-weight:700;line-height:1.25;">
                ${escapeHtml(businessName)}
              </div>
            </div>

            <div style="padding:30px 28px;">
              <h1 style="margin:0;font-size:27px;line-height:1.2;color:#18181b;">
                ${escapeHtml(title)}
              </h1>

              <p style="margin:14px 0 0;color:#52525b;font-size:15px;line-height:1.7;">
                ${escapeHtml(intro)}
              </p>

              ${notice
                ? `
                  <div style="margin-top:22px;padding:14px 16px;border:1px solid #fde68a;border-radius:12px;background:#fffbeb;color:#92400e;font-size:14px;line-height:1.55;">
                    ${escapeHtml(notice)}
                  </div>
                `
                : ""}

              <div style="margin-top:24px;padding:6px 18px;border:1px solid #e4e4e7;border-radius:14px;background:#fafafa;">
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  ${renderDetailsTable(details)}
                </table>
              </div>

              <p style="margin:24px 0 0;color:#71717a;font-size:13px;line-height:1.65;">
                ${escapeHtml(footer)}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

function renderText({
  title,
  intro,
  details,
  notice,
  footer,
}: {
  title: string;
  intro: string;
  details: Array<{
    label: string;
    value: string;
  }>;
  notice?: string | null;
  footer: string;
}): string {
  return [
    title,
    "",
    intro,
    ...(notice
      ? ["", notice]
      : []),
    "",
    ...details.map(
      (row) =>
        `${row.label}: ${row.value}`
    ),
    "",
    footer,
  ].join("\n");
}

function createCustomerFooter(
  context:
    BookingNotificationTemplateContext
): string {
  const contacts = [
    context.businessPhone,
    context.businessEmail,
  ].filter(
    (
      value
    ): value is string =>
      Boolean(value?.trim())
  );

  return contacts.length > 0
    ? `Za dodatne informacije kontaktiraj salon: ${contacts.join(" · ")}.`
    : "Za dodatne informacije kontaktiraj salon.";
}

export function renderBookingRequestReceivedEmail(
  context:
    BookingNotificationTemplateContext
): NotificationEmailContent {
  const details =
    detailRows(context);

  const title =
    "Primili smo zahtev za termin";

  const intro =
    `Zdravo ${context.customerName}, zahtev je uspešno evidentiran. Salon će potvrditi termin čim ga pregleda.`;

  const footer =
    createCustomerFooter(
      context
    );

  return {
    subject:
      `Zahtev za termin je primljen — ${context.businessName}`,
    html: renderLayout({
      businessName:
        context.businessName,
      eyebrow:
        "Rezervacija na čekanju",
      title,
      intro,
      details,
      footer,
    }),
    text: renderText({
      title,
      intro,
      details,
      footer,
    }),
  };
}

export function renderBookingConfirmedEmail(
  context:
    BookingNotificationTemplateContext
): NotificationEmailContent {
  const details =
    detailRows(context);

  const title =
    "Termin je potvrđen";

  const intro =
    `Zdravo ${context.customerName}, tvoja rezervacija je potvrđena. Vidimo se u zakazanom terminu.`;

  const footer =
    createCustomerFooter(
      context
    );

  return {
    subject:
      `Termin je potvrđen — ${context.businessName}`,
    html: renderLayout({
      businessName:
        context.businessName,
      eyebrow:
        "Potvrđena rezervacija",
      title,
      intro,
      details,
      footer,
    }),
    text: renderText({
      title,
      intro,
      details,
      footer,
    }),
  };
}

export function renderBookingRescheduledEmail(
  context:
    BookingNotificationTemplateContext
): NotificationEmailContent {
  const details =
    detailRows(context);

  const title =
    "Termin je pomeren";

  const intro =
    `Zdravo ${context.customerName}, rezervacija je ažurirana. Ispod su novi podaci termina.`;

  const footer =
    createCustomerFooter(
      context
    );

  return {
    subject:
      `Termin je pomeren — ${context.businessName}`,
    html: renderLayout({
      businessName:
        context.businessName,
      eyebrow:
        "Izmena rezervacije",
      title,
      intro,
      details,
      footer,
    }),
    text: renderText({
      title,
      intro,
      details,
      footer,
    }),
  };
}

export function renderBookingCancelledEmail(
  context:
    BookingNotificationTemplateContext
): NotificationEmailContent {
  const details =
    detailRows(context);

  const title =
    "Termin je otkazan";

  const intro =
    `Zdravo ${context.customerName}, rezervacija više nije aktivna.`;

  const notice =
    context.cancellationReason?.trim()
      ? `Razlog: ${context.cancellationReason.trim()}`
      : null;

  const footer =
    createCustomerFooter(
      context
    );

  return {
    subject:
      `Termin je otkazan — ${context.businessName}`,
    html: renderLayout({
      businessName:
        context.businessName,
      eyebrow:
        "Otkazana rezervacija",
      title,
      intro,
      details,
      notice,
      footer,
    }),
    text: renderText({
      title,
      intro,
      details,
      notice,
      footer,
    }),
  };
}

export function renderNewBookingBusinessEmail(
  context:
    BookingNotificationTemplateContext
): NotificationEmailContent {
  const details = [
    {
      label: "Klijent",
      value:
        context.customerName,
    },
    ...(context.customerPhone
      ? [
          {
            label: "Telefon",
            value:
              context.customerPhone,
          },
        ]
      : []),
    ...(context.customerEmail
      ? [
          {
            label: "Email",
            value:
              context.customerEmail,
          },
        ]
      : []),
    ...detailRows(context),
  ];

  const title =
    "Nova rezervacija";

  const intro =
    `${context.customerName} je napravio/la novu rezervaciju preko sajta.`;

  const footer =
    "Rezervaciju možeš pregledati i upravljati njom iz admin panela.";

  return {
    subject:
      `Nova rezervacija — ${context.customerName}`,
    html: renderLayout({
      businessName:
        context.businessName,
      eyebrow:
        "Obaveštenje za salon",
      title,
      intro,
      details,
      footer,
    }),
    text: renderText({
      title,
      intro,
      details,
      footer,
    }),
  };
}

export function renderPlatformSystemEmail({
  title,
  intro,
  lines,
}: {
  title: string;
  intro: string;
  lines: Array<{
    label: string;
    value: string;
  }>;
}): NotificationEmailContent {
  const footer =
    "Ovo je sistemska poruka Salon Platforme.";

  return {
    subject: title,
    html: renderLayout({
      businessName:
        "Salon Platforma",
      eyebrow:
        "Sistemsko obaveštenje",
      title,
      intro,
      details: lines,
      footer,
    }),
    text: renderText({
      title,
      intro,
      details: lines,
      footer,
    }),
  };
}
