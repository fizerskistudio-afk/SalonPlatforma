"use client";

import Image from "next/image";

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

type NailsMobileGallerySectionProps = {
  gallery: GalleryItem[];
  locale: Locale;
};

const EMPTY_SHADES = [
  "#c4326d",
  "#ee9db6",
  "#752b4a",
  "#e98b6c",
  "#a52054",
] as const;

export default function NailsMobileGallerySection({
  gallery,
  locale,
}: NailsMobileGallerySectionProps) {
  return (
    <section
      id="nails-mobile-portfolio"
      className="min-h-full border-y border-[var(--brand-border)] bg-[var(--brand-surface)] py-9"
      data-nails-atelier="mobile-lookbook"
    >
      <header className="px-5">
        <p className="inline-flex rounded-full border border-[var(--brand-primary)]/20 bg-[var(--brand-background)] px-3.5 py-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--brand-primary)]">
          {t(
            nailsLabels.lookbookLabel,
            locale
          )}
        </p>

        <h2 className="mt-4 max-w-[11ch] font-display text-[2.45rem] font-medium italic leading-[0.88] tracking-[-0.05em]">
          {t(
            nailsLabels.portfolioTitle,
            locale
          )}
        </h2>

        <p className="mt-4 text-[13px] leading-5 text-[var(--brand-muted)]">
          {t(
            nailsLabels.portfolioIntro,
            locale
          )}
        </p>
      </header>

      {gallery.length >
      0 ? (
        <>
          <div className="no-scrollbar mt-6 flex snap-x snap-mandatory items-start gap-3 overflow-x-auto px-3 pb-4">
            {gallery.map(
              (
                item,
                index
              ) => (
                <figure
                  key={item.id}
                  className={`relative shrink-0 snap-center overflow-hidden bg-[var(--brand-secondary)] shadow-[0_18px_45px_rgba(55,28,42,0.14)] ${index % 2 === 0 ? "mt-0 aspect-[4/5] w-[72vw] max-w-[320px] rounded-[3.5rem_1rem_3.5rem_1rem]" : "mt-12 aspect-[3/4] w-[62vw] max-w-[280px] rounded-[1rem_3.5rem_1rem_3.5rem]"}`}
                >
                  <Image
                    src={item.url}
                    alt={t(
                      item.alt,
                      locale
                    )}
                    fill
                    className="object-cover"
                    sizes="72vw"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

                  <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-white/65">
                      {t(
                        nailsLabels.lookLabel,
                        locale
                      )}{" "}
                      {String(
                        index +
                          1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </p>

                    <p className="mt-1 font-display text-2xl font-medium italic">
                      {item.category}
                    </p>
                  </figcaption>
                </figure>
              )
            )}
          </div>

          <p className="px-5 text-[8px] font-semibold uppercase tracking-[0.17em] text-[var(--brand-primary)]">
            {t(
              nailsLabels.swipeLooks,
              locale
            )}
          </p>
        </>
      ) : (
        <div className="mx-3 mt-6 overflow-hidden rounded-[3rem_1rem_3rem_1rem] border border-dashed border-[var(--brand-primary)]/25 bg-[var(--brand-background)] p-6">
          <div className="flex items-end justify-center gap-2" aria-hidden="true">
            {EMPTY_SHADES.map(
              (
                shade,
                index
              ) => (
                <span
                  key={shade}
                  className="rounded-[999px_999px_45%_45%] shadow-lg"
                  style={{
                    width:
                      `${34 + index * 2}px`,
                    height:
                      `${105 + (index % 2) * 28}px`,
                    backgroundColor:
                      shade,
                  }}
                />
              )
            )}
          </div>

          <p className="mt-7 text-center font-display text-2xl font-medium italic leading-tight text-[var(--brand-muted)]">
            {t(
              nailsLabels.noGallery,
              locale
            )}
          </p>
        </div>
      )}
    </section>
  );
}
