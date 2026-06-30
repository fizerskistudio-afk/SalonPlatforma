"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type ScheduleActionResult = {
  ok: boolean;
  message: string;
  entityId?: string;
};

export type SaveWorkingHoursInput = {
  employeeId?: string | null;

  dayOfWeek: number;

  isClosed: boolean;

  openTime?: string | null;
  closeTime?: string | null;
};

export type RemoveEmployeeWorkingHoursInput = {
  employeeId: string;
  dayOfWeek: number;
};

export type SaveTimeOffInput = {
  timeOffId?: string;

  employeeId?: string | null;

  startsAt: string;
  endsAt: string;

  reason?: string;
};

export type RemoveTimeOffInput = {
  timeOffId: string;
};

type IdRow = {
  id: string;
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function isValidDayOfWeek(
  value: number
): boolean {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 6
  );
}

function normalizeOptionalText(
  value: string | undefined
): string | null {
  const normalized =
    value?.trim() ?? "";

  return normalized.length > 0
    ? normalized
    : null;
}

function normalizeTime(
  value: string | null | undefined
): string | null {
  const normalized =
    value?.trim() ?? "";

  if (!normalized) {
    return null;
  }

  const match = normalized.match(
    /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/
  );

  if (!match) {
    return null;
  }

  return `${match[1]}:${match[2]}`;
}

function timeToMinutes(
  value: string
): number {
  const [hours, minutes] =
    value.split(":").map(Number);

  return hours * 60 + minutes;
}

function parseDate(
  value: string
): Date | null {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  return date;
}

function refreshSchedulePages() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/schedule");
  revalidatePath("/api/availability");
}

async function employeeBelongsToBusiness(
  employeeId: string,
  businessId: string
): Promise<boolean> {
  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("employees")
    .select("id")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .maybeSingle();

  return !error && Boolean(data);
}

export async function saveWorkingHoursAction(
  input: SaveWorkingHoursInput
): Promise<ScheduleActionResult> {
  const admin = await requireAdmin();

  const employeeId =
    input.employeeId?.trim() || null;

  if (
    employeeId &&
    !isUuid(employeeId)
  ) {
    return {
      ok: false,
      message:
        "Zaposleni nema ispravan ID.",
    };
  }

  if (
    !isValidDayOfWeek(
      input.dayOfWeek
    )
  ) {
    return {
      ok: false,
      message:
        "Izabrani dan nije ispravan.",
    };
  }

  if (employeeId) {
    const employeeExists =
      await employeeBelongsToBusiness(
        employeeId,
        admin.business.id
      );

    if (!employeeExists) {
      return {
        ok: false,
        message:
          "Izabrani zaposleni nije pronađen.",
      };
    }
  }

  let openTime: string | null =
    null;

  let closeTime: string | null =
    null;

  if (!input.isClosed) {
    openTime = normalizeTime(
      input.openTime
    );

    closeTime = normalizeTime(
      input.closeTime
    );

    if (
      !openTime ||
      !closeTime
    ) {
      return {
        ok: false,
        message:
          "Unesi ispravno vreme otvaranja i zatvaranja.",
      };
    }

    if (
      timeToMinutes(openTime) >=
      timeToMinutes(closeTime)
    ) {
      return {
        ok: false,
        message:
          "Vreme zatvaranja mora biti posle vremena otvaranja.",
      };
    }
  }

  const supabase =
    await createClient();

  let existingQuery = supabase
    .from("working_hours")
    .select("id")
    .eq(
      "business_id",
      admin.business.id
    )
    .eq(
      "day_of_week",
      input.dayOfWeek
    );

  if (employeeId) {
    existingQuery =
      existingQuery.eq(
        "employee_id",
        employeeId
      );
  } else {
    existingQuery =
      existingQuery.is(
        "employee_id",
        null
      );
  }

  const {
    data: existingData,
    error: existingError,
  } = await existingQuery
    .limit(1)
    .maybeSingle();

  if (existingError) {
    return {
      ok: false,
      message:
        "Nije moguće proveriti postojeće radno vreme.",
    };
  }

  const now =
    new Date().toISOString();

  const payload = {
    business_id:
      admin.business.id,

    employee_id: employeeId,

    day_of_week:
      input.dayOfWeek,

    is_closed:
      input.isClosed,

    open_time:
      input.isClosed
        ? null
        : openTime,

    close_time:
      input.isClosed
        ? null
        : closeTime,

    updated_at: now,
  };

  if (existingData) {
    const existing =
      existingData as unknown as IdRow;

    const {
      data: updatedData,
      error: updateError,
    } = await supabase
      .from("working_hours")
      .update(payload)
      .eq("id", existing.id)
      .eq(
        "business_id",
        admin.business.id
      )
      .select("id")
      .single();

    if (
      updateError ||
      !updatedData
    ) {
      return {
        ok: false,
        message:
          "Radno vreme nije sačuvano.",
      };
    }

    refreshSchedulePages();

    return {
      ok: true,
      entityId: existing.id,
      message: employeeId
        ? "Radno vreme zaposlenog je sačuvano."
        : "Radno vreme salona je sačuvano.",
    };
  }

  const {
    data: insertedData,
    error: insertError,
  } = await supabase
    .from("working_hours")
    .insert({
      ...payload,
      created_at: now,
    })
    .select("id")
    .single();

  if (
    insertError ||
    !insertedData
  ) {
    return {
      ok: false,
      message:
        "Radno vreme nije dodato.",
    };
  }

  const inserted =
    insertedData as unknown as IdRow;

  refreshSchedulePages();

  return {
    ok: true,
    entityId: inserted.id,
    message: employeeId
      ? "Posebno radno vreme zaposlenog je dodato."
      : "Radno vreme salona je dodato.",
  };
}

