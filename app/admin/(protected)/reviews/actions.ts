"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  requireAdmin,
} from "@/lib/auth/admin";
import {
  REVIEW_STATUSES,
  type ReviewStatus,
} from "@/lib/reviews/domain";
import {
  isModerationReasonRequired,
} from "@/lib/reviews/moderation";
import {
  createClient,
} from "@/lib/supabase/server";

export type ReviewManagementActionResult = {
  ok: boolean;
  message: string;
  reviewId?: string;
  status?: ReviewStatus;
};

export type ModerateReviewInput = {
  reviewId: string;
  nextStatus: ReviewStatus;
  reason?: string;
};

export type UpdateReviewOwnerReplyInput = {
  reviewId: string;
  reply: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const DATABASE_MESSAGES:
  Record<
    string,
    string
  > = {
  REVIEW_NOT_FOUND:
    "Recenzija nije pronađena.",
  REVIEW_FORBIDDEN:
    "Nemaš dozvolu da menjaš ovu recenziju.",
  REVIEW_TRANSITION_NOT_ALLOWED:
    "Izabrana promena statusa nije dozvoljena.",
  REVIEW_REASON_REQUIRED:
    "Unesi razlog za ovu moderation odluku.",
  REVIEW_REASON_TOO_LONG:
    "Razlog može imati najviše 500 karaktera.",
  REVIEW_REPLY_NOT_SUPPORTED:
    "Odgovor se za ovaj izvor vodi van platforme ili nije podržan.",
  REVIEW_REPLY_REQUIRES_PUBLISHED:
    "Odgovor je moguć samo na objavljenu platform recenziju.",
  REVIEW_REPLY_TOO_LONG:
    "Odgovor može imati najviše 2000 karaktera.",
  REVIEW_REPLY_TOO_SHORT:
    "Odgovor mora imati najmanje 2 karaktera.",
};

function extractDatabaseMessage(
  error: {
    message?: string | null;
    details?: string | null;
    hint?: string | null;
  },
  fallback: string
): string {
  const combined = [
    error.message,
    error.details,
    error.hint,
  ]
    .filter(
      (
        value
      ): value is string =>
        typeof value ===
          "string"
    )
    .join(" ")
    .toUpperCase();

  for (
    const [
      code,
      message,
    ] of
      Object.entries(
        DATABASE_MESSAGES
      )
  ) {
    if (
      combined.includes(
        code
      )
    ) {
      return message;
    }
  }

  return fallback;
}

function refreshReviewPages() {
  revalidatePath(
    "/admin"
  );

  revalidatePath(
    "/admin/reviews"
  );
}

export async function moderateReviewAction(
  input:
    ModerateReviewInput
): Promise<
  ReviewManagementActionResult
> {
  await requireAdmin();

  const reviewId =
    input.reviewId.trim();

  if (
    !UUID_PATTERN.test(
      reviewId
    )
  ) {
    return {
      ok: false,
      message:
        "Recenzija nema ispravan ID.",
    };
  }

  if (
    !REVIEW_STATUSES.includes(
      input.nextStatus
    )
  ) {
    return {
      ok: false,
      message:
        "Izabrani status nije ispravan.",
    };
  }

  const reason =
    input.reason
      ?.trim() ??
    "";

  if (
    isModerationReasonRequired(
      input.nextStatus
    ) &&
    reason.length < 3
  ) {
    return {
      ok: false,
      message:
        "Unesi razlog od najmanje 3 karaktera.",
    };
  }

  if (
    reason.length >
    500
  ) {
    return {
      ok: false,
      message:
        "Razlog može imati najviše 500 karaktera.",
    };
  }

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "moderate_review",
      {
        p_review_id:
          reviewId,
        p_next_status:
          input.nextStatus,
        p_reason:
          reason ||
          null,
      }
    );

  if (error) {
    return {
      ok: false,
      message:
        extractDatabaseMessage(
          error,
          "Status recenzije nije promenjen."
        ),
    };
  }

  const result =
    typeof data ===
      "object" &&
    data !== null &&
    !Array.isArray(data)
      ? data as Record<
          string,
          unknown
        >
      : null;

  refreshReviewPages();

  return {
    ok: true,
    reviewId,
    status:
      typeof result?.status ===
        "string" &&
      REVIEW_STATUSES.includes(
        result.status as ReviewStatus
      )
        ? result.status as
            ReviewStatus
        : input.nextStatus,
    message:
      input.nextStatus ===
        "published"
        ? "Recenzija je objavljena."
        : input.nextStatus ===
            "pending"
          ? "Recenzija je vraćena na čekanje."
          : input.nextStatus ===
              "rejected"
            ? "Recenzija je odbijena."
            : input.nextStatus ===
                "flagged"
              ? "Recenzija je označena za proveru."
              : "Recenzija je arhivirana.",
  };
}

export async function updateReviewOwnerReplyAction(
  input:
    UpdateReviewOwnerReplyInput
): Promise<
  ReviewManagementActionResult
> {
  await requireAdmin();

  const reviewId =
    input.reviewId.trim();

  if (
    !UUID_PATTERN.test(
      reviewId
    )
  ) {
    return {
      ok: false,
      message:
        "Recenzija nema ispravan ID.",
    };
  }

  const reply =
    input.reply.trim();

  if (
    reply.length === 1
  ) {
    return {
      ok: false,
      message:
        "Odgovor mora imati najmanje 2 karaktera.",
    };
  }

  if (
    reply.length >
    2000
  ) {
    return {
      ok: false,
      message:
        "Odgovor može imati najviše 2000 karaktera.",
    };
  }

  const supabase =
    await createClient();

  const {
    error,
  } =
    await supabase.rpc(
      "set_review_owner_reply",
      {
        p_review_id:
          reviewId,
        p_reply:
          reply,
      }
    );

  if (error) {
    return {
      ok: false,
      message:
        extractDatabaseMessage(
          error,
          "Odgovor nije sačuvan."
        ),
    };
  }

  refreshReviewPages();

  return {
    ok: true,
    reviewId,
    message:
      reply
        ? "Odgovor salona je sačuvan."
        : "Odgovor salona je uklonjen.",
  };
}
