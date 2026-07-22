export const ORDUM_PWA_SURFACE_KEYS = [
  "workspace",
  "network",
] as const;

export type OrdumPwaSurfaceKey =
  (typeof ORDUM_PWA_SURFACE_KEYS)[number];

export type OrdumPwaSurfaceStatus =
  | "live_foundation"
  | "planned";

export type OrdumPwaExposure =
  | "manifest"
  | "contract_only";

export type OrdumPwaIcon = {
  src: string;
  sizes: string;
  type: "image/png";
  purpose:
    | "any"
    | "maskable";
};

export type OrdumPwaShortcut = {
  name: string;
  shortName: string;
  description: string;
  url: string;
  icons:
    readonly OrdumPwaIcon[];
};

export type OrdumPwaSurfaceDefinition = {
  key:
    OrdumPwaSurfaceKey;
  name: string;
  shortName: string;
  description: string;
  status:
    OrdumPwaSurfaceStatus;
  exposure:
    OrdumPwaExposure;
  manifestPath: string;
  startUrl: string;
  scope: string;
  display:
    "standalone";
  backgroundColor: string;
  themeColor: string;
  icons:
    readonly OrdumPwaIcon[];
  shortcuts:
    readonly OrdumPwaShortcut[];
  serviceWorkerPath:
    string | null;
  offlineFallbackPath:
    string | null;
  screenshotOwner:
    OrdumPwaSurfaceKey;
  screenshots:
    readonly [];
};

const WORKSPACE_ICONS =
  [
    {
      src:
        "/pwa/workspace/icon-192.png",
      sizes:
        "192x192",
      type:
        "image/png",
      purpose:
        "any",
    },
    {
      src:
        "/pwa/workspace/icon-512.png",
      sizes:
        "512x512",
      type:
        "image/png",
      purpose:
        "any",
    },
    {
      src:
        "/pwa/workspace/maskable-512.png",
      sizes:
        "512x512",
      type:
        "image/png",
      purpose:
        "maskable",
    },
  ] as const satisfies
    readonly OrdumPwaIcon[];

const NETWORK_ICONS =
  [
    {
      src:
        "/icons/icon-192.png",
      sizes:
        "192x192",
      type:
        "image/png",
      purpose:
        "any",
    },
    {
      src:
        "/icons/icon-512.png",
      sizes:
        "512x512",
      type:
        "image/png",
      purpose:
        "any",
    },
    {
      src:
        "/icons/maskable-512.png",
      sizes:
        "512x512",
      type:
        "image/png",
      purpose:
        "maskable",
    },
  ] as const satisfies
    readonly OrdumPwaIcon[];

export const ORDUM_PWA_SURFACES = {
  workspace: {
    key: "workspace",
    name:
      "Ordum Workspace",
    shortName:
      "Workspace",
    description:
      "Privatni poslovni prostor za aplikacije aktivnog Ordum biznisa.",
    status:
      "live_foundation",
    exposure:
      "manifest",
    manifestPath:
      "/workspace.webmanifest",
    startUrl:
      "/workspace",
    scope: "/",
    display:
      "standalone",
    backgroundColor:
      "#09090a",
    themeColor:
      "#fcd34d",
    icons:
      WORKSPACE_ICONS,
    shortcuts: [
      {
        name:
          "Studio — vlasnik ili menadžer",
        shortName:
          "Studio admin",
        description:
          "Otvori postojeći owner/manager Studio tok.",
        url:
          "/admin",
        icons: [
          WORKSPACE_ICONS[0],
        ],
      },
      {
        name:
          "Studio — član tima",
        shortName:
          "Moj raspored",
        description:
          "Otvori postojeći ograničeni staff tok.",
        url:
          "/staff",
        icons: [
          WORKSPACE_ICONS[0],
        ],
      },
    ],
    serviceWorkerPath:
      "/ordum-workspace-sw.js",
    offlineFallbackPath:
      "/pwa/workspace/offline.html",
    screenshotOwner:
      "workspace",
    screenshots: [],
  },

  network: {
    key: "network",
    name:
      "Ordum Network",
    shortName:
      "Network",
    description:
      "Planirana javna discovery i booking-handoff površina Ordum platforme.",
    status:
      "planned",
    exposure:
      "contract_only",
    manifestPath:
      "/network.webmanifest",
    startUrl: "/",
    scope: "/",
    display:
      "standalone",
    backgroundColor:
      "#09090a",
    themeColor:
      "#09090a",
    icons:
      NETWORK_ICONS,
    shortcuts: [],
    serviceWorkerPath:
      null,
    offlineFallbackPath:
      null,
    screenshotOwner:
      "network",
    screenshots: [],
  },
} as const satisfies
  Record<
    OrdumPwaSurfaceKey,
    OrdumPwaSurfaceDefinition
  >;

export function getOrdumPwaSurface(
  key:
    OrdumPwaSurfaceKey
): OrdumPwaSurfaceDefinition {
  return ORDUM_PWA_SURFACES[
    key
  ];
}
