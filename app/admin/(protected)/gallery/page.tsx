import GalleryManagementActions from "@/components/admin/gallery/GalleryManagementActions";
import { getAdminGallery } from "@/lib/admin/gallery";

export const dynamic =
  "force-dynamic";

export default async function AdminGalleryPage() {
  const result =
    await getAdminGallery();

  return (
    <GalleryManagementActions
      data={result}
    />
  );
}
