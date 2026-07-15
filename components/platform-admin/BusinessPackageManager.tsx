"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  LoaderCircle,
  PackageCheck,
} from "lucide-react";

import {
  PRODUCT_PACKAGE_KEYS,
  PRODUCT_PACKAGES,
  type ProductPackageKey,
} from "@/lib/product-packages/registry";
import {
  usePlatformAdminAccess,
} from "./PlatformAdminAccessProvider";

type PackageApiResponse = {
  ok?: boolean;
  message?: string;
  business?: {
    packageKey?:
      ProductPackageKey | null;
    packageContractVersion?:
      number | null;
    packageAssignedAt?:
      string | null;
    packageAssignedByUserId?:
      string | null;
    updatedAt?:
      string;
  };
};

function formatPrice(
  value: number | null
): string {
  if (value === null) {
    return "Po ponudi";
  }

  return new Intl.NumberFormat(
    "sr-Latn-RS",
    {
      style: "currency",
      currency: "RSD",
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function formatAssignedAt(
  value: string | null
): string {
  if (!value) {
    return "Nije dodeljen";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(date);
}

export default function BusinessPackageManager({
  businessSlug,
  initialPackageKey,
  initialContractVersion,
  initialAssignedAt,
  initialRequiresAttention,
  expectedUpdatedAt,
}: {
  businessSlug: string;
  initialPackageKey:
    ProductPackageKey | null;
  initialContractVersion:
    number | null;
  initialAssignedAt:
    string | null;
  initialRequiresAttention:
    boolean;
  expectedUpdatedAt: string;
}) {
  const platformAccess =
    usePlatformAdminAccess();

  const canWrite =
    platformAccess.permissions.includes(
      "tenant.package.write"
    );

  const [
    packageKey,
    setPackageKey,
  ] = useState<ProductPackageKey | null>(
    initialPackageKey
  );

  const [
    selectedPackageKey,
    setSelectedPackageKey,
  ] = useState<ProductPackageKey>(
    initialPackageKey ??
      "digital_studio"
  );

  const [
    contractVersion,
    setContractVersion,
  ] = useState<number | null>(
    initialContractVersion
  );

  const [
    assignedAt,
    setAssignedAt,
  ] = useState<string | null>(
    initialAssignedAt
  );

  const [
    version,
    setVersion,
  ] = useState(
    expectedUpdatedAt
  );

  const [
    requiresAttention,
    setRequiresAttention,
  ] = useState(
    initialRequiresAttention
  );

  const [
    pending,
    setPending,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const selectedPackage =
    PRODUCT_PACKAGES[
      selectedPackageKey
    ];

  const currentLabel =
    packageKey
      ? PRODUCT_PACKAGES[
          packageKey
        ].name
      : "Legacy full access";

  const currentDetail =
    packageKey
      ? `Contract v${
          contractVersion ??
          "?"
        }`
      : "Paket još nije eksplicitno dodeljen. Postojeće funkcije ostaju dostupne tokom rollout-a.";

  const hasChange =
    packageKey !==
    selectedPackageKey;

  const limitsSummary =
    useMemo(
      () => {
        const staffLimit =
          selectedPackage
            .limits
            .bookableStaff;

        const translationLimit =
          selectedPackage
            .limits
            .aiTranslationRequestsPerMonth;

        const reviewLimit =
          selectedPackage
            .limits
            .aiReviewDraftsPerMonth;

        return [
          staffLimit === null
            ? "Bookable staff: custom"
            : `Bookable staff: ${staffLimit}`,
          translationLimit === null
            ? "AI prevodi: custom"
            : `AI prevodi mesečno: ${translationLimit}`,
          reviewLimit === null
            ? "AI review draftovi: custom"
            : `AI review draftovi mesečno: ${reviewLimit}`,
        ];
      },
      [
        selectedPackage,
      ]
    );

  async function savePackage() {
    if (
      pending ||
      !canWrite ||
      !hasChange
    ) {
      return;
    }

    if (
      !window.confirm(
        `Dodeliti paket „${selectedPackage.name}“ salonu?`
      )
    ) {
      return;
    }

    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/package",
          {
            method:
              "PATCH",
            headers: {
              "Content-Type":
                "application/json",
            },
            cache:
              "no-store",
            body:
              JSON.stringify({
                businessSlug,
                packageKey:
                  selectedPackageKey,
                expectedUpdatedAt:
                  version,
              }),
          }
        );

      const payload =
        await response.json() as
          PackageApiResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        throw new Error(
          payload.message ??
            "Paket nije moguće sačuvati."
        );
      }

      const nextPackageKey =
        payload.business
          ?.packageKey ??
        selectedPackageKey;

      setPackageKey(
        nextPackageKey
      );

      setSelectedPackageKey(
        nextPackageKey
      );

      setContractVersion(
        payload.business
          ?.packageContractVersion ??
          1
      );

      setAssignedAt(
        payload.business
          ?.packageAssignedAt ??
          new Date().toISOString()
      );

      if (
        payload.business
          ?.updatedAt
      ) {
        setVersion(
          payload.business
            .updatedAt
        );
      }

      setRequiresAttention(
        false
      );

      setMessage(
        payload.message ??
          "Paket salona je sačuvan."
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Paket nije moguće sačuvati."
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-7 rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-300">
            <PackageCheck
              size={16}
              aria-hidden="true"
            />
            Komercijalni paket
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight">
            {currentLabel}
          </h2>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {currentDetail}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            Poslednja dodela:{" "}
            {formatAssignedAt(
              assignedAt
            )}
          </p>

          {requiresAttention ? (
            <p className="mt-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 text-sm text-amber-100">
              Package metadata zahteva pažnju. Sačuvaj validan paket da bi se assignment contract normalizovao.
            </p>
          ) : null}
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 xl:max-w-md">
          <label
            className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400"
            htmlFor="business-package"
          >
            Izaberi paket
          </label>

          <select
            id="business-package"
            value={
              selectedPackageKey
            }
            onChange={(
              event
            ) => {
              setSelectedPackageKey(
                event.target
                  .value as
                  ProductPackageKey
              );
              setMessage(null);
              setError(null);
            }}
            disabled={
              pending ||
              !canWrite
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-300/50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {PRODUCT_PACKAGE_KEYS.map(
              (key) => (
                <option
                  key={key}
                  value={key}
                >
                  {
                    PRODUCT_PACKAGES[
                      key
                    ].name
                  }
                </option>
              )
            )}
          </select>

          <div className="mt-4">
            <p className="text-lg font-semibold text-white">
              {formatPrice(
                selectedPackage
                  .monthlyPriceRsd
              )}
              {selectedPackage
                .monthlyPriceRsd !==
              null
                ? " / mesečno"
                : ""}
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Setup:{" "}
              {formatPrice(
                selectedPackage
                  .setupPriceRsd
              )}
            </p>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {
                selectedPackage
                  .shortDescription
              }
            </p>

            <ul className="mt-3 space-y-1 text-xs text-zinc-500">
              {limitsSummary.map(
                (limit) => (
                  <li key={limit}>
                    {limit}
                  </li>
                )
              )}
            </ul>
          </div>

          {message ? (
            <p className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-2 text-sm text-emerald-200">
              {message}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 rounded-xl border border-red-300/20 bg-red-300/[0.06] px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={
              savePackage
            }
            disabled={
              pending ||
              !canWrite ||
              !hasChange
            }
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
                aria-hidden="true"
              />
            ) : null}
            {pending
              ? "Čuvanje..."
              : "Sačuvaj paket"}
          </button>

          {!canWrite ? (
            <p className="mt-3 text-xs leading-5 text-zinc-500">
              Tvoja platform-admin rola ima read-only pristup package informacijama.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
