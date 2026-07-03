import BusinessPresetExplorer from "@/components/platform-admin/BusinessPresetExplorer";

import {
  BUSINESS_PRESET_CURRENCIES,
  BUSINESS_PRESET_LOCALES,
  getBusinessPresetOptions,
} from "@/lib/business-presets";

export default function BusinessPresetsPage() {
  return (
    <BusinessPresetExplorer
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