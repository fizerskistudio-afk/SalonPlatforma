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
  Eye,
  EyeOff,
  LoaderCircle,
  Pencil,
  Plus,
  Power,
  Save,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import {
  saveEmployeeAction,
  setEmployeeActiveAction,
  type TeamLocalizedTextInput,
} from "@/app/admin/(protected)/team/actions";
import type { AdminEmployee } from "@/lib/admin/team";

type TeamManagementActionsProps = {
  employees: AdminEmployee[];
};

type DialogMode = "create" | "edit";

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

type LanguageKey = "mk" | "sq" | "en";

type EmployeeFormState = {
  name: string;
  slug: string;

  title: TeamLocalizedTextInput;
  bio: TeamLocalizedTextInput;

  imageUrl: string;
  email: string;
  phone: string;

  sortOrder: string;
  isActive: boolean;
};

const languages: {
  key: LanguageKey;
  label: string;
  titlePlaceholder: string;
}[] = [
  {
    key: "mk",
    label: "Makedonski",
    titlePlaceholder: "Фризер, стилист...",
  },
  {
    key: "sq",
    label: "Albanski",
    titlePlaceholder: "Parukier, stilist...",
  },
  {
    key: "en",
    label: "Engleski",
    titlePlaceholder: "Hair stylist, barber...",
  },
];

function createEmptyLocalizedText(): TeamLocalizedTextInput {
  return {
    mk: "",
    sq: "",
    en: "",
  };
}

function normalizeLocalizedText(
  value: {
    mk?: string;
    sq?: string;
    en?: string;
  } | null
): TeamLocalizedTextInput {
  return {
    mk: value?.mk ?? "",
    sq: value?.sq ?? "",
    en: value?.en ?? "",
  };
}

function getDisplayTitle(
  employee: AdminEmployee
): string {
  return (
    employee.title.en?.trim() ||
    employee.title.mk?.trim() ||
    employee.title.sq?.trim() ||
    "Bez titule"
  );
}

