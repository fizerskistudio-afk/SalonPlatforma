import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(relativePath) {
  return fs
    .readFileSync(
      path.join(root, relativePath),
      "utf8"
    )
    .replace(/\r\n/g, "\n");
}

function write(relativePath, content) {
  fs.writeFileSync(
    path.join(root, relativePath),
    content,
    "utf8"
  );
}

function replaceOnce(
  source,
  search,
  replacement,
  label
) {
  if (!source.includes(search)) {
    throw new Error(
      `Patch marker not found: ${label}`
    );
  }

  return source.replace(
    search,
    replacement
  );
}

function patchBookingsRoute() {
  const file =
    "app/api/bookings/route.ts";

  let source = read(file);

  if (
    source.includes(
      "booking-address-tenant"
    )
  ) {
    console.log(
      `${file}: already patched`
    );
    return;
  }

  source = replaceOnce(
    source,
    `} from "next/server";\n\nimport { DEFAULT_BUSINESS_SLUG } from "@/lib/business/defaults";`,
    `} from "next/server";\n\nimport {\n  consumeRateLimit,\n  getClientAddress,\n  getRateLimitHeaders,\n} from "@/lib/security/rate-limit";\nimport {\n  readJsonBodyWithLimit,\n} from "@/lib/security/request-body";`,
    "bookings imports"
  );

  source = replaceOnce(
    source,
    `export const revalidate = 0;\n\nconst UUID_PATTERN =`,
    `export const revalidate = 0;\n\nconst MAX_BOOKING_REQUEST_BYTES =\n  16 * 1024;\n\nconst UUID_PATTERN =`,
    "bookings request size constant"
  );

  source = replaceOnce(
    source,
    `function errorResponse(\n  status: number,\n  message: string,\n  code: string\n) {`,
    `function errorResponse(\n  status: number,\n  message: string,\n  code: string,\n  extraHeaders: Record<\n    string,\n    string\n  > = {}\n) {`,
    "bookings error signature"
  );

  source = replaceOnce(
    source,
    `        "Cache-Control":\n          "no-store",\n      },`,
    `        "Cache-Control":\n          "no-store",\n        ...extraHeaders,\n      },`,
    "bookings error headers"
  );

  source = replaceOnce(
    source,
    `    let body: unknown;\n\n    try {\n      body =\n        await request.json();\n    } catch {\n      return errorResponse(\n        400,\n        "Invalid JSON request body.",\n        "INVALID_JSON"\n      );\n    }`,
    `    const bodyResult =\n      await readJsonBodyWithLimit(\n        request,\n        MAX_BOOKING_REQUEST_BYTES\n      );\n\n    if (!bodyResult.ok) {\n      return errorResponse(\n        bodyResult.status,\n        bodyResult.message,\n        bodyResult.code\n      );\n    }\n\n    const body =\n      bodyResult.value;`,
    "bookings body parsing"
  );

  source = replaceOnce(
    source,
    `    const businessSlug =\n      optionalTrimmedString(\n        body.businessSlug\n      ) ??\n      DEFAULT_BUSINESS_SLUG;`,
    `    const businessSlug =\n      optionalTrimmedString(\n        body.businessSlug\n      );`,
    "bookings required slug"
  );

  source = replaceOnce(
    source,
    `    if (\n      !SLUG_PATTERN.test(\n        businessSlug\n      )\n    ) {\n      return errorResponse(\n        400,\n        "Invalid business slug.",\n        "INVALID_BUSINESS_SLUG"\n      );\n    }`,
    `    if (!businessSlug) {\n      return errorResponse(\n        400,\n        "Business slug is required.",\n        "MISSING_BUSINESS_SLUG"\n      );\n    }\n\n    if (\n      !SLUG_PATTERN.test(\n        businessSlug\n      )\n    ) {\n      return errorResponse(\n        400,\n        "Invalid business slug.",\n        "INVALID_BUSINESS_SLUG"\n      );\n    }`,
    "bookings slug validation"
  );

  source = replaceOnce(
    source,
    `    const supabase =\n      createAdminClient();`,
    `    const clientAddress =\n      getClientAddress(\n        request.headers\n      );\n\n    const contactIdentity =\n      customerEmail ??\n      customerPhone?.replace(\n        /\\D/g,\n        ""\n      ) ??\n      "missing-contact";\n\n    const [\n      addressLimit,\n      contactLimit,\n    ] = await Promise.all([\n      consumeRateLimit({\n        scope:\n          "booking-address-tenant",\n        parts: [\n          clientAddress,\n          businessSlug,\n        ],\n        limit: 10,\n        windowSeconds: 10 * 60,\n        failureMode: "closed",\n      }),\n\n      consumeRateLimit({\n        scope:\n          "booking-contact-tenant",\n        parts: [\n          businessSlug,\n          contactIdentity,\n        ],\n        limit: 4,\n        windowSeconds: 30 * 60,\n        failureMode: "closed",\n      }),\n    ]);\n\n    const blockedLimit =\n      !addressLimit.allowed\n        ? addressLimit\n        : !contactLimit.allowed\n          ? contactLimit\n          : null;\n\n    if (blockedLimit) {\n      if (\n        blockedLimit.unavailable\n      ) {\n        return errorResponse(\n          503,\n          "Booking protection is temporarily unavailable.",\n          "RATE_LIMIT_UNAVAILABLE"\n        );\n      }\n\n      return errorResponse(\n        429,\n        "Too many booking attempts. Please try again later.",\n        "RATE_LIMITED",\n        getRateLimitHeaders(\n          blockedLimit\n        )\n      );\n    }\n\n    const supabase =\n      createAdminClient();`,
    "bookings limiter"
  );

  source = replaceOnce(
    source,
    `          "Cache-Control":\n            "no-store",\n        },`,
    `          "Cache-Control":\n            "no-store",\n          ...getRateLimitHeaders(\n            addressLimit\n          ),\n        },`,
    "bookings success headers"
  );

  write(file, source);
  console.log(`${file}: patched`);
}

