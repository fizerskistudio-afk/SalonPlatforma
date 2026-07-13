import type {
  PlatformAdminPermission,
} from "@/lib/auth/platform-admin-policy";
import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

export function getPublicationPermission(
  currentStatus: BusinessPublicationStatus,
  nextStatus: BusinessPublicationStatus
): PlatformAdminPermission {
  if (
    (
      currentStatus === "suspended" ||
      currentStatus === "archived"
    ) &&
    nextStatus === "draft"
  ) {
    return "tenant.reactivate";
  }

  switch (nextStatus) {
    case "published":
      return "tenant.publish";

    case "draft":
      return "tenant.unpublish";

    case "suspended":
    case "archived":
      return "tenant.deactivate";
  }
}
