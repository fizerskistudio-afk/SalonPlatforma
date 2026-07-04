import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  CalendarClock,
  CircleOff,
} from "lucide-react";

import BusinessEmployeeScheduleEditor from "@/components/platform-admin/BusinessEmployeeScheduleEditor";

import {
  BUSINESS_SLUG_PATTERN,
  getLocalizedValue,
} from "@/lib/platform-admin/business-employees";

import {
  loadEmployeeScheduleData,
} from "@/lib/platform-admin/business-employee-schedule-server";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

type Props = {
  params: Promise<{
    businessSlug: string;
    employeeSlug: string;
  }>;
};

export default async function EmployeeSchedulePage({
  params,
}: Props) {
  const {
    businessSlug:
      rawBusinessSlug,
    employeeSlug:
      rawEmployeeSlug,
  } = await params;

  const businessSlug =
    rawBusinessSlug
      .trim()
      .toLowerCase();

  const employeeSlug =
    rawEmployeeSlug
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    ) ||
    !BUSINESS_SLUG_PATTERN.test(
      employeeSlug
    )
  ) {
    notFound();
  }

  const data =
    await loadEmployeeScheduleData(
      businessSlug,
      employeeSlug
    );

  if (!data) {
    notFound();
  }

  const {
    business,
    employee,
    salonHours,
    employeeHours,
    usesBusinessHours,
  } = data;

  const employeeTitle =
    getLocalizedValue(
      employee.title,
      business.default_locale
    );

  const backPath =
    `/platform-admin/businesses/${business.slug}/employees`;

  return (
    <div
      className="mx-auto max-w-5xl"
    >
      <Link
        href={backPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft
          size={17}
        />

        Nazad na zaposlene
      </Link>

      <div
        className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <div
            className="flex items-center gap-2 text-sm font-semibold text-amber-300"
          >
            <CalendarClock
              size={18}
            />

            Individualni raspored
          </div>

          <h2
            className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
          >
            {employee.name}
          </h2>

          <p
            className="mt-2 text-sm text-zinc-500"
          >
            {employeeTitle ||
              "Pozicija nije uneta"} · {business.name}
          </p>
        </div>

        {!employee.is_active ? (
          <div
            className="inline-flex items-center gap-2 rounded-full border border-zinc-400/20 bg-zinc-400/10 px-3 py-1.5 text-xs font-semibold text-zinc-400"
          >
            <CircleOff
              size={14}
            />

            Zaposleni je neaktivan
          </div>
        ) : null}
      </div>

      <p
        className="mt-5 max-w-3xl text-sm leading-6 text-zinc-400"
      >
        Kada zaposleni nasleđuje salon, svaka izmena salonskog rasporeda automatski važi i za njega. Poseban raspored potpuno zamenjuje salonski raspored za tog zaposlenog.
      </p>

      <div
        className="mt-8"
      >
        <BusinessEmployeeScheduleEditor
          businessSlug={
            business.slug
          }
          employeeSlug={
            employee.slug
          }
          employeeName={
            employee.name
          }
          initialUseBusinessHours={
            usesBusinessHours
          }
          salonHours={
            salonHours
          }
          initialWorkingHours={
            employeeHours
          }
        />
      </div>
    </div>
  );
}
