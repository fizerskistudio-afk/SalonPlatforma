import Link from "next/link";

import {
  Layers3,
  Sparkles,
} from "lucide-react";

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
      <section
        className="
          mx-auto
          max-w-7xl
          rounded-3xl
          border
          border-violet-400/20
          bg-violet-400/[0.07]
          p-5
          md:p-7
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-violet-300
                text-zinc-950
              "
            >
              <Layers3
                size={22}
              />
            </div>

            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-violet-200
                "
              >
                <Sparkles
                  size={16}
                />

                Novi 01B tok
              </div>

              <h2
                className="
                  mt-2
                  text-xl
                  font-semibold
                "
              >
                Starter Pack Business Builder
              </h2>

              <p
                className="
                  mt-2
                  max-w-3xl
                  text-sm
                  leading-6
                  text-zinc-400
                "
              >
                Izaberi jednu od deset branši,
                potvrdi module, usluge,
                trajanja, cene i theme pack,
                pa kreiraj pravi draft salon
                atomskim provisioningom.
              </p>
            </div>
          </div>

          <Link
            href="/platform-admin/businesses/new/starter-pack"
            className="
              inline-flex
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-white
              px-5
              py-3
              text-sm
              font-semibold
              text-zinc-950
              transition
              hover:bg-zinc-200
            "
          >
            Otvori Starter Pack Builder
          </Link>
        </div>
      </section>

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
