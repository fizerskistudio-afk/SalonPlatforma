import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { measureAdminServerStep } from "@/lib/performance/admin-server-timing";

export type AdminStaffTimeOffRequest = {
  id: string;
  employeeId: string;
  employeeName: string;

  startsAt: string;
  endsAt: string;
  reason: string;

  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

  reviewNote: string | null;
  createdAt: string;
};

type RequestRow = {
  id: string;
  employee_id: string;
  starts_at: string;
  ends_at: string;
  reason: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";
  review_note: string | null;
  created_at: string;
};

type EmployeeRow = {
  id: string;
  name: string;
};

export async function getAdminStaffTimeOffRequests():
  Promise<{
    requests: AdminStaffTimeOffRequest[];
  }> {
  const admin =
    await requireAdmin();

  const adminClient =
    createAdminClient();

  const {
    data: requestData,
    error: requestError,
  } =
    await measureAdminServerStep(
      "admin.schedule.staffRequests",
      async () =>
        await adminClient
          .from(
            "staff_time_off_requests"
          )
          .select(
            "id, employee_id, starts_at, ends_at, reason, status, review_note, created_at"
          )
          .eq(
            "business_id",
            admin.business.id
          )
          .eq(
            "status",
            "pending"
          )
          .order(
            "created_at",
            {
              ascending:
                false,
            }
          )
          .limit(
            100
          )
    );

  if (requestError) {
    throw new Error(
      `Staff zahtevi nisu učitani: ${requestError.message}`
    );
  }

  const rows =
    (requestData ??
      []) as unknown as RequestRow[];

  if (rows.length === 0) {
    return {
      requests: [],
    };
  }

  const employeeIds = [
    ...new Set(
      rows.map(
        (row) =>
          row.employee_id
      )
    ),
  ];

  const {
    data: employeeData,
    error: employeeError,
  } =
    await measureAdminServerStep(
      "admin.schedule.staffRequestEmployees",
      async () =>
        await adminClient
          .from(
            "employees"
          )
          .select(
            "id, name"
          )
          .eq(
            "business_id",
            admin.business.id
          )
          .in(
            "id",
            employeeIds
          )
    );

  if (
    employeeError
  ) {
    throw new Error(
      "Podaci zaposlenih za staff zahteve nisu učitani."
    );
  }

  const employees =
    (employeeData ??
      []) as unknown as EmployeeRow[];

  const employeeNameById =
    new Map(
      employees.map(
        (employee) => [
          employee.id,
          employee.name,
        ]
      )
    );

  return {
    requests:
      rows.map((row) => ({
        id: row.id,
        employeeId:
          row.employee_id,
        employeeName:
          employeeNameById.get(
            row.employee_id
          ) ??
          "Nepoznati zaposleni",
        startsAt:
          row.starts_at,
        endsAt:
          row.ends_at,
        reason:
          row.reason,
        status:
          row.status,
        reviewNote:
          row.review_note,
        createdAt:
          row.created_at,
      })),
  };
}
