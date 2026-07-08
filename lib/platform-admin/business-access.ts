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
