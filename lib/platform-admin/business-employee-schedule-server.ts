import "server-only";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  DAY_LABELS,
  normalizeTimeValue,
  type EmployeeScheduleHour,
} from "@/lib/platform-admin/business-employee-schedule";

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  default_locale: string;
};

type EmployeeRow = {
  id: string;
  slug: string;
  name: string;
  title: unknown;
  is_active: boolean;
};

type WorkingHourRow = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

export type EmployeeScheduleData = {
  business: BusinessRow;
  employee: EmployeeRow;
  salonHours: EmployeeScheduleHour[];
  employeeHours: EmployeeScheduleHour[];
  usesBusinessHours: boolean;
};

function mapHours(
  rows: readonly WorkingHourRow[],
  fallback?: readonly EmployeeScheduleHour[]
): EmployeeScheduleHour[] {
  const byDay = new Map(
    rows.map(
      (row) => [
        row.day_of_week,
        row,
      ] as const
    )
  );

  const fallbackByDay =
    new Map(
      (fallback ?? []).map(
        (row) => [
          row.dayOfWeek,
          row,
        ] as const
      )
    );

  return DAY_LABELS.map(
    (label, dayOfWeek) => {
      const row =
        byDay.get(dayOfWeek);

      if (row) {
        return {
          dayOfWeek,
          label,
          isClosed:
            row.is_closed,
          openTime:
            normalizeTimeValue(
              row.open_time
            ),
          closeTime:
            normalizeTimeValue(
              row.close_time
            ),
        };
      }

      const fallbackRow =
        fallbackByDay.get(
          dayOfWeek
        );

      if (fallbackRow) {
        return {
          ...fallbackRow,
          label,
        };
      }

      return {
        dayOfWeek,
        label,
        isClosed: true,
        openTime: "09:00",
        closeTime: "17:00",
      };
    }
  );
}

export async function loadEmployeeScheduleData(
  businessSlug: string,
  employeeSlug: string
): Promise<EmployeeScheduleData | null> {
  const supabase =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(
      "id, slug, name, default_locale"
    )
    .eq("slug", businessSlug)
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load business for employee schedule:",
      businessError
    );

    throw new Error(
      "Salon nije moguće učitati iz baze."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as
      BusinessRow;

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from("employees")
    .select(
      "id, slug, name, title, is_active"
    )
    .eq(
      "business_id",
      business.id
    )
    .eq("slug", employeeSlug)
    .maybeSingle();

  if (employeeError) {
    console.error(
      "Failed to load employee schedule owner:",
      employeeError
    );

    throw new Error(
      "Zaposlenog nije moguće učitati iz baze."
    );
  }

  if (!employeeData) {
    return null;
  }

  const employee =
    employeeData as unknown as
      EmployeeRow;

  const [
    salonHoursResult,
    employeeHoursResult,
  ] = await Promise.all([
    supabase
      .from("working_hours")
      .select(
        "day_of_week, open_time, close_time, is_closed"
      )
      .eq(
        "business_id",
        business.id
      )
      .is("employee_id", null)
      .order("day_of_week", {
        ascending: true,
      }),

    supabase
      .from("working_hours")
      .select(
        "day_of_week, open_time, close_time, is_closed"
      )
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "employee_id",
        employee.id
      )
      .order("day_of_week", {
        ascending: true,
      }),
  ]);

  const queryErrors = [
    salonHoursResult.error,
    employeeHoursResult.error,
  ].filter(Boolean);

  if (queryErrors.length > 0) {
    console.error(
      "Failed to load employee working hours:",
      queryErrors
    );

    throw new Error(
      "Radno vreme zaposlenog nije moguće učitati."
    );
  }

  const salonRows =
    (salonHoursResult.data ??
      []) as unknown as
      WorkingHourRow[];

  const employeeRows =
    (employeeHoursResult.data ??
      []) as unknown as
      WorkingHourRow[];

  const salonHours =
    mapHours(salonRows);

  return {
    business,
    employee,
    salonHours,
    employeeHours:
      mapHours(
        employeeRows,
        salonHours
      ),
    usesBusinessHours:
      employeeRows.length === 0,
  };
}
