"use client";

import {
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Mail,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import {
  retryNotificationDeliveryAction,
  updateNotificationPreferencesAction,
} from "@/app/admin/(protected)/notifications/actions";
import type {
  AdminNotificationDelivery,
  AdminNotificationManagementData,
  ManagedNotificationTemplateKey,
} from "@/lib/admin/notifications";

type DeliveryFilter =
  | "all"
  | "sent"
  | "failed"
  | "skipped"
  | "pending";

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

const templateLabels: Record<ManagedNotificationTemplateKey, string> = {
  booking_request_received: "Zahtev za termin je primljen",
  booking_confirmed: "Termin je potvrđen",
  booking_rescheduled: "Termin je pomeren",
  booking_cancelled: "Termin je otkazan",
  business_new_booking: "Nova rezervacija za salon",
};

const templateDescriptions: Record<ManagedNotificationTemplateKey, string> = {
  booking_request_received:
    "Kupac dobija potvrdu da je zahtev evidentiran i čeka odobrenje.",
  booking_confirmed:
    "Kupac dobija potvrđen datum, vreme, uslugu i frizera.",
  booking_rescheduled:
    "Kupac dobija novo vreme kada se rezervacija pomeri.",
  booking_cancelled:
    "Kupac dobija potvrdu otkazivanja i razlog, kada je unet.",
  business_new_booking:
    "Salon dobija obaveštenje kada stigne nova online rezervacija.",
};

const reminderTemplateLabels: Record<string, string> = {
  booking_reminder_24h: "Podsetnik 24 sata pre termina",
  booking_reminder_2h: "Podsetnik 2 sata pre termina",
};

const statusLabels: Record<AdminNotificationDelivery["status"], string> = {
  sent: "Poslato Resendu",
  failed: "Neuspešno",
  skipped: "Preskočeno",
  pending: "U toku",
};

const providerStatusLabels: Record<
  AdminNotificationDelivery["providerDeliveryStatus"],
  string
> = {
  unknown: "Čeka delivery status",
  sent: "Resend prihvatio",
  delivered: "Isporučeno",
  delayed: "Isporuka odložena",
  bounced: "Email odbijen",
  complained: "Prijavljen spam",
  failed: "Provider greška",
  suppressed: "Slanje potisnuto",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getStatusClasses(
  status: AdminNotificationDelivery["status"]
): string {
  switch (status) {
    case "sent":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "failed":
      return "border-red-400/20 bg-red-400/10 text-red-200";
    case "skipped":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "pending":
      return "border-sky-400/20 bg-sky-400/10 text-sky-200";
  }
}

function getProviderStatusClasses(
  status: AdminNotificationDelivery["providerDeliveryStatus"]
): string {
  switch (status) {
    case "delivered":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
    case "sent":
      return "border-sky-400/20 bg-sky-400/10 text-sky-200";
    case "delayed":
      return "border-amber-400/20 bg-amber-400/10 text-amber-200";
    case "bounced":
    case "failed":
    case "suppressed":
      return "border-red-400/20 bg-red-400/10 text-red-200";
    case "complained":
      return "border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200";
    case "unknown":
      return "border-white/10 bg-white/[0.03] text-zinc-500";
  }
}

function getTemplateLabel(templateKey: string): string {
  if (templateKey in reminderTemplateLabels) {
    return reminderTemplateLabels[templateKey];
  }

  return templateKey in templateLabels
    ? templateLabels[templateKey as ManagedNotificationTemplateKey]
    : templateKey;
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 flex-shrink-0 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-45 ${
        checked
          ? "border-amber-300 bg-amber-300"
          : "border-white/15 bg-white/[0.06]"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-zinc-950 shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
            {label}
          </div>
          <div className="mt-2 text-3xl font-semibold text-white">
            {value}
          </div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/[0.05] text-amber-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function AdminNotificationsManager({
  data,
}: {
  data: AdminNotificationManagementData;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DeliveryFilter>("all");

  const [notificationEmail, setNotificationEmail] = useState(
    data.settings.notificationEmail ?? data.business.email ?? ""
  );
  const [replyToEmail, setReplyToEmail] = useState(
    data.settings.replyToEmail ?? data.business.email ?? ""
  );
  const [customerEnabled, setCustomerEnabled] = useState(
    data.settings.customerNotificationsEnabled
  );
  const [businessEnabled, setBusinessEnabled] = useState(
    data.settings.businessNotificationsEnabled
  );
  const [templates, setTemplates] = useState(
    data.settings.templates
  );

  const filteredDeliveries = useMemo(
    () =>
      filter === "all"
        ? data.deliveries
        : data.deliveries.filter((delivery) => delivery.status === filter),
    [data.deliveries, filter]
  );

  function setTemplate(
    key: ManagedNotificationTemplateKey,
    enabled: boolean
  ) {
    setTemplates((current) => ({
      ...current,
      [key]: enabled,
    }));
  }

  function saveSettings() {
    setFeedback(null);

    startTransition(async () => {
      const result = await updateNotificationPreferencesAction({
        notificationEmail,
        replyToEmail,
        customerNotificationsEnabled: customerEnabled,
        businessNotificationsEnabled: businessEnabled,
        bookingRequestReceivedEnabled:
          templates.booking_request_received,
        bookingConfirmedEnabled: templates.booking_confirmed,
        bookingRescheduledEnabled: templates.booking_rescheduled,
        bookingCancelledEnabled: templates.booking_cancelled,
        businessNewBookingEnabled: templates.business_new_booking,
      });

      setFeedback({
        type: result.ok ? "success" : "error",
        message: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  }

  function retryDelivery(deliveryId: string) {
    setFeedback(null);
    setRetryingId(deliveryId);

    startTransition(async () => {
      const result = await retryNotificationDeliveryAction({ deliveryId });

      setFeedback({
        type: result.ok ? "success" : "error",
        message: result.message,
      });
      setRetryingId(null);
      router.refresh();
    });
  }

  const customerTemplates: ManagedNotificationTemplateKey[] = [
    "booking_request_received",
    "booking_confirmed",
    "booking_rescheduled",
    "booking_cancelled",
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-amber-300/12 via-white/[0.035] to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              <Bell className="h-4 w-4" aria-hidden="true" />
              Notifications-04
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Email notifikacije
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
              Kontroliši booking poruke, prati poslednjih 100 slanja i vidi stvarni Resend status: isporučeno, odloženo, odbijeno ili prijavljeno kao spam.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/55 px-4 py-3 text-sm text-zinc-400">
            <div className="flex items-center gap-2 font-medium text-white">
              <ShieldCheck className="h-4 w-4 text-amber-300" aria-hidden="true" />
              {data.settings.deliveryMode === "custom_domain"
                ? "Domen salona"
                : "Platform sender"}
            </div>
            <div className="mt-1 text-xs text-zinc-600">
              {data.settings.deliveryMode === "custom_domain"
                ? data.settings.customDomain ?? "Domen nije unet"
                : "Zajednički domen platforme"}
            </div>
          </div>
        </div>

        {data.testMode && (
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            <strong>Test režim je aktivan.</strong> Sve poruke se fizički šalju na {data.testRecipient ?? "EMAIL_TEST_RECIPIENT"}, dok se originalni primalac čuva u delivery logu.
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Poslednjih 100" value={data.summary.total} icon={Mail} />
        <SummaryCard label="Poslato" value={data.summary.sent} icon={CheckCircle2} />
        <SummaryCard label="Neuspešno" value={data.summary.failed} icon={XCircle} />
        <SummaryCard label="Preskočeno" value={data.summary.skipped} icon={AlertTriangle} />
        <SummaryCard label="U toku" value={data.summary.pending} icon={Clock3} />
      </section>

      {feedback && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
              : "border-red-400/20 bg-red-400/10 text-red-100"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <section className="rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Pravila slanja</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Master prekidači gase celu grupu, dok pojedinačni prekidači kontrolišu svaki booking događaj.
            </p>
          </div>

          {!data.canManageSettings && (
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-500">
              Samo vlasnik menja podešavanja
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/35 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-semibold text-white">
                  <Mail className="h-4 w-4 text-amber-300" aria-hidden="true" />
                  Poruke kupcima
                </div>
                <p className="mt-1 text-sm leading-5 text-zinc-600">
                  Potvrde i promene vezane za rezervaciju.
                </p>
              </div>
              <Toggle
                checked={customerEnabled}
                disabled={!data.canManageSettings || isPending}
                onChange={setCustomerEnabled}
                label="Poruke kupcima"
              />
            </div>

            <div className="mt-5 space-y-3">
              {customerTemplates.map((key) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4"
                >
                  <div>
                    <div className="text-sm font-medium text-zinc-200">
                      {templateLabels[key]}
                    </div>
                    <div className="mt-1 text-xs leading-5 text-zinc-600">
                      {templateDescriptions[key]}
                    </div>
                  </div>
                  <Toggle
                    checked={templates[key]}
                    disabled={
                      !data.canManageSettings ||
                      !customerEnabled ||
                      isPending
                    }
                    onChange={(enabled) => setTemplate(key, enabled)}
                    label={templateLabels[key]}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/35 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Send className="h-4 w-4 text-amber-300" aria-hidden="true" />
                    Poruke salonu
                  </div>
                  <p className="mt-1 text-sm leading-5 text-zinc-600">
                    Operativna obaveštenja vlasniku ili recepciji.
                  </p>
                </div>
                <Toggle
                  checked={businessEnabled}
                  disabled={!data.canManageSettings || isPending}
                  onChange={setBusinessEnabled}
                  label="Poruke salonu"
                />
              </div>

              <div className="mt-5 flex items-start justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    {templateLabels.business_new_booking}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-zinc-600">
                    {templateDescriptions.business_new_booking}
                  </div>
                </div>
                <Toggle
                  checked={templates.business_new_booking}
                  disabled={
                    !data.canManageSettings || !businessEnabled || isPending
                  }
                  onChange={(enabled) =>
                    setTemplate("business_new_booking", enabled)
                  }
                  label={templateLabels.business_new_booking}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/35 p-5">
              <h3 className="font-semibold text-white">Adrese</h3>
              <div className="mt-4 grid gap-4">
                <label className="grid gap-2 text-sm text-zinc-400">
                  Salon prima nove rezervacije na
                  <input
                    type="email"
                    value={notificationEmail}
                    disabled={!data.canManageSettings || isPending}
                    onChange={(event: { target: { value: string } }) =>
                      setNotificationEmail(event.target.value)
                    }
                    placeholder="salon@example.com"
                    className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>

                <label className="grid gap-2 text-sm text-zinc-400">
                  Reply-to za odgovore kupaca
                  <input
                    type="email"
                    value={replyToEmail}
                    disabled={!data.canManageSettings || isPending}
                    onChange={(event: { target: { value: string } }) =>
                      setReplyToEmail(event.target.value)
                    }
                    placeholder="kontakt@example.com"
                    className="h-11 rounded-xl border border-white/10 bg-zinc-950 px-3 text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/15 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {data.canManageSettings && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              disabled={isPending}
              onClick={saveSettings}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending && !retryingId ? (
                <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Sačuvaj podešavanja
            </button>
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div>
            <h2 className="text-xl font-semibold text-white">Delivery log</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Poslednjih 100 pokušaja. Retry je dostupan samo za neuspešne ili preskočene poruke.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["all", "sent", "failed", "skipped", "pending"] as DeliveryFilter[]).map(
              (value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setFilter(value)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    filter === value
                      ? "border-amber-300 bg-amber-300 text-zinc-950"
                      : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {value === "all" ? "Sve" : statusLabels[value]}
                </button>
              )
            )}
          </div>
        </div>

        {filteredDeliveries.length === 0 ? (
          <div className="p-10 text-center text-sm text-zinc-600">
            Nema notifikacija za izabrani filter.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredDeliveries.map((delivery) => {
              const canRetry =
                delivery.status === "failed" || delivery.status === "skipped";

              return (
                <article key={delivery.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getStatusClasses(
                            delivery.status
                          )}`}
                        >
                          {statusLabels[delivery.status]}
                        </span>
                        {delivery.providerMessageId && (
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getProviderStatusClasses(
                              delivery.providerDeliveryStatus
                            )}`}
                          >
                            {providerStatusLabels[delivery.providerDeliveryStatus]}
                          </span>
                        )}
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-zinc-500">
                          {getTemplateLabel(delivery.templateKey)}
                        </span>
                        {delivery.testMode && (
                          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[11px] text-amber-200">
                            TEST
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 truncate font-medium text-white">
                        {delivery.subject}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600">
                        <span>
                          Za: <strong className="font-medium text-zinc-400">{delivery.originalRecipient}</strong>
                        </span>
                        {delivery.testMode &&
                          delivery.actualRecipient !== delivery.originalRecipient && (
                            <span>
                              Poslato na: <strong className="font-medium text-zinc-400">{delivery.actualRecipient}</strong>
                            </span>
                          )}
                        <span>Pokušaja: {delivery.attemptCount}</span>
                        {delivery.providerEventCount > 0 && (
                          <span>Provider događaja: {delivery.providerEventCount}</span>
                        )}
                        <span>{formatDate(delivery.lastAttemptAt ?? delivery.createdAt)}</span>
                        {delivery.providerEventAt && (
                          <span>Delivery status: {formatDate(delivery.providerEventAt)}</span>
                        )}
                      </div>

                      {(delivery.bookingReference || delivery.customerName) && (
                        <div className="mt-2 text-xs text-zinc-600">
                          Rezervacija: {delivery.bookingReference ?? "—"}
                          {delivery.customerName ? ` · ${delivery.customerName}` : ""}
                        </div>
                      )}

                      {delivery.error && (
                        <div className="mt-3 rounded-xl border border-red-400/15 bg-red-400/[0.07] px-3 py-2 text-xs leading-5 text-red-200">
                          Aplikacija: {delivery.error}
                        </div>
                      )}

                      {delivery.providerError && (
                        <div
                          className={`mt-3 rounded-xl border px-3 py-2 text-xs leading-5 ${
                            delivery.providerDeliveryStatus === "delayed"
                              ? "border-amber-400/15 bg-amber-400/[0.07] text-amber-100"
                              : "border-red-400/15 bg-red-400/[0.07] text-red-200"
                          }`}
                        >
                          Resend: {delivery.providerError}
                        </div>
                      )}
                    </div>

                    {canRetry && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => retryDelivery(delivery.id)}
                        className="inline-flex min-h-10 flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-amber-300/30 hover:bg-amber-300/10 hover:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshCw
                          className={`h-4 w-4 ${
                            retryingId === delivery.id ? "animate-spin" : ""
                          }`}
                          aria-hidden="true"
                        />
                        Ponovi slanje
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
