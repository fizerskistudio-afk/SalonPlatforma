import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type ScheduleDayOfWeek =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export type ScheduleRuleSource =
  | "business"
  | "employee"
  | "missing";

export const SCHEDULE_DAYS = [
  {
    value: 1,
    label: "Ponedeljak",
    shortLabel: "Pon",
  },
  {
    value: 2,
    label: "Utorak",
    shortLabel: "Uto",
  },
  {
    value: 3,
    label: "Sreda",
    shortLabel: "Sre",
  },
  {
    value: 4,
    label: "Četvrtak",
    shortLabel: "Čet",
  },
  {
    value: 5,
    label: "Petak",
    shortLabel: "Pet",
  },
  {
    value: 6,
    label: "Subota",
    shortLabel: "Sub",
  },
  {
    value: 0,
    label: "Nedelja",
    shortLabel: "Ned",
  },
] as const satisfies readonly {
  value: ScheduleDayOfWeek;
  label: string;
  shortLabel: string;
}[];

export type AdminScheduleEmployee = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type AdminWorkingHoursRule = {
  id: string;
  businessId: string;
  employeeId: string | null;

  dayOfWeek: ScheduleDayOfWeek;

  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;

  createdAt: string;
  updatedAt: string;
};

export type AdminBusinessScheduleDay = {
  dayOfWeek: ScheduleDayOfWeek;
  label: string;
  shortLabel: string;

  rule: AdminWorkingHoursRule | null;
};

export type AdminEmployeeScheduleDay = {
  dayOfWeek: ScheduleDayOfWeek;
  label: string;
  shortLabel: string;

  businessRule: AdminWorkingHoursRule | null;
  employeeOverride: AdminWorkingHoursRule | null;

  effectiveRule: AdminWorkingHoursRule | null;
  effectiveSource: ScheduleRuleSource;
};

export type AdminEmployeeSchedule = {
  employee: AdminScheduleEmployee;

  days: AdminEmployeeScheduleDay[];

  metrics: {
    configuredOverrides: number;
    openDays: number;
    closedDays: number;
    inheritedDays: number;
  };
};

export type AdminTimeOff = {
  id: string;
  businessId: string;
  employeeId: string | null;
  employeeName: string | null;

  blockType: string;

  startsAt: string;
  endsAt: string;

  reason: string | null;

  createdAt: string;
  updatedAt: string;

  isBusinessWide: boolean;
  isUpcoming: boolean;
  isOngoing: boolean;
  isPast: boolean;
};

export type AdminScheduleResult = {
  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  };

  employees: AdminScheduleEmployee[];

  businessSchedule: AdminBusinessScheduleDay[];

  employeeSchedules: AdminEmployeeSchedule[];

  timeOff: AdminTimeOff[];

  metrics: {
    totalEmployees: number;
    activeEmployees: number;

    configuredBusinessDays: number;
    openBusinessDays: number;
    closedBusinessDays: number;

    configuredEmployeeOverrides: number;

    totalTimeOff: number;
    upcomingTimeOff: number;
    ongoingTimeOff: number;

    businessWideBlocks: number;
    employeeBlocks: number;
  };
};

type BusinessDatabaseRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

type EmployeeDatabaseRow = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

type WorkingHoursDatabaseRow = {
  id: string;
  business_id: string;
  employee_id: string | null;

  day_of_week: number;

  is_closed: boolean;
  open_time: string | null;
  close_time: string | null;

  created_at: string;
  updated_at: string;
};

type TimeOffDatabaseRow = {
  id: string;
  business_id: string;
  employee_id: string | null;

  block_type: string;

  starts_at: string;
  ends_at: string;

  reason: string | null;

  created_at: string;
  updated_at: string;
};

function isScheduleDayOfWeek(
  value: number
): value is ScheduleDayOfWeek {
  return (
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 6
  );
}

function normalizeTime(
  value: string | null
): string | null {
  if (!value) {
    return null;
  }

  return value.slice(0, 5);
}

