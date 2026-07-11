import type {
  NotificationEmailContent,
} from "@/lib/notifications/types";

export const REVIEW_INVITATION_EMAIL_LOCALES = [
  "sr-Latn",
  "mk",
  "hr",
  "sq",
  "en",
  "de",
  "fr",
] as const;

export type ReviewInvitationEmailLocale =
  (typeof REVIEW_INVITATION_EMAIL_LOCALES)[number];

export type ReviewInvitationTemplateContext = {
  locale: string;
  businessName: string;
  customerName: string;
  serviceName: string;
  employeeName: string;
  startsAt: string;
  timezone: string;
  reviewUrl: string;
  expiresAt: string;
};

type Copy = {
  subject: (
    businessName: string
  ) => string;
  eyebrow: string;
  title: string;
  intro: (
    customerName: string,
    businessName: string
  ) => string;
  serviceLabel: string;
  employeeLabel: string;
  visitLabel: string;
  expiresLabel: string;
  button: string;
  fallback: string;
  footer: string;
};

const COPY: Record<
  ReviewInvitationEmailLocale,
  Copy
> = {
  "sr-Latn": {
    subject: (
      businessName
    ) =>
      `Kako je prošla poseta — ${businessName}`,
    eyebrow:
      "Potvrđena poseta",
    title:
      "Podeli svoje iskustvo",
    intro: (
      customerName,
      businessName
    ) =>
      `Zdravo ${customerName}, hvala ti na poseti salonu ${businessName}. Tvoja iskrena ocena pomaže salonu i budućim klijentima.`,
    serviceLabel:
      "Usluga",
    employeeLabel:
      "Zaposleni",
    visitLabel:
      "Termin",
    expiresLabel:
      "Link važi do",
    button:
      "Ostavi recenziju",
    fallback:
      "Ako dugme ne radi, otvori ovaj link:",
    footer:
      "Link je namenjen samo ovoj završenoj poseti i može se iskoristiti jednom.",
  },
  mk: {
    subject: (
      businessName
    ) =>
      `Како помина посетата — ${businessName}`,
    eyebrow:
      "Потврдена посета",
    title:
      "Споделете го вашето искуство",
    intro: (
      customerName,
      businessName
    ) =>
      `Здраво ${customerName}, ви благодариме за посетата на ${businessName}. Вашата искрена оценка им помага на салонот и на идните клиенти.`,
    serviceLabel:
      "Услуга",
    employeeLabel:
      "Вработен",
    visitLabel:
      "Термин",
    expiresLabel:
      "Линкот важи до",
    button:
      "Оставете рецензија",
    fallback:
      "Ако копчето не работи, отворете го овој линк:",
    footer:
      "Линкот е наменет само за оваа завршена посета и може да се искористи еднаш.",
  },
  hr: {
    subject: (
      businessName
    ) =>
      `Kako je prošao posjet — ${businessName}`,
    eyebrow:
      "Potvrđen posjet",
    title:
      "Podijelite svoje iskustvo",
    intro: (
      customerName,
      businessName
    ) =>
      `Pozdrav ${customerName}, hvala vam na posjetu salonu ${businessName}. Vaša iskrena ocjena pomaže salonu i budućim klijentima.`,
    serviceLabel:
      "Usluga",
    employeeLabel:
      "Zaposlenik",
    visitLabel:
      "Termin",
    expiresLabel:
      "Poveznica vrijedi do",
    button:
      "Ostavite recenziju",
    fallback:
      "Ako gumb ne radi, otvorite ovu poveznicu:",
    footer:
      "Poveznica je namijenjena samo ovom završenom posjetu i može se iskoristiti jednom.",
  },
  sq: {
    subject: (
      businessName
    ) =>
      `Si shkoi vizita — ${businessName}`,
    eyebrow:
      "Vizitë e konfirmuar",
    title:
      "Ndani përvojën tuaj",
    intro: (
      customerName,
      businessName
    ) =>
      `Përshëndetje ${customerName}, faleminderit për vizitën në ${businessName}. Vlerësimi juaj i sinqertë ndihmon sallonin dhe klientët e ardhshëm.`,
    serviceLabel:
      "Shërbimi",
    employeeLabel:
      "Punonjësi",
    visitLabel:
      "Termini",
    expiresLabel:
      "Lidhja vlen deri më",
    button:
      "Lini një vlerësim",
    fallback:
      "Nëse butoni nuk funksionon, hapni këtë lidhje:",
    footer:
      "Lidhja është vetëm për këtë vizitë të përfunduar dhe mund të përdoret një herë.",
  },
  en: {
    subject: (
      businessName
    ) =>
      `How was your visit — ${businessName}`,
    eyebrow:
      "Verified visit",
    title:
      "Share your experience",
    intro: (
      customerName,
      businessName
    ) =>
      `Hi ${customerName}, thank you for visiting ${businessName}. Your honest rating helps the salon and future clients.`,
    serviceLabel:
      "Service",
    employeeLabel:
      "Team member",
    visitLabel:
      "Appointment",
    expiresLabel:
      "Link expires",
    button:
      "Leave a review",
    fallback:
      "If the button does not work, open this link:",
    footer:
      "This link belongs to this completed visit and can be used once.",
  },
  de: {
    subject: (
      businessName
    ) =>
      `Wie war Ihr Besuch — ${businessName}`,
    eyebrow:
      "Bestätigter Besuch",
    title:
      "Teilen Sie Ihre Erfahrung",
    intro: (
      customerName,
      businessName
    ) =>
      `Hallo ${customerName}, vielen Dank für Ihren Besuch bei ${businessName}. Ihre ehrliche Bewertung hilft dem Salon und zukünftigen Kunden.`,
    serviceLabel:
      "Leistung",
    employeeLabel:
      "Mitarbeiter",
    visitLabel:
      "Termin",
    expiresLabel:
      "Link gültig bis",
    button:
      "Bewertung abgeben",
    fallback:
      "Falls die Schaltfläche nicht funktioniert, öffnen Sie diesen Link:",
    footer:
      "Dieser Link gehört zu diesem abgeschlossenen Besuch und kann einmal verwendet werden.",
  },
  fr: {
    subject: (
      businessName
    ) =>
      `Comment s'est passée votre visite — ${businessName}`,
    eyebrow:
      "Visite confirmée",
    title:
      "Partagez votre expérience",
    intro: (
      customerName,
      businessName
    ) =>
      `Bonjour ${customerName}, merci pour votre visite chez ${businessName}. Votre avis sincère aide le salon et les futurs clients.`,
    serviceLabel:
      "Service",
    employeeLabel:
      "Professionnel",
    visitLabel:
      "Rendez-vous",
    expiresLabel:
      "Lien valable jusqu'au",
    button:
      "Laisser un avis",
    fallback:
      "Si le bouton ne fonctionne pas, ouvrez ce lien :",
    footer:
      "Ce lien correspond uniquement à cette visite terminée et ne peut être utilisé qu'une fois.",
  },
};

