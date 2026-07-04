"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FilterX,
  LoaderCircle,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Search,
  Scissors,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import {
  BUSINESS_BOOKING_SOURCE_LABELS,
  BUSINESS_BOOKING_STATUS_LABELS,
  formatBusinessBookingDateTime,
  formatBusinessBookingPrice,
  formatBusinessBookingTime,
  getAllowedBusinessBookingStatuses,
  getBusinessBookingDateKey,
  type BusinessBookingApiResponse,
  type BusinessBookingEmployeeOption,
  type BusinessBookingListItem,
  type BusinessBookingSlot,
  type BusinessBookingSource,
  type BusinessBookingStatus,
} from "@/lib/platform-admin/business-bookings";

type PeriodFilter =
  | "all"
  | "today"
  | "upcoming"
  | "past";

type BusinessBookingsManagerProps = {
  businessSlug: string;
  businessName: string;
  timezone: string;
  generatedAt: string;
  employees: readonly BusinessBookingEmployeeOption[];
  bookings: readonly BusinessBookingListItem[];
};

type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

const STATUS_CLASSES: Record<BusinessBookingStatus, string> = {
  pending:
    "border-amber-300/20 bg-amber-300/10 text-amber-200",
  confirmed:
    "border-sky-300/20 bg-sky-300/10 text-sky-200",
  completed:
    "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  cancelled:
    "border-red-300/20 bg-red-300/10 text-red-200",
  no_show:
    "border-orange-300/20 bg-orange-300/10 text-orange-200",
};

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  all: "Svi datumi",
  today: "Danas",
  upcoming: "Predstojeće",
  past: "Prošle",
};

