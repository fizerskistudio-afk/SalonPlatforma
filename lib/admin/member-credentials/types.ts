import type {
  BusinessMemberRole,
} from "@/lib/admin/member-types";

export type DirectMemberRole =
  | "manager"
  | "staff";

export type MemberCredentialAction =
  | "create_member"
  | "reset_member_password";

export type MemberCredentialRequestBody = {
  action?: unknown;
  email?: unknown;
  role?: unknown;
  employeeId?: unknown;
  memberId?: unknown;
};

export type MembershipRow = {
  id: string;
  user_id: string;
  role: BusinessMemberRole;
  is_active: boolean;
  employee_id: string | null;
  created_at: string;
  updated_at: string;
};

export type EmployeeRow = {
  id: string;
  name: string;
  is_active: boolean;
};
