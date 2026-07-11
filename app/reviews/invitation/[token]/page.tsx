import type {
  Metadata,
} from "next";

import PublicReviewExperience from "@/components/reviews/PublicReviewExperience";
import {
  loadVerifiedReviewPageContext,
} from "@/lib/reviews/public-page";

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

export const metadata: Metadata = {
  title:
    "Potvrđena recenzija",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

type VerifiedReviewPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function VerifiedReviewPage({
  params,
}: VerifiedReviewPageProps) {
  const {
    token,
  } =
    await params;

  let context = null;

  try {
    context =
      await loadVerifiedReviewPageContext(
        token
      );
  } catch {
    context =
      null;
  }

  return (
    <PublicReviewExperience
      mode="verified"
      context={context}
      token={token}
    />
  );
}