function normalizeSearchValue(
  value: string | null
): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function StatusBadge({
  status,
}: {
  status: BusinessBookingStatus;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_CLASSES[status]}`}
    >
      {BUSINESS_BOOKING_STATUS_LABELS[status]}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-white">
            {value}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-500">
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

export default function BusinessBookingsManager({
  businessSlug,
  businessName,
  timezone,
  generatedAt,
  employees,
  bookings,
}: BusinessBookingsManagerProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | BusinessBookingStatus>("all");
  const [sourceFilter, setSourceFilter] =
    useState<"all" | BusinessBookingSource>("all");
  const [periodFilter, setPeriodFilter] =
    useState<PeriodFilter>("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [selectedBookingId, setSelectedBookingId] =
    useState<string | null>(null);
  const [internalNote, setInternalNote] = useState("");
  const [cancellationReason, setCancellationReason] =
    useState("");
  const [cancelDialogOpen, setCancelDialogOpen] =
    useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] =
    useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleEmployeeId, setRescheduleEmployeeId] =
    useState("all");
  const [rescheduleSlots, setRescheduleSlots] =
    useState<BusinessBookingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] =
    useState<BusinessBookingSlot | null>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const [rescheduleMessage, setRescheduleMessage] =
    useState<MessageState>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const generatedTimestamp = new Date(generatedAt).getTime();
  const todayKey = getBusinessBookingDateKey(
    generatedAt,
    timezone
  );

  const selectedBooking = useMemo(
    () =>
      bookings.find(
        (booking) => booking.id === selectedBookingId
      ) ?? null,
    [bookings, selectedBookingId]
  );

  const metrics = useMemo(() => {
    const today = bookings.filter(
      (booking) =>
        getBusinessBookingDateKey(
          booking.startsAt,
          timezone
        ) === todayKey
    ).length;
    const pending = bookings.filter(
      (booking) => booking.status === "pending"
    ).length;
    const upcoming = bookings.filter(
      (booking) =>
        new Date(booking.startsAt).getTime() >=
          generatedTimestamp &&
        (booking.status === "pending" ||
          booking.status === "confirmed")
    ).length;
    const completedRevenue = bookings
      .filter((booking) => booking.status === "completed")
      .reduce(
        (sum, booking) => sum + booking.priceAmount,
        0
      );

    return {
      total: bookings.length,
      today,
      pending,
      upcoming,
      completedRevenue,
    };
  }, [
    bookings,
    generatedTimestamp,
    timezone,
    todayKey,
  ]);

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase();

    return bookings.filter((booking) => {
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

      const startTimestamp = new Date(
        booking.startsAt
      ).getTime();
      const bookingDateKey = getBusinessBookingDateKey(
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
        startTimestamp < generatedTimestamp
      ) {
        return false;
      }

      if (
        periodFilter === "past" &&
        startTimestamp >= generatedTimestamp
      ) {
        return false;
      }

      if (normalizedQuery) {
        const searchable = [
          booking.referenceCode,
          booking.customerName,
          booking.customerPhone,
          booking.customerEmail,
          booking.serviceName,
          booking.employeeName,
        ]
          .map(normalizeSearchValue)
          .join(" ");

        if (!searchable.includes(normalizedQuery)) {
          return false;
        }
      }

      return true;
    });
  }, [
    bookings,
    employeeFilter,
    generatedTimestamp,
    periodFilter,
    query,
    sourceFilter,
    statusFilter,
    timezone,
    todayKey,
  ]);

  const hasFilters =
    query.trim().length > 0 ||
    statusFilter !== "all" ||
    sourceFilter !== "all" ||
    periodFilter !== "all" ||
    employeeFilter !== "all";

  function clearFilters() {
    setQuery("");
    setStatusFilter("all");
    setSourceFilter("all");
    setPeriodFilter("all");
    setEmployeeFilter("all");
  }

  function openBooking(booking: BusinessBookingListItem) {
    setSelectedBookingId(booking.id);
    setInternalNote(booking.internalNote ?? "");
    setCancellationReason("");
    setCancelDialogOpen(false);
    setRescheduleDialogOpen(false);
    setRescheduleSlots([]);
    setSelectedSlot(null);
    setMessage(null);
    setRescheduleMessage(null);
  }

  function closeBooking() {
    setSelectedBookingId(null);
    setCancelDialogOpen(false);
    setRescheduleDialogOpen(false);
    setMessage(null);
    setRescheduleMessage(null);
  }

  async function callApi(
    method: "POST" | "PUT",
    body: Record<string, unknown>
  ): Promise<BusinessBookingApiResponse> {
    const response = await fetch(
      "/api/platform-admin/businesses/bookings",
      {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          businessSlug,
          ...body,
        }),
      }
    );

    const payload =
      (await response.json()) as BusinessBookingApiResponse;

    if (!response.ok || !payload.ok) {
      throw new Error(
        payload.message ?? "Booking akcija nije uspela."
      );
    }

    return payload;
  }

  async function updateStatus(
    nextStatus: BusinessBookingStatus,
    reason = ""
  ) {
    if (!selectedBooking) {
      return;
    }

    setBusyAction(`status:${nextStatus}`);
    setMessage(null);

    try {
      const payload = await callApi("PUT", {
        action: "status",
        bookingId: selectedBooking.id,
        expectedUpdatedAt: selectedBooking.updatedAt,
        nextStatus,
        cancellationReason: reason,
      });

      setMessage({
        type: "success",
        text: payload.message ?? "Status je promenjen.",
      });
      setCancelDialogOpen(false);
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Status nije promenjen.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBooking) {
      return;
    }

    setBusyAction("note");
    setMessage(null);

    try {
      const payload = await callApi("PUT", {
        action: "note",
        bookingId: selectedBooking.id,
        expectedUpdatedAt: selectedBooking.updatedAt,
        internalNote,
      });

      setMessage({
        type: "success",
        text: payload.message ?? "Napomena je sačuvana.",
      });
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Napomena nije sačuvana.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  function openReschedule() {
    if (!selectedBooking) {
      return;
    }

    setRescheduleDate(
      getBusinessBookingDateKey(
        selectedBooking.startsAt,
        timezone
      )
    );
    setRescheduleEmployeeId(selectedBooking.employeeId);
    setRescheduleSlots([]);
    setSelectedSlot(null);
    setRescheduleMessage(null);
    setRescheduleDialogOpen(true);
  }

  async function loadSlots() {
    if (!selectedBooking || !rescheduleDate) {
      return;
    }

    setBusyAction("slots");
    setRescheduleMessage(null);
    setSelectedSlot(null);

    try {
      const payload = await callApi("POST", {
        action: "slots",
        bookingId: selectedBooking.id,
        date: rescheduleDate,
        employeeId:
          rescheduleEmployeeId === "all"
            ? null
            : rescheduleEmployeeId,
      });

      const slots = payload.slots ?? [];
      setRescheduleSlots(slots);
      setRescheduleMessage({
        type: slots.length > 0 ? "success" : "error",
        text:
          payload.message ??
          (slots.length > 0
            ? "Slobodni termini su učitani."
            : "Nema slobodnih termina."),
      });
    } catch (error) {
      setRescheduleSlots([]);
      setRescheduleMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Termini nisu učitani.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  async function confirmReschedule() {
    if (!selectedBooking || !selectedSlot) {
      return;
    }

    setBusyAction("reschedule");
    setRescheduleMessage(null);

    try {
      const payload = await callApi("PUT", {
        action: "reschedule",
        bookingId: selectedBooking.id,
        employeeId: selectedSlot.employeeId,
        startsAt: selectedSlot.startsAt,
      });

      setMessage({
        type: "success",
        text: payload.message ?? "Termin je promenjen.",
      });
      setRescheduleDialogOpen(false);
      router.refresh();
    } catch (error) {
      setRescheduleMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Termin nije promenjen.",
      });
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          label="Ukupno"
          value={metrics.total}
          icon={CalendarDays}
        />
        <MetricCard
          label="Danas"
          value={metrics.today}
          icon={Clock3}
        />
        <MetricCard
          label="Na čekanju"
          value={metrics.pending}
          icon={AlertCircle}
        />
        <MetricCard
          label="Predstojeće"
          value={metrics.upcoming}
          icon={CalendarClock}
        />
        <MetricCard
          label="Završen prihod"
          value={formatBusinessBookingPrice(
            metrics.completedRevenue,
            bookings[0]?.currency ?? "RSD"
          )}
          icon={CircleDollarSign}
        />
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-5">
          <label className="lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Pretraga
            </span>
            <div className="relative mt-2">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
              />
              <input
                value={query}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  setQuery(event.target.value)
                }
                placeholder="Referenca, klijent, telefon, usluga..."
                className="min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/60 pl-10 pr-3 text-sm text-white outline-none transition focus:border-amber-300/40"
              />
            </div>
          </label>

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              ["all", "Svi statusi"],
              ...Object.entries(
                BUSINESS_BOOKING_STATUS_LABELS
              ),
            ]}
          />

          <FilterSelect
            label="Period"
            value={periodFilter}
            onChange={setPeriodFilter}
            options={Object.entries(PERIOD_LABELS)}
          />

          <FilterSelect
            label="Izvor"
            value={sourceFilter}
            onChange={setSourceFilter}
            options={[
              ["all", "Svi izvori"],
              ...Object.entries(
                BUSINESS_BOOKING_SOURCE_LABELS
              ),
            ]}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <FilterSelect
            label="Zaposleni"
            value={employeeFilter}
            onChange={setEmployeeFilter}
            options={[
              ["all", "Svi zaposleni"],
              ...employees.map(
                (employee) => [employee.id, employee.name] as const
              ),
            ]}
            compact
          />

          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">
              Prikazano {filteredBookings.length} od {bookings.length}
            </span>

            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
              >
                <FilterX size={16} />
                Očisti
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-3">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => (
            <button
              key={booking.id}
              type="button"
              onClick={() => openBooking(booking)}
              className="group grid w-full gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.05] md:grid-cols-[1.1fr_1.2fr_1fr_auto] md:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-white">
                    {booking.customerName}
                  </p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="mt-1 text-xs text-zinc-600">
                  #{booking.referenceCode} · {BUSINESS_BOOKING_SOURCE_LABELS[booking.source]}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-zinc-200">
                  {booking.serviceName}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {booking.employeeName}
                </p>
              </div>

              <div>
                <p className="text-sm text-zinc-300">
                  {formatBusinessBookingDateTime(
                    booking.startsAt,
                    timezone
                  )}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  {booking.durationMinutes} min · {formatBusinessBookingPrice(
                    booking.priceAmount,
                    booking.currency
                  )}
                </p>
              </div>

              <ChevronRight
                size={19}
                className="hidden text-zinc-700 transition group-hover:text-zinc-400 md:block"
              />
            </button>
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center">
            <CalendarDays
              size={34}
              className="mx-auto text-zinc-700"
            />
            <h3 className="mt-4 text-lg font-semibold">
              Nema rezervacija za izabrane filtere
            </h3>
            <p className="mt-2 text-sm text-zinc-500">
              Promeni filtere ili pretragu.
            </p>
          </div>
        )}
      </section>

      {selectedBooking ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Rezervacija ${selectedBooking.referenceCode}`}
        >
          <div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl border border-white/10 bg-zinc-950 shadow-2xl md:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-white/10 bg-zinc-950/95 p-5 backdrop-blur md:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-semibold">
                    {selectedBooking.customerName}
                  </h3>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <p className="mt-1 text-sm text-zinc-500">
                  {businessName} · #{selectedBooking.referenceCode}
                </p>
              </div>
              <button
                type="button"
                onClick={closeBooking}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
                aria-label="Zatvori"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-6 p-5 md:p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <DetailSection title="Termin i usluga">
                  <DetailRow
                    icon={CalendarClock}
                    label="Termin"
                    value={formatBusinessBookingDateTime(
                      selectedBooking.startsAt,
                      timezone
                    )}
                  />
                  <DetailRow
                    icon={Clock3}
                    label="Trajanje"
                    value={`${selectedBooking.durationMinutes} min · do ${formatBusinessBookingTime(
                      selectedBooking.endsAt,
                      timezone
                    )}`}
                  />
                  <DetailRow
                    icon={Scissors}
                    label="Usluga"
                    value={selectedBooking.serviceName}
                  />
                  <DetailRow
                    icon={UserRound}
                    label="Zaposleni"
                    value={selectedBooking.employeeName}
                  />
                  <DetailRow
                    icon={CircleDollarSign}
                    label="Cena"
                    value={formatBusinessBookingPrice(
                      selectedBooking.priceAmount,
                      selectedBooking.currency
                    )}
                  />
                </DetailSection>

                <DetailSection title="Kontakt klijenta">
                  <DetailRow
                    icon={Phone}
                    label="Telefon"
                    value={selectedBooking.customerPhone ?? "—"}
                  />
                  <DetailRow
                    icon={Mail}
                    label="Email"
                    value={selectedBooking.customerEmail ?? "—"}
                  />
                  {selectedBooking.customerNote ? (
                    <p className="rounded-xl border border-white/10 bg-zinc-950/60 p-3 text-sm leading-6 text-zinc-400">
                      {selectedBooking.customerNote}
                    </p>
                  ) : null}
                </DetailSection>

                <form onSubmit={saveNote}>
                  <DetailSection title="Interna napomena">
                    <textarea
                      value={internalNote}
                      onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                        setInternalNote(event.target.value)
                      }
                      maxLength={2000}
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-zinc-950/60 p-3 text-sm text-white outline-none transition focus:border-amber-300/40"
                      placeholder="Napomena vidljiva samo administraciji..."
                    />
                    <button
                      type="submit"
                      disabled={busyAction !== null}
                      className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyAction === "note" ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Save size={16} />
                      )}
                      Sačuvaj napomenu
                    </button>
                  </DetailSection>
                </form>
              </div>

              <div className="space-y-5">
                <DetailSection title="Akcije">
                  {getAllowedBusinessBookingStatuses(
                    selectedBooking.status
                  ).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={busyAction !== null}
                      onClick={() => {
                        if (status === "cancelled") {
                          setCancelDialogOpen(true);
                          setCancellationReason("");
                          setMessage(null);
                          return;
                        }
                        void updateStatus(status);
                      }}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busyAction === `status:${status}` ? (
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                      ) : status === "confirmed" ||
                        status === "completed" ? (
                        <CheckCircle2 size={17} />
                      ) : (
                        <XCircle size={17} />
                      )}
                      {BUSINESS_BOOKING_STATUS_LABELS[status]}
                    </button>
                  ))}

                  {(selectedBooking.status === "pending" ||
                    selectedBooking.status === "confirmed") ? (
                    <button
                      type="button"
                      onClick={openReschedule}
                      disabled={busyAction !== null}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <RefreshCw size={17} />
                      Pomeri termin
                    </button>
                  ) : null}

                  {getAllowedBusinessBookingStatuses(
                    selectedBooking.status
                  ).length === 0 &&
                  selectedBooking.status !== "pending" &&
                  selectedBooking.status !== "confirmed" ? (
                    <p className="text-sm leading-6 text-zinc-500">
                      Rezervacija je u završnom statusu i nema dostupnih akcija.
                    </p>
                  ) : null}
                </DetailSection>

                <DetailSection title="Google Calendar">
                  <p className="text-sm text-zinc-400">
                    Event: {selectedBooking.googleEventId ?? "nije kreiran"}
                  </p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Sync status: {selectedBooking.googleSyncStatus ?? "—"}
                  </p>
                  {selectedBooking.googleSyncError ? (
                    <p className="mt-3 rounded-xl border border-red-300/20 bg-red-300/10 p-3 text-sm text-red-200">
                      {selectedBooking.googleSyncError}
                    </p>
                  ) : null}
                </DetailSection>

                {selectedBooking.cancellationReason ? (
                  <DetailSection title="Otkazivanje">
                    <p className="text-sm leading-6 text-zinc-400">
                      {selectedBooking.cancellationReason}
                    </p>
                  </DetailSection>
                ) : null}

                {message ? (
                  <MessageBox message={message} />
                ) : null}
              </div>
            </div>

            {cancelDialogOpen ? (
              <div className="border-t border-white/10 bg-red-950/15 p-5 md:p-6">
                <h4 className="font-semibold text-red-100">
                  Otkazivanje rezervacije
                </h4>
                <p className="mt-1 text-sm text-zinc-500">
                  Unesi razlog. Google Calendar događaj će biti uklonjen.
                </p>
                <textarea
                  value={cancellationReason}
                  onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                    setCancellationReason(event.target.value)
                  }
                  maxLength={500}
                  rows={3}
                  className="mt-4 w-full rounded-xl border border-red-300/20 bg-zinc-950/70 p-3 text-sm text-white outline-none focus:border-red-300/50"
                  placeholder="Razlog otkazivanja..."
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setCancelDialogOpen(false)}
                    className="min-h-10 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300"
                  >
                    Odustani
                  </button>
                  <button
                    type="button"
                    disabled={
                      busyAction !== null ||
                      cancellationReason.trim().length < 3
                    }
                    onClick={() =>
                      void updateStatus(
                        "cancelled",
                        cancellationReason.trim()
                      )
                    }
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyAction === "status:cancelled" ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <XCircle size={16} />
                    )}
                    Potvrdi otkazivanje
                  </button>
                </div>
              </div>
            ) : null}

            {rescheduleDialogOpen ? (
              <div className="border-t border-white/10 bg-sky-950/15 p-5 md:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sky-100">
                      Pomeranje termina
                    </h4>
                    <p className="mt-1 text-sm text-zinc-500">
                      Availability uključuje radno vreme, rezervacije i blokade.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRescheduleDialogOpen(false)}
                    className="text-zinc-500 hover:text-white"
                    aria-label="Zatvori pomeranje"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                  <label>
                    <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                      Datum
                    </span>
                    <input
                      type="date"
                      value={rescheduleDate}
                      min={todayKey}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setRescheduleDate(event.target.value);
                        setRescheduleSlots([]);
                        setSelectedSlot(null);
                      }}
                      className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-sm text-white outline-none focus:border-sky-300/40"
                    />
                  </label>

                  <FilterSelect
                    label="Zaposleni"
                    value={rescheduleEmployeeId}
                    onChange={(value) => {
                      setRescheduleEmployeeId(value);
                      setRescheduleSlots([]);
                      setSelectedSlot(null);
                    }}
                    options={[
                      ["all", "Prvi slobodan"],
                      ...employees.map(
                        (employee) => [employee.id, employee.name] as const
                      ),
                    ]}
                  />

                  <button
                    type="button"
                    onClick={() => void loadSlots()}
                    disabled={!rescheduleDate || busyAction !== null}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-2.5 text-sm font-semibold text-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyAction === "slots" ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <Search size={17} />
                    )}
                    Nađi termine
                  </button>
                </div>

                {rescheduleMessage ? (
                  <div className="mt-4">
                    <MessageBox message={rescheduleMessage} />
                  </div>
                ) : null}

                {rescheduleSlots.length > 0 ? (
                  <div className="mt-4 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
                    {rescheduleSlots.map((slot) => {
                      const selected =
                        selectedSlot?.employeeId === slot.employeeId &&
                        selectedSlot?.startsAt === slot.startsAt;

                      return (
                        <button
                          key={`${slot.employeeId}-${slot.startsAt}`}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`rounded-xl border p-3 text-left transition ${
                            selected
                              ? "border-sky-300/50 bg-sky-300/15"
                              : "border-white/10 bg-zinc-950/60 hover:border-white/20"
                          }`}
                        >
                          <p className="font-semibold text-white">
                            {formatBusinessBookingTime(
                              slot.startsAt,
                              timezone
                            )}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500">
                            {slot.employeeName}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : null}

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => void confirmReschedule()}
                    disabled={!selectedSlot || busyAction !== null}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busyAction === "reschedule" ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin"
                      />
                    ) : (
                      <RefreshCw size={17} />
                    )}
                    Sačuvaj novi termin
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterSelect<Value extends string>({
  label,
  value,
  onChange,
  options,
  compact = false,
}: {
  label: string;
  value: Value;
  onChange: (value: Value) => void;
  options: readonly (readonly [string, string])[];
  compact?: boolean;
}) {
  return (
    <label className={compact ? "w-full sm:max-w-xs" : ""}>
      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {label}
      </span>
      <select
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onChange(event.target.value as Value)
        }
        className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-300/40"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
        {title}
      </h4>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={17} className="mt-0.5 shrink-0 text-zinc-600" />
      <div>
        <p className="text-xs text-zinc-600">{label}</p>
        <p className="mt-0.5 break-words text-sm text-zinc-300">
          {value}
        </p>
      </div>
    </div>
  );
}

function MessageBox({
  message,
}: {
  message: Exclude<MessageState, null>;
}) {
  return (
    <div
      className={`flex items-start gap-2 rounded-xl border p-3 text-sm ${
        message.type === "success"
          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
          : "border-red-300/20 bg-red-300/10 text-red-200"
      }`}
    >
      {message.type === "success" ? (
        <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={17} className="mt-0.5 shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
}
