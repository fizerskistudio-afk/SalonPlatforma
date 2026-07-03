import NewBusinessWizard from "@/components/platform-admin/NewBusinessWizard";

import {
  BUSINESS_PRESET_CURRENCIES,
  BUSINESS_PRESET_LOCALES,
  getBusinessPresetOptions,
} from "@/lib/business-presets";

export default function NewBusinessPage() {
  return (
    <NewBusinessWizard
      presets={
        getBusinessPresetOptions(
          "sr-Latn"
        )
      }
      locales={[
        ...BUSINESS_PRESET_LOCALES,
      ]}
      currencies={[
        ...BUSINESS_PRESET_CURRENCIES,
      ]}
    />
  );
}