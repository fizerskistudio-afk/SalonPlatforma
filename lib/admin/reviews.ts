import "server-only";

import {
  requireAdmin,
} from "@/lib/auth/admin";
import {
  resolveReviewBadgeKind,
  type ReviewBadgeKind,
  type ReviewSource,
  type ReviewStatus,
} from "@/lib/reviews/domain";
import {
  canUsePlatformOwnerReply,
  getAllowedReviewStatusTransitions,
} from "@/lib/reviews/moderation";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export type AdminReviewModerationEvent = {
  action:
    | "status_changed"
    | "reply_set"
    | "reply_removed";
  previousStatus:
    | ReviewStatus
    | null;
  nextStatus:
    | ReviewStatus
    | null;
  reason: string | null;
  createdAt: string;
};

export type AdminReviewItem = {
  id: string;
  source: ReviewSource;
  status: ReviewStatus;
  badge: ReviewBadgeKind;
  authorName: string;
  rating: number | null;
  body: string;
  languageCode: string | null;
  isVerifiedVisit: boolean;
  ownerReply: string | null;
  ownerReplyAt: string | null;
  createdAt: string;
  publishedAt: string | null;
  moderatedAt: string | null;
  bookingReference: string | null;
  bookingStartsAt: string | null;
  serviceName: string | null;
  employeeName: string | null;
  latestModeration:
    | AdminReviewModerationEvent
    | null;
  allowedTransitions:
    readonly ReviewStatus[];
  canReply: boolean;
};

export type AdminReviewManagementData = {
  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
  };
  role:
    | "owner"
    | "manager";
  summary: {
    total: number;
    attention: number;
    pending: number;
    published: number;
    rejected: number;
    flagged: number;
    archived: number;
  };
  reviews: AdminReviewItem[];
};

type ReviewRow = {
  id: string;
  source: ReviewSource;
  status: ReviewStatus;
  booking_id: string | null;
  service_id: string | null;
  employee_id: string | null;
  author_name: string;
  rating: number | null;
  body: string;
  language_code: string | null;
  is_verified_visit: boolean;
  owner_reply: string | null;
  owner_reply_at: string | null;
  created_at: string;
  published_at: string | null;
  moderated_at: string | null;
};

type EventRow = {
  review_id: string;
  action:
    | "status_changed"
    | "reply_set"
    | "reply_removed";
  previous_status:
    | ReviewStatus
    | null;
  next_status:
    | ReviewStatus
    | null;
  reason: string | null;
  created_at: string;
};

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
};

type BookingRow = {
  id: string;
  reference_code: string;
  starts_at: string;
};

type ServiceRow = {
  id: string;
  name: unknown;
};

type EmployeeRow = {
  id: string;
  name: string;
};

function unique(
  values: Array<string | null>
): string[] {
  return [
    ...new Set(
      values.filter(
        (
          value
        ): value is string =>
          Boolean(value)
      )
    ),
  ];
}

function getLocalizedValue(
  value: unknown
): string {
  if (
    typeof value === "string"
  ) {
    return value.trim();
  }

  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value)
  ) {
    return "";
  }

  const record =
    value as Record<
      string,
      unknown
    >;

  for (
    const locale of [
      "sr-Latn",
      "en",
      "mk",
      "hr",
      "sq",
      "de",
      "fr",
    ]
  ) {
    const candidate =
      record[locale];

    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return "";
}

function sortReviews(
  reviews: ReviewRow[]
): ReviewRow[] {
  const priority:
    Record<
      ReviewStatus,
      number
    > = {
    pending: 0,
    flagged: 1,
    published: 2,
    rejected: 3,
    archived: 4,
  };

  return [
    ...reviews,
  ].sort(
    (
      first,
      second
    ) =>
      priority[
        first.status
      ] -
        priority[
          second.status
        ] ||
      new Date(
        second.created_at
      ).getTime() -
        new Date(
          first.created_at
        ).getTime()
  );
}

