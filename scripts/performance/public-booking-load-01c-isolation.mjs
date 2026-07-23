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
      .PUBLIC_BOOKING_ISOLATION_BASE_URL ??
    "https://ordumstudios.com"
  ).replace(
    /\/+$/,
    ""
  );

const BUSINESS_SLUG =
  process.env
    .PUBLIC_BOOKING_ISOLATION_BUSINESS_SLUG ??
  "lumiere-studio";

const LEVELS =
  (
    process.env
      .PUBLIC_BOOKING_ISOLATION_LEVELS ??
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

const ROUNDS =
  Math.max(
    1,
    Number.parseInt(
      process.env
        .PUBLIC_BOOKING_ISOLATION_ROUNDS ??
        "2",
      10
    )
  );

const TIMEOUT_MS =
  Math.max(
    1_000,
    Number.parseInt(
      process.env
        .PUBLIC_BOOKING_ISOLATION_TIMEOUT_MS ??
        "20000",
      10
    )
  );

const PAUSE_MS =
  Math.max(
    0,
    Number.parseInt(
      process.env
        .PUBLIC_BOOKING_ISOLATION_PAUSE_MS ??
        "1200",
      10
    )
  );

const AVAILABILITY_RATIO =
  Math.min(
    0.2,
    Math.max(
      0.01,
      Number(
        process.env
          .PUBLIC_BOOKING_ISOLATION_AVAILABILITY_RATIO ??
        "0.2"
      )
    )
  );

const OUTPUT_DIR =
  join(
    "tmp",
    "public-booking-load-01c"
  );

const USER_AGENT =
  "OrdumPublicBookingIsolation01C/1.0";

function sleep(
  durationMs
) {
  if (
    durationMs <= 0
  ) {
    return Promise.resolve();
  }

  return new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        durationMs
      )
  );
}

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
          sorted.length *
          fraction
        ) - 1
      )
    );

  return sorted[index];
}

