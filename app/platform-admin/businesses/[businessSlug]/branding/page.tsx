import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Images,
  Palette,
} from "lucide-react";

import BusinessBrandingManager from "@/components/platform-admin/BusinessBrandingManager";

import {
  loadBusinessBrandingData,
} from "@/lib/platform-admin/business-branding-server";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessBrandingPageProps = {
  params: Promise<{
    businessSlug:
      string;
  }>;
};

export default async function BusinessBrandingPage({
  params,
}: BusinessBrandingPageProps) {
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
    await loadBusinessBrandingData(
      businessSlug
    );

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/platform-admin/businesses/${data.business.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft
            size={17}
          />
          Nazad na kontrolni centar
        </Link>

        <Link
          href={`/platform-admin/businesses/${data.business.slug}/theme`}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:border-amber-300/35 hover:bg-amber-300/15"
        >
          <Palette
            size={16}
          />
          Izaberi theme pack
        </Link>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300">
          <Images
            size={18}
          />
          Vizuelni identitet
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Branding i mediji
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
          {data.business.name} · logo, hero slika i fotografije zaposlenih koje se prikazuju na javnom profilu.
        </p>
      </div>

      <div className="mt-8">
        <BusinessBrandingManager
          initialData={
            data
          }
        />
      </div>
    </div>
  );
}
