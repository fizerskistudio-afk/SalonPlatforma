import Link from "next/link";
import {
  notFound,
} from "next/navigation";
import {
  ArrowLeft,
  Images,
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
    businessSlug: string;
  }>;
};

export default async function BusinessBrandingPage({
  params,
}: BusinessBrandingPageProps) {
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

  const data =
    await loadBusinessBrandingData(
      businessSlug
    );

  if (!data) {
    notFound();
  }

  return (
    <div
      className="mx-auto max-w-7xl"
    >
      <Link
        href={
          `/platform-admin/businesses/${data.business.slug}`
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft
          size={17}
        />
        Nazad na kontrolni centar
      </Link>

      <div
        className="mt-6"
      >
        <div
          className="flex items-center gap-2 text-sm font-semibold text-fuchsia-300"
        >
          <Images
            size={18}
          />
          Vizuelni identitet
        </div>

        <h2
          className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Branding i mediji
        </h2>

        <p
          className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base"
        >
          {data.business.name} · logo, hero slika i fotografije zaposlenih koje se prikazuju na javnom profilu.
        </p>
      </div>

      <div
        className="mt-8"
      >
        <BusinessBrandingManager
          initialData={
            data
          }
        />
      </div>
    </div>
  );
}
