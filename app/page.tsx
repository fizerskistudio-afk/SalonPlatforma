import SalonPlatform from "@/components/SalonPlatform";
import { DEFAULT_BUSINESS_SLUG } from "@/lib/business/defaults";
import { getBusinessTemplateRuntime } from "@/lib/templates/server";

export const dynamic =
  "force-dynamic";

export default async function Home() {
  const template =
    await getBusinessTemplateRuntime(
      DEFAULT_BUSINESS_SLUG
    );

  return (
    <SalonPlatform
      businessSlug={
        DEFAULT_BUSINESS_SLUG
      }
      templateKey={
        template.key
      }
      templateConfig={
        template.config
      }
    />
  );
}
