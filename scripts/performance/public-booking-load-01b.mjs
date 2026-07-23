import {
  mkdirSync,
  writeFileSync,
} from "node:fs";
import {
  join,
} from "node:path";
import {
  performance,
} from "node:perf_hooks";

const BASE_URL =
  (
    process.env
      .PUBLIC_BOOKING_LOAD_BASE_URL ??
    "https://ordumstudios.com"
  ).replace(
    /\/+$/,
    ""
  );

const BUSINESS_SLUG =
  process.env
    .PUBLIC_BOOKING_LOAD_BUSINESS_SLUG ??
  "lumiere-studio";

const LEVELS =
  (
    process.env
      .PUBLIC_BOOKING_LOAD_LEVELS ??
    "25,50,100"
  )
    .split(",")
    .map(
      (value) =>
        Number.parseInt(
          value.trim(),
          10
        )
    )
    .filter(
      (value) =>
        Number.isInteger(
          value
        ) &&
        value > 0
    );

const TIMEOUT_MS =
  Number.parseInt(
    process.env
      .PUBLIC_BOOKING_LOAD_TIMEOUT_MS ??
      "20000",
    10
  );

const AVAILABILITY_RATIO =
  Math.min(
    1,
    Math.max(
      0,
      Number(
        process.env
          .PUBLIC_BOOKING_LOAD_AVAILABILITY_RATIO ??
        "0.2"
      )
    )
  );

const OUTPUT_DIR =
  join(
    "tmp",
    "public-booking-load-01b"
  );

const USER_AGENT =
  "OrdumPublicBookingLoad01B/1.0";

function percentile(
  values,
  fraction
) {
  if (
    values.length === 0
  ) {
    return null;
  }

  const sorted =
    [
      ...values,
    ].sort(
      (
        first,
        second
      ) =>
        first -
        second
    );

  const index =
    Math.min(
      sorted.length - 1,
      Math.max(
        0,
        Math.ceil(
          fraction *
          sorted.length
        ) - 1
      )
    );

  return sorted[index];
}

function roundMetric(
  value
) {
  return value ===
    null
    ? null
    : Number(
        value.toFixed(
          1
        )
      );
}

function summarize(
  samples
) {
  const durations =
    samples
      .map(
        (sample) =>
          sample.durationMs
      )
      .filter(
        (
          value
        ) =>
          Number.isFinite(
            value
          )
      );

  const statuses = {};

  for (
    const sample of
    samples
  ) {
    const key =
      String(
        sample.status
      );

    statuses[key] =
      (
        statuses[key] ??
        0
      ) + 1;
  }

  const successful =
    samples.filter(
      (sample) =>
        sample.ok
    ).length;

  const timedOut =
    samples.filter(
      (sample) =>
        sample.timeout
    ).length;

  const rateLimited =
    samples.filter(
      (sample) =>
        sample.status ===
        429
    ).length;

  return {
    requests:
      samples.length,
    successful,
    failed:
      samples.length -
      successful,
    successRate:
      samples.length >
      0
        ? Number(
            (
              successful /
              samples.length *
              100
            ).toFixed(
              2
            )
          )
        : 0,
    timeoutCount:
      timedOut,
    rateLimitedCount:
      rateLimited,
    statuses,
    bytes:
      samples.reduce(
        (
          total,
          sample
        ) =>
          total +
          (
            sample.bytes ??
            0
          ),
        0
      ),
    p50Ms:
      roundMetric(
        percentile(
          durations,
          0.5
        )
      ),
    p95Ms:
      roundMetric(
        percentile(
          durations,
          0.95
        )
      ),
    p99Ms:
      roundMetric(
        percentile(
          durations,
          0.99
        )
      ),
    maxMs:
      durations.length >
      0
        ? roundMetric(
            Math.max(
              ...durations
            )
          )
        : null,
  };
}

function futureDate(
  dayOffset
) {
  const date =
    new Date();

  date.setUTCDate(
    date.getUTCDate() +
      dayOffset
  );

  return date
    .toISOString()
    .slice(
      0,
      10
    );
}

