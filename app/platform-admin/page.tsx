import {
  BookOpenText,
  Boxes,
  Building2,
  Languages,
  LayoutTemplate,
  Plus,
  Settings2,
  Sparkles,
} from "lucide-react";

import {
  BUSINESS_PRESET_CURRENCIES,
  BUSINESS_PRESET_KEYS,
  BUSINESS_PRESET_LOCALES,
  getBusinessPresetOptions,
} from "@/lib/business-presets";

import {
  TEMPLATE_KEYS,
} from "@/lib/templates/registry";

const modules = [
  {
    title: "Saloni",
    description:
      "Pregled svih tenant-a, statusa i vlasnika.",
    icon: Building2,
    status: "Sledeće",
  },
  {
    title: "Novi salon",
    description:
      "Brzo kreiranje demo sajta i booking sistema.",
    icon: Plus,
    status: "Sledeće",
  },
  {
    title: "Business preseti",
    description:
      "Hair, barber, beauty, nails, massage i druge niše.",
    icon: Boxes,
    status: "Aktivno",
  },
  {
    title: "Template-i",
    description:
      "Vizuelni sistemi dostupni svim salonima.",
    icon: LayoutTemplate,
    status: "Aktivno",
  },
  {
    title: "Prevodi",
    description:
      "Globalni UI prevodi i jezički paketi.",
    icon: Languages,
    status: "Planirano",
  },
  {
    title: "Platform settings",
    description:
      "Globalna podešavanja, integracije i feature flags.",
    icon: Settings2,
    status: "Planirano",
  },
] as const;

export default function PlatformAdminPage() {
  const presetOptions =
    getBusinessPresetOptions(
      "sr-Latn"
    );

  return (
    <div
      className="
        mx-auto
        max-w-7xl
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-end
          md:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-amber-300
            "
          >
            <Sparkles
              size={17}
            />

            Kontrolni centar
          </div>

          <h2
            className="
              mt-3
              max-w-3xl
              text-3xl
              font-semibold
              tracking-tight
              md:text-4xl
            "
          >
            Jedno mesto za pokretanje
            i upravljanje celom
            platformom.
          </h2>

          <p
            className="
              mt-3
              max-w-2xl
              text-sm
              leading-6
              text-zinc-400
              md:text-base
            "
          >
            Salon admin ostaje
            operativni panel za
            rezervacije, zaposlene,
            usluge i raspored. Ovaj
            panel koristimo samo mi za
            globalni sistem.
          </p>
        </div>
      </div>

      <section
        className="
          mt-8
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          label="Poslovni preseti"
          value={
            BUSINESS_PRESET_KEYS.length
          }
          detail="Hair i barber"
        />

        <StatCard
          label="Template-i"
          value={
            TEMPLATE_KEYS.length
          }
          detail="Luxury i editorial"
        />

        <StatCard
          label="Preset jezici"
          value={
            BUSINESS_PRESET_LOCALES.length
          }
          detail="SR, EN i DE"
        />

        <StatCard
          label="Valute"
          value={
            BUSINESS_PRESET_CURRENCIES.length
          }
          detail="RSD, EUR i CHF"
        />
      </section>

      <section
        className="
          mt-10
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <BookOpenText
            size={20}
            className="
              text-zinc-400
            "
          />

          <div>
            <h3
              className="
                text-xl
                font-semibold
              "
            >
              Moduli platforme
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Razvijamo ih redom prema
              brzom onboarding flow-u.
            </p>
          </div>
        </div>

        <div
          className="
            mt-5
            grid
            gap-4
            md:grid-cols-2
            xl:grid-cols-3
          "
        >
          {modules.map(
            (module) => {
              const Icon =
                module.icon;

              return (
                <article
                  key={
                    module.title
                  }
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-white/10
                        text-white
                      "
                    >
                      <Icon
                        size={21}
                      />
                    </div>

                    <span
                      className="
                        rounded-full
                        border
                        border-white/10
                        px-3
                        py-1
                        text-xs
                        font-medium
                        text-zinc-400
                      "
                    >
                      {module.status}
                    </span>
                  </div>

                  <h4
                    className="
                      mt-5
                      text-lg
                      font-semibold
                    "
                  >
                    {module.title}
                  </h4>

                  <p
                    className="
                      mt-2
                      text-sm
                      leading-6
                      text-zinc-400
                    "
                  >
                    {
                      module.description
                    }
                  </p>
                </article>
              );
            }
          )}
        </div>
      </section>

      <section
        className="
          mt-10
          rounded-3xl
          border
          border-white/10
          bg-white/[0.03]
          p-5
          md:p-7
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <Boxes
            size={21}
            className="
              text-amber-300
            "
          />

          <div>
            <h3
              className="
                text-xl
                font-semibold
              "
            >
              Aktivni preseti
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Trenutno dostupne osnove
              za brzo kreiranje klijenta.
            </p>
          </div>
        </div>

        <div
          className="
            mt-5
            grid
            gap-4
            md:grid-cols-2
          "
        >
          {presetOptions.map(
            (preset) => (
              <article
                key={
                  preset.value
                }
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-zinc-950/60
                  p-5
                "
              >
                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <h4
                      className="
                        font-semibold
                      "
                    >
                      {preset.label}
                    </h4>

                    <p
                      className="
                        mt-2
                        text-sm
                        leading-6
                        text-zinc-400
                      "
                    >
                      {
                        preset.description
                      }
                    </p>
                  </div>

                  <span
                    className="
                      rounded-lg
                      bg-white/10
                      px-3
                      py-1.5
                      text-xs
                      text-zinc-300
                    "
                  >
                    {
                      preset
                        .recommendedTemplateKey
                    }
                  </span>
                </div>
              </article>
            )
          )}
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  detail: string;
};

function StatCard({
  label,
  value,
  detail,
}: StatCardProps) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-5
      "
    >
      <p
        className="
          text-sm
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-3
          text-3xl
          font-semibold
        "
      >
        {value}
      </p>

      <p
        className="
          mt-2
          text-xs
          font-medium
          uppercase
          tracking-wider
          text-zinc-400
        "
      >
        {detail}
      </p>
    </article>
  );
}