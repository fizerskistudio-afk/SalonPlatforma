import {
  randomUUID,
} from "node:crypto";

import {
  type NextRequest,
  NextResponse,
} from "next/server";

import {
  getPlatformAdminAccess,
} from "@/lib/auth/platform-admin";
import {
  BUSINESS_MEDIA_ALLOWED_TYPES,
  BUSINESS_MEDIA_BUCKET,
  BUSINESS_MEDIA_MAX_BYTES,
  type BusinessMediaTarget,
  isBusinessMediaTarget,
} from "@/lib/platform-admin/business-branding";
import {
  createAdminClient,
} from "@/lib/supabase/admin";

export const dynamic =
  "force-dynamic";

export const runtime =
  "nodejs";

const SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const MIME_EXTENSIONS:
  Record<string, string> = {
    "image/jpeg":
      "jpg",
    "image/png":
      "png",
    "image/webp":
      "webp",
    "image/avif":
      "avif",
  };

type BusinessRow = {
  id: string;
  slug: string;
  logo_url:
    | string
    | null;
  hero_image_url:
    | string
    | null;
  updated_at: string;
};

type EmployeeRow = {
  id: string;
  slug: string;
  image_url:
    | string
    | null;
  updated_at: string;
};

type DeleteBody = {
  businessSlug?: unknown;
  target?: unknown;
  employeeSlug?: unknown;
  expectedUpdatedAt?: unknown;
};

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getTrimmedString(
  value: unknown
): string | null {
  return typeof value ===
    "string"
    ? value.trim()
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

async function requireAccess() {
  const access =
    await getPlatformAdminAccess();

  if (
    "context" in access
  ) {
    return null;
  }

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
    "Nemaš dozvolu za upravljanje medijima salona.",
    "PLATFORM_ADMIN_FORBIDDEN"
  );
}

function validateSlug(
  value: unknown,
  label: string
):
  | {
      value: string;
    }
  | {
      response:
        NextResponse;
    } {
  const slug =
    getTrimmedString(
      value
    )?.toLowerCase();

  if (
    !slug ||
    slug.length > 80 ||
    !SLUG_PATTERN.test(
      slug
    )
  ) {
    return {
      response:
        errorResponse(
          400,
          `${label} nije ispravan.`,
          "INVALID_SLUG"
        ),
    };
  }

  return {
    value:
      slug,
  };
}

function getOldUrl(
  target: BusinessMediaTarget,
  business: BusinessRow,
  employee:
    EmployeeRow | null
): string | null {
  switch (target) {
    case "business-logo":
      return (
        business.logo_url
      );

    case "business-hero":
      return (
        business.hero_image_url
      );

    case "employee-image":
      return (
        employee?.image_url ??
        null
      );
  }
}

function getStorageFolder(
  target: BusinessMediaTarget
): string {
  switch (target) {
    case "business-logo":
      return "logo";

    case "business-hero":
      return "hero";

    case "employee-image":
      return "employees";
  }
}

function extractOwnedStoragePath(
  value:
    | string
    | null
): string | null {
  if (!value) {
    return null;
  }

  try {
    const url =
      new URL(value);

    const marker =
      `/storage/v1/object/public/${BUSINESS_MEDIA_BUCKET}/`;

    const markerIndex =
      url.pathname.indexOf(
        marker
      );

    if (
      markerIndex < 0
    ) {
      return null;
    }

    const encodedPath =
      url.pathname.slice(
        markerIndex +
          marker.length
      );

    return encodedPath
      ? decodeURIComponent(
          encodedPath
        )
      : null;
  } catch {
    return null;
  }
}

async function cleanupStoragePath(
  path:
    | string
    | null
): Promise<boolean> {
  if (!path) {
    return true;
  }

  const supabase =
    createAdminClient();

  const {
    error,
  } = await supabase
    .storage
    .from(
      BUSINESS_MEDIA_BUCKET
    )
    .remove([
      path,
    ]);

  if (error) {
    console.error(
      "Business media cleanup failed:",
      {
        path,
        error,
      }
    );

    return false;
  }

  return true;
}