function rounded(
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

function summary(
  samples
) {
  const successful =
    samples.filter(
      (sample) =>
        sample.ok
    );

  const totalDurations =
    successful.map(
      (sample) =>
        sample.totalMs
    );

  const ttfbDurations =
    successful.map(
      (sample) =>
        sample.ttfbMs
    );

  const statusCounts = {};

  for (
    const sample of
    samples
  ) {
    const key =
      String(
        sample.status
      );

    statusCounts[key] =
      (
        statusCounts[key] ??
        0
      ) + 1;
  }

  const bytes =
    successful.map(
      (sample) =>
        sample.bytes
    );

  return {
    requests:
      samples.length,
    successful:
      successful.length,
    failed:
      samples.length -
      successful.length,
    successRate:
      samples.length >
      0
        ? Number(
            (
              successful.length /
              samples.length *
              100
            ).toFixed(
              2
            )
          )
        : 0,
    timeoutCount:
      samples.filter(
        (sample) =>
          sample.timeout
      ).length,
    rateLimitedCount:
      samples.filter(
        (sample) =>
          sample.status ===
          429
      ).length,
    statuses:
      statusCounts,
    ttfb: {
      p50Ms:
        rounded(
          percentile(
            ttfbDurations,
            0.5
          )
        ),
      p95Ms:
        rounded(
          percentile(
            ttfbDurations,
            0.95
          )
        ),
      p99Ms:
        rounded(
          percentile(
            ttfbDurations,
            0.99
          )
        ),
      maxMs:
        ttfbDurations.length >
        0
          ? rounded(
              Math.max(
                ...ttfbDurations
              )
            )
          : null,
    },
    total: {
      p50Ms:
        rounded(
          percentile(
            totalDurations,
            0.5
          )
        ),
      p95Ms:
        rounded(
          percentile(
            totalDurations,
            0.95
          )
        ),
      p99Ms:
        rounded(
          percentile(
            totalDurations,
            0.99
          )
        ),
      maxMs:
        totalDurations.length >
        0
          ? rounded(
              Math.max(
                ...totalDurations
              )
            )
          : null,
    },
    averageBytes:
      bytes.length >
      0
        ? rounded(
            bytes.reduce(
              (
                total,
                value
              ) =>
                total +
                value,
              0
            ) /
            bytes.length
          )
        : 0,
  };
}

async function measuredGet(
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

    const headersAt =
      performance.now();

    const body =
      await response.arrayBuffer();

    const completedAt =
      performance.now();

    return {
      route,
      ok:
        response.ok,
      status:
        response.status,
      ttfbMs:
        Number(
          (
            headersAt -
            started
          ).toFixed(
            1
          )
        ),
      bodyMs:
        Number(
          (
            completedAt -
            headersAt
          ).toFixed(
            1
          )
        ),
      totalMs:
        Number(
          (
            completedAt -
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
    const completedAt =
      performance.now();

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
      ttfbMs:
        Number(
          (
            completedAt -
            started
          ).toFixed(
            1
          )
        ),
      bodyMs:
        0,
      totalMs:
        Number(
          (
            completedAt -
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

function futureDate(
  offset
) {
  const value =
    new Date();

  value.setUTCDate(
    value.getUTCDate() +
      offset
  );

  return value
    .toISOString()
    .slice(
      0,
      10
    );
}

async function preflight() {
  const catalogUrl =
    `${BASE_URL}/api/catalog?businessSlug=${encodeURIComponent(BUSINESS_SLUG)}`;

  const catalogResponse =
    await fetch(
      catalogUrl,
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

  const catalogPayload =
    await catalogResponse.json();

  if (
    !catalogResponse.ok ||
    !catalogPayload?.ok
  ) {
    throw new Error(
      `Catalog preflight failed: HTTP ${catalogResponse.status}`
    );
  }

  const service =
    Array.isArray(
      catalogPayload.catalog
        ?.services
    )
      ? catalogPayload.catalog
          .services
          .find(
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
      "No active service was found."
    );
  }

  for (
    let offset = 1;
    offset <= 7;
    offset += 1
  ) {
    const date =
      futureDate(
        offset
      );

    const params =
      new URLSearchParams({
        businessSlug:
          BUSINESS_SLUG,
        serviceId:
          service.id,
        date,
      });

    const response =
      await fetch(
        `${BASE_URL}/api/availability?${params.toString()}`,
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
        serviceId:
          service.id,
        date,
        slotCount:
          payload.count,
        catalogCounts:
          catalogPayload.counts ??
          null,
      };
    }
  }

  throw new Error(
    "No available slot date was found in the next 7 days."
  );
}

function routeUrl(
  route,
  fixture
) {
  switch (
    route
  ) {
    case "tenantPage":
      return `${BASE_URL}/salon/${encodeURIComponent(BUSINESS_SLUG)}`;

    case "catalog":
      return `${BASE_URL}/api/catalog?businessSlug=${encodeURIComponent(BUSINESS_SLUG)}`;

    case "availability": {
      const params =
        new URLSearchParams({
          businessSlug:
            BUSINESS_SLUG,
          serviceId:
            fixture.serviceId,
          date:
            fixture.date,
        });

      return `${BASE_URL}/api/availability?${params.toString()}`;
    }

    default:
      throw new Error(
        `Unknown route: ${route}`
      );
  }
}

function concurrencyForRoute(
  route,
  sessionLevel
) {
  if (
    route !==
    "availability"
  ) {
    return sessionLevel;
  }

  return Math.max(
    1,
    Math.min(
      20,
      Math.ceil(
        sessionLevel *
        AVAILABILITY_RATIO
      )
    )
  );
}

async function warmup(
  fixture
) {
  for (
    const route of [
      "tenantPage",
      "catalog",
      "availability",
    ]
  ) {
    const result =
      await measuredGet(
        route,
        routeUrl(
          route,
          fixture
        )
      );

    if (
      !result.ok
    ) {
      throw new Error(
        `Warmup failed for ${route}: HTTP ${result.status}`
      );
    }

    await sleep(
      250
    );
  }
}

async function runRoute({
  route,
  sessionLevel,
  fixture,
}) {
  const concurrency =
    concurrencyForRoute(
      route,
      sessionLevel
    );

  const url =
    routeUrl(
      route,
      fixture
    );

  const wallStarted =
    performance.now();

  const samples =
    await Promise.all(
      Array.from(
        {
          length:
            concurrency,
        },
        () =>
          measuredGet(
            route,
            url
          )
      )
    );

  const wallClockMs =
    Number(
      (
        performance.now() -
        wallStarted
      ).toFixed(
        1
      )
    );

  return {
    route,
    sessionLevel,
    actualConcurrency:
      concurrency,
    wallClockMs,
    summary:
      summary(
        samples
      ),
    samples,
  };
}

function median(
  values
) {
  return percentile(
    values.filter(
      (
        value
      ) =>
        Number.isFinite(
          value
        )
    ),
    0.5
  );
}

function aggregate(
  runs
) {
  const result = [];

  for (
    const level of
    LEVELS
  ) {
    const entry = {
      sessionLevel:
        level,
      routes: {},
    };

    for (
      const route of [
        "tenantPage",
        "catalog",
        "availability",
      ]
    ) {
      const matching =
        runs.filter(
          (run) =>
            run.sessionLevel ===
              level &&
            run.route ===
              route
        );

      entry.routes[
        route
      ] = {
        rounds:
          matching.length,
        actualConcurrency:
          matching[0]
            ?.actualConcurrency ??
          0,
        successRate:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .successRate
              )
            )
          ),
        timeoutCount:
          matching.reduce(
            (
              total,
              run
            ) =>
              total +
              run.summary
                .timeoutCount,
            0
          ),
        rateLimitedCount:
          matching.reduce(
            (
              total,
              run
            ) =>
              total +
              run.summary
                .rateLimitedCount,
            0
          ),
        medianTtfbP50Ms:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .ttfb
                    .p50Ms
              )
            )
          ),
        medianTtfbP95Ms:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .ttfb
                    .p95Ms
              )
            )
          ),
        medianTtfbP99Ms:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .ttfb
                    .p99Ms
              )
            )
          ),
        medianTotalP50Ms:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .total
                    .p50Ms
              )
            )
          ),
        medianTotalP95Ms:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .total
                    .p95Ms
              )
            )
          ),
        medianTotalP99Ms:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .total
                    .p99Ms
              )
            )
          ),
        averageBytes:
          rounded(
            median(
              matching.map(
                (run) =>
                  run.summary
                    .averageBytes
              )
            )
          ),
      };
    }

    const tenant =
      entry.routes
        .tenantPage;
    const catalog =
      entry.routes
        .catalog;

    const delta =
      tenant
        .medianTtfbP95Ms -
      catalog
        .medianTtfbP95Ms;

    const share =
      tenant
        .medianTtfbP95Ms >
      0
        ? catalog
            .medianTtfbP95Ms /
          tenant
            .medianTtfbP95Ms *
          100
        : null;

    entry.diagnosis = {
      tenantMinusCatalogTtfbP95Ms:
        rounded(
          delta
        ),
      catalogShareOfTenantTtfbP95Percent:
        rounded(
          share
        ),
      classification:
        share !==
          null &&
        share >=
          80
          ? "catalog-dominant"
          : delta >=
              750
            ? "tenant-shell-template-overhead-significant"
            : "mixed",
    };

    result.push(
      entry
    );
  }

  return result;
}

