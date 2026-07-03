import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import {
  isLocaleCode,
  normalizeLocaleList,
  type LocaleCode,
} from "@/lib/i18n/locales";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  LocalizedText,
} from "@/lib/types";

export type AdminGalleryBusiness = {
  id: string;
  name: string;
  slug: string;
  defaultLocale: LocaleCode;
  supportedLocales: LocaleCode[];
};

export type AdminGalleryItem = {
  id: string;
  imageUrl: string;
  storagePath: string | null;
  category: string;
  alt: LocalizedText;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AdminGalleryResult = {
  business: AdminGalleryBusiness;
  items: AdminGalleryItem[];

  metrics: {
    total: number;
    active: number;
    hidden: number;
    uploaded: number;
    external: number;
  };
};

type BusinessDatabaseRow = {
  id: string;
  name: string;
  slug: string;
  default_locale: string;
  supported_locales: unknown;
};

type GalleryDatabaseRow = {
  id: string;
  image_url: string;
  storage_path: string | null;
  category: string;
  alt: unknown;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function normalizeContentLocale(
  value: string
): LocaleCode {
  return isLocaleCode(value)
    ? value
    : "en";
}

function normalizeSupportedLocales(
  value: unknown,
  fallback: LocaleCode
): LocaleCode[] {
  const values =
    Array.isArray(value)
      ? value
      : [];

  const locales =
    normalizeLocaleList(
      values,
      fallback
    );

  if (
    !locales.includes(fallback)
  ) {
    locales.unshift(fallback);
  }

  return locales;
}

function normalizeLocalizedText(
  value: unknown
): LocalizedText {
  const normalized:
    LocalizedText = {
      mk: "",
      sq: "",
      en: "",
    };

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return normalized;
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  for (
    const [
      locale,
      translatedValue,
    ] of Object.entries(record)
  ) {
    if (
      isLocaleCode(locale) &&
      typeof translatedValue ===
        "string"
    ) {
      normalized[locale] =
        translatedValue;
    }
  }

  return normalized;
}

export async function getAdminGallery(): Promise<AdminGalleryResult> {
  const admin =
    await requireAdmin();

  const supabase =
    createAdminClient();

  const [
    businessResult,
    galleryResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        `
          id,
          name,
          slug,
          default_locale,
          supported_locales
        `
      )
      .eq(
        "id",
        admin.business.id
      )
      .single(),

    supabase
      .from("gallery_items")
      .select(
        `
          id,
          image_url,
          storage_path,
          category,
          alt,
          sort_order,
          is_active,
          created_at,
          updated_at
        `
      )
      .eq(
        "business_id",
        admin.business.id
      )
      .order(
        "sort_order",
        {
          ascending: true,
        }
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      ),
  ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      "Nije moguće učitati podatke salona za galeriju."
    );
  }

  if (galleryResult.error) {
    throw new Error(
      "Nije moguće učitati galeriju salona."
    );
  }

  const businessRow =
    businessResult.data as unknown as BusinessDatabaseRow;

  const galleryRows =
    (galleryResult.data ??
      []) as unknown as GalleryDatabaseRow[];

  const defaultLocale =
    normalizeContentLocale(
      businessRow.default_locale
    );

  const supportedLocales =
    normalizeSupportedLocales(
      businessRow.supported_locales,
      defaultLocale
    );

  const items =
    galleryRows.map(
      (item): AdminGalleryItem => ({
        id: item.id,
        imageUrl:
          item.image_url,
        storagePath:
          item.storage_path,
        category:
          item.category,
        alt:
          normalizeLocalizedText(
            item.alt
          ),
        sortOrder:
          item.sort_order,
        isActive:
          item.is_active,
        createdAt:
          item.created_at,
        updatedAt:
          item.updated_at,
      })
    );

  const active =
    items.filter(
      (item) =>
        item.isActive
    ).length;

  const uploaded =
    items.filter(
      (item) =>
        Boolean(
          item.storagePath
        )
    ).length;

  return {
    business: {
      id: businessRow.id,
      name: businessRow.name,
      slug: businessRow.slug,
      defaultLocale,
      supportedLocales,
    },

    items,

    metrics: {
      total:
        items.length,
      active,
      hidden:
        items.length -
        active,
      uploaded,
      external:
        items.length -
        uploaded,
    },
  };
}