async function request(
  route,
  url
) {
  const started =
    performance.now();

  try {
    const response =
      await fetch(
        url,
        {
          method:
            "GET",
          cache:
            "no-store",
          headers: {
            "User-Agent":
              USER_AGENT,
            Accept:
              route ===
                "tenantPage"
                ? "text/html,application/xhtml+xml"
                : "application/json",
          },
          signal:
            AbortSignal.timeout(
              TIMEOUT_MS
            ),
        }
      );

    const body =
      await response.arrayBuffer();

    return {
      route,
      ok:
        response.ok,
      status:
        response.status,
      durationMs:
        Number(
          (
            performance.now() -
            started
          ).toFixed(
            1
          )
        ),
      bytes:
        body.byteLength,
      timeout:
        false,
      requestId:
        response.headers.get(
          "x-request-id"
        ),
      cacheControl:
        response.headers.get(
          "cache-control"
        ),
    };
  } catch (
    error
  ) {
    const message =
      error instanceof
        Error
        ? error.message
        : String(
            error
          );

    return {
      route,
      ok:
        false,
      status:
        0,
      durationMs:
        Number(
          (
            performance.now() -
            started
          ).toFixed(
            1
          )
        ),
      bytes:
        0,
      timeout:
        /timeout/i.test(
          message
        ),
      error:
        message,
      requestId:
        null,
      cacheControl:
        null,
    };
  }
}

async function loadCatalogFixture() {
  const url =
    `${BASE_URL}/api/catalog?businessSlug=${encodeURIComponent(BUSINESS_SLUG)}`;

  const started =
    performance.now();

  const response =
    await fetch(
      url,
      {
        method:
          "GET",
        cache:
          "no-store",
        headers: {
          "User-Agent":
            USER_AGENT,
          Accept:
            "application/json",
        },
        signal:
          AbortSignal.timeout(
            TIMEOUT_MS
          ),
      }
    );

  const payload =
    await response.json();

  if (
    !response.ok ||
    !payload?.ok
  ) {
    throw new Error(
      `Catalog preflight failed: HTTP ${response.status}`
    );
  }

  const services =
    payload.catalog
      ?.services;

  const service =
    Array.isArray(
      services
    )
      ? services.find(
          (item) =>
            item?.isActive !==
              false &&
            typeof item?.id ===
              "string"
        )
      : null;

  if (
    !service
  ) {
    throw new Error(
      "Catalog preflight returned no active service."
    );
  }

  return {
    serviceId:
      service.id,
    durationMs:
      Number(
        (
          performance.now() -
          started
        ).toFixed(
          1
        )
      ),
    counts:
      payload.counts ??
      null,
  };
}

async function findAvailabilityDate(
  serviceId
) {
  for (
    let dayOffset = 1;
    dayOffset <= 7;
    dayOffset += 1
  ) {
    const date =
      futureDate(
        dayOffset
      );

    const searchParams =
      new URLSearchParams({
        businessSlug:
          BUSINESS_SLUG,
        serviceId,
        date,
      });

    const response =
      await fetch(
        `${BASE_URL}/api/availability?${searchParams.toString()}`,
        {
          method:
            "GET",
          cache:
            "no-store",
          headers: {
            "User-Agent":
              USER_AGENT,
            Accept:
              "application/json",
          },
          signal:
            AbortSignal.timeout(
              TIMEOUT_MS
            ),
        }
      );

    const payload =
      await response.json();

    if (
      response.ok &&
      payload?.ok &&
      typeof payload.count ===
        "number" &&
      payload.count >
        0
    ) {
      return {
        date,
        slotCount:
          payload.count,
      };
    }
  }

  throw new Error(
    "Availability preflight found no slots in the next 7 days."
  );
}

