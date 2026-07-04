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

export default function BusinessPublicLinkActions({
  publicPath,
  isActive,
}: BusinessPublicLinkActionsProps) {
  const [
    copied,
    setCopied,
  ] =
    useState(
      false
    );

  const resetTimerRef =
    useRef<
      ReturnType<
        typeof setTimeout
      > | null
    >(
      null
    );

  const handleCopy =
    async () => {
      if (!isActive) {
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

      setCopied(
        true
      );

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
            setCopied(
              false
            );
          },
          1800
        );
    };

  if (!isActive) {
    return (
      <div
        className="
          flex
          w-full
          max-w-md
          flex-col
          gap-3
          xl:w-auto
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
            px-4
            py-3
          "
        >
          <p
            className="
              text-xs
              uppercase
              tracking-wider
              text-zinc-600
            "
          >
            Javni booking link
          </p>

          <p
            className="
              mt-1
              break-all
              text-sm
              text-zinc-500
            "
          >
            {publicPath}
          </p>
        </div>

        <button
          type="button"
          disabled
          className="
            inline-flex
            min-h-11
            cursor-not-allowed
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/10
            px-4
            py-2.5
            text-sm
            font-semibold
            text-zinc-600
          "
        >
          <ExternalLink
            size={17}
          />

          Profil nije aktivan
        </button>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        w-full
        max-w-md
        flex-col
        gap-3
        xl:w-auto
      "
    >
      <div
        className="
          rounded-2xl
          border
          border-white/10
          bg-white/[0.03]
          px-4
          py-3
        "
      >
        <p
          className="
            text-xs
            uppercase
            tracking-wider
            text-zinc-600
          "
        >
          Javni booking link
        </p>

        <p
          className="
            mt-1
            break-all
            text-sm
            text-zinc-300
          "
        >
          {publicPath}
        </p>
      </div>

      <div
        className="
          grid
          gap-3
          sm:grid-cols-2
        "
      >
        <button
          type="button"
          onClick={
            handleCopy
          }
          className="
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-white/10
            px-4
            py-2.5
            text-sm
            font-semibold
            text-zinc-300
            transition
            hover:border-white/20
            hover:text-white
            focus:outline-none
            focus:ring-2
            focus:ring-amber-300
            focus:ring-offset-2
            focus:ring-offset-zinc-950
          "
        >
          {copied ? (
            <Check
              size={17}
              className="
                text-emerald-300
              "
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
          href={
            publicPath
          }
          target="_blank"
          rel="noreferrer"
          className="
            inline-flex
            min-h-11
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-zinc-950
            transition
            hover:bg-zinc-200
            focus:outline-none
            focus:ring-2
            focus:ring-white
            focus:ring-offset-2
            focus:ring-offset-zinc-950
          "
        >
          <ExternalLink
            size={17}
          />

          Otvori profil
        </a>
      </div>
    </div>
  );
}
