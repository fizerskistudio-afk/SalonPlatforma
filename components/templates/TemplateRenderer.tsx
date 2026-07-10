"use client";

import dynamic from "next/dynamic";

import {
  getTemplateManifest,
  normalizeTemplateConfig,
  resolveTemplateKey,
  type TemplateConfig,
  type TemplateKey,
  type TemplateViewport,
} from "@/lib/templates/registry";
import type { PublicTemplateProps } from "./template-props";

const HairLuxuryDesktopTemplate =
  dynamic<PublicTemplateProps>(
    () =>
      import(
        "./hair-luxury/HairLuxuryDesktopTemplate"
      ),
    {
      loading: () => null,
    }
  );

const HairLuxuryMobileTemplate =
  dynamic<PublicTemplateProps>(
    () =>
      import(
        "./hair-luxury/HairLuxuryMobileTemplate"
      ),
    {
      loading: () => null,
    }
  );

const HairEditorialDesktopTemplate =
  dynamic<PublicTemplateProps>(
    () =>
      import(
        "./hair-editorial/HairEditorialDesktopTemplate"
      ),
    {
      loading: () => null,
    }
  );

const HairEditorialMobileTemplate =
  dynamic<PublicTemplateProps>(
    () =>
      import(
        "./hair-editorial/HairEditorialMobileTemplate"
      ),
    {
      loading: () => null,
    }
  );

const BarberHeritageDesktopTemplate =
  dynamic<PublicTemplateProps>(
    () =>
      import(
        "./barber-heritage/BarberHeritageDesktopTemplate"
      ),
    {
      loading: () => null,
    }
  );

const BarberHeritageMobileTemplate =
  dynamic<PublicTemplateProps>(
    () =>
      import(
        "./barber-heritage/BarberHeritageMobileTemplate"
      ),
    {
      loading: () => null,
    }
  );

type TemplateRendererProps =
  PublicTemplateProps & {
    templateKey: TemplateKey;
    templateConfig: TemplateConfig;
    viewport: TemplateViewport;
  };

function renderActiveTemplate(
  templateKey: TemplateKey,
  viewport: TemplateViewport,
  props: PublicTemplateProps
) {
  switch (templateKey) {
    case "hair-editorial":
      return viewport === "mobile" ? (
        <HairEditorialMobileTemplate
          {...props}
        />
      ) : (
        <HairEditorialDesktopTemplate
          {...props}
        />
      );

    case "barber-heritage":
      return viewport === "mobile" ? (
        <BarberHeritageMobileTemplate
          {...props}
        />
      ) : (
        <BarberHeritageDesktopTemplate
          {...props}
        />
      );

    case "hair-luxury":
    default:
      return viewport === "mobile" ? (
        <HairLuxuryMobileTemplate
          {...props}
        />
      ) : (
        <HairLuxuryDesktopTemplate
          {...props}
        />
      );
  }
}

export default function TemplateRenderer({
  templateKey,
  templateConfig,
  viewport,
  ...props
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

  const content =
    renderActiveTemplate(
      resolvedKey,
      viewport,
      props
    );

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
