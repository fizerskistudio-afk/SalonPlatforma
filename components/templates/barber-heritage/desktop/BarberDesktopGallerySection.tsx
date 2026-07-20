"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  t,
} from "@/lib/translations";

import type {
  GalleryItem,
  Locale,
  LocalizedText,
} from "@/lib/types";

import {
  barberLabels,
} from "../barber-utils";
import { useBarberSectionReveal } from "./useBarberSectionReveal";

const galleryArchiveLabel = {
  "sr-Latn":
    "Arhiva radova",
  mk:
    "Архива на работи",
  hr:
    "Arhiva radova",
  sq:
    "Arkivi i punëve",
  en:
    "Work archive",
  de:
    "Arbeitsarchiv",
  fr:
    "Archives des réalisations",
} satisfies LocalizedText;

const selectedWorkLabel = {
  "sr-Latn":
    "Odabrani rad",
  mk:
    "Избрана работа",
  hr:
    "Odabrani rad",
  sq:
    "Puna e zgjedhur",
  en:
    "Selected work",
  de:
    "Ausgewählte Arbeit",
  fr:
    "Réalisation sélectionnée",
} satisfies LocalizedText;

type BarberDesktopGallerySectionProps = {
  businessName:
    string;
  gallery:
    GalleryItem[];
  locale:
    Locale;
};

function galleryImageAlt(
  item:
    GalleryItem,
  businessName:
    string,
  locale:
    Locale
): string {
  return (
    t(
      item.alt,
      locale
    ) ||
    `${businessName} — ${t(
      barberLabels.galleryImageAlt,
      locale
    )}`
  );
}

