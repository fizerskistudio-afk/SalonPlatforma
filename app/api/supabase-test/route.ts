import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function getErrorMessage(
  error: { message: string } | null
): string | null {
  return error?.message ?? null;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const [
      businessResult,
      bookingSettingsResult,
      categoriesResult,
      servicesResult,
      employeesResult,
      employeeServicesResult,
    ] = await Promise.all([
      supabase
        .from("businesses")
        .select(
          [
            "id",
            "slug",
            "name",
            "default_locale",
            "currency",
            "timezone",
          ].join(",")
        )
        .eq("slug", "lumiere-studio")
        .single(),

      supabase
        .from("booking_settings")
        .select("business_id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("service_categories")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("services")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("employees")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("employee_services")
        .select("employee_id", {
          count: "exact",
          head: true,
        }),
    ]);

    const errors = [
      getErrorMessage(businessResult.error),
      getErrorMessage(
        bookingSettingsResult.error
      ),
      getErrorMessage(categoriesResult.error),
      getErrorMessage(servicesResult.error),
      getErrorMessage(employeesResult.error),
      getErrorMessage(
        employeeServicesResult.error
      ),
    ].filter(
      (message): message is string =>
        message !== null
    );

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Supabase connection succeeded, but a database query failed.",
          errors,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      message:
        "Supabase connection and public RLS reads are working.",
      business: businessResult.data,
      counts: {
        bookingSettings:
          bookingSettingsResult.count ?? 0,
        categories:
          categoriesResult.count ?? 0,
        services: servicesResult.count ?? 0,
        employees:
          employeesResult.count ?? 0,
        employeeServices:
          employeeServicesResult.count ?? 0,
      },
      expected: {
        bookingSettings: 1,
        categories: 5,
        services: 12,
        employees: 2,
        employeeServices: 13,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Supabase test error.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      {
        status: 500,
      }
    );
  }
}