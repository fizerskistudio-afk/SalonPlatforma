import "server-only";

import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminStaffTimeOffRequest = {
  id: string;
  employeeId: string;
  employeeName: string;
  requesterEmail: string | null;

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
  member_id: string;
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

type MemberRow = {
  id: string;
  user_id: string;
};

export async function getAdminStaffTimeOffRequests():
  Promise<{
    timezone: string;
    requests: AdminStaffTimeOffRequest[];
  }> {
  const admin =
    await requireAdmin();

  const adminClient =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await adminClient
    .from("businesses")
    .select("timezone")
    .eq("id", admin.business.id)
    .single();

  if (
    businessError ||
    !businessData
  ) {
    throw new Error(
      "Timezone salona nije učitan."
    );
  }

  const {
    data: requestData,
    error: requestError,
  } = await adminClient
    .from(
      "staff_time_off_requests"
    )
    .select(
      "id, employee_id, member_id, starts_at, ends_at, reason, status, review_note, created_at"
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .order(
      "created_at",
      {
        ascending: false,
      }
    )
    .limit(100);

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
      timezone:
        String(
          businessData.timezone
        ),
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

  const memberIds = [
    ...new Set(
      rows.map(
        (row) =>
          row.member_id
      )
    ),
  ];

  const [
    employeeResult,
    memberResult,
  ] = await Promise.all([
    adminClient
      .from("employees")
      .select("id, name")
      .eq(
        "business_id",
        admin.business.id
      )
      .in("id", employeeIds),

    adminClient
      .from(
        "business_members"
      )
      .select("id, user_id")
      .eq(
        "business_id",
        admin.business.id
      )
      .in("id", memberIds),
  ]);

  if (
    employeeResult.error ||
    memberResult.error
  ) {
    throw new Error(
      "Podaci za staff zahteve nisu učitani."
    );
  }

  const employees =
    (employeeResult.data ??
      []) as unknown as EmployeeRow[];

  const members =
    (memberResult.data ??
      []) as unknown as MemberRow[];

  const employeeNameById =
    new Map(
      employees.map(
        (employee) => [
          employee.id,
          employee.name,
        ]
      )
    );

  const userIdByMemberId =
    new Map(
      members.map(
        (member) => [
          member.id,
          member.user_id,
        ]
      )
    );

  const emailByMemberId =
    new Map<
      string,
      string | null
    >();

  await Promise.all(
    memberIds.map(
      async (memberId) => {
        const userId =
          userIdByMemberId.get(
            memberId
          );

        if (!userId) {
          emailByMemberId.set(
            memberId,
            null
          );
          return;
        }

        const {
          data,
        } =
          await adminClient
            .auth
            .admin
            .getUserById(
              userId
            );

        emailByMemberId.set(
          memberId,
          data.user?.email ??
            null
        );
      }
    )
  );

  return {
    timezone:
      String(
        businessData.timezone
      ),

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
        requesterEmail:
          emailByMemberId.get(
            row.member_id
          ) ??
          null,
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
