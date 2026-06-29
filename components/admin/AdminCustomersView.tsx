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
  FilterX,
  Mail,
  Phone,
  Save,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { updateCustomerNotesAction } from "@/app/admin/(protected)/customers/actions";
import type {
  AdminCustomerBooking,
  AdminCustomerListItem,
} from "@/lib/admin/customers";
import type {
  BookingSource,
  BookingStatus,
} from "@/lib/admin/bookings";

type AdminCustomersViewProps = {
  businessName: string;
  timezone: string;
  generatedAt: string;
  customers: AdminCustomerListItem[];
};

type CustomerFilter =
  | "all"
  | "upcoming"
  | "returning"
  | "new"
  | "no_show";

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

const filterLabels: Record<CustomerFilter, string> = {
  all: "Svi klijenti",
  upcoming: "Imaju sledeći termin",
  returning: "Stalni klijenti",
  new: "Novi klijenti",
  no_show: "Imaju no-show",
};

function getInitials(value: string): string {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "KL";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function getServiceName(
  booking: AdminCustomerBooking
): string {
  const name = booking.serviceName;

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

function formatDate(
  value: string | null,
  timezone: string
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    timeZone: timezone,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(
  value: string | null,
  timezone: string
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    timeZone: timezone,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
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

function formatCustomerSpending(
  customer: AdminCustomerListItem
): string {
  if (customer.spending.length === 0) {
    return "0";
  }

  return customer.spending
    .map((spending) =>
      formatPrice(
        spending.amount,
        spending.currency
      )
    )
    .join(" · ");
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
      className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export default function AdminCustomersView({
  businessName,
  timezone,
  generatedAt,
  customers,
}: AdminCustomersViewProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [query, setQuery] = useState("");

  const [customerFilter, setCustomerFilter] =
    useState<CustomerFilter>("all");

  const [
    selectedCustomerId,
    setSelectedCustomerId,
  ] = useState<string | null>(null);

  const [crmNotes, setCrmNotes] = useState("");

  const [actionMessage, setActionMessage] =
    useState<ActionMessage | null>(null);

  const snapshotTimestamp = new Date(
    generatedAt
  ).getTime();

  const metrics = useMemo(() => {
    const upcomingCustomers = customers.filter(
      (customer) =>
        customer.nextBookingAt !== null &&
        new Date(
          customer.nextBookingAt
        ).getTime() >= snapshotTimestamp
    );

    const returningCustomers = customers.filter(
      (customer) =>
        customer.metrics.completedBookings >= 2
    );

    const newCustomers = customers.filter(
      (customer) =>
        customer.metrics.totalBookings <= 1
    );

    const completedVisits = customers.reduce(
      (total, customer) =>
        total +
        customer.metrics.completedBookings,
      0
    );

    return {
      total: customers.length,
      upcoming: upcomingCustomers.length,
      returning: returningCustomers.length,
      newCustomers: newCustomers.length,
      completedVisits,
    };
  }, [customers, snapshotTimestamp]);

  const totalSpend = useMemo(() => {
    const spendingByCurrency = new Map<
      string,
      number
    >();

    customers.forEach((customer) => {
      customer.spending.forEach((spending) => {
        const currentAmount =
          spendingByCurrency.get(
            spending.currency
          ) ?? 0;

        spendingByCurrency.set(
          spending.currency,
          currentAmount + spending.amount
        );
      });
    });

    return Array.from(
      spendingByCurrency.entries()
    ).map(([currency, amount]) => ({
      currency,
      amount,
    }));
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLocaleLowerCase();

    return customers
      .filter((customer) => {
        if (
          customerFilter === "upcoming" &&
          !customer.nextBookingAt
        ) {
          return false;
        }

        if (
          customerFilter === "returning" &&
          customer.metrics.completedBookings < 2
        ) {
          return false;
        }

        if (
          customerFilter === "new" &&
          customer.metrics.totalBookings > 1
        ) {
          return false;
        }

        if (
          customerFilter === "no_show" &&
          customer.metrics.noShowBookings === 0
        ) {
          return false;
        }

        if (normalizedQuery) {
          const searchableValues = [
            customer.fullName,
            customer.phone,
            customer.email,
            customer.notes,
          ]
            .map(normalizeSearchValue)
            .join(" ");

          if (
            !searchableValues.includes(
              normalizedQuery
            )
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((first, second) =>
        first.fullName.localeCompare(
          second.fullName,
          "sr-Latn"
        )
      );
  }, [customers, customerFilter, query]);

  const selectedCustomer = useMemo(
    () =>
      customers.find(
        (customer) =>
          customer.id === selectedCustomerId
      ) ?? null,
    [customers, selectedCustomerId]
  );

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    setCrmNotes(selectedCustomer.notes ?? "");
    setActionMessage(null);
  }, [
    selectedCustomer?.id,
    selectedCustomer?.notes,
  ]);

  useEffect(() => {
    if (!selectedCustomer) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !isPending
      ) {
        setSelectedCustomerId(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedCustomer, isPending]);

  const hasActiveFilters =
    query.trim().length > 0 ||
    customerFilter !== "all";

  const crmNotesChanged =
    crmNotes.trim() !==
    (selectedCustomer?.notes ?? "").trim();

  const clearFilters = () => {
    setQuery("");
    setCustomerFilter("all");
  };

  const openCustomer = (
    customerId: string
  ) => {
    setSelectedCustomerId(customerId);
    setActionMessage(null);
  };

  const closeCustomer = () => {
    if (isPending) {
      return;
    }

    setSelectedCustomerId(null);
    setActionMessage(null);
  };

  const handleSaveNotes = () => {
    if (
      !selectedCustomer ||
      isPending ||
      !crmNotesChanged
    ) {
      return;
    }

    setActionMessage(null);

    startTransition(async () => {
      const result =
        await updateCustomerNotesAction({
          customerId: selectedCustomer.id,
          notes: crmNotes,
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

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
          {businessName}
        </div>

        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Klijenti
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              CRM pregled kontakata, istorije
              termina, potrošnje i budućih
              poseta svakog klijenta.
            </p>
          </div>

          <div className="inline-flex self-start items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs text-zinc-500">
            <UsersRound
              className="h-4 w-4 text-amber-300"
              aria-hidden="true"
            />

            Ukupno klijenata:

            <span className="font-semibold text-white">
              {customers.length}
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

            <UsersRound
              className="h-5 w-5 text-zinc-600"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-white">
            {metrics.total}
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            klijenata u CRM-u
          </div>
        </article>

        <article className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-200/70">
              Sledeći termin
            </div>

            <CalendarCheck2
              className="h-5 w-5 text-blue-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-blue-100">
            {metrics.upcoming}
          </div>

          <div className="mt-2 text-xs text-blue-300/50">
            klijenata sa terminom
          </div>
        </article>

        <article className="rounded-3xl border border-purple-400/15 bg-purple-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-200/70">
              Stalni klijenti
            </div>

            <UserRound
              className="h-5 w-5 text-purple-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-purple-100">
            {metrics.returning}
          </div>

          <div className="mt-2 text-xs text-purple-300/50">
            najmanje dve posete
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/70">
              Novi klijenti
            </div>

            <CalendarDays
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-amber-100">
            {metrics.newCustomers}
          </div>

          <div className="mt-2 text-xs text-amber-300/50">
            do jedne rezervacije
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.055] p-5 sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <div className="text-sm text-emerald-200/70">
              Završene posete
            </div>

            <CheckCircle2
              className="h-5 w-5 text-emerald-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-emerald-100">
            {metrics.completedVisits}
          </div>

          <div className="mt-2 truncate text-xs text-emerald-300/50">
            {totalSpend.length > 0
              ? totalSpend
                  .map((spending) =>
                    formatPrice(
                      spending.amount,
                      spending.currency
                    )
                  )
                  .join(" · ")
              : "bez evidentiranog prihoda"}
          </div>
        </article>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(18rem,1fr)_minmax(13rem,0.35fr)_auto]">
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
                placeholder="Ime, telefon, email ili napomena..."
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/15 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            </div>

            <select
              value={customerFilter}
              onChange={(event) =>
                setCustomerFilter(
                  event.target.value as CustomerFilter
                )
              }
              className="h-11 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 text-sm text-zinc-300 outline-none transition hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
            >
              {(
                Object.keys(
                  filterLabels
                ) as CustomerFilter[]
              ).map((filter) => (
                <option
                  key={filter}
                  value={filter}
                >
                  {filterLabels[filter]}
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
              {filteredCustomers.length}
            </strong>{" "}
            od {customers.length}
          </span>

          <span>
            Klikni klijenta za istoriju
          </span>
        </div>

        {filteredCustomers.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.05] text-zinc-600">
              <UsersRound
                className="h-6 w-6"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              Nema klijenata
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-600">
              Nijedan klijent ne odgovara
              trenutno izabranoj pretrazi ili
              filteru.
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
                      Klijent
                    </th>

                    <th className="px-5 py-4">
                      Kontakt
                    </th>

                    <th className="px-5 py-4">
                      Rezervacije
                    </th>

                    <th className="px-5 py-4">
                      Poslednja poseta
                    </th>

                    <th className="px-5 py-4">
                      Sledeći termin
                    </th>

                    <th className="px-5 py-4">
                      Potrošnja
                    </th>

                    <th className="w-14 px-5 py-4">
                      <span className="sr-only">
                        Detalji
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map(
                    (customer) => (
                      <tr
                        key={customer.id}
                        onClick={() =>
                          openCustomer(
                            customer.id
                          )
                        }
                        className="cursor-pointer border-b border-white/[0.055] transition last:border-b-0 hover:bg-white/[0.035]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-xs font-bold text-amber-200">
                              {getInitials(
                                customer.fullName
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="truncate font-semibold text-white">
                                {
                                  customer.fullName
                                }
                              </div>

                              <div className="mt-1 text-xs text-zinc-600">
                                Klijent od{" "}
                                {formatDate(
                                  customer.createdAt,
                                  timezone
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm text-zinc-300">
                            {customer.phone ??
                              "Bez telefona"}
                          </div>

                          <div className="mt-1 max-w-56 truncate text-xs text-zinc-600">
                            {customer.email ??
                              "Bez email adrese"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-white">
                            {
                              customer.metrics
                                .totalBookings
                            }
                          </div>

                          <div className="mt-1 text-xs text-zinc-600">
                            {
                              customer.metrics
                                .completedBookings
                            }{" "}
                            završenih
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm text-zinc-400">
                          {formatDate(
                            customer.lastVisitAt,
                            timezone
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          {customer.nextBookingAt ? (
                            <div>
                              <div className="text-sm font-medium text-blue-200">
                                {formatDateTime(
                                  customer.nextBookingAt,
                                  timezone
                                )}
                              </div>

                              <div className="mt-1 text-xs text-blue-300/50">
                                aktivan termin
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-zinc-700">
                              Nije zakazano
                            </span>
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-amber-200">
                          {formatCustomerSpending(
                            customer
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <ChevronRight
                            className="h-4 w-4 text-zinc-700"
                            aria-hidden="true"
                          />
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/[0.06] lg:hidden">
              {filteredCustomers.map(
                (customer) => (
                  <button
                    key={customer.id}
                    type="button"
                    onClick={() =>
                      openCustomer(customer.id)
                    }
                    className="w-full p-4 text-left transition hover:bg-white/[0.035] sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-xs font-bold text-amber-200">
                        {getInitials(
                          customer.fullName
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-white">
                          {customer.fullName}
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {
                            customer.metrics
                              .totalBookings
                          }{" "}
                          rezervacija ·{" "}
                          {
                            customer.metrics
                              .completedBookings
                          }{" "}
                          završenih
                        </div>
                      </div>

                      <ChevronRight
                        className="mt-1 h-4 w-4 flex-shrink-0 text-zinc-700"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="mt-4 grid gap-3 rounded-2xl border border-white/[0.06] bg-black/10 p-4">
                      {customer.phone && (
                        <div className="flex items-center gap-3">
                          <Phone
                            className="h-4 w-4 text-zinc-600"
                            aria-hidden="true"
                          />

                          <span className="text-sm text-zinc-400">
                            {customer.phone}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <CalendarCheck2
                          className="h-4 w-4 text-zinc-600"
                          aria-hidden="true"
                        />

                        <span className="text-sm text-zinc-400">
                          Sledeći:{" "}
                          {formatDateTime(
                            customer.nextBookingAt,
                            timezone
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <CircleDollarSign
                          className="h-4 w-4 text-zinc-600"
                          aria-hidden="true"
                        />

                        <span className="text-sm font-semibold text-amber-200">
                          {formatCustomerSpending(
                            customer
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </>
        )}
      </section>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Zatvori detalje klijenta"
            onClick={closeCustomer}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          <aside className="absolute inset-y-0 right-0 w-full max-w-2xl overflow-y-auto border-l border-white/10 bg-zinc-950 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/90 px-5 py-5 backdrop-blur-xl sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300 text-sm font-bold text-zinc-950">
                  {getInitials(
                    selectedCustomer.fullName
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-600">
                    CRM profil
                  </div>

                  <div className="mt-1 truncate text-lg font-semibold text-white">
                    {selectedCustomer.fullName}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCustomer}
                disabled={isPending}
                aria-label="Zatvori"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-wait disabled:opacity-40"
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
                  {actionMessage.type ===
                  "success" ? (
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

              <section className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="text-xs text-zinc-600">
                    Rezervacije
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-white">
                    {
                      selectedCustomer.metrics
                        .totalBookings
                    }
                  </div>
                </article>

                <article className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                  <div className="text-xs text-emerald-300/60">
                    Završene
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-emerald-100">
                    {
                      selectedCustomer.metrics
                        .completedBookings
                    }
                  </div>
                </article>

                <article className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4">
                  <div className="text-xs text-amber-300/60">
                    Potrošnja
                  </div>

                  <div className="mt-2 text-base font-semibold text-amber-100">
                    {formatCustomerSpending(
                      selectedCustomer
                    )}
                  </div>
                </article>
              </section>

              <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                  Kontakt
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <UserRound
                      className="h-4 w-4 text-zinc-600"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-medium text-white">
                      {selectedCustomer.fullName}
                    </span>
                  </div>

                  {selectedCustomer.phone ? (
                    <a
                      href={`tel:${selectedCustomer.phone.replace(
                        /[^\d+]/g,
                        ""
                      )}`}
                      className="flex items-center gap-3 rounded-xl text-sm text-zinc-400 transition hover:text-amber-200"
                    >
                      <Phone
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      {selectedCustomer.phone}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-zinc-700">
                      <Phone
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Telefon nije unet
                    </div>
                  )}

                  {selectedCustomer.email ? (
                    <a
                      href={`mailto:${selectedCustomer.email}`}
                      className="flex items-center gap-3 rounded-xl text-sm text-zinc-400 transition hover:text-amber-200"
                    >
                      <Mail
                        className="h-4 w-4 text-zinc-600"
                        aria-hidden="true"
                      />

                      {selectedCustomer.email}
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 text-sm text-zinc-700">
                      <Mail
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Email nije unet
                    </div>
                  )}
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                    Poslednja poseta
                  </div>

                  <div className="mt-3 text-sm font-medium text-white">
                    {formatDateTime(
                      selectedCustomer.lastVisitAt,
                      timezone
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300/60">
                    Sledeći termin
                  </div>

                  <div className="mt-3 text-sm font-medium text-blue-100">
                    {formatDateTime(
                      selectedCustomer.nextBookingAt,
                      timezone
                    )}
                  </div>
                </article>
              </section>

              <section className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-5">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/60">
                    CRM napomena
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Interna napomena vidljiva samo
                    administratorima salona.
                  </p>
                </div>

                <textarea
                  value={crmNotes}
                  onChange={(event) =>
                    setCrmNotes(event.target.value)
                  }
                  disabled={isPending}
                  maxLength={2000}
                  rows={6}
                  placeholder="Na primer: preferira jutarnje termine, osetljivo teme, omiljena usluga..."
                  className="mt-4 w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950/70 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:cursor-wait disabled:opacity-50"
                />

                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-zinc-600">
                    {crmNotes.length}/2000
                  </span>

                  <button
                    type="button"
                    disabled={
                      isPending ||
                      !crmNotesChanged
                    }
                    onClick={handleSaveNotes}
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

              <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                      Istorija
                    </div>

                    <div className="mt-1 font-semibold text-white">
                      Rezervacije klijenta
                    </div>
                  </div>

                  <div className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs text-zinc-500">
                    {selectedCustomer.bookings.length}
                  </div>
                </div>

                {selectedCustomer.bookings.length ===
                0 ? (
                  <div className="flex min-h-44 flex-col items-center justify-center p-6 text-center">
                    <CalendarDays
                      className="h-6 w-6 text-zinc-700"
                      aria-hidden="true"
                    />

                    <div className="mt-3 text-sm font-medium text-zinc-400">
                      Nema povezanih rezervacija
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.06]">
                    {selectedCustomer.bookings.map(
                      (booking) => (
                        <article
                          key={booking.id}
                          className="p-5"
                        >
                          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <div>
                              <div className="font-semibold text-white">
                                {getServiceName(
                                  booking
                                )}
                              </div>

                              <div className="mt-1 text-sm text-zinc-500">
                                {formatDateTime(
                                  booking.startsAt,
                                  timezone
                                )}
                              </div>
                            </div>

                            <StatusBadge
                              status={booking.status}
                            />
                          </div>

                          <div className="mt-4 grid gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4 text-sm sm:grid-cols-3">
                            <div>
                              <div className="text-xs text-zinc-700">
                                Zaposleni
                              </div>

                              <div className="mt-1 text-zinc-400">
                                {booking.employeeName ??
                                  "Nepoznato"}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-zinc-700">
                                Cena
                              </div>

                              <div className="mt-1 font-medium text-amber-200">
                                {formatPrice(
                                  booking.priceAmount,
                                  booking.currency
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-zinc-700">
                                Izvor
                              </div>

                              <div className="mt-1 text-zinc-400">
                                {
                                  sourceLabels[
                                    booking.source
                                  ]
                                }
                              </div>
                            </div>
                          </div>

                          {booking.customerNote && (
                            <div className="mt-3 rounded-xl border border-blue-400/10 bg-blue-400/[0.035] p-3 text-sm leading-relaxed text-blue-100/70">
                              {booking.customerNote}
                            </div>
                          )}

                          {booking.internalNote && (
                            <div className="mt-3 rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3 text-sm leading-relaxed text-amber-100/70">
                              {booking.internalNote}
                            </div>
                          )}
                        </article>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}