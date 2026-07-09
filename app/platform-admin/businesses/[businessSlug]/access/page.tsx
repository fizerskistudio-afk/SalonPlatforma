import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

import BusinessOwnerAccessManager from "@/components/platform-admin/BusinessOwnerAccessManager";
import BusinessOwnerCredentialManager from "@/components/platform-admin/BusinessOwnerCredentialManager";

import {
  getBusinessAccessPageData,
} from "@/lib/platform-admin/business-access-server";

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessAccessPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

export default async function BusinessAccessPage({
  params,
}: BusinessAccessPageProps) {
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
    await getBusinessAccessPageData(
      businessSlug
    );

  if (!data) {
    notFound();
  }

  const {
    business,
    owners,
    activeOwnerCount,
  } = data;

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href={`/platform-admin/businesses/${business.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft
          size={17}
        />

        Nazad na tenant
      </Link>

      <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
            <KeyRound
              size={18}
            />

            Tenant access
          </div>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            Owner pristup za {business.name}
          </h1>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
            Platform-admin ovde kreira prvog vlasnika, povezuje postojeći nalog i kontroliše aktivni owner pristup za tenant{" "}
            <span className="font-semibold text-zinc-200">
              {business.slug}
            </span>.
          </p>
        </div>

        <a
          href="/admin/login"
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          Otvori owner login
          <ExternalLink
            size={16}
          />
        </a>
      </div>

      <section className="mt-7 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Owner članstva"
          value={
            String(
              owners.length
            )
          }
          icon={
            ShieldCheck
          }
        />

        <SummaryCard
          label="Aktivni owneri"
          value={
            String(
              activeOwnerCount
            )
          }
          icon={
            UserRoundCheck
          }
        />

        <SummaryCard
          label="Tenant status"
          value={
            business.isActive
              ? "Aktivan"
              : "Isključen"
          }
          icon={
            KeyRound
          }
        />
      </section>

      <div className="mt-7">
        <BusinessOwnerCredentialManager
          businessSlug={
            business.slug
          }
          businessName={
            business.name
          }
          owners={
            owners
          }
        />
      </div>

      <div className="mt-7">
        <BusinessOwnerAccessManager
          businessSlug={
            business.slug
          }
          businessName={
            business.name
          }
          owners={
            owners
          }
          activeOwnerCount={
            activeOwnerCount
          }
          adminLoginPath="/admin/login"
        />
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon:
    Icon,
}: {
  label: string;
  value: string;
  icon:
    typeof KeyRound;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">
            {label}
          </p>

          <p className="mt-3 text-2xl font-semibold">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-zinc-200">
          <Icon
            size={20}
          />
        </div>
      </div>
    </article>
  );
}
