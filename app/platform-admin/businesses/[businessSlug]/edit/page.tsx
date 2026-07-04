import Link from "next/link";

import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Building2,
} from "lucide-react";

import BusinessProfileEditor from "@/components/platform-admin/BusinessProfileEditor";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type BusinessEditPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

type BusinessRow = {
  slug: string;
  name: string;
  tagline: unknown;
  description: unknown;
  address: unknown;
  city: unknown;
  country: unknown;
  phone: string | null;
  email: string | null;
  default_locale: string;
  is_active: boolean;
  updated_at: string;
};

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (
    typeof value ===
    "string"
  ) {
    return value.trim();
  }

  if (
    !isRecord(
      value
    )
  ) {
    return "";
  }

  const preferredValue =
    value[
      preferredLocale
    ];

  if (
    typeof preferredValue ===
      "string"
  ) {
    return preferredValue;
  }

  const fallbackLocales = [
    "sr-Latn",
    "en",
    "mk",
    "sq",
  ];

  for (
    const fallbackLocale of
    fallbackLocales
  ) {
    const fallbackValue =
      value[
        fallbackLocale
      ];

    if (
      typeof fallbackValue ===
      "string"
    ) {
      return fallbackValue;
    }
  }

  for (
    const candidateValue of
    Object.values(
      value
    )
  ) {
    if (
      typeof candidateValue ===
      "string"
    ) {
      return candidateValue;
    }
  }

  return "";
}

async function loadBusiness(
  businessSlug: string
): Promise<BusinessRow | null> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "businesses"
    )
    .select(
      `
        slug,
        name,
        tagline,
        description,
        address,
        city,
        country,
        phone,
        email,
        default_locale,
        is_active,
        updated_at
      `
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to load business edit page:",
      error
    );

    throw new Error(
      "Salon nije moguće učitati za uređivanje."
    );
  }

  if (!data) {
    return null;
  }

  return data as
    unknown as
    BusinessRow;
}

export default async function BusinessEditPage({
  params,
}: BusinessEditPageProps) {
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

  const business =
    await loadBusiness(
      businessSlug
    );

  if (!business) {
    notFound();
  }

  return (
    <div
      className="mx-auto max-w-5xl"
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

        Nazad na pregled salona
      </Link>

      <div
        className="mt-6"
      >
        <div
          className="flex items-center gap-2 text-sm font-semibold text-amber-300"
        >
          <Building2
            size={17}
          />

          Uređivanje tenant profila
        </div>

        <h2
          className="mt-3 break-words text-3xl font-semibold tracking-tight md:text-4xl"
        >
          {business.name}
        </h2>

        <p
          className="mt-2 break-all text-sm text-zinc-500"
        >
          /{business.slug}
        </p>

        <p
          className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base"
        >
          Menjaš osnovne javne podatke salona na glavnom jeziku sadržaja. Slug, jezici, valuta i vremenska zona za sada ostaju zaključani.
        </p>
      </div>

      <div
        className="mt-8"
      >
        <BusinessProfileEditor
          businessSlug={
            business.slug
          }
          defaultLocale={
            business.default_locale
          }
          expectedUpdatedAt={
            business.updated_at
          }
          initialProfile={{
            name:
              business.name,

            phone:
              business.phone ??
              "",

            email:
              business.email ??
              "",

            tagline:
              getLocalizedValue(
                business.tagline,
                business.default_locale
              ),

            description:
              getLocalizedValue(
                business.description,
                business.default_locale
              ),

            address:
              getLocalizedValue(
                business.address,
                business.default_locale
              ),

            city:
              getLocalizedValue(
                business.city,
                business.default_locale
              ),

            country:
              getLocalizedValue(
                business.country,
                business.default_locale
              ),

            isActive:
              business.is_active,
          }}
        />
      </div>
    </div>
  );
}
