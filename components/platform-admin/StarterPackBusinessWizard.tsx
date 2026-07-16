"use client";

import {
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Coins,
  ExternalLink,
  Layers3,
  LoaderCircle,
  MapPin,
  PackageCheck,
  Phone,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Tag,
} from "lucide-react";

import type {
  StarterPackModuleId,
  StarterPackPreview,
  StarterPackVertical,
} from "@/lib/content-starter-packs/domain";

import type {
  StarterPackCurrency,
  StarterPackServiceDraft,
} from "@/lib/content-starter-packs/provisioning";

import type {
  ServicePriceType,
} from "@/lib/types";

type PackOption = {
  id:
    StarterPackVertical;
  vertical:
    StarterPackVertical;
  version: 1;
  label: string;
  description: string;
  categoryCount: number;
  serviceCount: number;
  staffRoleCount: number;
};

type TemplateOption = {
  key: string;
  name: string;
  description: string;
  businessType: string;
  availability:
    "live" | "beta";
};

type PreviewResponse =
  | {
      ok: true;
      preview:
        StarterPackPreview;
      recommendedTemplateKey:
        string;
      serviceDrafts:
        StarterPackServiceDraft[];
    }
  | {
      ok: false;
      message: string;
      code: string;
    };

type ProvisionResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  alreadyApplied?: boolean;
  applyKey?: string;
  result?: {
    businessId?: string;
    slug?: string;
    name?: string;
    templateKey?: string;
    categoriesCreated?: number;
    servicesCreated?: number;
  };
};

type StarterPackBusinessWizardProps = {
  packs:
    PackOption[];
  templates:
    TemplateOption[];
};

const inputClassName = `
  w-full
  rounded-xl
  border
  border-white/10
  bg-zinc-950
  px-4
  py-3
  text-sm
  text-zinc-100
  outline-none
  transition
  placeholder:text-zinc-600
  focus:border-violet-300/50
`;

const TIMEZONES = [
  "Europe/Belgrade",
  "Europe/Berlin",
  "Europe/Vienna",
  "Europe/Zurich",
  "Europe/Paris",
  "Europe/Rome",
  "Europe/London",
] as const;

