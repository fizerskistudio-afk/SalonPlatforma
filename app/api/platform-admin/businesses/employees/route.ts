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

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RequestBody = {
  businessSlug?: unknown;
  employeeSlug?: unknown;
  expectedUpdatedAt?: unknown;
  employee?: unknown;
  serviceIds?: unknown;
};

type EmployeeInput = {
  name?: unknown;
  title?: unknown;
  bio?: unknown;
  email?: unknown;
  phone?: unknown;
  imageUrl?: unknown;
  sortOrder?: unknown;
  isActive?: unknown;
};

type EmployeePayload = {
  name: string;
  title: string;
  bio: string;
  email: string | null;
  phone: string | null;
  imageUrl: string | null;
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
  const normalizedValue =
    getTrimmedString(
      value
    );

  return normalizedValue &&
    normalizedValue.length >
      0
    ? normalizedValue
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

function normalizeEmployee(
  value: unknown
):
  | {
      employee:
        EmployeePayload;
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
        "Podaci zaposlenog nisu ispravni.",
      code:
        "INVALID_EMPLOYEE_DATA",
    };
  }

  const input =
    value as EmployeeInput;

  const name =
    getTrimmedString(
      input.name
    );

  const title =
    getTrimmedString(
      input.title
    );

  const bio =
    getTrimmedString(
      input.bio
    ) ?? "";

  const email =
    normalizeOptionalString(
      input.email
    );

  const phone =
    normalizeOptionalString(
      input.phone
    );

  const imageUrl =
    normalizeOptionalString(
      input.imageUrl
    );

  if (
    !name ||
    name.length < 2 ||
    name.length > 120
  ) {
    return {
      error:
        "Ime zaposlenog mora imati između 2 i 120 karaktera.",
      code:
        "INVALID_EMPLOYEE_NAME",
    };
  }

  if (
    !title ||
    title.length < 2 ||
    title.length > 100
  ) {
    return {
      error:
        "Pozicija zaposlenog mora imati između 2 i 100 karaktera.",
      code:
        "INVALID_EMPLOYEE_TITLE",
    };
  }

  if (
    bio.length > 1000
  ) {
    return {
      error:
        "Biografija zaposlenog može imati najviše 1000 karaktera.",
      code:
        "INVALID_EMPLOYEE_BIO",
    };
  }

  if (
    email &&
    (
      email.length > 254 ||
      !EMAIL_PATTERN.test(
        email
      )
    )
  ) {
    return {
      error:
        "Email zaposlenog nije ispravan.",
      code:
        "INVALID_EMPLOYEE_EMAIL",
    };
  }

  if (
    phone &&
    phone.length > 40
  ) {
    return {
      error:
        "Telefon zaposlenog može imati najviše 40 karaktera.",
      code:
        "INVALID_EMPLOYEE_PHONE",
    };
  }

  if (
    imageUrl &&
    (
      imageUrl.length > 2000 ||
      !/^https?:\/\//i.test(
        imageUrl
      )
    )
  ) {
    return {
      error:
        "URL fotografije mora biti puna http ili https adresa.",
      code:
        "INVALID_EMPLOYEE_IMAGE",
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
        "Redosled zaposlenog nije ispravan.",
      code:
        "INVALID_EMPLOYEE_SORT_ORDER",
    };
  }

  if (
    typeof input.isActive !==
    "boolean"
  ) {
    return {
      error:
        "Status zaposlenog nije ispravan.",
      code:
        "INVALID_EMPLOYEE_STATUS",
    };
  }

  return {
    employee: {
      name,
      title,
      bio,
      email,
      phone,
      imageUrl,
      sortOrder:
        input.sortOrder as number,
      isActive:
        input.isActive,
    },
  };
}

