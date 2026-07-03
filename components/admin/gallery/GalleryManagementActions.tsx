"use client";

import type {
  ChangeEvent,
} from "react";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  CloudUpload,
  Eye,
  EyeOff,
  ImageIcon,
  Images,
  LoaderCircle,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  createGalleryItemAction,
  deleteGalleryItemAction,
  moveGalleryItemAction,
  updateGalleryItemAction,
  type GalleryLocalizedTextInput,
} from "@/app/admin/(protected)/gallery/actions";
import {
  LOCALE_REGISTRY,
  type LocaleCode,
} from "@/lib/i18n/locales";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type {
  AdminGalleryItem,
  AdminGalleryResult,
} from "@/lib/admin/gallery";

type GalleryManagementActionsProps = {
  data: AdminGalleryResult;
};

type ActionMessage = {
  type:
    | "success"
    | "error";
  text: string;
};

type SignedUploadResponse = {
  ok: true;
  bucket: string;
  path: string;
  token: string;
  publicUrl: string;
};

type UploadErrorResponse = {
  ok: false;
  message: string;
  code?: string;
};

type LocalizedTextState =
  Record<
    LocaleCode,
    string
  >;

const MAX_FILE_SIZE_BYTES =
  8 * 1024 * 1024;

const MAX_FILES_PER_BATCH =
  20;

const allowedContentTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

function createEmptyLocalizedText(
  supportedLocales:
    readonly LocaleCode[]
): LocalizedTextState {
  const state =
    {} as LocalizedTextState;

  for (
    const locale of
    Object.keys(
      LOCALE_REGISTRY
    ) as LocaleCode[]
  ) {
    state[locale] =
      "";
  }

  for (
    const locale of
    supportedLocales
  ) {
    state[locale] =
      state[locale] ??
      "";
  }

  return state;
}

function createLocalizedTextState(
  item: AdminGalleryItem,
  supportedLocales:
    readonly LocaleCode[]
): LocalizedTextState {
  const state =
    createEmptyLocalizedText(
      supportedLocales
    );

  for (
    const locale of
    Object.keys(
      LOCALE_REGISTRY
    ) as LocaleCode[]
  ) {
    state[locale] =
      item.alt[locale] ??
      "";
  }

  return state;
}

