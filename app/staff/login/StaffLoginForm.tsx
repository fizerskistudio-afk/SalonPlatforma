"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowRight,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  staffLoginAction,
  type StaffLoginActionState,
} from "./actions";

const initialState: StaffLoginActionState = {
  error: null,
};

function SubmitButton() {
  const { pending } =
    useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          Prijavljivanje...
        </>
      ) : (
        <>
          Otvori moj raspored
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

export default function StaffLoginForm() {
  const [
    state,
    formAction,
  ] = useActionState(
    staffLoginAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Email adresa
        </span>

        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
            aria-hidden="true"
          />

          <input
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            placeholder="zaposleni@salon.rs"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-200">
          Lozinka
        </span>

        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
            aria-hidden="true"
          />

          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••••••"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
          />
        </div>
      </label>

      {state.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {state.error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