function buildSessionRequests({
  concurrency,
  serviceId,
  date,
}) {
  const requests = [];

  for (
    let index = 0;
    index <
    concurrency;
    index += 1
  ) {
    requests.push({
      route:
        "tenantPage",
      url:
        `${BASE_URL}/salon/${encodeURIComponent(BUSINESS_SLUG)}`,
    });

    const normalized =
      (
        index + 1
      ) /
      concurrency;

    if (
      normalized <=
      AVAILABILITY_RATIO
    ) {
      const searchParams =
        new URLSearchParams({
          businessSlug:
            BUSINESS_SLUG,
          serviceId,
          date,
        });

      requests.push({
        route:
          "availability",
        url:
          `${BASE_URL}/api/availability?${searchParams.toString()}`,
      });
    }
  }

  return requests;
}

async function runLevel({
  concurrency,
  serviceId,
  date,
}) {
  const requests =
    buildSessionRequests({
      concurrency,
      serviceId,
      date,
    });

  const started =
    performance.now();

  const samples =
    await Promise.all(
      requests.map(
        (
          item
        ) =>
          request(
            item.route,
            item.url
          )
      )
    );

  const durationMs =
    Number(
      (
        performance.now() -
        started
      ).toFixed(
        1
      )
    );

  const tenantSamples =
    samples.filter(
      (sample) =>
        sample.route ===
        "tenantPage"
    );

  const availabilitySamples =
    samples.filter(
      (sample) =>
        sample.route ===
        "availability"
    );

  return {
    concurrency,
    virtualSessions:
      concurrency,
    availabilityRatio:
      AVAILABILITY_RATIO,
    wallClockMs:
      durationMs,
    total:
      summarize(
        samples
      ),
    tenantPage:
      summarize(
        tenantSamples
      ),
    availability:
      summarize(
        availabilitySamples
      ),
    samples,
  };
}

function report(
  result
) {
  const rows =
    result.levels
      .map(
        (level) =>
          `| ${level.concurrency} | ${level.total.requests} | ${level.total.successRate}% | ${level.total.p50Ms ?? "-"} | ${level.total.p95Ms ?? "-"} | ${level.total.p99Ms ?? "-"} | ${level.total.maxMs ?? "-"} | ${level.total.timeoutCount} | ${level.total.rateLimitedCount} |`
      )
      .join(
        "\n"
      );

  const tenantRows =
    result.levels
      .map(
        (level) =>
          `| ${level.concurrency} | ${level.tenantPage.requests} | ${level.tenantPage.successRate}% | ${level.tenantPage.p50Ms ?? "-"} | ${level.tenantPage.p95Ms ?? "-"} | ${level.tenantPage.p99Ms ?? "-"} |`
      )
      .join(
        "\n"
      );

  const availabilityRows =
    result.levels
      .map(
        (level) =>
          `| ${level.concurrency} | ${level.availability.requests} | ${level.availability.successRate}% | ${level.availability.p50Ms ?? "-"} | ${level.availability.p95Ms ?? "-"} | ${level.availability.p99Ms ?? "-"} | ${level.availability.rateLimitedCount} |`
      )
      .join(
        "\n"
      );

  return `# PUBLIC-BOOKING-LOAD-01B — READ-ONLY LOAD REPORT

## Safety

- HTTP methods: GET only
- Booking POST requests: 0
- Database writes: 0
- Base URL: \`${result.configuration.baseUrl}\`
- Business slug: \`${result.configuration.businessSlug}\`
- Concurrency levels: \`${result.configuration.levels.join(", ")}\`
- Availability ratio: \`${result.configuration.availabilityRatio}\`

## Preflight

- Catalog: ${result.preflight.catalogDurationMs} ms
- Active service: \`${result.preflight.serviceId}\`
- Availability date: \`${result.preflight.date}\`
- Visible slots: ${result.preflight.slotCount}

## Overall

| Concurrent sessions | Requests | Success | p50 ms | p95 ms | p99 ms | max ms | Timeouts | 429 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
${rows}

## Tenant page

| Concurrent sessions | Requests | Success | p50 ms | p95 ms | p99 ms |
|---:|---:|---:|---:|---:|---:|
${tenantRows}

## Availability

| Concurrent sessions | Requests | Success | p50 ms | p95 ms | p99 ms | 429 |
|---:|---:|---:|---:|---:|---:|---:|
${availabilityRows}

## Interpretation gate

This report measures read-path behavior only. It does not prove write concurrency, idempotency, Google Calendar latency, email latency, or booking POST capacity.

A level is considered operationally healthy for this audit when:

- tenant page success rate is at least 95%;
- no timeout occurs;
- availability does not unexpectedly hit the 90/minute tenant-address protection;
- p95 and p99 remain bounded rather than growing without recovery.
`;
}

