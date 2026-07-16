"use client";

import Image from "next/image";

import {
  t,
  translations,
} from "@/lib/translations";

import type {
  GalleryItem,
  Locale,
} from "@/lib/types";

import {
  editorialLabels,
} from "../editorial-utils";

type EditorialMobileGallerySectionProps = {
  gallery: GalleryItem[];
  locale: Locale;
};

export default function EditorialMobileGallerySection({
  gallery,
  locale,
}: EditorialMobileGallerySectionProps) {
  return (
    <section
      id="editorial-mobile-gallery"
      className="border-y border-[var(--brand-border)] bg-[var(--brand-surface)] px-3 py-12"
    >
      <div className="px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
          03 /{" "}
          {t(
            translations.nav.gallery,
            locale
          )}
        </p>

        <h2 className="font-display mt-4 text-4xl font-medium leading-[0.95] tracking-[-0.035em]">
          {t(
            editorialLabels
              .selectedWork,
            locale
          )}
        </h2>
      </div>

      {gallery.length >
      0 ? (
        <div className="mt-8 grid grid-cols-2 gap-2">
          {gallery.map(
            (
              item,
              index
            ) => (
              <figure
                key={item.id}
                className={`relative overflow-hidden rounded-[1.35rem] bg-[var(--brand-secondary)] ${
                  index === 0 ||
                  index === 5
                    ? "col-span-2 aspect-[16/10]"
                    : "aspect-[4/5]"
                }`}
              >
                <Image
                  src={item.url}
                  alt={t(
                    item.alt,
                    locale
                  )}
                  fill
                  className="object-cover"
                  sizes={
                    index === 0 ||
                    index === 5
                      ? "100vw"
                      : "50vw"
                  }
                />

                <figcaption className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                  {item.category}
                </figcaption>
              </figure>
            )
          )}
        </div>
      ) : (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-[var(--brand-border)] px-5 py-12 text-center text-sm text-[var(--brand-muted)]">
          {t(
            editorialLabels.noGallery,
            locale
          )}
        </div>
      )}
    </section>
  );
}
