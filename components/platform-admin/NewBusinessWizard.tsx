"use client";

import {
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  FileText,
  Globe2,
  Languages,
  LayoutTemplate,
  Link2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Tag,
} from "lucide-react";

import type {
  BusinessPresetCurrency,
  BusinessPresetKey,
  BusinessPresetLocale,
  MaterializedBusinessPreset,
} from "@/lib/business-presets";

type PresetOption = {
  value: BusinessPresetKey;
  label: string;
  description: string;
  recommendedTemplateKey: string;
};

type NewBusinessWizardProps = {
  presets:
    readonly PresetOption[];

  locales:
    readonly BusinessPresetLocale[];

  currencies:
    readonly BusinessPresetCurrency[];
};

type PreviewApiResponse =
  | {
      ok: true;
      preview:
        MaterializedBusinessPreset;
    }
  | {
      ok: false;
      message: string;
      code: string;
    };

type PreparedBusinessDraft = {
  business: {
    name: string;
    slug: string;
    city: string;
    country: string;
    email: string | null;
    phone: string;
  };

  provisioning:
    MaterializedBusinessPreset;

  preparedAt: string;
};

const localeLabels:
  Record<
    BusinessPresetLocale,
    string
  > = {
    "sr-Latn":
      "Srpski",
    en:
      "English",
    de:
      "Deutsch",
  };

