import StarterPackBusinessWizard from "@/components/platform-admin/StarterPackBusinessWizard";

import {
  listStarterPackSummaries,
} from "@/lib/content-starter-packs/registry";

import {
  getTemplateManifests,
} from "@/lib/templates/registry";

export default function StarterPackBusinessPage() {
  const packs =
    listStarterPackSummaries();

  const templates =
    getTemplateManifests().map(
      (
        template
      ) => ({
        key:
          template.key,
        name:
          template.name,
        description:
          template.description,
        businessType:
          template.businessType,
        availability:
          template.availability,
      })
    );

  return (
    <StarterPackBusinessWizard
      packs={
        packs
      }
      templates={
        templates
      }
    />
  );
}