function getInitials(value: string): string {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "TM";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${
    words[words.length - 1][0]
  }`.toUpperCase();
}

function getNextSortOrder(
  employees: AdminEmployee[]
): number {
  if (employees.length === 0) {
    return 10;
  }

  return (
    Math.max(
      ...employees.map(
        (employee) => employee.sortOrder
      )
    ) + 10
  );
}

function createEmptyEmployeeForm(
  employees: AdminEmployee[]
): EmployeeFormState {
  return {
    name: "",
    slug: "",

    title: createEmptyLocalizedText(),
    bio: createEmptyLocalizedText(),

    imageUrl: "",
    email: "",
    phone: "",

    sortOrder: String(
      getNextSortOrder(employees)
    ),

    isActive: true,
  };
}

function createEmployeeFormFromEmployee(
  employee: AdminEmployee
): EmployeeFormState {
  return {
    name: employee.name,
    slug: employee.slug,

    title: normalizeLocalizedText(
      employee.title
    ),

    bio: normalizeLocalizedText(
      employee.bio
    ),

    imageUrl: employee.imageUrl ?? "",
    email: employee.email ?? "",
    phone: employee.phone ?? "",

    sortOrder: String(employee.sortOrder),
    isActive: employee.isActive,
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

function LocalizedEmployeeEditor({
  title,
  description,
  values,
  onChange,
  multiline = false,
  maxLength,
}: {
  title: string;
  description: string;
  values: TeamLocalizedTextInput;
  onChange: (
    language: LanguageKey,
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
                value={values[language.key]}
                onChange={(event) =>
                  onChange(
                    language.key,
                    event.target.value
                  )
                }
                maxLength={maxLength}
                rows={6}
                placeholder={`Biografija — ${language.label}`}
                className="mt-2 w-full resize-y rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-relaxed text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            ) : (
              <input
                type="text"
                value={values[language.key]}
                onChange={(event) =>
                  onChange(
                    language.key,
                    event.target.value
                  )
                }
                maxLength={maxLength}
                placeholder={
                  language.titlePlaceholder
                }
                className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 hover:border-white/15 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            )}

            <span className="mt-1 block text-right text-[10px] text-zinc-700">
              {values[language.key].length}/
              {maxLength}
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default function TeamManagementActions({
  employees,
}: TeamManagementActionsProps) {
  const router = useRouter();

  const [isPending, startTransition] =
    useTransition();

  const [dialogOpen, setDialogOpen] =
    useState(false);

  const [dialogMode, setDialogMode] =
    useState<DialogMode>("create");

  const [
    editingEmployeeId,
    setEditingEmployeeId,
  ] = useState<string | null>(null);

  const [
    selectedEmployeeId,
    setSelectedEmployeeId,
  ] = useState(employees[0]?.id ?? "");

  const [
    pendingEmployeeId,
    setPendingEmployeeId,
  ] = useState<string | null>(null);

  const [message, setMessage] =
    useState<ActionMessage | null>(null);

  const [employeeForm, setEmployeeForm] =
    useState<EmployeeFormState>(() =>
      createEmptyEmployeeForm(employees)
    );

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.id === selectedEmployeeId
      ) ?? null,
    [employees, selectedEmployeeId]
  );

  useEffect(() => {
    if (employees.length === 0) {
      setSelectedEmployeeId("");
      return;
    }

    const employeeStillExists =
      employees.some(
        (employee) =>
          employee.id === selectedEmployeeId
      );

    if (!employeeStillExists) {
      setSelectedEmployeeId(
        employees[0].id
      );
    }
  }, [employees, selectedEmployeeId]);

  useEffect(() => {
    if (!dialogOpen) {
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
        setDialogOpen(false);
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
  }, [dialogOpen, isPending]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setEditingEmployeeId(null);

    setEmployeeForm(
      createEmptyEmployeeForm(employees)
    );

    setMessage(null);
    setDialogOpen(true);
  };

  const openEditDialog = () => {
    if (!selectedEmployee) {
      setMessage({
        type: "error",
        text: "Izabrani zaposleni nije pronađen.",
      });

      return;
    }

    setDialogMode("edit");

    setEditingEmployeeId(
      selectedEmployee.id
    );

    setEmployeeForm(
      createEmployeeFormFromEmployee(
        selectedEmployee
      )
    );

    setMessage(null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isPending) {
      return;
    }

    setDialogOpen(false);
    setEditingEmployeeId(null);
    setMessage(null);
  };

  const generateSlug = () => {
    setEmployeeForm((current) => ({
      ...current,
      slug: slugify(current.name),
    }));
  };

  const handleEmployeeSubmit = (
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
          await saveEmployeeAction({
            employeeId:
              dialogMode === "edit"
                ? editingEmployeeId ??
                  undefined
                : undefined,

            name: employeeForm.name,
            slug: employeeForm.slug,

            title: employeeForm.title,
            bio: employeeForm.bio,

            imageUrl:
              employeeForm.imageUrl,

            email: employeeForm.email,
            phone: employeeForm.phone,

            sortOrder: Number(
              employeeForm.sortOrder
            ),

            isActive:
              employeeForm.isActive,
          });

        setMessage({
          type: result.ok
            ? "success"
            : "error",

          text: result.message,
        });

        if (result.ok) {
          if (result.entityId) {
            setSelectedEmployeeId(
              result.entityId
            );
          }

          setDialogOpen(false);
          setEditingEmployeeId(null);

          router.refresh();
        }
      } catch {
        setMessage({
          type: "error",
          text: "Došlo je do greške prilikom čuvanja zaposlenog.",
        });
      }
    });
  };

  const handleStatusChange = () => {
    if (
      !selectedEmployee ||
      isPending
    ) {
      return;
    }

    setPendingEmployeeId(
      selectedEmployee.id
    );

    setMessage(null);

    startTransition(async () => {
      try {
        const result =
          await setEmployeeActiveAction({
            employeeId:
              selectedEmployee.id,

            isActive:
              !selectedEmployee.isActive,
          });

        setMessage({
          type: result.ok
            ? "success"
            : "error",

          text: result.message,
        });

        if (result.ok) {
          router.refresh();
        }
      } catch {
        setMessage({
          type: "error",
          text: "Došlo je do greške prilikom promene statusa zaposlenog.",
        });
      } finally {
        setPendingEmployeeId(null);
      }
    });
  };

  return (
    <>
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
                Upravljanje timom
              </div>

              <p className="mt-1 text-sm text-zinc-400">
                Dodaj novog člana, izmeni profil
                ili promeni njegovu vidljivost.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateDialog}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200"
            >
              <Plus
                className="h-4 w-4"
                aria-hidden="true"
              />

              Dodaj zaposlenog
            </button>
          </div>

          <div className="mt-5 border-t border-white/[0.07] pt-5">
            <div className="grid gap-4 xl:grid-cols-[minmax(16rem,1fr)_minmax(16rem,0.7fr)_auto_auto] xl:items-end">
              <label>
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  Izaberi zaposlenog
                </span>

                <select
                  value={selectedEmployeeId}
                  disabled={employees.length === 0}
                  onChange={(event) =>
                    setSelectedEmployeeId(
                      event.target.value
                    )
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15 disabled:opacity-40"
                >
                  {employees.length === 0 ? (
                    <option value="">
                      Nema zaposlenih
                    </option>
                  ) : (
                    employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name} —{" "}
                        {getDisplayTitle(employee)}
                      </option>
                    ))
                  )}
                </select>
              </label>

              <div className="rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3">
                {selectedEmployee ? (
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        selectedEmployee.imageUrl
                          ? "bg-cover bg-center text-transparent"
                          : "bg-amber-300/10 text-amber-200"
                      }`}
                      style={
                        selectedEmployee.imageUrl
                          ? {
                              backgroundImage: `url("${selectedEmployee.imageUrl}")`,
                            }
                          : undefined
                      }
                    >
                      {!selectedEmployee.imageUrl &&
                        getInitials(
                          selectedEmployee.name
                        )}
                    </div>

                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white">
                        {selectedEmployee.name}
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-xs">
                        {selectedEmployee.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-300">
                            <Eye
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            Aktivan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-zinc-600">
                            <EyeOff
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />

                            Neaktivan
                          </span>
                        )}

                        <span className="text-zinc-700">
                          ·
                        </span>

                        <span className="text-zinc-600">
                          {
                            selectedEmployee.services
                              .length
                          }{" "}
                          usluga
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-11 items-center gap-3 text-sm text-zinc-700">
                    <UsersRound
                      className="h-4 w-4"
                      aria-hidden="true"
                    />

                    Nema izabranog zaposlenog
                  </div>
                )}
              </div>

              <button
                type="button"
                disabled={!selectedEmployee}
                onClick={openEditDialog}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Pencil
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Uredi profil
              </button>

              <button
                type="button"
                disabled={
                  !selectedEmployee ||
                  isPending
                }
                onClick={handleStatusChange}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-40 ${
                  selectedEmployee?.isActive
                    ? "border-red-400/20 bg-red-400/[0.06] text-red-300 hover:bg-red-400/10"
                    : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300 hover:bg-emerald-400/10"
                }`}
              >
                {pendingEmployeeId ===
                selectedEmployee?.id ? (
                  <LoaderCircle
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Power
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}

                {pendingEmployeeId ===
                selectedEmployee?.id
                  ? "Čuvanje..."
                  : selectedEmployee?.isActive
                    ? "Deaktiviraj"
                    : "Aktiviraj"}
              </button>
            </div>
          </div>
        </div>

        {message && !dialogOpen && (
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

              <span className="text-sm leading-relaxed">
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

      {dialogOpen && (
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
                  <UserRound
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-zinc-600">
                    Tim salona
                  </div>

                  <h3 className="mt-1 text-lg font-semibold text-white">
                    {dialogMode === "edit"
                      ? "Uredi zaposlenog"
                      : "Novi zaposleni"}
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

            <form
              onSubmit={handleEmployeeSubmit}
              className="space-y-5 p-5 sm:p-7"
            >
              {message && (
                <div
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-2xl border p-4 ${
                    message.type === "success"
                      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
                      : "border-red-400/20 bg-red-400/[0.07] text-red-200"
                  }`}
                >
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
              )}

              <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Ime i prezime
                  </span>

                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={160}
                    value={employeeForm.name}
                    onChange={(event) =>
                      setEmployeeForm(
                        (current) => ({
                          ...current,
                          name: event.target.value,
                        })
                      )
                    }
                    placeholder="Ime zaposlenog"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Slug
                  </span>

                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      required
                      value={employeeForm.slug}
                      onChange={(event) =>
                        setEmployeeForm(
                          (current) => ({
                            ...current,
                            slug: event.target.value,
                          })
                        )
                      }
                      placeholder="ime-prezime"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />

                    <button
                      type="button"
                      onClick={generateSlug}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      Generiši
                    </button>
                  </div>
                </label>

                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Email
                  </span>

                  <input
                    type="email"
                    maxLength={320}
                    value={employeeForm.email}
                    onChange={(event) =>
                      setEmployeeForm(
                        (current) => ({
                          ...current,
                          email: event.target.value,
                        })
                      )
                    }
                    placeholder="ime@salon.com"
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Telefon
                  </span>

                  <input
                    type="tel"
                    maxLength={80}
                    value={employeeForm.phone}
                    onChange={(event) =>
                      setEmployeeForm(
                        (current) => ({
                          ...current,
                          phone: event.target.value,
                        })
                      )
                    }
                    placeholder="+389..."
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="text-sm font-medium text-zinc-300">
                    Link fotografije
                  </span>

                  <input
                    type="url"
                    maxLength={2000}
                    value={employeeForm.imageUrl}
                    onChange={(event) =>
                      setEmployeeForm(
                        (current) => ({
                          ...current,
                          imageUrl:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="https://..."
                    className="mt-2 h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                {employeeForm.imageUrl && (
                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                      Pregled fotografije
                    </div>

                    <div
                      className="mt-3 h-28 w-28 rounded-2xl border border-white/10 bg-cover bg-center"
                      style={{
                        backgroundImage: `url("${employeeForm.imageUrl}")`,
                      }}
                    />
                  </div>
                )}
              </section>

              <LocalizedEmployeeEditor
                title="Titula zaposlenog"
                description="Na primer: hair stylist, barber, color specialist."
                values={employeeForm.title}
                maxLength={160}
                onChange={(language, value) =>
                  setEmployeeForm(
                    (current) => ({
                      ...current,

                      title: {
                        ...current.title,
                        [language]: value,
                      },
                    })
                  )
                }
              />

              <LocalizedEmployeeEditor
                title="Biografija"
                description="Kratak javni opis iskustva, specijalnosti i pristupa klijentima."
                values={employeeForm.bio}
                maxLength={3000}
                multiline
                onChange={(language, value) =>
                  setEmployeeForm(
                    (current) => ({
                      ...current,

                      bio: {
                        ...current.bio,
                        [language]: value,
                      },
                    })
                  )
                }
              />

              <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 md:grid-cols-2">
                <label>
                  <span className="text-sm font-medium text-zinc-300">
                    Redosled prikaza
                  </span>

                  <input
                    type="number"
                    required
                    min="0"
                    max="100000"
                    step="1"
                    value={employeeForm.sortOrder}
                    onChange={(event) =>
                      setEmployeeForm(
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

                <label className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3 md:mt-7">
                  <input
                    type="checkbox"
                    checked={employeeForm.isActive}
                    onChange={(event) =>
                      setEmployeeForm(
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
                    Zaposleni je aktivan i javno
                    vidljiv
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
                      ? "Sačuvaj zaposlenog"
                      : "Dodaj zaposlenog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}