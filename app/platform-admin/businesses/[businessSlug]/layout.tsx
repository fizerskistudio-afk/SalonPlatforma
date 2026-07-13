import type {
  Metadata,
} from "next";
import {
  notFound,
} from "next/navigation";
import {
  cache,
  type ReactNode,
} from "react";

import TenantWorkspaceNavigation from "@/components/platform-admin/TenantWorkspaceNavigation";
import {
  resolveBusinessPublicationStatus,
} from "@/lib/publishing/status";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

type BusinessLayoutProps = {
  children: ReactNode;
  params: Promise<{
    businessSlug: string;
  }>;
};

type BusinessWorkspaceRow = {
  slug: string;
  name: string;
  publication_status: string | null;
  is_active: boolean;
};

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const loadBusinessWorkspaceIdentity =
  cache(
    async (
      rawBusinessSlug: string
    ): Promise<BusinessWorkspaceRow | null> => {
      const businessSlug =
        rawBusinessSlug
          .trim()
          .toLowerCase();

      if (
        !BUSINESS_SLUG_PATTERN.test(
          businessSlug
        )
      ) {
        return null;
      }

      const adminClient =
        createAdminClient();
      const {
        data,
        error,
      } = await adminClient
        .from("businesses")
        .select(
          "slug, name, publication_status, is_active"
        )
        .eq(
          "slug",
          businessSlug
        )
        .maybeSingle();

      if (error) {
        console.error(
          "Tenant workspace identity query failed:",
          error
        );
        return null;
      }

      return data
        ? data as unknown as
            BusinessWorkspaceRow
        : null;
    }
  );

export async function generateMetadata({
  params,
}: BusinessLayoutProps): Promise<Metadata> {
  const {
    businessSlug,
  } = await params;
  const business =
    await loadBusinessWorkspaceIdentity(
      businessSlug
    );

  if (!business) {
    return {
      title: "Salon",
    };
  }

  return {
    title: {
      default: business.name,
      template:
        `%s | ${business.name}`,
    },
  };
}

export default async function BusinessLayout({
  children,
  params,
}: BusinessLayoutProps) {
  const {
    businessSlug,
  } = await params;
  const business =
    await loadBusinessWorkspaceIdentity(
      businessSlug
    );

  if (!business) {
    notFound();
  }

  return (
    <div className="min-w-0">
      <TenantWorkspaceNavigation
        businessName={
          business.name
        }
        businessSlug={
          business.slug
        }
        publicationStatus={
          resolveBusinessPublicationStatus(
            business.publication_status,
            business.is_active
          )
        }
      />

      <div className="pt-6">
        {children}
      </div>
    </div>
  );
}