const INTL_LOCALES: Record<
  ReviewInvitationEmailLocale,
  string
> = {
  "sr-Latn":
    "sr-Latn-RS",
  mk:
    "mk-MK",
  hr:
    "hr-HR",
  sq:
    "sq-AL",
  en:
    "en-GB",
  de:
    "de-DE",
  fr:
    "fr-FR",
};

function resolveLocale(
  locale: string
): ReviewInvitationEmailLocale {
  return (
    REVIEW_INVITATION_EMAIL_LOCALES as readonly string[]
  ).includes(locale)
    ? locale as ReviewInvitationEmailLocale
    : "sr-Latn";
}

function escapeHtml(
  value: string
): string {
  return value
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

function formatDateTime(
  value: string,
  timezone: string,
  locale: ReviewInvitationEmailLocale
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
      INTL_LOCALES[
        locale
      ],
      {
        dateStyle:
          "full",
        timeStyle:
          "short",
        timeZone:
          timezone,
      }
    ).format(date);
  } catch {
    return date.toISOString();
  }
}

export function renderReviewInvitationEmail(
  context:
    ReviewInvitationTemplateContext
): NotificationEmailContent {
  const locale =
    resolveLocale(
      context.locale
    );

  const copy =
    COPY[locale];

  const visit =
    formatDateTime(
      context.startsAt,
      context.timezone,
      locale
    );

  const expires =
    formatDateTime(
      context.expiresAt,
      context.timezone,
      locale
    );

  const rows = [
    [
      copy.serviceLabel,
      context.serviceName,
    ],
    [
      copy.employeeLabel,
      context.employeeName,
    ],
    [
      copy.visitLabel,
      visit,
    ],
    [
      copy.expiresLabel,
      expires,
    ],
  ];

  const detailsHtml =
    rows
      .map(
        (
          [
            label,
            value,
          ]
        ) => `
          <tr>
            <td style="padding:9px 0;color:#71717a;font-size:13px;vertical-align:top;width:120px;">
              ${escapeHtml(label)}
            </td>
            <td style="padding:9px 0;color:#18181b;font-size:14px;font-weight:600;vertical-align:top;">
              ${escapeHtml(value)}
            </td>
          </tr>
        `
      )
      .join("");

  const title =
    copy.title;

  const intro =
    copy.intro(
      context.customerName,
      context.businessName
    );

  const html = `
    <!doctype html>
    <html lang="${escapeHtml(locale)}">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;color:#18181b;font-family:Arial,Helvetica,sans-serif;">
        <div style="padding:28px 12px;">
          <div style="max-width:620px;margin:0 auto;overflow:hidden;border:1px solid #e4e4e7;border-radius:20px;background:#ffffff;box-shadow:0 12px 30px rgba(24,24,27,0.06);">
            <div style="padding:24px 28px;border-bottom:1px solid #e4e4e7;background:#18181b;color:#ffffff;">
              <div style="font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#a1a1aa;">
                ${escapeHtml(copy.eyebrow)}
              </div>
              <div style="margin-top:7px;font-size:21px;font-weight:700;line-height:1.25;">
                ${escapeHtml(context.businessName)}
              </div>
            </div>
            <div style="padding:30px 28px;">
              <h1 style="margin:0;font-size:27px;line-height:1.2;color:#18181b;">
                ${escapeHtml(title)}
              </h1>
              <p style="margin:14px 0 0;color:#52525b;font-size:15px;line-height:1.7;">
                ${escapeHtml(intro)}
              </p>
              <div style="margin-top:24px;padding:6px 18px;border:1px solid #e4e4e7;border-radius:14px;background:#fafafa;">
                <table role="presentation" style="width:100%;border-collapse:collapse;">
                  ${detailsHtml}
                </table>
              </div>
              <div style="margin-top:26px;">
                <a href="${escapeHtml(context.reviewUrl)}" style="display:inline-block;padding:13px 20px;border-radius:12px;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;">
                  ${escapeHtml(copy.button)}
                </a>
              </div>
              <p style="margin:22px 0 0;color:#71717a;font-size:12px;line-height:1.65;">
                ${escapeHtml(copy.fallback)}<br />
                <a href="${escapeHtml(context.reviewUrl)}" style="color:#3f3f46;word-break:break-all;">
                  ${escapeHtml(context.reviewUrl)}
                </a>
              </p>
              <p style="margin:18px 0 0;color:#71717a;font-size:12px;line-height:1.65;">
                ${escapeHtml(copy.footer)}
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = [
    title,
    "",
    intro,
    "",
    ...rows.map(
      (
        [
          label,
          value,
        ]
      ) =>
        `${label}: ${value}`
    ),
    "",
    copy.button,
    context.reviewUrl,
    "",
    copy.footer,
  ].join(
    "\n"
  );

  return {
    subject:
      copy.subject(
        context.businessName
      ),
    html,
    text,
  };
}