function normalizeServiceIds(
  value: unknown
): string[] | null {
  if (
    !Array.isArray(
      value
    )
  ) {
    return null;
  }

  const serviceIds:
    string[] = [];

  const seenIds =
    new Set<string>();

  for (
    const rawServiceId of
    value
  ) {
    const serviceId =
      getTrimmedString(
        rawServiceId
      );

    if (
      !serviceId ||
      !UUID_PATTERN.test(
        serviceId
      ) ||
      seenIds.has(
        serviceId
      )
    ) {
      return null;
    }

    seenIds.add(
      serviceId
    );

    serviceIds.push(
      serviceId
    );
  }

  return serviceIds;
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
      "EMPLOYEE_SLUG_EXISTS"
    )
  ) {
    return errorResponse(
      409,
      "Zaposleni sa ovim slugom već postoji.",
      "EMPLOYEE_SLUG_EXISTS"
    );
  }

  if (
    message.includes(
      "EMPLOYEE_NOT_FOUND"
    )
  ) {
    return errorResponse(
      404,
      "Zaposleni nije pronađen.",
      "EMPLOYEE_NOT_FOUND"
    );
  }

  if (
    message.includes(
      "EMPLOYEE_CONFLICT"
    )
  ) {
    return errorResponse(
      409,
      "Podaci zaposlenog su promenjeni u drugom tabu. Osveži stranicu i pokušaj ponovo.",
      "EMPLOYEE_CONFLICT"
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
      "SERVICE_NOT_FOUND_OR_INACTIVE"
    )
  ) {
    return errorResponse(
      409,
      "Jedna od izabranih usluga više nije aktivna. Osveži stranicu.",
      "SERVICE_NOT_FOUND_OR_INACTIVE"
    );
  }

  if (
    error.code === "PGRST202" ||
    message.includes(
      "manage_business_employee"
    )
  ) {
    return errorResponse(
      503,
      "Migracija za upravljanje zaposlenima još nije aktivirana.",
      "EMPLOYEE_MANAGEMENT_RPC_NOT_AVAILABLE"
    );
  }

  return errorResponse(
    500,
    "Čuvanje zaposlenog nije uspelo.",
    "EMPLOYEE_SAVE_FAILED"
  );
}

async function handleRequest(
  request: NextRequest,
  mode: "create" | "update"
) {
  const access =
    await getPlatformAdminAccess(
      "tenant.team.write"
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
      "Nemaš dozvolu za upravljanje zaposlenima.",
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

  const employeeSlug =
    getTrimmedString(
      body.employeeSlug
    );

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
    !employeeSlug ||
    employeeSlug.length > 80 ||
    !SLUG_PATTERN.test(
      employeeSlug
    )
  ) {
    return errorResponse(
      400,
      "Slug zaposlenog nije ispravan.",
      "INVALID_EMPLOYEE_SLUG"
    );
  }

  const normalizedEmployee =
    normalizeEmployee(
      body.employee
    );

  if (
    "error" in
    normalizedEmployee
  ) {
    return errorResponse(
      400,
      normalizedEmployee.error,
      normalizedEmployee.code
    );
  }

  const serviceIds =
    normalizeServiceIds(
      body.serviceIds
    );

  if (!serviceIds) {
    return errorResponse(
      400,
      "Lista usluga nije ispravna.",
      "INVALID_SERVICE_IDS"
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
    (
      !expectedUpdatedAt ||
      Number.isNaN(
        Date.parse(
          expectedUpdatedAt
        )
      )
    )
  ) {
    return errorResponse(
      400,
      "Verzija podataka zaposlenog nije ispravna.",
      "INVALID_EXPECTED_UPDATED_AT"
    );
  }

  try {
    const supabase =
      createAdminClient();

    const {
      data,
      error,
    } = await supabase.rpc(
      "manage_business_employee",
      {
        input_payload: {
          mode,
          businessSlug,
          employeeSlug,
          ...(expectedUpdatedAt
            ? {
                expectedUpdatedAt,
              }
            : {}),
          employee:
            normalizedEmployee.employee,
          serviceIds,
        },
      }
    );

    if (error) {
      console.error(
        "Employee management RPC failed:",
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
      "Unexpected employee management error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri čuvanju zaposlenog.",
      "UNKNOWN_EMPLOYEE_SAVE_ERROR"
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
