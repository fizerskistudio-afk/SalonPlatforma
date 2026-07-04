import Link from "next/link";
import {
  ChevronRight,
  Clock3,
  Scissors,
  UserRound,
} from "lucide-react";

import DashboardBookingQuickActions from "@/components/admin/DashboardBookingQuickActions";
import type {
  AdminBookingListItem,
} from "@/lib/admin/bookings";

type DashboardPendingBookingsProps = {
  bookings: AdminBookingListItem[];
  timezone: string;
};

function getServiceName(
  booking: AdminBookingListItem
): string {
  const name =
    booking.serviceName;

  if (!name) {
    return "Nepoznata usluga";
  }

  return (
    name.en ||
    name.mk ||
    name.sq ||
    "Nepoznata usluga"
  );
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
    return "—";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      timeZone:
        timezone,
      weekday:
        "short",
      day:
        "2-digit",
      month:
        "short",
      hour:
        "2-digit",
      minute:
        "2-digit",
      hourCycle:
        "h23",
    }
  ).format(date);
}

export default function DashboardPendingBookings({
  bookings,
  timezone,
}: DashboardPendingBookingsProps) {
  const pendingBookings =
    [...bookings]
      .filter(
        (booking) =>
          booking.status ===
          "pending"
      )
      .sort(
        (
          first,
          second
        ) =>
          new Date(
            first.startsAt
          ).getTime() -
          new Date(
            second.startsAt
          ).getTime()
      )
      .slice(0, 5);

  if (
    pendingBookings.length ===
    0
  ) {
    return null;
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[2rem] border border-amber-300/15 bg-amber-300/[0.035]">
      <div className="flex items-center justify-between gap-4 border-b border-amber-300/10 px-5 py-5 sm:px-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300/50">
            Potrebna akcija
          </div>

          <h3 className="mt-1 text-xl font-semibold text-white">
            Rezervacije na čekanju
          </h3>
        </div>

        <Link
          href="/admin/bookings"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-amber-200"
        >
          Sve rezervacije

          <ChevronRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="divide-y divide-amber-300/10">
        {pendingBookings.map(
          (booking) => (
            <article
              key={
                booking.id
              }
              className="grid gap-4 px-5 py-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h4 className="truncate font-semibold text-white">
                    {
                      booking.customerName
                    }
                  </h4>

                  <span className="inline-flex items-center gap-1.5 text-xs text-amber-200">
                    <Clock3
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    {formatDateTime(
                      booking.startsAt,
                      timezone
                    )}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                  <span className="inline-flex items-center gap-1.5">
                    <Scissors
                      className="h-3.5 w-3.5"
                      aria-hidden="true"
                    />

                    {getServiceName(
                      booking
                    )}
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

              <div className="min-w-[11rem]">
                <DashboardBookingQuickActions
                  bookingId={
                    booking.id
                  }
                  status={
                    booking.status
                  }
                />
              </div>
            </article>
          )
        )}
      </div>
    </section>
  );
}
