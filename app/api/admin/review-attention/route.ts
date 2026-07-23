import {
  NextResponse,
} from "next/server";

import {
  getAdminReviewAttentionCount,
} from "@/lib/admin/reviews";
import {
  getAdminContext,
} from "@/lib/auth/admin";
import {
  measureAdminServerStep,
} from "@/lib/performance/admin-server-timing";
import {
  loadProductPackageAccessForBusinessId,
} from "@/lib/product-packages/access-server";
import {
  resolveProductFeatureGate,
} from "@/lib/product-packages/gates";

export const dynamic =
  "force-dynamic";

const NO_STORE_HEADERS = {
  "Cache-Control":
    "private, no-store, max-age=0",
};

export async function GET() {
  const admin =
    await getAdminContext();

  if (!admin) {
    return NextResponse.json(
      {
        count: 0,
      },
      {
        status: 401,
        headers:
          NO_STORE_HEADERS,
      }
    );
  }

  if (
    admin.mustChangePassword ||
    admin.requiresTenantSelection
  ) {
    return NextResponse.json(
      {
        count: 0,
      },
      {
        status: 403,
        headers:
          NO_STORE_HEADERS,
      }
    );
  }

  const productAccess =
    admin.productAccess ??
    await loadProductPackageAccessForBusinessId(
      admin.business.id
    );

  if (!productAccess) {
    return NextResponse.json(
      {
        count: 0,
      },
      {
        status: 503,
        headers:
          NO_STORE_HEADERS,
      }
    );
  }

  const reviewsDecision =
    resolveProductFeatureGate({
      access:
        productAccess.access,
      featureKey:
        "admin.reviews",
      permissionGranted:
        true,
      integrationConnected:
        true,
    });

  if (
    !reviewsDecision.allowed
  ) {
    return NextResponse.json(
      {
        count: 0,
      },
      {
        headers:
          NO_STORE_HEADERS,
      }
    );
  }

  const count =
    await measureAdminServerStep(
      "admin.reviewAttention.route",
      () =>
        getAdminReviewAttentionCount(
          admin.business.id
        )
    );

  return NextResponse.json(
    {
      count,
    },
    {
      headers:
        NO_STORE_HEADERS,
    }
  );
}
