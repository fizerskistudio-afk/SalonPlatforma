import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Scissors,
} from "lucide-react";

import BusinessCatalogManager from "@/components/platform-admin/BusinessCatalogManager";

import {
  BUSINESS_SLUG_PATTERN,
  getLocalizedValue,
  loadBusinessCatalogData,
  toCatalogNumber,
} from "@/lib/platform-admin/business-catalog";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type BusinessCatalogPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

export default async function BusinessCatalogPage({
  params,
}: BusinessCatalogPageProps) {
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
    await loadBusinessCatalogData(
      businessSlug
    );

  if (
    !data
  ) {
    notFound();
  }

  const {
    business,
    categories,
    services,
  } = data;

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
        className="mt-6"
      >
        <div
          className="flex items-center gap-2 text-sm font-semibold text-amber-300"
        >
          <Scissors
            size={18}
          />

          Upravljanje katalogom
        </div>

        <h2
          className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Kategorije i usluge
        </h2>

        <p
          className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base"
        >
          {business.name} · uređivanje javnog kataloga, trajanja usluga, cena, redosleda i aktivnog statusa.
        </p>
      </div>

      <BusinessCatalogManager
        businessSlug={
          business.slug
        }
        businessName={
          business.name
        }
        defaultLocale={
          business.default_locale
        }
        currency={
          business.currency
        }
        categories={
          categories.map(
            (category) => ({
              id:
                category.id,
              slug:
                category.slug,
              name:
                getLocalizedValue(
                  category.name,
                  business.default_locale
                ),
              description:
                getLocalizedValue(
                  category.description,
                  business.default_locale
                ),
              iconKey:
                category.icon_key ??
                "",
              sortOrder:
                category.sort_order,
              isActive:
                category.is_active,
              updatedAt:
                category.updated_at,
            })
          )
        }
        services={
          services.map(
            (service) => ({
              id:
                service.id,
              categoryId:
                service.category_id,
              slug:
                service.slug,
              name:
                getLocalizedValue(
                  service.name,
                  business.default_locale
                ),
              description:
                getLocalizedValue(
                  service.description,
                  business.default_locale
                ),
              durationMinutes:
                service.duration_minutes,
              priceType:
                service.price_type,
              priceFrom:
                toCatalogNumber(
                  service.price_from
                ) ?? 0,
              priceTo:
                toCatalogNumber(
                  service.price_to
                ),
              sortOrder:
                service.sort_order,
              isActive:
                service.is_active,
              updatedAt:
                service.updated_at,
            })
          )
        }
      />
    </div>
  );
}
