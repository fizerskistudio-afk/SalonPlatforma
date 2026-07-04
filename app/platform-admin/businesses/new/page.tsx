import ContinueBusinessProvisioningCard from "@/components/platform-admin/ContinueBusinessProvisioningCard";
import NewBusinessWizard from "@/components/platform-admin/NewBusinessWizard";

import {
  BUSINESS_PRESET_CURRENCIES,
  BUSINESS_PRESET_LOCALES,
  getBusinessPresetOptions,
} from "@/lib/business-presets";

export default function NewBusinessPage() {
  return (
    <div
      className="
        space-y-8
      "
    >
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

      <ContinueBusinessProvisioningCard />
    </div>
  );
}