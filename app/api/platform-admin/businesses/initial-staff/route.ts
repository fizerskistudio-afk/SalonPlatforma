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

type InitialStaffRequestBody = {
  businessSlug?: unknown;

  employee?: unknown;

  workingHours?: unknown;
};

type EmployeeInput = {
  name?: unknown;
  slug?: unknown;
  title?: unknown;
  bio?: unknown;
  email?: unknown;
  phone?: unknown;
};

type WorkingHourInput = {
  dayOfWeek: number;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
};

type BusinessRow = {
  id: string;
  default_locale: string;

  supported_locales:
    | string[]
    | null;
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

function isValidTime(
  value: string
): boolean {
  return /^\d{2}:\d{2}$/.test(
    value
  );
}

function normalizeWorkingHours(
  value: unknown
): WorkingHourInput[] | null {
  if (
    !Array.isArray(
      value
    ) ||
    value.length !==
      7
  ) {
    return null;
  }

  const normalizedHours:
    WorkingHourInput[] =
      [];

  const usedDays =
    new Set<number>();

  for (
    const rawHour of
    value
  ) {
    if (
      !isJsonRecord(
        rawHour
      )
    ) {
      return null;
    }

    const dayOfWeek =
      rawHour.dayOfWeek;

    const isClosed =
      rawHour.isClosed;

    if (
      !Number.isInteger(
        dayOfWeek
      ) ||
      (
        dayOfWeek as number
      ) < 0 ||
      (
        dayOfWeek as number
      ) > 6 ||
      typeof isClosed !==
        "boolean"
    ) {
      return null;
    }

    if (
      usedDays.has(
        dayOfWeek as number
      )
    ) {
      return null;
    }

    usedDays.add(
      dayOfWeek as number
    );

    const openTime =
      normalizeOptionalString(
        rawHour.openTime
      );

    const closeTime =
      normalizeOptionalString(
        rawHour.closeTime
      );

    if (isClosed) {
      normalizedHours.push({
        dayOfWeek:
          dayOfWeek as number,

        isClosed:
          true,

        openTime:
          null,

        closeTime:
          null,
      });

      continue;
    }

    if (
      !openTime ||
      !closeTime ||
      !isValidTime(
        openTime
      ) ||
      !isValidTime(
        closeTime
      ) ||
      openTime >= closeTime
    ) {
      return null;
    }

    normalizedHours.push({
      dayOfWeek:
        dayOfWeek as number,

      isClosed:
        false,

      openTime,
      closeTime,
    });
  }

  if (
    usedDays.size !==
      7
  ) {
    return null;
  }

  return normalizedHours.sort(
    (
      firstHour,
      secondHour
    ) =>
      firstHour.dayOfWeek -
      secondHour.dayOfWeek
  );
}

function createLocalizedText(
  locales:
    readonly string[],
  value: string
): Record<string, string> {
  return Object.fromEntries(
    locales.map(
      (locale) => [
        locale,
        value,
      ]
    )
  );
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

export async function POST(
  request: NextRequest
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
      "Nemaš dozvolu za podešavanje salona.",
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
    bodyValue as
      InitialStaffRequestBody;

  const businessSlug =
    getTrimmedString(
      body.businessSlug
    );

  if (
    !businessSlug ||
    businessSlug.length >
      80 ||
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
    !isJsonRecord(
      body.employee
    )
  ) {
    return errorResponse(
      400,
      "Podaci zaposlenog nisu ispravni.",
      "INVALID_EMPLOYEE_DATA"
    );
  }

  const employee =
    body.employee as
      EmployeeInput;

  const employeeName =
    getTrimmedString(
      employee.name
    );

  const employeeSlug =
    getTrimmedString(
      employee.slug
    );

  const employeeTitle =
    getTrimmedString(
      employee.title
    );

  const employeeBio =
    getTrimmedString(
      employee.bio
    ) ?? "";

  const employeeEmail =
    normalizeOptionalString(
      employee.email
    );

  const employeePhone =
    normalizeOptionalString(
      employee.phone
    );

  if (
    !employeeName ||
    employeeName.length <
      2 ||
    employeeName.length >
      120
  ) {
    return errorResponse(
      400,
      "Ime zaposlenog mora imati između 2 i 120 karaktera.",
      "INVALID_EMPLOYEE_NAME"
    );
  }

  if (
    !employeeSlug ||
    employeeSlug.length >
      80 ||
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

  if (
    !employeeTitle ||
    employeeTitle.length <
      2 ||
    employeeTitle.length >
      100
  ) {
    return errorResponse(
      400,
      "Naziv pozicije zaposlenog nije ispravan.",
      "INVALID_EMPLOYEE_TITLE"
    );
  }

  if (
    employeeBio.length >
      1000
  ) {
    return errorResponse(
      400,
      "Biografija zaposlenog je predugačka.",
      "INVALID_EMPLOYEE_BIO"
    );
  }

  if (
    employeeEmail &&
    (
      employeeEmail.length >
        254 ||
      !EMAIL_PATTERN.test(
        employeeEmail
      )
    )
  ) {
    return errorResponse(
      400,
      "Email zaposlenog nije ispravan.",
      "INVALID_EMPLOYEE_EMAIL"
    );
  }

  if (
    employeePhone &&
    employeePhone.length >
      40
  ) {
    return errorResponse(
      400,
      "Telefon zaposlenog nije ispravan.",
      "INVALID_EMPLOYEE_PHONE"
    );
  }

  const workingHours =
    normalizeWorkingHours(
      body.workingHours
    );

  if (!workingHours) {
    return errorResponse(
      400,
      "Radno vreme mora sadržati svih sedam dana sa ispravnim vremenima.",
      "INVALID_WORKING_HOURS"
    );
  }

  try {
    const supabase =
      createAdminClient();

    const {
      data: businessData,
      error: businessError,
    } = await supabase
      .from(
        "businesses"
      )
      .select(
        `
          id,
          default_locale,
          supported_locales
        `
      )
      .eq(
        "slug",
        businessSlug
      )
      .maybeSingle();

    if (businessError) {
      console.error(
        "Failed to load business for initial staff:",
        businessError
      );

      return errorResponse(
        500,
        "Nije moguće učitati salon.",
        "BUSINESS_QUERY_FAILED"
      );
    }

    if (!businessData) {
      return errorResponse(
        404,
        "Salon nije pronađen.",
        "BUSINESS_NOT_FOUND"
      );
    }

    const business =
      businessData as
        unknown as
        BusinessRow;

    const locales =
      Array.from(
        new Set(
          [
            business
              .default_locale,

            ...(
              business
                .supported_locales ??
              []
            ),
          ].filter(
            (
              locale
            ): locale is string =>
              typeof locale ===
                "string" &&
              locale.trim()
                .length > 0
          )
        )
      );

    const {
      data,
      error,
    } = await supabase.rpc(
      "configure_initial_business_staff",
      {
        input_payload: {
          businessSlug,

          employee: {
            name:
              employeeName,

            slug:
              employeeSlug,

            title:
              createLocalizedText(
                locales,
                employeeTitle
              ),

            bio:
              createLocalizedText(
                locales,
                employeeBio
              ),

            email:
              employeeEmail,

            phone:
              employeePhone,
          },

          workingHours,
        },
      }
    );

    if (error) {
      console.error(
        "Initial staff RPC failed:",
        error
      );

      if (
        error.code ===
          "23505"
      ) {
        return errorResponse(
          409,
          "Zaposleni sa ovim slugom već postoji.",
          "EMPLOYEE_SLUG_EXISTS"
        );
      }

      if (
        error.message.includes(
          "BUSINESS_ALREADY_HAS_EMPLOYEES"
        )
      ) {
        return errorResponse(
          409,
          "Salon već ima zaposlenog. Ovaj korak služi samo za početnu postavku.",
          "BUSINESS_ALREADY_HAS_EMPLOYEES"
        );
      }

      if (
        error.message.includes(
          "BUSINESS_HAS_NO_ACTIVE_SERVICES"
        )
      ) {
        return errorResponse(
          409,
          "Salon nema aktivne usluge koje možemo povezati sa zaposlenim.",
          "BUSINESS_HAS_NO_ACTIVE_SERVICES"
        );
      }

      if (
        error.message.includes(
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
        error.code ===
          "PGRST202" ||
        error.message.includes(
          "configure_initial_business_staff"
        )
      ) {
        return errorResponse(
          503,
          "Migracija za početnu postavku zaposlenog još nije aktivirana.",
          "INITIAL_STAFF_RPC_NOT_AVAILABLE"
        );
      }

      return errorResponse(
        500,
        "Početna postavka zaposlenog nije uspela.",
        "INITIAL_STAFF_SETUP_FAILED"
      );
    }

    return NextResponse.json(
      {
        ok: true,

        configuredBy: {
          userId:
            access.context
              .userId,

          email:
            access.context
              .email,
        },

        result:
          data,
      },
      {
        status: 201,

        headers: {
          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "Unexpected initial staff setup error:",
      error
    );

    return errorResponse(
      500,
      "Došlo je do neočekivane greške pri postavci zaposlenog.",
      "UNKNOWN_INITIAL_STAFF_ERROR"
    );
  }
}
