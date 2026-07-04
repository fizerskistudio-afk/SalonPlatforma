"use client";

import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  CircleOff,
  Clock3,
  Coins,
  LoaderCircle,
  Pencil,
  PlusCircle,
  Save,
  Scissors,
  X,
} from "lucide-react";

type PriceType =
  | "fixed"
  | "from"
  | "range";

type CategoryItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconKey: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

type ServiceItem = {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceType: string;
  priceFrom: number;
  priceTo: number | null;
  sortOrder: number;
  isActive: boolean;
  updatedAt: string;
};

type CategoryForm = {
  slug: string;
  name: string;
  description: string;
  iconKey: string;
  sortOrder: number;
  isActive: boolean;
};

type ServiceForm = {
  slug: string;
  categoryId: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceType: PriceType;
  priceFrom: string;
  priceTo: string;
  sortOrder: number;
  isActive: boolean;
};

type CategoryEditorState = {
  entityType: "category";
  mode:
    | "create"
    | "update";
  currentSlug: string | null;
  expectedUpdatedAt:
    | string
    | null;
  form: CategoryForm;
};

type ServiceEditorState = {
  entityType: "service";
  mode:
    | "create"
    | "update";
  currentSlug: string | null;
  expectedUpdatedAt:
    | string
    | null;
  form: ServiceForm;
};

type EditorState =
  | CategoryEditorState
  | ServiceEditorState
  | null;

type BusinessCatalogManagerProps = {
  businessSlug: string;
  businessName: string;
  defaultLocale: string;
  currency: string;
  categories:
    readonly CategoryItem[];
  services:
    readonly ServiceItem[];
};

type SaveCatalogResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  result?: {
    itemSlug?: string;
    entityType?: string;
  };
};

