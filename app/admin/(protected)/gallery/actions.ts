"use server";

import {
  revalidatePath,
} from "next/cache";

import {
  LOCALE_CODES,
  type LocaleCode,
} from "@/lib/i18n/locales";
import {
  loadAdminProductFeatureMutationAccess,
} from "@/lib/product-packages/admin-gates-server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  LocalizedText,
} from "@/lib/types";

export type GalleryActionResult = {
  ok: boolean;
  message: string;
  entityId?: string;
};

export type GalleryLocalizedTextInput =
  Partial<
    Record<
      LocaleCode,
      string
    >
  >;

export type CreateGalleryItemInput = {
  path: string;
  category: string;
  alt: GalleryLocalizedTextInput;
};

export type UpdateGalleryItemInput = {
  id: string;
  category: string;
  alt: GalleryLocalizedTextInput;
  isActive: boolean;
};

export type MoveGalleryItemInput = {
  id: string;
  direction:
    | "up"
    | "down";
};

type GalleryIdRow = {
  id: string;
};

type GalleryStorageRow = {
  id: string;
  storage_path: string | null;
};

type GalleryOrderRow = {
  id: string;
  sort_order: number;
  created_at: string;
};

const ASSET_BUCKET =
  "salon-assets";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeCategory(
  value: string
): string {
  const normalized =
    value
      .trim()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .toLocaleLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .replace(
        /-{2,}/g,
        "-"
      );

  return normalized ||
    "general";
}

function normalizeLocalizedText(
  value: GalleryLocalizedTextInput
): LocalizedText {
  const normalized:
    LocalizedText = {
      mk: "",
      sq: "",
      en: "",
    };

  for (
    const locale of
    LOCALE_CODES
  ) {
    const translatedValue =
      value[locale];

    if (
      typeof translatedValue ===
        "string"
    ) {
      normalized[locale] =
        translatedValue.trim();
    }
  }

  return normalized;
}

function localizedTextExceedsLength(
  value: LocalizedText,
  maximumLength: number
): boolean {
  return Object.values(
    value
  ).some(
    (text) =>
      typeof text ===
        "string" &&
      text.length >
        maximumLength
  );
}

function hasLocalizedValue(
  value: LocalizedText
): boolean {
  return Object.values(
    value
  ).some(
    (text) =>
      typeof text ===
        "string" &&
      text.trim().length >
        0
  );
}

function isOwnedGalleryPath(
  path: string,
  businessId: string
): boolean {
  const prefix =
    `${businessId}/gallery/`;

  if (
    !path.startsWith(
      prefix
    )
  ) {
    return false;
  }

  const fileName =
    path.slice(
      prefix.length
    );

  return /^[0-9]+-[0-9a-f-]+\.(jpg|png|webp)$/i.test(
    fileName
  );
}

function refreshGalleryPages() {
  revalidatePath("/");
  revalidatePath(
    "/admin/gallery"
  );
  revalidatePath(
    "/api/catalog"
  );
}

async function removeUploadedFile(
  path: string
) {
  const supabase =
    createAdminClient();

  const {
    error,
  } = await supabase.storage
    .from(ASSET_BUCKET)
    .remove([path]);

  if (error) {
    console.error(
      "Failed to remove gallery file:",
      error
    );
  }
}

