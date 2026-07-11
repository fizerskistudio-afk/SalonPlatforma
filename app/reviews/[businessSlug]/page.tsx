import type {
  Metadata,
} from "next";

import PublicReviewExperience from "@/components/reviews/PublicReviewExperience";
import {
  loadDirectReviewPageContext,
} from "@/lib/reviews/public-page";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export const metadata: Metadata = {
  title:
    "Ostavi recenziju",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

type DirectReviewPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

export default async function DirectReviewPage({
  params,
}: DirectReviewPageProps) {
  const {
    businessSlug,
  } =
    await params;

  let context = null;

  try {
    context =
      await loadDirectReviewPageContext(
        businessSlug
      );
  } catch {
    context =
      null;
  }

  return (
    <PublicReviewExperience
      mode="direct"
      context={context}
    />
  );
}
