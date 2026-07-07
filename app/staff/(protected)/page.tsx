import type { Metadata } from "next";

import StaffDashboard from "@/components/staff/StaffDashboard";
import { getStaffDashboardData } from "@/lib/staff/dashboard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moj raspored",
  description:
    "Staff pregled rasporeda, rezervacija i odsustava.",
};

export default async function StaffDashboardPage() {
  const data =
    await getStaffDashboardData();

  return (
    <StaffDashboard data={data} />
  );
}
