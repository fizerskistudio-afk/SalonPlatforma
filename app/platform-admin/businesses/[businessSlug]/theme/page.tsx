import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Palette,
} from "lucide-react";

import BusinessThemeManager from "@/components/platform-admin/BusinessThemeManager";

import {
  requirePlatformAdmin,
} from "@/lib/auth/platform-admin";

import {
  loadBusinessThemeData,
} from "@/lib/platform-admin/business-theme-server";

import {
  buildBusinessPublicLinks,
} from "@/lib/platform-admin/business-public-links";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessThemePageProps = {
  params: Promise<{
    businessSlug:
      string;
  }>;
};

export default async function BusinessThemePage({
  params,
}: BusinessThemePageProps) {
  await requirePlatformAdmin();

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
    await loadBusinessThemeData(
      businessSlug
    );

  if (!data) {
    notFound();
  }

  const publicLinks =
    buildBusinessPublicLinks(
      data.business.slug
    );

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href={`/platform-admin/businesses/${data.business.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft
          size={17}
        />
        Nazad na kontrolni centar
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <Palette
            size={18}
          />
          Theme sistem
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Public theme pack
        </h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
          Izbor javnog izgleda bez menjanja booking engine-a, usluga ili tenant podataka.
        </p>
      </div>

      <div className="mt-8">
        <BusinessThemeManager
          initialData={
            data
          }
          publicUrl={
            publicLinks.publicUrl
          }
        />
      </div>
    </div>
  );
}
