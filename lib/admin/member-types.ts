export const BUSINESS_MEMBER_ROLES = [
  "owner",
  "manager",
  "staff",
] as const;

export type BusinessMemberRole =
  (typeof BUSINESS_MEMBER_ROLES)[number];

export type BusinessMemberItem = {
  id: string;
  userId: string;
  email: string | null;
  role: BusinessMemberRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  invitedAt: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
};

export type BusinessMembersPageData = {
  business: {
    id: string;
    name: string;
    slug: string;
  };
  currentUser: {
    id: string;
    role: "owner" | "manager";
  };
  members: BusinessMemberItem[];
};

export const BUSINESS_MEMBER_ROLE_LABELS:
  Record<BusinessMemberRole, string> = {
    owner: "Vlasnik",
    manager: "Menadžer",
    staff: "Zaposleni",
  };
