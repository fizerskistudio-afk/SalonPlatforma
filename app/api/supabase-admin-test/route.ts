import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const [
      workingHoursResult,
      bookingsResult,
      customersResult,
      timeOffResult,
    ] = await Promise.all([
      supabase
        .from("working_hours")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("bookings")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("customers")
        .select("id", {
          count: "exact",
          head: true,
        }),

      supabase
        .from("time_off")
        .select("id", {
          count: "exact",
          head: true,
        }),
    ]);

    const errors = [
      workingHoursResult.error?.message,
      bookingsResult.error?.message,
      customersResult.error?.message,
      timeOffResult.error?.message,
    ].filter(
      (message): message is string =>
        Boolean(message)
    );

    if (errors.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Admin connection succeeded, but a query failed.",
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
        "Server-only Supabase admin connection is working.",
      counts: {
        workingHours:
          workingHoursResult.count ?? 0,
        bookings: bookingsResult.count ?? 0,
        customers: customersResult.count ?? 0,
        timeOff: timeOffResult.count ?? 0,
      },
      expected: {
        workingHours: 21,
        bookings: 0,
        customers: 0,
        timeOff: 0,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown admin test error.";

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