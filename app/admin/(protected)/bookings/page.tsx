import AdminBookingsView from "@/components/admin/AdminBookingsView";
import { getAdminBookings } from "@/lib/admin/bookings";

export const dynamic =
  "force-dynamic";

export default async function AdminBookingsPage() {
  const result =
    await getAdminBookings();

  return (
    <AdminBookingsView
      businessName={
        result.business.name
      }
      timezone={
        result.business.timezone
      }
      generatedAt={
        new Date().toISOString()
      }
      bookings={result.bookings}
    />
  );
}