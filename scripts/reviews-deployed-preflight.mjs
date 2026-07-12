#!/usr/bin/env node

import {
  mkdir,
  writeFile,
} from "node:fs/promises";
import {
  resolve,
} from "node:path";

const DEFAULT_TIMEOUT_MS =
  15_000;

const WRONG_CRON_SECRET =
  "intentionally-wrong-review-smoke-secret";

function stop(
  message
) {
  console.error(
    `\n[STOP] ${message}`
  );

  process.exit(1);
}

function parseArgs(
  argv
) {
  const result = {
    baseUrl: "",
    businessSlug: "",
    timeoutMs:
      DEFAULT_TIMEOUT_MS,
    outputDirectory:
      "tmp/reviews-qa",
  };

  for (
    let index = 0;
    index < argv.length;
    index += 1
  ) {
    const current =
      argv[index];

    if (
      current ===
      "--base-url"
    ) {
      result.baseUrl =
        argv[
          index + 1
        ] ?? "";
      index += 1;
      continue;
    }

    if (
      current.startsWith(
        "--base-url="
      )
    ) {
      result.baseUrl =
        current.slice(
          "--base-url=".length
        );
      continue;
    }

    if (
      current ===
      "--business-slug"
    ) {
      result.businessSlug =
        argv[
          index + 1
        ] ?? "";
      index += 1;
      continue;
    }

    if (
      current.startsWith(
        "--business-slug="
      )
    ) {
      result.businessSlug =
        current.slice(
          "--business-slug=".length
        );
      continue;
    }

    if (
      current ===
      "--timeout-ms"
    ) {
      result.timeoutMs =
        Number.parseInt(
          argv[
            index + 1
          ] ?? "",
          10
        );
      index += 1;
      continue;
    }

    if (
      current.startsWith(
        "--timeout-ms="
      )
    ) {
      result.timeoutMs =
        Number.parseInt(
          current.slice(
            "--timeout-ms=".length
          ),
          10
        );
      continue;
    }

    if (
      current ===
      "--output-directory"
    ) {
      result.outputDirectory =
        argv[
          index + 1
        ] ??
        result.outputDirectory;
      index += 1;
      continue;
    }

    if (
      current.startsWith(
        "--output-directory="
      )
    ) {
      result.outputDirectory =
        current.slice(
          "--output-directory=".length
        );
      continue;
    }

    stop(
      `Nepoznat argument: ${current}`
    );
  }

  return result;
}

function normalizeBaseUrl(
  raw
) {
  if (!raw.trim()) {
    stop(
      "--base-url je obavezan."
    );
  }

  const candidate =
    raw.includes(
      "://"
    )
      ? raw
      : `https://${raw}`;

  let url;

  try {
    url =
      new URL(
        candidate
      );
  } catch {
    stop(
      "--base-url nije validan URL."
    );
  }

  const isLocalhost =
    [
      "localhost",
      "127.0.0.1",
      "::1",
    ].includes(
      url.hostname
    );

  if (
    !isLocalhost &&
    url.protocol !==
      "https:"
  ) {
    stop(
      "Remote deployed smoke zahteva HTTPS."
    );
  }

  if (
    url.protocol !==
      "https:" &&
    url.protocol !==
      "http:"
  ) {
    stop(
      "Podržani su samo HTTP i HTTPS."
    );
  }

  url.pathname = "/";
  url.search = "";
  url.hash = "";

  return url
    .toString()
    .replace(
      /\/+$/u,
      ""
    );
}

function normalizeSlug(
  raw
) {
  const value =
    raw
      .trim()
      .toLowerCase();

  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(
      value
    )
  ) {
    stop(
      "--business-slug mora biti lowercase slug."
    );
  }

  return value;
}

async function fetchWithTimeout(
  url,
  options,
  timeoutMs
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => {
        controller.abort();
      },
      timeoutMs
    );

  try {
    return await fetch(
      url,
      {
        redirect:
          "manual",
        cache:
          "no-store",
        ...options,
        signal:
          controller.signal,
      }
    );
  } finally {
    clearTimeout(
      timeout
    );
  }
}