function createFileAltText(
  fileName: string
): string {
  const withoutExtension =
    fileName.replace(
      /\.[^.]+$/,
      ""
    );

  const cleaned =
    withoutExtension
      .replace(
        /[-_]+/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  return cleaned ||
    "Salon gallery photo";
}

function MessageBanner({
  message,
  onClose,
}: {
  message: ActionMessage;
  onClose: () => void;
}) {
  const success =
    message.type ===
    "success";

  return (
    <div
      aria-live="polite"
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
        success
          ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
          : "border-red-400/20 bg-red-400/[0.07] text-red-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {success ? (
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

        <span className="text-sm leading-relaxed">
          {message.text}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Zatvori poruku"
        className="flex-shrink-0"
      >
        <X
          className="h-4 w-4"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </div>

      <div className="mt-2 text-2xl font-semibold text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-zinc-700">
        {description}
      </div>
    </div>
  );
}

function GalleryItemCard({
  item,
  supportedLocales,
  defaultLocale,
  isFirst,
  isLast,
}: {
  item: AdminGalleryItem;
  supportedLocales:
    LocaleCode[];
  defaultLocale:
    LocaleCode;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] = useTransition();

  const [
    message,
    setMessage,
  ] =
    useState<ActionMessage | null>(
      null
    );

  const [
    activeLocale,
    setActiveLocale,
  ] =
    useState<LocaleCode>(
      supportedLocales.includes(
        defaultLocale
      )
        ? defaultLocale
        : supportedLocales[0] ??
            "en"
    );

  const [
    category,
    setCategory,
  ] =
    useState(
      item.category
    );

  const [
    isActive,
    setIsActive,
  ] =
    useState(
      item.isActive
    );

  const [
    alt,
    setAlt,
  ] =
    useState<LocalizedTextState>(
      createLocalizedTextState(
        item,
        supportedLocales
      )
    );

  useEffect(() => {
    setCategory(
      item.category
    );

    setIsActive(
      item.isActive
    );

    setAlt(
      createLocalizedTextState(
        item,
        supportedLocales
      )
    );
  }, [
    item,
    supportedLocales,
  ]);

  const saveItem = (
    nextActive:
      boolean = isActive
  ) => {
    if (pending) {
      return;
    }

    setMessage(null);

    startTransition(
      async () => {
        const result =
          await updateGalleryItemAction(
            {
              id:
                item.id,
              category,
              alt,
              isActive:
                nextActive,
            }
          );

        setMessage({
          type:
            result.ok
              ? "success"
              : "error",
          text:
            result.message,
        });

        if (result.ok) {
          setIsActive(
            nextActive
          );

          router.refresh();
        }
      }
    );
  };

  const moveItem = (
    direction:
      | "up"
      | "down"
  ) => {
    if (pending) {
      return;
    }

    setMessage(null);

    startTransition(
      async () => {
        const result =
          await moveGalleryItemAction(
            {
              id:
                item.id,
              direction,
            }
          );

        setMessage({
          type:
            result.ok
              ? "success"
              : "error",
          text:
            result.message,
        });

        if (result.ok) {
          router.refresh();
        }
      }
    );
  };

  const deleteItem = () => {
    if (pending) {
      return;
    }

    const confirmed =
      window.confirm(
        "Da li sigurno želiš da obrišeš ovu fotografiju iz galerije?"
      );

    if (!confirmed) {
      return;
    }

    setMessage(null);

    startTransition(
      async () => {
        const result =
          await deleteGalleryItemAction(
            item.id
          );

        setMessage({
          type:
            result.ok
              ? "success"
              : "error",
          text:
            result.message,
        });

        if (result.ok) {
          router.refresh();
        }
      }
    );
  };

  const toggleActive = () => {
    saveItem(
      !isActive
    );
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
      <div className="relative aspect-[4/3] overflow-hidden bg-zinc-900">
        <Image
          src={
            item.imageUrl
          }
          alt={
            alt[
              activeLocale
            ] ||
            alt[
              defaultLocale
            ] ||
            "Salon gallery image"
          }
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${
              isActive
                ? "border-emerald-300/20 bg-emerald-400/15 text-emerald-200"
                : "border-zinc-300/15 bg-zinc-950/65 text-zinc-300"
            }`}
          >
            {isActive
              ? "Aktivna"
              : "Sakrivena"}
          </span>

          <span className="rounded-full border border-white/10 bg-zinc-950/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-300 backdrop-blur">
            {item.storagePath
              ? "Upload"
              : "Spoljni link"}
          </span>
        </div>

        {pending && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <LoaderCircle
              className="h-7 w-7 animate-spin text-amber-300 motion-reduce:animate-none"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      <div className="space-y-5 p-5">
        {message && (
          <MessageBanner
            message={
              message
            }
            onClose={() =>
              setMessage(null)
            }
          />
        )}

        <div>
          <label className="text-sm font-medium text-zinc-300">
            Kategorija
          </label>

          <input
            type="text"
            value={
              category
            }
            onChange={(event) =>
              setCategory(
                event.target.value
              )
            }
            maxLength={80}
            placeholder="general"
            className="mt-2 min-h-11 w-full rounded-2xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-800 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/10"
          />

          <p className="mt-1.5 text-xs text-zinc-700">
            Koristi se za buduće filtre, na primer hair, nails ili interior.
          </p>
        </div>

        <div>
          <div className="flex flex-wrap gap-2">
            {supportedLocales.map(
              (locale) => {
                const definition =
                  LOCALE_REGISTRY[
                    locale
                  ];

                const selected =
                  activeLocale ===
                  locale;

                return (
                  <button
                    key={
                      locale
                    }
                    type="button"
                    onClick={() =>
                      setActiveLocale(
                        locale
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-amber-300 bg-amber-300 text-zinc-950"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {
                      definition.shortName
                    }
                  </button>
                );
              }
            )}
          </div>

          <label className="mt-3 block text-sm font-medium text-zinc-300">
            Alternativni opis —{" "}
            {
              LOCALE_REGISTRY[
                activeLocale
              ].nativeName
            }
          </label>

          <textarea
            value={
              alt[
                activeLocale
              ]
            }
            onChange={(event) =>
              setAlt(
                (current) => ({
                  ...current,
                  [activeLocale]:
                    event.target.value,
                })
              )
            }
            maxLength={300}
            rows={3}
            placeholder="Opiši šta je prikazano na fotografiji."
            className="mt-2 w-full resize-y rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-800 focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/10"
          />

          <div className="mt-1.5 flex justify-between gap-3 text-xs text-zinc-700">
            <span>
              Važno za pristupačnost i pretragu.
            </span>

            <span>
              {
                alt[
                  activeLocale
                ].length
              }
              /300
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() =>
              moveItem(
                "up"
              )
            }
            disabled={
              pending ||
              isFirst
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowUp
              className="h-4 w-4"
              aria-hidden="true"
            />
            Gore
          </button>

          <button
            type="button"
            onClick={() =>
              moveItem(
                "down"
              )
            }
            disabled={
              pending ||
              isLast
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
          >
            <ArrowDown
              className="h-4 w-4"
              aria-hidden="true"
            />
            Dole
          </button>

          <button
            type="button"
            onClick={
              toggleActive
            }
            disabled={
              pending
            }
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
              isActive
                ? "border-amber-300/20 bg-amber-300/[0.07] text-amber-200 hover:bg-amber-300/[0.12]"
                : "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200 hover:bg-emerald-400/[0.12]"
            }`}
          >
            {isActive ? (
              <EyeOff
                className="h-4 w-4"
                aria-hidden="true"
              />
            ) : (
              <Eye
                className="h-4 w-4"
                aria-hidden="true"
              />
            )}

            {isActive
              ? "Sakrij"
              : "Prikaži"}
          </button>

          <button
            type="button"
            onClick={
              deleteItem
            }
            disabled={
              pending
            }
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-3 text-xs font-semibold text-red-300 transition hover:border-red-400/30 hover:bg-red-400/[0.1] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2
              className="h-4 w-4"
              aria-hidden="true"
            />
            Obriši
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            saveItem()
          }
          disabled={
            pending
          }
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <LoaderCircle
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Save
              className="h-4 w-4"
              aria-hidden="true"
            />
          )}

          Sačuvaj fotografiju
        </button>
      </div>
    </article>
  );
}

