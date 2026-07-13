import type {
  PlatformAdminPermission,
} from "@/lib/auth/platform-admin-policy";
import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

export function getPublicationPermission(
  status: BusinessPublicationStatus
): PlatformAdminPermission {
  switch (status) {
    case "published":
      return "tenant.publish";

    case "draft":
      return "tenant.unpublish";

    case "suspended":
    case "archived":
      return "tenant.deactivate";
  }
}
