import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Phone,
  Scissors,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  getAdminBookings,
  type AdminBookingListItem,
  type BookingStatus,
} from "@/lib/admin/bookings";
import {
  getAdminLocalizedText,
} from "@/lib/admin/localized-text";

import DashboardBookingQuickActions from "@/components/admin/DashboardBookingQuickActions";
import DashboardPendingBookings from "@/components/admin/DashboardPendingBookings";

export const dynamic = "force-dynamic";

const statusLabels: Record<BookingStatus, string> = {
  pending: "Na čekanju",
  confirmed: "Potvrđena",
  completed: "Završena",
  cancelled: "Otkazana",
  no_show: "Nije došao",
};

const statusClasses: Record<BookingStatus, string> = {
  pending:
    "border-amber-300/20 bg-amber-300/10 text-amber-200",
  confirmed:
    "border-blue-400/20 bg-blue-400/10 text-blue-300",
  completed:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  cancelled:
    "border-red-400/20 bg-red-400/10 text-red-300",
  no_show:
    "border-orange-400/20 bg-orange-400/10 text-orange-300",
};

function getZonedParts(
  value: string,
  timezone: string
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const getPart = (
    type:
      | "year"
      | "month"
      | "day"
      | "hour"
      | "minute"
  ) =>
    parts.find((part) => part.type === type)?.value ??
    "";

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
  };
}

