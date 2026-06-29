"use server";

import { revalidatePath } from "next/cache";

import {
  SERVICE_PRICE_TYPES,
  type ServicePriceType,
} from "@/lib/admin/services";
import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type ServiceCatalogActionResult = {
  ok: boolean;
  message: string;
  entityId?: string;
};

export type LocalizedTextInput = {
  en: string;
  mk: string;
  sq: string;
};

export type SaveServiceCategoryInput = {
  categoryId?: string;

  slug: string;
  name: LocalizedTextInput;
  description: LocalizedTextInput;

  iconKey?: string;
  sortOrder: number;
  isActive: boolean;
};

export type SaveServiceInput = {
  serviceId?: string;

  categoryId: string;
  slug: string;

  name: LocalizedTextInput;
  description: LocalizedTextInput;

  durationMinutes: number;

  priceType: ServicePriceType;
  priceFrom: number;
  priceTo?: number | null;

  sortOrder: number;
  isActive: boolean;
};

export type SetCategoryActiveInput = {
  categoryId: string;
  isActive: boolean;
};

export type SetServiceActiveInput = {
  serviceId: string;
  isActive: boolean;
};

type EntityRow = {
  id: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeLocalizedText(
  value: LocalizedTextInput
): LocalizedTextInput {
  return {
    en: normalizeText(value.en),
    mk: normalizeText(value.mk),
    sq: normalizeText(value.sq),
  };
}

function hasLocalizedName(
  value: LocalizedTextInput
): boolean {
  return Boolean(value.en || value.mk || value.sq);
}

function localizedTextIsTooLong(
  value: LocalizedTextInput,
  maximumLength: number
): boolean {
  return Object.values(value).some(
    (text) => text.length > maximumLength
  );
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function isValidSortOrder(value: number): boolean {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 100000
  );
}

function isValidPriceType(
  value: string
): value is ServicePriceType {
  return SERVICE_PRICE_TYPES.includes(
    value as ServicePriceType
  );
}

function refreshCatalogPages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/services");
}

export async function saveServiceCategoryAction(
  input: SaveServiceCategoryInput
): Promise<ServiceCatalogActionResult> {
  const admin = await requireAdmin();

  const categoryId =
    input.categoryId?.trim() ?? "";

  if (categoryId && !isUuid(categoryId)) {
    return {
      ok: false,
      message: "Kategorija nema ispravan ID.",
    };
  }

  const name = normalizeLocalizedText(input.name);

  const description = normalizeLocalizedText(
    input.description
  );

  if (!hasLocalizedName(name)) {
    return {
      ok: false,
      message:
        "Unesi naziv kategorije na najmanje jednom jeziku.",
    };
  }

  if (localizedTextIsTooLong(name, 160)) {
    return {
      ok: false,
      message:
        "Naziv kategorije može imati najviše 160 karaktera po jeziku.",
    };
  }

  if (
    localizedTextIsTooLong(description, 2000)
  ) {
    return {
      ok: false,
      message:
        "Opis kategorije može imati najviše 2000 karaktera po jeziku.",
    };
  }

  const slug = normalizeSlug(input.slug);

  if (slug.length < 2) {
    return {
      ok: false,
      message:
        "Unesi slug koristeći latinicu, brojeve ili crtice.",
    };
  }

  if (slug.length > 120) {
    return {
      ok: false,
      message:
        "Slug može imati najviše 120 karaktera.",
    };
  }

  if (!isValidSortOrder(input.sortOrder)) {
    return {
      ok: false,
      message:
        "Redosled kategorije mora biti ceo broj od 0 do 100000.",
    };
  }

  const iconKey =
    input.iconKey?.trim() || null;

  if (
    iconKey &&
    iconKey.length > 100
  ) {
    return {
      ok: false,
      message:
        "Naziv ikonice može imati najviše 100 karaktera.",
    };
  }

  const supabase = await createClient();

  let duplicateQuery = supabase
    .from("service_categories")
    .select("id")
    .eq("business_id", admin.business.id)
    .eq("slug", slug);

  if (categoryId) {
    duplicateQuery = duplicateQuery.neq(
      "id",
      categoryId
    );
  }

  const {
    data: duplicateCategory,
    error: duplicateError,
  } = await duplicateQuery
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return {
      ok: false,
      message:
        "Nije moguće proveriti slug kategorije.",
    };
  }

  if (duplicateCategory) {
    return {
      ok: false,
      message:
        "Kategorija sa ovim slugom već postoji.",
    };
  }

  const payload = {
    business_id: admin.business.id,
    slug,
    name,
    description,
    icon_key: iconKey,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  };

  if (categoryId) {
    const {
      data: categoryData,
      error: categoryError,
    } = await supabase
      .from("service_categories")
      .update(payload)
      .eq("id", categoryId)
      .eq("business_id", admin.business.id)
      .select("id")
      .single();

    if (categoryError || !categoryData) {
      return {
        ok: false,
        message:
          "Kategorija nije sačuvana. Proveri podatke i pokušaj ponovo.",
      };
    }

    const category =
      categoryData as unknown as EntityRow;

    refreshCatalogPages();

    return {
      ok: true,
      entityId: category.id,
      message:
        "Kategorija je uspešno sačuvana.",
    };
  }

  const {
    data: categoryData,
    error: categoryError,
  } = await supabase
    .from("service_categories")
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (categoryError || !categoryData) {
    return {
      ok: false,
      message:
        "Kategorija nije dodata. Proveri podatke i pokušaj ponovo.",
    };
  }

  const category =
    categoryData as unknown as EntityRow;

  refreshCatalogPages();

  return {
    ok: true,
    entityId: category.id,
    message:
      "Nova kategorija je uspešno dodata.",
  };
}

