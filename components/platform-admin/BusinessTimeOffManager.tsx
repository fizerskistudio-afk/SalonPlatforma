"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Building2,
  CalendarX2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Pencil,
  PlusCircle,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

type BlockType =
  | "time_off"
  | "break"
  | "blocked";

type EmployeeOption = {
  slug: string;
  name: string;
  isActive: boolean;
};

type BlockOption = {
  id: string;
  employeeSlug: string | null;
  employeeName: string | null;
  blockType: BlockType;
  startsLocal: string;
  endsLocal: string;
  startsLabel: string;
  endsLabel: string;
  reason: string;
  updatedAt: string;
  isOngoing: boolean;
};

type FormState = {
  target: string;
  blockType: BlockType;
  startsLocal: string;
  endsLocal: string;
  reason: string;
};

type ApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
};

const TYPE_LABELS: Record<BlockType, string> = {
  time_off: "Odsustvo",
  break: "Pauza",
  blocked: "Blokirano",
};

const EMPTY_FORM: FormState = {
  target: "business",
  blockType: "time_off",
  startsLocal: "",
  endsLocal: "",
  reason: "",
};

export default function BusinessTimeOffManager({
  businessSlug,
  businessName,
  timezone,
  employees,
  blocks,
}: {
  businessSlug: string;
  businessName: string;
  timezone: string;
  employees: readonly EmployeeOption[];
  blocks: readonly BlockOption[];
}) {
  const router = useRouter();
  const [editingBlock, setEditingBlock] =
    useState<BlockOption | null>(null);
  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);
  const [error, setError] =
    useState<string | null>(null);
  const [errorCode, setErrorCode] =
    useState<string | null>(null);
  const [success, setSuccess] =
    useState<string | null>(null);

  function updateForm<Key extends keyof FormState>(
    key: Key,
    value: FormState[Key]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
    setError(null);
    setErrorCode(null);
    setSuccess(null);
  }

  function resetForm() {
    setEditingBlock(null);
    setForm(EMPTY_FORM);
    setError(null);
    setErrorCode(null);
  }

  function startEdit(block: BlockOption) {
    setEditingBlock(block);
    setForm({
      target: block.employeeSlug ?? "business",
      blockType: block.blockType,
      startsLocal: block.startsLocal,
      endsLocal: block.endsLocal,
      reason: block.reason,
    });
    setError(null);
    setErrorCode(null);
    setSuccess(null);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function validate(): string | null {
    if (!form.startsLocal || !form.endsLocal) {
      return "Unesi početak i kraj blokade.";
    }

    if (form.endsLocal <= form.startsLocal) {
      return "Kraj blokade mora biti posle početka.";
    }

    if (form.reason.trim().length > 500) {
      return "Razlog može imati najviše 500 karaktera.";
    }

    if (
      form.target !== "business" &&
      !employees.some(
        (employee) => employee.slug === form.target
      )
    ) {
      return "Izabrani zaposleni više ne postoji.";
    }

    return null;
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);
    setErrorCode(null);
    setSuccess(null);

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        "/api/platform-admin/businesses/time-off",
        {
          method: editingBlock ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            businessSlug,
            ...(editingBlock
              ? {
                  blockId: editingBlock.id,
                  expectedUpdatedAt:
                    editingBlock.updatedAt,
                }
              : {}),
            block: {
              employeeSlug:
                form.target === "business"
                  ? null
                  : form.target,
              blockType: form.blockType,
              startsLocal: form.startsLocal,
              endsLocal: form.endsLocal,
              reason: form.reason.trim(),
            },
          }),
        }
      );
      const payload =
        (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok) {
        setError(
          payload.message ??
            "Čuvanje blokade nije uspelo."
        );
        setErrorCode(payload.code ?? null);
        return;
      }

      setSuccess(
        editingBlock
          ? "Blokada je izmenjena."
          : "Blokada je dodata."
      );
      resetForm();
      router.refresh();
    } catch {
      setError(
        "Nije moguće povezati se sa serverom. Pokušaj ponovo."
      );
      setErrorCode("NETWORK_ERROR");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function deleteBlock(block: BlockOption) {
    const confirmed = window.confirm(
      `Obrisati blokadu: ${block.startsLabel} – ${block.endsLabel}?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(block.id);
    setError(null);
    setErrorCode(null);
    setSuccess(null);

    try {
      const response = await fetch(
        "/api/platform-admin/businesses/time-off",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
          body: JSON.stringify({
            businessSlug,
            blockId: block.id,
            expectedUpdatedAt: block.updatedAt,
          }),
        }
      );
      const payload =
        (await response.json()) as ApiResponse;

      if (!response.ok || !payload.ok) {
        setError(
          payload.message ??
            "Brisanje blokade nije uspelo."
        );
        setErrorCode(payload.code ?? null);
        return;
      }

      if (editingBlock?.id === block.id) {
        resetForm();
      }

      setSuccess("Blokada je obrisana.");
      router.refresh();
    } catch {
      setError(
        "Nije moguće povezati se sa serverom. Pokušaj ponovo."
      );
      setErrorCode("NETWORK_ERROR");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <form
        onSubmit={handleSubmit}
        className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
              {editingBlock ? (
                <Pencil size={17} />
              ) : (
                <PlusCircle size={17} />
              )}
              {editingBlock
                ? "Izmena blokade"
                : "Nova blokada"}
            </div>
            <h3 className="mt-2 text-xl font-semibold">
              {editingBlock
                ? "Promeni period"
                : "Blokiraj dostupnost"}
            </h3>
          </div>

          {editingBlock ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:text-white"
            >
              Otkaži izmenu
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-500">
          Vreme se unosi u zoni {timezone}. Nova blokada neće biti sačuvana ako preseca aktivnu rezervaciju.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Koga blokiramo?">
            <select
              value={form.target}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updateForm("target", event.target.value)
              }
              className={inputClassName}
            >
              <option value="business">
                Ceo salon — {businessName}
              </option>
              {employees.map((employee) => (
                <option
                  key={employee.slug}
                  value={employee.slug}
                >
                  {employee.name}
                  {employee.isActive
                    ? ""
                    : " (neaktivan)"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tip blokade">
            <select
              value={form.blockType}
              onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                updateForm(
                  "blockType",
                  event.target.value as BlockType
                )
              }
              className={inputClassName}
            >
              <option value="time_off">
                Odsustvo / slobodan dan
              </option>
              <option value="break">
                Pauza
              </option>
              <option value="blocked">
                Druga blokada
              </option>
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Početak">
              <input
                type="datetime-local"
                value={form.startsLocal}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateForm(
                    "startsLocal",
                    event.target.value
                  )
                }
                required
                className={inputClassName}
              />
            </Field>

            <Field label="Kraj">
              <input
                type="datetime-local"
                value={form.endsLocal}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateForm(
                    "endsLocal",
                    event.target.value
                  )
                }
                required
                className={inputClassName}
              />
            </Field>
          </div>

          <Field
            label="Razlog"
            helper={`${form.reason.length}/500`}
          >
            <textarea
              value={form.reason}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                updateForm("reason", event.target.value)
              }
              maxLength={500}
              rows={4}
              placeholder="Npr. godišnji odmor, privatna obaveza, pauza..."
              className={`${inputClassName} resize-y`}
            />
          </Field>
        </div>

        {error ? (
          <Notice
            tone="error"
            title={error}
            code={errorCode}
          />
        ) : null}

        {success ? (
          <Notice tone="success" title={success} />
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle
              size={18}
              className="animate-spin"
            />
          ) : (
            <Save size={18} />
          )}
          {editingBlock
            ? "Sačuvaj izmene"
            : "Dodaj blokadu"}
        </button>
      </form>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-sky-300">
              <CalendarX2 size={17} />
              Aktivni kalendar blokada
            </div>
            <h3 className="mt-2 text-xl font-semibold">
              Budući periodi
            </h3>
          </div>
          <span className="rounded-full border border-white/10 bg-zinc-950/60 px-3 py-1 text-sm font-semibold text-zinc-300">
            {blocks.length}
          </span>
        </div>

        {blocks.length > 0 ? (
          <div className="mt-6 space-y-3">
            {blocks.map((block) => (
              <article
                key={block.id}
                className="rounded-2xl border border-white/10 bg-zinc-950/45 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-semibold text-amber-200">
                        {TYPE_LABELS[block.blockType]}
                      </span>
                      {block.isOngoing ? (
                        <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
                          Aktivno sada
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold text-zinc-200">
                      {block.employeeName ? (
                        <UserRound size={16} />
                      ) : (
                        <Building2 size={16} />
                      )}
                      {block.employeeName ?? "Ceo salon"}
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm text-zinc-400">
                      <p className="flex items-center gap-2">
                        <Clock3 size={15} />
                        {block.startsLabel}
                      </p>
                      <p className="pl-[23px]">
                        do {block.endsLabel}
                      </p>
                    </div>

                    {block.reason ? (
                      <p className="mt-3 break-words text-sm leading-6 text-zinc-500">
                        {block.reason}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(block)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
                    >
                      <Pencil size={16} />
                      Uredi
                    </button>
                    <button
                      type="button"
                      disabled={deletingId === block.id}
                      onClick={() => deleteBlock(block)}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/5 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === block.id ? (
                        <LoaderCircle
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Obriši
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <CalendarX2
              size={34}
              className="mx-auto text-zinc-700"
            />
            <h4 className="mt-4 font-semibold">
              Nema budućih blokada
            </h4>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Salon i zaposleni trenutno koriste samo svoje redovno radno vreme.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/10";

function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-zinc-300">
        {label}
        {helper ? (
          <span className="text-xs font-normal text-zinc-600">
            {helper}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

function Notice({
  tone,
  title,
  code,
}: {
  tone: "error" | "success";
  title: string;
  code?: string | null;
}) {
  const isError = tone === "error";

  return (
    <div
      className={`mt-5 rounded-2xl border px-4 py-3 ${
        isError
          ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
          : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
      }`}
    >
      <div className="flex items-start gap-2.5">
        {isError ? (
          <AlertCircle size={18} className="mt-0.5" />
        ) : (
          <CheckCircle2 size={18} className="mt-0.5" />
        )}
        <div>
          <p className="text-sm font-semibold">
            {title}
          </p>
          {code ? (
            <p className="mt-1 text-xs opacity-60">
              {code}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