function statusAllowed(
  status,
  allowed
) {
  return allowed.includes(
    status
  );
}

function summarizeHeaders(
  response
) {
  return {
    cacheControl:
      response.headers.get(
        "cache-control"
      ),
    contentType:
      response.headers.get(
        "content-type"
      ),
    location:
      response.headers.get(
        "location"
      ),
    requestId:
      response.headers.get(
        "x-request-id"
      ),
    robots:
      response.headers.get(
        "x-robots-tag"
      ),
  };
}

async function runCheck({
  name,
  url,
  options = {},
  allowedStatuses,
  timeoutMs,
  inspect,
}) {
  const startedAt =
    Date.now();

  try {
    const response =
      await fetchWithTimeout(
        url,
        options,
        timeoutMs
      );

    let detail = null;

    if (inspect) {
      detail =
        await inspect(
          response
        );
    }

    const passed =
      statusAllowed(
        response.status,
        allowedStatuses
      ) &&
      (
        detail?.passed ??
        true
      );

    return {
      name,
      url,
      method:
        options.method ??
        "GET",
      passed,
      status:
        response.status,
      durationMs:
        Date.now() -
        startedAt,
      headers:
        summarizeHeaders(
          response
        ),
      detail:
        detail?.detail ??
        null,
    };
  } catch (error) {
    return {
      name,
      url,
      method:
        options.method ??
        "GET",
      passed: false,
      status: null,
      durationMs:
        Date.now() -
        startedAt,
      headers: null,
      detail:
        error instanceof Error
          ? error.message
          : String(
              error
            ),
    };
  }
}

async function inspectHtmlNoIndex(
  response
) {
  const text =
    await response.text();

  const normalized =
    text.toLowerCase();

  const noIndex =
    normalized.includes(
      'name="robots"'
    ) &&
    normalized.includes(
      "noindex"
    );

  return {
    passed:
      noIndex,
    detail:
      noIndex
        ? "noindex metadata pronađen"
        : "noindex metadata nije pronađen",
  };
}

async function inspectCatalog(
  response,
  businessSlug
) {
  let payload;

  try {
    payload =
      await response.json();
  } catch {
    return {
      passed: false,
      detail:
        "Catalog odgovor nije validan JSON.",
    };
  }

  const catalog =
    payload &&
    typeof payload ===
      "object"
      ? payload.catalog
      : null;

  const business =
    catalog &&
    typeof catalog ===
      "object"
      ? catalog.business
      : null;

  const reviews =
    catalog &&
    typeof catalog ===
      "object"
      ? catalog.reviews
      : null;

  const summary =
    catalog &&
    typeof catalog ===
      "object"
      ? catalog.reviewSummary
      : null;

  const config =
    catalog &&
    typeof catalog ===
      "object"
      ? catalog.reviewConfig
      : null;

  const passed =
    payload?.ok ===
      true &&
    payload?.source ===
      "supabase" &&
    business?.slug ===
      businessSlug &&
    Array.isArray(
      reviews
    ) &&
    summary &&
    typeof summary ===
      "object" &&
    config &&
    typeof config ===
      "object";

  return {
    passed,
    detail:
      passed
        ? {
            businessSlug:
              business.slug,
            reviewCount:
              reviews.length,
            ratedCount:
              typeof summary.ratedCount ===
                "number"
                ? summary.ratedCount
                : null,
            reviewsEnabled:
              typeof config.enabled ===
                "boolean"
                ? config.enabled
                : null,
          }
        : "Catalog review contract nije kompletan.",
  };
}

