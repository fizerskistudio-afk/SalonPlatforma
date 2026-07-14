import type {
  OwnerAccessState,
} from "@/lib/platform-admin/owner-access-state";

export type BusinessOwnerAccessItem = {
  id: string;
  userId: string;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  invitedAt: string | null;
  emailConfirmedAt: string | null;
  lastSignInAt: string | null;
  mustChangePassword: boolean;
  credentialSource: string | null;
  credentialIssuedAt: string | null;
  credentialCompletedAt: string | null;
  state: OwnerAccessState;
};

export type BusinessAccessPageData = {
  business: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };

  owners: BusinessOwnerAccessItem[];
  activeOwnerCount: number;
};
