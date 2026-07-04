"use client";

import {
  type ChangeEvent,
  type ReactNode,
  useState,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  LoaderCircle,
  Store,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";

import {
  BUSINESS_MEDIA_ACCEPT,
  BUSINESS_MEDIA_ALLOWED_TYPES,
  BUSINESS_MEDIA_MAX_BYTES,
  type BusinessBrandingData,
  type BusinessBrandingEmployee,
  type BusinessMediaMutationResponse,
  type BusinessMediaTarget,
  formatMaxFileSize,
} from "@/lib/platform-admin/business-branding";

type ActionMessage = {
  type:
    | "success"
    | "error";
  text: string;
};

type BusinessBrandingManagerProps = {
  initialData:
    BusinessBrandingData;
};

function validateFile(
  file: File,
  target: BusinessMediaTarget
): string | null {
  if (
    !BUSINESS_MEDIA_ALLOWED_TYPES.has(
      file.type
    )
  ) {
    return "Dozvoljeni su JPEG, PNG, WebP i AVIF formati.";
  }

  if (
    file.size >
    BUSINESS_MEDIA_MAX_BYTES[
      target
    ]
  ) {
    return `Maksimalna veličina je ${formatMaxFileSize(
      target
    )}.`;
  }

  if (
    file.size <= 0
  ) {
    return "Izabrani fajl je prazan.";
  }

  return null;
}

function Preview({
  url,
  variant,
  fallback,
}: {
  url: string;
  variant:
    | "logo"
    | "hero"
    | "employee";
  fallback:
    ReactNode;
}) {
  const variantClassName = {
    logo:
      "aspect-square max-w-52 rounded-3xl bg-zinc-950/80",
    hero:
      "aspect-[16/6] w-full rounded-3xl bg-zinc-950/80",
    employee:
      "aspect-square w-full rounded-2xl bg-zinc-950/80",
  }[variant];

  const backgroundSize =
    variant === "logo"
      ? "contain"
      : "cover";

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden border border-white/10 ${variantClassName}`}
    >
      {url ? (
        <div
          role="img"
          aria-label="Pregled otpremljene slike"
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage:
              `url("${url.replace(
                /"/g,
                "%22"
              )}")`,
            backgroundSize,
          }}
        />
      ) : (
        <div
          className="flex flex-col items-center gap-2 text-zinc-700"
        >
          {fallback}
          <span
            className="text-xs font-semibold uppercase tracking-wider"
          >
            Nema slike
          </span>
        </div>
      )}
    </div>
  );
}

function UploadControls({
  target,
  employeeSlug,
  expectedUpdatedAt,
  currentUrl,
  pendingKey,
  onUpload,
  onRemove,
}: {
  target:
    BusinessMediaTarget;
  employeeSlug?:
    string;
  expectedUpdatedAt:
    string;
  currentUrl:
    string;
  pendingKey:
    string | null;
  onUpload: (
    target:
      BusinessMediaTarget,
    expectedUpdatedAt:
      string,
    file: File,
    employeeSlug?:
      string
  ) => Promise<void>;
  onRemove: (
    target:
      BusinessMediaTarget,
    expectedUpdatedAt:
      string,
    employeeSlug?:
      string
  ) => Promise<void>;
}) {
  const key =
    employeeSlug
      ? `${target}:${employeeSlug}`
      : target;

  const isPending =
    pendingKey === key;

  const isAnyPending =
    pendingKey !== null;

  function handleFileChange(
    event:
      ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    event.target.value =
      "";

    if (!file) {
      return;
    }

    void onUpload(
      target,
      expectedUpdatedAt,
      file,
      employeeSlug
    );
  }

  return (
    <div
      className="flex flex-wrap gap-2"
    >
      <label
        className={`inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 ${
          isAnyPending
            ? "pointer-events-none opacity-60"
            : ""
        }`}
      >
        {isPending ? (
          <LoaderCircle
            size={16}
            className="animate-spin"
          />
        ) : (
          <Upload
            size={16}
          />
        )}

        {currentUrl
          ? "Zameni sliku"
          : "Otpremi sliku"}

        <input
          type="file"
          accept={
            BUSINESS_MEDIA_ACCEPT
          }
          disabled={
            isAnyPending
          }
          onChange={
            handleFileChange
          }
          className="sr-only"
        />
      </label>

      {currentUrl ? (
        <button
          type="button"
          disabled={
            isAnyPending
          }
          onClick={() =>
            void onRemove(
              target,
              expectedUpdatedAt,
              employeeSlug
            )
          }
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-red-300/20 bg-red-300/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-300/35 hover:bg-red-300/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2
            size={16}
          />
          Ukloni
        </button>
      ) : null}
    </div>
  );
}