async function main() {
  const args =
    parseArgs(
      process.argv.slice(
        2
      )
    );

  if (
    !Number.isFinite(
      args.timeoutMs
    ) ||
    args.timeoutMs <
      1_000 ||
    args.timeoutMs >
      120_000
  ) {
    stop(
      "--timeout-ms mora biti između 1000 i 120000."
    );
  }

  const baseUrl =
    normalizeBaseUrl(
      args.baseUrl
    );

  const businessSlug =
    normalizeSlug(
      args.businessSlug
    );

  const encodedSlug =
    encodeURIComponent(
      businessSlug
    );

  const invalidToken =
    "invalid-review-smoke-token";

  const checks = [];

  checks.push(
    await runCheck({
      name:
        "platform-root",
      url:
        `${baseUrl}/`,
      allowedStatuses: [
        200,
      ],
      timeoutMs:
        args.timeoutMs,
    })
  );

  checks.push(
    await runCheck({
      name:
        "tenant-public-page",
      url:
        `${baseUrl}/salon/${encodedSlug}`,
      allowedStatuses: [
        200,
      ],
      timeoutMs:
        args.timeoutMs,
    })
  );

  checks.push(
    await runCheck({
      name:
        "tenant-catalog-review-contract",
      url:
        `${baseUrl}/api/catalog?businessSlug=${encodedSlug}`,
      allowedStatuses: [
        200,
      ],
      timeoutMs:
        args.timeoutMs,
      inspect:
        (
          response
        ) =>
          inspectCatalog(
            response,
            businessSlug
          ),
    })
  );

  checks.push(
    await runCheck({
      name:
        "direct-review-page",
      url:
        `${baseUrl}/reviews/${encodedSlug}`,
      allowedStatuses: [
        200,
      ],
      timeoutMs:
        args.timeoutMs,
      inspect:
        inspectHtmlNoIndex,
    })
  );

  checks.push(
    await runCheck({
      name:
        "invalid-invitation-page",
      url:
        `${baseUrl}/reviews/invitation/${invalidToken}`,
      allowedStatuses: [
        200,
      ],
      timeoutMs:
        args.timeoutMs,
      inspect:
        inspectHtmlNoIndex,
    })
  );

  checks.push(
    await runCheck({
      name:
        "cron-rejects-missing-secret",
      url:
        `${baseUrl}/api/cron/review-invitations`,
      allowedStatuses: [
        401,
      ],
      timeoutMs:
        args.timeoutMs,
    })
  );

  checks.push(
    await runCheck({
      name:
        "cron-rejects-wrong-secret",
      url:
        `${baseUrl}/api/cron/review-invitations`,
      options: {
        headers: {
          authorization:
            `Bearer ${WRONG_CRON_SECRET}`,
        },
      },
      allowedStatuses: [
        401,
      ],
      timeoutMs:
        args.timeoutMs,
    })
  );

  const passed =
    checks.every(
      (
        check
      ) =>
        check.passed
    );

  const report = {
    schemaVersion: 1,
    generatedAt:
      new Date().toISOString(),
    baseUrl,
    businessSlug,
    mode:
      "read-only-deployed-preflight",
    authorizedCronCalled:
      false,
    emailSent:
      false,
    passed,
    checks,
  };

  const outputDirectory =
    resolve(
      process.cwd(),
      args.outputDirectory
    );

  await mkdir(
    outputDirectory,
    {
      recursive:
        true,
    }
  );

  const fileName =
    `reviews-deployed-preflight-${new Date()
      .toISOString()
      .replace(
        /[:.]/gu,
        "-"
      )}.json`;

  const outputPath =
    resolve(
      outputDirectory,
      fileName
    );

  await writeFile(
    outputPath,
    `${JSON.stringify(
      report,
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(
    "\nREVIEWS DEPLOYED PREFLIGHT"
  );

  for (
    const check of
      checks
  ) {
    console.log(
      `${
        check.passed
          ? "[PASS]"
          : "[FAIL]"
      } ${check.name} — ${
        check.status ??
        "network-error"
      }`
    );

    if (
      !check.passed &&
      check.detail
    ) {
      console.log(
        `       ${typeof check.detail === "string"
          ? check.detail
          : JSON.stringify(
              check.detail
            )}`
      );
    }
  }

  console.log(
    `\n[REPORT] ${outputPath}`
  );

  console.log(
    "[AUTHORIZED CRON] NOT CALLED"
  );

  console.log(
    "[EMAIL] NOT SENT"
  );

  if (!passed) {
    process.exitCode = 1;
    return;
  }

  console.log(
    "[01G-B1 DEPLOYED PREFLIGHT] PASSED"
  );
}

await main();