function markdown(
  result
) {
  const rows = [];

  for (
    const level of
    result.aggregate
  ) {
    for (
      const route of [
        "tenantPage",
        "catalog",
        "availability",
      ]
    ) {
      const metrics =
        level.routes[
          route
        ];

      rows.push(
        `| ${level.sessionLevel} | ${route} | ${metrics.actualConcurrency} | ${metrics.successRate}% | ${metrics.medianTtfbP50Ms ?? "-"} | ${metrics.medianTtfbP95Ms ?? "-"} | ${metrics.medianTtfbP99Ms ?? "-"} | ${metrics.medianTotalP95Ms ?? "-"} | ${metrics.timeoutCount} | ${metrics.rateLimitedCount} |`
      );
    }
  }

  const diagnosisRows =
    result.aggregate
      .map(
        (level) =>
          `| ${level.sessionLevel} | ${level.diagnosis.tenantMinusCatalogTtfbP95Ms} | ${level.diagnosis.catalogShareOfTenantTtfbP95Percent}% | ${level.diagnosis.classification} |`
      )
      .join(
        "\n"
      );

  return `# PUBLIC-BOOKING-LOAD-01C — ROUTE ISOLATION REPORT

## Safety and configuration

- GET only: **YES**
- Booking POST requests: **0**
- Writes performed: **NO**
- Base URL: \`${result.configuration.baseUrl}\`
- Business slug: \`${result.configuration.businessSlug}\`
- Session levels: \`${result.configuration.levels.join(", ")}\`
- Measurement rounds: \`${result.configuration.rounds}\`
- Availability ratio: \`${result.configuration.availabilityRatio}\`

## Route metrics

Metrics below are medians across measurement rounds.

| Session level | Route | Actual concurrency | Success | TTFB p50 ms | TTFB p95 ms | TTFB p99 ms | Total p95 ms | Timeouts | 429 |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|
${rows.join("\n")}

## Tenant versus direct catalog

| Session level | Tenant − catalog TTFB p95 | Catalog share of tenant TTFB p95 | Classification |
|---:|---:|---:|---|
${diagnosisRows}

## Interpretation

- **catalog-dominant**: direct catalog TTFB accounts for at least 80% of tenant-page TTFB.
- **tenant-shell-template-overhead-significant**: tenant page adds at least 750 ms over direct catalog.
- **mixed**: both layers materially contribute.

This test does not create bookings and does not verify write concurrency.
`;
}

