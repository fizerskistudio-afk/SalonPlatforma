import type {
  BusinessPublicationStatus,
} from "@/lib/publishing/status";

export function getLifecycleActionLabel(
  currentStatus:
    BusinessPublicationStatus,
  nextStatus:
    BusinessPublicationStatus
): string {
  switch (
    nextStatus
  ) {
    case "published":
      return "Objavi javno";

    case "draft":
      return (
        currentStatus ===
          "suspended" ||
        currentStatus ===
          "archived"
      )
        ? "Reaktiviraj kao draft"
        : "Povuci u draft";

    case "suspended":
      return "Suspenduj";

    case "archived":
      return "Arhiviraj";
  }
}

export function getLifecycleConfirmationMessage(
  nextStatus:
    BusinessPublicationStatus
): string {
  switch (
    nextStatus
  ) {
    case "published":
      return "Objaviti tenant? Server će ponovo proveriti production readiness pre objave.";

    case "draft":
      return "Prebaciti tenant u draft? Javni sajt i booking neće biti dostupni.";

    case "suspended":
      return "Suspendovati tenant? Javni sajt i booking biće privremeno isključeni.";

    case "archived":
      return "Arhivirati tenant? Javni sajt i booking biće isključeni, a povratak ide prvo kroz draft.";
  }
}
