import "server-only";

import { cookies } from "next/headers";

export const ADMIN_ACTIVE_BUSINESS_COOKIE =
  "salon_admin_active_business";

export async function getPreferredAdminBusinessId(): Promise<
  string | null
> {
  const cookieStore = await cookies();

  return (
    cookieStore.get(
      ADMIN_ACTIVE_BUSINESS_COOKIE
    )?.value ?? null
  );
}

export async function setPreferredAdminBusinessId(
  businessId: string
) {
  const cookieStore = await cookies();

  cookieStore.set(
    ADMIN_ACTIVE_BUSINESS_COOKIE,
    businessId,
    {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV ===
        "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      priority: "high",
    }
  );
}

export async function clearPreferredAdminBusinessId() {
  const cookieStore = await cookies();

  cookieStore.delete(
    ADMIN_ACTIVE_BUSINESS_COOKIE
  );
}
