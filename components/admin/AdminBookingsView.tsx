"use client";

import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FilterX,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  Search,
  Scissors,
  UserRound,
  UsersRound,
  X,
  XCircle,
} from "lucide-react";

import {
  updateBookingInternalNoteAction,
  updateBookingStatusAction,
} from "@/app/admin/(protected)/bookings/actions";
import {
  getAdminRescheduleSlotsAction,
  rescheduleAdminBookingAction,
} from "@/app/admin/(protected)/bookings/reschedule-actions";
import type {
  AdminRescheduleSlot,
} from "@/app/admin/(protected)/bookings/reschedule-actions";
import type {
  AdminBookingListItem,
  BookingSource,
  BookingStatus,
} from "@/lib/admin/bookings";
import {
  getAdminLocalizedText,
} from "@/lib/admin/localized-text";
import type {
  LocaleCode,
} from "@/lib/i18n/locales";

type AdminBookingsViewProps = {
  businessName: string;
  timezone: string;
  generatedAt: string;
  defaultLocale: LocaleCode;
  supportedLocales: LocaleCode[];
  bookings: AdminBookingListItem[];
};

type PeriodFilter =
  | "all"
  | "today"
  | "upcoming"
  | "past";

type StatusFilter = "all" | BookingStatus;

type SourceFilter = "all" | BookingSource;

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

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

const sourceLabels: Record<BookingSource, string> = {
  web: "Web",
  admin: "Admin",
  phone: "Telefon",
  walk_in: "Bez najave",
};

const periodLabels: Record<PeriodFilter, string> = {
  all: "Svi datumi",
  today: "Danas",
  upcoming: "Predstojeće",
  past: "Prošle",
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
    type: "year" | "month" | "day" | "hour" | "minute"
  ) =>
    parts.find((part) => part.type === type)?.value ?? "";

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