function normalizeSlug(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /đ/g,
      "dj"
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

function normalizePriceType(
  value: string
): PriceType {
  if (
    value === "from" ||
    value === "range"
  ) {
    return value;
  }

  return "fixed";
}

function formatPrice(
  service: ServiceItem,
  currency: string
): string {
  const formatter =
    new Intl.NumberFormat(
      "sr-Latn-RS",
      {
        style:
          "currency",
        currency,
        maximumFractionDigits:
          2,
      }
    );

  if (
    service.priceType ===
      "range" &&
    service.priceTo !== null
  ) {
    return `${formatter.format(
      service.priceFrom
    )} – ${formatter.format(
      service.priceTo
    )}`;
  }

  if (
    service.priceType ===
    "from"
  ) {
    return `od ${formatter.format(
      service.priceFrom
    )}`;
  }

  return formatter.format(
    service.priceFrom
  );
}

export default function BusinessCatalogManager({
  businessSlug,
  businessName,
  defaultLocale,
  currency,
  categories,
  services,
}: BusinessCatalogManagerProps) {
  const router =
    useRouter();

  const [
    editor,
    setEditor,
  ] = useState<EditorState>(
    null
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    errorCode,
    setErrorCode,
  ] = useState<string | null>(
    null
  );

  const [
    success,
    setSuccess,
  ] = useState<string | null>(
    null
  );

  const categoryById =
    useMemo(
      () =>
        new Map(
          categories.map(
            (category) => [
              category.id,
              category,
            ] as const
          )
        ),
      [categories]
    );

  const servicesByCategory =
    useMemo(
      () => {
        const grouped =
          new Map<
            string,
            ServiceItem[]
          >();

        for (
          const service of
          services
        ) {
          const group =
            grouped.get(
              service.categoryId
            ) ?? [];

          group.push(
            service
          );

          grouped.set(
            service.categoryId,
            group
          );
        }

        return grouped;
      },
      [services]
    );

  const activeCategories =
    categories.filter(
      (category) =>
        category.isActive
    ).length;

  const activeServices =
    services.filter(
      (service) =>
        service.isActive
    ).length;

  const uncategorizedServices =
    services.filter(
      (service) =>
        !categoryById.has(
          service.categoryId
        )
    );

  function clearMessages() {
    setError(
      null
    );
    setErrorCode(
      null
    );
    setSuccess(
      null
    );
  }

  function openCreateCategory() {
    clearMessages();

    setEditor({
      entityType:
        "category",
      mode:
        "create",
      currentSlug:
        null,
      expectedUpdatedAt:
        null,
      form: {
        slug:
          "",
        name:
          "",
        description:
          "",
        iconKey:
          "",
        sortOrder:
          categories.length > 0
            ? Math.max(
                ...categories.map(
                  (category) =>
                    category.sortOrder
                )
              ) + 10
            : 0,
        isActive:
          true,
      },
    });
  }

  function openEditCategory(
    category: CategoryItem
  ) {
    clearMessages();

    setEditor({
      entityType:
        "category",
      mode:
        "update",
      currentSlug:
        category.slug,
      expectedUpdatedAt:
        category.updatedAt,
      form: {
        slug:
          category.slug,
        name:
          category.name,
        description:
          category.description,
        iconKey:
          category.iconKey,
        sortOrder:
          category.sortOrder,
        isActive:
          category.isActive,
      },
    });
  }

  function openCreateService(
    preferredCategoryId?: string
  ) {
    clearMessages();

    const defaultCategoryId =
      preferredCategoryId ??
      categories.find(
        (category) =>
          category.isActive
      )?.id ??
      categories[0]?.id ??
      "";

    setEditor({
      entityType:
        "service",
      mode:
        "create",
      currentSlug:
        null,
      expectedUpdatedAt:
        null,
      form: {
        slug:
          "",
        categoryId:
          defaultCategoryId,
        name:
          "",
        description:
          "",
        durationMinutes:
          30,
        priceType:
          "fixed",
        priceFrom:
          "0",
        priceTo:
          "",
        sortOrder:
          services.length > 0
            ? Math.max(
                ...services.map(
                  (service) =>
                    service.sortOrder
                )
              ) + 10
            : 0,
        isActive:
          true,
      },
    });
  }

  function openEditService(
    service: ServiceItem
  ) {
    clearMessages();

    setEditor({
      entityType:
        "service",
      mode:
        "update",
      currentSlug:
        service.slug,
      expectedUpdatedAt:
        service.updatedAt,
      form: {
        slug:
          service.slug,
        categoryId:
          service.categoryId,
        name:
          service.name,
        description:
          service.description,
        durationMinutes:
          service.durationMinutes,
        priceType:
          normalizePriceType(
            service.priceType
          ),
        priceFrom:
          String(
            service.priceFrom
          ),
        priceTo:
          service.priceTo === null
            ? ""
            : String(
                service.priceTo
              ),
        sortOrder:
          service.sortOrder,
        isActive:
          service.isActive,
      },
    });
  }

  function closeEditor() {
    if (
      isSubmitting
    ) {
      return;
    }

    setEditor(
      null
    );
    clearMessages();
  }

  function updateCategory<
    Key extends keyof CategoryForm,
  >(
    key: Key,
    value: CategoryForm[Key]
  ) {
    setEditor(
      (currentEditor) => {
        if (
          !currentEditor ||
          currentEditor.entityType !==
            "category"
        ) {
          return currentEditor;
        }

        return {
          ...currentEditor,
          form: {
            ...currentEditor.form,
            [key]: value,
          },
        };
      }
    );

    clearMessages();
  }

  function updateService<
    Key extends keyof ServiceForm,
  >(
    key: Key,
    value: ServiceForm[Key]
  ) {
    setEditor(
      (currentEditor) => {
        if (
          !currentEditor ||
          currentEditor.entityType !==
            "service"
        ) {
          return currentEditor;
        }

        return {
          ...currentEditor,
          form: {
            ...currentEditor.form,
            [key]: value,
          },
        };
      }
    );

    clearMessages();
  }

  function handleCategoryNameChange(
    value: string
  ) {
    setEditor(
      (currentEditor) => {
        if (
          !currentEditor ||
          currentEditor.entityType !==
            "category"
        ) {
          return currentEditor;
        }

        return {
          ...currentEditor,
          form: {
            ...currentEditor.form,
            name:
              value,
            slug:
              currentEditor.mode ===
                "create"
                ? normalizeSlug(
                    value
                  )
                : currentEditor.form.slug,
          },
        };
      }
    );

    clearMessages();
  }

  function handleServiceNameChange(
    value: string
  ) {
    setEditor(
      (currentEditor) => {
        if (
          !currentEditor ||
          currentEditor.entityType !==
            "service"
        ) {
          return currentEditor;
        }

        return {
          ...currentEditor,
          form: {
            ...currentEditor.form,
            name:
              value,
            slug:
              currentEditor.mode ===
                "create"
                ? normalizeSlug(
                    value
                  )
                : currentEditor.form.slug,
          },
        };
      }
    );

    clearMessages();
  }

  function validateEditor():
    string | null {
    if (
      !editor
    ) {
      return "Izaberi stavku kataloga.";
    }

    if (
      !editor.form.slug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        editor.form.slug
      )
    ) {
      return "Slug mora sadržati mala slova, brojeve i crtice.";
    }

    if (
      editor.entityType ===
      "category"
    ) {
      if (
        editor.form.name.trim()
          .length < 2 ||
        editor.form.name.trim()
          .length > 160
      ) {
        return "Naziv kategorije mora imati između 2 i 160 karaktera.";
      }

      if (
        editor.form.description.trim()
          .length > 2000
      ) {
        return "Opis kategorije može imati najviše 2000 karaktera.";
      }

      if (
        editor.form.iconKey.trim()
          .length > 100
      ) {
        return "Icon key može imati najviše 100 karaktera.";
      }

      if (
        !Number.isInteger(
          editor.form.sortOrder
        ) ||
        editor.form.sortOrder < 0 ||
        editor.form.sortOrder > 100000
      ) {
        return "Redosled kategorije nije ispravan.";
      }

      return null;
    }

    if (
      !editor.form.categoryId
    ) {
      return "Izaberi kategoriju usluge.";
    }

    const selectedCategory =
      categoryById.get(
        editor.form.categoryId
      );

    if (
      !selectedCategory
    ) {
      return "Izabrana kategorija više ne postoji.";
    }

    if (
      editor.form.isActive &&
      !selectedCategory.isActive
    ) {
      return "Aktivna usluga mora pripadati aktivnoj kategoriji.";
    }

    if (
      editor.form.name.trim()
        .length < 2 ||
      editor.form.name.trim()
        .length > 160
    ) {
      return "Naziv usluge mora imati između 2 i 160 karaktera.";
    }

    if (
      editor.form.description.trim()
        .length > 3000
    ) {
      return "Opis usluge može imati najviše 3000 karaktera.";
    }

    if (
      !Number.isInteger(
        editor.form.durationMinutes
      ) ||
      editor.form.durationMinutes < 5 ||
      editor.form.durationMinutes > 1440
    ) {
      return "Trajanje usluge mora biti između 5 i 1440 minuta.";
    }

    const priceFrom =
      Number(
        editor.form.priceFrom
      );

    if (
      !Number.isFinite(
        priceFrom
      ) ||
      priceFrom < 0
    ) {
      return "Početna cena usluge nije ispravna.";
    }

    if (
      editor.form.priceType ===
      "range"
    ) {
      const priceTo =
        Number(
          editor.form.priceTo
        );

      if (
        !editor.form.priceTo.trim() ||
        !Number.isFinite(
          priceTo
        ) ||
        priceTo < priceFrom
      ) {
        return "Krajnja cena mora biti veća ili jednaka početnoj ceni.";
      }
    }

    if (
      !Number.isInteger(
        editor.form.sortOrder
      ) ||
      editor.form.sortOrder < 0 ||
      editor.form.sortOrder > 100000
    ) {
      return "Redosled usluge nije ispravan.";
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    clearMessages();

    const validationError =
      validateEditor();

    if (
      validationError
    ) {
      setError(
        validationError
      );
      return;
    }

    if (
      !editor
    ) {
      return;
    }

    setIsSubmitting(
      true
    );

    try {
      const item =
        editor.entityType ===
          "category"
          ? {
              name:
                editor.form.name.trim(),
              description:
                editor.form.description.trim(),
              iconKey:
                editor.form.iconKey.trim(),
              sortOrder:
                editor.form.sortOrder,
              isActive:
                editor.form.isActive,
            }
          : {
              categoryId:
                editor.form.categoryId,
              name:
                editor.form.name.trim(),
              description:
                editor.form.description.trim(),
              durationMinutes:
                editor.form.durationMinutes,
              priceType:
                editor.form.priceType,
              priceFrom:
                Number(
                  editor.form.priceFrom
                ),
              priceTo:
                editor.form.priceType ===
                  "range"
                  ? Number(
                      editor.form.priceTo
                    )
                  : null,
              sortOrder:
                editor.form.sortOrder,
              isActive:
                editor.form.isActive,
            };

      const response =
        await fetch(
          "/api/platform-admin/businesses/catalog",
          {
            method:
              editor.mode ===
                "create"
                ? "POST"
                : "PUT",
            headers: {
              "Content-Type":
                "application/json",
            },
            cache:
              "no-store",
            body:
              JSON.stringify({
                businessSlug,
                entityType:
                  editor.entityType,
                currentSlug:
                  editor.currentSlug,
                itemSlug:
                  editor.form.slug,
                expectedUpdatedAt:
                  editor.expectedUpdatedAt,
                item,
              }),
          }
        );

      const payload =
        await response.json() as
          SaveCatalogResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setError(
          payload.message ??
            "Čuvanje kataloga nije uspelo."
        );
        setErrorCode(
          payload.code ??
            null
        );
        return;
      }

      setSuccess(
        editor.entityType ===
          "category"
          ? "Kategorija je sačuvana."
          : "Usluga je sačuvana."
      );

      setEditor(
        null
      );
      router.refresh();
    } catch {
      setError(
        "Nije moguće povezati se sa serverom. Pokušaj ponovo."
      );
      setErrorCode(
        "NETWORK_ERROR"
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <div
      className="mt-8 space-y-6"
    >
      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          label="Kategorije"
          value={
            categories.length
          }
          helper={`${activeCategories} aktivnih`}
          icon={Scissors}
        />

        <MetricCard
          label="Usluge"
          value={
            services.length
          }
          helper={`${activeServices} aktivnih`}
          icon={CheckCircle2}
        />

        <MetricCard
          label="Neaktivne usluge"
          value={
            services.length -
            activeServices
          }
          helper="ostaju u istoriji"
          icon={CircleOff}
        />

        <MetricCard
          label="Valuta"
          value={
            currency
          }
          helper={
            `glavni jezik ${defaultLocale}`
          }
          icon={Coins}
        />
      </section>

      <section
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
      >
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3
              className="text-xl font-semibold"
            >
              Katalog salona
            </h3>

            <p
              className="mt-1 text-sm leading-6 text-zinc-500"
            >
              {businessName} · kategorije i usluge se uređuju na glavnom jeziku salona ({defaultLocale}).
            </p>
          </div>

          <div
            className="flex flex-wrap gap-3"
          >
            <button
              type="button"
              onClick={
                openCreateCategory
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
            >
              <PlusCircle
                size={17}
              />

              Nova kategorija
            </button>

            <button
              type="button"
              onClick={() =>
                openCreateService()
              }
              disabled={
                categories.length === 0
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              <PlusCircle
                size={17}
              />

              Nova usluga
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <MessageBox
          variant="error"
          title={
            error
          }
          helper={
            errorCode
              ? `Kod: ${errorCode}`
              : null
          }
        />
      ) : null}

      {success ? (
        <MessageBox
          variant="success"
          title={
            success
          }
          helper="Podaci su osveženi iz baze."
        />
      ) : null}

      {editor ? (
        <CatalogEditor
          editor={
            editor
          }
          categories={
            categories
          }
          currency={
            currency
          }
          isSubmitting={
            isSubmitting
          }
          onSubmit={
            handleSubmit
          }
          onClose={
            closeEditor
          }
          onCategoryNameChange={
            handleCategoryNameChange
          }
          onServiceNameChange={
            handleServiceNameChange
          }
          updateCategory={
            updateCategory
          }
          updateService={
            updateService
          }
        />
      ) : null}

      {categories.length > 0 ? (
        <section
          className="space-y-4"
        >
          {categories.map(
            (category) => {
              const categoryServices =
                servicesByCategory.get(
                  category.id
                ) ?? [];

              const activeCategoryServices =
                categoryServices.filter(
                  (service) =>
                    service.isActive
                ).length;

              return (
                <article
                  key={
                    category.id
                  }
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >
                  <div
                    className="flex flex-col gap-4 border-b border-white/10 p-5 md:flex-row md:items-start md:justify-between md:p-6"
                  >
                    <div
                      className="min-w-0"
                    >
                      <div
                        className="flex flex-wrap items-center gap-2"
                      >
                        <h3
                          className="text-lg font-semibold"
                        >
                          {category.name ||
                            category.slug}
                        </h3>

                        <StatusBadge
                          isActive={
                            category.isActive
                          }
                        />
                      </div>

                      <p
                        className="mt-1 break-all text-xs text-zinc-600"
                      >
                        /{category.slug}
                      </p>

                      {category.description ? (
                        <p
                          className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400"
                        >
                          {category.description}
                        </p>
                      ) : null}

                      <div
                        className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-500"
                      >
                        <span
                          className="rounded-lg border border-white/10 bg-zinc-950/50 px-2.5 py-1"
                        >
                          redosled {category.sortOrder}
                        </span>

                        {category.iconKey ? (
                          <span
                            className="rounded-lg border border-white/10 bg-zinc-950/50 px-2.5 py-1"
                          >
                            icon: {category.iconKey}
                          </span>
                        ) : null}

                        <span
                          className="rounded-lg border border-white/10 bg-zinc-950/50 px-2.5 py-1"
                        >
                          {activeCategoryServices}/{categoryServices.length} aktivnih usluga
                        </span>
                      </div>
                    </div>

                    <div
                      className="flex shrink-0 flex-wrap gap-3"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openCreateService(
                            category.id
                          )
                        }
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                      >
                        <PlusCircle
                          size={16}
                        />

                        Dodaj uslugu
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditCategory(
                            category
                          )
                        }
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                      >
                        <Pencil
                          size={16}
                        />

                        Uredi
                      </button>
                    </div>
                  </div>

                  {categoryServices.length > 0 ? (
                    <div
                      className="grid gap-3 p-4 md:p-5 xl:grid-cols-2"
                    >
                      {categoryServices.map(
                        (service) => (
                          <article
                            key={
                              service.id
                            }
                            className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
                          >
                            <div
                              className="flex items-start justify-between gap-4"
                            >
                              <div
                                className="min-w-0"
                              >
                                <div
                                  className="flex flex-wrap items-center gap-2"
                                >
                                  <h4
                                    className="font-semibold"
                                  >
                                    {service.name ||
                                      service.slug}
                                  </h4>

                                  <StatusBadge
                                    isActive={
                                      service.isActive
                                    }
                                    compact
                                  />
                                </div>

                                <p
                                  className="mt-1 break-all text-xs text-zinc-600"
                                >
                                  /{service.slug}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditService(
                                    service
                                  )
                                }
                                aria-label={
                                  `Uredi uslugu ${service.name}`
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white"
                              >
                                <Pencil
                                  size={15}
                                />
                              </button>
                            </div>

                            {service.description ? (
                              <p
                                className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-500"
                              >
                                {service.description}
                              </p>
                            ) : null}

                            <div
                              className="mt-4 grid grid-cols-2 gap-3"
                            >
                              <DetailPill
                                icon={Clock3}
                                label="Trajanje"
                                value={`${service.durationMinutes} min`}
                              />

                              <DetailPill
                                icon={Coins}
                                label="Cena"
                                value={
                                  formatPrice(
                                    service,
                                    currency
                                  )
                                }
                              />
                            </div>

                            <p
                              className="mt-3 text-xs text-zinc-600"
                            >
                              Redosled: {service.sortOrder}
                            </p>
                          </article>
                        )
                      )}
                    </div>
                  ) : (
                    <div
                      className="p-6 text-center"
                    >
                      <p
                        className="text-sm text-zinc-500"
                      >
                        Kategorija još nema usluge.
                      </p>
                    </div>
                  )}
                </article>
              );
            }
          )}
        </section>
      ) : (
        <section
          className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center"
        >
          <Scissors
            size={34}
            className="mx-auto text-zinc-700"
          />

          <h3
            className="mt-4 text-lg font-semibold"
          >
            Katalog je prazan
          </h3>

          <p
            className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-500"
          >
            Prvo dodaj kategoriju, a zatim usluge koje salon nudi.
          </p>

          <button
            type="button"
            onClick={
              openCreateCategory
            }
            className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            <PlusCircle
              size={18}
            />

            Dodaj prvu kategoriju
          </button>
        </section>
      )}

      {uncategorizedServices.length > 0 ? (
        <MessageBox
          variant="error"
          title="Pronađene su usluge bez postojeće kategorije."
          helper="Proveri integritet baze pre daljeg uređivanja kataloga."
        />
      ) : null}
    </div>
  );
}

