"use client";

import { useActionState } from "react";
import {
  ArrowRight,
  Building2,
} from "lucide-react";

import type { AdminTenantOption } from "@/lib/auth/admin-tenants";

import {
  selectBusinessAction,
  type SelectBusinessActionState,
} from "./actions";

const initialState: SelectBusinessActionState = {
  error: null,
};

const roleLabels = {
  owner: "Vlasnik",
  manager: "Menadžer",
} as const;

export default function BusinessSelector({
  tenants,
}: {
  tenants: AdminTenantOption[];
}) {
  const [state, formAction, pending] =
    useActionState(
      selectBusinessAction,
      initialState
    );

  return (
    <div className="grid gap-3">
      {state.error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      {tenants.map((tenant) => (
        <form
          key={tenant.membershipId}
          action={formAction}
        >
          <input
            type="hidden"
            name="businessId"
            value={tenant.businessId}
          />

          <button
            type="submit"
            disabled={pending}
            className="group flex min-h-20 w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-amber-300/40 hover:bg-amber-300/[0.06] focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:cursor-wait disabled:opacity-60"
          >
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-300">
              <Building2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-white">
                {tenant.businessName}
              </span>
              <span className="mt-1 block truncate text-xs text-zinc-500">
                {roleLabels[tenant.role]} · /
                {tenant.businessSlug}
              </span>
            </span>

            <ArrowRight
              className="h-5 w-5 flex-shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-amber-300"
              aria-hidden="true"
            />
          </button>
        </form>
      ))}
    </div>
  );
}
