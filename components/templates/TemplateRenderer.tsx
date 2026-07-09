"use client";

import {
  getTemplateManifest,
  normalizeTemplateConfig,
  resolveTemplateKey,
  type TemplateConfig,
  type TemplateKey,
  type TemplateViewport,
} from "@/lib/templates/registry";
import type { PublicTemplateProps } from "./template-props";
import HairLuxuryDesktopTemplate from "./hair-luxury/HairLuxuryDesktopTemplate";
import HairLuxuryMobileTemplate from "./hair-luxury/HairLuxuryMobileTemplate";
import HairEditorialDesktopTemplate from "./hair-editorial/HairEditorialDesktopTemplate";
import HairEditorialMobileTemplate from "./hair-editorial/HairEditorialMobileTemplate";
import BarberHeritageDesktopTemplate from "./barber-heritage/BarberHeritageDesktopTemplate";
import BarberHeritageMobileTemplate from "./barber-heritage/BarberHeritageMobileTemplate";

type TemplateRendererProps = PublicTemplateProps & {
  templateKey: TemplateKey;
  templateConfig: TemplateConfig;
  viewport: TemplateViewport;
};

export default function TemplateRenderer({
  templateKey,
  templateConfig,
  viewport,
  ...props
}: TemplateRendererProps) {
  const resolvedKey = resolveTemplateKey(templateKey);
  const normalizedConfig = normalizeTemplateConfig(templateConfig);
  const manifest = getTemplateManifest(resolvedKey);

  const configured = Object.keys(normalizedConfig).length > 0;

  let content: React.ReactNode = null;

  switch (resolvedKey) {
    case "hair-luxury":
      content =
        viewport === "mobile" ? (
          <HairLuxuryMobileTemplate {...props} />
        ) : (
          <HairLuxuryDesktopTemplate {...props} />
        );
      break;

    case "hair-editorial":
      content =
        viewport === "mobile" ? (
          <HairEditorialMobileTemplate {...props} />
        ) : (
          <HairEditorialDesktopTemplate {...props} />
        );
      break;

    case "barber-heritage":
      content =
        viewport === "mobile" ? (
          <BarberHeritageMobileTemplate {...props} />
        ) : (
          <BarberHeritageDesktopTemplate {...props} />
        );
      break;

    default:
      content =
        viewport === "mobile" ? (
          <HairLuxuryMobileTemplate {...props} />
        ) : (
          <HairLuxuryDesktopTemplate {...props} />
        );
      break;
  }

  return (
    <div
      className="contents"
      data-template={manifest.key}
      data-template-version={manifest.version}
      data-template-configured={configured ? "true" : "false"}
    >
      {content}
    </div>
  );
}