const currencyLabels:
  Record<
    BusinessPresetCurrency,
    string
  > = {
    RSD:
      "RSD — srpski dinar",
    EUR:
      "EUR — evro",
    CHF:
      "CHF — švajcarski franak",
  };

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default function NewBusinessWizard({
  presets,
  locales,
  currencies,
}: NewBusinessWizardProps) {
  const initialPresetKey =
    presets[0]?.value ??
    "hair-salon";

  const [
    businessName,
    setBusinessName,
  ] =
    useState("");

  const [
    businessSlug,
    setBusinessSlug,
  ] =
    useState("");

  const [
    slugWasEdited,
    setSlugWasEdited,
  ] =
    useState(false);

  const [
    city,
    setCity,
  ] =
    useState("");

  const [
    country,
    setCountry,
  ] =
    useState("Serbia");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    phone,
    setPhone,
  ] =
    useState("");

  const [
    presetKey,
    setPresetKey,
  ] =
    useState<BusinessPresetKey>(
      initialPresetKey
    );

  const [
    locale,
    setLocale,
  ] =
    useState<BusinessPresetLocale>(
      "sr-Latn"
    );

  const [
    currency,
    setCurrency,
  ] =
    useState<BusinessPresetCurrency>(
      "RSD"
    );

  const [
    supportedLocales,
    setSupportedLocales,
  ] = useState<
    BusinessPresetLocale[]
  >([
    "sr-Latn",
  ]);

  const [
    preparedDraft,
    setPreparedDraft,
  ] =
    useState<
      PreparedBusinessDraft |
      null
    >(null);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    isLoading,
    setIsLoading,
  ] =
    useState(false);

  const selectedPreset =
    useMemo(
      () =>
        presets.find(
          (preset) =>
            preset.value ===
            presetKey
        ) ??
        presets[0] ??
        null,
      [
        presetKey,
        presets,
      ]
    );

  function clearPreparedDraft() {
    setPreparedDraft(
      null
    );

    setError(
      null
    );
  }

  function handleBusinessNameChange(
    value: string
  ) {
    setBusinessName(
      value
    );

    if (
      !slugWasEdited
    ) {
      setBusinessSlug(
        normalizeBusinessSlug(
          value
        )
      );
    }

    clearPreparedDraft();
  }

  function handleBusinessSlugChange(
    value: string
  ) {
    setSlugWasEdited(
      true
    );

    setBusinessSlug(
      normalizeBusinessSlug(
        value
      )
    );

    clearPreparedDraft();
  }

  function handleLocaleChange(
    nextLocale:
      BusinessPresetLocale
  ) {
    setLocale(
      nextLocale
    );

    setSupportedLocales(
      (currentLocales) => {
        if (
          currentLocales.includes(
            nextLocale
          )
        ) {
          return currentLocales;
        }

        return [
          nextLocale,
          ...currentLocales,
        ];
      }
    );

    clearPreparedDraft();
  }

  function toggleSupportedLocale(
    selectedLocale:
      BusinessPresetLocale
  ) {
    if (
      selectedLocale ===
      locale
    ) {
      return;
    }

    setSupportedLocales(
      (currentLocales) => {
        if (
          currentLocales.includes(
            selectedLocale
          )
        ) {
          return currentLocales.filter(
            (currentLocale) =>
              currentLocale !==
              selectedLocale
          );
        }

        return [
          ...currentLocales,
          selectedLocale,
        ];
      }
    );

    clearPreparedDraft();
  }

  function validateForm():
    string | null {
    if (
      businessName.trim().length <
      2
    ) {
      return "Unesi naziv salona.";
    }

    if (
      !SLUG_PATTERN.test(
        businessSlug
      )
    ) {
      return "URL slug nije ispravan.";
    }

    if (
      city.trim().length <
      2
    ) {
      return "Unesi grad salona.";
    }

    if (
      country.trim().length <
      2
    ) {
      return "Unesi državu salona.";
    }

    if (
      phone.trim().length <
      5
    ) {
      return "Unesi kontakt telefon.";
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (
      validationError
    ) {
      setPreparedDraft(
        null
      );

      setError(
        validationError
      );

      return;
    }

    setIsLoading(
      true
    );

    setError(
      null
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/business-presets/preview",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                presetKey,
                locale,
                currency,
                supportedLocales,
              }),
          }
        );

      const data =
        (await response.json()) as
          PreviewApiResponse;

      if (
        !response.ok ||
        data.ok === false
      ) {
        throw new Error(
          data.ok === false
            ? data.message
            : "Demo paket nije moguće pripremiti."
        );
      }

      const draft:
        PreparedBusinessDraft = {
          business: {
            name:
              businessName.trim(),

            slug:
              businessSlug,

            city:
              city.trim(),

            country:
              country.trim(),

            email:
              email.trim().length >
              0
                ? email
                    .trim()
                    .toLowerCase()
                : null,

            phone:
              phone.trim(),
          },

          provisioning:
            data.preview,

          preparedAt:
            new Date()
              .toISOString(),
        };

      sessionStorage.setItem(
        "platform:new-business-draft",
        JSON.stringify(
          draft
        )
      );

      setPreparedDraft(
        draft
      );
    } catch (requestError) {
      setPreparedDraft(
        null
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Došlo je do neočekivane greške."
      );
    } finally {
      setIsLoading(
        false
      );
    }
  }

  return (
    <div
      className="
        mx-auto
        max-w-7xl
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

          Brzi onboarding
        </div>

        <h2
          className="
            mt-3
            text-3xl
            font-semibold
            tracking-tight
            md:text-4xl
          "
        >
          Novi salon
        </h2>

        <p
          className="
            mt-3
            max-w-3xl
            text-sm
            leading-6
            text-zinc-400
            md:text-base
          "
        >
          Unosimo osnovne podatke,
          biramo poslovni preset i
          pripremamo kompletan demo
          paket. U ovom koraku se još
          ništa ne upisuje u bazu.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="
          mt-8
          grid
          gap-6
          xl:grid-cols-[minmax(0,1fr)_390px]
        "
      >
        <div
          className="
            space-y-6
          "
        >
          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
              md:p-7
            "
          >
            <SectionHeading
              icon={
                Building2
              }
              title="Podaci salona"
              description="Osnovni identitet koji će biti prikazan klijentu."
            />

            <div
              className="
                mt-6
                grid
                gap-5
                md:grid-cols-2
              "
            >
              <Field
                label="Naziv salona"
                icon={
                  Building2
                }
              >
                <input
                  value={
                    businessName
                  }
                  onChange={(
                    event
                  ) =>
                    handleBusinessNameChange(
                      event.target
                        .value
                    )
                  }
                  placeholder="Studio Lumière"
                  className={
                    inputClassName
                  }
                />
              </Field>

              <Field
                label="URL slug"
                icon={
                  Link2
                }
              >
                <input
                  value={
                    businessSlug
                  }
                  onChange={(
                    event
                  ) =>
                    handleBusinessSlugChange(
                      event.target
                        .value
                    )
                  }
                  placeholder="studio-lumiere"
                  className={
                    inputClassName
                  }
                />

                <p
                  className="
                    mt-2
                    text-xs
                    text-zinc-500
                  "
                >
                  Primer:
                  /{businessSlug ||
                    "studio-lumiere"}
                </p>
              </Field>

              <Field
                label="Grad"
                icon={
                  MapPin
                }
              >
                <input
                  value={
                    city
                  }
                  onChange={(
                    event
                  ) => {
                    setCity(
                      event.target
                        .value
                    );

                    clearPreparedDraft();
                  }}
                  placeholder="Beograd"
                  className={
                    inputClassName
                  }
                />
              </Field>

              <Field
                label="Država"
                icon={
                  Globe2
                }
              >
                <input
                  value={
                    country
                  }
                  onChange={(
                    event
                  ) => {
                    setCountry(
                      event.target
                        .value
                    );

                    clearPreparedDraft();
                  }}
                  placeholder="Serbia"
                  className={
                    inputClassName
                  }
                />
              </Field>

              <Field
                label="Telefon"
                icon={
                  Phone
                }
              >
                <input
                  value={
                    phone
                  }
                  onChange={(
                    event
                  ) => {
                    setPhone(
                      event.target
                        .value
                    );

                    clearPreparedDraft();
                  }}
                  placeholder="+381 60 123 4567"
                  className={
                    inputClassName
                  }
                />
              </Field>

              <Field
                label="Email"
                icon={
                  Mail
                }
              >
                <input
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) => {
                    setEmail(
                      event.target
                        .value
                    );

                    clearPreparedDraft();
                  }}
                  placeholder="kontakt@salon.rs"
                  className={
                    inputClassName
                  }
                />
              </Field>
            </div>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
              md:p-7
            "
          >
            <SectionHeading
              icon={
                Tag
              }
              title="Poslovni paket"
              description="Preset određuje početne usluge, cene, booking pravila i template."
            />

            <div
              className="
                mt-6
                grid
                gap-5
                md:grid-cols-2
              "
            >
              <Field
                label="Poslovna niša"
                icon={
                  Tag
                }
              >
                <select
                  value={
                    presetKey
                  }
                  onChange={(
                    event
                  ) => {
                    setPresetKey(
                      event.target
                        .value as
                        BusinessPresetKey
                    );

                    clearPreparedDraft();
                  }}
                  className={
                    inputClassName
                  }
                >
                  {presets.map(
                    (preset) => (
                      <option
                        key={
                          preset.value
                        }
                        value={
                          preset.value
                        }
                      >
                        {
                          preset.label
                        }
                      </option>
                    )
                  )}
                </select>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-zinc-500
                  "
                >
                  {
                    selectedPreset
                      ?.description
                  }
                </p>
              </Field>

              <Field
                label="Preporučeni template"
                icon={
                  LayoutTemplate
                }
              >
                <div
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-zinc-950
                    px-4
                    py-3
                    text-sm
                    text-zinc-300
                  "
                >
                  {
                    selectedPreset
                      ?.recommendedTemplateKey ??
                    "Nije izabran"
                  }
                </div>
              </Field>

              <Field
                label="Glavni jezik"
                icon={
                  Languages
                }
              >
                <select
                  value={
                    locale
                  }
                  onChange={(
                    event
                  ) =>
                    handleLocaleChange(
                      event.target
                        .value as
                        BusinessPresetLocale
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  {locales.map(
                    (
                      availableLocale
                    ) => (
                      <option
                        key={
                          availableLocale
                        }
                        value={
                          availableLocale
                        }
                      >
                        {
                          localeLabels[
                            availableLocale
                          ]
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field
                label="Valuta"
                icon={
                  Coins
                }
              >
                <select
                  value={
                    currency
                  }
                  onChange={(
                    event
                  ) => {
                    setCurrency(
                      event.target
                        .value as
                        BusinessPresetCurrency
                    );

                    clearPreparedDraft();
                  }}
                  className={
                    inputClassName
                  }
                >
                  {currencies.map(
                    (
                      availableCurrency
                    ) => (
                      <option
                        key={
                          availableCurrency
                        }
                        value={
                          availableCurrency
                        }
                      >
                        {
                          currencyLabels[
                            availableCurrency
                          ]
                        }
                      </option>
                    )
                  )}
                </select>
              </Field>
            </div>

            <div
              className="
                mt-5
              "
            >
              <Field
                label="Aktivni jezici sajta"
                icon={
                  Languages
                }
              >
                <div
                  className="
                    grid
                    gap-3
                    sm:grid-cols-3
                  "
                >
                  {locales.map(
                    (
                      availableLocale
                    ) => {
                      const isChecked =
                        supportedLocales.includes(
                          availableLocale
                        );

                      const isRequired =
                        availableLocale ===
                        locale;

                      return (
                        <label
                          key={
                            availableLocale
                          }
                          className="
                            flex
                            cursor-pointer
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-white/10
                            bg-zinc-950
                            px-4
                            py-3
                          "
                        >
                          <span
                            className="
                              text-sm
                              text-zinc-300
                            "
                          >
                            {
                              localeLabels[
                                availableLocale
                              ]
                            }
                          </span>

                          <input
                            type="checkbox"
                            checked={
                              isChecked
                            }
                            disabled={
                              isRequired
                            }
                            onChange={() =>
                              toggleSupportedLocale(
                                availableLocale
                              )
                            }
                            className="
                              h-4
                              w-4
                              accent-white
                            "
                          />
                        </label>
                      );
                    }
                  )}
                </div>
              </Field>
            </div>
          </section>

          {error ? (
            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-400/20
                bg-red-400/10
                p-5
                text-red-200
              "
            >
              <AlertCircle
                size={20}
                className="
                  mt-0.5
                  shrink-0
                "
              />

              <div>
                <p
                  className="
                    font-semibold
                  "
                >
                  Paket nije pripremljen
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    text-red-200/80
                  "
                >
                  {error}
                </p>
              </div>
            </div>
          ) : null}

          {preparedDraft ? (
            <PreparedDraftPreview
              draft={
                preparedDraft
              }
            />
          ) : null}
        </div>

        <aside
          className="
            h-fit
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            p-5
            xl:sticky
            xl:top-6
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-white
              text-zinc-950
            "
          >
            <FileText
              size={23}
            />
          </div>

          <h3
            className="
              mt-5
              text-xl
              font-semibold
            "
          >
            Demo paket
          </h3>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-zinc-500
            "
          >
            Nakon pripreme dobijamo
            validiran payload spreman
            za budući upis u Supabase.
          </p>

          <div
            className="
              mt-6
              space-y-3
            "
          >
            <SummaryLine
              label="Salon"
              value={
                businessName ||
                "Nije unet"
              }
            />

            <SummaryLine
              label="Slug"
              value={
                businessSlug ||
                "Nije unet"
              }
            />

            <SummaryLine
              label="Preset"
              value={
                selectedPreset
                  ?.label ??
                "Nije izabran"
              }
            />

            <SummaryLine
              label="Template"
              value={
                selectedPreset
                  ?.recommendedTemplateKey ??
                "Nije izabran"
              }
            />

            <SummaryLine
              label="Jezik"
              value={
                localeLabels[
                  locale
                ]
              }
            />

            <SummaryLine
              label="Valuta"
              value={
                currency
              }
            />
          </div>

          <button
            type="submit"
            disabled={
              isLoading
            }
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white
              px-4
              py-3
              text-sm
              font-semibold
              text-zinc-950
              transition
              hover:bg-zinc-200
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {isLoading ? (
              <>
                <LoaderCircle
                  size={17}
                  className="
                    animate-spin
                  "
                />

                Pripremam paket
              </>
            ) : (
              <>
                Pripremi demo paket

                <ChevronRight
                  size={17}
                />
              </>
            )}
          </button>

          <p
            className="
              mt-3
              text-center
              text-xs
              leading-5
              text-zinc-600
            "
          >
            Ovaj korak ne kreira
            salon i ne menja bazu.
          </p>
        </aside>
      </form>
    </div>
  );
}

function PreparedDraftPreview({
  draft,
}: {
  draft:
    PreparedBusinessDraft;
}) {
  return (
    <section
      className="
        rounded-3xl
        border
        border-emerald-400/20
        bg-emerald-400/[0.06]
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
        <CheckCircle2
          size={22}
          className="
            text-emerald-300
          "
        />

        <div>
          <h3
            className="
              text-xl
              font-semibold
            "
          >
            Demo paket je spreman
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-zinc-400
            "
          >
            Draft je validiran i
            privremeno sačuvan u
            ovoj browser sesiji.
          </p>
        </div>
      </div>

      <div
        className="
          mt-6
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <DraftCard
          label="Salon"
          value={
            draft.business.name
          }
        />

        <DraftCard
          label="Lokacija"
          value={[
            draft.business.city,
            draft.business.country,
          ].join(", ")}
        />

        <DraftCard
          label="Kategorije"
          value={
            String(
              draft.provisioning
                .counts.categories
            )
          }
        />

        <DraftCard
          label="Usluge"
          value={
            String(
              draft.provisioning
                .counts.services
            )
          }
        />
      </div>

      <div
        className="
          mt-5
          rounded-2xl
          border
          border-white/10
          bg-zinc-950/40
          p-4
        "
      >
        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
            text-zinc-500
          "
        >
          Sledeći razvojni korak
        </p>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-zinc-300
          "
        >
          Provisioning API će iz
          ovog drafta kreirati
          business, booking settings,
          kategorije i usluge u jednoj
          kontrolisanoj transakciji.
        </p>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;

  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;

  children: ReactNode;
};

function Field({
  label,
  icon: Icon,
  children,
}: FieldProps) {
  return (
    <div>
      <label
        className="
          mb-2
          flex
          items-center
          gap-2
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-zinc-500
        "
      >
        <Icon
          size={15}
        />

        {label}
      </label>

      {children}
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;

  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-white/10
          text-zinc-200
        "
      >
        <Icon
          size={19}
        />
      </div>

      <div>
        <h3
          className="
            text-lg
            font-semibold
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1
            text-sm
            leading-6
            text-zinc-500
          "
        >
          {description}
        </p>
      </div>
    </div>
  );
}

function SummaryLine({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-4
        border-b
        border-white/10
        pb-3
        text-sm
        last:border-b-0
        last:pb-0
      "
    >
      <span
        className="
          text-zinc-500
        "
      >
        {label}
      </span>

      <span
        className="
          max-w-[190px]
          break-words
          text-right
          font-medium
          text-zinc-200
        "
      >
        {value}
      </span>
    </div>
  );
}

function DraftCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-zinc-950/40
        p-4
      "
    >
      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          break-words
          font-semibold
          text-zinc-200
        "
      >
        {value}
      </p>
    </div>
  );
}

function normalizeBusinessSlug(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("đ", "dj")
    .replaceAll("ß", "ss")
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .replace(
      /-{2,}/g,
      "-"
    );
}

const inputClassName = [
  "w-full",
  "rounded-xl",
  "border",
  "border-white/10",
  "bg-zinc-950",
  "px-4",
  "py-3",
  "text-sm",
  "text-white",
  "outline-none",
  "transition",
  "placeholder:text-zinc-700",
  "focus:border-white/30",
].join(" ");