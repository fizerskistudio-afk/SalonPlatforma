import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Pencil,
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

type EditEmployeePageProps = {
  params: Promise<{
    businessSlug: string;
    employeeSlug: string;
  }>;
};

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  const {
    businessSlug:
      rawBusinessSlug,
    employeeSlug:
      rawEmployeeSlug,
  } =
    await params;

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
    relations,
  } = data;

  const employee =
    employees.find(
      (candidate) =>
        candidate.slug ===
        employeeSlug
    );

  if (!employee) {
    notFound();
  }

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

  const assignedServiceIds =
    relations
      .filter(
        (relation) =>
          relation.employee_id ===
          employee.id
      )
      .map(
        (relation) =>
          relation.service_id
      );

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
          <Pencil
            size={18}
          />

          Uređivanje člana tima
        </div>

        <h2
          className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {employee.name}
        </h2>

        <p
          className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base"
        >
          Promeni podatke, status i dodeljene usluge zaposlenog u salonu {business.name}.
        </p>
      </div>

      <div
        className="mt-8"
      >
        <BusinessEmployeeEditor
          mode="update"
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
            employee.updated_at
          }
          initialEmployee={{
            name:
              employee.name,
            slug:
              employee.slug,
            title:
              getLocalizedValue(
                employee.title,
                business.default_locale
              ),
            bio:
              getLocalizedValue(
                employee.bio,
                business.default_locale
              ),
            email:
              employee.email ?? "",
            phone:
              employee.phone ?? "",
            imageUrl:
              employee.image_url ?? "",
            sortOrder:
              employee.sort_order,
            isActive:
              employee.is_active,
          }}
          initialServiceIds={
            assignedServiceIds
          }
          services={
            serviceOptions
          }
        />
      </div>
    </div>
  );
}
