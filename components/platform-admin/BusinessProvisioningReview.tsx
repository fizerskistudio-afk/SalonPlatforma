"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  Coins,
  Database,
  ExternalLink,
  Globe2,
  Languages,
  LayoutTemplate,
  ListChecks,
  LoaderCircle,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import type {
  MaterializedBusinessPreset,
} from "@/lib/business-presets";

const BUSINESS_DRAFT_STORAGE_KEY =
  "platform:new-business-draft";

const TIMEZONE_OPTIONS = [
  {
    value:
      "Europe/Belgrade",
    label:
      "Europe/Belgrade — Srbija",
  },
  {
    value:
      "Europe/Skopje",
    label:
      "Europe/Skopje — Severna Makedonija",
  },
  {
    value:
      "Europe/Berlin",
    label:
      "Europe/Berlin — Nemačka",
  },
  {
    value:
      "Europe/Vienna",
    label:
      "Europe/Vienna — Austrija",
  },
  {
    value:
      "Europe/Zurich",
    label:
      "Europe/Zurich — Švajcarska",
  },
  {
    value:
      "Europe/Paris",
    label:
      "Europe/Paris — Francuska",
  },
  {
    value:
      "Europe/Rome",
    label:
      "Europe/Rome — Italija",
  },
  {
    value:
      "Europe/London",
    label:
      "Europe/London — Ujedinjeno Kraljevstvo",
  },
  {
    value:
      "Europe/Stockholm",
    label:
      "Europe/Stockholm — Švedska",
  },
] as const;

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

type ProvisioningResult = {
  businessId?: string;
  slug?: string;
  name?: string;
  defaultLocale?: string;
  supportedLocales?: string[];
  currency?: string;
  templateKey?: string;
  categoriesCreated?: number;
  servicesCreated?: number;
};

type ProvisioningApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  result?: ProvisioningResult;
};

type DraftStatus =
  | "loading"
  | "ready"
  | "missing";

function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function isStringArray(
  value: unknown
): value is string[] {
  return (
    Array.isArray(
      value
    ) &&
    value.every(
      (item) =>
        typeof item ===
        "string"
    )
  );
}

function parsePreparedDraft(
  rawDraft: string | null
): PreparedBusinessDraft | null {
  if (!rawDraft) {
    return null;
  }

  let parsedValue:
    unknown;

  try {
    parsedValue =
      JSON.parse(
        rawDraft
      );
  } catch {
    return null;
  }

  if (
    !isJsonRecord(
      parsedValue
    ) ||
    !isJsonRecord(
      parsedValue.business
    ) ||
    !isJsonRecord(
      parsedValue.provisioning
    )
  ) {
    return null;
  }

  const business =
    parsedValue.business;

  const provisioning =
    parsedValue.provisioning;

  if (
    typeof business.name !==
      "string" ||
    typeof business.slug !==
      "string" ||
    typeof business.city !==
      "string" ||
    typeof business.country !==
      "string" ||
    typeof business.phone !==
      "string" ||
    (
      business.email !==
        null &&
      typeof business.email !==
        "string"
    )
  ) {
    return null;
  }

  if (
    typeof provisioning.presetKey !==
      "string" ||
    typeof provisioning.locale !==
      "string" ||
    typeof provisioning.currency !==
      "string" ||
    typeof provisioning.templateKey !==
      "string" ||
    !isStringArray(
      provisioning.supportedLocales
    ) ||
    !isJsonRecord(
      provisioning.counts
    ) ||
    typeof provisioning.counts
      .categories !==
      "number" ||
    typeof provisioning.counts
      .services !==
      "number"
  ) {
    return null;
  }

  if (
    typeof parsedValue.preparedAt !==
      "string"
  ) {
    return null;
  }

  return parsedValue as
    PreparedBusinessDraft;
}

function resolveDefaultTimezone(
  country: string
): string {
  const normalizedCountry =
    country
      .trim()
      .toLocaleLowerCase();

  if (
    normalizedCountry.includes(
      "german"
    ) ||
    normalizedCountry.includes(
      "deutsch"
    ) ||
    normalizedCountry.includes(
      "nemačk"
    )
  ) {
    return "Europe/Berlin";
  }

  if (
    normalizedCountry.includes(
      "austr"
    ) ||
    normalizedCountry.includes(
      "österreich"
    )
  ) {
    return "Europe/Vienna";
  }

  if (
    normalizedCountry.includes(
      "switzer"
    ) ||
    normalizedCountry.includes(
      "schweiz"
    ) ||
    normalizedCountry.includes(
      "švajcar"
    )
  ) {
    return "Europe/Zurich";
  }

  if (
    normalizedCountry.includes(
      "maced"
    ) ||
    normalizedCountry.includes(
      "maked"
    )
  ) {
    return "Europe/Skopje";
  }

  return "Europe/Belgrade";
}

