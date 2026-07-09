export type CredentialAction =
  | "create_owner"
  | "reset_owner_password";

export type CredentialRequestBody = {
  action?: unknown;
  businessSlug?: unknown;
  email?: unknown;
  memberId?: unknown;
};

export type BusinessRow = {
  id: string;
  name: string;
  slug: string;
};

export type MembershipRow = {
  id: string;
  user_id: string;
  role:
    | "owner"
    | "manager"
    | "staff";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
