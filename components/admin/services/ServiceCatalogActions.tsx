"use client";

import type { FormEvent } from "react";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Layers,
  Pencil,
  Plus,
  Save,
  Scissors,
  X,
} from "lucide-react";

import {
  LOCALE_CODES,
  LOCALE_REGISTRY,
  type LocaleCode,
} from "@/lib/i18n/locales";

import {
  saveServiceAction,
  saveServiceCategoryAction,
  type LocalizedTextInput,
} from "@/app/admin/(protected)/services/actions";
import type {
  AdminServiceCategory,
  AdminServiceItem,
  ServicePriceType,
} from "@/lib/admin/services";

type ServiceCatalogActionsProps = {
  categories: AdminServiceCategory[];
  defaultLocale: LocaleCode;
  supportedLocales: LocaleCode[];
};

type DialogType = "category" | "service" | null;

type DialogMode = "create" | "edit";

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

type CategoryFormState = {
  slug: string;
  name: LocalizedTextInput;
  description: LocalizedTextInput;
  iconKey: string;
  imageUrl: string;
  imagePosition: string;
  sortOrder: string;
  isActive: boolean;
};

type ServiceFormState = {
  categoryId: string;
  slug: string;
  name: LocalizedTextInput;
  description: LocalizedTextInput;
  durationMinutes: string;
  priceType: ServicePriceType;
  priceFrom: string;
  priceTo: string;
  sortOrder: string;
  isActive: boolean;
};

type ServiceOption = {
  service: AdminServiceItem;
  category: AdminServiceCategory;
};

type LanguageDefinition = {
  key: LocaleCode;
  label: string;
  placeholder: string;
};

function createLanguageDefinitions(
  supportedLocales:
    readonly LocaleCode[]
): LanguageDefinition[] {
  return supportedLocales.map(
    (locale) => {
      const definition =
        LOCALE_REGISTRY[locale];

      return {
        key: locale,
        label:
          definition.adminName,
        placeholder:
          `Naziv — ${definition.nativeName}`,
      };
    }
  );
}

function createEmptyLocalizedText(): LocalizedTextInput {
  return Object.fromEntries(
    LOCALE_CODES.map(
      (locale) => [
        locale,
        "",
      ]
    )
  ) as LocalizedTextInput;
}

function normalizeLocalizedText(
  value:
    Partial<
      Record<
        LocaleCode,
        string
      >
    > | null
): LocalizedTextInput {
  return Object.fromEntries(
    LOCALE_CODES.map(
      (locale) => [
        locale,
        value?.[locale] ?? "",
      ]
    )
  ) as LocalizedTextInput;
}

function getDisplayName(
  value: LocalizedTextInput,
  fallback: string
): string {
  for (const locale of LOCALE_CODES) {
    const translatedValue =
      value[locale]?.trim();

    if (translatedValue) {
      return translatedValue;
    }
  }

  return fallback;
}

function getNextCategorySortOrder(
  categories: AdminServiceCategory[]
): number {
  if (categories.length === 0) {
    return 10;
  }

  return (
    Math.max(
      ...categories.map(
        (category) => category.sortOrder
      )
    ) + 10
  );
}

function getNextServiceSortOrder(
  categories: AdminServiceCategory[],
  categoryId: string
): number {
  const category = categories.find(
    (item) => item.id === categoryId
  );

  if (
    !category ||
    category.services.length === 0
  ) {
    return 10;
  }

  return (
    Math.max(
      ...category.services.map(
        (service) => service.sortOrder
      )
    ) + 10
  );
}

function createEmptyCategoryForm(
  categories: AdminServiceCategory[]
): CategoryFormState {
  return {
    slug: "",
    name: createEmptyLocalizedText(),
    description: createEmptyLocalizedText(),
    iconKey: "scissors",
    imageUrl: "",
    imagePosition: "center center",
    sortOrder: String(
      getNextCategorySortOrder(categories)
    ),
    isActive: true,
  };
}

function createCategoryFormFromCategory(
  category: AdminServiceCategory
): CategoryFormState {
  return {
    slug: category.slug,
    name: normalizeLocalizedText(category.name),
    description: normalizeLocalizedText(
      category.description
    ),
    iconKey: category.iconKey ?? "",
    imageUrl: category.imageUrl,
    imagePosition: category.imagePosition || "center center",
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  };
}

