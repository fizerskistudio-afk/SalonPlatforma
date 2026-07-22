import {
  getOrdumPwaSurface,
  type OrdumPwaIcon,
} from "./registry";

export type OrdumWebAppManifestShortcut = {
  name: string;
  short_name: string;
  description: string;
  url: string;
  icons:
    readonly OrdumPwaIcon[];
};

export type OrdumWebAppManifest = {
  id: string;
  name: string;
  short_name: string;
  description: string;
  lang: "sr-Latn";
  dir: "ltr";
  start_url: string;
  scope: string;
  display:
    "standalone";
  orientation: "any";
  background_color:
    string;
  theme_color:
    string;
  categories:
    readonly string[];
  icons:
    readonly OrdumPwaIcon[];
  shortcuts:
    readonly OrdumWebAppManifestShortcut[];
  prefer_related_applications:
    false;
};

export function createWorkspaceWebManifest():
  OrdumWebAppManifest {
  const workspace =
    getOrdumPwaSurface(
      "workspace"
    );

  if (
    workspace.exposure !==
      "manifest" ||
    !workspace.serviceWorkerPath ||
    !workspace.offlineFallbackPath
  ) {
    throw new Error(
      "Workspace PWA contract nije spreman za izlaganje."
    );
  }

  return {
    id: "/workspace",
    name:
      workspace.name,
    short_name:
      workspace.shortName,
    description:
      workspace.description,
    lang:
      "sr-Latn",
    dir: "ltr",
    start_url:
      workspace.startUrl,
    scope:
      workspace.scope,
    display:
      workspace.display,
    orientation: "any",
    background_color:
      workspace.backgroundColor,
    theme_color:
      workspace.themeColor,
    categories: [
      "business",
      "productivity",
    ],
    icons:
      workspace.icons,
    shortcuts:
      workspace.shortcuts.map(
        (shortcut) => ({
          name:
            shortcut.name,
          short_name:
            shortcut.shortName,
          description:
            shortcut.description,
          url:
            shortcut.url,
          icons:
            shortcut.icons,
        })
      ),
    prefer_related_applications:
      false,
  };
}
