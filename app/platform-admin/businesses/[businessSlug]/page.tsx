import {
  notFound,
} from "next/navigation";

import {
  Eye,
  Globe2,
  Rocket,
  ShieldCheck,
} from "lucide-react";

import BusinessPackageManager from "@/components/platform-admin/BusinessPackageManager";
import BusinessPublicLinkActions from "@/components/platform-admin/BusinessPublicLinkActions";
import BusinessPublicationControls from "@/components/platform-admin/BusinessPublicationControls";
import TenantReadinessCard from "@/components/platform-admin/TenantReadinessCard";
import {
  buildBusinessPublicLinks,
} from "@/lib/platform-admin/business-public-links";
import {
  loadBusinessPackageContext,
} from "@/lib/platform-admin/business-package-server";
import {
  loadTenantLifecycleContext,
} from "@/lib/platform-admin/tenant-lifecycle-server";
import {
  BUSINESS_PUBLICATION_LABELS,
  isBusinessPubliclyAvailable,
} from "@/lib/publishing/status";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessManagementPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

function formatUpdatedAt(
  value: string
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
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

function ReadinessMetric({
  label,
  value,
  detail,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone:
    | "green"
    | "blue"
    | "amber"
    | "neutral";
  icon: typeof Eye;
}) {
  const toneClasses = {
    green:
      "border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-200",
    blue:
      "border-sky-300/15 bg-sky-300/[0.06] text-sky-200",
    amber:
      "border-amber-300/15 bg-amber-300/[0.06] text-amber-100",
    neutral:
      "border-white/10 bg-white/[0.03] text-zinc-200",
  } as const;

  return (
    <div
      className={`rounded-2xl border p-4 ${toneClasses[tone]}`}
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">
        <Icon
          size={15}
          aria-hidden="true"
        />
        {label}
      </div>
      <p className="mt-3 text-lg font-semibold">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-zinc-500">
        {detail}
      </p>
    </div>
  );
}

export default async function BusinessManagementPage({
  params,
}: BusinessManagementPageProps) {
  const {
    businessSlug:
      rawBusinessSlug,
  } = await params;
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

  const [
    lifecycle,
    packageContext,
  ] = await Promise.all([
    loadTenantLifecycleContext(
      businessSlug
    ),
    loadBusinessPackageContext(
      businessSlug
    ),
  ]);

  if (
    !lifecycle ||
    !packageContext
  ) {
    notFound();
  }

  const {
    business,
    readiness,
  } = lifecycle;
  const publicLinks =
    buildBusinessPublicLinks(
      business.slug
    );
  const publiclyAvailable =
    isBusinessPubliclyAvailable(
      business.publicationStatus,
      business.isActive
    );

  return (
    <main className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-300">
            Pregled tenant-a
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Operativno stanje
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
            Jedno mesto za readiness, lifecycle, javni URL i sledeći korak. Detaljno uređivanje je organizovano kroz Branding, Temu, Pristup i Operacije.
          </p>
        </div>

        <div className="w-full xl:max-w-xl">
          <BusinessPublicLinkActions
            publicUrl={
              publicLinks.publicUrl
            }
            isActive={
              publiclyAvailable
            }
          />
        </div>
      </div>

      <section
        aria-label="Tenant sažetak"
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <ReadinessMetric
          label="Lifecycle"
          value={
            BUSINESS_PUBLICATION_LABELS[
              business.publicationStatus
            ]
          }
          detail="Autoritativni javni status"
          tone={
            publiclyAvailable
              ? "green"
              : "neutral"
          }
          icon={Globe2}
        />
        <ReadinessMetric
          label="Preview"
          value={
            readiness.previewReady
              ? "Spreman"
              : "Blokiran"
          }
          detail="Technical + content kriterijumi"
          tone={
            readiness.previewReady
              ? "blue"
              : "amber"
          }
          icon={Eye}
        />
        <ReadinessMetric
          label="Production"
          value={
            readiness.productionReady
              ? "Spreman"
              : `${readiness.blockers.length} blokatora`
          }
          detail="Booking + owner access uključeni"
          tone={
            readiness.productionReady
              ? "green"
              : "amber"
          }
          icon={Rocket}
        />
        <ReadinessMetric
          label="Poslednja izmena"
          value={
            formatUpdatedAt(
              business.updatedAt
            )
          }
          detail="Verzija za optimistic concurrency"
          tone="neutral"
          icon={ShieldCheck}
        />
      </section>

      <BusinessPackageManager
        businessSlug={
          business.slug
        }
        initialPackageKey={
          packageContext
            .access
            .packageKey
        }
        initialContractVersion={
          packageContext
            .access
            .contractVersion
        }
        initialAssignedAt={
          packageContext
            .packageAssignedAt
        }
        initialRequiresAttention={
          packageContext
            .access
            .requiresAttention
        }
        expectedUpdatedAt={
          packageContext
            .updatedAt
        }
      />

      <TenantReadinessCard
        publicationStatus={
          business.publicationStatus
        }
        readiness={
          readiness
        }
      />

      <BusinessPublicationControls
        businessSlug={
          business.slug
        }
        initialStatus={
          business.publicationStatus
        }
        expectedUpdatedAt={
          business.updatedAt
        }
        readiness={
          readiness
        }
        previewUrl={
          publicLinks.previewUrl
        }
      />
    </main>
  );
}
