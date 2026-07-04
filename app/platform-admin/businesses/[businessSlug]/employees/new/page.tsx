import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  UserPlus,
} from "lucide-react";

import BusinessEmployeeEditor from "@/components/platform-admin/BusinessEmployeeEditor";

import {
  BUSINESS_SLUG_PATTERN,
  formatEmployeeServicePrice,
  getLocalizedValue,
  loadEmployeeManagementData,
} from "@/lib/platform-admin/business-employees";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type NewEmployeePageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

export default async function NewEmployeePage({
  params,
}: NewEmployeePageProps) {
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
    categories,
    services,
    employees,
  } = data;

  const categoryById =
    new Map(
      categories.map(
        (category) => [
          category.id,
          category,
        ] as const
      )
    );

  const serviceOptions =
    services.map(
      (service) => {
        const category =
          categoryById.get(
            service.category_id
          );

        return {
          id: service.id,
          categoryId:
            service.category_id,
          categoryName:
            category
              ? getLocalizedValue(
                  category.name,
                  business.default_locale
                ) || category.slug
              : "Ostalo",
          name:
            getLocalizedValue(
              service.name,
              business.default_locale
            ) || service.slug,
          helper:
            `${service.duration_minutes} min · ${formatEmployeeServicePrice(
              service,
              business.currency
            )}`,
        };
      }
    );

  const nextSortOrder =
    employees.reduce(
      (
        maximum,
        employee
      ) =>
        Math.max(
          maximum,
          employee.sort_order
        ),
      -10
    ) + 10;

  const backPath =
    `/platform-admin/businesses/${business.slug}/employees`;

  return (
    <div
      className="mx-auto max-w-5xl"
    >
      <Link
        href={
          backPath
        }
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft
          size={17}
        />

        Nazad na zaposlene
      </Link>

      <div
        className="mt-6"
      >
        <div
          className="flex items-center gap-2 text-sm font-semibold text-amber-300"
        >
          <UserPlus
            size={18}
          />

          Novi član tima
        </div>

        <h2
          className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
        >
          Dodaj zaposlenog
        </h2>

        <p
          className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base"
        >
          Unesi osnovne podatke za {business.name} i odmah izaberi usluge koje novi zaposleni može da obavlja.
        </p>
      </div>

      <div
        className="mt-8"
      >
        <BusinessEmployeeEditor
          mode="create"
          businessSlug={
            business.slug
          }
          businessName={
            business.name
          }
          defaultLocale={
            business.default_locale
          }
          expectedUpdatedAt={
            null
          }
          initialEmployee={{
            name: "",
            slug: "",
            title: "Berberin",
            bio: "",
            email: "",
            phone: "",
            imageUrl: "",
            sortOrder:
              Math.max(
                0,
                nextSortOrder
              ),
            isActive: true,
          }}
          initialServiceIds={
            serviceOptions.map(
              (service) =>
                service.id
            )
          }
          services={
            serviceOptions
          }
        />
      </div>
    </div>
  );
}
