import type {
  Metadata,
} from "next";

import type {
  ReactNode,
} from "react";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

type BusinessLayoutProps = {
  children: ReactNode;

  params: Promise<{
    businessSlug: string;
  }>;
};

type BusinessNameRow = {
  name: string;
};

export async function generateMetadata({
  params,
}: BusinessLayoutProps): Promise<Metadata> {
  const {
    businessSlug,
  } =
    await params;

  const adminClient =
    createAdminClient();

  const {
    data,
    error,
  } = await adminClient
    .from(
      "businesses"
    )
    .select(
      "name"
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (
    error ||
    !data
  ) {
    return {
      title:
        "Salon",
    };
  }

  const business =
    data as unknown as
      BusinessNameRow;

  return {
    title: {
      default:
        business.name,

      template:
        `%s | ${business.name}`,
    },
  };
}

export default function BusinessLayout({
  children,
}: BusinessLayoutProps) {
  return children;
}