async function main() {
  if (
    LEVELS.length === 0
  ) {
    throw new Error(
      "PUBLIC_BOOKING_LOAD_LEVELS contains no valid levels."
    );
  }

  console.log(
    "============================================================"
  );
  console.log(
    "PUBLIC-BOOKING-LOAD-01B READ-ONLY LOAD HARNESS"
  );
  console.log(
    "============================================================"
  );
  console.log(
    `[INFO] Base URL: ${BASE_URL}`
  );
  console.log(
    `[INFO] Business: ${BUSINESS_SLUG}`
  );
  console.log(
    `[INFO] Levels: ${LEVELS.join(", ")}`
  );
  console.log(
    `[INFO] Availability ratio: ${AVAILABILITY_RATIO}`
  );
  console.log(
    "[SAFETY] GET only. No booking POST. No writes."
  );

  const catalog =
    await loadCatalogFixture();

  const availability =
    await findAvailabilityDate(
      catalog.serviceId
    );

  const levels = [];

  for (
    const concurrency of
    LEVELS
  ) {
    console.log(
      `[RUN] ${concurrency} concurrent virtual sessions`
    );

    const level =
      await runLevel({
        concurrency,
        serviceId:
          catalog.serviceId,
        date:
          availability.date,
      });

    levels.push(
      level
    );

    console.log(
      `[RESULT] ${concurrency}: success=${level.total.successRate}% p95=${level.total.p95Ms}ms p99=${level.total.p99Ms}ms timeout=${level.total.timeoutCount} rateLimited=${level.total.rateLimitedCount}`
    );
  }

  const result = {
    generatedAt:
      new Date().toISOString(),
    configuration: {
      baseUrl:
        BASE_URL,
      businessSlug:
        BUSINESS_SLUG,
      levels:
        LEVELS,
      timeoutMs:
        TIMEOUT_MS,
      availabilityRatio:
        AVAILABILITY_RATIO,
      methods: [
        "GET",
      ],
      bookingPostRequests:
        0,
      writesPerformed:
        false,
    },
    preflight: {
      catalogDurationMs:
        catalog.durationMs,
      catalogCounts:
        catalog.counts,
      serviceId:
        catalog.serviceId,
      date:
        availability.date,
      slotCount:
        availability.slotCount,
    },
    levels,
  };

  mkdirSync(
    OUTPUT_DIR,
    {
      recursive:
        true,
    }
  );

  writeFileSync(
    join(
      OUTPUT_DIR,
      "results.json"
    ),
    JSON.stringify(
      result,
      null,
      2
    ) + "\n",
    "utf8"
  );

  writeFileSync(
    join(
      OUTPUT_DIR,
      "REPORT.md"
    ),
    report(
      result
    ),
    "utf8"
  );

  const failed =
    levels.some(
      (level) =>
        level.tenantPage
          .successRate <
          95 ||
        level.total
          .timeoutCount >
          0
    );

  console.log(
    `[INFO] Report: ${join(OUTPUT_DIR, "REPORT.md")}`
  );
  console.log(
    `[INFO] Results: ${join(OUTPUT_DIR, "results.json")}`
  );

  if (
    failed
  ) {
    console.error(
      "[FAIL] One or more read-load health gates failed."
    );
    process.exit(1);
  }

  console.log(
    "[PASS] PUBLIC-BOOKING-LOAD-01B read-only load run completed."
  );
}

await main();
