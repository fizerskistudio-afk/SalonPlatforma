"use client";

import {
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
  type ReactNode,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  Scissors,
  UserRound,
} from "lucide-react";

type EditorMode =
  | "create"
  | "update";

type EmployeeForm = {
  name: string;
  slug: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
};

type ServiceOption = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  helper: string;
};

type BusinessEmployeeEditorProps = {
  mode: EditorMode;
  businessSlug: string;
  businessName: string;
  defaultLocale: string;
  expectedUpdatedAt:
    | string
    | null;
  initialEmployee:
    EmployeeForm;
  initialServiceIds:
    readonly string[];
  services:
    readonly ServiceOption[];
};

type SaveEmployeeResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  result?: {
    employeeSlug?: string;
    serviceCount?: number;
  };
};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function BusinessEmployeeEditor({
  mode,
  businessSlug,
  businessName,
  defaultLocale,
  expectedUpdatedAt,
  initialEmployee,
  initialServiceIds,
  services,
}: BusinessEmployeeEditorProps) {
  const router =
    useRouter();

  const [
    employee,
    setEmployee,
  ] =
    useState<EmployeeForm>(
      initialEmployee
    );

  const [
    slugWasEdited,
    setSlugWasEdited,
  ] =
    useState(
      mode === "update"
    );

  const [
    selectedServiceIds,
    setSelectedServiceIds,
  ] = useState<Set<string>>(
    () =>
      new Set(
        initialServiceIds
      )
  );

  const [
    isSubmitting,
    setIsSubmitting,
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

  const servicesByCategory =
    useMemo(
      () => {
        const groupedServices =
          new Map<
            string,
            {
              categoryId: string;
              categoryName: string;
              services:
                ServiceOption[];
            }
          >();

        for (
          const service of
          services
        ) {
          const group =
            groupedServices.get(
              service.categoryId
            ) ?? {
              categoryId:
                service.categoryId,
              categoryName:
                service.categoryName,
              services: [],
            };

          group.services.push(
            service
          );

          groupedServices.set(
            service.categoryId,
            group
          );
        }

        return Array.from(
          groupedServices.values()
        );
      },
      [services]
    );

  const backPath =
    `/platform-admin/businesses/${businessSlug}/employees`;

  function updateEmployee<
    Key extends keyof EmployeeForm,
  >(
    key: Key,
    value: EmployeeForm[Key]
  ) {
    setEmployee(
      (currentEmployee) => ({
        ...currentEmployee,
        [key]: value,
      })
    );

    setError(
      null
    );

    setErrorCode(
      null
    );
  }

  function handleNameChange(
    value: string
  ) {
    setEmployee(
      (currentEmployee) => ({
        ...currentEmployee,
        name: value,
        ...(
          mode === "create" &&
          !slugWasEdited
            ? {
                slug:
                  normalizeSlug(
                    value
                  ),
              }
            : {}
        ),
      })
    );

    setError(
      null
    );
  }

  function toggleService(
    serviceId: string
  ) {
    setSelectedServiceIds(
      (currentIds) => {
        const nextIds =
          new Set(
            currentIds
          );

        if (
          nextIds.has(
            serviceId
          )
        ) {
          nextIds.delete(
            serviceId
          );
        } else {
          nextIds.add(
            serviceId
          );
        }

        return nextIds;
      }
    );

    setError(
      null
    );
  }

  function selectAllServices() {
    setSelectedServiceIds(
      new Set(
        services.map(
          (service) =>
            service.id
        )
      )
    );
  }

  function clearServices() {
    setSelectedServiceIds(
      new Set()
    );
  }

  function validate(): string | null {
    if (
      employee.name.trim().length < 2 ||
      employee.name.trim().length > 120
    ) {
      return "Ime zaposlenog mora imati između 2 i 120 karaktera.";
    }

    if (
      !employee.slug ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        employee.slug
      )
    ) {
      return "Slug zaposlenog nije ispravan.";
    }

    if (
      employee.title.trim().length < 2 ||
      employee.title.trim().length > 100
    ) {
      return "Pozicija zaposlenog mora imati između 2 i 100 karaktera.";
    }

    if (
      employee.bio.trim().length > 1000
    ) {
      return "Biografija zaposlenog može imati najviše 1000 karaktera.";
    }

    const normalizedEmail =
      employee.email.trim();

    if (
      normalizedEmail &&
      (
        normalizedEmail.length > 254 ||
        !EMAIL_PATTERN.test(
          normalizedEmail
        )
      )
    ) {
      return "Email zaposlenog nije ispravan.";
    }

    if (
      employee.phone.trim().length > 40
    ) {
      return "Telefon zaposlenog može imati najviše 40 karaktera.";
    }

    const normalizedImageUrl =
      employee.imageUrl.trim();

    if (
      normalizedImageUrl &&
      (
        normalizedImageUrl.length > 2000 ||
        !/^https?:\/\//i.test(
          normalizedImageUrl
        )
      )
    ) {
      return "URL fotografije mora biti puna http ili https adresa.";
    }

    if (
      !Number.isInteger(
        employee.sortOrder
      ) ||
      employee.sortOrder < 0 ||
      employee.sortOrder > 100000
    ) {
      return "Redosled zaposlenog nije ispravan.";
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(
      null
    );

    setErrorCode(
      null
    );

    const validationError =
      validate();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    setIsSubmitting(
      true
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/employees",
          {
            method:
              mode === "create"
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
                employeeSlug:
                  employee.slug,
                ...(mode === "update"
                  ? {
                      expectedUpdatedAt,
                    }
                  : {}),
                employee: {
                  name:
                    employee.name.trim(),
                  title:
                    employee.title.trim(),
                  bio:
                    employee.bio.trim(),
                  email:
                    employee.email.trim(),
                  phone:
                    employee.phone.trim(),
                  imageUrl:
                    employee.imageUrl.trim(),
                  sortOrder:
                    employee.sortOrder,
                  isActive:
                    employee.isActive,
                },
                serviceIds:
                  Array.from(
                    selectedServiceIds
                  ),
              }),
          }
        );

      const payload =
        await response.json() as
          SaveEmployeeResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setError(
          payload.message ??
            "Čuvanje zaposlenog nije uspelo."
        );

        setErrorCode(
          payload.code ??
            null
        );

        return;
      }

      router.push(
        backPath
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
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      <section
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
      >
        <div
          className="flex items-start gap-3"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200"
          >
            <UserRound
              size={21}
            />
          </div>

          <div>
            <h3
              className="text-lg font-semibold"
            >
              Osnovni podaci
            </h3>

            <p
              className="mt-1 text-sm leading-6 text-zinc-500"
            >
              Podaci se uređuju na glavnom jeziku salona ({defaultLocale}).
            </p>
          </div>
        </div>

        <div
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <Field
            label="Ime zaposlenog"
            required
          >
            <input
              value={
                employee.name
              }
              onChange={
                (event: ChangeEvent<HTMLInputElement>) =>
                  handleNameChange(
                    event.target.value
                  )
              }
              maxLength={120}
              className={inputClassName}
              placeholder="Mika Petrović"
            />
          </Field>

          <Field
            label="Slug"
            required
            helper={
              mode === "update"
                ? "Slug je zaključan da postojeći linkovi ostanu stabilni."
                : "Koristi se samo interno u URL-u."
            }
          >
            <input
              value={
                employee.slug
              }
              onChange={
                (event: ChangeEvent<HTMLInputElement>) => {
                  setSlugWasEdited(
                    true
                  );

                  updateEmployee(
                    "slug",
                    normalizeSlug(
                      event.target.value
                    )
                  );
                }
              }
              disabled={
                mode === "update"
              }
              maxLength={80}
              className={`${inputClassName} disabled:cursor-not-allowed disabled:text-zinc-600`}
              placeholder="mika-petrovic"
            />
          </Field>

          <Field
            label="Pozicija"
            required
          >
            <input
              value={
                employee.title
              }
              onChange={
                (event: ChangeEvent<HTMLInputElement>) =>
                  updateEmployee(
                    "title",
                    event.target.value
                  )
              }
              maxLength={100}
              className={inputClassName}
              placeholder="Berberin"
            />
          </Field>

          <Field
            label="Redosled prikaza"
            helper="Manji broj se prikazuje ranije."
          >
            <input
              type="number"
              min={0}
              max={100000}
              step={1}
              value={
                employee.sortOrder
              }
              onChange={
                (event: ChangeEvent<HTMLInputElement>) =>
                  updateEmployee(
                    "sortOrder",
                    Number(
                      event.target.value
                    )
                  )
              }
              className={inputClassName}
            />
          </Field>

          <Field
            label="Telefon"
            icon={Phone}
          >
            <input
              type="tel"
              value={
                employee.phone
              }
              onChange={
                (event: ChangeEvent<HTMLInputElement>) =>
                  updateEmployee(
                    "phone",
                    event.target.value
                  )
              }
              maxLength={40}
              className={inputClassName}
              placeholder="+381 60 123 4567"
            />
          </Field>

          <Field
            label="Email"
            icon={Mail}
          >
            <input
              type="email"
              value={
                employee.email
              }
              onChange={
                (event: ChangeEvent<HTMLInputElement>) =>
                  updateEmployee(
                    "email",
                    event.target.value
                  )
              }
              maxLength={254}
              className={inputClassName}
              placeholder="mika@salon.rs"
            />
          </Field>

          <div
            className="md:col-span-2"
          >
            <Field
              label="URL fotografije"
              icon={ImageIcon}
              helper="Opcionalna puna http/https adresa fotografije."
            >
              <input
                type="url"
                value={
                  employee.imageUrl
                }
                onChange={
                  (event: ChangeEvent<HTMLInputElement>) =>
                    updateEmployee(
                      "imageUrl",
                      event.target.value
                    )
                }
                maxLength={2000}
                className={inputClassName}
                placeholder="https://..."
              />
            </Field>
          </div>

          <div
            className="md:col-span-2"
          >
            <Field
              label="Biografija"
              helper={`${employee.bio.length}/1000`}
            >
              <textarea
                value={
                  employee.bio
                }
                onChange={
                  (event: ChangeEvent<HTMLTextAreaElement>) =>
                    updateEmployee(
                      "bio",
                      event.target.value
                    )
                }
                maxLength={1000}
                rows={5}
                className={`${inputClassName} resize-y`}
                placeholder="Kratak opis iskustva i specijalnosti..."
              />
            </Field>
          </div>
        </div>

        <label
          className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-zinc-950/50 p-4"
        >
          <input
            type="checkbox"
            checked={
              employee.isActive
            }
            onChange={
              (event: ChangeEvent<HTMLInputElement>) =>
                updateEmployee(
                  "isActive",
                  event.target.checked
                )
            }
            className="mt-1 h-4 w-4 accent-amber-300"
          />

          <span>
            <span
              className="block text-sm font-semibold text-zinc-200"
            >
              Aktivan zaposleni
            </span>

            <span
              className="mt-1 block text-sm leading-6 text-zinc-500"
            >
              Neaktivan zaposleni ostaje u bazi i istoriji rezervacija, ali se ne prikazuje klijentima.
            </span>
          </span>
        </label>
      </section>

      <section
        className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
      >
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div
            className="flex items-start gap-3"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-300/10 text-sky-200"
            >
              <Scissors
                size={21}
              />
            </div>

            <div>
              <h3
                className="text-lg font-semibold"
              >
                Dodeljene usluge
              </h3>

              <p
                className="mt-1 text-sm leading-6 text-zinc-500"
              >
                Izabrano {selectedServiceIds.size} od {services.length} aktivnih usluga.
              </p>
            </div>
          </div>

          <div
            className="flex gap-2"
          >
            <button
              type="button"
              onClick={
                selectAllServices
              }
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              Izaberi sve
            </button>

            <button
              type="button"
              onClick={
                clearServices
              }
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              Očisti
            </button>
          </div>
        </div>

        {servicesByCategory.length > 0 ? (
          <div
            className="mt-6 space-y-4"
          >
            {servicesByCategory.map(
              (group) => (
                <div
                  key={
                    group.categoryId
                  }
                  className="overflow-hidden rounded-2xl border border-white/10"
                >
                  <div
                    className="border-b border-white/10 bg-zinc-950/40 px-4 py-3"
                  >
                    <p
                      className="text-sm font-semibold text-zinc-300"
                    >
                      {group.categoryName}
                    </p>
                  </div>

                  <div
                    className="divide-y divide-white/10"
                  >
                    {group.services.map(
                      (service) => (
                        <label
                          key={
                            service.id
                          }
                          className="flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-white/[0.025]"
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedServiceIds.has(
                                service.id
                              )
                            }
                            onChange={() =>
                              toggleService(
                                service.id
                              )
                            }
                            className="mt-1 h-4 w-4 accent-sky-300"
                          />

                          <span
                            className="min-w-0"
                          >
                            <span
                              className="block text-sm font-medium text-zinc-200"
                            >
                              {service.name}
                            </span>

                            <span
                              className="mt-0.5 block text-xs text-zinc-600"
                            >
                              {service.helper}
                            </span>
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div
            className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100/80"
          >
            Salon trenutno nema aktivne usluge. Zaposleni može biti sačuvan, ali neće moći da prima rezervacije dok mu ne dodelimo uslugu.
          </div>
        )}
      </section>

      {error ? (
        <div
          className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4"
        >
          <div
            className="flex items-start gap-3"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-300"
            />

            <div>
              <p
                className="font-semibold text-red-200"
              >
                Čuvanje nije uspelo
              </p>

              <p
                className="mt-1 text-sm leading-6 text-red-100/75"
              >
                {error}
              </p>

              {errorCode ? (
                <p
                  className="mt-2 text-xs text-red-200/50"
                >
                  {errorCode}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <Link
          href={
            backPath
          }
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          Odustani
        </Link>

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-wait disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : mode === "create" ? (
            <CheckCircle2
              size={18}
            />
          ) : (
            <Save
              size={18}
            />
          )}

          {isSubmitting
            ? "Čuvanje..."
            : mode === "create"
              ? "Dodaj zaposlenog"
              : "Sačuvaj izmene"}
        </button>
      </div>

      <p
        className="text-center text-xs text-zinc-700"
      >
        Salon: {businessName}
      </p>
    </form>
  );
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/10";

function Field({
  label,
  required = false,
  helper,
  icon: Icon,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  icon?: ComponentType<{
    size?: number;
  }>;
  children:
    ReactNode;
}) {
  return (
    <label
      className="block"
    >
      <span
        className="mb-2 flex items-center gap-2 text-sm font-semibold text-zinc-300"
      >
        {Icon ? (
          <Icon
            size={15}
          />
        ) : null}

        {label}

        {required ? (
          <span
            className="text-amber-300"
          >
            *
          </span>
        ) : null}
      </span>

      {children}

      {helper ? (
        <span
          className="mt-1.5 block text-xs leading-5 text-zinc-600"
        >
          {helper}
        </span>
      ) : null}
    </label>
  );
}
