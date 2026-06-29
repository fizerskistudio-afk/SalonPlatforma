"use client";

import type { FormEvent } from "react";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BadgeDollarSign,
  CheckCircle2,
  Clock3,
  Eye,
  EyeOff,
  LoaderCircle,
  Save,
  Scissors,
  Settings2,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  removeEmployeeServiceAction,
  saveEmployeeServiceAction,
} from "@/app/admin/(protected)/team/actions";
import type {
  AdminEmployee,
  AdminEmployeeService,
  AdminTeamCatalogService,
} from "@/lib/admin/team";

type EmployeeServiceManagementProps = {
  employees: AdminEmployee[];
  catalogServices: AdminTeamCatalogService[];
};

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

function getPrimaryText(
  value: {
    en?: string;
    mk?: string;
    sq?: string;
  } | null
): string {
  if (!value) {
    return "";
  }

  return (
    value.en?.trim() ||
    value.mk?.trim() ||
    value.sq?.trim() ||
    ""
  );
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("sr-Latn-RS", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCatalogPrice(
  service: AdminTeamCatalogService
): string {
  const priceFrom = formatNumber(service.priceFrom);

  if (
    service.priceType === "range" &&
    service.priceTo !== null
  ) {
    return `${priceFrom} – ${formatNumber(
      service.priceTo
    )}`;
  }

  if (service.priceType === "from") {
    return `Od ${priceFrom}`;
  }

  return priceFrom;
}

function findAssignment(
  employee: AdminEmployee | null,
  serviceId: string
): AdminEmployeeService | null {
  if (!employee || !serviceId) {
    return null;
  }

  return (
    employee.services.find(
      (assignment) =>
        assignment.serviceId === serviceId
    ) ?? null
  );
}

export default function EmployeeServiceManagement({
  employees,
  catalogServices,
}: EmployeeServiceManagementProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState(employees[0]?.id ?? "");

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState(catalogServices[0]?.id ?? "");

  const [
    customDurationMinutes,
    setCustomDurationMinutes,
  ] = useState("");

  const [
    customPriceFrom,
    setCustomPriceFrom,
  ] = useState("");

  const [
    assignmentIsActive,
    setAssignmentIsActive,
  ] = useState(true);

  const [actionMessage, setActionMessage] =
    useState<ActionMessage | null>(null);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.id === selectedEmployeeId
      ) ?? null,
    [employees, selectedEmployeeId]
  );

  const selectedService = useMemo(
    () =>
      catalogServices.find(
        (service) =>
          service.id === selectedServiceId
      ) ?? null,
    [catalogServices, selectedServiceId]
  );

  const existingAssignment = useMemo(
    () =>
      findAssignment(
        selectedEmployee,
        selectedServiceId
      ),
    [selectedEmployee, selectedServiceId]
  );

  const assignedServiceIds = useMemo(
    () =>
      new Set(
        selectedEmployee?.services.map(
          (assignment) =>
            assignment.serviceId
        ) ?? []
      ),
    [selectedEmployee]
  );

  const unassignedServicesCount =
    catalogServices.filter(
      (service) =>
        !assignedServiceIds.has(service.id)
    ).length;

  useEffect(() => {
    if (employees.length === 0) {
      setSelectedEmployeeId("");
      return;
    }

    const employeeStillExists =
      employees.some(
        (employee) =>
          employee.id === selectedEmployeeId
      );

    if (!employeeStillExists) {
      setSelectedEmployeeId(
        employees[0].id
      );
    }
  }, [employees, selectedEmployeeId]);

  useEffect(() => {
    if (catalogServices.length === 0) {
      setSelectedServiceId("");
      return;
    }

    const serviceStillExists =
      catalogServices.some(
        (service) =>
          service.id === selectedServiceId
      );

    if (!serviceStillExists) {
      setSelectedServiceId(
        catalogServices[0].id
      );
    }
  }, [
    catalogServices,
    selectedServiceId,
  ]);

  useEffect(() => {
    if (existingAssignment) {
      setCustomDurationMinutes(
        existingAssignment
          .customDurationMinutes === null
          ? ""
          : String(
              existingAssignment
                .customDurationMinutes
            )
      );

      setCustomPriceFrom(
        existingAssignment.customPriceFrom ===
          null
          ? ""
          : String(
              existingAssignment.customPriceFrom
            )
      );

      setAssignmentIsActive(
        existingAssignment.isActive
      );
    } else {
      setCustomDurationMinutes("");
      setCustomPriceFrom("");
      setAssignmentIsActive(true);
    }

    setActionMessage(null);
  }, [
    existingAssignment,
    selectedEmployeeId,
    selectedServiceId,
  ]);

  const parsedCustomDuration =
    customDurationMinutes.trim().length > 0
      ? Number(customDurationMinutes)
      : null;

  const parsedCustomPrice =
    customPriceFrom.trim().length > 0
      ? Number(customPriceFrom)
      : null;

  const effectiveDuration =
    parsedCustomDuration !== null &&
    Number.isFinite(parsedCustomDuration)
      ? parsedCustomDuration
      : selectedService?.durationMinutes ?? 0;

  const effectivePrice =
    parsedCustomPrice !== null &&
    Number.isFinite(parsedCustomPrice)
      ? formatNumber(parsedCustomPrice)
      : selectedService
        ? formatCatalogPrice(selectedService)
        : "—";

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !selectedEmployee ||
      !selectedService ||
      isPending
    ) {
      return;
    }

    setActionMessage(null);

    startTransition(async () => {
      try {
        const result =
          await saveEmployeeServiceAction({
            employeeId:
              selectedEmployee.id,

            serviceId:
              selectedService.id,

            customDurationMinutes:
              customDurationMinutes.trim()
                ? Number(
                    customDurationMinutes
                  )
                : null,

            customPriceFrom:
              customPriceFrom.trim()
                ? Number(customPriceFrom)
                : null,

            isActive:
              assignmentIsActive,
          });

        setActionMessage({
          type: result.ok
            ? "success"
            : "error",

          text: result.message,
        });

        if (result.ok) {
          router.refresh();
        }
      } catch {
        setActionMessage({
          type: "error",
          text: "Došlo je do greške prilikom čuvanja dodele usluge.",
        });
      }
    });
  };

  const handleRemoveAssignment = () => {
    if (
      !selectedEmployee ||
      !selectedService ||
      !existingAssignment ||
      isPending
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Da li sigurno želiš da ukloniš uslugu „${
        getPrimaryText(
          selectedService.name
        ) || selectedService.slug
      }“ sa profila zaposlenog ${selectedEmployee.name}?`
    );

    if (!confirmed) {
      return;
    }

    setActionMessage(null);

    startTransition(async () => {
      try {
        const result =
          await removeEmployeeServiceAction({
            employeeId:
              selectedEmployee.id,

            serviceId:
              selectedService.id,
          });

        setActionMessage({
          type: result.ok
            ? "success"
            : "error",

          text: result.message,
        });

        if (result.ok) {
          setCustomDurationMinutes("");
          setCustomPriceFrom("");
          setAssignmentIsActive(true);

          router.refresh();
        }
      } catch {
        setActionMessage({
          type: "error",
          text: "Došlo je do greške prilikom uklanjanja dodele.",
        });
      }
    });
  };

  const canManageAssignments =
    employees.length > 0 &&
    catalogServices.length > 0;

  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6 xl:flex-row xl:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <Settings2
                className="h-4 w-4"
                aria-hidden="true"
              />

              Usluge zaposlenih
            </div>

            <h2 className="mt-2 text-xl font-semibold text-white">
              Dodeljivanje usluga
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Odredi koje usluge zaposleni
              obavlja i po potrebi postavi
              posebno trajanje ili cenu.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-zinc-500">
              {selectedEmployee?.services.length ??
                0}{" "}
              dodeljenih
            </span>

            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-zinc-500">
              {unassignedServicesCount}{" "}
              nedodeljenih
            </span>
          </div>
        </div>

        {!canManageAssignments ? (
          <div className="flex min-h-60 flex-col items-center justify-center px-5 py-10 text-center">
            <Scissors
              className="h-7 w-7 text-zinc-700"
              aria-hidden="true"
            />

            <h3 className="mt-4 font-semibold text-white">
              Nema dostupnih podataka
            </h3>

            <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
              Za upravljanje dodelama mora
              postojati najmanje jedan zaposleni
              i najmanje jedna usluga u katalogu.
            </p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-[minmax(18rem,0.75fr)_minmax(0,1.25fr)]">
            <aside className="border-b border-white/[0.07] p-5 xl:border-b-0 xl:border-r xl:p-6">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Zaposleni
                </span>

                <select
                  value={selectedEmployeeId}
                  onChange={(event) =>
                    setSelectedEmployeeId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                >
                  {employees.map((employee) => (
                    <option
                      key={employee.id}
                      value={employee.id}
                    >
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>

              {selectedEmployee && (
                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                      <UserRound
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="truncate font-semibold text-white">
                        {selectedEmployee.name}
                      </div>

                      <div className="mt-1 text-xs text-zinc-600">
                        {selectedEmployee.isActive
                          ? "Aktivan zaposleni"
                          : "Neaktivan zaposleni"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                    Dodeljene usluge
                  </span>

                  <span className="text-xs text-zinc-700">
                    {selectedEmployee?.services
                      .length ?? 0}
                  </span>
                </div>

                {selectedEmployee &&
                selectedEmployee.services.length >
                  0 ? (
                  <div className="mt-3 space-y-2">
                    {selectedEmployee.services.map(
                      (assignment) => {
                        const serviceName =
                          getPrimaryText(
                            assignment.service.name
                          ) ||
                          assignment.service.slug;

                        const isSelected =
                          assignment.serviceId ===
                          selectedServiceId;

                        return (
                          <button
                            key={
                              assignment.serviceId
                            }
                            type="button"
                            onClick={() =>
                              setSelectedServiceId(
                                assignment.serviceId
                              )
                            }
                            className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition ${
                              isSelected
                                ? "border-amber-300/30 bg-amber-300/[0.08]"
                                : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                            }`}
                          >
                            <div className="min-w-0">
                              <div
                                className={`truncate text-sm font-medium ${
                                  isSelected
                                    ? "text-amber-100"
                                    : "text-zinc-300"
                                }`}
                              >
                                {serviceName}
                              </div>

                              <div className="mt-1 truncate text-[10px] text-zinc-700">
                                {getPrimaryText(
                                  assignment.service
                                    .categoryName
                                ) ||
                                  assignment.service
                                    .categorySlug}
                              </div>
                            </div>

                            {assignment.isActive ? (
                              <Eye
                                className="h-4 w-4 flex-shrink-0 text-emerald-400"
                                aria-hidden="true"
                              />
                            ) : (
                              <EyeOff
                                className="h-4 w-4 flex-shrink-0 text-zinc-600"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-white/[0.08] p-4 text-center text-xs text-zinc-700">
                    Zaposleni još nema dodeljene
                    usluge.
                  </div>
                )}
              </div>
            </aside>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              {actionMessage && (
                <div
                  aria-live="polite"
                  className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
                    actionMessage.type ===
                    "success"
                      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                      : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
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

                  <button
                    type="button"
                    onClick={() =>
                      setActionMessage(null)
                    }
                    aria-label="Zatvori poruku"
                    className="flex-shrink-0 opacity-60 transition hover:opacity-100"
                  >
                    <X
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              )}

              <section className="rounded-2xl border border-white/[0.08] bg-black/10 p-5">
                <label className="block">
                  <span className="text-sm font-medium text-zinc-300">
                    Usluga iz kataloga
                  </span>

                  <select
                    value={selectedServiceId}
                    onChange={(event) =>
                      setSelectedServiceId(
                        event.target.value
                      )
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  >
                    {catalogServices.map(
                      (service) => (
                        <option
                          key={service.id}
                          value={service.id}
                        >
                          {getPrimaryText(
                            service.categoryName
                          ) ||
                            service.categorySlug}{" "}
                          —{" "}
                          {getPrimaryText(
                            service.name
                          ) || service.slug}
                          {assignedServiceIds.has(
                            service.id
                          )
                            ? " ✓"
                            : ""}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {selectedService && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                        Standardno trajanje
                      </div>

                      <div className="mt-1 text-sm font-semibold text-white">
                        {
                          selectedService.durationMinutes
                        }{" "}
                        min
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                        Standardna cena
                      </div>

                      <div className="mt-1 text-sm font-semibold text-amber-200">
                        {formatCatalogPrice(
                          selectedService
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
                      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                        Status kataloga
                      </div>

                      <div
                        className={`mt-1 text-sm font-semibold ${
                          selectedService.isActive &&
                          selectedService.categoryIsActive
                            ? "text-emerald-300"
                            : "text-zinc-500"
                        }`}
                      >
                        {selectedService.isActive &&
                        selectedService.categoryIsActive
                          ? "Aktivna"
                          : "Neaktivna"}
                      </div>
                    </div>
                  </div>
                )}
              </section>

              <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:grid-cols-2">
                <label>
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <Clock3
                      className="h-4 w-4 text-zinc-600"
                      aria-hidden="true"
                    />

                    Posebno trajanje
                  </span>

                  <div className="relative mt-2">
                    <input
                      type="number"
                      min="5"
                      max="1440"
                      step="1"
                      value={
                        customDurationMinutes
                      }
                      onChange={(event) =>
                        setCustomDurationMinutes(
                          event.target.value
                        )
                      }
                      placeholder={
                        selectedService
                          ? String(
                              selectedService.durationMinutes
                            )
                          : ""
                      }
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 pr-14 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                      min
                    </span>
                  </div>

                  <p className="mt-2 text-xs leading-relaxed text-zinc-700">
                    Ostavi prazno da se koristi
                    standardno trajanje usluge.
                  </p>
                </label>

                <label>
                  <span className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                    <BadgeDollarSign
                      className="h-4 w-4 text-zinc-600"
                      aria-hidden="true"
                    />

                    Posebna početna cena
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="1000000000"
                    step="0.01"
                    value={customPriceFrom}
                    onChange={(event) =>
                      setCustomPriceFrom(
                        event.target.value
                      )
                    }
                    placeholder={
                      selectedService
                        ? String(
                            selectedService.priceFrom
                          )
                        : ""
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />

                  <p className="mt-2 text-xs leading-relaxed text-zinc-700">
                    Ostavi prazno da se koristi
                    cena iz glavnog kataloga.
                  </p>
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={assignmentIsActive}
                    onChange={(event) =>
                      setAssignmentIsActive(
                        event.target.checked
                      )
                    }
                    className="h-4 w-4 accent-amber-300"
                  />

                  <div>
                    <div className="text-sm font-medium text-zinc-300">
                      Dodela je aktivna
                    </div>

                    <div className="mt-1 text-xs text-zinc-700">
                      Neaktivna dodela ostaje
                      sačuvana, ali se zaposleni ne
                      prikazuje kao opcija za ovu
                      uslugu.
                    </div>
                  </div>
                </label>
              </section>

              <section className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-blue-400/15 bg-blue-400/[0.045] p-4">
                  <div className="text-xs text-blue-300/60">
                    Efektivno trajanje
                  </div>

                  <div className="mt-2 text-xl font-semibold text-blue-100">
                    {effectiveDuration} min
                  </div>
                </article>

                <article className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.045] p-4">
                  <div className="text-xs text-amber-300/60">
                    Efektivna cena
                  </div>

                  <div className="mt-2 text-xl font-semibold text-amber-100">
                    {effectivePrice}
                  </div>
                </article>
              </section>

              {existingAssignment && (
                <div className="rounded-xl border border-blue-400/10 bg-blue-400/[0.035] px-4 py-3 text-xs leading-relaxed text-blue-200/60">
                  Ova usluga je već dodeljena
                  zaposlenom. Čuvanjem menjaš
                  postojeću cenu, trajanje ili
                  status dodele.
                </div>
              )}

              <div className="flex flex-col-reverse justify-between gap-3 border-t border-white/[0.08] pt-5 sm:flex-row">
                <div>
                  {existingAssignment && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={
                        handleRemoveAssignment
                      }
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.055] px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-wait disabled:opacity-40 sm:w-auto"
                    >
                      <Trash2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      Ukloni dodelu
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={
                    isPending ||
                    !selectedEmployee ||
                    !selectedService
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-50"
                >
                  {isPending ? (
                    <LoaderCircle
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Save
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  )}

                  {isPending
                    ? "Čuvanje..."
                    : existingAssignment
                      ? "Sačuvaj dodelu"
                      : "Dodeli uslugu"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}