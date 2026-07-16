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

const GALLERY_LAYOUTS = [
  "col-span-7 row-span-3",
  "col-span-5 row-span-2",
  "col-span-5 row-span-2",
  "col-span-4 row-span-2",
  "col-span-4 row-span-2",
  "col-span-4 row-span-2",
] as const;

type EditorialDesktopGallerySectionProps = {
  gallery: GalleryItem[];
  locale: Locale;
};

export default function EditorialDesktopGallerySection({
  gallery,
  locale,
}: EditorialDesktopGallerySectionProps) {
  return (
    <section
      id="editorial-gallery"
      className="border-y border-[var(--brand-border)] bg-[var(--brand-surface)]"
    >
      <div className="mx-auto max-w-[1500px] px-8 py-24 xl:px-12 xl:py-32">
        <div className="grid grid-cols-[0.8fr_1.2fr] items-end gap-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
              03 /{" "}
              {t(
                translations.nav.gallery,
                locale
              )}
            </p>

            <h2 className="font-display mt-6 text-6xl font-medium leading-[0.92] tracking-[-0.04em]">
              {t(
                editorialLabels
                  .selectedWork,
                locale
              )}
            </h2>
          </div>

          <p className="max-w-xl justify-self-end text-right text-base leading-7 text-[var(--brand-muted)]">
            {t(
              editorialLabels
                .galleryIntro,
              locale
            )}
          </p>
        </div>

        {gallery.length >
        0 ? (
          <div className="mt-16 grid auto-rows-[125px] grid-cols-12 gap-4">
            {gallery.map(
              (
                item,
                index
              ) => (
                <figure
                  key={item.id}
                  className={`group relative overflow-hidden rounded-[1.6rem] bg-[var(--brand-secondary)] ${
                    GALLERY_LAYOUTS[
                      index %
                        GALLERY_LAYOUTS.length
                    ]
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={t(
                      item.alt,
                      locale
                    )}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
                    sizes="(max-width: 1200px) 50vw, 900px"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70 transition group-hover:opacity-40 motion-reduce:transition-none" />

                  <figcaption className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
                    {item.category}
                  </figcaption>
                </figure>
              )
            )}
          </div>
        ) : (
          <div className="mt-16 rounded-[2rem] border border-dashed border-[var(--brand-border)] px-8 py-20 text-center text-[var(--brand-muted)]">
            {t(
              editorialLabels.noGallery,
              locale
            )}
          </div>
        )}
      </div>
    </section>
  );
}