export async function createGalleryItemAction(
  input: CreateGalleryItemInput
): Promise<GalleryActionResult> {
  const featureAccess =
    await loadAdminProductFeatureMutationAccess(
      "admin.gallery"
    );

  if (
    !featureAccess
      .allowed
  ) {
    return {
      ok: false,
      message:
        featureAccess.message,
    };
  }

  const admin =
    featureAccess
      .context
      .admin;

  if (
    typeof input.path !==
      "string" ||
    !isOwnedGalleryPath(
      input.path,
      admin.business.id
    )
  ) {
    return {
      ok: false,
      message:
        "Putanja fotografije nije ispravna.",
    };
  }

  const category =
    normalizeCategory(
      input.category
    );

  if (
    category.length >
      80
  ) {
    await removeUploadedFile(
      input.path
    );

    return {
      ok: false,
      message:
        "Kategorija može imati najviše 80 karaktera.",
    };
  }

  const alt =
    normalizeLocalizedText(
      input.alt
    );

  if (
    !hasLocalizedValue(
      alt
    )
  ) {
    await removeUploadedFile(
      input.path
    );

    return {
      ok: false,
      message:
        "Dodaj alternativni opis fotografije na najmanje jednom jeziku.",
    };
  }

  if (
    localizedTextExceedsLength(
      alt,
      300
    )
  ) {
    await removeUploadedFile(
      input.path
    );

    return {
      ok: false,
      message:
        "Alternativni opis može imati najviše 300 karaktera po jeziku.",
    };
  }

  const supabase =
    createAdminClient();

  const {
    data: currentLastItem,
    error: lastItemError,
  } = await supabase
    .from("gallery_items")
    .select(
      "sort_order"
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .order(
      "sort_order",
      {
        ascending: false,
      }
    )
    .limit(1)
    .maybeSingle();

  if (lastItemError) {
    await removeUploadedFile(
      input.path
    );

    return {
      ok: false,
      message:
        "Nije moguće odrediti redosled fotografije.",
    };
  }

  const currentSortOrder =
    typeof currentLastItem?.sort_order ===
      "number"
      ? currentLastItem.sort_order
      : 0;

  const {
    data: publicUrlData,
  } = supabase.storage
    .from(ASSET_BUCKET)
    .getPublicUrl(
      input.path
    );

  const {
    data,
    error,
  } = await supabase
    .from("gallery_items")
    .insert({
      business_id:
        admin.business.id,

      image_url:
        publicUrlData.publicUrl,

      storage_path:
        input.path,

      category,
      alt,

      sort_order:
        currentSortOrder +
        10,

      is_active: true,
    })
    .select("id")
    .single();

  if (
    error ||
    !data
  ) {
    await removeUploadedFile(
      input.path
    );

    console.error(
      "Failed to create gallery item:",
      error
    );

    return {
      ok: false,
      message:
        "Fotografija je uploadovana, ali nije dodata u galeriju.",
    };
  }

  const item =
    data as unknown as GalleryIdRow;

  refreshGalleryPages();

  return {
    ok: true,
    entityId:
      item.id,
    message:
      "Fotografija je dodata u galeriju.",
  };
}

export async function updateGalleryItemAction(
  input: UpdateGalleryItemInput
): Promise<GalleryActionResult> {
  const featureAccess =
    await loadAdminProductFeatureMutationAccess(
      "admin.gallery"
    );

  if (
    !featureAccess
      .allowed
  ) {
    return {
      ok: false,
      message:
        featureAccess.message,
    };
  }

  const admin =
    featureAccess
      .context
      .admin;

  if (
    !UUID_PATTERN.test(
      input.id
    )
  ) {
    return {
      ok: false,
      message:
        "Fotografija nije ispravna.",
    };
  }

  if (
    typeof input.isActive !==
      "boolean"
  ) {
    return {
      ok: false,
      message:
        "Status fotografije nije ispravan.",
    };
  }

  const category =
    normalizeCategory(
      input.category
    );

  if (
    category.length >
      80
  ) {
    return {
      ok: false,
      message:
        "Kategorija može imati najviše 80 karaktera.",
    };
  }

  const alt =
    normalizeLocalizedText(
      input.alt
    );

  if (
    !hasLocalizedValue(
      alt
    )
  ) {
    return {
      ok: false,
      message:
        "Dodaj alternativni opis fotografije na najmanje jednom jeziku.",
    };
  }

  if (
    localizedTextExceedsLength(
      alt,
      300
    )
  ) {
    return {
      ok: false,
      message:
        "Alternativni opis može imati najviše 300 karaktera po jeziku.",
    };
  }

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("gallery_items")
    .update({
      category,
      alt,

      is_active:
        input.isActive,

      updated_at:
        new Date().toISOString(),
    })
    .eq(
      "id",
      input.id
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .select("id")
    .maybeSingle();

  if (
    error ||
    !data
  ) {
    return {
      ok: false,
      message:
        "Promene fotografije nisu sačuvane.",
    };
  }

  const item =
    data as unknown as GalleryIdRow;

  refreshGalleryPages();

  return {
    ok: true,
    entityId:
      item.id,
    message:
      "Fotografija je uspešno sačuvana.",
  };
}

export async function moveGalleryItemAction(
  input: MoveGalleryItemInput
): Promise<GalleryActionResult> {
  const featureAccess =
    await loadAdminProductFeatureMutationAccess(
      "admin.gallery"
    );

  if (
    !featureAccess
      .allowed
  ) {
    return {
      ok: false,
      message:
        featureAccess.message,
    };
  }

  const admin =
    featureAccess
      .context
      .admin;

  if (
    !UUID_PATTERN.test(
      input.id
    ) ||
    (
      input.direction !==
        "up" &&
      input.direction !==
        "down"
    )
  ) {
    return {
      ok: false,
      message:
        "Zahtev za promenu redosleda nije ispravan.",
    };
  }

  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from("gallery_items")
    .select(
      `
        id,
        sort_order,
        created_at
      `
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .order(
      "sort_order",
      {
        ascending: true,
      }
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );

  if (error) {
    return {
      ok: false,
      message:
        "Nije moguće učitati redosled galerije.",
    };
  }

  const items =
    (data ??
      []) as unknown as GalleryOrderRow[];

  const currentIndex =
    items.findIndex(
      (item) =>
        item.id ===
        input.id
    );

  if (
    currentIndex < 0
  ) {
    return {
      ok: false,
      message:
        "Fotografija nije pronađena.",
    };
  }

  const targetIndex =
    input.direction ===
      "up"
      ? currentIndex -
        1
      : currentIndex +
        1;

  if (
    targetIndex < 0 ||
    targetIndex >=
      items.length
  ) {
    return {
      ok: true,
      entityId:
        input.id,
      message:
        "Fotografija je već na krajnjoj poziciji.",
    };
  }

  const reorderedItems =
    [...items];

  [
    reorderedItems[
      currentIndex
    ],
    reorderedItems[
      targetIndex
    ],
  ] = [
    reorderedItems[
      targetIndex
    ],
    reorderedItems[
      currentIndex
    ],
  ];

  for (
    let index = 0;
    index <
    reorderedItems.length;
    index += 1
  ) {
    const item =
      reorderedItems[
        index
      ];

    const {
      error: updateError,
    } = await supabase
      .from("gallery_items")
      .update({
        sort_order:
          (index + 1) *
          10,

        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        item.id
      )
      .eq(
        "business_id",
        admin.business.id
      );

    if (updateError) {
      console.error(
        "Failed to reorder gallery:",
        updateError
      );

      return {
        ok: false,
        message:
          "Redosled galerije nije potpuno sačuvan. Osveži stranicu i pokušaj ponovo.",
      };
    }
  }

  refreshGalleryPages();

  return {
    ok: true,
    entityId:
      input.id,
    message:
      "Redosled galerije je promenjen.",
  };
}

export async function deleteGalleryItemAction(
  id: string
): Promise<GalleryActionResult> {
  const featureAccess =
    await loadAdminProductFeatureMutationAccess(
      "admin.gallery"
    );

  if (
    !featureAccess
      .allowed
  ) {
    return {
      ok: false,
      message:
        featureAccess.message,
    };
  }

  const admin =
    featureAccess
      .context
      .admin;

  if (
    !UUID_PATTERN.test(id)
  ) {
    return {
      ok: false,
      message:
        "Fotografija nije ispravna.",
    };
  }

  const supabase =
    createAdminClient();

  const {
    data,
    error: loadError,
  } = await supabase
    .from("gallery_items")
    .select(
      "id, storage_path"
    )
    .eq(
      "id",
      id
    )
    .eq(
      "business_id",
      admin.business.id
    )
    .maybeSingle();

  if (
    loadError ||
    !data
  ) {
    return {
      ok: false,
      message:
        "Fotografija nije pronađena.",
    };
  }

  const item =
    data as unknown as GalleryStorageRow;

  const {
    error: deleteError,
  } = await supabase
    .from("gallery_items")
    .delete()
    .eq(
      "id",
      item.id
    )
    .eq(
      "business_id",
      admin.business.id
    );

  if (deleteError) {
    return {
      ok: false,
      message:
        "Fotografija nije obrisana iz galerije.",
    };
  }

  if (
    item.storage_path &&
    isOwnedGalleryPath(
      item.storage_path,
      admin.business.id
    )
  ) {
    const {
      error: storageError,
    } = await supabase.storage
      .from(ASSET_BUCKET)
      .remove([
        item.storage_path,
      ]);

    if (storageError) {
      console.error(
        "Gallery row deleted, but file removal failed:",
        storageError
      );
    }
  }

  refreshGalleryPages();

  return {
    ok: true,
    entityId:
      item.id,
    message:
      "Fotografija je obrisana iz galerije.",
  };
}
