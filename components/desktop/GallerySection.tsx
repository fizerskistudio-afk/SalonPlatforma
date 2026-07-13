"use client";

import Image from "next/image";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import SectionHeader from "../shared/SectionHeader";

type GallerySectionProps = {
  locale: Locale;
};

export default function GallerySection({
  locale,
}: GallerySectionProps) {
  const {
    gallery,
  } = useCatalogData();

  if (gallery.length === 0) {
    return null;
  }

  return (
    <section
      id="gallery"
      className="mx-auto max-w-7xl px-8 py-24"
    >
      <SectionHeader
        title={
          translations.sections
            .galleryTitle
        }
        subtitle={
          translations.sections
            .gallerySub
        }
        locale={locale}
      />

      <div className="grid auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[200px] md:grid-cols-4">
        {gallery.map(
          (item, index) => {
            const isLarge =
              index === 0;

            return (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-2xl bg-[var(--brand-secondary)] ${
                  isLarge
                    ? "md:row-span-2"
                    : ""
                }`}
              >
                <Image
                  src={item.url}
                  alt={t(
                    item.alt,
                    locale
                  )}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                <div
                  className="absolute inset-0 bg-gradient-to-t from-[var(--brand-text)]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </div>
            );
          }
        )}
      </div>
    </section>
  );
}