function mapWorkingHoursRule(
  row: WorkingHoursDatabaseRow
): AdminWorkingHoursRule {
  if (!isScheduleDayOfWeek(row.day_of_week)) {
    throw new Error(
      `Neispravan dan u radnom vremenu: ${row.day_of_week}`
    );
  }

  return {
    id: row.id,
    businessId: row.business_id,
    employeeId: row.employee_id,

    dayOfWeek: row.day_of_week,

    isClosed: row.is_closed,
    openTime: normalizeTime(row.open_time),
    closeTime: normalizeTime(row.close_time),

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getRuleForDay(
  rules: AdminWorkingHoursRule[],
  dayOfWeek: ScheduleDayOfWeek
): AdminWorkingHoursRule | null {
  return (
    rules.find(
      (rule) =>
        rule.dayOfWeek === dayOfWeek
    ) ?? null
  );
}

function createBusinessSchedule(
  businessRules: AdminWorkingHoursRule[]
): AdminBusinessScheduleDay[] {
  return SCHEDULE_DAYS.map((day) => ({
    dayOfWeek: day.value,
    label: day.label,
    shortLabel: day.shortLabel,

    rule: getRuleForDay(
      businessRules,
      day.value
    ),
  }));
}

function createEmployeeSchedule(
  employee: AdminScheduleEmployee,
  businessRules: AdminWorkingHoursRule[],
  employeeRules: AdminWorkingHoursRule[]
): AdminEmployeeSchedule {
  const days: AdminEmployeeScheduleDay[] =
    SCHEDULE_DAYS.map((day) => {
      const businessRule =
        getRuleForDay(
          businessRules,
          day.value
        );

      const employeeOverride =
        getRuleForDay(
          employeeRules,
          day.value
        );

      if (employeeOverride) {
        return {
          dayOfWeek: day.value,
          label: day.label,
          shortLabel: day.shortLabel,

          businessRule,
          employeeOverride,

          effectiveRule:
            employeeOverride,

          effectiveSource: "employee",
        };
      }

      if (businessRule) {
        return {
          dayOfWeek: day.value,
          label: day.label,
          shortLabel: day.shortLabel,

          businessRule,
          employeeOverride: null,

          effectiveRule: businessRule,
          effectiveSource: "business",
        };
      }

      return {
        dayOfWeek: day.value,
        label: day.label,
        shortLabel: day.shortLabel,

        businessRule: null,
        employeeOverride: null,

        effectiveRule: null,
        effectiveSource: "missing",
      };
    });

  const configuredOverrides =
    days.filter(
      (day) =>
        day.employeeOverride !== null
    ).length;

  const openDays =
    days.filter(
      (day) =>
        day.effectiveRule !== null &&
        !day.effectiveRule.isClosed
    ).length;

  const closedDays =
    days.filter(
      (day) =>
        day.effectiveRule?.isClosed === true
    ).length;

  const inheritedDays =
    days.filter(
      (day) =>
        day.effectiveSource === "business"
    ).length;

  return {
    employee,
    days,

    metrics: {
      configuredOverrides,
      openDays,
      closedDays,
      inheritedDays,
    },
  };
}

function mapTimeOff(
  row: TimeOffDatabaseRow,
  employeesById: Map<
    string,
    AdminScheduleEmployee
  >,
  now: Date
): AdminTimeOff {
  const startsAtDate =
    new Date(row.starts_at);

  const endsAtDate =
    new Date(row.ends_at);

  const employee =
    row.employee_id
      ? employeesById.get(
          row.employee_id
        ) ?? null
      : null;

  const isOngoing =
    startsAtDate <= now &&
    endsAtDate > now;

  const isUpcoming =
    startsAtDate > now;

  const isPast =
    endsAtDate <= now;

  return {
    id: row.id,
    businessId: row.business_id,
    employeeId: row.employee_id,
    employeeName:
      employee?.name ?? null,

    blockType: row.block_type,

    startsAt: row.starts_at,
    endsAt: row.ends_at,

    reason: row.reason,

    createdAt: row.created_at,
    updatedAt: row.updated_at,

    isBusinessWide:
      row.employee_id === null,

    isUpcoming,
    isOngoing,
    isPast,
  };
}

export async function getAdminSchedule(): Promise<AdminScheduleResult> {
  const admin = await requireAdmin();

  const supabase =
    createAdminClient();

  const [
    businessResult,
    employeesResult,
    workingHoursResult,
    timeOffResult,
  ] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        "id, name, slug, timezone"
      )
      .eq("id", admin.business.id)
      .single(),

    supabase
      .from("employees")
      .select(
        "id, slug, name, sort_order, is_active"
      )
      .eq(
        "business_id",
        admin.business.id
      )
      .order("sort_order", {
        ascending: true,
      })
      .order("name", {
        ascending: true,
      }),

    supabase
      .from("working_hours")
      .select(
        `
          id,
          business_id,
          employee_id,
          day_of_week,
          is_closed,
          open_time,
          close_time,
          created_at,
          updated_at
        `
      )
      .eq(
        "business_id",
        admin.business.id
      )
      .order("day_of_week", {
        ascending: true,
      }),

    supabase
      .from("time_off")
      .select(
        `
          id,
          business_id,
          employee_id,
          block_type,
          starts_at,
          ends_at,
          reason,
          created_at,
          updated_at
        `
      )
      .eq(
        "business_id",
        admin.business.id
      )
      .order("starts_at", {
        ascending: true,
      }),
  ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      "Nije moguće učitati podatke salona za raspored."
    );
  }

  if (employeesResult.error) {
    throw new Error(
      "Nije moguće učitati zaposlene za raspored."
    );
  }

  if (workingHoursResult.error) {
    throw new Error(
      "Nije moguće učitati radno vreme."
    );
  }

  if (timeOffResult.error) {
    throw new Error(
      "Nije moguće učitati odsustva i blokade."
    );
  }

  const business =
    businessResult.data as unknown as BusinessDatabaseRow;

  const employees = (
    employeesResult.data ?? []
  ).map(
    (
      row
    ): AdminScheduleEmployee => {
      const employee =
        row as unknown as EmployeeDatabaseRow;

      return {
        id: employee.id,
        slug: employee.slug,
        name: employee.name,
        sortOrder:
          employee.sort_order,
        isActive:
          employee.is_active,
      };
    }
  );

  const workingHours = (
    workingHoursResult.data ?? []
  ).map((row) =>
    mapWorkingHoursRule(
      row as unknown as WorkingHoursDatabaseRow
    )
  );

  const businessRules =
    workingHours.filter(
      (rule) =>
        rule.employeeId === null
    );

  const employeeSchedules =
    employees.map((employee) => {
      const employeeRules =
        workingHours.filter(
          (rule) =>
            rule.employeeId ===
            employee.id
        );

      return createEmployeeSchedule(
        employee,
        businessRules,
        employeeRules
      );
    });

  const employeesById = new Map(
    employees.map((employee) => [
      employee.id,
      employee,
    ])
  );

  const now = new Date();

  const timeOff = (
    timeOffResult.data ?? []
  ).map((row) =>
    mapTimeOff(
      row as unknown as TimeOffDatabaseRow,
      employeesById,
      now
    )
  );

  const businessSchedule =
    createBusinessSchedule(
      businessRules
    );

  const configuredBusinessDays =
    businessSchedule.filter(
      (day) => day.rule !== null
    ).length;

  const openBusinessDays =
    businessSchedule.filter(
      (day) =>
        day.rule !== null &&
        !day.rule.isClosed
    ).length;

  const closedBusinessDays =
    businessSchedule.filter(
      (day) =>
        day.rule?.isClosed === true
    ).length;

  const configuredEmployeeOverrides =
    employeeSchedules.reduce(
      (total, schedule) =>
        total +
        schedule.metrics
          .configuredOverrides,
      0
    );

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      timezone:
        business.timezone,
    },

    employees,

    businessSchedule,

    employeeSchedules,

    timeOff,

    metrics: {
      totalEmployees:
        employees.length,

      activeEmployees:
        employees.filter(
          (employee) =>
            employee.isActive
        ).length,

      configuredBusinessDays,
      openBusinessDays,
      closedBusinessDays,

      configuredEmployeeOverrides,

      totalTimeOff:
        timeOff.length,

      upcomingTimeOff:
        timeOff.filter(
          (entry) =>
            entry.isUpcoming
        ).length,

      ongoingTimeOff:
        timeOff.filter(
          (entry) =>
            entry.isOngoing
        ).length,

      businessWideBlocks:
        timeOff.filter(
          (entry) =>
            entry.isBusinessWide
        ).length,

      employeeBlocks:
        timeOff.filter(
          (entry) =>
            !entry.isBusinessWide
        ).length,
    },
  };
}