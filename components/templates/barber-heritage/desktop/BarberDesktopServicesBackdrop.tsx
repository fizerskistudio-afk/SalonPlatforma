"use client";

import { useMemo } from "react";
import type { ServiceCategory } from "@/lib/types";

type CategoryMedia = {
  imageUrl: string;
  imagePosition: string;
  sourcePage: string;
};

const CATEGORY_FALLBACK_MEDIA: readonly CategoryMedia[] = [
  {
    imageUrl: "https://images.unsplash.com/photo-1747830280502-f33d7305a714?auto=format&fit=crop&q=82&w=2400",
    imagePosition: "67% center",
    sourcePage: "https://unsplash.com/photos/dhHnyxdNS0k",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1475669913832-fd187510b578?auto=format&fit=crop&q=82&w=2400",
    imagePosition: "62% center",
    sourcePage: "https://unsplash.com/photos/OnsaUYoFMtA",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1761931403671-d020a14928d9?auto=format&fit=crop&q=82&w=2400",
    imagePosition: "58% center",
    sourcePage: "https://unsplash.com/photos/sdh4g0H-uXg",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1761148438883-e34e0289a214?auto=format&fit=crop&q=82&w=2400",
    imagePosition: "56% center",
    sourcePage: "https://unsplash.com/photos/1Ig9rw7aC5g",
  },
  {
    imageUrl: "https://images.unsplash.com/photo-1647140655311-b36dc374a95a?auto=format&fit=crop&q=82&w=2400",
    imagePosition: "64% center",
    sourcePage: "https://unsplash.com/photos/GlxI6sgPfQ4",
  },
] as const;

const CATEGORY_MEDIA_INDEX_BY_KEYWORD: Readonly<Record<string, number>> = {
  sisanje: 0,
  haircut: 0,
  cutting: 0,
  brada: 1,
  beard: 1,
  moustache: 1,
  kombinovani: 2,
  combined: 2,
  combo: 2,
  paket: 2,
  brijanje: 3,
  shave: 3,
  shaving: 3,
  razor: 3,
  nega: 4,
  care: 4,
  styling: 4,
  tretman: 4,
};

function normalizeSlug(value: string): string {
  return value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getFallbackMedia(category: ServiceCategory, index: number): CategoryMedia {
  const keyword = normalizeSlug(category.slug ?? "")
    .split("-")
    .find((item) => item in CATEGORY_MEDIA_INDEX_BY_KEYWORD);
  const fallbackIndex = keyword
    ? CATEGORY_MEDIA_INDEX_BY_KEYWORD[keyword]
    : index % CATEGORY_FALLBACK_MEDIA.length;
  return CATEGORY_FALLBACK_MEDIA[fallbackIndex] ?? CATEGORY_FALLBACK_MEDIA[0];
}

type Props = {
  activeCategoryId: string;
  categories: ServiceCategory[];
};

export default function BarberDesktopServicesBackdrop({
  activeCategoryId,
  categories,
}: Props) {
  const media = useMemo(
    () =>
      categories.map((category, index) => {
        const fallback = getFallbackMedia(category, index);
        return {
          category,
          fallback,
          imageUrl: category.imageUrl?.trim() || fallback.imageUrl,
          imagePosition:
            category.imagePosition?.trim() || fallback.imagePosition,
        };
      }),
    [categories]
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
      aria-hidden="true"
    >
      {media.map((item) => {
        const active = item.category.id === activeCategoryId;
        const backgroundImage =
          `url(${JSON.stringify(item.imageUrl)}), ` +
          `url(${JSON.stringify(item.fallback.imageUrl)})`;

        return (
          <div
            key={item.category.id}
            data-source-page={item.fallback.sourcePage}
            className={`absolute inset-0 bg-cover bg-no-repeat transition-[opacity,transform,filter] duration-500 ease-out motion-reduce:transition-opacity motion-reduce:duration-150 ${
              active
                ? "scale-100 opacity-100 grayscale-[0.35] saturate-[0.72] brightness-[0.62]"
                : "scale-[1.035] opacity-0 grayscale saturate-50 brightness-50"
            }`}
            style={{
              backgroundImage,
              backgroundPosition: item.imagePosition,
            }}
          />
        );
      })}

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,6,4,0.93)_0%,rgba(7,6,4,0.86)_34%,rgba(7,6,4,0.66)_62%,rgba(7,6,4,0.52)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.24)_56%,rgba(0,0,0,0.58)_100%)]" />
      <div className="absolute inset-0 opacity-[0.055] [background-image:radial-gradient(circle_at_center,white_0.7px,transparent_0.7px)] [background-size:5px_5px]" />
    </div>
  );
}
