import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  LockKeyhole,
} from "lucide-react";

import type {
  ProductFeatureKey,
} from "@/lib/product-packages/gates";
import type {
  ProductPackageKey,
} from "@/lib/product-packages/registry";
import {
  getProductFeatureUpgradeGuidance,
} from "@/lib/product-packages/upgrade-guidance";

export default function StaffProductFeatureUpgradeNotice({
  featureKey,
  currentPackageKey,
}: {
  featureKey:
    ProductFeatureKey;
  currentPackageKey:
    ProductPackageKey | null;
}) {
  const guidance =
    getProductFeatureUpgradeGuidance({
      audience:
        "staff",
      featureKey,
      currentPackageKey,
    });

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-blue-400/15 bg-gradient-to-br from-blue-400/[0.08] via-white/[0.035] to-transparent p-6 shadow-2xl sm:p-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-300 text-zinc-950 shadow-lg shadow-blue-300/10">
          <LockKeyhole
            className="h-6 w-6"
            aria-hidden="true"
          />
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
          {guidance.eyebrow}
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          {guidance.featureLabel}
        </h1>

        <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
          {
            guidance
              .featureDescription
          }
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
              {
                guidance
                  .currentPackageCaption
              }
            </p>

            <p className="mt-2 text-lg font-semibold text-zinc-200">
              {
                guidance
                  .currentPackageLabel
              }
            </p>
          </div>

          <div className="rounded-2xl border border-blue-300/15 bg-blue-300/[0.06] p-4">
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200">
              <CalendarDays
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              {
                guidance
                  .requiredPackageCaption
              }
            </p>

            <p className="mt-2 text-lg font-semibold text-white">
              {
                guidance
                  .requiredPackageLabel
              }
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-zinc-500">
          {
            guidance
              .continuityNote
          }
        </p>

        <Link
          href="/staff"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-zinc-300 transition hover:border-blue-300/30 hover:bg-blue-300/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />
          Nazad na staff dashboard
        </Link>
      </section>
    </div>
  );
}