export default function GalleryManagementActions({
  data,
}: GalleryManagementActionsProps) {
  const router =
    useRouter();

  const [
    uploadPending,
    setUploadPending,
  ] =
    useState(false);

  const [
    uploadMessage,
    setUploadMessage,
  ] =
    useState<ActionMessage | null>(
      null
    );

  const [
    uploadProgress,
    setUploadProgress,
  ] =
    useState<{
      current: number;
      total: number;
      fileName: string;
    } | null>(
      null
    );

  const sortedItems =
    useMemo(
      () =>
        [...data.items].sort(
          (
            first,
            second
          ) =>
            first.sortOrder -
              second.sortOrder ||
            first.createdAt.localeCompare(
              second.createdAt
            )
        ),
      [data.items]
    );

  const uploadFile = async (
    file: File
  ) => {
    const signedResponse =
      await fetch(
        "/api/admin/gallery/upload-url",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body:
            JSON.stringify({
              contentType:
                file.type,
              size:
                file.size,
            }),
        }
      );

    const signedPayload =
      (await signedResponse.json()) as
        | SignedUploadResponse
        | UploadErrorResponse;

    if (
      !signedPayload.ok
    ) {
      throw new Error(
        signedPayload.message
      );
    }

    if (
      !signedResponse.ok
    ) {
      throw new Error(
        "Upload trenutno nije moguće pokrenuti."
      );
    }

    const supabase =
      createBrowserClient();

    const {
      error: uploadError,
    } = await supabase.storage
      .from(
        signedPayload.bucket
      )
      .uploadToSignedUrl(
        signedPayload.path,
        signedPayload.token,
        file,
        {
          cacheControl:
            "3600",
          contentType:
            file.type,
        }
      );

    if (uploadError) {
      throw new Error(
        uploadError.message ||
          "Fotografija nije uploadovana."
      );
    }

    const alt =
      createEmptyLocalizedText(
        data.business.supportedLocales
      );

    alt[
      data.business.defaultLocale
    ] =
      createFileAltText(
        file.name
      );

    const result =
      await createGalleryItemAction(
        {
          path:
            signedPayload.path,
          category:
            "general",
          alt:
            alt as GalleryLocalizedTextInput,
        }
      );

    if (!result.ok) {
      throw new Error(
        result.message
      );
    }
  };

  const handleFiles = async (
    files:
      File[]
  ) => {
    if (
      uploadPending ||
      files.length === 0
    ) {
      return;
    }

    if (
      files.length >
      MAX_FILES_PER_BATCH
    ) {
      setUploadMessage({
        type: "error",
        text: `Možeš uploadovati najviše ${MAX_FILES_PER_BATCH} fotografija odjednom.`,
      });

      return;
    }

    for (
      const file of
      files
    ) {
      if (
        !allowedContentTypes.has(
          file.type
        )
      ) {
        setUploadMessage({
          type: "error",
          text: `${file.name}: dozvoljeni su samo JPG, PNG i WebP fajlovi.`,
        });

        return;
      }

      if (
        file.size <= 0 ||
        file.size >
          MAX_FILE_SIZE_BYTES
      ) {
        setUploadMessage({
          type: "error",
          text: `${file.name}: fotografija mora biti manja od 8 MB.`,
        });

        return;
      }
    }

    setUploadPending(
      true
    );

    setUploadMessage(
      null
    );

    let uploadedCount =
      0;

    try {
      for (
        let index = 0;
        index <
        files.length;
        index += 1
      ) {
        const file =
          files[index];

        setUploadProgress({
          current:
            index + 1,
          total:
            files.length,
          fileName:
            file.name,
        });

        await uploadFile(
          file
        );

        uploadedCount +=
          1;
      }

      setUploadMessage({
        type: "success",
        text:
          uploadedCount ===
          1
            ? "Fotografija je uspešno dodata u galeriju."
            : `${uploadedCount} fotografija je uspešno dodato u galeriju.`,
      });

      router.refresh();
    } catch (error) {
      setUploadMessage({
        type: "error",
        text:
          error instanceof
          Error
            ? `${uploadedCount} fotografija je dodato pre greške. ${error.message}`
            : "Došlo je do greške prilikom uploada galerije.",
      });

      router.refresh();
    } finally {
      setUploadPending(
        false
      );

      setUploadProgress(
        null
      );
    }
  };

  const handleFileChange = (
    event:
      ChangeEvent<HTMLInputElement>
  ) => {
    const files =
      Array.from(
        event.target.files ??
          []
      );

    event.target.value =
      "";

    void handleFiles(
      files
    );
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
            <Images
              className="h-4 w-4"
              aria-hidden="true"
            />
            Javni sadržaj
          </div>

          <h1 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            Galerija salona
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
            Uploaduj radove, promeni njihov redosled, dodaj opise na aktivnim jezicima i odluči koje fotografije se vide na javnom sajtu.
          </p>
        </div>

        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
          <MetricCard
            label="Ukupno"
            value={
              data.metrics.total
            }
            description="Sve fotografije"
          />

          <MetricCard
            label="Aktivne"
            value={
              data.metrics.active
            }
            description="Vide se javno"
          />

          <MetricCard
            label="Sakrivene"
            value={
              data.metrics.hidden
            }
            description="Ne prikazuju se"
          />

          <MetricCard
            label="Upload"
            value={
              data.metrics.uploaded
            }
            description="U Storage bucketu"
          />

          <MetricCard
            label="Spoljne"
            value={
              data.metrics.external
            }
            description="URL fotografije"
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
            <CloudUpload
              className="h-4 w-4"
              aria-hidden="true"
            />
            Media upload
          </div>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Dodaj fotografije
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
            Možeš izabrati do 20 JPG, PNG ili WebP fotografija. Maksimalna veličina pojedinačne fotografije je 8 MB.
          </p>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          {uploadMessage && (
            <MessageBanner
              message={
                uploadMessage
              }
              onClose={() =>
                setUploadMessage(
                  null
                )
              }
            />
          )}

          <label
            className={`flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center transition ${
              uploadPending
                ? "cursor-wait border-amber-300/20 bg-amber-300/[0.04]"
                : "border-white/[0.12] bg-black/10 hover:border-amber-300/40 hover:bg-amber-300/[0.025]"
            }`}
          >
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handleFileChange
              }
              disabled={
                uploadPending
              }
              className="sr-only"
            />

            {uploadPending ? (
              <LoaderCircle
                className="h-9 w-9 animate-spin text-amber-300 motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <UploadCloud
                className="h-9 w-9 text-amber-300"
                aria-hidden="true"
              />
            )}

            <div className="mt-4 text-sm font-semibold text-white">
              {uploadPending
                ? "Upload je u toku"
                : "Klikni i izaberi fotografije"}
            </div>

            {uploadProgress ? (
              <div className="mt-2 max-w-full text-xs text-zinc-500">
                {uploadProgress.current}/
                {uploadProgress.total}
                {" · "}
                <span className="break-all">
                  {
                    uploadProgress.fileName
                  }
                </span>
              </div>
            ) : (
              <div className="mt-2 text-xs text-zinc-700">
                JPG, PNG ili WebP · do 8 MB po fajlu
              </div>
            )}
          </label>

          <div className="flex items-start gap-3 rounded-2xl border border-sky-400/15 bg-sky-400/[0.045] p-4 text-sm text-sky-100">
            <Sparkles
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-sky-300"
              aria-hidden="true"
            />

            <p className="leading-relaxed text-sky-100/75">
              Novi upload automatski dobija kategoriju <strong>general</strong> i alternativni opis izveden iz naziva fajla. Nakon uploada otvori karticu fotografije i upiši precizan opis.
            </p>
          </div>
        </div>
      </section>

      {sortedItems.length ===
      0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-white/[0.1] bg-white/[0.015] p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-zinc-600">
            <ImageIcon
              className="h-7 w-7"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-white">
            Galerija je prazna
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
            Dodaj prvu fotografiju iz upload sekcije iznad.
          </p>
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                <Images
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Redosled prikaza
              </div>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Fotografije
              </h2>
            </div>

            <div className="text-xs text-zinc-700">
              {
                sortedItems.length
              }{" "}
              stavki
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {sortedItems.map(
              (
                item,
                index
              ) => (
                <GalleryItemCard
                  key={
                    item.id
                  }
                  item={
                    item
                  }
                  supportedLocales={
                    data.business.supportedLocales
                  }
                  defaultLocale={
                    data.business.defaultLocale
                  }
                  isFirst={
                    index ===
                    0
                  }
                  isLast={
                    index ===
                    sortedItems.length -
                      1
                  }
                />
              )
            )}
          </div>
        </section>
      )}
    </div>
  );
}