export default function BusinessBrandingManager({
  initialData,
}: BusinessBrandingManagerProps) {
  const [
    business,
    setBusiness,
  ] =
    useState(
      initialData.business
    );

  const [
    employees,
    setEmployees,
  ] =
    useState(
      initialData.employees
    );

  const [
    pendingKey,
    setPendingKey,
  ] =
    useState<string | null>(
      null
    );

  const [
    message,
    setMessage,
  ] =
    useState<ActionMessage | null>(
      null
    );

  function updateBusinessMedia(
    target:
      BusinessMediaTarget,
    url:
      string | null,
    updatedAt: string
  ) {
    setBusiness(
      (current) => ({
        ...current,
        logoUrl:
          target ===
          "business-logo"
            ? url ?? ""
            : current.logoUrl,
        heroImageUrl:
          target ===
          "business-hero"
            ? url ?? ""
            : current.heroImageUrl,
        updatedAt,
      })
    );
  }

  function updateEmployeeMedia(
    employeeSlug: string,
    url:
      string | null,
    updatedAt: string
  ) {
    setEmployees(
      (currentEmployees) =>
        currentEmployees.map(
          (employee) =>
            employee.slug ===
            employeeSlug
              ? {
                  ...employee,
                  imageUrl:
                    url ?? "",
                  updatedAt,
                }
              : employee
        )
    );
  }

  function applyResult(
    target:
      BusinessMediaTarget,
    employeeSlug:
      string | undefined,
    payload:
      BusinessMediaMutationResponse
  ) {
    const url =
      payload.result?.url ??
      null;

    const updatedAt =
      payload.result
        ?.updatedAt;

    if (!updatedAt) {
      return;
    }

    if (
      target ===
      "employee-image" &&
      employeeSlug
    ) {
      updateEmployeeMedia(
        employeeSlug,
        url,
        updatedAt
      );
    } else {
      updateBusinessMedia(
        target,
        url,
        updatedAt
      );
    }
  }

  async function handleUpload(
    target:
      BusinessMediaTarget,
    expectedUpdatedAt:
      string,
    file: File,
    employeeSlug?:
      string
  ) {
    setMessage(null);

    const validationError =
      validateFile(
        file,
        target
      );

    if (validationError) {
      setMessage({
        type: "error",
        text:
          validationError,
      });

      return;
    }

    const key =
      employeeSlug
        ? `${target}:${employeeSlug}`
        : target;

    setPendingKey(key);

    try {
      const formData =
        new FormData();

      formData.set(
        "businessSlug",
        business.slug
      );

      formData.set(
        "target",
        target
      );

      formData.set(
        "expectedUpdatedAt",
        expectedUpdatedAt
      );

      formData.set(
        "file",
        file
      );

      if (employeeSlug) {
        formData.set(
          "employeeSlug",
          employeeSlug
        );
      }

      const response =
        await fetch(
          "/api/platform-admin/businesses/media",
          {
            method:
              "POST",
            body:
              formData,
            cache:
              "no-store",
          }
        );

      const payload =
        await response.json() as
          BusinessMediaMutationResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setMessage({
          type: "error",
          text:
            payload.message ??
            "Slika nije sačuvana.",
        });

        return;
      }

      applyResult(
        target,
        employeeSlug,
        payload
      );

      setMessage({
        type:
          payload.result
            ?.cleanupWarning
            ? "error"
            : "success",
        text:
          payload.message ??
          "Slika je sačuvana.",
      });
    } catch {
      setMessage({
        type: "error",
        text:
          "Nije moguće povezati se sa serverom.",
      });
    } finally {
      setPendingKey(null);
    }
  }

  async function handleRemove(
    target:
      BusinessMediaTarget,
    expectedUpdatedAt:
      string,
    employeeSlug?:
      string
  ) {
    setMessage(null);

    const key =
      employeeSlug
        ? `${target}:${employeeSlug}`
        : target;

    setPendingKey(key);

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/media",
          {
            method:
              "DELETE",
            headers: {
              "Content-Type":
                "application/json",
            },
            body:
              JSON.stringify({
                businessSlug:
                  business.slug,
                target,
                employeeSlug:
                  employeeSlug ??
                  null,
                expectedUpdatedAt,
              }),
            cache:
              "no-store",
          }
        );

      const payload =
        await response.json() as
          BusinessMediaMutationResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setMessage({
          type: "error",
          text:
            payload.message ??
            "Slika nije uklonjena.",
        });

        return;
      }

      applyResult(
        target,
        employeeSlug,
        payload
      );

      setMessage({
        type:
          payload.result
            ?.cleanupWarning
            ? "error"
            : "success",
        text:
          payload.message ??
          "Slika je uklonjena.",
      });
    } catch {
      setMessage({
        type: "error",
        text:
          "Nije moguće povezati se sa serverom.",
      });
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div
      className="space-y-6"
    >
      {message ? (
        <div
          role={
            message.type ===
            "error"
              ? "alert"
              : "status"
          }
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            message.type ===
            "error"
              ? "border-red-300/20 bg-red-300/10 text-red-100"
              : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
          }`}
        >
          {message.type ===
          "error" ? (
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />
          )}

          <span>
            {message.text}
          </span>
        </div>
      ) : null}

      <section
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
      >
        <div
          className="flex items-start gap-3"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-fuchsia-300/10 text-fuchsia-200"
          >
            <Store
              size={21}
            />
          </div>

          <div>
            <h3
              className="text-lg font-semibold"
            >
              Logo i hero slika
            </h3>

            <p
              className="mt-1 text-sm leading-6 text-zinc-500"
            >
              Promene se odmah prikazuju na javnom profilu. Logo je najbolje pripremiti kao kvadratnu transparentnu sliku, a hero kao široku fotografiju.
            </p>
          </div>
        </div>

        <div
          className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,280px)_minmax(0,1fr)]"
        >
          <article
            className="rounded-3xl border border-white/10 bg-zinc-950/35 p-4"
          >
            <p
              className="text-sm font-semibold text-zinc-200"
            >
              Logo salona
            </p>

            <p
              className="mt-1 text-xs leading-5 text-zinc-600"
            >
              JPEG, PNG, WebP ili AVIF · maksimalno {formatMaxFileSize(
                "business-logo"
              )}
            </p>

            <div
              className="mt-4"
            >
              <Preview
                url={
                  business.logoUrl
                }
                variant="logo"
                fallback={
                  <ImageIcon
                    size={30}
                  />
                }
              />
            </div>

            <div
              className="mt-4"
            >
              <UploadControls
                target="business-logo"
                expectedUpdatedAt={
                  business.updatedAt
                }
                currentUrl={
                  business.logoUrl
                }
                pendingKey={
                  pendingKey
                }
                onUpload={
                  handleUpload
                }
                onRemove={
                  handleRemove
                }
              />
            </div>
          </article>

          <article
            className="rounded-3xl border border-white/10 bg-zinc-950/35 p-4"
          >
            <p
              className="text-sm font-semibold text-zinc-200"
            >
              Hero / cover slika
            </p>

            <p
              className="mt-1 text-xs leading-5 text-zinc-600"
            >
              Preporuka 1920×1080 ili šire · maksimalno {formatMaxFileSize(
                "business-hero"
              )}
            </p>

            <div
              className="mt-4"
            >
              <Preview
                url={
                  business.heroImageUrl
                }
                variant="hero"
                fallback={
                  <ImageIcon
                    size={34}
                  />
                }
              />
            </div>

            <div
              className="mt-4"
            >
              <UploadControls
                target="business-hero"
                expectedUpdatedAt={
                  business.updatedAt
                }
                currentUrl={
                  business.heroImageUrl
                }
                pendingKey={
                  pendingKey
                }
                onUpload={
                  handleUpload
                }
                onRemove={
                  handleRemove
                }
              />
            </div>
          </article>
        </div>
      </section>

      <section
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
      >
        <div
          className="flex items-start gap-3"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-300/10 text-violet-200"
          >
            <UserRound
              size={21}
            />
          </div>

          <div>
            <h3
              className="text-lg font-semibold"
            >
              Fotografije zaposlenih
            </h3>

            <p
              className="mt-1 text-sm leading-6 text-zinc-500"
            >
              Kvadratne ili portretne fotografije rade najbolje. Uklanjanje slike automatski vraća neutralni avatar.
            </p>
          </div>
        </div>

        {employees.length > 0 ? (
          <div
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {employees.map(
              (
                employee:
                  BusinessBrandingEmployee
              ) => {
                return (
                  <article
                    key={
                      employee.id
                    }
                    className="rounded-3xl border border-white/10 bg-zinc-950/35 p-4"
                  >
                    <Preview
                      url={
                        employee.imageUrl
                      }
                      variant="employee"
                      fallback={
                        <UserRound
                          size={34}
                        />
                      }
                    />

                    <div
                      className="mt-4"
                    >
                      <div
                        className="flex flex-wrap items-center gap-2"
                      >
                        <h4
                          className="font-semibold text-zinc-100"
                        >
                          {employee.name}
                        </h4>

                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            employee.isActive
                              ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                              : "border-white/10 bg-white/5 text-zinc-500"
                          }`}
                        >
                          {employee.isActive
                            ? "Aktivan"
                            : "Neaktivan"}
                        </span>
                      </div>

                      <p
                        className="mt-1 text-sm text-zinc-500"
                      >
                        {employee.title ||
                          "Pozicija nije uneta"}
                      </p>
                    </div>

                    <div
                      className="mt-4"
                    >
                      <UploadControls
                        target="employee-image"
                        employeeSlug={
                          employee.slug
                        }
                        expectedUpdatedAt={
                          employee.updatedAt
                        }
                        currentUrl={
                          employee.imageUrl
                        }
                        pendingKey={
                          pendingKey
                        }
                        onUpload={
                          handleUpload
                        }
                        onRemove={
                          handleRemove
                        }
                      />
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <div
            className="mt-6 rounded-2xl border border-dashed border-white/15 p-7 text-center text-sm text-zinc-500"
          >
            Salon još nema zaposlenih.
          </div>
        )}
      </section>
    </div>
  );
}
