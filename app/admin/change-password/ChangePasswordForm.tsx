"use client";

import {
  useActionState,
} from "react";

import {
  useFormStatus,
} from "react-dom";

import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import {
  changePasswordAction,
  type ChangePasswordActionState,
} from "./actions";

const initialState:
  ChangePasswordActionState =
    {
      error:
        null,
    };

function SubmitButton() {
  const {
    pending,
  } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-semibold text-zinc-950 transition-all hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
          Čuvanje...
        </>
      ) : (
        <>
          Sačuvaj novu lozinku
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </>
      )}
    </button>
  );
}

export default function ChangePasswordForm() {
  const [
    state,
    formAction,
  ] =
    useActionState(
      changePasswordAction,
      initialState
    );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      <PasswordField
        id="new-password"
        name="password"
        label="Nova lozinka"
        autoComplete="new-password"
      />

      <PasswordField
        id="new-password-confirmation"
        name="passwordConfirmation"
        label="Potvrdi novu lozinku"
        autoComplete="new-password"
      />

      <p className="text-xs leading-5 text-zinc-500">
        Koristi najmanje 10 karaktera. Privremena lozinka prestaje da važi odmah nakon uspešne promene.
      </p>

      {state.error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-zinc-200"
      >
        {label}
      </label>

      <div className="relative">
        <LockKeyhole
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        />

        <input
          id={id}
          name={name}
          type="password"
          autoComplete={autoComplete}
          minLength={10}
          required
          className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
        />
      </div>
    </div>
  );
}