function CatalogEditor({
  editor,
  categories,
  currency,
  isSubmitting,
  onSubmit,
  onClose,
  onCategoryNameChange,
  onServiceNameChange,
  updateCategory,
  updateService,
}: {
  editor:
    Exclude<
      EditorState,
      null
    >;
  categories:
    readonly CategoryItem[];
  currency: string;
  isSubmitting: boolean;
  onSubmit:
    (
      event:
        FormEvent<HTMLFormElement>
    ) => void;
  onClose: () => void;
  onCategoryNameChange:
    (value: string) => void;
  onServiceNameChange:
    (value: string) => void;
  updateCategory:
    <Key extends keyof CategoryForm>(
      key: Key,
      value: CategoryForm[Key]
    ) => void;
  updateService:
    <Key extends keyof ServiceForm>(
      key: Key,
      value: ServiceForm[Key]
    ) => void;
}) {
  return (
    <section
      className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.04] p-5 md:p-6"
    >
      <div
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p
            className="text-sm font-semibold text-amber-200"
          >
            {editor.mode ===
            "create"
              ? "Nova stavka"
              : "Uređivanje stavke"}
          </p>

          <h3
            className="mt-1 text-xl font-semibold"
          >
            {editor.entityType ===
            "category"
              ? "Kategorija"
              : "Usluga"}
          </h3>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          disabled={
            isSubmitting
          }
          aria-label="Zatvori editor"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X
            size={18}
          />
        </button>
      </div>

      <form
        onSubmit={
          onSubmit
        }
        className="mt-6 space-y-5"
      >
        {editor.entityType ===
        "category" ? (
          <>
            <div
              className="grid gap-5 md:grid-cols-2"
            >
              <Field
                label="Naziv kategorije"
                required
              >
                <input
                  value={
                    editor.form.name
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      onCategoryNameChange(
                        event.target.value
                      )
                  }
                  maxLength={160}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Slug"
                required
                helper="Mala slova, brojevi i crtice."
              >
                <input
                  value={
                    editor.form.slug
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      updateCategory(
                        "slug",
                        normalizeSlug(
                          event.target.value
                        )
                      )
                  }
                  maxLength={100}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Icon key"
                helper="Opcioni interni naziv ikonice."
              >
                <input
                  value={
                    editor.form.iconKey
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      updateCategory(
                        "iconKey",
                        event.target.value
                      )
                  }
                  maxLength={100}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Redosled"
              >
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={
                    editor.form.sortOrder
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      updateCategory(
                        "sortOrder",
                        Number(
                          event.target.value
                        )
                      )
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field
              label="Opis kategorije"
              helper={`${editor.form.description.length}/2000`}
            >
              <textarea
                value={
                  editor.form.description
                }
                onChange={
                  (
                    event:
                      ChangeEvent<HTMLTextAreaElement>
                  ) =>
                    updateCategory(
                      "description",
                      event.target.value
                    )
                }
                maxLength={2000}
                rows={4}
                className={textareaClassName}
              />
            </Field>

            <StatusToggle
              isActive={
                editor.form.isActive
              }
              title="Kategorija je aktivna"
              description="Neaktivna kategorija se ne prikazuje u javnom booking katalogu. Kategorija sa aktivnim uslugama ne može biti deaktivirana."
              onChange={
                (checked) =>
                  updateCategory(
                    "isActive",
                    checked
                  )
              }
            />
          </>
        ) : (
          <>
            <div
              className="grid gap-5 md:grid-cols-2"
            >
              <Field
                label="Naziv usluge"
                required
              >
                <input
                  value={
                    editor.form.name
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      onServiceNameChange(
                        event.target.value
                      )
                  }
                  maxLength={160}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Slug"
                required
                helper="Mala slova, brojevi i crtice."
              >
                <input
                  value={
                    editor.form.slug
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      updateService(
                        "slug",
                        normalizeSlug(
                          event.target.value
                        )
                      )
                  }
                  maxLength={100}
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Kategorija"
                required
              >
                <select
                  value={
                    editor.form.categoryId
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLSelectElement>
                    ) =>
                      updateService(
                        "categoryId",
                        event.target.value
                      )
                  }
                  className={inputClassName}
                >
                  <option
                    value=""
                  >
                    Izaberi kategoriju
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {category.name ||
                          category.slug}
                        {category.isActive
                          ? ""
                          : " (neaktivna)"}
                      </option>
                    )
                  )}
                </select>
              </Field>

              <Field
                label="Trajanje u minutima"
                required
              >
                <input
                  type="number"
                  min={5}
                  max={1440}
                  step={5}
                  value={
                    editor.form.durationMinutes
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      updateService(
                        "durationMinutes",
                        Number(
                          event.target.value
                        )
                      )
                  }
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Tip cene"
                required
              >
                <select
                  value={
                    editor.form.priceType
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLSelectElement>
                    ) =>
                      updateService(
                        "priceType",
                        normalizePriceType(
                          event.target.value
                        )
                      )
                  }
                  className={inputClassName}
                >
                  <option
                    value="fixed"
                  >
                    Fiksna cena
                  </option>
                  <option
                    value="from"
                  >
                    Cena od
                  </option>
                  <option
                    value="range"
                  >
                    Raspon cena
                  </option>
                </select>
              </Field>

              <Field
                label={`Cena (${currency})`}
                required
              >
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={
                    editor.form.priceFrom
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      updateService(
                        "priceFrom",
                        event.target.value
                      )
                  }
                  className={inputClassName}
                />
              </Field>

              {editor.form.priceType ===
              "range" ? (
                <Field
                  label={`Cena do (${currency})`}
                  required
                >
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={
                      editor.form.priceTo
                    }
                    onChange={
                      (
                        event:
                          ChangeEvent<HTMLInputElement>
                      ) =>
                        updateService(
                          "priceTo",
                          event.target.value
                        )
                    }
                    className={inputClassName}
                  />
                </Field>
              ) : null}

              <Field
                label="Redosled"
              >
                <input
                  type="number"
                  min={0}
                  max={100000}
                  value={
                    editor.form.sortOrder
                  }
                  onChange={
                    (
                      event:
                        ChangeEvent<HTMLInputElement>
                    ) =>
                      updateService(
                        "sortOrder",
                        Number(
                          event.target.value
                        )
                      )
                  }
                  className={inputClassName}
                />
              </Field>
            </div>

            <Field
              label="Opis usluge"
              helper={`${editor.form.description.length}/3000`}
            >
              <textarea
                value={
                  editor.form.description
                }
                onChange={
                  (
                    event:
                      ChangeEvent<HTMLTextAreaElement>
                  ) =>
                    updateService(
                      "description",
                      event.target.value
                    )
                }
                maxLength={3000}
                rows={4}
                className={textareaClassName}
              />
            </Field>

            <StatusToggle
              isActive={
                editor.form.isActive
              }
              title="Usluga je aktivna"
              description="Neaktivna usluga se ne nudi za nove rezervacije, ali postojeća istorija ostaje sačuvana."
              onChange={
                (checked) =>
                  updateService(
                    "isActive",
                    checked
                  )
              }
            />
          </>
        )}

        <div
          className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end"
        >
          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSubmitting
            }
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Otkaži
          </button>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            {isSubmitting ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save
                size={17}
              />
            )}

            {isSubmitting
              ? "Čuvanje..."
              : "Sačuvaj"}
          </button>
        </div>
      </form>
    </section>
  );
}