function formatPreparedAt(
  value: string
): string {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle:
        "medium",

      timeStyle:
        "short",
    }
  ).format(
    date
  );
}

export default function BusinessProvisioningReview() {
  const [
    draftStatus,
    setDraftStatus,
  ] =
    useState<DraftStatus>(
      "loading"
    );

  const [
    draft,
    setDraft,
  ] =
    useState<
      PreparedBusinessDraft |
      null
    >(null);

  const [
    timezone,
    setTimezone,
  ] =
    useState(
      "Europe/Belgrade"
    );

  const [
    isConfirmed,
    setIsConfirmed,
  ] =
    useState(false);

  const [
    isProvisioning,
    setIsProvisioning,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    errorCode,
    setErrorCode,
  ] =
    useState<string | null>(
      null
    );

  const [
    result,
    setResult,
  ] =
    useState<
      ProvisioningResult |
      null
    >(null);

  useEffect(
    () => {
      const preparedDraft =
        parsePreparedDraft(
          window.sessionStorage.getItem(
            BUSINESS_DRAFT_STORAGE_KEY
          )
        );

      if (!preparedDraft) {
        setDraftStatus(
          "missing"
        );

        return;
      }

      setDraft(
        preparedDraft
      );

      setTimezone(
        resolveDefaultTimezone(
          preparedDraft.business
            .country
        )
      );

      setDraftStatus(
        "ready"
      );
    },
    []
  );

  const location =
    useMemo(
      () => {
        if (!draft) {
          return "";
        }

        return [
          draft.business.city,
          draft.business.country,
        ]
          .filter(Boolean)
          .join(", ");
      },
      [
        draft,
      ]
    );

  async function handleProvision() {
    if (
      !draft ||
      !isConfirmed ||
      isProvisioning
    ) {
      return;
    }

    setIsProvisioning(
      true
    );

    setError(
      null
    );

    setErrorCode(
      null
    );

    setResult(
      null
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/provision",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                business: {
                  ...draft.business,
                  timezone,
                },

                presetKey:
                  draft.provisioning
                    .presetKey,

                locale:
                  draft.provisioning
                    .locale,

                currency:
                  draft.provisioning
                    .currency,

                supportedLocales: [
                  ...draft.provisioning
                    .supportedLocales,
                ],
              }),
          }
        );

      let responseBody:
        ProvisioningApiResponse;

      try {
        responseBody =
          (await response.json()) as
            ProvisioningApiResponse;
      } catch {
        throw new Error(
          "Provisioning API nije vratio validan JSON odgovor."
        );
      }

      if (
        !response.ok ||
        responseBody.ok !==
          true
      ) {
        setErrorCode(
          responseBody.code ??
            null
        );

        throw new Error(
          responseBody.message ??
            "Provisioning salona nije uspeo."
        );
      }

      const provisioningResult =
        responseBody.result ?? {
          slug:
            draft.business.slug,

          name:
            draft.business.name,

          defaultLocale:
            draft.provisioning
              .locale,

          supportedLocales: [
            ...draft.provisioning
              .supportedLocales,
          ],

          currency:
            draft.provisioning
              .currency,

          templateKey:
            draft.provisioning
              .templateKey,

          categoriesCreated:
            draft.provisioning
              .counts.categories,

          servicesCreated:
            draft.provisioning
              .counts.services,
        };

      setResult(
        provisioningResult
      );

      window.sessionStorage.removeItem(
        BUSINESS_DRAFT_STORAGE_KEY
      );
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Došlo je do neočekivane greške."
      );
    } finally {
      setIsProvisioning(
        false
      );
    }
  }

  if (
    draftStatus ===
      "loading"
  ) {
    return (
      <div
        className="
          flex
          min-h-[420px]
          items-center
          justify-center
        "
      >
        <div
          className="
            text-center
          "
        >
          <LoaderCircle
            size={30}
            className="
              mx-auto
              animate-spin
              text-amber-300
            "
          />

          <p
            className="
              mt-4
              text-sm
              text-zinc-400
            "
          >
            Učitavam pripremljeni draft…
          </p>
        </div>
      </div>
    );
  }

  if (
    draftStatus ===
      "missing" ||
    !draft
  ) {
    return (
      <section
        className="
          mx-auto
          max-w-3xl
          rounded-3xl
          border
          border-red-400/20
          bg-red-400/[0.06]
          p-6
          md:p-8
        "
      >
        <AlertCircle
          size={28}
          className="
            text-red-300
          "
        />

        <h2
          className="
            mt-5
            text-2xl
            font-semibold
          "
        >
          Nema pripremljenog drafta
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-zinc-400
          "
        >
          Vrati se na formular, unesi
          podatke salona i prvo klikni
          „Pripremi demo paket“.
        </p>

        <Link
          href="/platform-admin/businesses/new"
          className="
            mt-6
            inline-flex
            items-center
            gap-2
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
          <ArrowLeft
            size={17}
          />

          Nazad na formular
        </Link>
      </section>
    );
  }

  if (result) {
    return (
      <section
        className="
          mx-auto
          max-w-4xl
          rounded-3xl
          border
          border-emerald-400/20
          bg-emerald-400/[0.06]
          p-6
          md:p-8
        "
      >
        <div
          className="
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-emerald-300
            text-zinc-950
          "
        >
          <CheckCircle2
            size={28}
          />
        </div>

        <h2
          className="
            mt-6
            text-3xl
            font-semibold
            tracking-tight
          "
        >
          Salon je uspešno kreiran
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-zinc-400
          "
        >
          Business, booking settings,
          kategorije i usluge kreirani su
          u jednoj atomskoj transakciji.
        </p>

        <div
          className="
            mt-7
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <SummaryCard
            label="Salon"
            value={
              result.name ??
              draft.business.name
            }
          />

          <SummaryCard
            label="Slug"
            value={
              result.slug ??
              draft.business.slug
            }
          />

          <SummaryCard
            label="Kategorije"
            value={String(
              result.categoriesCreated ??
                draft.provisioning
                  .counts.categories
            )}
          />

          <SummaryCard
            label="Usluge"
            value={String(
              result.servicesCreated ??
                draft.provisioning
                  .counts.services
            )}
          />
        </div>

        <div
          className="
            mt-7
            flex
            flex-col
            gap-3
            sm:flex-row
          "
        >
          <Link
            href="/platform-admin/businesses"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
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
            <Building2
              size={17}
            />

            Otvori pregled salona
          </Link>

          <Link
            href="/platform-admin/businesses/new"
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              px-5
              py-3
              text-sm
              font-semibold
              text-zinc-200
              transition
              hover:bg-white/[0.08]
            "
          >
            <Sparkles
              size={17}
            />

            Kreiraj još jedan salon
          </Link>
        </div>
      </section>
    );
  }

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
          gap-4
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
            <ShieldCheck
              size={17}
            />

            Finalna potvrda
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
            Pregled i kreiranje salona
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
            Proveri podatke, izaberi
            vremensku zonu i potvrdi
            atomski provisioning.
          </p>
        </div>

        <Link
          href="/platform-admin/businesses/new"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-zinc-400
            transition
            hover:text-white
          "
        >
          <ArrowLeft
            size={17}
          />

          Nazad na izmenu
        </Link>
      </div>

      <div
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
            <SectionTitle
              icon={
                Building2
              }
              title="Podaci salona"
              description="Osnovni identitet novog tenant-a."
            />

            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              <ReviewItem
                icon={
                  Building2
                }
                label="Naziv"
                value={
                  draft.business.name
                }
              />

              <ReviewItem
                icon={
                  ExternalLink
                }
                label="Slug"
                value={
                  draft.business.slug
                }
              />

              <ReviewItem
                icon={
                  MapPin
                }
                label="Lokacija"
                value={
                  location
                }
              />

              <ReviewItem
                icon={
                  Phone
                }
                label="Telefon"
                value={
                  draft.business.phone
                }
              />

              <ReviewItem
                icon={
                  Globe2
                }
                label="Email"
                value={
                  draft.business.email ??
                  "Nije unet"
                }
              />

              <ReviewItem
                icon={
                  Clock3
                }
                label="Draft pripremljen"
                value={
                  formatPreparedAt(
                    draft.preparedAt
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
            <SectionTitle
              icon={
                ListChecks
              }
              title="Provisioning paket"
              description="Preset i početni sadržaj koji će biti upisani."
            />

            <div
              className="
                mt-6
                grid
                gap-4
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              <ReviewItem
                icon={
                  Sparkles
                }
                label="Preset"
                value={
                  draft.provisioning
                    .presetName
                }
              />

              <ReviewItem
                icon={
                  LayoutTemplate
                }
                label="Template"
                value={
                  draft.provisioning
                    .templateKey
                }
              />

              <ReviewItem
                icon={
                  Languages
                }
                label="Glavni jezik"
                value={
                  draft.provisioning
                    .locale
                }
              />

              <ReviewItem
                icon={
                  Languages
                }
                label="Aktivni jezici"
                value={
                  draft.provisioning
                    .supportedLocales
                    .join(", ")
                }
              />

              <ReviewItem
                icon={
                  Coins
                }
                label="Valuta"
                value={
                  draft.provisioning
                    .currency
                }
              />

              <ReviewItem
                icon={
                  Scissors
                }
                label="Početni katalog"
                value={[
                  draft.provisioning
                    .counts.categories,
                  " kategorije / ",
                  draft.provisioning
                    .counts.services,
                  " usluga",
                ].join("")}
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
            <SectionTitle
              icon={
                Clock3
              }
              title="Vremenska zona"
              description="Koristi se za termine, dostupnost i buduće kalendarske integracije."
            />

            <label
              className="
                mt-6
                block
              "
            >
              <span
                className="
                  mb-2
                  block
                  text-xs
                  font-semibold
                  uppercase
                  tracking-wider
                  text-zinc-500
                "
              >
                Izabrana zona
              </span>

              <select
                value={
                  timezone
                }
                onChange={(
                  event
                ) =>
                  setTimezone(
                    event.target.value
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
                  text-zinc-200
                  outline-none
                  transition
                  focus:border-amber-300/50
                "
              >
                {TIMEZONE_OPTIONS.map(
                  (option) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </label>
          </section>

          {error ? (
            <section
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-red-400/20
                bg-red-400/[0.08]
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
                  Salon nije kreiran
                </p>

                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-red-200/80
                  "
                >
                  {error}
                </p>

                {errorCode ? (
                  <p
                    className="
                      mt-2
                      font-mono
                      text-xs
                      text-red-200/60
                    "
                  >
                    {errorCode}
                  </p>
                ) : null}
              </div>
            </section>
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
            <Database
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
            Atomski provisioning
          </h3>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-zinc-500
            "
          >
            Svi zapisi se kreiraju u
            jednoj transakciji. Ako bilo
            koji korak ne uspe, ništa neće
            ostati polovično upisano.
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
                draft.business.name
              }
            />

            <SummaryLine
              label="Slug"
              value={
                draft.business.slug
              }
            />

            <SummaryLine
              label="Zona"
              value={
                timezone
              }
            />

            <SummaryLine
              label="Kategorije"
              value={String(
                draft.provisioning
                  .counts.categories
              )}
            />

            <SummaryLine
              label="Usluge"
              value={String(
                draft.provisioning
                  .counts.services
              )}
            />
          </div>

          <label
            className="
              mt-6
              flex
              cursor-pointer
              items-start
              gap-3
              rounded-2xl
              border
              border-white/10
              bg-zinc-950/70
              p-4
            "
          >
            <input
              type="checkbox"
              checked={
                isConfirmed
              }
              disabled={
                isProvisioning
              }
              onChange={(
                event
              ) =>
                setIsConfirmed(
                  event.target.checked
                )
              }
              className="
                mt-1
                h-4
                w-4
                shrink-0
                accent-white
              "
            />

            <span
              className="
                text-sm
                leading-6
                text-zinc-400
              "
            >
              Potvrđujem da su podaci
              provereni i da želim da
              kreiram ovaj salon.
            </span>
          </label>

          <button
            type="button"
            disabled={
              !isConfirmed ||
              isProvisioning
            }
            onClick={
              handleProvision
            }
            className="
              mt-5
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
              disabled:opacity-50
            "
          >
            {isProvisioning ? (
              <>
                <LoaderCircle
                  size={17}
                  className="
                    animate-spin
                  "
                />

                Kreiram salon
              </>
            ) : (
              <>
                <Database
                  size={17}
                />

                Kreiraj salon
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
            Postupak kreira stvarne zapise
            u Supabase bazi.
          </p>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon:
    typeof Building2;

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
          bg-white/[0.06]
          text-zinc-300
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

function ReviewItem({
  icon: Icon,
  label,
  value,
}: {
  icon:
    typeof Building2;

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
      <div
        className="
          flex
          items-center
          gap-2
          text-zinc-500
        "
      >
        <Icon
          size={15}
        />

        <p
          className="
            text-xs
            font-semibold
            uppercase
            tracking-wider
          "
        >
          {label}
        </p>
      </div>

      <p
        className="
          mt-3
          break-words
          text-sm
          font-medium
          leading-6
          text-zinc-200
        "
      >
        {value}
      </p>
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
        border-white/5
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
          max-w-[220px]
          break-words
          text-right
          font-medium
          text-zinc-300
        "
      >
        {value}
      </span>
    </div>
  );
}

function SummaryCard({
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
          font-semibold
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