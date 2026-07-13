import {
  buildTenantPublicUrl,
} from "@/lib/tenancy/hostname";

export type BusinessPublicLinks = {
  publicUrl: string;
  previewUrl: string;
};

export function buildBusinessPublicLinks(
  businessSlug: string
): BusinessPublicLinks {
  const publicUrl =
    buildTenantPublicUrl(
      businessSlug
    );

  return {
    publicUrl,
    previewUrl:
      `${publicUrl}?preview=1`,
  };
}
