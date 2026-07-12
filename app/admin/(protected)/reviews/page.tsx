import type {
  Metadata,
} from "next";

import AdminReviewsManager from "@/components/admin/reviews/AdminReviewsManager";
import {
  getAdminReviewManagement,
} from "@/lib/admin/reviews";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export const metadata:
  Metadata = {
  title:
    "Recenzije",
};

export default async function AdminReviewsPage() {
  const data =
    await getAdminReviewManagement();

  return (
    <AdminReviewsManager
      data={data}
    />
  );
}
