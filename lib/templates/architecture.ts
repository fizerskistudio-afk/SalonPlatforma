import {
  TEMPLATE_KEYS,
  TEMPLATE_REGISTRY,
} from "./registry";

import type {
  TemplateArchitecture,
  TemplateKey,
  TemplateManifest,
} from "./registry";

export const PUBLIC_TEMPLATE_CONTRACT_VERSION =
  1 as const;

export const PUBLIC_TEMPLATE_CALLBACKS = [
  "onLocaleChange",
  "onBook",
  "onBookService",
  "onBookEmployee",
  "onSwitchToDesktop",
] as const;

export const PUBLIC_TEMPLATE_ACCEPTANCE_CAPABILITIES = [
  "desktop-renderer",
  "mobile-renderer",
  "modular-desktop",
  "dedicated-mobile-experience",
  "tenant-branding",
  "seven-language-ui",
  "central-translation-fallback",
  "general-booking",
  "service-preselection",
  "employee-preselection",
  "services",
  "team",
  "gallery",
  "reviews",
  "contact",
  "loading-state",
  "empty-state",
  "error-state",
  "keyboard-focus",
  "responsive-overflow",
  "production-build",
  "manual-booking-smoke",
] as const;

export type PublicTemplateCallback =
  (typeof PUBLIC_TEMPLATE_CALLBACKS)[number];

export type PublicTemplateAcceptanceCapability =
  (typeof PUBLIC_TEMPLATE_ACCEPTANCE_CAPABILITIES)[number];

export type TemplateArchitectureSnapshot = {
  key: TemplateKey;
  architecture: TemplateArchitecture;
  supportsReviews: boolean;
  availability:
    TemplateManifest["availability"];
};

export function getTemplateArchitectureSnapshot(
  key: TemplateKey
): TemplateArchitectureSnapshot {
  const manifest =
    TEMPLATE_REGISTRY[key];

  return {
    key,
    architecture:
      manifest.architecture,
    supportsReviews:
      manifest.supportsReviews,
    availability:
      manifest.availability,
  };
}

export function getTemplateArchitectureSnapshots():
  TemplateArchitectureSnapshot[] {
  return TEMPLATE_KEYS.map(
    getTemplateArchitectureSnapshot
  );
}

export function isModularTemplateArchitecture(
  architecture:
    TemplateArchitecture
): boolean {
  return (
    architecture.desktop ===
      "modular" &&
    (
      architecture.mobile ===
        "modular" ||
      architecture.mobile ===
        "app-shell"
    )
  );
}

export function isTemplateArchitectureAccepted(
  manifest: TemplateManifest
): boolean {
  return (
    isModularTemplateArchitecture(
      manifest.architecture
    ) &&
    manifest.architecture
      .acceptance !==
      "pending"
  );
}