function StatusToggle({
  isActive,
  title,
  description,
  onChange,
}: {
  isActive: boolean;
  title: string;
  description: string;
  onChange:
    (checked: boolean) => void;
}) {
  return (
    <label
      className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/40 p-4"
    >
      <input
        type="checkbox"
        checked={
          isActive
        }
        onChange={
          (
            event:
              ChangeEvent<HTMLInputElement>
          ) =>
            onChange(
              event.target.checked
            )
        }
        className="mt-1 h-4 w-4 rounded border-white/20 bg-zinc-900 text-amber-300 focus:ring-amber-300"
      />

      <span>
        <span
          className="block text-sm font-semibold text-zinc-200"
        >
          {title}
        </span>

        <span
          className="mt-1 block text-sm leading-6 text-zinc-500"
        >
          {description}
        </span>
      </span>
    </label>
  );
}

function Field({
  label,
  helper,
  required = false,
  children,
}: {
  label: string;
  helper?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className="block"
    >
      <span
        className="flex items-center justify-between gap-3 text-sm font-semibold text-zinc-300"
      >
        <span>
          {label}
          {required ? (
            <span
              className="ml-1 text-amber-300"
            >
              *
            </span>
          ) : null}
        </span>

        {helper ? (
          <span
            className="text-xs font-normal text-zinc-600"
          >
            {helper}
          </span>
        ) : null}
      </span>

      <span
        className="mt-2 block"
      >
        {children}
      </span>
    </label>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value:
    | string
    | number;
  helper: string;
  icon:
    ComponentType<{
      size?: number;
      className?: string;
    }>;
}) {
  return (
    <article
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
    >
      <div
        className="flex items-start justify-between gap-4"
      >
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-wider text-zinc-600"
          >
            {label}
          </p>

          <p
            className="mt-2 text-2xl font-semibold"
          >
            {value}
          </p>

          <p
            className="mt-1 text-xs text-zinc-500"
          >
            {helper}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-500"
        >
          <Icon
            size={19}
          />
        </div>
      </div>
    </article>
  );
}

