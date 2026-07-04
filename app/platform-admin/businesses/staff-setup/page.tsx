import InitialStaffSetupPanel from "@/components/platform-admin/InitialStaffSetupPanel";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
};

type BusinessSetupOption = {
  id: string;
  slug: string;
  name: string;
  employeeCount: number;
  serviceCount: number;
};

async function loadBusinesses(): Promise<{
  businesses:
    BusinessSetupOption[];

  error:
    string | null;
}> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "businesses"
    )
    .select(
      `
        id,
        slug,
        name,
        is_active
      `
    )
    .eq(
      "is_active",
      true
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      }
    );

  if (error) {
    console.error(
      "Failed to load businesses for staff setup:",
      error
    );

    return {
      businesses:
        [],

      error:
        "Nije moguće učitati salone.",
    };
  }

  const rows =
    (
      data ??
      []
    ) as unknown as
      BusinessRow[];

  const businesses =
    await Promise.all(
      rows.map(
        async (
          business
        ) => {
          const [
            employeeResult,
            serviceResult,
          ] =
            await Promise.all([
              supabase
                .from(
                  "employees"
                )
                .select(
                  "id",
                  {
                    count:
                      "exact",

                    head:
                      true,
                  }
                )
                .eq(
                  "business_id",
                  business.id
                ),

              supabase
                .from(
                  "services"
                )
                .select(
                  "id",
                  {
                    count:
                      "exact",

                    head:
                      true,
                  }
                )
                .eq(
                  "business_id",
                  business.id
                )
                .eq(
                  "is_active",
                  true
                ),
            ]);

          return {
            id:
              business.id,

            slug:
              business.slug,

            name:
              business.name,

            employeeCount:
              employeeResult
                .count ??
              0,

            serviceCount:
              serviceResult
                .count ??
              0,
          };
        }
      )
    );

  return {
    businesses,
    error:
      null,
  };
}

export default async function InitialStaffSetupPage() {
  const {
    businesses,
    error,
  } =
    await loadBusinesses();

  return (
    <InitialStaffSetupPanel
      businesses={
        businesses
      }
      loadError={
        error
      }
    />
  );
}