async function main() {
  if (
    LEVELS.length === 0
  ) {
    throw new Error(
      "No valid isolation levels were provided."
    );
  }

  console.log(
    "============================================================"
  );
  console.log(
    "PUBLIC-BOOKING-LOAD-01C ROUTE ISOLATION"
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
    `[INFO] Rounds: ${ROUNDS}`
  );
  console.log(
    "[SAFETY] GET only. No booking POST. No writes."
  );

  const fixture =
    await preflight();

  console.log(
    `[INFO] Fixture: service=${fixture.serviceId} date=${fixture.date} slots=${fixture.slotCount}`
  );

  console.log(
    "[RUN] Warmup"
  );

  await warmup(
    fixture
  );

  const runs = [];

  for (
    let round = 1;
    round <= ROUNDS;
    round += 1
  ) {
    const order =
      round %
        2 ===
      1
        ? [
            "tenantPage",
            "catalog",
            "availability",
          ]
        : [
            "catalog",
            "tenantPage",
            "availability",
          ];

    console.log(
      `[RUN] Round ${round}/${ROUNDS} order=${order.join(" -> ")}`
    );

    for (
      const sessionLevel of
      LEVELS
    ) {
      for (
        const route of
        order
      ) {
        const run =
          await runRoute({
            route,
            sessionLevel,
            fixture,
          });

        run.round =
          round;

        runs.push(
          run
        );

        console.log(
          `[RESULT] round=${round} level=${sessionLevel} route=${route} concurrency=${run.actualConcurrency} success=${run.summary.successRate}% ttfbP95=${run.summary.ttfb.p95Ms}ms totalP95=${run.summary.total.p95Ms}ms timeout=${run.summary.timeoutCount} rateLimited=${run.summary.rateLimitedCount}`
        );

        await sleep(
          PAUSE_MS
        );
      }
    }
  }

  const aggregateResult =
    aggregate(
      runs
    );

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
      rounds:
        ROUNDS,
      timeoutMs:
        TIMEOUT_MS,
      pauseMs:
        PAUSE_MS,
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
    fixture,
    aggregate:
      aggregateResult,
    runs,
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
    markdown(
      result
    ),
    "utf8"
  );

  const failed =
    aggregateResult.some(
      (level) =>
        Object.values(
          level.routes
        ).some(
          (route) =>
            route.successRate <
              95 ||
            route.timeoutCount >
              0
        )
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
      "[FAIL] One or more isolation health gates failed."
    );
    process.exit(1);
  }

  console.log(
    "[PASS] PUBLIC-BOOKING-LOAD-01C route isolation completed."
  );
}

await main();
