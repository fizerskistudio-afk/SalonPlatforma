"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type TeamActionResult = {
  ok: boolean;
  message: string;
  entityId?: string;
};

export type TeamLocalizedTextInput = {
  en: string;
  mk: string;
  sq: string;
};

export type SaveEmployeeInput = {
  employeeId?: string;

  name: string;
  slug: string;

  title: TeamLocalizedTextInput;
  bio: TeamLocalizedTextInput;

  imageUrl?: string;
  email?: string;
  phone?: string;

  sortOrder: number;
  isActive: boolean;
};

export type SetEmployeeActiveInput = {
  employeeId: string;
  isActive: boolean;
};

export type SaveEmployeeServiceInput = {
  employeeId: string;
  serviceId: string;

  customDurationMinutes?: number | null;
  customPriceFrom?: number | null;

  isActive: boolean;
};

export type RemoveEmployeeServiceInput = {
  employeeId: string;
  serviceId: string;
};

type EntityRow = {
  id: string;
};

type EmployeeServiceRow = {
  employee_id: string;
  service_id: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function normalizeText(value: string): string {
  return value.trim();
}

function normalizeOptionalText(
  value: string | undefined
): string | null {
  const normalized = value?.trim() ?? "";

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeLocalizedText(
  value: TeamLocalizedTextInput
): TeamLocalizedTextInput {
  return {
    en: normalizeText(value.en),
    mk: normalizeText(value.mk),
    sq: normalizeText(value.sq),
  };
}

function localizedTextIsTooLong(
  value: TeamLocalizedTextInput,
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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

function isValidImageUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return (
      url.protocol === "https:" ||
      url.protocol === "http:"
    );
  } catch {
    return false;
  }
}

function refreshTeamPages() {
  revalidatePath("/");
  revalidatePath("/api/catalog");
  revalidatePath("/admin");
  revalidatePath("/admin/team");
}

export async function saveEmployeeAction(
  input: SaveEmployeeInput
): Promise<TeamActionResult> {
  const admin = await requireAdmin();

  const employeeId =
    input.employeeId?.trim() ?? "";

  if (employeeId && !isUuid(employeeId)) {
    return {
      ok: false,
      message:
        "Zaposleni nema ispravan ID.",
    };
  }

  const name = normalizeText(input.name);

  if (name.length < 2) {
    return {
      ok: false,
      message:
        "Ime zaposlenog mora imati najmanje 2 karaktera.",
    };
  }

  if (name.length > 160) {
    return {
      ok: false,
      message:
        "Ime zaposlenog može imati najviše 160 karaktera.",
    };
  }

  const slug = normalizeSlug(input.slug);

  if (slug.length < 2) {
    return {
      ok: false,
      message:
        "Unesi ispravan slug koristeći latinicu, brojeve i crtice.",
    };
  }

  if (slug.length > 120) {
    return {
      ok: false,
      message:
        "Slug može imati najviše 120 karaktera.",
    };
  }

  const title =
    normalizeLocalizedText(input.title);

  const bio =
    normalizeLocalizedText(input.bio);

  if (localizedTextIsTooLong(title, 160)) {
    return {
      ok: false,
      message:
        "Titula može imati najviše 160 karaktera po jeziku.",
    };
  }

  if (localizedTextIsTooLong(bio, 3000)) {
    return {
      ok: false,
      message:
        "Biografija može imati najviše 3000 karaktera po jeziku.",
    };
  }

  const imageUrl =
    normalizeOptionalText(input.imageUrl);

  const email =
    normalizeOptionalText(input.email);

  const phone =
    normalizeOptionalText(input.phone);

  if (
    imageUrl &&
    !isValidImageUrl(imageUrl)
  ) {
    return {
      ok: false,
      message:
        "Link fotografije nije ispravan.",
    };
  }

  if (imageUrl && imageUrl.length > 2000) {
    return {
      ok: false,
      message:
        "Link fotografije je predugačak.",
    };
  }

  if (email && !isValidEmail(email)) {
    return {
      ok: false,
      message:
        "Email adresa nije ispravna.",
    };
  }

  if (email && email.length > 320) {
    return {
      ok: false,
      message:
        "Email adresa je predugačka.",
    };
  }

  if (phone && phone.length > 80) {
    return {
      ok: false,
      message:
        "Broj telefona može imati najviše 80 karaktera.",
    };
  }

  if (!isValidSortOrder(input.sortOrder)) {
    return {
      ok: false,
      message:
        "Redosled mora biti ceo broj od 0 do 100000.",
    };
  }

  const supabase = await createClient();

  let duplicateQuery = supabase
    .from("employees")
    .select("id")
    .eq("business_id", admin.business.id)
    .eq("slug", slug);

  if (employeeId) {
    duplicateQuery = duplicateQuery.neq(
      "id",
      employeeId
    );
  }

  const {
    data: duplicateEmployee,
    error: duplicateError,
  } = await duplicateQuery
    .limit(1)
    .maybeSingle();

  if (duplicateError) {
    return {
      ok: false,
      message:
        "Nije moguće proveriti slug zaposlenog.",
    };
  }

  if (duplicateEmployee) {
    return {
      ok: false,
      message:
        "Zaposleni sa ovim slugom već postoji.",
    };
  }

  const payload = {
    business_id: admin.business.id,
    name,
    slug,
    title,
    bio,
    image_url: imageUrl,
    email,
    phone,
    sort_order: input.sortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  };

  if (employeeId) {
    const {
      data: employeeData,
      error: employeeError,
    } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", employeeId)
      .eq("business_id", admin.business.id)
      .select("id")
      .single();

    if (employeeError || !employeeData) {
      return {
        ok: false,
        message:
          "Profil zaposlenog nije sačuvan. Proveri podatke i pokušaj ponovo.",
      };
    }

    const employee =
      employeeData as unknown as EntityRow;

    refreshTeamPages();

    return {
      ok: true,
      entityId: employee.id,
      message:
        "Profil zaposlenog je uspešno sačuvan.",
    };
  }

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from("employees")
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (employeeError || !employeeData) {
    return {
      ok: false,
      message:
        "Zaposleni nije dodat. Proveri podatke i pokušaj ponovo.",
    };
  }

  const employee =
    employeeData as unknown as EntityRow;

  refreshTeamPages();

  return {
    ok: true,
    entityId: employee.id,
    message:
      "Novi zaposleni je uspešno dodat.",
  };
}

export async function setEmployeeActiveAction(
  input: SetEmployeeActiveInput
): Promise<TeamActionResult> {
  const admin = await requireAdmin();

  const employeeId =
    input.employeeId.trim();

  if (!isUuid(employeeId)) {
    return {
      ok: false,
      message:
        "Zaposleni nema ispravan ID.",
    };
  }

  const supabase = await createClient();

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from("employees")
    .update({
      is_active: input.isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", employeeId)
    .eq("business_id", admin.business.id)
    .select("id")
    .single();

  if (employeeError || !employeeData) {
    return {
      ok: false,
      message:
        "Status zaposlenog nije promenjen.",
    };
  }

  const employee =
    employeeData as unknown as EntityRow;

  refreshTeamPages();

  return {
    ok: true,
    entityId: employee.id,
    message: input.isActive
      ? "Zaposleni je aktiviran."
      : "Zaposleni je deaktiviran.",
  };
}

export async function saveEmployeeServiceAction(
  input: SaveEmployeeServiceInput
): Promise<TeamActionResult> {
  const admin = await requireAdmin();

  const employeeId =
    input.employeeId.trim();

  const serviceId =
    input.serviceId.trim();

  if (!isUuid(employeeId)) {
    return {
      ok: false,
      message:
        "Zaposleni nema ispravan ID.",
    };
  }

  if (!isUuid(serviceId)) {
    return {
      ok: false,
      message:
        "Usluga nema ispravan ID.",
    };
  }

  const customDurationMinutes =
    input.customDurationMinutes === undefined ||
    input.customDurationMinutes === null
      ? null
      : input.customDurationMinutes;

  const customPriceFrom =
    input.customPriceFrom === undefined ||
    input.customPriceFrom === null
      ? null
      : input.customPriceFrom;

  if (
    customDurationMinutes !== null &&
    (!Number.isInteger(
      customDurationMinutes
    ) ||
      customDurationMinutes < 5 ||
      customDurationMinutes > 1440)
  ) {
    return {
      ok: false,
      message:
        "Posebno trajanje mora biti ceo broj između 5 i 1440 minuta.",
    };
  }

  if (
    customPriceFrom !== null &&
    (!Number.isFinite(customPriceFrom) ||
      customPriceFrom < 0 ||
      customPriceFrom > 1000000000)
  ) {
    return {
      ok: false,
      message:
        "Posebna cena nije ispravna.",
    };
  }

  const supabase = await createClient();

  const [
    employeeResult,
    serviceResult,
  ] = await Promise.all([
    supabase
      .from("employees")
      .select("id")
      .eq("id", employeeId)
      .eq("business_id", admin.business.id)
      .maybeSingle(),

    supabase
      .from("services")
      .select("id")
      .eq("id", serviceId)
      .eq("business_id", admin.business.id)
      .maybeSingle(),
  ]);

  if (
    employeeResult.error ||
    !employeeResult.data
  ) {
    return {
      ok: false,
      message:
        "Izabrani zaposleni nije pronađen.",
    };
  }

  if (
    serviceResult.error ||
    !serviceResult.data
  ) {
    return {
      ok: false,
      message:
        "Izabrana usluga nije pronađena.",
    };
  }

  const {
    data: existingAssignment,
    error: existingAssignmentError,
  } = await supabase
    .from("employee_services")
    .select("employee_id, service_id")
    .eq("business_id", admin.business.id)
    .eq("employee_id", employeeId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (existingAssignmentError) {
    return {
      ok: false,
      message:
        "Nije moguće proveriti postojeću dodelu usluge.",
    };
  }

  const payload = {
    business_id: admin.business.id,
    employee_id: employeeId,
    service_id: serviceId,
    custom_duration_minutes:
      customDurationMinutes,
    custom_price_from: customPriceFrom,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  };

  if (existingAssignment) {
    const {
      data: assignmentData,
      error: assignmentError,
    } = await supabase
      .from("employee_services")
      .update({
        custom_duration_minutes:
          customDurationMinutes,
        custom_price_from:
          customPriceFrom,
        is_active: input.isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", admin.business.id)
      .eq("employee_id", employeeId)
      .eq("service_id", serviceId)
      .select("employee_id, service_id")
      .single();

    if (
      assignmentError ||
      !assignmentData
    ) {
      return {
        ok: false,
        message:
          "Dodela usluge nije sačuvana.",
      };
    }

    const assignment =
      assignmentData as unknown as EmployeeServiceRow;

    refreshTeamPages();

    return {
      ok: true,
      entityId: `${assignment.employee_id}:${assignment.service_id}`,
      message:
        "Dodela usluge je uspešno sačuvana.",
    };
  }

  const {
    data: assignmentData,
    error: assignmentError,
  } = await supabase
    .from("employee_services")
    .insert({
      ...payload,
      created_at: new Date().toISOString(),
    })
    .select("employee_id, service_id")
    .single();

  if (
    assignmentError ||
    !assignmentData
  ) {
    return {
      ok: false,
      message:
        "Usluga nije dodeljena zaposlenom.",
    };
  }

  const assignment =
    assignmentData as unknown as EmployeeServiceRow;

  refreshTeamPages();

  return {
    ok: true,
    entityId: `${assignment.employee_id}:${assignment.service_id}`,
    message:
      "Usluga je uspešno dodeljena zaposlenom.",
  };
}

export async function removeEmployeeServiceAction(
  input: RemoveEmployeeServiceInput
): Promise<TeamActionResult> {
  const admin = await requireAdmin();

  const employeeId =
    input.employeeId.trim();

  const serviceId =
    input.serviceId.trim();

  if (
    !isUuid(employeeId) ||
    !isUuid(serviceId)
  ) {
    return {
      ok: false,
      message:
        "Dodela usluge nema ispravne podatke.",
    };
  }

  const supabase = await createClient();

  const {
    data: assignmentData,
    error: assignmentError,
  } = await supabase
    .from("employee_services")
    .delete()
    .eq("business_id", admin.business.id)
    .eq("employee_id", employeeId)
    .eq("service_id", serviceId)
    .select("employee_id, service_id")
    .single();

  if (
    assignmentError ||
    !assignmentData
  ) {
    return {
      ok: false,
      message:
        "Dodela usluge nije uklonjena.",
    };
  }

  const assignment =
    assignmentData as unknown as EmployeeServiceRow;

  refreshTeamPages();

  return {
    ok: true,
    entityId: `${assignment.employee_id}:${assignment.service_id}`,
    message:
      "Usluga je uklonjena sa profila zaposlenog.",
  };
}