function patchAvailabilityRoute() {
  const file =
    "app/api/availability/route.ts";

  let source = read(file);

  if (
    source.includes(
      "availability-address-tenant"
    )
  ) {
    console.log(
      `${file}: already patched`
    );
    return;
  }

  source = replaceOnce(
    source,
    `} from "next/server";\n\nimport { DEFAULT_BUSINESS_SLUG } from "@/lib/business/defaults";`,
    `} from "next/server";\n\nimport {\n  consumeRateLimit,\n  getClientAddress,\n  getRateLimitHeaders,\n} from "@/lib/security/rate-limit";`,
    "availability imports"
  );

  source = replaceOnce(
    source,
    `    const businessSlug =\n      searchParams.get("businessSlug") ??\n      DEFAULT_BUSINESS_SLUG;`,
    `    const businessSlug =\n      searchParams.get("businessSlug")\n        ?.trim() ?? "";`,
    "availability required slug"
  );

  source = replaceOnce(
    source,
    `    if (\n      !SLUG_PATTERN.test(businessSlug)\n    ) {`,
    `    if (!businessSlug) {\n      return validationError(\n        "Missing businessSlug."\n      );\n    }\n\n    if (\n      !SLUG_PATTERN.test(businessSlug)\n    ) {`,
    "availability slug validation"
  );

  source = replaceOnce(
    source,
    `    const supabase =\n      createAdminClient();`,
    `    const availabilityLimit =\n      await consumeRateLimit({\n        scope:\n          "availability-address-tenant",\n        parts: [\n          getClientAddress(\n            request.headers\n          ),\n          businessSlug,\n        ],\n        limit: 90,\n        windowSeconds: 60,\n        failureMode: "open",\n      });\n\n    if (!availabilityLimit.allowed) {\n      return NextResponse.json(\n        {\n          ok: false,\n          message:\n            "Too many availability requests. Please try again shortly.",\n          code:\n            "RATE_LIMITED",\n        },\n        {\n          status: 429,\n          headers: {\n            "Cache-Control":\n              "no-store",\n            ...getRateLimitHeaders(\n              availabilityLimit\n            ),\n          },\n        }\n      );\n    }\n\n    const supabase =\n      createAdminClient();`,
    "availability limiter"
  );

  source = replaceOnce(
    source,
    `    return NextResponse.json({\n      ok: true,`,
    `    return NextResponse.json({\n      ok: true,`,
    "availability response marker"
  );

  source = replaceOnce(
    source,
    `      count: slots.length,\n      slots,\n    });`,
    `      count: slots.length,\n      slots,\n    }, {\n      headers: {\n        "Cache-Control":\n          "no-store",\n        ...getRateLimitHeaders(\n          availabilityLimit\n        ),\n      },\n    });`,
    "availability success headers"
  );

  write(file, source);
  console.log(`${file}: patched`);
}

function patchBookingFlow() {
  const file =
    "components/booking/BookingFlow.tsx";

  let source = read(file);

  if (
    source.includes(
      `RATE_LIMITED: {`
    )
  ) {
    console.log(
      `${file}: already patched`
    );
    return;
  }

  source = replaceOnce(
    source,
    `const bookingErrorMessages: Record<\n  string,\n  LocalizedErrorMessage\n> = {\n  INVALID_CUSTOMER_NAME: {`,
    `const bookingErrorMessages: Record<\n  string,\n  LocalizedErrorMessage\n> = {\n  RATE_LIMITED: {\n    "sr-Latn": "Poslato je previše zahteva za rezervaciju. Sačekaj malo i pokušaj ponovo.",\n    mk: "Испратени се премногу барања за резервација. Почекајте малку и обидете се повторно.",\n    sq: "Janë dërguar shumë kërkesa rezervimi. Prisni pak dhe provoni përsëri.",\n    en: "Too many booking attempts were sent. Please wait and try again.",\n  },\n\n  RATE_LIMIT_UNAVAILABLE: {\n    "sr-Latn": "Zaštita rezervacija trenutno nije dostupna. Pokušaj ponovo malo kasnije.",\n    mk: "Заштитата на резервациите моментално не е достапна. Обидете се повторно подоцна.",\n    sq: "Mbrojtja e rezervimeve nuk është aktualisht e disponueshme. Provoni përsëri më vonë.",\n    en: "Booking protection is temporarily unavailable. Please try again later.",\n  },\n\n  INVALID_CUSTOMER_NAME: {`,
    "booking flow messages"
  );

  write(file, source);
  console.log(`${file}: patched`);
}

patchBookingsRoute();
patchAvailabilityRoute();
patchBookingFlow();

console.log(
  "PUBLIC-API-HARDENING-01 source patches applied."
);