export async function removeEmployeeWorkingHoursAction(
  input: RemoveEmployeeWorkingHoursInput
): Promise<ScheduleActionResult> {
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

  if (
    !isValidDayOfWeek(
      input.dayOfWeek
    )
  ) {
    return {
      ok: false,
      message:
        "Izabrani dan nije ispravan.",
    };
  }

  const employeeExists =
    await employeeBelongsToBusiness(
      employeeId,
      admin.business.id
    );

  if (!employeeExists) {
    return {
      ok: false,
      message:
        "Izabrani zaposleni nije pronađen.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("working_hours")
    .delete()
    .eq(
      "business_id",
      admin.business.id
    )
    .eq(
      "employee_id",
      employeeId
    )
    .eq(
      "day_of_week",
      input.dayOfWeek
    )
    .select("id")
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      message:
        "Posebno radno vreme nije uklonjeno.",
    };
  }

  refreshSchedulePages();

  return {
    ok: true,
    entityId:
      data?.id ?? undefined,

    message: data
      ? "Posebno radno vreme je uklonjeno. Zaposleni sada nasleđuje raspored salona."
      : "Zaposleni već nasleđuje raspored salona za ovaj dan.",
  };
}

export async function saveTimeOffAction(
  input: SaveTimeOffInput
): Promise<ScheduleActionResult> {
  const admin = await requireAdmin();

  const timeOffId =
    input.timeOffId?.trim() ?? "";

  const employeeId =
    input.employeeId?.trim() || null;

  if (
    timeOffId &&
    !isUuid(timeOffId)
  ) {
    return {
      ok: false,
      message:
        "Vremenska blokada nema ispravan ID.",
    };
  }

  if (
    employeeId &&
    !isUuid(employeeId)
  ) {
    return {
      ok: false,
      message:
        "Zaposleni nema ispravan ID.",
    };
  }

  if (employeeId) {
    const employeeExists =
      await employeeBelongsToBusiness(
        employeeId,
        admin.business.id
      );

    if (!employeeExists) {
      return {
        ok: false,
        message:
          "Izabrani zaposleni nije pronađen.",
      };
    }
  }

  const startsAt =
    parseDate(input.startsAt);

  const endsAt =
    parseDate(input.endsAt);

  if (!startsAt || !endsAt) {
    return {
      ok: false,
      message:
        "Početak ili kraj odsustva nije ispravan.",
    };
  }

  if (
    endsAt.getTime() <=
    startsAt.getTime()
  ) {
    return {
      ok: false,
      message:
        "Kraj odsustva mora biti posle početka.",
    };
  }

  const reason =
    normalizeOptionalText(
      input.reason
    );

  if (
    reason &&
    reason.length > 1000
  ) {
    return {
      ok: false,
      message:
        "Razlog može imati najviše 1000 karaktera.",
    };
  }

  const supabase =
    await createClient();

  const now =
    new Date().toISOString();

  const payload = {
    business_id:
      admin.business.id,

    employee_id: employeeId,

    block_type: "time_off",

    starts_at:
      startsAt.toISOString(),

    ends_at:
      endsAt.toISOString(),

    reason,

    updated_at: now,
  };

  if (timeOffId) {
    const {
      data,
      error,
    } = await supabase
      .from("time_off")
      .update(payload)
      .eq("id", timeOffId)
      .eq(
        "business_id",
        admin.business.id
      )
      .select("id")
      .single();

    if (
      error ||
      !data
    ) {
      return {
        ok: false,
        message:
          "Odsustvo ili blokada nije sačuvana.",
      };
    }

    const updated =
      data as unknown as IdRow;

    refreshSchedulePages();

    return {
      ok: true,
      entityId: updated.id,
      message: employeeId
        ? "Odsustvo zaposlenog je sačuvano."
        : "Blokada celog salona je sačuvana.",
    };
  }

  const {
    data,
    error,
  } = await supabase
    .from("time_off")
    .insert({
      ...payload,
      created_at: now,
    })
    .select("id")
    .single();

  if (
    error ||
    !data
  ) {
    return {
      ok: false,
      message:
        "Odsustvo ili blokada nije dodata.",
    };
  }

  const inserted =
    data as unknown as IdRow;

  refreshSchedulePages();

  return {
    ok: true,
    entityId: inserted.id,
    message: employeeId
      ? "Odsustvo zaposlenog je dodato."
      : "Blokada celog salona je dodata.",
  };
}

export async function removeTimeOffAction(
  input: RemoveTimeOffInput
): Promise<ScheduleActionResult> {
  const admin = await requireAdmin();

  const timeOffId =
    input.timeOffId.trim();

  if (!isUuid(timeOffId)) {
    return {
      ok: false,
      message:
        "Vremenska blokada nema ispravan ID.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("time_off")
    .delete()
    .eq("id", timeOffId)
    .eq(
      "business_id",
      admin.business.id
    )
    .select("id")
    .single();

  if (
    error ||
    !data
  ) {
    return {
      ok: false,
      message:
        "Odsustvo ili blokada nije uklonjena.",
    };
  }

  const removed =
    data as unknown as IdRow;

  refreshSchedulePages();

  return {
    ok: true,
    entityId: removed.id,
    message:
      "Odsustvo ili vremenska blokada je uklonjena.",
  };
}