function formatDate(
  value: string,
  timezone: string
): string {
  const parts = getZonedParts(value, timezone);

  if (!parts) {
    return "—";
  }

  return `${parts.day}.${parts.month}.${parts.year}.`;
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

function formatDateTime(
  value: string,
  timezone: string
): string {
  return `${formatDate(value, timezone)} u ${formatTime(
    value,
    timezone
  )}`;
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

function normalizeSearchValue(
  value: string | null
): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function StatusBadge({
  status,
}: {
  status: BookingStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export default function AdminBookingsView({
  businessName,
  timezone,
  generatedAt,
  defaultLocale,
  supportedLocales,
  bookings,
}: AdminBookingsViewProps) {
  const router = useRouter();

  const getServiceName = (
    booking:
      AdminBookingListItem
  ) =>
    getAdminLocalizedText(
      booking.serviceName,
      defaultLocale,
      supportedLocales,
      "Nepoznata usluga"
    );

  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const [periodFilter, setPeriodFilter] =
    useState<PeriodFilter>("all");

  const [sourceFilter, setSourceFilter] =
    useState<SourceFilter>("all");

  const [employeeFilter, setEmployeeFilter] =
    useState("all");

  const [selectedBookingId, setSelectedBookingId] =
    useState<string | null>(null);

  const [internalNote, setInternalNote] = useState("");

  const [cancellationReason, setCancellationReason] =
    useState("");

  const [cancelDialogOpen, setCancelDialogOpen] =
    useState(false);

  const [actionMessage, setActionMessage] =
    useState<ActionMessage | null>(null);

  const [rescheduleDialogOpen, setRescheduleDialogOpen] =
    useState(false);

  const [rescheduleDate, setRescheduleDate] =
    useState("");

  const [rescheduleEmployeeId, setRescheduleEmployeeId] =
    useState("all");

  const [rescheduleSlots, setRescheduleSlots] =
    useState<AdminRescheduleSlot[]>([]);

  const [selectedRescheduleSlot, setSelectedRescheduleSlot] =
    useState<AdminRescheduleSlot | null>(null);

  const [rescheduleLoading, setRescheduleLoading] =
    useState(false);

  const [rescheduleSaving, setRescheduleSaving] =
    useState(false);

  const [rescheduleMessage, setRescheduleMessage] =
    useState<ActionMessage | null>(null);

  const nowTimestamp = new Date(generatedAt).getTime();

  const todayKey = getDateKey(generatedAt, timezone);

  const employees = useMemo(() => {
    const employeeMap = new Map<string, string>();

    bookings.forEach((booking) => {
      employeeMap.set(
        booking.employeeId,
        booking.employeeName ?? "Nepoznati zaposleni"
      );
    });

    return Array.from(employeeMap.entries())
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((first, second) =>
        first.name.localeCompare(second.name)
      );
  }, [bookings]);

  const metrics = useMemo(() => {
    const todayBookings = bookings.filter(
      (booking) =>
        getDateKey(booking.startsAt, timezone) === todayKey
    );

    const pendingBookings = bookings.filter(
      (booking) => booking.status === "pending"
    );

    const upcomingBookings = bookings.filter(
      (booking) =>
        new Date(booking.startsAt).getTime() >= nowTimestamp &&
        (booking.status === "pending" ||
          booking.status === "confirmed")
    );

    const completedRevenue = bookings
      .filter((booking) => booking.status === "completed")
      .reduce(
        (total, booking) => total + booking.priceAmount,
        0
      );

    return {
      total: bookings.length,
      today: todayBookings.length,
      pending: pendingBookings.length,
      upcoming: upcomingBookings.length,
      completedRevenue,
    };
  }, [
    bookings,
    nowTimestamp,
    timezone,
    todayKey,
  ]);

  const statusCounts = useMemo(() => {
    const counts: Record<BookingStatus, number> = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };

    bookings.forEach((booking) => {
      counts[booking.status] += 1;
    });

    return counts;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase();

    const result = bookings.filter((booking) => {
      if (
        statusFilter !== "all" &&
        booking.status !== statusFilter
      ) {
        return false;
      }

      if (
        sourceFilter !== "all" &&
        booking.source !== sourceFilter
      ) {
        return false;
      }

      if (
        employeeFilter !== "all" &&
        booking.employeeId !== employeeFilter
      ) {
        return false;
      }

      const startsAt = new Date(
        booking.startsAt
      ).getTime();

      const bookingDateKey = getDateKey(
        booking.startsAt,
        timezone
      );

      if (
        periodFilter === "today" &&
        bookingDateKey !== todayKey
      ) {
        return false;
      }

      if (
        periodFilter === "upcoming" &&
        startsAt < nowTimestamp
      ) {
        return false;
      }

      if (
        periodFilter === "past" &&
        startsAt >= nowTimestamp
      ) {
        return false;
      }

      if (normalizedQuery) {
        const searchableValues = [
          booking.referenceCode,
          booking.customerName,
          booking.customerPhone,
          booking.customerEmail,
          getServiceName(booking),
          booking.employeeName,
        ]
          .map(normalizeSearchValue)
          .join(" ");

        if (!searchableValues.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });

    return result.sort((first, second) => {
      const firstTime = new Date(
        first.startsAt
      ).getTime();

      const secondTime = new Date(
        second.startsAt
      ).getTime();

      if (
        periodFilter === "today" ||
        periodFilter === "upcoming"
      ) {
        return firstTime - secondTime;
      }

      return secondTime - firstTime;
    });
  }, [
    bookings,
    employeeFilter,
    nowTimestamp,
    periodFilter,
    query,
    sourceFilter,
    statusFilter,
    timezone,
    todayKey,
  ]);

  const selectedBooking = useMemo(
    () =>
      bookings.find(
        (booking) => booking.id === selectedBookingId
      ) ?? null,
    [bookings, selectedBookingId]
  );

  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    setInternalNote(selectedBooking.internalNote ?? "");
  }, [
    selectedBooking?.id,
    selectedBooking?.internalNote,
  ]);

  useEffect(() => {
    if (!selectedBooking) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (rescheduleDialogOpen) {
          if (!rescheduleLoading && !rescheduleSaving) {
            setRescheduleDialogOpen(false);
          }

          return;
        }

        if (cancelDialogOpen) {
          setCancelDialogOpen(false);
          return;
        }

        setSelectedBookingId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedBooking,
    cancelDialogOpen,
    rescheduleDialogOpen,
    rescheduleLoading,
    rescheduleSaving,
  ]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    periodFilter !== "all" ||
    sourceFilter !== "all" ||
    employeeFilter !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("all");
    setPeriodFilter("all");
    setSourceFilter("all");
    setEmployeeFilter("all");
  };

  const revenueCurrency =
    bookings.find(
      (booking) => booking.status === "completed"
    )?.currency ??
    bookings[0]?.currency ??
    "EUR";

  const resetRescheduleState = () => {
    setRescheduleDialogOpen(false);
    setRescheduleDate("");
    setRescheduleEmployeeId("all");
    setRescheduleSlots([]);
    setSelectedRescheduleSlot(null);
    setRescheduleMessage(null);
  };

  const closeBookingDetails = () => {
    if (
      isPending ||
      rescheduleLoading ||
      rescheduleSaving
    ) {
      return;
    }

    setSelectedBookingId(null);
    setCancelDialogOpen(false);
    setCancellationReason("");
    setActionMessage(null);
    resetRescheduleState();
  };

  const handleStatusUpdate = (
    nextStatus: BookingStatus,
    reason?: string
  ) => {
    if (!selectedBooking || isPending) {
      return;
    }

    setActionMessage(null);

    startTransition(async () => {
      const result = await updateBookingStatusAction({
        bookingId: selectedBooking.id,
        nextStatus,
        cancellationReason: reason,
      });

      setActionMessage({
        type: result.ok ? "success" : "error",
        text: result.message,
      });

      if (result.ok) {
        setCancelDialogOpen(false);
        setCancellationReason("");
        router.refresh();
      }
    });
  };

  const handleInternalNoteSave = () => {
    if (!selectedBooking || isPending) {
      return;
    }

    setActionMessage(null);

    startTransition(async () => {
      const result =
        await updateBookingInternalNoteAction({
          bookingId: selectedBooking.id,
          internalNote,
        });

      setActionMessage({
        type: result.ok ? "success" : "error",
        text: result.message,
      });

      if (result.ok) {
        router.refresh();
      }
    });
  };

  const loadRescheduleSlots = async (
    date: string
  ) => {
    if (!selectedBooking || !date || rescheduleLoading) {
      return;
    }

    setRescheduleLoading(true);
    setRescheduleMessage(null);
    setRescheduleSlots([]);
    setSelectedRescheduleSlot(null);

    try {
      const result =
        await getAdminRescheduleSlotsAction({
          bookingId: selectedBooking.id,
          date,
          employeeId: null,
        });

      setRescheduleMessage({
        type: result.ok ? "success" : "error",
        text: result.message,
      });

      if (!result.ok) {
        setRescheduleEmployeeId("all");
        return;
      }

      setRescheduleSlots(result.slots);

      const currentEmployeeHasSlots =
        result.slots.some(
          (slot) =>
            slot.employeeId ===
            selectedBooking.employeeId
        );

      setRescheduleEmployeeId(
        currentEmployeeHasSlots
          ? selectedBooking.employeeId
          : "all"
      );
    } catch {
      setRescheduleMessage({
        type: "error",
        text: "Slobodni termini trenutno ne mogu da se učitaju.",
      });
    } finally {
      setRescheduleLoading(false);
    }
  };

  const openRescheduleDialog = () => {
    if (
      !selectedBooking ||
      (selectedBooking.status !== "pending" &&
        selectedBooking.status !== "confirmed")
    ) {
      return;
    }

    const currentDate =
      getDateKey(
        selectedBooking.startsAt,
        timezone
      ) || todayKey;

    setRescheduleDate(currentDate);
    setRescheduleEmployeeId(
      selectedBooking.employeeId
    );
    setRescheduleSlots([]);
    setSelectedRescheduleSlot(null);
    setRescheduleMessage(null);
    setActionMessage(null);
    setRescheduleDialogOpen(true);

    void loadRescheduleSlots(currentDate);
  };

  const closeRescheduleDialog = () => {
    if (rescheduleLoading || rescheduleSaving) {
      return;
    }

    resetRescheduleState();
  };

  const handleRescheduleSave = async () => {
    if (
      !selectedBooking ||
      !selectedRescheduleSlot ||
      rescheduleSaving
    ) {
      return;
    }

    setRescheduleSaving(true);
    setRescheduleMessage(null);

    try {
      const result =
        await rescheduleAdminBookingAction({
          bookingId: selectedBooking.id,
          employeeId:
            selectedRescheduleSlot.employeeId,
          startsAt:
            selectedRescheduleSlot.startsAt,
        });

      if (!result.ok) {
        setRescheduleMessage({
          type: "error",
          text: result.message,
        });

        return;
      }

      setActionMessage({
        type: "success",
        text: result.message,
      });

      resetRescheduleState();
      router.refresh();
    } catch {
      setRescheduleMessage({
        type: "error",
        text: "Termin trenutno ne može da se promeni. Pokušaj ponovo.",
      });
    } finally {
      setRescheduleSaving(false);
    }
  };

  const rescheduleEmployees = useMemo(() => {
    const employeeMap =
      new Map<string, string>();

    rescheduleSlots.forEach((slot) => {
      employeeMap.set(
        slot.employeeId,
        slot.employeeName
      );
    });

    return Array.from(
      employeeMap.entries()
    )
      .map(([id, name]) => ({
        id,
        name,
      }))
      .sort((first, second) =>
        first.name.localeCompare(
          second.name
        )
      );
  }, [rescheduleSlots]);

  const visibleRescheduleSlots =
    useMemo(() => {
      if (
        rescheduleEmployeeId ===
        "all"
      ) {
        return rescheduleSlots;
      }

      return rescheduleSlots.filter(
        (slot) =>
          slot.employeeId ===
          rescheduleEmployeeId
      );
    }, [
      rescheduleEmployeeId,
      rescheduleSlots,
    ]);

  const internalNoteChanged =
    internalNote.trim() !==
    (selectedBooking?.internalNote ?? "").trim();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
          {businessName}
        </div>

        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Rezervacije
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Pregledaj termine, pronađi klijenta i upravljaj
              statusom svake rezervacije.
            </p>
          </div>

          <div className="inline-flex self-start items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs text-zinc-500">
            <Clock3
              className="h-4 w-4 text-amber-300"
              aria-hidden="true"
            />

            Vremenska zona:

            <span className="font-medium text-zinc-300">
              {timezone}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Ukupno
            </div>

            <CalendarDays
              className="h-5 w-5 text-zinc-600"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-white">
            {metrics.total}
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            učitanih rezervacija
          </div>
        </article>

        <article className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-200/70">
              Danas
            </div>

            <CalendarCheck2
              className="h-5 w-5 text-blue-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-blue-100">
            {metrics.today}
          </div>

          <div className="mt-2 text-xs text-blue-300/50">
            termina danas
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/70">
              Na čekanju
            </div>

            <Clock3
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-amber-100">
            {metrics.pending}
          </div>

          <div className="mt-2 text-xs text-amber-300/50">
            zahteva za potvrdu
          </div>
        </article>

        <article className="rounded-3xl border border-purple-400/15 bg-purple-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-200/70">
              Predstojeće
            </div>

            <UsersRound
              className="h-5 w-5 text-purple-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-purple-100">
            {metrics.upcoming}
          </div>

          <div className="mt-2 text-xs text-purple-300/50">
            aktivnih termina
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.055] p-5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-sm text-emerald-200/70">
              Završeni prihod
            </div>

            <CircleDollarSign
              className="h-5 w-5 text-emerald-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-2xl font-semibold text-emerald-100">
            {formatPrice(
              metrics.completedRevenue,
              revenueCurrency
            )}
          </div>

          <div className="mt-2 text-xs text-emerald-300/50">
            iz završenih termina
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] p-4 sm:p-5">
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                statusFilter === "all"
                  ? "border-amber-300 bg-amber-300 text-zinc-950"
                  : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
              }`}
            >
              Sve ({bookings.length})
            </button>

            {(
              Object.keys(statusLabels) as BookingStatus[]
            ).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  statusFilter === status
                    ? statusClasses[status]
                    : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
                }`}
              >
                {statusLabels[status]} ({statusCounts[status]})
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-white/[0.07] p-4 sm:p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(18rem,1fr)_repeat(3,minmax(10rem,0.45fr))_auto]">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
                aria-hidden="true"
              />

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Ime, telefon, email, šifra..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            </div>

            <select
              value={periodFilter}
              onChange={(event) =>
                setPeriodFilter(
                  event.target.value as PeriodFilter
                )
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              {(
                Object.keys(periodLabels) as PeriodFilter[]
              ).map((period) => (
                <option
                  key={period}
                  value={period}
                >
                  {periodLabels[period]}
                </option>
              ))}
            </select>

            <select
              value={employeeFilter}
              onChange={(event) =>
                setEmployeeFilter(event.target.value)
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              <option value="all">
                Svi zaposleni
              </option>

              {employees.map((employee) => (
                <option
                  key={employee.id}
                  value={employee.id}
                >
                  {employee.name}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(event) =>
                setSourceFilter(
                  event.target.value as SourceFilter
                )
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              <option value="all">
                Svi izvori
              </option>

              {(
                Object.keys(sourceLabels) as BookingSource[]
              ).map((source) => (
                <option
                  key={source}
                  value={source}
                >
                  {sourceLabels[source]}
                </option>
              ))}
            </select>

            <button
              type="button"
              disabled={!hasActiveFilters}
              onClick={clearFilters}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 text-sm font-medium text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <FilterX
                className="h-4 w-4"
                aria-hidden="true"
              />

              Očisti
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 text-xs text-zinc-600 sm:px-5">
          <span>
            Prikazano{" "}
            <strong className="text-zinc-300">
              {filteredBookings.length}
            </strong>{" "}
            od {bookings.length}
          </span>

          <span>Klikni rezervaciju za detalje</span>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-600">
              <CalendarDays
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Nema rezervacija
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
              Nijedna rezervacija ne odgovara trenutno
              izabranim filterima.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
              >
                Očisti filtere
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-white/[0.07] text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                    <th className="px-5 py-4">
                      Datum i vreme
                    </th>

                    <th className="px-5 py-4">
                      Klijent
                    </th>

                    <th className="px-5 py-4">
                      Usluga
                    </th>

                    <th className="px-5 py-4">
                      Zaposleni
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4">
                      Cena
                    </th>

                    <th className="px-5 py-4">
                      Izvor
                    </th>

                    <th className="w-14 px-5 py-4">
                      <span className="sr-only">
                        Detalji
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="cursor-pointer border-b border-white/[0.055] transition last:border-b-0 hover:bg-white/[0.035]"
                      onClick={() => {
                        setSelectedBookingId(booking.id);
                        setActionMessage(null);
                      }}
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="font-medium text-white">
                          {formatDate(
                            booking.startsAt,
                            timezone
                          )}
                        </div>

                        <div className="mt-1 text-xs text-zinc-500">
                          {formatTime(
                            booking.startsAt,
                            timezone
                          )}{" "}
                          –{" "}
                          {formatTime(
                            booking.endsAt,
                            timezone
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-zinc-200">
                          {booking.customerName}
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          #{booking.referenceCode}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-zinc-300">
                          {getServiceName(booking)}
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {booking.durationMinutes} min
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-zinc-400">
                        {booking.employeeName ?? "Nepoznato"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={booking.status}
                        />
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-zinc-200">
                        {formatPrice(
                          booking.priceAmount,
                          booking.currency
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-500">
                          {sourceLabels[booking.source]}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <ChevronRight
                          className="h-4 w-4 text-zinc-700"
                          aria-hidden="true"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/[0.06] lg:hidden">
              {filteredBookings.map((booking) => (
                <button
                  key={booking.id}
                  type="button"
                  onClick={() => {
                    setSelectedBookingId(booking.id);
                    setActionMessage(null);
                  }}
                  className="w-full p-4 text-left transition hover:bg-white/[0.035] sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-white">
                        {booking.customerName}
                      </div>

                      <div className="mt-1 text-xs text-zinc-600">
                        #{booking.referenceCode}
                      </div>
                    </div>

                    <StatusBadge
                      status={booking.status}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.06] bg-black/10 p-4">
                    <div className="flex items-center gap-3">
                      <CalendarDays
                        className="h-4 w-4 text-amber-300"
                        aria-hidden="true"
                      />

                      <span className="text-sm text-zinc-300">
                        {formatDateTime(
                          booking.startsAt,
                          timezone
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Scissors
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      <span className="text-sm text-zinc-400">
                        {getServiceName(booking)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <UserRound
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      <span className="text-sm text-zinc-400">
                        {booking.employeeName ?? "Nepoznato"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-amber-200">
                      {formatPrice(
                        booking.priceAmount,
                        booking.currency
                      )}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-medium text-zinc-600">
                      Detalji

                      <ChevronRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {selectedBooking && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Zatvori detalje rezervacije"
            onClick={closeBookingDetails}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 right-0 w-full max-w-xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/90 px-5 py-5 backdrop-blur-xl sm:px-6">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                  Rezervacija
                </div>

                <div className="mt-1 text-lg font-semibold text-white">
                  #{selectedBooking.referenceCode}
                </div>
              </div>

              <button
                type="button"
                onClick={closeBookingDetails}
                disabled={isPending}
                aria-label="Zatvori"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {actionMessage && (
                <div
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${
                    actionMessage.type === "success"
                      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                      : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                  }`}
                >
                  {actionMessage.type === "success" ? (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      className="mt-0.5 h-5 w-5 flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  <span className="text-sm leading-relaxed">
                    {actionMessage.text}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                <div>
                  <div className="text-xs text-zinc-600">
                    Trenutni status
                  </div>

                  <div className="mt-2">
                    <StatusBadge
                      status={selectedBooking.status}
                    />
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-zinc-600">
                    Cena
                  </div>

                  <div className="mt-1 text-xl font-semibold text-amber-200">
                    {formatPrice(
                      selectedBooking.priceAmount,
                      selectedBooking.currency
                    )}
                  </div>
                </div>
              </div>

              {(selectedBooking.status === "pending" ||
                selectedBooking.status === "confirmed") && (
                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="mb-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Upravljanje statusom
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      Izaberi sledeće stanje rezervacije.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedBooking.status === "pending" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          handleStatusUpdate("confirmed")
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-blue-300 disabled:cursor-wait disabled:opacity-50"
                      >
                        <CheckCircle2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />

                        Potvrdi rezervaciju
                      </button>
                    )}

                    {selectedBooking.status === "confirmed" && (
                      <>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleStatusUpdate("completed")
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-50"
                        >
                          <CheckCircle2
                            className="h-4 w-4"
                            aria-hidden="true"
                          />

                          Označi kao završenu
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleStatusUpdate("no_show")
                          }
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-400/25 bg-orange-400/10 px-4 py-3 text-sm font-semibold text-orange-200 transition hover:bg-orange-400/20 disabled:cursor-wait disabled:opacity-50"
                        >
                          <AlertCircle
                            className="h-4 w-4"
                            aria-hidden="true"
                          />

                          Klijent nije došao
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setCancellationReason("");
                        setCancelDialogOpen(true);
                        setActionMessage(null);
                      }}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/20 disabled:cursor-wait disabled:opacity-50 sm:col-span-2"
                    >
                      <XCircle
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Otkaži rezervaciju
                    </button>
                  </div>
                </section>
              )}

              {(selectedBooking.status === "completed" ||
                selectedBooking.status === "cancelled" ||
                selectedBooking.status === "no_show") && (
                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-zinc-600"
                      aria-hidden="true"
                    />

                    <div>
                      <div className="text-sm font-semibold text-zinc-300">
                        Rezervacija je završena
                      </div>

                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                        Status više nije moguće menjati iz
                        administratorskog panela.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Termin
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      className="mt-0.5 h-4 w-4 text-amber-300"
                      aria-hidden="true"
                    />

                    <div>
                      <div className="text-sm font-medium text-white">
                        {formatDate(
                          selectedBooking.startsAt,
                          timezone
                        )}
                      </div>

                      <div className="mt-1 text-sm text-zinc-500">
                        {formatTime(
                          selectedBooking.startsAt,
                          timezone
                        )}{" "}
                        –{" "}
                        {formatTime(
                          selectedBooking.endsAt,
                          timezone
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Scissors
                      className="mt-0.5 h-4 w-4 text-zinc-600"
                      aria-hidden="true"
                    />

                    <div>
                      <div className="text-sm font-medium text-white">
                        {getServiceName(selectedBooking)}
                      </div>

                      <div className="mt-1 text-sm text-zinc-500">
                        {selectedBooking.durationMinutes} minuta
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <UserRound
                      className="mt-0.5 h-4 w-4 text-zinc-600"
                      aria-hidden="true"
                    />

                    <div>
                      <div className="text-sm font-medium text-white">
                        {selectedBooking.employeeName ??
                          "Nepoznati zaposleni"}
                      </div>

                      <div className="mt-1 text-sm text-zinc-500">
                        Zaduženi zaposleni
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedBooking.status === "pending" ||
                  selectedBooking.status === "confirmed") && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={openRescheduleDialog}
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-amber-300/25 bg-amber-300/[0.08] px-4 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-300/[0.14] disabled:cursor-wait disabled:opacity-50"
                  >
                    <CalendarCheck2
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Promeni termin
                  </button>
                )}
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Klijent
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserRound
                      className="h-4 w-4 text-zinc-600"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium text-white">
                      {selectedBooking.customerName}
                    </span>
                  </div>

                  {selectedBooking.customerPhone && (
                    <a
                      href={`tel:${selectedBooking.customerPhone.replace(
                        /[^\d+]/g,
                        ""
                      )}`}
                      className="flex items-center gap-3 rounded-xl text-sm text-zinc-400 transition hover:text-amber-200"
                    >
                      <Phone
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      {selectedBooking.customerPhone}
                    </a>
                  )}

                  {selectedBooking.customerEmail && (
                    <a
                      href={`mailto:${selectedBooking.customerEmail}`}
                      className="flex items-center gap-3 rounded-xl text-sm text-zinc-400 transition hover:text-amber-200"
                    >
                      <Mail
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      {selectedBooking.customerEmail}
                    </a>
                  )}
                </div>
              </section>

              {selectedBooking.customerNote && (
                <section className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300/60">
                    Napomena klijenta
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-blue-100/80">
                    {selectedBooking.customerNote}
                  </p>
                </section>
              )}

              <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/60">
                  Interna napomena
                </div>

                <textarea
                  value={internalNote}
                  onChange={(event) =>
                    setInternalNote(event.target.value)
                  }
                  disabled={isPending}
                  maxLength={2000}
                  rows={5}
                  placeholder="Napomena vidljiva samo zaposlenima..."
                  className="mt-4 w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950/70 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-50"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-600">
                    {internalNote.length}/2000
                  </span>

                  <button
                    type="button"
                    disabled={
                      isPending || !internalNoteChanged
                    }
                    onClick={handleInternalNoteSave}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Save
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    {isPending
                      ? "Čuvanje..."
                      : "Sačuvaj napomenu"}
                  </button>
                </div>
              </section>

              {selectedBooking.cancellationReason && (
                <section className="rounded-2xl border border-red-400/15 bg-red-400/[0.05] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-red-300/60">
                    Razlog otkazivanja
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-red-100/80">
                    {selectedBooking.cancellationReason}
                  </p>

                  {selectedBooking.cancelledAt && (
                    <div className="mt-3 text-xs text-red-300/50">
                      Otkazano{" "}
                      {formatDateTime(
                        selectedBooking.cancelledAt,
                        timezone
                      )}
                    </div>
                  )}
                </section>
              )}

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Sistem
                </div>

                <div className="grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <div className="text-xs text-zinc-600">
                      Izvor
                    </div>

                    <div className="mt-1 font-medium text-zinc-300">
                      {sourceLabels[selectedBooking.source]}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-zinc-600">
                      Kreirano
                    </div>

                    <div className="mt-1 font-medium text-zinc-300">
                      {formatDateTime(
                        selectedBooking.createdAt,
                        timezone
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </aside>

          {rescheduleDialogOpen && selectedBooking && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Zatvori dijalog za promenu termina"
                onClick={closeRescheduleDialog}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="reschedule-booking-title"
                className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-amber-300/20 bg-zinc-950 p-6 shadow-2xl sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                      <CalendarCheck2
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>

                    <h3
                      id="reschedule-booking-title"
                      className="mt-5 text-xl font-semibold text-white"
                    >
                      Promeni termin
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      Izaberi novi datum, zaposlenog i slobodan
                      termin. Google Calendar će automatski
                      ažurirati isti događaj.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      rescheduleLoading ||
                      rescheduleSaving
                    }
                    onClick={closeRescheduleDialog}
                    aria-label="Zatvori"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:text-white disabled:opacity-40"
                  >
                    <X
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                {rescheduleMessage && (
                  <div
                    aria-live="polite"
                    className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 ${
                      rescheduleMessage.type === "success"
                        ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                        : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                    }`}
                  >
                    {rescheduleMessage.type === "success" ? (
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}

                    <span className="text-sm leading-relaxed">
                      {rescheduleMessage.text}
                    </span>
                  </div>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
                  <label className="block">
                    <span className="text-sm font-medium text-zinc-300">
                      Novi datum
                    </span>

                    <input
                      type="date"
                      value={rescheduleDate}
                      min={todayKey}
                      disabled={
                        rescheduleLoading ||
                        rescheduleSaving
                      }
                      onChange={(event) => {
                        setRescheduleDate(
                          event.target.value
                        );
                        setRescheduleEmployeeId("all");
                        setRescheduleSlots([]);
                        setSelectedRescheduleSlot(null);
                        setRescheduleMessage(null);
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition [color-scheme:dark] hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-50"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={
                      !rescheduleDate ||
                      rescheduleLoading ||
                      rescheduleSaving
                    }
                    onClick={() =>
                      void loadRescheduleSlots(
                        rescheduleDate
                      )
                    }
                    className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.09] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {rescheduleLoading ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <Search
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    )}

                    {rescheduleLoading
                      ? "Učitavanje..."
                      : "Prikaži termine"}
                  </button>
                </div>

                {rescheduleSlots.length > 0 && (
                  <label className="mt-5 block">
                    <span className="text-sm font-medium text-zinc-300">
                      Zaposleni
                    </span>

                    <select
                      value={rescheduleEmployeeId}
                      disabled={rescheduleSaving}
                      onChange={(event) => {
                        setRescheduleEmployeeId(
                          event.target.value
                        );
                        setSelectedRescheduleSlot(null);
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-50"
                    >
                      <option value="all">
                        Svi dostupni zaposleni
                      </option>

                      {rescheduleEmployees.map((employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Slobodni termini
                    </div>

                    {visibleRescheduleSlots.length > 0 && (
                      <div className="text-xs text-zinc-600">
                        {visibleRescheduleSlots.length} dostupno
                      </div>
                    )}
                  </div>

                  {rescheduleLoading ? (
                    <div className="mt-4 flex min-h-32 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/15">
                      <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <LoaderCircle
                          className="h-5 w-5 animate-spin text-amber-300"
                          aria-hidden="true"
                        />

                        Učitavanje slobodnih termina...
                      </div>
                    </div>
                  ) : visibleRescheduleSlots.length > 0 ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {visibleRescheduleSlots.map((slot) => {
                        const isCurrentSlot =
                          slot.employeeId ===
                            selectedBooking.employeeId &&
                          new Date(
                            slot.startsAt
                          ).getTime() ===
                            new Date(
                              selectedBooking.startsAt
                            ).getTime();

                        const isSelected =
                          selectedRescheduleSlot?.employeeId ===
                            slot.employeeId &&
                          selectedRescheduleSlot?.startsAt ===
                            slot.startsAt;

                        return (
                          <button
                            key={`${slot.employeeId}-${slot.startsAt}`}
                            type="button"
                            disabled={
                              isCurrentSlot ||
                              rescheduleSaving
                            }
                            onClick={() =>
                              setSelectedRescheduleSlot(slot)
                            }
                            className={`rounded-2xl border p-4 text-left transition ${
                              isSelected
                                ? "border-amber-300 bg-amber-300/[0.1] ring-2 ring-amber-300/10"
                                : isCurrentSlot
                                  ? "cursor-not-allowed border-white/[0.06] bg-white/[0.02] opacity-50"
                                  : "border-white/[0.08] bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-base font-semibold text-white">
                                  {formatTime(
                                    slot.startsAt,
                                    timezone
                                  )}
                                  {" – "}
                                  {formatTime(
                                    slot.endsAt,
                                    timezone
                                  )}
                                </div>

                                <div className="mt-1 text-sm text-zinc-500">
                                  {slot.employeeName}
                                </div>
                              </div>

                              {isSelected && (
                                <CheckCircle2
                                  className="h-5 w-5 flex-shrink-0 text-amber-200"
                                  aria-hidden="true"
                                />
                              )}
                            </div>

                            {isCurrentSlot && (
                              <div className="mt-3 text-xs font-medium text-zinc-600">
                                Trenutni termin
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-white/[0.1] bg-black/10 p-6 text-center text-sm leading-relaxed text-zinc-600">
                      Izaberi datum i učitaj slobodne termine.
                    </div>
                  )}
                </div>

                {selectedRescheduleSlot && (
                  <div className="mt-6 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/60">
                      Novi termin
                    </div>

                    <div className="mt-3 text-sm font-semibold text-white">
                      {formatDateTime(
                        selectedRescheduleSlot.startsAt,
                        timezone
                      )}
                    </div>

                    <div className="mt-1 text-sm text-zinc-500">
                      {selectedRescheduleSlot.employeeName}
                    </div>
                  </div>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={
                      rescheduleLoading ||
                      rescheduleSaving
                    }
                    onClick={closeRescheduleDialog}
                    className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    Odustani
                  </button>

                  <button
                    type="button"
                    disabled={
                      !selectedRescheduleSlot ||
                      rescheduleLoading ||
                      rescheduleSaving
                    }
                    onClick={() =>
                      void handleRescheduleSave()
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {rescheduleSaving ? (
                      <LoaderCircle
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      <CalendarCheck2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    )}

                    {rescheduleSaving
                      ? "Čuvanje..."
                      : "Sačuvaj novi termin"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {cancelDialogOpen && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
              <button
                type="button"
                aria-label="Zatvori dijalog za otkazivanje"
                onClick={() => {
                  if (!isPending) {
                    setCancelDialogOpen(false);
                  }
                }}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />

              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="cancel-booking-title"
                className="relative w-full max-w-lg rounded-[2rem] border border-red-400/20 bg-zinc-950 p-6 shadow-2xl sm:p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-400/10 text-red-300">
                      <XCircle
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>

                    <h3
                      id="cancel-booking-title"
                      className="mt-5 text-xl font-semibold text-white"
                    >
                      Otkaži rezervaciju
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                      Rezervacija će dobiti status „Otkazana“.
                      Ovu promenu trenutno nije moguće vratiti.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setCancelDialogOpen(false)
                    }
                    aria-label="Zatvori"
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:text-white disabled:opacity-40"
                  >
                    <X
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <label className="mt-6 block">
                  <span className="text-sm font-medium text-zinc-300">
                    Razlog otkazivanja
                  </span>

                  <textarea
                    value={cancellationReason}
                    onChange={(event) =>
                      setCancellationReason(event.target.value)
                    }
                    disabled={isPending}
                    maxLength={500}
                    rows={4}
                    placeholder="Na primer: klijent je telefonom otkazao termin..."
                    className="mt-2 w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-700 focus:border-red-300 focus:ring-2 focus:ring-red-300/15 disabled:opacity-50"
                  />
                </label>

                <div className="mt-2 text-right text-xs text-zinc-600">
                  {cancellationReason.length}/500
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      setCancelDialogOpen(false)
                    }
                    className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    Odustani
                  </button>

                  <button
                    type="button"
                    disabled={
                      isPending ||
                      cancellationReason.trim().length < 3
                    }
                    onClick={() =>
                      handleStatusUpdate(
                        "cancelled",
                        cancellationReason
                      )
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-400 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <XCircle
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    {isPending
                      ? "Otkazivanje..."
                      : "Potvrdi otkazivanje"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}