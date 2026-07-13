"use client";

import {
  useRef,
  useState,
} from "react";

import {
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";

type BusinessPublicLinkActionsProps = {
  publicUrl: string;
  isActive: boolean;
};

function copyWithFallback(
  value: string
): boolean {
  const textarea =
    document.createElement(
      "textarea"
    );
  textarea.value = value;
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

export default function BusinessPublicLinkActions({
  publicUrl,
  isActive,
}: BusinessPublicLinkActionsProps) {
  const [
    copied,
    setCopied,
  ] = useState(false);
  const resetTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(
      null
    );

  const getAbsolutePublicUrl =
    () =>
      publicUrl.startsWith("http://") ||
      publicUrl.startsWith("https://")
        ? publicUrl
        : new URL(
            publicUrl,
            window.location.origin
          ).toString();

  const handleCopy =
    async () => {
      if (!isActive) {
        return;
      }

      const resolvedUrl =
        getAbsolutePublicUrl();
      let copySucceeded =
        false;

      try {
        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator.clipboard
            .writeText(
              resolvedUrl
            );
          copySucceeded = true;
        } else {
          copySucceeded =
            copyWithFallback(
              resolvedUrl
            );
        }
      } catch {
        copySucceeded =
          copyWithFallback(
            resolvedUrl
          );
      }

      if (!copySucceeded) {
        return;
      }

      setCopied(true);

      if (resetTimerRef.current) {
        clearTimeout(
          resetTimerRef.current
        );
      }

      resetTimerRef.current =
        setTimeout(
          () =>
            setCopied(false),
          1800
        );
    };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
        Canonical javni URL
      </p>
      <p
        className={[
          "mt-2 break-all text-sm",
          isActive
            ? "text-zinc-300"
            : "text-zinc-500",
        ].join(" ")}
      >
        {publicUrl}
      </p>

      {
        isActive ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={
                handleCopy
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              {
                copied ? (
                  <Check
                    size={17}
                    className="text-emerald-300"
                  />
                ) : (
                  <Copy size={17} />
                )
              }
              {copied ? "Kopirano" : "Kopiraj link"}
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              <ExternalLink size={17} />
              Otvori javni sajt
            </a>
          </div>
        ) : (
          <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
            Javni URL postoji, ali sajt nije dostupan dok lifecycle status nije Published.
          </p>
        )
      }

      <span
        aria-live="polite"
        className="sr-only"
      >
        {copied ? "Javni URL je kopiran." : ""}
      </span>
    </section>
  );
}
