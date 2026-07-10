import {
  BUSINESS_PUBLICATION_LABELS,
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";

const STATUS_CLASSES:
  Record<
    BusinessPublicationStatus,
    string
  > = {
  draft:
    "border-amber-300/20 bg-amber-300/10 text-amber-200",
  published:
    "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
  suspended:
    "border-orange-300/20 bg-orange-300/10 text-orange-200",
  archived:
    "border-zinc-400/20 bg-zinc-400/10 text-zinc-400",
};

export default function BusinessPublicationBadge({
  status,
}: {
  status:
    BusinessPublicationStatus;
}) {
  return (
    <span
      className={[
        "inline-flex",
        "items-center",
        "rounded-full",
        "border",
        "px-3",
        "py-1",
        "text-xs",
        "font-semibold",
        STATUS_CLASSES[
          status
        ],
      ].join(" ")}
    >
      {
        BUSINESS_PUBLICATION_LABELS[
          status
        ]
      }
    </span>
  );
}
