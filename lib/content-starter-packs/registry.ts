import {
  STARTER_PACK_VERTICALS,
  type StarterPackManifest,
  type StarterPackVertical,
} from "@/lib/content-starter-packs/domain";
import {
  STARTER_PACK_MANIFESTS,
} from "@/lib/content-starter-packs/vertical-manifests";

export type StarterPackSummary = {
  id:
    StarterPackVertical;
  vertical:
    StarterPackVertical;
  version: 1;
  label: string;
  description: string;
  categoryCount: number;
  serviceCount: number;
  staffRoleCount: number;
};

export const STARTER_PACK_REGISTRY =
  Object.freeze(
    Object.fromEntries(
      STARTER_PACK_MANIFESTS.map(
        (
          manifest
        ) => [
          manifest.id,
          manifest,
        ]
      )
    )
  ) as unknown as
    Readonly<
      Record<
        StarterPackVertical,
        StarterPackManifest
      >
    >;

export function listStarterPackSummaries():
  StarterPackSummary[] {
  return STARTER_PACK_VERTICALS.map(
    (
      id
    ) => {
      const manifest =
        STARTER_PACK_REGISTRY[
          id
        ];

      return {
        id:
          manifest.id,
        vertical:
          manifest.vertical,
        version:
          manifest.version,
        label:
          manifest.label,
        description:
          manifest.description,
        categoryCount:
          manifest.categories.length,
        serviceCount:
          manifest.services.length,
        staffRoleCount:
          manifest.staffRoles.length,
      };
    }
  );
}

export function getStarterPackManifest(
  id:
    StarterPackVertical
): StarterPackManifest {
  return STARTER_PACK_REGISTRY[
    id
  ];
}
