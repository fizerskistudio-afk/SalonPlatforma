"use client";

import {
  useRef,
  useState,
} from "react";

import Link from "next/link";

import {
  CalendarClock,
  Check,
  Copy,
  ExternalLink,
  Pencil,
  Scissors,
  UsersRound,
} from "lucide-react";

type BusinessPublicLinkActionsProps = {
  publicPath: string;
  isActive: boolean;
};

function copyWithFallback(
  value: string
): boolean {
  const textarea =
    document.createElement(
      "textarea"
    );

  textarea.value =
    value;

  textarea.setAttribute(
    "readonly",
    ""
  );

  textarea.style.position =
    "fixed";

  textarea.style.opacity =
    "0";

  document.body.appendChild(
    textarea
  );

  textarea.select();

  const copied =
    document.execCommand(
      "copy"
    );

  document.body.removeChild(
    textarea
  );

  return copied;
}

function getBusinessSlug(
  publicPath: string
): string {
  const segments =
    publicPath
      .split("/")
      .filter(Boolean);

  return segments[
    segments.length - 1
  ] ?? "";
}

export default function BusinessPublicLinkActions({
  publicPath,
  isActive,
}: BusinessPublicLinkActionsProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);

  const resetTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(null);

  const businessSlug =
    getBusinessSlug(
      publicPath
    );

  const businessBasePath =
    businessSlug
      ? `/platform-admin/businesses/${businessSlug}`
      : "/platform-admin/businesses";

  const handleCopy =
    async () => {
      if (
        !isActive
      ) {
        return;
      }

      const publicUrl =
        new URL(
          publicPath,
          window.location.origin
        ).toString();

      let copySucceeded =
        false;

      try {
        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator
            .clipboard
            .writeText(
              publicUrl
            );

          copySucceeded =
            true;
        } else {
          copySucceeded =
            copyWithFallback(
              publicUrl
            );
        }
      } catch {
        copySucceeded =
          copyWithFallback(
            publicUrl
          );
      }

      if (
        !copySucceeded
      ) {
        return;
      }

      setCopied(true);

      if (
        resetTimerRef.current
      ) {
        clearTimeout(
          resetTimerRef.current
        );
      }

      resetTimerRef.current =
        setTimeout(
          () => {
            setCopied(false);
          },
          1800
        );
    };

  return (
    <div
      className="flex w-full max-w-3xl flex-col gap-3 xl:w-auto"
    >
      <div
        className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
      >
        <p
          className="text-xs uppercase tracking-wider text-zinc-600"
        >
          Javni booking link
        </p>

        <p
          className={`mt-1 break-all text-sm ${
            isActive
              ? "text-zinc-300"
              : "text-zinc-500"
          }`}
        >
          {publicPath}
        </p>
      </div>

      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        <Link
          href={
            `${businessBasePath}/edit`
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-2.5 text-sm font-semibold text-amber-200 transition hover:border-amber-300/35 hover:bg-amber-300/15 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <Pencil
            size={17}
          />

          Osnovni podaci
        </Link>

        <Link
          href={
            `${businessBasePath}/settings`
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-sky-300/20 bg-sky-300/10 px-4 py-2.5 text-sm font-semibold text-sky-200 transition hover:border-sky-300/35 hover:bg-sky-300/15 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <CalendarClock
            size={17}
          />

          Booking i vreme
        </Link>

        <Link
          href={
            `${businessBasePath}/employees`
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-violet-300/20 bg-violet-300/10 px-4 py-2.5 text-sm font-semibold text-violet-200 transition hover:border-violet-300/35 hover:bg-violet-300/15 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <UsersRound
            size={17}
          />

          Zaposleni
        </Link>

        <Link
          href={
            `${businessBasePath}/catalog`
          }
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-rose-300/20 bg-rose-300/10 px-4 py-2.5 text-sm font-semibold text-rose-200 transition hover:border-rose-300/35 hover:bg-rose-300/15 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          <Scissors
            size={17}
          />

          Katalog
        </Link>
      </div>

      {isActive ? (
        <div
          className="grid gap-3 sm:grid-cols-2"
        >
          <button
            type="button"
            onClick={
              handleCopy
            }
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            {copied ? (
              <Check
                size={17}
                className="text-emerald-300"
              />
            ) : (
              <Copy
                size={17}
              />
            )}

            {copied
              ? "Kopirano"
              : "Kopiraj link"}
          </button>

          <a
            href={publicPath}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
          >
            <ExternalLink
              size={17}
            />

            Otvori profil
          </a>
        </div>
      ) : (
        <button
          type="button"
          disabled
          className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-600"
        >
          <ExternalLink
            size={17}
          />

          Profil nije aktivan
        </button>
      )}
    </div>
  );
}