function slugify(
  value: string
): string {
  return value
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function numericValue(
  value: string
): number {
  const parsed =
    Number(
      value
    );

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}

export default function StarterPackBusinessWizard({
  packs,
  templates,
}: StarterPackBusinessWizardProps) {
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
    phone,
    setPhone,
  ] =
    useState("");

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    timezone,
    setTimezone,
  ] =
    useState(
      "Europe/Belgrade"
    );

  const [
    currency,
    setCurrency,
  ] =
    useState<
      StarterPackCurrency
    >(
      "RSD"
    );

  const [
    packId,
    setPackId,
  ] =
    useState<
      StarterPackVertical
    >(
      packs[0]?.id ??
        "hair-salon"
    );

  const [
    templateKey,
    setTemplateKey,
  ] =
    useState(
      templates[0]?.key ??
        "hair-luxury"
    );

  const [
    selectedModules,
    setSelectedModules,
  ] =
    useState<
      StarterPackModuleId[]
    >([]);

  const [
    preview,
    setPreview,
  ] =
    useState<
      StarterPackPreview |
      null
    >(null);

  const [
    serviceDrafts,
    setServiceDrafts,
  ] =
    useState<
      StarterPackServiceDraft[]
    >([]);

  const [
    applyKey,
    setApplyKey,
  ] =
    useState("");

  const [
    confirmed,
    setConfirmed,
  ] =
    useState(false);

  const [
    isPreviewLoading,
    setIsPreviewLoading,
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
    useState<
      string | null
    >(null);

  const [
    result,
    setResult,
  ] =
    useState<
      ProvisionResponse | null
    >(null);

  const selectedPack =
    useMemo(
      () =>
        packs.find(
          (
            pack
          ) =>
            pack.id ===
            packId
        ) ??
        packs[0] ??
        null,
      [
        packId,
        packs,
      ]
    );

  const servicesByCategory =
    useMemo(
      () => {
        if (
          !preview
        ) {
          return [];
        }

        const draftByKey =
          new Map(
            serviceDrafts.map(
              (
                draft
              ) => [
                draft.serviceKey,
                draft,
              ]
            )
          );

        return preview.categories.map(
          (
            category
          ) => ({
            category,
            services:
              preview.services
                .filter(
                  (
                    service
                  ) =>
                    service.categoryKey ===
                    category.key
                )
                .map(
                  (
                    service
                  ) => ({
                    source:
                      service,
                    draft:
                      draftByKey.get(
                        service.key
                      ) ??
                      null,
                  })
                ),
          })
        );
      },
      [
        preview,
        serviceDrafts,
      ]
    );

  const enabledServiceCount =
    serviceDrafts.filter(
      (
        service
      ) =>
        service.enabled
    ).length;

  function clearPreparedState() {
    setPreview(
      null
    );

    setServiceDrafts(
      []
    );

    setSelectedModules(
      []
    );

    setConfirmed(
      false
    );

    setResult(
      null
    );

    setApplyKey(
      ""
    );

    setError(
      null
    );
  }

  function handleBusinessName(
    value: string
  ) {
    setBusinessName(
      value
    );

    if (
      !slugWasEdited
    ) {
      setBusinessSlug(
        slugify(
          value
        )
      );
    }

    setResult(
      null
    );
  }

  async function loadPreview() {
    setIsPreviewLoading(
      true
    );

    setError(
      null
    );

    setResult(
      null
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/starter-packs/preview",
          {
            method:
              "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                packId,
                selectedModules:
                  [],
              }),
          }
        );

      const body =
        await response.json() as
          PreviewResponse;

      if (
        !response.ok ||
        body.ok ===
          false
      ) {
        throw new Error(
          body.ok ===
            false
            ? body.message
            : "Starter-pack preview nije moguće učitati."
        );
      }

      setPreview(
        body.preview
      );

      setServiceDrafts(
        body.serviceDrafts
      );

      setTemplateKey(
        body
          .recommendedTemplateKey
      );

      setSelectedModules(
        body.preview.modules
          .filter(
            (
              module
            ) =>
              module.selected
          )
          .map(
            (
              module
            ) =>
              module
                .definition
                .id
          )
      );

      setApplyKey(
        crypto.randomUUID()
      );

      setConfirmed(
        false
      );
    } catch (
      requestError
    ) {
      setPreview(
        null
      );

      setServiceDrafts(
        []
      );

      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Došlo je do neočekivane greške."
      );
    } finally {
      setIsPreviewLoading(
        false
      );
    }
  }

  function toggleModule(
    moduleId:
      StarterPackModuleId
  ) {
    if (
      !preview
    ) {
      return;
    }

    const moduleItem =
      preview.modules.find(
        (
          item
        ) =>
          item
            .definition
            .id ===
          moduleId
      );

    if (
      !moduleItem ||
      moduleItem.support ===
        "required"
    ) {
      return;
    }

    setSelectedModules(
      (
        current
      ) =>
        current.includes(
          moduleId
        )
          ? current.filter(
              (
                item
              ) =>
                item !==
                moduleId
            )
          : [
              ...current,
              moduleId,
            ]
    );

    setConfirmed(
      false
    );

    setResult(
      null
    );
  }

  function updateService(
    serviceKey: string,
    patch:
      Partial<
        StarterPackServiceDraft
      >
  ) {
    setServiceDrafts(
      (
        current
      ) =>
        current.map(
          (
            service
          ) =>
            service.serviceKey ===
            serviceKey
              ? {
                  ...service,
                  ...patch,
                }
              : service
        )
    );

    setConfirmed(
      false
    );

    setResult(
      null
    );
  }

  function validate():
    string | null {
    if (
      businessName
        .trim()
        .length <
      2
    ) {
      return "Unesi naziv salona.";
    }

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        businessSlug
      )
    ) {
      return "URL slug nije ispravan.";
    }

    if (
      city
        .trim()
        .length <
      2
    ) {
      return "Unesi grad salona.";
    }

    if (
      phone
        .trim()
        .length <
      5
    ) {
      return "Unesi kontakt telefon.";
    }

    if (
      !preview ||
      serviceDrafts.length ===
        0
    ) {
      return "Prvo učitaj starter-pack preview.";
    }

    if (
      enabledServiceCount ===
      0
    ) {
      return "Ostavi najmanje jednu aktivnu uslugu.";
    }

    for (
      const service of
      serviceDrafts
    ) {
      if (
        !service.enabled
      ) {
        continue;
      }

      if (
        service.name
          .trim()
          .length <
          2 ||
        service.durationMinutes <
          5 ||
        service.priceFrom <
          0 ||
        (
          service.priceType ===
            "range" &&
          (
            service.priceTo ===
              null ||
            service.priceTo <
              service.priceFrom
          )
        )
      ) {
        return `Proveri podatke usluge: ${service.name || service.serviceKey}.`;
      }
    }

    if (
      !confirmed
    ) {
      return "Potvrdi da su usluge, trajanja i cene pregledani.";
    }

    return null;
  }

  async function handleProvision(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError =
      validate();

    if (
      validationError
    ) {
      setError(
        validationError
      );

      return;
    }

    setIsProvisioning(
      true
    );

    setError(
      null
    );

    setResult(
      null
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/provision-starter-pack",
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
                  name:
                    businessName.trim(),
                  slug:
                    businessSlug,
                  city:
                    city.trim(),
                  country:
                    country.trim(),
                  phone:
                    phone.trim(),
                  email:
                    email.trim(),
                  timezone,
                },
                packId,
                selectedModules,
                locale:
                  "sr-Latn",
                currency,
                templateKey,
                applyKey,
                confirmed,
                serviceEdits:
                  serviceDrafts,
              }),
          }
        );

      const body =
        await response.json() as
          ProvisionResponse;

      if (
        !response.ok ||
        body.ok !==
          true
      ) {
        throw new Error(
          body.message ??
            "Starter-pack provisioning nije uspeo."
        );
      }

      setResult(
        body
      );
    } catch (
      requestError
    ) {
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

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        space-y-7
      "
    >
      <div>
        <Link
          href="/platform-admin/businesses/new"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-zinc-400
            transition
            hover:text-white
          "
        >
          <ArrowLeft
            size={16}
          />

          Nazad na klasični wizard
        </Link>

        <div
          className="
            mt-5
            flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-violet-300
          "
        >
          <Sparkles
            size={17}
          />

          CONTENT-STARTER-PACKS-01B
        </div>

        <h1
          className="
            mt-3
            text-3xl
            font-semibold
            tracking-tight
            md:text-4xl
          "
        >
          Starter Pack Business Builder
        </h1>

        <p
          className="
            mt-3
            max-w-4xl
            text-sm
            leading-6
            text-zinc-400
            md:text-base
          "
        >
          Izaberi branšu, potvrdi module,
          prilagodi usluge, trajanja i cene,
          odaberi theme i kreiraj pravi draft
          salon atomskim provisioningom.
          Salon se ne objavljuje automatski.
        </p>
      </div>

      <form
        onSubmit={
          handleProvision
        }
        className="
          grid
          gap-7
          xl:grid-cols-[minmax(0,1fr)_360px]
        "
      >
        <div
          className="
            space-y-7
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
              title="Identitet salona"
              description="Ovi podaci kreiraju pravi tenant u draft stanju."
            />

            <div
              className="
                mt-6
                grid
                gap-4
                md:grid-cols-2
              "
            >
              <Field
                label="Naziv salona"
              >
                <input
                  value={
                    businessName
                  }
                  onChange={(
                    event
                  ) =>
                    handleBusinessName(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                  placeholder="Studio Lumière"
                />
              </Field>

              <Field
                label="URL slug"
              >
                <input
                  value={
                    businessSlug
                  }
                  onChange={(
                    event
                  ) => {
                    setSlugWasEdited(
                      true
                    );

                    setBusinessSlug(
                      slugify(
                        event.target
                          .value
                      )
                    );

                    setResult(
                      null
                    );
                  }}
                  className={
                    inputClassName
                  }
                  placeholder="studio-lumiere"
                />
              </Field>

              <Field
                label="Grad"
              >
                <input
                  value={
                    city
                  }
                  onChange={(
                    event
                  ) =>
                    setCity(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                  placeholder="Beograd"
                />
              </Field>

              <Field
                label="Država"
              >
                <input
                  value={
                    country
                  }
                  onChange={(
                    event
                  ) =>
                    setCountry(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                />
              </Field>

              <Field
                label="Telefon"
              >
                <input
                  value={
                    phone
                  }
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                  placeholder="+381 60 123 4567"
                />
              </Field>

              <Field
                label="Email — opciono"
              >
                <input
                  type="email"
                  value={
                    email
                  }
                  onChange={(
                    event
                  ) =>
                    setEmail(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                  placeholder="kontakt@salon.rs"
                />
              </Field>

              <Field
                label="Vremenska zona"
              >
                <select
                  value={
                    timezone
                  }
                  onChange={(
                    event
                  ) =>
                    setTimezone(
                      event.target
                        .value
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  {TIMEZONES.map(
                    (
                      value
                    ) => (
                      <option
                        key={
                          value
                        }
                        value={
                          value
                        }
                      >
                        {value}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field
                label="Valuta"
              >
                <select
                  value={
                    currency
                  }
                  onChange={(
                    event
                  ) =>
                    setCurrency(
                      event.target
                        .value as
                        StarterPackCurrency
                    )
                  }
                  className={
                    inputClassName
                  }
                >
                  <option value="RSD">
                    RSD
                  </option>

                  <option value="EUR">
                    EUR
                  </option>

                  <option value="CHF">
                    CHF
                  </option>
                </select>
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
            <SectionTitle
              icon={
                Layers3
              }
              title="Starter pack i theme"
              description="Pack daje poslovnu strukturu, a theme određuje izgled."
            />

            <div
              className="
                mt-6
                grid
                gap-4
                md:grid-cols-2
              "
            >
              <Field
                label="Branša"
              >
                <select
                  value={
                    packId
                  }
                  onChange={(
                    event
                  ) => {
                    setPackId(
                      event.target
                        .value as
                        StarterPackVertical
                    );

                    clearPreparedState();
                  }}
                  className={
                    inputClassName
                  }
                >
                  {packs.map(
                    (
                      pack
                    ) => (
                      <option
                        key={
                          pack.id
                        }
                        value={
                          pack.id
                        }
                      >
                        {pack.label}
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
                    selectedPack
                      ?.description
                  }
                </p>
              </Field>

              <Field
                label="Theme pack"
              >
                <select
                  value={
                    templateKey
                  }
                  onChange={(
                    event
                  ) => {
                    setTemplateKey(
                      event.target
                        .value
                    );

                    setConfirmed(
                      false
                    );

                    setResult(
                      null
                    );
                  }}
                  className={
                    inputClassName
                  }
                >
                  {templates.map(
                    (
                      template
                    ) => (
                      <option
                        key={
                          template.key
                        }
                        value={
                          template.key
                        }
                      >
                        {template.name}
                        {" — "}
                        {template.availability}
                      </option>
                    )
                  )}
                </select>
              </Field>
            </div>

            <button
              type="button"
              onClick={
                loadPreview
              }
              disabled={
                isPreviewLoading
              }
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-violet-300
                px-5
                py-3
                text-sm
                font-semibold
                text-zinc-950
                transition
                hover:bg-violet-200
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isPreviewLoading ? (
                <LoaderCircle
                  size={17}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <Plus
                  size={17}
                />
              )}

              Učitaj starter pack
            </button>
          </section>

          {preview ? (
            <>
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
                    PackageCheck
                  }
                  title="Moduli"
                  description="Required moduli su zaključani. Ostale uključuješ prema stvarnoj ponudi."
                />

                <div
                  className="
                    mt-6
                    grid
                    gap-3
                    md:grid-cols-2
                  "
                >
                  {preview.modules.map(
                    (
                      module
                    ) => {
                      const moduleId =
                        module
                          .definition
                          .id;

                      const checked =
                        module.support ===
                          "required" ||
                        selectedModules.includes(
                          moduleId
                        );

                      return (
                        <label
                          key={
                            moduleId
                          }
                          className="
                            flex
                            cursor-pointer
                            items-start
                            gap-3
                            rounded-2xl
                            border
                            border-white/10
                            bg-zinc-950/50
                            p-4
                          "
                        >
                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            disabled={
                              module.support ===
                              "required"
                            }
                            onChange={() =>
                              toggleModule(
                                moduleId
                              )
                            }
                            className="
                              mt-1
                              h-4
                              w-4
                              accent-violet-300
                            "
                          />

                          <span>
                            <span
                              className="
                                block
                                text-sm
                                font-semibold
                                text-zinc-100
                              "
                            >
                              {
                                module
                                  .definition
                                  .label
                              }
                            </span>

                            <span
                              className="
                                mt-1
                                block
                                text-xs
                                leading-5
                                text-zinc-500
                              "
                            >
                              {module.support}
                              {" · "}
                              {
                                module
                                  .definition
                                  .description
                              }
                            </span>
                          </span>
                        </label>
                      );
                    }
                  )}
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
                    Tag
                  }
                  title="Usluge i cene"
                  description="Svaku uslugu potvrdi, izmeni ili isključi. Ništa se ne objavljuje automatski."
                />

                <div
                  className="
                    mt-6
                    space-y-6
                  "
                >
                  {servicesByCategory.map(
                    (
                      group
                    ) => (
                      <div
                        key={
                          group
                            .category
                            .key
                        }
                      >
                        <h3
                          className="
                            text-lg
                            font-semibold
                          "
                        >
                          {
                            group
                              .category
                              .name
                          }
                        </h3>

                        <p
                          className="
                            mt-1
                            text-sm
                            text-zinc-500
                          "
                        >
                          {
                            group
                              .category
                              .description
                          }
                        </p>

                        <div
                          className="
                            mt-3
                            space-y-3
                          "
                        >
                          {group.services.map(
                            (
                              item
                            ) => {
                              const draft =
                                item.draft;

                              if (
                                !draft
                              ) {
                                return null;
                              }

                              return (
                                <div
                                  key={
                                    draft.serviceKey
                                  }
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
                                      flex-col
                                      gap-4
                                      lg:flex-row
                                      lg:items-start
                                    "
                                  >
                                    <label
                                      className="
                                        flex
                                        min-w-36
                                        items-center
                                        gap-2
                                        text-sm
                                        font-semibold
                                      "
                                    >
                                      <input
                                        type="checkbox"
                                        checked={
                                          draft.enabled
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateService(
                                            draft.serviceKey,
                                            {
                                              enabled:
                                                event.target.checked,
                                            }
                                          )
                                        }
                                        className="
                                          h-4
                                          w-4
                                          accent-emerald-300
                                        "
                                      />

                                      Aktivna
                                    </label>

                                    <div
                                      className="
                                        grid
                                        flex-1
                                        gap-3
                                        md:grid-cols-2
                                        xl:grid-cols-4
                                      "
                                    >
                                      <input
                                        value={
                                          draft.name
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateService(
                                            draft.serviceKey,
                                            {
                                              name:
                                                event.target.value,
                                            }
                                          )
                                        }
                                        disabled={
                                          !draft.enabled
                                        }
                                        className={
                                          inputClassName
                                        }
                                        aria-label="Naziv usluge"
                                      />

                                      <input
                                        type="number"
                                        min={5}
                                        max={480}
                                        value={
                                          draft.durationMinutes
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateService(
                                            draft.serviceKey,
                                            {
                                              durationMinutes:
                                                numericValue(
                                                  event.target.value
                                                ),
                                            }
                                          )
                                        }
                                        disabled={
                                          !draft.enabled
                                        }
                                        className={
                                          inputClassName
                                        }
                                        aria-label="Trajanje"
                                      />

                                      <select
                                        value={
                                          draft.priceType
                                        }
                                        onChange={(
                                          event
                                        ) => {
                                          const nextType =
                                            event.target
                                              .value as
                                              ServicePriceType;

                                          updateService(
                                            draft.serviceKey,
                                            {
                                              priceType:
                                                nextType,
                                              priceTo:
                                                nextType ===
                                                  "range"
                                                  ? draft.priceTo ??
                                                    draft.priceFrom
                                                  : null,
                                            }
                                          );
                                        }}
                                        disabled={
                                          !draft.enabled
                                        }
                                        className={
                                          inputClassName
                                        }
                                        aria-label="Tip cene"
                                      >
                                        <option value="fixed">
                                          Fiksna
                                        </option>

                                        <option value="from">
                                          Od
                                        </option>

                                        <option value="range">
                                          Raspon
                                        </option>
                                      </select>

                                      <div
                                        className="
                                          grid
                                          grid-cols-2
                                          gap-2
                                        "
                                      >
                                        <input
                                          type="number"
                                          min={0}
                                          value={
                                            draft.priceFrom
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            updateService(
                                              draft.serviceKey,
                                              {
                                                priceFrom:
                                                  numericValue(
                                                    event.target.value
                                                  ),
                                              }
                                            )
                                          }
                                          disabled={
                                            !draft.enabled
                                          }
                                          className={
                                            inputClassName
                                          }
                                          aria-label="Cena od"
                                        />

                                        <input
                                          type="number"
                                          min={
                                            draft.priceFrom
                                          }
                                          value={
                                            draft.priceTo ??
                                            ""
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            updateService(
                                              draft.serviceKey,
                                              {
                                                priceTo:
                                                  event.target.value ===
                                                  ""
                                                    ? null
                                                    : numericValue(
                                                        event.target.value
                                                      ),
                                              }
                                            )
                                          }
                                          disabled={
                                            !draft.enabled ||
                                            draft.priceType !==
                                              "range"
                                          }
                                          className={
                                            inputClassName
                                          }
                                          placeholder="Do"
                                          aria-label="Cena do"
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <textarea
                                    value={
                                      draft.description
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateService(
                                        draft.serviceKey,
                                        {
                                          description:
                                            event.target.value,
                                        }
                                      )
                                    }
                                    disabled={
                                      !draft.enabled
                                    }
                                    className={`
                                      ${inputClassName}
                                      mt-3
                                      min-h-20
                                      resize-y
                                    `}
                                    aria-label="Opis usluge"
                                  />
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </section>
            </>
          ) : null}

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

              <p
                className="
                  text-sm
                  leading-6
                "
              >
                {error}
              </p>
            </div>
          ) : null}

          {result?.ok ? (
            <div
              className="
                rounded-3xl
                border
                border-emerald-400/20
                bg-emerald-400/[0.08]
                p-6
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
                  size={23}
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
                    Salon je kreiran
                  </h3>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-zinc-400
                    "
                  >
                    {
                      result.alreadyApplied
                        ? "Isti apply zahtev je bezbedno prepoznat i nije dupliran."
                        : "Atomski provisioning je završen. Salon ostaje draft dok ga ručno ne objaviš."
                    }
                  </p>
                </div>
              </div>

              <div
                className="
                  mt-5
                  flex
                  flex-wrap
                  gap-3
                "
              >
                <Link
                  href={`/platform-admin/businesses/${businessSlug}`}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-zinc-950
                  "
                >
                  Otvori workspace

                  <ChevronRight
                    size={16}
                  />
                </Link>

                <Link
                  href={`/salon/${businessSlug}?preview=1`}
                  target="_blank"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-white/10
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Otvori javni preview

                  <ExternalLink
                    size={16}
                  />
                </Link>
              </div>
            </div>
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
            <Save
              size={22}
            />
          </div>

          <h2
            className="
              mt-5
              text-xl
              font-semibold
            "
          >
            Apply pregled
          </h2>

          <div
            className="
              mt-5
              space-y-3
            "
          >
            <Summary
              icon={
                Building2
              }
              label="Salon"
              value={
                businessName ||
                "Nije unet"
              }
            />

            <Summary
              icon={
                Layers3
              }
              label="Starter pack"
              value={
                selectedPack
                  ?.label ??
                packId
              }
            />

            <Summary
              icon={
                Sparkles
              }
              label="Theme"
              value={
                templates.find(
                  (
                    template
                  ) =>
                    template.key ===
                    templateKey
                )?.name ??
                templateKey
              }
            />

            <Summary
              icon={
                Tag
              }
              label="Aktivne usluge"
              value={
                String(
                  enabledServiceCount
                )
              }
            />

            <Summary
              icon={
                Coins
              }
              label="Valuta"
              value={
                currency
              }
            />

            <Summary
              icon={
                Clock3
              }
              label="Zona"
              value={
                timezone
              }
            />

            <Summary
              icon={
                MapPin
              }
              label="Lokacija"
              value={
                city
                  ? `${city}, ${country}`
                  : "Nije uneta"
              }
            />

            <Summary
              icon={
                Phone
              }
              label="Telefon"
              value={
                phone ||
                "Nije unet"
              }
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
              bg-zinc-950/50
              p-4
            "
          >
            <input
              type="checkbox"
              checked={
                confirmed
              }
              disabled={
                !preview
              }
              onChange={(
                event
              ) =>
                setConfirmed(
                  event.target
                    .checked
                )
              }
              className="
                mt-1
                h-4
                w-4
                accent-emerald-300
              "
            />

            <span
              className="
                text-xs
                leading-5
                text-zinc-400
              "
            >
              Potvrđujem da sam pregledao
              aktivne usluge, trajanja,
              cene, module i izabrani theme.
            </span>
          </label>

          <button
            type="submit"
            disabled={
              isProvisioning ||
              !preview
            }
            className="
              mt-5
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-emerald-300
              px-4
              py-3
              text-sm
              font-semibold
              text-zinc-950
              transition
              hover:bg-emerald-200
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isProvisioning ? (
              <LoaderCircle
                size={17}
                className="
                  animate-spin
                "
              />
            ) : (
              <PackageCheck
                size={17}
              />
            )}

            Kreiraj draft salon
          </button>

          <button
            type="button"
            onClick={
              clearPreparedState
            }
            className="
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              px-4
              py-3
              text-sm
              font-semibold
              text-zinc-300
              transition
              hover:bg-white/5
            "
          >
            <RotateCcw
              size={16}
            />

            Resetuj pack
          </button>

          <p
            className="
              mt-4
              text-center
              text-xs
              leading-5
              text-zinc-600
            "
          >
            Kreiranje je idempotentno po
            apply ključu i slug-u. Postojeći
            salon se nikada ne pregazuje.
          </p>
        </aside>
      </form>
    </div>
  );
}

function SectionTitle({
  icon:
    Icon,
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
          bg-white/10
          text-zinc-200
        "
      >
        <Icon
          size={19}
        />
      </div>

      <div>
        <h2
          className="
            text-xl
            font-semibold
          "
        >
          {title}
        </h2>

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

function Field({
  label,
  children,
}: {
  label: string;
  children:
    ReactNode;
}) {
  return (
    <label
      className="
        block
      "
    >
      <span
        className="
          mb-2
          block
          text-sm
          font-medium
          text-zinc-300
        "
      >
        {label}
      </span>

      {children}
    </label>
  );
}

function Summary({
  icon:
    Icon,
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
        flex
        items-start
        gap-3
        rounded-xl
        border
        border-white/10
        bg-zinc-950/40
        p-3
      "
    >
      <Icon
        size={16}
        className="
          mt-0.5
          shrink-0
          text-zinc-500
        "
      />

      <div
        className="
          min-w-0
        "
      >
        <p
          className="
            text-xs
            text-zinc-600
          "
        >
          {label}
        </p>

        <p
          className="
            mt-1
            truncate
            text-sm
            font-medium
            text-zinc-200
          "
        >
          {value}
        </p>
      </div>
    </div>
  );
}