function getDateKey(
  value: string,
  timezone: string
): string {
  const parts = getZonedParts(value, timezone);

  if (!parts) {
    return "";
  }

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function getMonthKey(
  value: string,
  timezone: string
): string {
  const parts = getZonedParts(value, timezone);

  if (!parts) {
    return "";
  }

  return `${parts.year}-${parts.month}`;
}

function formatDate(
  value: string,
  timezone: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    timeZone: timezone,
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatFullDate(
  value: string,
  timezone: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    timeZone: timezone,
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(
  value: string,
  timezone: string
): string {
  const parts = getZonedParts(value, timezone);

  if (!parts) {
    return "—";
  }

  return `${parts.hour}:${parts.minute}`;
}

function formatAmount(value: number): string {
  if (Number.isInteger(value)) {
    return String(value);
  }

  return value.toFixed(2).replace(/\.?0+$/, "");
}

function formatPrice(
  amount: number,
  currency: string
): string {
  const formattedAmount = formatAmount(amount);

  switch (currency.trim().toUpperCase()) {
    case "EUR":
      return `${formattedAmount} €`;

    case "USD":
      return `$${formattedAmount}`;

    case "GBP":
      return `£${formattedAmount}`;

    case "MKD":
      return `${formattedAmount} ден`;

    case "RSD":
      return `${formattedAmount} RSD`;

    default:
      return `${formattedAmount} ${currency.trim()}`;
  }
}

function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export default async function AdminDashboardPage() {
  const result = await getAdminBookings();

  const { bookings, business } = result;

  const getServiceName = (
    booking:
      AdminBookingListItem
  ) =>
    getAdminLocalizedText(
      booking.serviceName,
      business.defaultLocale,
      business.supportedLocales,
      "Nepoznata usluga"
    );

  const now = new Date();
  const nowIso = now.toISOString();
  const nowTimestamp = now.getTime();

  const todayKey = getDateKey(nowIso, business.timezone);
  const currentMonthKey = getMonthKey(
    nowIso,
    business.timezone
  );

  const todayBookings = bookings
    .filter(
      (booking) =>
        getDateKey(
          booking.startsAt,
          business.timezone
        ) === todayKey &&
        booking.status !== "cancelled"
    )
    .sort(
      (first, second) =>
        new Date(first.startsAt).getTime() -
        new Date(second.startsAt).getTime()
    );

  const pendingCount = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const upcomingBookings = bookings
    .filter(
      (booking) =>
        new Date(booking.startsAt).getTime() >=
          nowTimestamp &&
        (booking.status === "pending" ||
          booking.status === "confirmed")
    )
    .sort(
      (first, second) =>
        new Date(first.startsAt).getTime() -
        new Date(second.startsAt).getTime()
    );

  const nextBooking = upcomingBookings[0] ?? null;

  const pendingBookings = upcomingBookings
    .filter(
      (booking) =>
        booking.status === "pending"
    )
    .slice(0, 5);


  const monthlyCompletedBookings = bookings.filter(
    (booking) =>
      booking.status === "completed" &&
      getMonthKey(
        booking.startsAt,
        business.timezone
      ) === currentMonthKey
  );

  const monthlyRevenue =
    monthlyCompletedBookings.reduce(
      (total, booking) =>
        total + booking.priceAmount,
      0
    );

  const revenueCurrency =
    monthlyCompletedBookings[0]?.currency ??
    bookings[0]?.currency ??
    "EUR";

  const recentBookings = [...bookings]
    .sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime()
    )
    .slice(0, 5);

  const metricCards = [
    {
      label: "Termini danas",
      value: String(todayBookings.length),
      description: "zakazanih termina",
      icon: CalendarCheck2,
      className:
        "border-blue-400/15 bg-blue-400/[0.055]",
      iconClass:
        "bg-blue-400/10 text-blue-300",
      valueClass: "text-blue-100",
    },
    {
      label: "Na čekanju",
      value: String(pendingCount),
      description: "zahteva za potvrdu",
      icon: Clock3,
      className:
        "border-amber-300/15 bg-amber-300/[0.055]",
      iconClass:
        "bg-amber-300/10 text-amber-300",
      valueClass: "text-amber-100",
    },
    {
      label: "Predstojeće",
      value: String(upcomingBookings.length),
      description: "aktivnih rezervacija",
      icon: UsersRound,
      className:
        "border-purple-400/15 bg-purple-400/[0.055]",
      iconClass:
        "bg-purple-400/10 text-purple-300",
      valueClass: "text-purple-100",
    },
    {
      label: "Prihod ovog meseca",
      value: formatPrice(
        monthlyRevenue,
        revenueCurrency
      ),
      description: `${monthlyCompletedBookings.length} završenih termina`,
      icon: CircleDollarSign,
      className:
        "border-emerald-400/15 bg-emerald-400/[0.055]",
      iconClass:
        "bg-emerald-400/10 text-emerald-300",
      valueClass: "text-emerald-100",
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-white/[0.07] via-white/[0.035] to-amber-300/[0.04] p-6 shadow-2xl sm:p-8">
        <div
          className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative flex flex-col justify-between gap-8 xl:flex-row xl:items-end">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200">
              <Sparkles
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Pregled poslovanja
            </div>

            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Dobrodošao u{" "}
              <span className="text-amber-300">
                {business.name}
              </span>
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Danas imaš{" "}
              <strong className="font-semibold text-white">
                {todayBookings.length}
              </strong>{" "}
              zakazanih termina i{" "}
              <strong className="font-semibold text-white">
                {pendingCount}
              </strong>{" "}
              rezervacija koje čekaju potvrdu.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-black/15 px-4 py-2.5 text-sm text-zinc-400">
              <CalendarDays
                className="h-4 w-4 text-amber-300"
                aria-hidden="true"
              />

              {formatFullDate(
                nowIso,
                business.timezone
              )}
            </div>
          </div>

          <Link
            href="/admin/bookings"
            className="inline-flex min-h-11 self-start items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 xl:self-auto"
          >
            Sve rezervacije

            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className={`rounded-3xl border p-5 ${card.className}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-zinc-500">
                    {card.label}
                  </div>

                  <div
                    className={`mt-3 text-3xl font-semibold tracking-tight ${card.valueClass}`}
                  >
                    {card.value}
                  </div>

                  <div className="mt-2 text-xs text-zinc-600">
                    {card.description}
                  </div>
                </div>

                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${card.iconClass}`}
                >
                  <Icon
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <DashboardPendingBookings
        bookings={pendingBookings}
        timezone={business.timezone}
        defaultLocale={
          business.defaultLocale
        }
        supportedLocales={
          business.supportedLocales
        }
      />

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
          <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
                Dnevni raspored
              </div>

              <h3 className="mt-1 text-xl font-semibold text-white">
                Današnji termini
              </h3>
            </div>

            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-amber-200"
            >
              Otvori raspored

              <ChevronRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          </div>

          {todayBookings.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-600">
                <CalendarCheck2
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </div>

              <h4 className="mt-5 text-lg font-semibold text-white">
                Danas nema termina
              </h4>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
                Kada klijent napravi rezervaciju za
                današnji dan, termin će se pojaviti ovde.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {todayBookings.slice(0, 7).map((booking) => (
                <Link
                  key={booking.id}
                  href="/admin/bookings"
                  className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.035] sm:px-6"
                >
                  <div className="flex w-16 flex-shrink-0 flex-col items-center rounded-2xl border border-white/[0.07] bg-black/10 px-2 py-2.5">
                    <span className="text-base font-semibold text-white">
                      {formatTime(
                        booking.startsAt,
                        business.timezone
                      )}
                    </span>

                    <span className="mt-0.5 text-[10px] text-zinc-600">
                      {booking.durationMinutes} min
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white">
                          {booking.customerName}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-600">
                          <span className="inline-flex items-center gap-1.5">
                            <Scissors
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            {getServiceName(booking)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <UserRound
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            {booking.employeeName ??
                              "Nepoznati zaposleni"}
                          </span>
                        </div>
                      </div>

                      <StatusBadge
                        status={booking.status}
                      />
                    </div>
                  </div>

                  <ChevronRight
                    className="h-4 w-4 flex-shrink-0 text-zinc-700 transition group-hover:text-amber-300"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          )}

          {todayBookings.length > 7 && (
            <div className="border-t border-white/[0.07] p-4 text-center">
              <Link
                href="/admin/bookings"
                className="text-sm font-medium text-amber-200 transition hover:text-amber-100"
              >
                Prikaži još {todayBookings.length - 7} termina
              </Link>
            </div>
          )}
        </article>

        <article className="rounded-[2rem] border border-amber-300/15 bg-gradient-to-br from-amber-300/[0.08] to-orange-300/[0.025] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300/50">
                Sledeći termin
              </div>

              <h3 className="mt-1 text-xl font-semibold text-white">
                Na redu
              </h3>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-zinc-950">
              <Clock3
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>
          </div>

          {!nextBooking ? (
            <div className="mt-10 rounded-2xl border border-white/[0.07] bg-black/10 p-5 text-center">
              <CheckCircle2
                className="mx-auto h-7 w-7 text-zinc-600"
                aria-hidden="true"
              />

              <div className="mt-4 font-semibold text-zinc-300">
                Nema predstojećih termina
              </div>

              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                Trenutno nema potvrđenih niti rezervacija
                na čekanju.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-7 rounded-3xl border border-white/[0.08] bg-black/15 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-3xl font-semibold text-amber-200">
                      {formatTime(
                        nextBooking.startsAt,
                        business.timezone
                      )}
                    </div>

                    <div className="mt-1 text-sm text-zinc-500">
                      {formatDate(
                        nextBooking.startsAt,
                        business.timezone
                      )}
                    </div>
                  </div>

                  <StatusBadge
                    status={nextBooking.status}
                  />
                </div>

                <div className="mt-6">
                  <div className="text-lg font-semibold text-white">
                    {nextBooking.customerName}
                  </div>

                  <div className="mt-1 text-sm text-zinc-500">
                    {getServiceName(nextBooking)}
                  </div>
                </div>

                <div className="mt-5 space-y-3 border-t border-white/[0.07] pt-5">
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                    <UserRound
                      className="h-4 w-4 text-zinc-600"
                      aria-hidden="true"
                    />

                    {nextBooking.employeeName ??
                      "Nepoznati zaposleni"}
                  </div>

                  {nextBooking.customerPhone && (
                    <a
                      href={`tel:${nextBooking.customerPhone.replace(
                        /[^\d+]/g,
                        ""
                      )}`}
                      className="flex items-center gap-3 text-sm text-zinc-400 transition hover:text-amber-200"
                    >
                      <Phone
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      {nextBooking.customerPhone}
                    </a>
                  )}

                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-zinc-600">
                      Cena
                    </span>

                    <span className="font-semibold text-amber-200">
                      {formatPrice(
                        nextBooking.priceAmount,
                        nextBooking.currency
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href="/admin/bookings"
                className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-300/15"
              >
                Otvori detalje rezervacije

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

              <DashboardBookingQuickActions
                bookingId={nextBooking.id}
                status={nextBooking.status}
                compact
              />
            </>
          )}
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
              Najnovija aktivnost
            </div>

            <h3 className="mt-1 text-xl font-semibold text-white">
              Poslednje rezervacije
            </h3>
          </div>

          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-amber-200"
          >
            Pogledaj sve

            <ChevronRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
            <CalendarDays
              className="h-7 w-7 text-zinc-700"
              aria-hidden="true"
            />

            <div className="mt-4 font-semibold text-zinc-300">
              Još nema rezervacija
            </div>

            <p className="mt-2 text-sm text-zinc-600">
              Nove rezervacije sa javnog sajta pojaviće se
              ovde.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href="/admin/bookings"
                className="group grid gap-4 px-5 py-4 transition hover:bg-white/[0.035] sm:grid-cols-[1fr_1fr_auto_auto] sm:items-center sm:px-6"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white">
                    {booking.customerName}
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    #{booking.referenceCode}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="truncate text-sm text-zinc-300">
                    {getServiceName(booking)}
                  </div>

                  <div className="mt-1 text-xs text-zinc-600">
                    {booking.employeeName ??
                      "Nepoznati zaposleni"}
                  </div>
                </div>

                <div className="text-sm text-zinc-400">
                  {formatDate(
                    booking.startsAt,
                    business.timezone
                  )}{" "}
                  ·{" "}
                  {formatTime(
                    booking.startsAt,
                    business.timezone
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <StatusBadge status={booking.status} />

                  <ChevronRight
                    className="h-4 w-4 text-zinc-700 transition group-hover:text-amber-300"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}