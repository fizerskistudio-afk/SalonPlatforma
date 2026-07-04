import type {
  ComponentType,
} from "react";

import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  Mail,
  Pencil,
  Phone,
  PlusCircle,
  Scissors,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  BUSINESS_SLUG_PATTERN,
  getLocalizedValue,
  loadEmployeeManagementData,
} from "@/lib/platform-admin/business-employees";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type BusinessEmployeesPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

export default async function BusinessEmployeesPage({
  params,
}: BusinessEmployeesPageProps) {
  const {
    businessSlug:
      rawBusinessSlug,
  } =
    await params;

  const businessSlug =
    rawBusinessSlug
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    notFound();
  }

  const data =
    await loadEmployeeManagementData(
      businessSlug
    );

  if (!data) {
    notFound();
  }

  const {
    business,
    services,
    employees,
    relations,
  } = data;

  const serviceById =
    new Map(
      services.map(
        (service) => [
          service.id,
          service,
        ] as const
      )
    );

  const serviceIdsByEmployee =
    new Map<
      string,
      string[]
    >();

  for (
    const relation of
    relations
  ) {
    const serviceIds =
      serviceIdsByEmployee.get(
        relation.employee_id
      ) ?? [];

    serviceIds.push(
      relation.service_id
    );

    serviceIdsByEmployee.set(
      relation.employee_id,
      serviceIds
    );
  }

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.is_active
    ).length;

  const employeesWithoutServices =
    employees.filter(
      (employee) =>
        (
          serviceIdsByEmployee.get(
            employee.id
          ) ?? []
        ).length === 0
    ).length;

  return (
    <div
      className="mx-auto max-w-7xl"
    >
      <Link
        href={
          `/platform-admin/businesses/${business.slug}`
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft
          size={17}
        />

        Nazad na kontrolni centar
      </Link>

      <div
        className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <div
            className="flex items-center gap-2 text-sm font-semibold text-amber-300"
          >
            <UsersRound
              size={18}
            />

            Upravljanje timom
          </div>

          <h2
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            Zaposleni
          </h2>

          <p
            className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base"
          >
            {business.name} · dodavanje članova tima, kontakt podaci, status i usluge koje zaposleni može da obavlja.
          </p>
        </div>

        <Link
          href={
            `/platform-admin/businesses/${business.slug}/employees/new`
          }
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
        >
          <PlusCircle
            size={18}
          />

          Dodaj zaposlenog
        </Link>
      </div>

      <section
        className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Ukupno zaposlenih"
          value={
            employees.length
          }
          icon={UsersRound}
        />

        <MetricCard
          label="Aktivni"
          value={
            activeEmployees
          }
          icon={CheckCircle2}
        />

        <MetricCard
          label="Neaktivni"
          value={
            employees.length -
            activeEmployees
          }
          icon={CircleOff}
        />

        <MetricCard
          label="Bez usluga"
          value={
            employeesWithoutServices
          }
          icon={Scissors}
        />
      </section>

      {employees.length > 0 ? (
        <section
          className="mt-8 grid gap-4 xl:grid-cols-2"
        >
          {employees.map(
            (employee) => {
              const serviceIds =
                serviceIdsByEmployee.get(
                  employee.id
                ) ?? [];

              const assignedServices =
                serviceIds
                  .map(
                    (serviceId) =>
                      serviceById.get(
                        serviceId
                      )
                  )
                  .filter(
                    Boolean
                  );

              return (
                <article
                  key={
                    employee.id
                  }
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <div
                    className="p-5 md:p-6"
                  >
                    <div
                      className="flex items-start justify-between gap-4"
                    >
                      <div
                        className="min-w-0"
                      >
                        <div
                          className="flex flex-wrap items-center gap-2"
                        >
                          <h3
                            className="break-words text-lg font-semibold"
                          >
                            {employee.name}
                          </h3>

                          <StatusBadge
                            isActive={
                              employee.is_active
                            }
                          />
                        </div>

                        <p
                          className="mt-1 text-sm text-zinc-400"
                        >
                          {getLocalizedValue(
                            employee.title,
                            business.default_locale
                          ) ||
                            "Pozicija nije uneta"}
                        </p>

                        <p
                          className="mt-1 break-all text-xs text-zinc-600"
                        >
                          /{employee.slug}
                        </p>
                      </div>

                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-zinc-500"
                      >
                        <UserRound
                          size={21}
                        />
                      </div>
                    </div>

                    {employee.phone ||
                    employee.email ? (
                      <div
                        className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-500"
                      >
                        {employee.phone ? (
                          <span
                            className="flex items-center gap-1.5"
                          >
                            <Phone
                              size={14}
                            />

                            {employee.phone}
                          </span>
                        ) : null}

                        {employee.email ? (
                          <span
                            className="flex items-center gap-1.5"
                          >
                            <Mail
                              size={14}
                            />

                            {employee.email}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div
                      className="mt-5"
                    >
                      <div
                        className="flex items-center justify-between gap-3"
                      >
                        <p
                          className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
                        >
                          Dodeljene usluge
                        </p>

                        <span
                          className="rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1 text-xs font-semibold text-amber-200"
                        >
                          {assignedServices.length}
                        </span>
                      </div>

                      {assignedServices.length > 0 ? (
                        <div
                          className="mt-2 flex flex-wrap gap-2"
                        >
                          {assignedServices.map(
                            (service) => (
                              <span
                                key={
                                  service?.id
                                }
                                className="rounded-lg border border-white/10 bg-zinc-950/60 px-2.5 py-1 text-xs text-zinc-400"
                              >
                                {service
                                  ? getLocalizedValue(
                                      service.name,
                                      business.default_locale
                                    )
                                  : "Nepoznata usluga"}
                              </span>
                            )
                          )}
                        </div>
                      ) : (
                        <p
                          className="mt-2 text-sm text-amber-300"
                        >
                          Zaposleni nema dodeljenu aktivnu uslugu.
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="border-t border-white/10 bg-zinc-950/30 p-4 md:px-6"
                  >
                    <div
                      className="grid gap-3 sm:grid-cols-2"
                    >
                      <Link
                        href={
                          `/platform-admin/businesses/${business.slug}/employees/${employee.slug}/schedule`
                        }
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                      >
                        <CalendarClock
                          size={16}
                        />

                        Radno vreme
                      </Link>

                      <Link
                        href={
                          `/platform-admin/businesses/${business.slug}/employees/${employee.slug}/edit`
                        }
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                      >
                        <Pencil
                          size={16}
                        />

                        Uredi zaposlenog
                      </Link>
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </section>
      ) : (
        <section
          className="mt-8 rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center"
        >
          <UsersRound
            size={34}
            className="mx-auto text-zinc-700"
          />

          <h3
            className="mt-4 text-lg font-semibold"
          >
            Salon nema zaposlenih
          </h3>

          <p
            className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500"
          >
            Dodaj prvog člana tima i izaberi usluge koje može da obavlja.
          </p>

          <Link
            href={
              `/platform-admin/businesses/${business.slug}/employees/new`
            }
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <PlusCircle
              size={18}
            />

            Dodaj zaposlenog
          </Link>
        </section>
      )}
    </div>
  );
}

function StatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex",
        "items-center",
        "gap-1.5",
        "rounded-full",
        "border",
        "px-2.5",
        "py-1",
        "text-xs",
        "font-semibold",
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-zinc-400/20 bg-zinc-400/10 text-zinc-500",
      ].join(" ")}
    >
      {isActive ? (
        <CheckCircle2
          size={12}
        />
      ) : (
        <CircleOff
          size={12}
        />
      )}

      {isActive
        ? "Aktivan"
        : "Neaktivan"}
    </span>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon:
    ComponentType<{
      size?: number;
    }>;
}) {
  return (
    <article
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p
            className="text-sm text-zinc-500"
          >
            {label}
          </p>

          <p
            className="mt-2 text-3xl font-semibold"
          >
            {value}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-500"
        >
          <Icon
            size={19}
          />
        </div>
      </div>
    </article>
  );
}
