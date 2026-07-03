"use client";

import {
  getTemplateManifest,
  normalizeTemplateConfig,
  resolveTemplateKey,
  type TemplateConfig,
  type TemplateKey,
  type TemplateViewport,
} from "@/lib/templates/registry";

import HairLuxuryDesktopTemplate from "./hair-luxury/HairLuxuryDesktopTemplate";
import HairLuxuryMobileTemplate from "./hair-luxury/HairLuxuryMobileTemplate";
import type {
  PublicTemplateProps,
} from "./template-props";

type TemplateRendererProps =
  PublicTemplateProps & {
    templateKey:
      TemplateKey;

    templateConfig:
      TemplateConfig;

    viewport:
      TemplateViewport;
  };

export default function TemplateRenderer({
  templateKey,
  templateConfig,
  viewport,
  ...templateProps
}: TemplateRendererProps) {
  const resolvedKey =
    resolveTemplateKey(
      templateKey
    );

  const normalizedConfig =
    normalizeTemplateConfig(
      templateConfig
    );

  const manifest =
    getTemplateManifest(
      resolvedKey
    );

  const configured =
    Object.keys(
      normalizedConfig
    ).length > 0;

  let content:
    React.ReactNode;

  switch (resolvedKey) {
    case "hair-luxury":
    default:
      content =
        viewport ===
        "mobile" ? (
          <HairLuxuryMobileTemplate
            {...templateProps}
          />
        ) : (
          <HairLuxuryDesktopTemplate
            {...templateProps}
          />
        );
  }

  return (
    <div
      className="contents"
      data-template={
        manifest.key
      }
      data-template-version={
        manifest.version
      }
      data-template-configured={
        configured
          ? "true"
          : "false"
      }
    >
      {content}
    </div>
  );
}
