import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const PRICE_TYPES =
  new Set([
    "fixed",
    "from",
    "range",
  ]);

type EntityType =
  | "category"
  | "service";

type RequestBody = {
  businessSlug?: unknown;
  entityType?: unknown;
  currentSlug?: unknown;
  itemSlug?: unknown;
  expectedUpdatedAt?: unknown;
  item?: unknown;
};

type CategoryInput = {
  name?: unknown;
  description?: unknown;
  iconKey?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

type ServiceInput = {
  categoryId?: unknown;
  name?: unknown;
  description?: unknown;
  durationMinutes?: unknown;
  priceType?: unknown;
  priceFrom?: unknown;
  priceTo?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

type NormalizedCategory = {
  name: string;
  description: string;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
};

type NormalizedService = {
  categoryId: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceType:
    | "fixed"
    | "from"
    | "range";
  priceFrom: number;
  priceTo: number | null;
  sortOrder: number;
  isActive: boolean;
};

function isJsonRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function getTrimmedString(
  value: unknown
): string | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  return value.trim();
}

function normalizeOptionalString(
  value: unknown
): string | null {
  const normalized =
    getTrimmedString(
      value
    );

  return normalized &&
    normalized.length > 0
    ? normalized
    : null;
}

function errorResponse(
  status: number,
  message: string,
  code: string
) {
  return NextResponse.json(
    {
      ok: false,
      message,
      code,
    },
    {
      status,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

function normalizeCategory(
  value: unknown
):
  | {
      category:
        NormalizedCategory;
    }
  | {
      error: string;
      code: string;
    } {
  if (
    !isJsonRecord(
      value
    )
  ) {
    return {
      error:
        "Podaci kategorije nisu ispravni.",
      code:
        "INVALID_CATEGORY_DATA",
    };
  }

  const input =
    value as CategoryInput;

  const name =
    getTrimmedString(
      input.name
    );

  const description =
    getTrimmedString(
      input.description
    ) ?? "";

  const iconKey =
    normalizeOptionalString(
      input.iconKey
    );

  if (
    !name ||
    name.length < 2 ||
    name.length > 160
  ) {
    return {
      error:
        "Naziv kategorije mora imati između 2 i 160 karaktera.",
      code:
        "INVALID_CATEGORY_NAME",
    };
  }

  if (
    description.length >
    2000
  ) {
    return {
      error:
        "Opis kategorije može imati najviše 2000 karaktera.",
      code:
        "INVALID_CATEGORY_DESCRIPTION",
    };
  }

  if (
    iconKey &&
    iconKey.length > 100
  ) {
    return {
      error:
        "Icon key može imati najviše 100 karaktera.",
      code:
        "INVALID_CATEGORY_ICON",
    };
  }

  if (
    !Number.isInteger(
      input.sortOrder
    ) ||
    (
      input.sortOrder as number
    ) < 0 ||
    (
      input.sortOrder as number
    ) > 100000
  ) {
    return {
      error:
        "Redosled kategorije nije ispravan.",
      code:
        "INVALID_CATEGORY_SORT_ORDER",
    };
  }

  if (
    typeof input.isActive !==
    "boolean"
  ) {
    return {
      error:
        "Status kategorije nije ispravan.",
      code:
        "INVALID_CATEGORY_STATUS",
    };
  }

  return {
    category: {
      name,
      description,
      iconKey,
      sortOrder:
        input.sortOrder as number,
      isActive:
        input.isActive,
    },
  };
}

function normalizeService(
  value: unknown
):
  | {
      service:
        NormalizedService;
    }
  | {
      error: string;
      code: string;
    } {
  if (
    !isJsonRecord(
      value
    )
  ) {
    return {
      error:
        "Podaci usluge nisu ispravni.",
      code:
        "INVALID_SERVICE_DATA",
    };
  }

  const input =
    value as ServiceInput;

  const categoryId =
    getTrimmedString(
      input.categoryId
    );

  const name =
    getTrimmedString(
      input.name
    );

  const description =
    getTrimmedString(
      input.description
    ) ?? "";

  const priceType =
    getTrimmedString(
      input.priceType
    );

  const priceFrom =
    typeof input.priceFrom ===
      "number"
      ? input.priceFrom
      : Number.NaN;

  const priceTo =
    input.priceTo === null ||
    input.priceTo === "" ||
    typeof input.priceTo ===
      "undefined"
      ? null
      : typeof input.priceTo ===
          "number"
        ? input.priceTo
        : Number.NaN;

  if (
    !categoryId ||
    !UUID_PATTERN.test(
      categoryId
    )
  ) {
    return {
      error:
        "Izabrana kategorija nije ispravna.",
      code:
        "INVALID_SERVICE_CATEGORY",
    };
  }

  if (
    !name ||
    name.length < 2 ||
    name.length > 160
  ) {
    return {
      error:
        "Naziv usluge mora imati između 2 i 160 karaktera.",
      code:
        "INVALID_SERVICE_NAME",
    };
  }

  if (
    description.length >
    3000
  ) {
    return {
      error:
        "Opis usluge može imati najviše 3000 karaktera.",
      code:
        "INVALID_SERVICE_DESCRIPTION",
    };
  }

  if (
    !Number.isInteger(
      input.durationMinutes
    ) ||
    (
      input.durationMinutes as number
    ) < 5 ||
    (
      input.durationMinutes as number
    ) > 1440
  ) {
    return {
      error:
        "Trajanje usluge mora biti između 5 i 1440 minuta.",
      code:
        "INVALID_SERVICE_DURATION",
    };
  }

  if (
    !priceType ||
    !PRICE_TYPES.has(
      priceType
    )
  ) {
    return {
      error:
        "Tip cene usluge nije ispravan.",
      code:
        "INVALID_SERVICE_PRICE_TYPE",
    };
  }

  if (
    !Number.isFinite(
      priceFrom
    ) ||
    priceFrom < 0 ||
    priceFrom > 99999999.99
  ) {
    return {
      error:
        "Početna cena usluge nije ispravna.",
      code:
        "INVALID_SERVICE_PRICE_FROM",
    };
  }

  if (
    priceType === "range"
  ) {
    if (
      priceTo === null ||
      !Number.isFinite(
        priceTo
      ) ||
      priceTo < priceFrom ||
      priceTo > 99999999.99
    ) {
      return {
        error:
          "Krajnja cena mora biti veća ili jednaka početnoj ceni.",
        code:
          "INVALID_SERVICE_PRICE_TO",
      };
    }
  }

  if (
    !Number.isInteger(
      input.sortOrder
    ) ||
    (
      input.sortOrder as number
    ) < 0 ||
    (
      input.sortOrder as number
    ) > 100000
  ) {
    return {
      error:
        "Redosled usluge nije ispravan.",
      code:
        "INVALID_SERVICE_SORT_ORDER",
    };
  }

  if (
    typeof input.isActive !==
    "boolean"
  ) {
    return {
      error:
        "Status usluge nije ispravan.",
      code:
        "INVALID_SERVICE_STATUS",
    };
  }

  return {
    service: {
      categoryId,
      name,
      description,
      durationMinutes:
        input.durationMinutes as number,
      priceType:
        priceType as
          NormalizedService["priceType"],
      priceFrom,
      priceTo:
        priceType === "range"
          ? priceTo
          : null,
      sortOrder:
        input.sortOrder as number,
      isActive:
        input.isActive,
    },
  };
}

function mapRpcError(
  error: {
    code?: string;
    message: string;
  }
) {
  const message =
    error.message;

  if (
    error.code === "23505" ||
    message.includes(
      "CATALOG_SLUG_EXISTS"
    )
  ) {
    return errorResponse(
      409,
      "Stavka sa ovim slugom već postoji u salonu.",
      "CATALOG_SLUG_EXISTS"
    );
  }

  if (
    message.includes(
      "BUSINESS_NOT_FOUND"
    )
  ) {
    return errorResponse(
      404,
      "Salon nije pronađen.",
      "BUSINESS_NOT_FOUND"
    );
  }

  if (
    message.includes(
      "CATEGORY_NOT_FOUND"
    )
  ) {
    return errorResponse(
      404,
      "Kategorija nije pronađena.",
      "CATEGORY_NOT_FOUND"
    );
  }

  if (
    message.includes(
      "SERVICE_NOT_FOUND"
    )
  ) {
    return errorResponse(
      404,
      "Usluga nije pronađena.",
      "SERVICE_NOT_FOUND"
    );
  }

  if (
    message.includes(
      "CATALOG_CONFLICT"
    )
  ) {
    return errorResponse(
      409,
      "Podaci su promenjeni u drugom tabu. Osveži stranicu i pokušaj ponovo.",
      "CATALOG_CONFLICT"
    );
  }

  if (
    message.includes(
      "CATEGORY_HAS_ACTIVE_SERVICES"
    )
  ) {
    return errorResponse(
      409,
      "Kategorija ima aktivne usluge. Prvo deaktiviraj njene usluge.",
      "CATEGORY_HAS_ACTIVE_SERVICES"
    );
  }

  if (
    message.includes(
      "SERVICE_CATEGORY_INACTIVE"
    )
  ) {
    return errorResponse(
      409,
      "Aktivna usluga mora pripadati aktivnoj kategoriji.",
      "SERVICE_CATEGORY_INACTIVE"
    );
  }

  if (
    error.code === "PGRST202" ||
    message.includes(
      "manage_business_catalog"
    )
  ) {
    return errorResponse(
      503,
      "Migracija za upravljanje katalogom još nije aktivirana.",
      "CATALOG_RPC_NOT_AVAILABLE"
    );
  }

  return errorResponse(
    500,
    "Čuvanje kataloga nije uspelo.",
    "CATALOG_SAVE_FAILED"
  );
}

async function handleRequest(
  request: NextRequest,
  mode:
    | "create"
    | "update"
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.catalog.write"
    );

  if (
    !(
      "context" in
      access
    )
  ) {
    if (
      access.status ===
      "unauthenticated"
    ) {
      return errorResponse(
        401,
        "Platform admin sesija nije aktivna.",
        "PLATFORM_ADMIN_UNAUTHENTICATED"
      );
    }

    return errorResponse(
      403,
      "Nemaš dozvolu za upravljanje katalogom.",
      "PLATFORM_ADMIN_FORBIDDEN"
    );
  }

  let bodyValue:
    unknown;

  try {
    bodyValue =
      await request.json();
  } catch {
    return errorResponse(
      400,
      "Request body nije validan JSON.",
      "INVALID_JSON"
    );
  }

  if (
    !isJsonRecord(
      bodyValue
    )
  ) {
    return errorResponse(
      400,
      "Request body mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const body =
    bodyValue as RequestBody;

  const businessSlug =
    getTrimmedString(
      body.businessSlug
    );

  const entityType =
    getTrimmedString(
      body.entityType
    );

  const itemSlug =
    getTrimmedString(
      body.itemSlug
    );

  const currentSlug =
    mode === "update"
      ? getTrimmedString(
          body.currentSlug
        )
      : null;

  if (
    !businessSlug ||
    businessSlug.length > 80 ||
    !SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    return errorResponse(
      400,
      "Slug salona nije ispravan.",
      "INVALID_BUSINESS_SLUG"
    );
  }

  if (
    entityType !== "category" &&
    entityType !== "service"
  ) {
    return errorResponse(
      400,
      "Tip stavke kataloga nije ispravan.",
      "INVALID_ENTITY_TYPE"
    );
  }

  if (
    !itemSlug ||
    itemSlug.length > 100 ||
    !SLUG_PATTERN.test(
      itemSlug
    )
  ) {
    return errorResponse(
      400,
      "Slug stavke nije ispravan.",
      "INVALID_ITEM_SLUG"
    );
  }

  if (
    mode === "update" &&
    (
      !currentSlug ||
      currentSlug.length > 100 ||
      !SLUG_PATTERN.test(
        currentSlug
      )
    )
  ) {
    return errorResponse(
      400,
      "Trenutni slug stavke nije ispravan.",
      "INVALID_CURRENT_SLUG"
    );
  }

  const expectedUpdatedAt =
    mode === "update"
      ? getTrimmedString(
          body.expectedUpdatedAt
        )
      : null;

  if (
    mode === "update" &&
    !expectedUpdatedAt
  ) {
    return errorResponse(
      400,
      "Nedostaje verzija stavke za bezbedno čuvanje.",
      "INVALID_EXPECTED_UPDATED_AT"
    );
  }

  let normalizedItem:
    | NormalizedCategory
    | NormalizedService;

  if (
    entityType ===
    "category"
  ) {
    const categoryResult =
      normalizeCategory(
        body.item
      );

    if (
      "error" in
      categoryResult
    ) {
      return errorResponse(
        400,
        categoryResult.error,
        categoryResult.code
      );
    }

    normalizedItem =
      categoryResult.category;
  } else {
    const serviceResult =
      normalizeService(
        body.item
      );

    if (
      "error" in
      serviceResult
    ) {
      return errorResponse(
        400,
        serviceResult.error,
        serviceResult.code
      );
    }

    normalizedItem =
      serviceResult.service;
  }

  try {
    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } = await supabase.rpc(
      "manage_business_catalog",
      {
        input_payload: {
          mode,
          businessSlug,
          entityType:
            entityType as EntityType,
          currentSlug,
          itemSlug,
          expectedUpdatedAt,
          item:
            normalizedItem,
        },
      }
    );

    if (
      error
    ) {
      console.error(
        "Catalog management RPC failed:",
        error
      );

      return mapRpcError(
        error
      );
    }

    return NextResponse.json(
      {
        ok: true,
        savedBy: {
          userId:
            access.context.userId,
          email:
            access.context.email,
        },
        result:
          data,
      },
      {
        status:
          mode === "create"
            ? 201
            : 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected catalog management error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri čuvanju kataloga.",
      "UNKNOWN_CATALOG_ERROR"
    );
  }
}

export async function POST(
  request: NextRequest
) {
  return handleRequest(
    request,
    "create"
  );
}

export async function PUT(
  request: NextRequest
) {
  return handleRequest(
    request,
    "update"
  );
}