async function loadTargetRows(
  businessSlug: string,
  target: BusinessMediaTarget,
  employeeSlug:
    string | null
):
  Promise<
    | {
        business:
          BusinessRow;
        employee:
          EmployeeRow | null;
      }
    | {
        response:
          NextResponse;
      }
  > {
  const supabase =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await supabase
    .from("businesses")
    .select(
      `
        id,
        slug,
        logo_url,
        hero_image_url,
        updated_at
      `
    )
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load business before media mutation:",
      businessError
    );

    return {
      response:
        errorResponse(
          500,
          "Salon trenutno nije moguće učitati.",
          "BUSINESS_QUERY_FAILED"
        ),
    };
  }

  if (!businessData) {
    return {
      response:
        errorResponse(
          404,
          "Salon nije pronađen.",
          "BUSINESS_NOT_FOUND"
        ),
    };
  }

  const business =
    businessData as
      unknown as
      BusinessRow;

  if (
    target !==
    "employee-image"
  ) {
    return {
      business,
      employee: null,
    };
  }

  if (!employeeSlug) {
    return {
      response:
        errorResponse(
          400,
          "Zaposleni nije izabran.",
          "EMPLOYEE_SLUG_REQUIRED"
        ),
    };
  }

  const {
    data: employeeData,
    error: employeeError,
  } = await supabase
    .from("employees")
    .select(
      `
        id,
        slug,
        image_url,
        updated_at
      `
    )
    .eq(
      "business_id",
      business.id
    )
    .eq(
      "slug",
      employeeSlug
    )
    .maybeSingle();

  if (employeeError) {
    console.error(
      "Failed to load employee before media mutation:",
      employeeError
    );

    return {
      response:
        errorResponse(
          500,
          "Zaposlenog trenutno nije moguće učitati.",
          "EMPLOYEE_QUERY_FAILED"
        ),
    };
  }

  if (!employeeData) {
    return {
      response:
        errorResponse(
          404,
          "Zaposleni nije pronađen.",
          "EMPLOYEE_NOT_FOUND"
        ),
    };
  }

  return {
    business,
    employee:
      employeeData as
        unknown as
        EmployeeRow,
  };
}

async function updateTargetUrl(
  target: BusinessMediaTarget,
  business: BusinessRow,
  employee:
    EmployeeRow | null,
  expectedUpdatedAt: string,
  url:
    | string
    | null
):
  Promise<
    | {
        updatedAt:
          string;
      }
    | {
        response:
          NextResponse;
      }
  > {
  const supabase =
    createAdminClient();

  const updatedAt =
    new Date()
      .toISOString();

  if (
    target ===
      "employee-image"
  ) {
    if (!employee) {
      return {
        response:
          errorResponse(
            404,
            "Zaposleni nije pronađen.",
            "EMPLOYEE_NOT_FOUND"
          ),
      };
    }

    const {
      data,
      error,
    } = await supabase
      .from("employees")
      .update({
        image_url:
          url,
        updated_at:
          updatedAt,
      })
      .eq(
        "id",
        employee.id
      )
      .eq(
        "business_id",
        business.id
      )
      .eq(
        "updated_at",
        expectedUpdatedAt
      )
      .select(
        "updated_at"
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Failed to update employee media URL:",
        error
      );

      return {
        response:
          errorResponse(
            500,
            "Fotografija zaposlenog nije sačuvana.",
            "EMPLOYEE_MEDIA_UPDATE_FAILED"
          ),
      };
    }

    if (!data) {
      return {
        response:
          errorResponse(
            409,
            "Podaci zaposlenog su promenjeni u drugom tabu. Osveži stranicu.",
            "EMPLOYEE_MEDIA_CONFLICT"
          ),
      };
    }

    return {
      updatedAt:
        (
          data as {
            updated_at:
              string;
          }
        ).updated_at,
    };
  }

  const column =
    target ===
      "business-logo"
      ? "logo_url"
      : "hero_image_url";

  const {
    data,
    error,
  } = await supabase
    .from("businesses")
    .update({
      [column]:
        url,
      updated_at:
        updatedAt,
    })
    .eq(
      "id",
      business.id
    )
    .eq(
      "updated_at",
      expectedUpdatedAt
    )
    .select(
      "updated_at"
    )
    .maybeSingle();

  if (error) {
    console.error(
      "Failed to update business media URL:",
      error
    );

    return {
      response:
        errorResponse(
          500,
          "Branding salona nije sačuvan.",
          "BUSINESS_MEDIA_UPDATE_FAILED"
        ),
    };
  }

  if (!data) {
    return {
      response:
        errorResponse(
          409,
          "Podaci salona su promenjeni u drugom tabu. Osveži stranicu.",
          "BUSINESS_MEDIA_CONFLICT"
        ),
    };
  }

  return {
    updatedAt:
      (
        data as {
          updated_at:
            string;
        }
      ).updated_at,
  };
}

function validateTarget(
  value: unknown
):
  | {
      value:
        BusinessMediaTarget;
    }
  | {
      response:
        NextResponse;
    } {
  if (
    !isBusinessMediaTarget(
      value
    )
  ) {
    return {
      response:
        errorResponse(
          400,
          "Tip medija nije ispravan.",
          "INVALID_MEDIA_TARGET"
        ),
    };
  }

  return {
    value,
  };
}