function createEmptyServiceForm(
  categories: AdminServiceCategory[]
): ServiceFormState {
  const categoryId = categories[0]?.id ?? "";

  return {
    categoryId,
    slug: "",
    name: createEmptyLocalizedText(),
    description: createEmptyLocalizedText(),
    durationMinutes: "30",
    priceType: "fixed",
    priceFrom: "",
    priceTo: "",
    sortOrder: String(
      getNextServiceSortOrder(
        categories,
        categoryId
      )
    ),
    isActive: true,
  };
}

function createServiceFormFromService(
  service: AdminServiceItem
): ServiceFormState {
  return {
    categoryId: service.categoryId,
    slug: service.slug,
    name: normalizeLocalizedText(service.name),
    description: normalizeLocalizedText(
      service.description
    ),
    durationMinutes: String(
      service.durationMinutes
    ),
    priceType: service.priceType,
    priceFrom: String(service.priceFrom),
    priceTo:
      service.priceTo === null
        ? ""
        : String(service.priceTo),
    sortOrder: String(service.sortOrder),
    isActive: service.isActive,
  };
}

function slugify(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function getSlugSource(
  value: LocalizedTextInput
): string {
  for (const locale of LOCALE_CODES) {
    const translatedValue =
      value[locale]?.trim();

    if (translatedValue) {
      return translatedValue;
    }
  }

  return "";
}

function LocalizedEditor({
  title,
  description,
  values,
  languages,
  onChange,
  multiline = false,
  maxLength,
}: {
  title: string;
  description: string;
  values: LocalizedTextInput;
  languages: LanguageDefinition[];
  onChange: (
    language: LocaleCode,
    value: string
  ) => void;
  multiline?: boolean;
  maxLength: number;
}) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <div>
        <h4 className="font-semibold text-white">
          {title}
        </h4>

        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          {description}
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {languages.map((language) => (
          <label
            key={language.key}
            className="block"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
              {language.label}
            </span>

            {multiline ? (
              <textarea
                value={values[language.key] ?? ""}
                onChange={(event) =>
                  onChange(
                    language.key,
                    event.target.value
                  )
                }
                maxLength={maxLength}
                rows={5}
                placeholder={`Opis — ${language.label}`}
                className="mt-2 w-full resize-y rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            ) : (
              <input
                type="text"
                value={values[language.key] ?? ""}
                onChange={(event) =>
                  onChange(
                    language.key,
                    event.target.value
                  )
                }
                maxLength={maxLength}
                placeholder={language.placeholder}
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            )}

            <span className="mt-1 block text-right text-[10px] text-zinc-700">
              {(values[language.key] ?? "").length}/
              {maxLength}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default function ServiceCatalogActions({
  categories,
  defaultLocale,
  supportedLocales,
}: ServiceCatalogActionsProps) {
  const router = useRouter();

  const orderedLocales =
    useMemo(
      () => {
        const locales =
          supportedLocales.length > 0
            ? supportedLocales
            : [defaultLocale];

        return [
          defaultLocale,
          ...locales.filter(
            (locale) =>
              locale !== defaultLocale
          ),
        ];
      },
      [
        defaultLocale,
        supportedLocales,
      ]
    );

  const languages =
    useMemo(
      () =>
        createLanguageDefinitions(
          orderedLocales
        ),
      [orderedLocales]
    );

  const [isPending, startTransition] =
    useTransition();

  const [dialog, setDialog] =
    useState<DialogType>(null);

  const [dialogMode, setDialogMode] =
    useState<DialogMode>("create");

  const [
    editingCategoryId,
    setEditingCategoryId,
  ] = useState<string | null>(null);

  const [
    editingServiceId,
    setEditingServiceId,
  ] = useState<string | null>(null);

  const [
    selectedCategoryId,
    setSelectedCategoryId,
  ] = useState(categories[0]?.id ?? "");

  const serviceOptions =
    useMemo<ServiceOption[]>(
      () =>
        categories.flatMap((category) =>
          category.services.map((service) => ({
            service,
            category,
          }))
        ),
      [categories]
    );

  const [
    selectedServiceId,
    setSelectedServiceId,
  ] = useState(
    serviceOptions[0]?.service.id ?? ""
  );

  const [message, setMessage] =
    useState<ActionMessage | null>(null);

  const [categoryForm, setCategoryForm] =
    useState<CategoryFormState>(() =>
      createEmptyCategoryForm(categories)
    );

  const [serviceForm, setServiceForm] =
    useState<ServiceFormState>(() =>
      createEmptyServiceForm(categories)
    );

  useEffect(() => {
    if (categories.length === 0) {
      setSelectedCategoryId("");
      return;
    }

    const categoryStillExists =
      categories.some(
        (category) =>
          category.id === selectedCategoryId
      );

    if (!categoryStillExists) {
      setSelectedCategoryId(
        categories[0].id
      );
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (serviceOptions.length === 0) {
      setSelectedServiceId("");
      return;
    }

    const serviceStillExists =
      serviceOptions.some(
        ({ service }) =>
          service.id === selectedServiceId
      );

    if (!serviceStillExists) {
      setSelectedServiceId(
        serviceOptions[0].service.id
      );
    }
  }, [
    serviceOptions,
    selectedServiceId,
  ]);

  useEffect(() => {
    if (
      serviceForm.categoryId ||
      categories.length === 0
    ) {
      return;
    }

    const categoryId = categories[0].id;

    setServiceForm((current) => ({
      ...current,
      categoryId,
      sortOrder: String(
        getNextServiceSortOrder(
          categories,
          categoryId
        )
      ),
    }));
  }, [
    categories,
    serviceForm.categoryId,
  ]);

  useEffect(() => {
    if (!dialog) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !isPending
      ) {
        setDialog(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [dialog, isPending]);

  const openCreateCategoryDialog = () => {
    setDialogMode("create");
    setEditingCategoryId(null);

    setCategoryForm(
      createEmptyCategoryForm(categories)
    );

    setMessage(null);
    setDialog("category");
  };

  const openEditCategoryDialog = () => {
    const category = categories.find(
      (item) =>
        item.id === selectedCategoryId
    );

    if (!category) {
      setMessage({
        type: "error",
        text: "Izabrana kategorija nije pronađena.",
      });

      return;
    }

    setDialogMode("edit");
    setEditingCategoryId(category.id);

    setCategoryForm(
      createCategoryFormFromCategory(category)
    );

    setMessage(null);
    setDialog("category");
  };

  const openCreateServiceDialog = () => {
    setDialogMode("create");
    setEditingServiceId(null);

    setServiceForm(
      createEmptyServiceForm(categories)
    );

    setMessage(null);
    setDialog("service");
  };

  const openEditServiceDialog = () => {
    const entry = serviceOptions.find(
      ({ service }) =>
        service.id === selectedServiceId
    );

    if (!entry) {
      setMessage({
        type: "error",
        text: "Izabrana usluga nije pronađena.",
      });

      return;
    }

    setDialogMode("edit");
    setEditingServiceId(entry.service.id);

    setServiceForm(
      createServiceFormFromService(
        entry.service
      )
    );

    setMessage(null);
    setDialog("service");
  };

  const closeDialog = () => {
    if (isPending) {
      return;
    }

    setDialog(null);
    setMessage(null);
    setEditingCategoryId(null);
    setEditingServiceId(null);
  };

  const generateCategorySlug = () => {
    setCategoryForm((current) => ({
      ...current,
      slug: slugify(
        getSlugSource(current.name)
      ),
    }));
  };

  const generateServiceSlug = () => {
    setServiceForm((current) => ({
      ...current,
      slug: slugify(
        getSlugSource(current.name)
      ),
    }));
  };

  const handleCategorySubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      try {
        const result =
          await saveServiceCategoryAction({
            categoryId:
              dialogMode === "edit"
                ? editingCategoryId ??
                  undefined
                : undefined,

            slug: categoryForm.slug,

            name: categoryForm.name,

            description:
              categoryForm.description,

            iconKey: categoryForm.iconKey,

            imageUrl: categoryForm.imageUrl,

            imagePosition: categoryForm.imagePosition,

            sortOrder: Number(
              categoryForm.sortOrder
            ),

            isActive:
              categoryForm.isActive,
          });

        setMessage({
          type: result.ok
            ? "success"
            : "error",

          text: result.message,
        });

        if (result.ok) {
          setDialog(null);
          setEditingCategoryId(null);
          router.refresh();
        }
      } catch {
        setMessage({
          type: "error",
          text: "Došlo je do greške prilikom čuvanja kategorije.",
        });
      }
    });
  };

  const handleServiceSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isPending) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      try {
        const parsedPriceTo =
          serviceForm.priceType ===
            "range" &&
          serviceForm.priceTo.trim()
            ? Number(serviceForm.priceTo)
            : null;

        const result =
          await saveServiceAction({
            serviceId:
              dialogMode === "edit"
                ? editingServiceId ??
                  undefined
                : undefined,

            categoryId:
              serviceForm.categoryId,

            slug: serviceForm.slug,

            name: serviceForm.name,

            description:
              serviceForm.description,

            durationMinutes: Number(
              serviceForm.durationMinutes
            ),

            priceType:
              serviceForm.priceType,

            priceFrom: Number(
              serviceForm.priceFrom
            ),

            priceTo: parsedPriceTo,

            sortOrder: Number(
              serviceForm.sortOrder
            ),

            isActive:
              serviceForm.isActive,
          });

        setMessage({
          type: result.ok
            ? "success"
            : "error",

          text: result.message,
        });

        if (result.ok) {
          setDialog(null);
          setEditingServiceId(null);
          router.refresh();
        }
      } catch {
        setMessage({
          type: "error",
          text: "Došlo je do greške prilikom čuvanja usluge.",
        });
      }
    });
  };

  return (
    <>
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="space-y-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Upravljanje katalogom
              </div>

              <p className="mt-1 text-sm text-zinc-400">
                Dodaj ili izmeni kategorije i
                usluge u javnom cenovniku.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={
                  openCreateCategoryDialog
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
              >
                <Layers
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Dodaj kategoriju
              </button>

              <button
                type="button"
                disabled={
                  categories.length === 0
                }
                onClick={
                  openCreateServiceDialog
                }
                title={
                  categories.length === 0
                    ? "Prvo dodaj kategoriju."
                    : undefined
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Dodaj uslugu
              </button>
            </div>
          </div>

          <div className="grid gap-4 border-t border-white/[0.07] pt-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Layers
                  className="h-4 w-4 text-zinc-600"
                  aria-hidden="true"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Uredi kategoriju
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedCategoryId}
                  disabled={
                    categories.length === 0
                  }
                  onChange={(event) =>
                    setSelectedCategoryId(
                      event.target.value
                    )
                  }
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-40"
                >
                  {categories.length === 0 ? (
                    <option value="">
                      Nema kategorija
                    </option>
                  ) : (
                    categories.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {getDisplayName(
                            category.name,
                            category.slug
                          )}
                        </option>
                      )
                    )
                  )}
                </select>

                <button
                  type="button"
                  disabled={
                    !selectedCategoryId
                  }
                  onClick={
                    openEditCategoryDialog
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Pencil
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Uredi
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Scissors
                  className="h-4 w-4 text-zinc-600"
                  aria-hidden="true"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Uredi uslugu
                </span>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={selectedServiceId}
                  disabled={
                    serviceOptions.length === 0
                  }
                  onChange={(event) =>
                    setSelectedServiceId(
                      event.target.value
                    )
                  }
                  className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-40"
                >
                  {serviceOptions.length ===
                  0 ? (
                    <option value="">
                      Nema usluga
                    </option>
                  ) : (
                    serviceOptions.map(
                      ({
                        service,
                        category,
                      }) => (
                        <option
                          key={service.id}
                          value={service.id}
                        >
                          {getDisplayName(
                            category.name,
                            category.slug
                          )}{" "}
                          —{" "}
                          {getDisplayName(
                            service.name,
                            service.slug
                          )}
                        </option>
                      )
                    )
                  )}
                </select>

                <button
                  type="button"
                  disabled={
                    !selectedServiceId
                  }
                  onClick={
                    openEditServiceDialog
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Pencil
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Uredi
                </button>
              </div>
            </div>
          </div>
        </div>

        {message && !dialog && (
          <div
            aria-live="polite"
            className={`mt-4 flex items-start justify-between gap-4 rounded-2xl border p-4 ${
              message.type === "success"
                ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                : "border-red-400/20 bg-red-400/[0.07] text-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {message.type === "success" ? (
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <AlertCircle
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />
              )}

              <span className="text-sm">
                {message.text}
              </span>
            </div>

            <button
              type="button"
              aria-label="Zatvori poruku"
              onClick={() => setMessage(null)}
              className="flex-shrink-0 opacity-60 transition hover:opacity-100"
            >
              <X
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        )}
      </section>

      {dialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Zatvori dijalog"
            onClick={closeDialog}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            className="relative max-h-[94vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-white/[0.08] bg-zinc-950/90 px-5 py-5 backdrop-blur-xl sm:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300 text-zinc-950">
                  {dialog === "category" ? (
                    <Layers
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  ) : (
                    <Scissors
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  )}
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                    Katalog salona
                  </div>

                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {dialog === "category"
                      ? dialogMode === "edit"
                        ? "Uredi kategoriju"
                        : "Nova kategorija"
                      : dialogMode === "edit"
                        ? "Uredi uslugu"
                        : "Nova usluga"}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDialog}
                disabled={isPending}
                aria-label="Zatvori"
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-500 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {dialog === "category" && (
              <form
                onSubmit={handleCategorySubmit}
                className="space-y-5 p-5 sm:p-7"
              >
                {message && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${
                      message.type === "success"
                        ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                        : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                    }`}
                  >
                    {message.type ===
                    "success" ? (
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}

                    <span className="text-sm">
                      {message.text}
                    </span>
                  </div>
                )}

                <LocalizedEditor
                    languages={languages}
                  title="Naziv kategorije"
                  description="Unesi naziv na najmanje jednom jeziku."
                  values={categoryForm.name}
                  maxLength={160}
                  onChange={(language, value) =>
                    setCategoryForm(
                      (current) => ({
                        ...current,
                        name: {
                          ...current.name,
                          [language]: value,
                        },
                      })
                    )
                  }
                />

                <LocalizedEditor
                    languages={languages}
                  title="Opis kategorije"
                  description="Opis nije obavezan, ali se može koristiti na javnom sajtu."
                  values={
                    categoryForm.description
                  }
                  maxLength={2000}
                  multiline
                  onChange={(language, value) =>
                    setCategoryForm(
                      (current) => ({
                        ...current,
                        description: {
                          ...current.description,
                          [language]: value,
                        },
                      })
                    )
                  }
                />

                <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <div>
                    <h4 className="font-semibold text-white">Slika kategorije</h4>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                      Jedna slika predstavlja celu kategoriju na temama koje podržavaju category media.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem]">
                    <div className="grid gap-4">
                      <label>
                        <span className="text-sm font-medium text-zinc-300">URL slike kategorije</span>
                        <input
                          type="url"
                          maxLength={2048}
                          value={categoryForm.imageUrl}
                          onChange={(event) =>
                            setCategoryForm((current) => ({
                              ...current,
                              imageUrl: event.target.value,
                            }))
                          }
                          placeholder="https://images.unsplash.com/..."
                          className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                        />
                      </label>

                      <label>
                        <span className="text-sm font-medium text-zinc-300">Fokus slike</span>
                        <input
                          type="text"
                          maxLength={80}
                          value={categoryForm.imagePosition}
                          onChange={(event) =>
                            setCategoryForm((current) => ({
                              ...current,
                              imagePosition: event.target.value,
                            }))
                          }
                          placeholder="65% center"
                          className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                        />
                        <span className="mt-2 block text-xs text-zinc-600">
                          Primeri: center center, 65% center, right 40%.
                        </span>
                      </label>
                    </div>

                    <div>
                      <span className="text-sm font-medium text-zinc-300">Pregled slike kategorije</span>
                      <div
                        role="img"
                        aria-label="Pregled slike kategorije"
                        className="mt-2 flex min-h-44 items-center justify-center rounded-2xl border border-white/[0.08] bg-black/30 bg-cover bg-no-repeat px-5 text-center text-xs leading-relaxed text-zinc-700"
                        style={
                          categoryForm.imageUrl
                            ? {
                                backgroundImage: `linear-gradient(rgba(0,0,0,0.18),rgba(0,0,0,0.5)),url(${categoryForm.imageUrl})`,
                                backgroundPosition:
                                  categoryForm.imagePosition || "center center",
                              }
                            : undefined
                        }
                      >
                        {!categoryForm.imageUrl &&
                          "Bez custom URL-a javna tema koristi svoj category fallback."}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:grid-cols-3">
                  <label className="md:col-span-2">
                    <span className="text-sm font-medium text-zinc-300">
                      Slug
                    </span>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        required
                        value={categoryForm.slug}
                        onChange={(event) =>
                          setCategoryForm(
                            (current) => ({
                              ...current,
                              slug: event.target.value,
                            })
                          )
                        }
                        placeholder="na-primer-bojenje"
                        className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                      />

                      <button
                        type="button"
                        onClick={
                          generateCategorySlug
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        Generiši
                      </button>
                    </div>
                  </label>

                  <label>
                    <span className="text-sm font-medium text-zinc-300">
                      Redosled
                    </span>

                    <input
                      type="number"
                      required
                      min="0"
                      max="100000"
                      step="1"
                      value={
                        categoryForm.sortOrder
                      }
                      onChange={(event) =>
                        setCategoryForm(
                          (current) => ({
                            ...current,
                            sortOrder:
                              event.target.value,
                          })
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-sm font-medium text-zinc-300">
                      Ključ ikonice
                    </span>

                    <input
                      type="text"
                      value={categoryForm.iconKey}
                      onChange={(event) =>
                        setCategoryForm(
                          (current) => ({
                            ...current,
                            iconKey:
                              event.target.value,
                          })
                        )
                      }
                      placeholder="scissors, palette, sparkles..."
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={
                        categoryForm.isActive
                      }
                      onChange={(event) =>
                        setCategoryForm(
                          (current) => ({
                            ...current,
                            isActive:
                              event.target.checked,
                          })
                        )
                      }
                      className="h-4 w-4 accent-amber-300"
                    />

                    <span className="text-sm text-zinc-300">
                      Kategorija je aktivna
                    </span>
                  </label>
                </section>

                <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={isPending}
                    className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    Odustani
                  </button>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Save
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    {isPending
                      ? "Čuvanje..."
                      : dialogMode === "edit"
                        ? "Sačuvaj kategoriju"
                        : "Dodaj kategoriju"}
                  </button>
                </div>
              </form>
            )}

            {dialog === "service" && (
              <form
                onSubmit={handleServiceSubmit}
                className="space-y-5 p-5 sm:p-7"
              >
                {message && (
                  <div
                    className={`flex items-start gap-3 rounded-2xl border p-4 ${
                      message.type === "success"
                        ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                        : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                    }`}
                  >
                    {message.type ===
                    "success" ? (
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <AlertCircle
                        className="mt-0.5 h-5 w-5 flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}

                    <span className="text-sm">
                      {message.text}
                    </span>
                  </div>
                )}

                <LocalizedEditor
                    languages={languages}
                  title="Naziv usluge"
                  description="Unesi naziv na najmanje jednom jeziku."
                  values={serviceForm.name}
                  maxLength={160}
                  onChange={(language, value) =>
                    setServiceForm(
                      (current) => ({
                        ...current,
                        name: {
                          ...current.name,
                          [language]: value,
                        },
                      })
                    )
                  }
                />

                <LocalizedEditor
                    languages={languages}
                  title="Opis usluge"
                  description="Kratko objasni šta usluga uključuje."
                  values={
                    serviceForm.description
                  }
                  maxLength={2000}
                  multiline
                  onChange={(language, value) =>
                    setServiceForm(
                      (current) => ({
                        ...current,
                        description: {
                          ...current.description,
                          [language]: value,
                        },
                      })
                    )
                  }
                />

                <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:grid-cols-2 xl:grid-cols-4">
                  <label className="md:col-span-2">
                    <span className="text-sm font-medium text-zinc-300">
                      Kategorija
                    </span>

                    <select
                      required
                      value={
                        serviceForm.categoryId
                      }
                      onChange={(event) => {
                        const categoryId =
                          event.target.value;

                        setServiceForm(
                          (current) => ({
                            ...current,
                            categoryId,

                            sortOrder:
                              dialogMode === "create"
                                ? String(
                                    getNextServiceSortOrder(
                                      categories,
                                      categoryId
                                    )
                                  )
                                : current.sortOrder,
                          })
                        );
                      }}
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {getDisplayName(
                              category.name,
                              category.slug
                            )}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-medium text-zinc-300">
                      Trajanje
                    </span>

                    <div className="relative mt-2">
                      <input
                        type="number"
                        required
                        min="5"
                        max="1440"
                        step="5"
                        value={
                          serviceForm.durationMinutes
                        }
                        onChange={(event) =>
                          setServiceForm(
                            (current) => ({
                              ...current,
                              durationMinutes:
                                event.target.value,
                            })
                          )
                        }
                        className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 pr-14 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                        min
                      </span>
                    </div>
                  </label>

                  <label>
                    <span className="text-sm font-medium text-zinc-300">
                      Redosled
                    </span>

                    <input
                      type="number"
                      required
                      min="0"
                      max="100000"
                      step="1"
                      value={serviceForm.sortOrder}
                      onChange={(event) =>
                        setServiceForm(
                          (current) => ({
                            ...current,
                            sortOrder:
                              event.target.value,
                          })
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />
                  </label>

                  <label className="md:col-span-2">
                    <span className="text-sm font-medium text-zinc-300">
                      Slug
                    </span>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        required
                        value={serviceForm.slug}
                        onChange={(event) =>
                          setServiceForm(
                            (current) => ({
                              ...current,
                              slug: event.target.value,
                            })
                          )
                        }
                        placeholder="zensko-sisanje"
                        className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                      />

                      <button
                        type="button"
                        onClick={
                          generateServiceSlug
                        }
                        className="rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        Generiši
                      </button>
                    </div>
                  </label>

                  <label>
                    <span className="text-sm font-medium text-zinc-300">
                      Tip cene
                    </span>

                    <select
                      value={serviceForm.priceType}
                      onChange={(event) =>
                        setServiceForm(
                          (current) => ({
                            ...current,

                            priceType:
                              event.target
                                .value as ServicePriceType,

                            priceTo:
                              event.target.value ===
                              "range"
                                ? current.priceTo
                                : "",
                          })
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    >
                      <option value="fixed">
                        Fiksna cena
                      </option>

                      <option value="from">
                        Cena od
                      </option>

                      <option value="range">
                        Raspon cena
                      </option>
                    </select>
                  </label>

                  <label>
                    <span className="text-sm font-medium text-zinc-300">
                      {serviceForm.priceType ===
                      "range"
                        ? "Početna cena"
                        : "Cena"}
                    </span>

                    <input
                      type="number"
                      required
                      min="0"
                      max="1000000000"
                      step="0.01"
                      value={serviceForm.priceFrom}
                      onChange={(event) =>
                        setServiceForm(
                          (current) => ({
                            ...current,
                            priceFrom:
                              event.target.value,
                          })
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />
                  </label>

                  {serviceForm.priceType ===
                    "range" && (
                    <label>
                      <span className="text-sm font-medium text-zinc-300">
                        Krajnja cena
                      </span>

                      <input
                        type="number"
                        required
                        min="0"
                        max="1000000000"
                        step="0.01"
                        value={serviceForm.priceTo}
                        onChange={(event) =>
                          setServiceForm(
                            (current) => ({
                              ...current,
                              priceTo:
                                event.target.value,
                            })
                          )
                        }
                        className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                      />
                    </label>
                  )}

                  <label className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={serviceForm.isActive}
                      onChange={(event) =>
                        setServiceForm(
                          (current) => ({
                            ...current,
                            isActive:
                              event.target.checked,
                          })
                        )
                      }
                      className="h-4 w-4 accent-amber-300"
                    />

                    <span className="text-sm text-zinc-300">
                      Usluga je aktivna
                    </span>
                  </label>
                </section>

                <div className="flex flex-col-reverse gap-3 border-t border-white/[0.08] pt-5 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeDialog}
                    disabled={isPending}
                    className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-40"
                  >
                    Odustani
                  </button>

                  <button
                    type="submit"
                    disabled={
                      isPending ||
                      !serviceForm.categoryId
                    }
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Save
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    {isPending
                      ? "Čuvanje..."
                      : dialogMode === "edit"
                        ? "Sačuvaj uslugu"
                        : "Dodaj uslugu"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
