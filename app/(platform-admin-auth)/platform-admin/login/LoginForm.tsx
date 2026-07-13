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
  Mail,
} from "lucide-react";

import {
  platformAdminLoginAction,
  type PlatformAdminLoginActionState,
} from "./actions";

const INITIAL_STATE:
  PlatformAdminLoginActionState = {
    error: null,
  };

type PlatformAdminLoginFormProps = {
  next: string;
};

function SubmitButton() {
  const {
    pending,
  } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />

          Prijavljivanje...
        </>
      ) : (
        <>
          Prijavi se

          <ArrowRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </>
      )}
    </button>
  );
}

export default function PlatformAdminLoginForm({
  next,
}: PlatformAdminLoginFormProps) {
  const [
    state,
    formAction,
  ] = useActionState(
    platformAdminLoginAction,
    INITIAL_STATE
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
    >
      <input
        type="hidden"
        name="next"
        value={next}
      />

      <div>
        <label
          htmlFor="platform-admin-email"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Email adresa
        </label>

        <div className="relative">
          <Mail
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />

          <input
            id="platform-admin-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            autoFocus
            aria-describedby={
              state.error
                ? "platform-admin-login-error"
                : undefined
            }
            placeholder="admin@platform.com"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="platform-admin-password"
          className="mb-2 block text-sm font-medium text-zinc-200"
        >
          Lozinka
        </label>

        <div className="relative">
          <LockKeyhole
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />

          <input
            id="platform-admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-describedby={
              state.error
                ? "platform-admin-login-error"
                : undefined
            }
            placeholder="••••••••••••"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.06] py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-zinc-600 hover:border-white/20 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
          />
        </div>
      </div>

      {state.error && (
        <div
          id="platform-admin-login-error"
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
