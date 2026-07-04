"use client";

import {
  useState,
} from "react";

import {
  AlertCircle,
  ArrowRight,
  Database,
  FileCheck2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

const BUSINESS_DRAFT_STORAGE_KEY =
  "platform:new-business-draft";

function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

export default function ContinueBusinessProvisioningCard() {
  const router =
    useRouter();

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  function handleContinue() {
    setError(
      null
    );

    const rawDraft =
      window.sessionStorage.getItem(
        BUSINESS_DRAFT_STORAGE_KEY
      );

    if (!rawDraft) {
      setError(
        "Prvo popuni formular i klikni „Pripremi demo paket“."
      );

      return;
    }

    try {
      const parsedDraft:
        unknown =
          JSON.parse(
            rawDraft
          );

      if (
        !isJsonRecord(
          parsedDraft
        ) ||
        !isJsonRecord(
          parsedDraft.business
        ) ||
        !isJsonRecord(
          parsedDraft.provisioning
        )
      ) {
        throw new Error(
          "Draft nema očekivanu strukturu."
        );
      }

      router.push(
        "/platform-admin/businesses/new/provision"
      );
    } catch {
      window.sessionStorage.removeItem(
        BUSINESS_DRAFT_STORAGE_KEY
      );

      setError(
        "Sačuvani draft nije ispravan. Ponovo pripremi demo paket."
      );
    }
  }

  return (
    <section
      className="
        mx-auto
        max-w-7xl
        rounded-3xl
        border
        border-amber-400/20
        bg-amber-400/[0.06]
        p-5
        md:p-7
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div
          className="
            flex
            items-start
            gap-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-amber-300
              text-zinc-950
            "
          >
            <Database
              size={22}
            />
          </div>

          <div>
            <div
              className="
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-amber-200
              "
            >
              <FileCheck2
                size={16}
              />

              Završni korak
            </div>

            <h3
              className="
                mt-2
                text-xl
                font-semibold
              "
            >
              Kreiranje salona u Supabase-u
            </h3>

            <p
              className="
                mt-2
                max-w-3xl
                text-sm
                leading-6
                text-zinc-400
              "
            >
              Nakon što pripremiš demo
              paket, otvori finalni pregled,
              izaberi vremensku zonu i
              potvrdi atomski provisioning.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            handleContinue
          }
          className="
            flex
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
            px-5
            py-3
            text-sm
            font-semibold
            text-zinc-950
            transition
            hover:bg-zinc-200
          "
        >
          Nastavi na kreiranje

          <ArrowRight
            size={17}
          />
        </button>
      </div>

      {error ? (
        <div
          className="
            mt-5
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/[0.08]
            p-4
            text-red-200
          "
        >
          <AlertCircle
            size={19}
            className="
              mt-0.5
              shrink-0
            "
          />

          <p
            className="
              text-sm
              leading-6
            "
          >
            {error}
          </p>
        </div>
      ) : null}
    </section>
  );
}