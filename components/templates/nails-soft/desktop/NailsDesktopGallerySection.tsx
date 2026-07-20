"use client";

import Image from "next/image";
import {
  ArrowUpRight,
} from "lucide-react";
import {
  useState,
} from "react";

import {
  t,
} from "@/lib/translations";

import type {
  GalleryItem,
  Locale,
} from "@/lib/types";

import {
  nailsLabels,
} from "../nails-utils";

type NailsDesktopGallerySectionProps = {
  gallery: GalleryItem[];
  locale: Locale;
};

const TILE_CLASSES = [
  "col-span-5 row-span-2 min-h-[480px] rounded-[3.75rem_1.25rem_3.75rem_1.25rem]",
  "col-span-3 min-h-[225px] rounded-[1.25rem_3.25rem_1.25rem_3.25rem]",
  "col-span-4 min-h-[225px] rounded-[3.25rem_1.25rem_3.25rem_1.25rem]",
  "col-span-4 min-h-[235px] rounded-[1.25rem_3.25rem_1.25rem_3.25rem]",
  "col-span-3 min-h-[235px] rounded-[3.25rem_1.25rem_3.25rem_1.25rem]",
  "col-span-4 min-h-[265px] rounded-[3.25rem_1.25rem_3.25rem_1.25rem]",
  "col-span-4 min-h-[265px] rounded-[1.25rem_3.25rem_1.25rem_3.25rem]",
  "col-span-4 min-h-[265px] rounded-[3.25rem_3.25rem_1.25rem_1.25rem]",
] as const;

const EMPTY_SHADES = [
  "#c73670",
  "#ee9eb6",
  "#752c4c",
  "#f2cbd5",
  "#de835d",
  "#9d204e",
  "#e8b3c0",
] as const;

export default function NailsDesktopGallerySection({
  gallery,
  locale,
}: NailsDesktopGallerySectionProps) {
  const [
    activeIndex,
    setActiveIndex,
  ] = useState(
    0
  );
  const activeItem =
    gallery[
      activeIndex
    ] ??
    gallery[0] ??
    null;

  return (
    <section
      id="nails-portfolio"
      className="relative isolate overflow-hidden border-y border-[var(--brand-border)] bg-[var(--brand-surface)]"
      data-nails-atelier="lookbook"
    >
      <div className="pointer-events-none absolute -right-48 top-24 h-[36rem] w-[36rem] rounded-full bg-[var(--brand-secondary)]/55 blur-3xl" />

      <div className="relative mx-auto max-w-[1320px] px-8 py-20 xl:px-10 xl:py-24">
        <header className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="inline-flex rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-background)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              {t(
                nailsLabels.lookbookLabel,
                locale
              )}
            </p>

            <h2 className="mt-6 max-w-[12ch] font-display text-[clamp(3.6rem,5.2vw,5.8rem)] font-medium italic leading-[0.86] tracking-[-0.052em]">
              {t(
                nailsLabels.portfolioTitle,
                locale
              )}
            </h2>
          </div>

          <div className="rounded-[2rem_2rem_2rem_0.75rem] bg-[var(--brand-background)] p-6 shadow-sm">
            <p className="text-sm leading-7 text-[var(--brand-muted)]">
              {t(
                nailsLabels.portfolioIntro,
                locale
              )}
            </p>

            {activeItem && (
              <div className="mt-6 flex items-center justify-between gap-5 border-t border-[var(--brand-border)] pt-5">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
                    {t(
                      nailsLabels.lookLabel,
                      locale
                    )}{" "}
                    {String(
                      activeIndex +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </p>

                  <p className="mt-1 font-display text-2xl font-medium italic">
                    {activeItem.category}
                  </p>
                </div>

                <ArrowUpRight
                  className="h-5 w-5 text-[var(--brand-primary)]"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </header>

        {gallery.length >
        0 ? (
          <div className="mt-12 grid grid-cols-12 auto-rows-fr gap-4">
            {gallery.map(
              (
                item,
                index
              ) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  onMouseEnter={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  onFocus={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  aria-pressed={
                    activeItem?.id ===
                    item.id
                  }
                  className={`group relative isolate overflow-hidden bg-[var(--brand-secondary)] text-left shadow-[0_20px_55px_rgba(55,28,42,0.10)] transition-[transform,box-shadow] duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] motion-reduce:transform-none motion-reduce:transition-none ${TILE_CLASSES[index % TILE_CLASSES.length]} ${activeItem?.id === item.id ? "-translate-y-2 shadow-[0_28px_75px_color-mix(in_srgb,var(--brand-primary)_18%,transparent)]" : ""}`}
                >
                  <Image
                    src={item.url}
                    alt={t(
                      item.alt,
                      locale
                    )}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
                    sizes="(max-width: 1200px) 45vw, 640px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-white/5" />

                  <span className="absolute bottom-5 left-5 rounded-full border border-white/30 bg-black/15 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                    {String(
                      index +
                        1
                    ).padStart(
                      2,
                      "0"
                    )}{" · "}{item.category}
                  </span>
                </button>
              )
            )}
          </div>
        ) : (
          <div className="mt-12 grid min-h-[360px] overflow-hidden rounded-[3.25rem_1.25rem_3.25rem_1.25rem] border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-background)] lg:grid-cols-[1fr_280px]">
            <div className="relative flex items-center justify-center overflow-hidden p-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,color-mix(in_srgb,var(--brand-primary)_18%,transparent),transparent_30%),radial-gradient(circle_at_72%_68%,color-mix(in_srgb,var(--brand-secondary)_78%,transparent),transparent_35%)]" />

              <div className="relative flex -rotate-6 items-end gap-3" aria-hidden="true">
                {EMPTY_SHADES.map(
                  (
                    shade,
                    index
                  ) => (
                    <span
                      key={shade}
                      className="rounded-[999px_999px_45%_45%] shadow-[0_18px_35px_rgba(55,28,42,0.16)]"
                      style={{
                        width:
                          `${46 + index * 2}px`,
                        height:
                          `${150 + (index % 3) * 38}px`,
                        backgroundColor:
                          shade,
                      }}
                    />
                  )
                )}
              </div>
            </div>

            <div className="flex items-center bg-[var(--brand-primary)] p-8 text-[var(--brand-background)]">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/60">
                  {t(
                    nailsLabels.lookbookLabel,
                    locale
                  )}
                </p>

                <p className="mt-5 font-display text-3xl font-medium italic leading-tight">
                  {t(
                    nailsLabels.noGallery,
                    locale
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