export default function BarberDesktopGallerySection({
  businessName,
  gallery,
  locale,
}: BarberDesktopGallerySectionProps) {
  const galleryItems =
    useMemo(
      () =>
        gallery.filter(
          (
            item
          ) =>
            Boolean(
              item.url?.trim()
            )
        ),
      [
        gallery,
      ]
    );

  const [
    activeGalleryId,
    setActiveGalleryId,
  ] =
    useState(
      () =>
        galleryItems[0]
          ?.id ?? ""
    );

  useEffect(
    () => {
      if (
        galleryItems.length ===
        0
      ) {
        if (
          activeGalleryId
        ) {
          setActiveGalleryId(
            ""
          );
        }

        return;
      }

      const activeStillExists =
        galleryItems.some(
          (
            item
          ) =>
            item.id ===
            activeGalleryId
        );

      if (
        !activeStillExists
      ) {
        setActiveGalleryId(
          galleryItems[0]
            .id
        );
      }
    },
    [
      activeGalleryId,
      galleryItems,
    ]
  );

  const activeItem =
    galleryItems.find(
      (
        item
      ) =>
        item.id ===
        activeGalleryId
    ) ??
    galleryItems[0] ??
    null;

  const activeIndex =
    Math.max(
      0,
      galleryItems.findIndex(
        (
          item
        ) =>
          item.id ===
          activeItem?.id
      )
    );

  const {
    isRevealed,
    sectionRef,
  } =
    useBarberSectionReveal({
      rootMargin:
        "0px 0px -8% 0px",
      threshold:
        0.12,
    });

  return (
    <section
      ref={sectionRef}
      id="gallery"
      data-barber-revealed={
        isRevealed
          ? "true"
          : "false"
      }
      className="relative isolate scroll-mt-20 overflow-hidden border-y border-[var(--brand-border)] bg-[var(--brand-surface)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_9%_15%,color-mix(in_srgb,var(--brand-primary)_9%,transparent),transparent_32%),linear-gradient(180deg,color-mix(in_srgb,var(--brand-background)_42%,transparent),transparent_42%)]" />

      <div className="pointer-events-none absolute -right-10 top-10 font-display text-[18rem] font-semibold leading-none tracking-[-0.09em] text-[var(--brand-primary)]/[0.025]">
        03
      </div>

      <div className="relative mx-auto max-w-[1500px] px-8 py-8 xl:px-12 xl:py-10">
        <header className="grid grid-cols-[minmax(0,0.82fr)_minmax(340px,1.18fr)] items-end gap-8">
          <div className="barber-gallery-enter-left">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
              03 /{" "}
              {t(
                barberLabels.navGallery,
                locale
              )}
            </p>

            <h2 className="mt-4 max-w-[12ch] font-display text-[clamp(3rem,4.15vw,5.2rem)] font-medium leading-[0.88] tracking-[-0.055em]">
              {t(
                barberLabels.galleryTitle,
                locale
              )}
            </h2>
          </div>

          <div className="barber-gallery-enter-right justify-self-end border-l border-[var(--brand-primary)]/55 pl-6">
            <p className="max-w-lg text-xs leading-6 text-[var(--brand-muted)]">
              {t(
                barberLabels.heroEyebrow,
                locale
              )}
            </p>

            <div className="mt-3 flex items-center justify-between gap-6 text-[8px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-muted)]">
              <span>
                {t(
                  selectedWorkLabel,
                  locale
                )}
              </span>

              <span className="tabular-nums text-[var(--brand-primary)]">
                {String(
                  activeIndex +
                    1
                ).padStart(
                  2,
                  "0"
                )}{" "}
                /{" "}
                {String(
                  galleryItems.length
                ).padStart(
                  2,
                  "0"
                )}
              </span>
            </div>
          </div>
        </header>

        {activeItem ? (
          <div className="mt-8 grid items-start gap-4 xl:grid-cols-[minmax(0,1.34fr)_minmax(350px,0.66fr)]">
            <figure className="barber-gallery-stage sticky top-24 isolate h-[calc(90dvh-7.2rem)] min-h-[550px] max-h-[700px] overflow-hidden border border-[var(--brand-border)] bg-[var(--brand-secondary)]">
              {galleryItems.map(
                (
                  item,
                  index
                ) => {
                  const active =
                    item.id ===
                    activeItem.id;

                  return (
                    <div
                      key={
                        item.id
                      }
                      aria-hidden={
                        !active
                      }
                      className={`absolute inset-0 transition-[opacity,transform,filter] duration-700 ease-out motion-reduce:transition-opacity motion-reduce:duration-150 ${
                        active
                          ? "z-10 scale-100 opacity-100 grayscale-0"
                          : "z-0 scale-[1.025] opacity-0 grayscale"
                      }`}
                    >
                      <Image
                        src={
                          item.url
                        }
                        alt={
                          active
                            ? galleryImageAlt(
                                item,
                                businessName,
                                locale
                              )
                            : ""
                        }
                        fill
                        priority={
                          index ===
                          0
                        }
                        sizes="(max-width: 1280px) 66vw, 980px"
                        className="object-cover"
                      />
                    </div>
                  );
                }
              )}

              <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.08)_48%,rgba(0,0,0,0.78)_100%)]" />

              <figcaption className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-6 p-5 xl:p-6">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/60">
                    {t(
                      selectedWorkLabel,
                      locale
                    )}
                  </p>

                  <p className="mt-2 max-w-[30ch] font-display text-[clamp(1.7rem,2.25vw,2.8rem)] font-medium leading-[0.96] tracking-[-0.035em] text-white">
                    {galleryImageAlt(
                      activeItem,
                      businessName,
                      locale
                    )}
                  </p>
                </div>

                <span className="shrink-0 border border-white/20 bg-black/25 px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                  {activeItem.category}
                </span>
              </figcaption>
            </figure>

            <aside
              className="barber-gallery-archive border border-[var(--brand-border)] bg-black/[0.18] p-2.5"
              aria-label={t(
                galleryArchiveLabel,
                locale
              )}
            >
              <div className="flex items-center justify-between border-b border-[var(--brand-border)] px-2 pb-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-muted)]">
                  {t(
                    galleryArchiveLabel,
                    locale
                  )}
                </p>

                <span className="font-display text-lg tabular-nums text-[var(--brand-primary)]">
                  {String(
                    galleryItems.length
                  ).padStart(
                    2,
                    "0"
                  )}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                {galleryItems.map(
                  (
                    item,
                    index
                  ) => {
                    const active =
                      item.id ===
                      activeItem.id;

                    return (
                      <button
                        key={
                          item.id
                        }
                        type="button"
                        aria-pressed={
                          active
                        }
                        aria-label={`${t(
                          selectedWorkLabel,
                          locale
                        )}: ${galleryImageAlt(
                          item,
                          businessName,
                          locale
                        )}`}
                        onClick={() =>
                          setActiveGalleryId(
                            item.id
                          )
                        }
                        onMouseEnter={() =>
                          setActiveGalleryId(
                            item.id
                          )
                        }
                        onFocus={() =>
                          setActiveGalleryId(
                            item.id
                          )
                        }
                        className={`barber-gallery-thumbnail group relative isolate min-h-[148px] overflow-hidden border text-left transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] ${
                          active
                            ? "border-[var(--brand-primary)]"
                            : "border-[var(--brand-border)] hover:border-[var(--brand-primary)]/55"
                        }`}
                      >
                        <Image
                          src={
                            item.url
                          }
                          alt=""
                          fill
                          sizes="(max-width: 1280px) 22vw, 260px"
                          className={`object-cover transition-[transform,filter,opacity] duration-700 ease-out motion-reduce:transition-opacity ${
                            active
                              ? "scale-105 grayscale-0 opacity-100"
                              : "scale-100 grayscale-[0.55] opacity-80 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
                          }`}
                        />

                        <span className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/5 to-transparent" />

                        <span className="absolute left-3 top-3 font-display text-sm tabular-nums text-white/70">
                          {String(
                            index +
                              1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <span className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
                          <span className="line-clamp-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                            {item.category}
                          </span>

                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--brand-primary)] transition-opacity duration-300 ${
                              active
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100"
                            }`}
                          />
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </aside>
          </div>
        ) : (
          <div className="barber-gallery-empty mt-8 flex min-h-[460px] items-center justify-center border border-dashed border-[var(--brand-border)] px-8 text-center text-[var(--brand-muted)]">
            {t(
              barberLabels.galleryEmpty,
              locale
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @media (prefers-reduced-motion: no-preference) {
          .barber-gallery-enter-left,
          .barber-gallery-enter-right,
          .barber-gallery-stage,
          .barber-gallery-archive,
          .barber-gallery-empty {
            transition:
              opacity 760ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 760ms cubic-bezier(0.16, 1, 0.3, 1);
            will-change: opacity, transform;
          }

          [data-barber-revealed="false"]
            .barber-gallery-enter-left {
            opacity: 0;
            transform: translateX(-32px);
          }

          [data-barber-revealed="false"]
            .barber-gallery-enter-right {
            opacity: 0;
            transform: translateX(34px);
          }

          [data-barber-revealed="false"]
            .barber-gallery-stage {
            opacity: 0;
            transform: translateY(28px) scale(0.99);
          }

          [data-barber-revealed="false"]
            .barber-gallery-archive,
          [data-barber-revealed="false"]
            .barber-gallery-empty {
            opacity: 0;
            transform: translateX(30px);
          }

          [data-barber-revealed="true"]
            .barber-gallery-enter-left,
          [data-barber-revealed="true"]
            .barber-gallery-enter-right,
          [data-barber-revealed="true"]
            .barber-gallery-stage,
          [data-barber-revealed="true"]
            .barber-gallery-archive,
          [data-barber-revealed="true"]
            .barber-gallery-empty {
            opacity: 1;
            transform: translateX(0) translateY(0) scale(1);
          }

          .barber-gallery-thumbnail {
            transition:
              opacity 560ms cubic-bezier(0.16, 1, 0.3, 1),
              transform 560ms cubic-bezier(0.16, 1, 0.3, 1),
              border-color 300ms ease;
            will-change: opacity, transform;
          }

          [data-barber-revealed="false"]
            .barber-gallery-thumbnail {
            opacity: 0;
            transform: translateX(24px);
          }

          [data-barber-revealed="true"]
            .barber-gallery-thumbnail {
            opacity: 1;
            transform: translateX(0);
          }

          [data-barber-revealed="true"]
            .barber-gallery-thumbnail:nth-child(1) {
            transition-delay: 150ms;
          }

          [data-barber-revealed="true"]
            .barber-gallery-thumbnail:nth-child(2) {
            transition-delay: 205ms;
          }

          [data-barber-revealed="true"]
            .barber-gallery-thumbnail:nth-child(3) {
            transition-delay: 260ms;
          }

          [data-barber-revealed="true"]
            .barber-gallery-thumbnail:nth-child(4) {
            transition-delay: 315ms;
          }

          [data-barber-revealed="true"]
            .barber-gallery-thumbnail:nth-child(5) {
            transition-delay: 370ms;
          }

          [data-barber-revealed="true"]
            .barber-gallery-thumbnail:nth-child(6) {
            transition-delay: 425ms;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .barber-gallery-enter-left,
          .barber-gallery-enter-right,
          .barber-gallery-stage,
          .barber-gallery-archive,
          .barber-gallery-empty,
          .barber-gallery-thumbnail {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}
