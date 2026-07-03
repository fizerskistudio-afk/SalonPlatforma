"use client";

import {
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Coins,
  Languages,
  LayoutTemplate,
  LoaderCircle,
  Scissors,
  Sparkles,
  Users,
} from "lucide-react";

import type {
  BusinessPresetCurrency,
  BusinessPresetKey,
  BusinessPresetLocale,
  MaterializedBusinessPreset,
  MaterializedPresetService,
} from "@/lib/business-presets";

type PresetOption = {
  value: BusinessPresetKey;
  label: string;
  description: string;
  recommendedTemplateKey: string;
};

type BusinessPresetExplorerProps = {
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

type IconComponent =
  ComponentType<{
    size?: number;
    className?: string;
  }>;

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

const intlLocales:
  Record<
    BusinessPresetLocale,
    string
  > = {
    "sr-Latn":
      "sr-Latn-RS",
    en:
      "en-US",
    de:
      "de-DE",
  };

const fromLabels:
  Record<
    BusinessPresetLocale,
    string
  > = {
    "sr-Latn":
      "od",
    en:
      "from",
    de:
      "ab",
  };

export default function BusinessPresetExplorer({
  presets,
  locales,
  currencies,
}: BusinessPresetExplorerProps) {
  const initialPreset =
    presets[0]?.value ??
    "hair-salon";

  const [
    presetKey,
    setPresetKey,
  ] =
    useState<BusinessPresetKey>(
      initialPreset
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
    preview,
    setPreview,
  ] =
    useState<
      MaterializedBusinessPreset |
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

  function resetPreview() {
    setPreview(
      null
    );

    setError(
      null
    );
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

    resetPreview();
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

    resetPreview();
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

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
            : "Preview nije moguće učitati."
        );
      }

      setPreview(
        data.preview
      );
    } catch (requestError) {
      setPreview(
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

  const selectedPreset =
    presets.find(
      (preset) =>
        preset.value ===
        presetKey
    );

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

          Preset studio
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
          Business preseti
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
          Izaberemo nišu,
          jezik i valutu, a
          platforma pripremi
          početni template,
          kategorije, usluge,
          cene i booking pravila.
        </p>
      </div>

      <div
        className="
          mt-8
          grid
          gap-6
          xl:grid-cols-[390px_minmax(0,1fr)]
        "
      >
        <form
          onSubmit={
            handleSubmit
          }
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
          <h3
            className="
              text-lg
              font-semibold
            "
          >
            Konfiguracija
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-zinc-500
            "
          >
            Ovo još ništa ne
            upisuje u bazu.
          </p>

          <div
            className="
              mt-6
              space-y-5
            "
          >
            <Field
              label="Poslovna niša"
              icon={
                Scissors
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

                  resetPreview();
                }}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-white/30
                "
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
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-white/30
                "
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

                  resetPreview();
                }}
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-zinc-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-white/30
                "
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

            <Field
              label="Aktivni jezici sajta"
              icon={
                Languages
              }
            >
              <div
                className="
                  space-y-2
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
                          bg-zinc-950/70
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

                Pripremam preview
              </>
            ) : (
              <>
                Generiši preview

                <ChevronRight
                  size={17}
                />
              </>
            )}
          </button>
        </form>

        <div>
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
                  Preview nije napravljen
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

          {!preview &&
          !error ? (
            <EmptyPreview />
          ) : null}

          {preview ? (
            <PresetPreview
              preview={
                preview
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  icon: IconComponent;
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

function EmptyPreview() {
  return (
    <div
      className="
        flex
        min-h-[520px]
        items-center
        justify-center
        rounded-3xl
        border
        border-dashed
        border-white/10
        bg-white/[0.02]
        p-8
        text-center
      "
    >
      <div
        className="
          max-w-md
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-white/5
            text-zinc-400
          "
        >
          <LayoutTemplate
            size={26}
          />
        </div>

        <h3
          className="
            mt-5
            text-xl
            font-semibold
          "
        >
          Preview još nije generisan
        </h3>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-zinc-500
          "
        >
          Izaberi konfiguraciju
          sa leve strane i platforma
          će prikazati kompletan
          početni paket za klijenta.
        </p>
      </div>
    </div>
  );
}

function PresetPreview({
  preview,
}: {
  preview:
    MaterializedBusinessPreset;
}) {
  return (
    <div
      className="
        space-y-6
      "
    >
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
            flex-col
            gap-5
            md:flex-row
            md:items-start
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
                text-emerald-300
              "
            >
              <Check
                size={17}
              />

              Preset je spreman
            </div>

            <h3
              className="
                mt-3
                text-2xl
                font-semibold
              "
            >
              {
                preview.presetName
              }
            </h3>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-zinc-400
              "
            >
              {
                preview
                  .presetDescription
              }
            </p>
          </div>

          <div
            className="
              rounded-xl
              border
              border-white/10
              bg-zinc-950/50
              px-4
              py-3
              text-sm
              text-zinc-300
            "
          >
            {
              preview.templateKey
            }
          </div>
        </div>

        <div
          className="
            mt-6
            grid
            gap-3
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <SummaryCard
            icon={
              LayoutTemplate
            }
            label="Template"
            value={
              preview.templateKey
            }
          />

          <SummaryCard
            icon={
              Languages
            }
            label="Jezici"
            value={
              preview
                .supportedLocales
                .map(
                  (
                    supportedLocale
                  ) =>
                    localeLabels[
                      supportedLocale
                    ]
                )
                .join(", ")
            }
          />

          <SummaryCard
            icon={
              Scissors
            }
            label="Kategorije"
            value={
              String(
                preview.counts
                  .categories
              )
            }
          />

          <SummaryCard
            icon={
              Clock3
            }
            label="Usluge"
            value={
              String(
                preview.counts
                  .services
              )
            }
          />
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
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <CalendarClock
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
              Booking pravila
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Početna podešavanja
              koja kasnije možemo
              promeniti za klijenta.
            </p>
          </div>
        </div>

        <div
          className="
            mt-5
            grid
            gap-3
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          <BookingSetting
            label="Interval termina"
            value={
              `${preview.bookingSettings.slotIntervalMinutes} min`
            }
          />

          <BookingSetting
            label="Period rezervacije"
            value={
              `${preview.bookingSettings.bookingWindowDays} dana`
            }
          />

          <BookingSetting
            label="Minimalna najava"
            value={
              `${preview.bookingSettings.minimumAdvanceMinutes} min`
            }
          />

          <BookingSetting
            label="Bilo koji zaposleni"
            value={
              yesNo(
                preview
                  .bookingSettings
                  .allowAnyEmployee
              )
            }
          />

          <BookingSetting
            label="Telefon obavezan"
            value={
              yesNo(
                preview
                  .bookingSettings
                  .requirePhone
              )
            }
          />

          <BookingSetting
            label="Email obavezan"
            value={
              yesNo(
                preview
                  .bookingSettings
                  .requireEmail
              )
            }
          />

          <BookingSetting
            label="Napomena dozvoljena"
            value={
              yesNo(
                preview
                  .bookingSettings
                  .allowNotes
              )
            }
          />

          <BookingSetting
            label="Automatska potvrda"
            value={
              yesNo(
                preview
                  .bookingSettings
                  .autoConfirm
              )
            }
          />
        </div>
      </section>

      <section
        className="
          space-y-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <Users
            size={21}
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
              Kategorije i usluge
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Početni katalog za
              novi salon.
            </p>
          </div>
        </div>

        {preview.categories.map(
          (category) => {
            const categoryServices =
              preview.services.filter(
                (service) =>
                  service
                    .categoryClientKey ===
                  category.clientKey
              );

            return (
              <article
                key={
                  category.clientKey
                }
                className="
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-white/[0.03]
                "
              >
                <div
                  className="
                    border-b
                    border-white/10
                    p-5
                    md:p-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      md:flex-row
                      md:items-start
                      md:justify-between
                    "
                  >
                    <div>
                      <h4
                        className="
                          text-lg
                          font-semibold
                        "
                      >
                        {
                          category
                            .displayName
                        }
                      </h4>

                      <p
                        className="
                          mt-1
                          text-sm
                          leading-6
                          text-zinc-500
                        "
                      >
                        {
                          category
                            .displayDescription
                        }
                      </p>
                    </div>

                    <span
                      className="
                        w-fit
                        rounded-lg
                        bg-white/5
                        px-3
                        py-1.5
                        text-xs
                        text-zinc-400
                      "
                    >
                      {
                        categoryServices
                          .length
                      }{" "}
                      usluga
                    </span>
                  </div>
                </div>

                <div
                  className="
                    divide-y
                    divide-white/10
                  "
                >
                  {categoryServices.map(
                    (service) => (
                      <ServiceRow
                        key={
                          service.clientKey
                        }
                        service={
                          service
                        }
                        locale={
                          preview.locale
                        }
                        currency={
                          preview.currency
                        }
                      />
                    )
                  )}
                </div>
              </article>
            );
          }
        )}
      </section>
    </div>
  );
}

function ServiceRow({
  service,
  locale,
  currency,
}: {
  service:
    MaterializedPresetService;
  locale:
    BusinessPresetLocale;
  currency:
    BusinessPresetCurrency;
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        p-5
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div>
        <h5
          className="
            font-medium
            text-zinc-100
          "
        >
          {
            service.displayName
          }
        </h5>

        {service.displayDescription ? (
          <p
            className="
              mt-1
              text-sm
              text-zinc-500
            "
          >
            {
              service
                .displayDescription
            }
          </p>
        ) : null}
      </div>

      <div
        className="
          flex
          shrink-0
          items-center
          gap-3
          text-sm
        "
      >
        <span
          className="
            flex
            items-center
            gap-1.5
            text-zinc-500
          "
        >
          <Clock3
            size={15}
          />

          {
            service
              .durationMinutes
          }{" "}
          min
        </span>

        <span
          className="
            rounded-lg
            bg-white/10
            px-3
            py-1.5
            font-semibold
            text-white
          "
        >
          {formatServicePrice(
            service,
            locale,
            currency
          )}
        </span>
      </div>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: IconComponent;
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
      <Icon
        size={18}
        className="
          text-zinc-500
        "
      />

      <p
        className="
          mt-3
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
          mt-1
          break-words
          text-sm
          font-semibold
          text-zinc-200
        "
      >
        {value}
      </p>
    </div>
  );
}

function BookingSetting({
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
        bg-zinc-950/50
        p-4
      "
    >
      <p
        className="
          text-xs
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          font-semibold
          text-zinc-200
        "
      >
        {value}
      </p>
    </div>
  );
}

function yesNo(
  value: boolean
): string {
  return value
    ? "Da"
    : "Ne";
}

function formatServicePrice(
  service:
    MaterializedPresetService,
  locale:
    BusinessPresetLocale,
  currency:
    BusinessPresetCurrency
): string {
  const formatter =
    new Intl.NumberFormat(
      intlLocales[
        locale
      ],
      {
        style:
          "currency",

        currency,

        maximumFractionDigits:
          currency ===
          "RSD"
            ? 0
            : 2,
      }
    );

  const formattedFrom =
    formatter.format(
      service.priceFrom
    );

  if (
    service.priceType ===
      "from"
  ) {
    return `${fromLabels[locale]} ${formattedFrom}`;
  }

  if (
    service.priceType ===
      "range" &&
    service.priceTo !== null
  ) {
    return [
      formattedFrom,
      formatter.format(
        service.priceTo
      ),
    ].join(" – ");
  }

  return formattedFrom;
}