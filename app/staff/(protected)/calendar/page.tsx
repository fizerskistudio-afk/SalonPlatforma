import type {
  Metadata,
} from "next";

import StaffGoogleCalendarManager from "@/components/staff/StaffGoogleCalendarManager";
import { getStaffGoogleCalendarConnection } from "@/lib/staff/google-calendar";

export const dynamic =
  "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title:
    "Moj Google Calendar",
  description:
    "Povezivanje ličnog kalendara zaposlenog sa rezervacijama salona.",
};

type StaffCalendarPageProps = {
  searchParams: Promise<{
    googleCalendar?: string;
  }>;
};

export default async function StaffCalendarPage({
  searchParams,
}: StaffCalendarPageProps) {
  const [
    connection,
    params,
  ] = await Promise.all([
    getStaffGoogleCalendarConnection(),
    searchParams,
  ]);

  return (
    <StaffGoogleCalendarManager
      connection={
        connection
      }
      oauthStatus={
        params.googleCalendar ??
        null
      }
    />
  );
}