function validateExpectedUpdatedAt(
  value: unknown
):
  | {
      value: string;
    }
  | {
      response:
        NextResponse;
    } {
  const expectedUpdatedAt =
    getTrimmedString(
      value
    );

  if (
    !expectedUpdatedAt ||
    Number.isNaN(
      Date.parse(
        expectedUpdatedAt
      )
    )
  ) {
    return {
      response:
        errorResponse(
          400,
          "Verzija podataka nije ispravna.",
          "INVALID_EXPECTED_UPDATED_AT"
        ),
    };
  }

  return {
    value:
      expectedUpdatedAt,
  };
}

function getEmployeeSlug(
  value: unknown,
  target: BusinessMediaTarget
):
  | {
      value:
        string | null;
    }
  | {
      response:
        NextResponse;
    } {
  if (
    target !==
    "employee-image"
  ) {
    return {
      value: null,
    };
  }

  const result =
    validateSlug(
      value,
      "Slug zaposlenog"
    );

  if (
    "response" in result
  ) {
    return result;
  }

  return {
    value:
      result.value,
  };
}

export async function POST(
  request: NextRequest
) {
  const accessResponse =
    await requireAccess();

  if (accessResponse) {
    return accessResponse;
  }

  let formData:
    FormData;

  try {
    formData =
      await request.formData();
  } catch {
    return errorResponse(
      400,
      "Upload zahtev nije ispravan.",
      "INVALID_MULTIPART_BODY"
    );
  }

  const businessSlugResult =
    validateSlug(
      formData.get(
        "businessSlug"
      ),
      "Slug salona"
    );

  if (
    "response" in
    businessSlugResult
  ) {
    return (
      businessSlugResult
        .response
    );
  }

  const targetResult =
    validateTarget(
      formData.get(
        "target"
      )
    );

  if (
    "response" in
    targetResult
  ) {
    return (
      targetResult.response
    );
  }

  const expectedResult =
    validateExpectedUpdatedAt(
      formData.get(
        "expectedUpdatedAt"
      )
    );

  if (
    "response" in
    expectedResult
  ) {
    return (
      expectedResult
        .response
    );
  }

  const employeeSlugResult =
    getEmployeeSlug(
      formData.get(
        "employeeSlug"
      ),
      targetResult.value
    );

  if (
    "response" in
    employeeSlugResult
  ) {
    return (
      employeeSlugResult
        .response
    );
  }

  const fileValue =
    formData.get(
      "file"
    );

  if (
    !(fileValue instanceof File)
  ) {
    return errorResponse(
      400,
      "Slika nije izabrana.",
      "MEDIA_FILE_REQUIRED"
    );
  }

  if (
    fileValue.size <= 0
  ) {
    return errorResponse(
      400,
      "Izabrani fajl je prazan.",
      "EMPTY_MEDIA_FILE"
    );
  }

  if (
    !BUSINESS_MEDIA_ALLOWED_TYPES.has(
      fileValue.type
    )
  ) {
    return errorResponse(
      415,
      "Dozvoljeni su JPEG, PNG, WebP i AVIF formati.",
      "UNSUPPORTED_MEDIA_TYPE"
    );
  }

  if (
    fileValue.size >
    BUSINESS_MEDIA_MAX_BYTES[
      targetResult.value
    ]
  ) {
    return errorResponse(
      413,
      "Slika je veća od dozvoljene veličine.",
      "MEDIA_FILE_TOO_LARGE"
    );
  }

  const rows =
    await loadTargetRows(
      businessSlugResult.value,
      targetResult.value,
      employeeSlugResult.value
    );

  if (
    "response" in rows
  ) {
    return rows.response;
  }

  const extension =
    MIME_EXTENSIONS[
      fileValue.type
    ];

  if (!extension) {
    return errorResponse(
      415,
      "Format slike nije podržan.",
      "UNSUPPORTED_MEDIA_TYPE"
    );
  }

  const path =
    `${rows.business.slug}/${getStorageFolder(
      targetResult.value
    )}/${randomUUID()}.${extension}`;

  const supabase =
    createAdminClient();

  let fileBuffer:
    ArrayBuffer;

  try {
    fileBuffer =
      await fileValue
        .arrayBuffer();
  } catch {
    return errorResponse(
      400,
      "Slika nije mogla da se pročita.",
      "MEDIA_FILE_READ_FAILED"
    );
  }

  const {
    error: uploadError,
  } = await supabase
    .storage
    .from(
      BUSINESS_MEDIA_BUCKET
    )
    .upload(
      path,
      fileBuffer,
      {
        contentType:
          fileValue.type,
        cacheControl:
          "3600",
        upsert:
          false,
      }
    );

  if (uploadError) {
    console.error(
      "Business media upload failed:",
      uploadError
    );

    const errorText =
      uploadError.message
        .toLowerCase();

    if (
      errorText.includes(
        "bucket"
      ) &&
      errorText.includes(
        "not"
      )
    ) {
      return errorResponse(
        503,
        "Storage migracija za medije još nije aktivirana.",
        "MEDIA_BUCKET_NOT_READY"
      );
    }

    return errorResponse(
      500,
      "Slika nije mogla da se otpremi.",
      "MEDIA_UPLOAD_FAILED"
    );
  }

  const {
    data: publicUrlData,
  } = supabase
    .storage
    .from(
      BUSINESS_MEDIA_BUCKET
    )
    .getPublicUrl(
      path
    );

  const publicUrl =
    publicUrlData
      .publicUrl;

  const updateResult =
    await updateTargetUrl(
      targetResult.value,
      rows.business,
      rows.employee,
      expectedResult.value,
      publicUrl
    );

  if (
    "response" in
    updateResult
  ) {
    await cleanupStoragePath(
      path
    );

    return (
      updateResult.response
    );
  }

  const oldUrl =
    getOldUrl(
      targetResult.value,
      rows.business,
      rows.employee
    );

  const oldPath =
    extractOwnedStoragePath(
      oldUrl
    );

  const cleanupSucceeded =
    !oldPath ||
    oldPath === path ||
    await cleanupStoragePath(
      oldPath
    );

  return NextResponse.json(
    {
      ok: true,
      message:
        cleanupSucceeded
          ? "Slika je uspešno sačuvana."
          : "Slika je sačuvana, ali stari fajl nije uklonjen iz Storage-a.",
      result: {
        target:
          targetResult.value,
        employeeSlug:
          employeeSlugResult.value,
        url:
          publicUrl,
        updatedAt:
          updateResult.updatedAt,
        cleanupWarning:
          !cleanupSucceeded,
      },
    },
    {
      status: 201,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}

export async function DELETE(
  request: NextRequest
) {
  const accessResponse =
    await requireAccess();

  if (accessResponse) {
    return accessResponse;
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

  if (!isRecord(bodyValue)) {
    return errorResponse(
      400,
      "Request body mora biti JSON objekat.",
      "INVALID_REQUEST_BODY"
    );
  }

  const body =
    bodyValue as
      DeleteBody;

  const businessSlugResult =
    validateSlug(
      body.businessSlug,
      "Slug salona"
    );

  if (
    "response" in
    businessSlugResult
  ) {
    return (
      businessSlugResult
        .response
    );
  }

  const targetResult =
    validateTarget(
      body.target
    );

  if (
    "response" in
    targetResult
  ) {
    return (
      targetResult.response
    );
  }

  const expectedResult =
    validateExpectedUpdatedAt(
      body.expectedUpdatedAt
    );

  if (
    "response" in
    expectedResult
  ) {
    return (
      expectedResult
        .response
    );
  }

  const employeeSlugResult =
    getEmployeeSlug(
      body.employeeSlug,
      targetResult.value
    );

  if (
    "response" in
    employeeSlugResult
  ) {
    return (
      employeeSlugResult
        .response
    );
  }

  const rows =
    await loadTargetRows(
      businessSlugResult.value,
      targetResult.value,
      employeeSlugResult.value
    );

  if (
    "response" in rows
  ) {
    return rows.response;
  }

  const oldUrl =
    getOldUrl(
      targetResult.value,
      rows.business,
      rows.employee
    );

  if (!oldUrl) {
    const unchangedUpdatedAt =
      targetResult.value ===
        "employee-image"
        ? rows.employee
            ?.updated_at ??
          expectedResult.value
        : rows.business
            .updated_at;

    return NextResponse.json(
      {
        ok: true,
        message:
          "Slika je već uklonjena.",
        result: {
          target:
            targetResult.value,
          employeeSlug:
            employeeSlugResult.value,
          url: null,
          updatedAt:
            unchangedUpdatedAt,
          cleanupWarning:
            false,
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  }

  const updateResult =
    await updateTargetUrl(
      targetResult.value,
      rows.business,
      rows.employee,
      expectedResult.value,
      null
    );

  if (
    "response" in
    updateResult
  ) {
    return (
      updateResult.response
    );
  }

  const oldPath =
    extractOwnedStoragePath(
      oldUrl
    );

  const cleanupSucceeded =
    await cleanupStoragePath(
      oldPath
    );

  return NextResponse.json(
    {
      ok: true,
      message:
        cleanupSucceeded
          ? "Slika je uklonjena."
          : "Slika je uklonjena sa profila, ali stari fajl nije uklonjen iz Storage-a.",
      result: {
        target:
          targetResult.value,
        employeeSlug:
          employeeSlugResult.value,
        url: null,
        updatedAt:
          updateResult.updatedAt,
        cleanupWarning:
          !cleanupSucceeded,
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control":
          "no-store",
      },
    }
  );
}
