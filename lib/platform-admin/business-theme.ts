import type {
  PlannedTemplatePack,
  TemplateKey,
  TemplateManifest,
} from "@/lib/templates/registry";

export type BusinessThemeSummary = {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  templateKey:
    TemplateKey;
  updatedAt: string;
};

export type BusinessThemeData = {
  business:
    BusinessThemeSummary;
  templates:
    TemplateManifest[];
  plannedTemplates:
    PlannedTemplatePack[];
};

export type BusinessThemeMutationResponse = {
  ok: boolean;
  message: string;
  business?: {
    templateKey:
      TemplateKey;
    updatedAt:
      string;
  };
  code?: string;
};
