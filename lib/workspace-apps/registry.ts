import {
  WORKSPACE_APP_ROUTES,
} from "./route-contract";
import type {
  WorkspaceAppDefinition,
  WorkspaceAppKey,
} from "./types";

export const WORKSPACE_APP_REGISTRY = [
  {
    key: "studio",
    name: "Studio",
    shortName: "Studio",
    description:
      "Rezervacije, kalendar, klijenti, tim, usluge, sajt i svakodnevni rad salona.",
    status: "live",
    releasePolicy: "public",
    iconKey: "studio",
    navigation: "primary",
    order: 10,
    dependencies: [],
    roleAccess: {
      owner: {
        route:
          WORKSPACE_APP_ROUTES
            .studio.owner,
        requiredEntitlements: [
          "booking.management",
        ],
      },
      manager: {
        route:
          WORKSPACE_APP_ROUTES
            .studio.manager,
        requiredEntitlements: [
          "booking.management",
        ],
      },
      staff: {
        route:
          WORKSPACE_APP_ROUTES
            .studio.staff,
        requiredEntitlements: [
          "staff.portal",
        ],
      },
    },
  },
  {
    key: "content",
    name: "Content",
    shortName: "Content",
    description:
      "Blog, novosti, promocije, galerija i buduća projekcija sadržaja na Ordum Network.",
    status: "coming_soon",
    releasePolicy: "public",
    iconKey: "content",
    navigation: "primary",
    order: 20,
    dependencies: [
      "studio",
    ],
    roleAccess: {
      owner: {
        route:
          WORKSPACE_APP_ROUTES
            .content.owner,
        requiredEntitlements: [],
      },
      manager: {
        route:
          WORKSPACE_APP_ROUTES
            .content.manager,
        requiredEntitlements: [],
      },
    },
  },
  {
    key: "finance",
    name: "Finansije",
    shortName: "Finansije",
    description:
      "Operativni prihodi, troškovi, provizije, dokumenti i izvoz za knjigovođu.",
    status: "research",
    releasePolicy: "hidden",
    iconKey: "finance",
    navigation: "hidden",
    order: 30,
    dependencies: [
      "studio",
    ],
    roleAccess: {
      owner: {
        route:
          WORKSPACE_APP_ROUTES
            .finance.owner,
        requiredEntitlements: [],
      },
      manager: {
        route:
          WORKSPACE_APP_ROUTES
            .finance.manager,
        requiredEntitlements: [],
      },
    },
  },
  {
    key: "operations",
    name: "Operacije",
    shortName: "Operacije",
    description:
      "Dobavljači, nabavke, lager, oprema, održavanje i interni zadaci.",
    status: "research",
    releasePolicy: "hidden",
    iconKey: "operations",
    navigation: "hidden",
    order: 40,
    dependencies: [
      "studio",
    ],
    roleAccess: {
      owner: {
        route:
          WORKSPACE_APP_ROUTES
            .operations.owner,
        requiredEntitlements: [],
      },
      manager: {
        route:
          WORKSPACE_APP_ROUTES
            .operations.manager,
        requiredEntitlements: [],
      },
    },
  },
  {
    key: "store",
    name: "Prodavnica",
    shortName: "Store",
    description:
      "Tenant katalog proizvoda i buduća osnova za porudžbine i Network marketplace.",
    status: "research",
    releasePolicy: "hidden",
    iconKey: "store",
    navigation: "hidden",
    order: 50,
    dependencies: [
      "studio",
    ],
    roleAccess: {
      owner: {
        route:
          WORKSPACE_APP_ROUTES
            .store.owner,
        requiredEntitlements: [],
      },
      manager: {
        route:
          WORKSPACE_APP_ROUTES
            .store.manager,
        requiredEntitlements: [],
      },
    },
  },
] as const satisfies
  readonly WorkspaceAppDefinition[];

export function getWorkspaceAppRegistry():
  readonly WorkspaceAppDefinition[] {
  return WORKSPACE_APP_REGISTRY;
}

export function getWorkspaceAppDefinition(
  key: WorkspaceAppKey
): WorkspaceAppDefinition {
  const definition =
    WORKSPACE_APP_REGISTRY.find(
      (app) =>
        app.key === key
    );

  if (!definition) {
    throw new Error(
      `Nepoznata Workspace aplikacija: ${key}`
    );
  }

  return definition;
}