export async function setServiceCategoryActiveAction(
  input: SetCategoryActiveInput
): Promise<ServiceCatalogActionResult> {
  const admin = await requireAdmin();

  const categoryId =
    input.categoryId.trim();

  if (!isUuid(categoryId)) {
    return {
      ok: false,
      message: "Kategorija nema ispravan ID.",
    };
  }

  const supabase = await createClient();

  const {
    data: categoryData,
    error: categoryError,
  } = await supabase
    .from("service_categories")
    .update({
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", categoryId)
    .eq("business_id", admin.business.id)
    .select("id")
    .single();

  if (categoryError || !categoryData) {
    return {
      ok: false,
      message:
        "Status kategorije nije promenjen.",
    };
  }

  const category =
    categoryData as unknown as EntityRow;

  refreshCatalogPages();

  return {
    ok: true,
    entityId: category.id,
    message: input.isActive
      ? "Kategorija je aktivirana."
      : "Kategorija je deaktivirana.",
  };
}

export async function saveServiceAction(
  input: SaveServiceInput
): Promise<ServiceCatalogActionResult> {
  const admin = await requireAdmin();

  const serviceId =
    input.serviceId?.trim() ?? "";

  const categoryId =
    input.categoryId.trim();

  if (serviceId && !isUuid(serviceId)) {
    return {
      ok: false,
      message: "Usluga nema ispravan ID.",
    };
  }

  if (!isUuid(categoryId)) {
    return {
      ok: false,
      message:
        "Izabrana kategorija nije ispravna.",
    };
  }

  const name = normalizeLocalizedText(input.name);

  const description = normalizeLocalizedText(
    input.description
  );

  if (!hasLocalizedName(name)) {
    return {
      ok: false,
      message:
        "Unesi naziv usluge na najmanje jednom jeziku.",
    };
  }

  if (localizedTextIsTooLong(name, 160)) {
    return {
      ok: false,
      message:
        "Naziv usluge može imati najviše 160 karaktera po jeziku.",
    };
  }

  if (
    localizedTextIsTooLong(description, 2000)
  ) {
    return {
      ok: false,
      message:
        "Opis usluge može imati najviše 2000 karaktera po jeziku.",
    };
  }

  const slug = normalizeSlug(input.slug);

  if (slug.length < 2) {
    return {
      ok: false,
      message:
        "Unesi slug koristeći latinicu, brojeve ili crtice.",
    };
  }

  if (slug.length > 120) {
    return {
      ok: false,
      message:
        "Slug može imati najviše 120 karaktera.",
    };
  }

  if (
    !Number.isInteger(input.durationMinutes) ||
    input.durationMinutes < 5 ||
    input.durationMinutes > 1440
  ) {
    return {
      ok: false,
      message:
        "Trajanje mora biti ceo broj između 5 i 1440 minuta.",
    };
  }

  if (
    !isValidPriceType(input.priceType)
  ) {
    return {
      ok: false,
      message:
        "Izabrani tip cene nije dozvoljen.",
    };
  }

  if (
    !Number.isFinite(input.priceFrom) ||
    input.priceFrom < 0 ||
    input.priceFrom > 1000000000
  ) {
    return {
      ok: false,
      message:
        "Početna cena nije ispravna.",
    };
  }

  const normalizedPriceTo =
    input.priceTo === undefined ||
    input.priceTo === null
      ? null
      : input.priceTo;

  if (
    input.priceType === "range" &&
    (normalizedPriceTo === null ||
      !Number.isFinite(normalizedPriceTo) ||
      normalizedPriceTo < input.priceFrom ||
      normalizedPriceTo > 1000000000)
  ) {
    return {
      ok: false,
      message:
        "Kod raspona cena krajnja cena mora biti jednaka ili veća od početne.",
    };
  }

  if (!isValidSortOrder(input.sortOrder)) {
    return {
      ok: false,
      message:
        "Redosled usluge mora biti ceo broj od 0 do 100000.",
    };
  }

  const supabase = await createClient();

  const {
    data: categoryData,
    error: categoryError,
  } = await supabase
    .from("service_categories")
    .select("id")
    .eq("id", categoryId)
    .eq("business_id", admin.business.id)
    .maybeSingle();

  if (categoryError || !categoryData) {
    return {
      ok: false,
      message:
        "Izabrana kategorija nije pronađena.",
    };
  }

  let duplicateQuery = supabase
    .from("services")
    .select("id")
    .eq("business_id", admin.business.id)
    .eq("slug", slug);

  if (serviceId) {
    duplicateQuery = duplicateQuery.neq(
      "id",
      serviceId
    );
  }

  const {
    data: duplicateService,
    error: duplicateError,
  } = await duplicateQuery
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return {
      ok: false,
      message:
        "Nije moguće proveriti slug usluge.",
    };
  }

  if (duplicateService) {
    return {
      ok: false,
      message:
        "Usluga sa ovim slugom već postoji.",
    };
  }

  const payload = {
    business_id: admin.business.id,
    category_id: categoryId,
    slug,
    name,
    description,
    duration_minutes: input.durationMinutes,
    price_type: input.priceType,
    price_from: input.priceFrom,
    price_to:
      input.priceType === "range"
        ? normalizedPriceTo
        : null,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  };

  if (serviceId) {
    const {
      data: serviceData,
      error: serviceError,
    } = await supabase
      .from("services")
      .update(payload)
      .eq("id", serviceId)
      .eq("business_id", admin.business.id)
      .select("id")
      .single();

    if (serviceError || !serviceData) {
      return {
        ok: false,
        message:
          "Usluga nije sačuvana. Proveri podatke i pokušaj ponovo.",
      };
    }

    const service =
      serviceData as unknown as EntityRow;

    refreshCatalogPages();

    return {
      ok: true,
      entityId: service.id,
      message:
        "Usluga je uspešno sačuvana.",
    };
  }

  const {
    data: serviceData,
    error: serviceError,
  } = await supabase
    .from("services")
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (serviceError || !serviceData) {
    return {
      ok: false,
      message:
        "Usluga nije dodata. Proveri podatke i pokušaj ponovo.",
    };
  }

  const service =
    serviceData as unknown as EntityRow;

  refreshCatalogPages();

  return {
    ok: true,
    entityId: service.id,
    message:
      "Nova usluga je uspešno dodata.",
  };
}

export async function setServiceActiveAction(
  input: SetServiceActiveInput
): Promise<ServiceCatalogActionResult> {
  const admin = await requireAdmin();

  const serviceId =
    input.serviceId.trim();

  if (!isUuid(serviceId)) {
    return {
      ok: false,
      message: "Usluga nema ispravan ID.",
    };
  }

  const supabase = await createClient();

  const {
    data: serviceData,
    error: serviceError,
  } = await supabase
    .from("services")
    .update({
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", serviceId)
    .eq("business_id", admin.business.id)
    .select("id")
    .single();

  if (serviceError || !serviceData) {
    return {
      ok: false,
      message:
        "Status usluge nije promenjen.",
    };
  }

  const service =
    serviceData as unknown as EntityRow;

  refreshCatalogPages();

  return {
    ok: true,
    entityId: service.id,
    message: input.isActive
      ? "Usluga je aktivirana."
      : "Usluga je deaktivirana.",
  };
}