function DetailPill({
  icon: Icon,
  label,
  value,
}: {
  icon:
    ComponentType<{
      size?: number;
      className?: string;
    }>;
  label: string;
  value: string;
}) {
  return (
    <div
      className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
    >
      <div
        className="flex items-center gap-1.5 text-xs text-zinc-600"
      >
        <Icon
          size={13}
        />

        {label}
      </div>

      <p
        className="mt-1 break-words text-sm font-semibold text-zinc-300"
      >
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  isActive,
  compact = false,
}: {
  isActive: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex",
        "items-center",
        "gap-1.5",
        "rounded-full",
        "border",
        compact
          ? "px-2 py-0.5 text-[11px]"
          : "px-2.5 py-1 text-xs",
        "font-semibold",
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
      ].join(
        " "
      )}
    >
      {isActive ? (
        <CheckCircle2
          size={
            compact
              ? 12
              : 13
          }
        />
      ) : (
        <CircleOff
          size={
            compact
              ? 12
              : 13
          }
        />
      )}

      {isActive
        ? "Aktivna"
        : "Neaktivna"}
    </span>
  );
}

function MessageBox({
  variant,
  title,
  helper,
}: {
  variant:
    | "error"
    | "success";
  title: string;
  helper: string | null;
}) {
  const isError =
    variant === "error";

  return (
    <section
      className={[
        "rounded-2xl",
        "border",
        "px-4",
        "py-4",
        isError
          ? "border-red-400/20 bg-red-400/10"
          : "border-emerald-400/20 bg-emerald-400/10",
      ].join(
        " "
      )}
    >
      <div
        className="flex items-start gap-3"
      >
        {isError ? (
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0 text-red-300"
          />
        ) : (
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0 text-emerald-300"
          />
        )}

        <div>
          <p
            className={[
              "font-semibold",
              isError
                ? "text-red-200"
                : "text-emerald-200",
            ].join(
              " "
            )}
          >
            {title}
          </p>

          {helper ? (
            <p
              className={[
                "mt-1",
                "text-sm",
                isError
                  ? "text-red-100/60"
                  : "text-emerald-100/60",
              ].join(
                " "
              )}
            >
              {helper}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/60 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20";

const textareaClassName =
  "w-full resize-y rounded-xl border border-white/10 bg-zinc-950/60 px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/20";