export async function getAdminReviewAttentionCount(
  businessId: string
): Promise<number> {
  try {
    const supabase =
      createAdminClient();

    const {
      count,
      error,
    } =
      await supabase
        .from("reviews")
        .select(
          "id",
          {
            count: "exact",
            head: true,
          }
        )
        .eq(
          "business_id",
          businessId
        )
        .in(
          "status",
          [
            "pending",
            "flagged",
          ]
        );

    if (error) {
      console.error(
        "Review attention count could not be loaded:",
        {
          businessId,
          message:
            error.message,
        }
      );

      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error(
      "Unexpected review attention count error:",
      {
        businessId,
        error,
      }
    );

    return 0;
  }
}

export async function getAdminReviewManagement():
  Promise<
    AdminReviewManagementData
  > {
  const admin =
    await requireAdmin();

  const supabase =
    createAdminClient();

  const [
    businessResult,
    reviewsResult,
    eventsResult,
  ] =
    await Promise.all([
      supabase
        .from("businesses")
        .select(
          "id, name, slug, timezone"
        )
        .eq(
          "id",
          admin.business.id
        )
        .maybeSingle(),

      supabase
        .from("reviews")
        .select(
          `
            id,
            source,
            status,
            booking_id,
            service_id,
            employee_id,
            author_name,
            rating,
            body,
            language_code,
            is_verified_visit,
            owner_reply,
            owner_reply_at,
            created_at,
            published_at,
            moderated_at
          `
        )
        .eq(
          "business_id",
          admin.business.id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(200),

      supabase
        .from(
          "review_moderation_events"
        )
        .select(
          `
            review_id,
            action,
            previous_status,
            next_status,
            reason,
            created_at
          `
        )
        .eq(
          "business_id",
          admin.business.id
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(500),
    ]);

  if (
    businessResult.error ||
    !businessResult.data
  ) {
    throw new Error(
      `Salon za review moderation nije moguće učitati: ${
        businessResult.error
          ?.message ??
        "salon nije pronađen"
      }`
    );
  }

  if (
    reviewsResult.error
  ) {
    throw new Error(
      `Recenzije nije moguće učitati: ${reviewsResult.error.message}`
    );
  }

  if (
    eventsResult.error
  ) {
    throw new Error(
      `Review audit nije moguće učitati: ${eventsResult.error.message}`
    );
  }

  const business =
    businessResult.data as unknown as
      BusinessRow;

  const reviewRows =
    (
      reviewsResult.data ??
      []
    ) as unknown as
      ReviewRow[];

  const eventRows =
    (
      eventsResult.data ??
      []
    ) as unknown as
      EventRow[];

  const bookingIds =
    unique(
      reviewRows.map(
        (
          review
        ) =>
          review.booking_id
      )
    );

  const serviceIds =
    unique(
      reviewRows.map(
        (
          review
        ) =>
          review.service_id
      )
    );

  const employeeIds =
    unique(
      reviewRows.map(
        (
          review
        ) =>
          review.employee_id
      )
    );

  const [
    bookingsResult,
    servicesResult,
    employeesResult,
  ] =
    await Promise.all([
      bookingIds.length >
      0
        ? supabase
            .from("bookings")
            .select(
              "id, reference_code, starts_at"
            )
            .in(
              "id",
              bookingIds
            )
        : Promise.resolve({
            data: [],
            error: null,
          }),

      serviceIds.length >
      0
        ? supabase
            .from("services")
            .select(
              "id, name"
            )
            .in(
              "id",
              serviceIds
            )
        : Promise.resolve({
            data: [],
            error: null,
          }),

      employeeIds.length >
      0
        ? supabase
            .from("employees")
            .select(
              "id, name"
            )
            .in(
              "id",
              employeeIds
            )
        : Promise.resolve({
            data: [],
            error: null,
          }),
    ]);

  const lookupError =
    bookingsResult.error ??
    servicesResult.error ??
    employeesResult.error;

  if (lookupError) {
    throw new Error(
      `Review povezani podaci nisu mogli da se učitaju: ${lookupError.message}`
    );
  }

  const bookings =
    new Map(
      (
        bookingsResult.data ??
        []
      )
        .map(
          (row) => {
            const booking =
              row as unknown as
                BookingRow;

            return [
              booking.id,
              booking,
            ] as const;
          }
        )
    );

  const services =
    new Map(
      (
        servicesResult.data ??
        []
      )
        .map(
          (row) => {
            const service =
              row as unknown as
                ServiceRow;

            return [
              service.id,
              service,
            ] as const;
          }
        )
    );

  const employees =
    new Map(
      (
        employeesResult.data ??
        []
      )
        .map(
          (row) => {
            const employee =
              row as unknown as
                EmployeeRow;

            return [
              employee.id,
              employee,
            ] as const;
          }
        )
    );

  const latestEventByReview =
    new Map<
      string,
      EventRow
    >();

  for (
    const event of eventRows
  ) {
    if (
      !latestEventByReview.has(
        event.review_id
      )
    ) {
      latestEventByReview.set(
        event.review_id,
        event
      );
    }
  }

  const reviews =
    sortReviews(
      reviewRows
    ).map(
      (
        review
      ): AdminReviewItem => {
        const booking =
          review.booking_id
            ? bookings.get(
                review.booking_id
              )
            : undefined;

        const service =
          review.service_id
            ? services.get(
                review.service_id
              )
            : undefined;

        const employee =
          review.employee_id
            ? employees.get(
                review.employee_id
              )
            : undefined;

        const latestEvent =
          latestEventByReview.get(
            review.id
          );

        return {
          id: review.id,
          source: review.source,
          status: review.status,
          badge:
            resolveReviewBadgeKind(
              review.source,
              review.is_verified_visit
            ),
          authorName:
            review.author_name,
          rating:
            review.rating,
          body:
            review.body,
          languageCode:
            review.language_code,
          isVerifiedVisit:
            review.is_verified_visit,
          ownerReply:
            review.owner_reply,
          ownerReplyAt:
            review.owner_reply_at,
          createdAt:
            review.created_at,
          publishedAt:
            review.published_at,
          moderatedAt:
            review.moderated_at,
          bookingReference:
            booking
              ?.reference_code ??
            null,
          bookingStartsAt:
            booking
              ?.starts_at ??
            null,
          serviceName:
            service
              ? getLocalizedValue(
                  service.name
                ) ||
                null
              : null,
          employeeName:
            employee
              ?.name ??
            null,
          latestModeration:
            latestEvent
              ? {
                  action:
                    latestEvent.action,
                  previousStatus:
                    latestEvent
                      .previous_status,
                  nextStatus:
                    latestEvent
                      .next_status,
                  reason:
                    latestEvent.reason,
                  createdAt:
                    latestEvent
                      .created_at,
                }
              : null,
          allowedTransitions:
            getAllowedReviewStatusTransitions(
              review.status
            ),
          canReply:
            canUsePlatformOwnerReply(
              review.source,
              review.status
            ),
        };
      }
    );

  const countStatus = (
    status:
      ReviewStatus
  ) =>
    reviews.filter(
      (
        review
      ) =>
        review.status ===
        status
    ).length;

  return {
    business: {
      id: business.id,
      name: business.name,
      slug: business.slug,
      timezone:
        business.timezone,
    },
    role:
      admin.role,
    summary: {
      total:
        reviews.length,
      attention:
        countStatus(
          "pending"
        ) +
        countStatus(
          "flagged"
        ),
      pending:
        countStatus(
          "pending"
        ),
      published:
        countStatus(
          "published"
        ),
      rejected:
        countStatus(
          "rejected"
        ),
      flagged:
        countStatus(
          "flagged"
        ),
      archived:
        countStatus(
          "archived"
        ),
    },
    reviews,
  };
}
