import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarX2,
  Clock3,
  UsersRound,
} from "lucide-react";

import BusinessTimeOffManager from "@/components/platform-admin/BusinessTimeOffManager";
import {
  BUSINESS_TIME_OFF_SLUG_PATTERN,
  loadBusinessTimeOffData,
} from "@/lib/platform-admin/business-time-off";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

function getPart(
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes
): string {
  return parts.find((part) => part.type === type)
    ?.value ?? "";
}

function toLocalInput(
  value: string,
  timeZone: string
): string {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }
  ).formatToParts(new Date(value));

  return `${getPart(parts, "year")}-${getPart(
    parts,
    "month"
  )}-${getPart(parts, "day")}T${getPart(
    parts,
    "hour"
  )}:${getPart(parts, "minute")}`;
}

function formatDateTime(
  value: string,
  timeZone: string
): string {
  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      timeZone,
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

export default async function BusinessTimeOffPage({
  params,
}: PageProps) {
  const { businessSlug: rawBusinessSlug } =
    await params;
  const businessSlug = rawBusinessSlug
    .trim()
    .toLowerCase();

  if (
    !BUSINESS_TIME_OFF_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    notFound();
  }

  const data = await loadBusinessTimeOffData(
    businessSlug
  );

  if (!data) {
    notFound();
  }

  const {
    business,
    employees,
    blocks,
    loadedAt,
  } = data;
  const employeeById = new Map(
    employees.map((employee) => [
      employee.id,
      employee,
    ])
  );
  const businessWideCount = blocks.filter(
    (block) => block.employee_id === null
  ).length;
  const employeeCount = blocks.length -
    businessWideCount;
  const now = new Date(loadedAt).getTime();
  const activeNow = blocks.filter(
    (block) =>
      new Date(block.starts_at).getTime() <= now &&
      new Date(block.ends_at).getTime() > now
  ).length;

  const blockOptions = blocks.map((block) => {
    const employee = block.employee_id
      ? employeeById.get(block.employee_id) ?? null
      : null;

    return {
      id: block.id,
      employeeSlug: employee?.slug ?? null,
      employeeName: employee?.name ?? null,
      blockType: block.block_type,
      startsLocal: toLocalInput(
        block.starts_at,
        business.timezone
      ),
      endsLocal: toLocalInput(
        block.ends_at,
        business.timezone
      ),
      startsLabel: formatDateTime(
        block.starts_at,
        business.timezone
      ),
      endsLabel: formatDateTime(
        block.ends_at,
        business.timezone
      ),
      reason: block.reason ?? "",
      updatedAt: block.updated_at,
      isOngoing:
        new Date(block.starts_at).getTime() <= now &&
        new Date(block.ends_at).getTime() > now,
    };
  });

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href={`/platform-admin/businesses/${business.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Nazad na kontrolni centar
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <CalendarX2 size={18} />
          Availability kontrola
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Odsustva i blokade
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
          {business.name} · vremenska zona {business.timezone}. Blokada salona uklanja termine svim zaposlenima, dok employee blokada utiče samo na izabranog člana tima.
        </p>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Buduće i aktivne"
          value={blocks.length}
          icon={CalendarX2}
        />
        <MetricCard
          label="Ceo salon"
          value={businessWideCount}
          icon={Building2}
        />
        <MetricCard
          label="Zaposleni"
          value={employeeCount}
          icon={UsersRound}
        />
        <MetricCard
          label="Aktivno sada"
          value={activeNow}
          icon={Clock3}
        />
      </section>

      <div className="mt-8">
        <BusinessTimeOffManager
          businessSlug={business.slug}
          businessName={business.name}
          timezone={business.timezone}
          employees={employees.map((employee) => ({
            slug: employee.slug,
            name: employee.name,
            isActive: employee.is_active,
          }))}
          blocks={blockOptions}
        />
      </div>
    </div>
  );
}

type IconType = typeof CalendarX2;

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: IconType;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-zinc-500">
          {label}
        </p>
        <Icon size={18} className="text-zinc-600" />
      </div>
      <p className="mt-3 text-2xl font-semibold">
        {value}
      </p>
    </article>
  );
}
