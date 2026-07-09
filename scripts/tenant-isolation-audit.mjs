import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import { createClient } from "@supabase/supabase-js";

const ENV_FILES = [
  ".env",
  ".env.local",
  ".env.tenant-isolation.local",
];

const PRIVATE_TABLES = [
  "business_members",
  "bookings",
  "customers",
  "business_email_settings",
  "google_calendar_connections",
  "employee_google_calendar_connections",
  "staff_time_off_requests",
];

function parseEnvLine(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const separatorIndex = trimmed.indexOf("=");

  if (separatorIndex < 1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  value = value.replace(/\\n/g, "\n");

  return key ? { key, value } : null;
}

function loadEnvFiles() {
  for (const fileName of ENV_FILES) {
    const filePath = path.resolve(process.cwd(), fileName);

    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const entry = parseEnvLine(line);

      if (!entry || process.env[entry.key] !== undefined) {
        continue;
      }

      process.env[entry.key] = entry.value;
    }
  }
}

function getEnv(...names) {
  for (const name of names) {
    const value = process.env[name]?.trim();

    if (value) {
      return value;
    }
  }

  return null;
}

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, "");
}

function isMissingRelationError(error) {
  const text = [
    error?.message,
    error?.details,
    error?.hint,
    error?.code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("does not exist") ||
    text.includes("could not find the table") ||
    text.includes("schema cache") ||
    error?.code === "42P01" ||
    error?.code === "PGRST205"
  );
}

function isPermissionError(error) {
  const text = [
    error?.message,
    error?.details,
    error?.hint,
    error?.code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    text.includes("permission denied") ||
    text.includes("row-level security") ||
    error?.code === "42501"
  );
}

class Reporter {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.warnings = 0;
  }

  pass(message) {
    this.passed += 1;
    console.log(`PASS  ${message}`);
  }

  fail(message) {
    this.failed += 1;
    console.error(`FAIL  ${message}`);
  }

  skip(message) {
    this.skipped += 1;
    console.log(`SKIP  ${message}`);
  }

  warn(message) {
    this.warnings += 1;
    console.warn(`WARN  ${message}`);
  }

  section(title) {
    console.log(`\n=== ${title} ===`);
  }

  finish() {
    console.log("\n=== REZULTAT ===");
    console.log(`PASS: ${this.passed}`);
    console.log(`FAIL: ${this.failed}`);
    console.log(`SKIP: ${this.skipped}`);
    console.log(`WARN: ${this.warnings}`);

    if (this.failed > 0) {
      console.error("\nTenant isolation audit NIJE prošao.");
      process.exitCode = 1;
      return;
    }

    console.log("\nTenant isolation audit je prošao bez detektovanog cross-tenant curenja.");
  }
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    redirect: "manual",
    cache: "no-store",
    ...options,
  });

  return {
    response,
    text: await response.text(),
  };
}

async function fetchJson(url, options = {}) {
  const { response, text } = await fetchText(url, options);
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    // Caller reports malformed JSON with response details.
  }

  return { response, text, payload };
}

function getFutureDate(daysFromNow = 7) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

function getCatalogServiceId(catalog) {
  if (!Array.isArray(catalog?.services)) {
    return null;
  }

  const activeService = catalog.services.find(
    (service) => service && service.isActive !== false && typeof service.id === "string"
  );

  return activeService?.id ?? null;
}

function getCatalogEmployeeId(catalog) {
  if (!Array.isArray(catalog?.employees)) {
    return null;
  }

  const activeEmployee = catalog.employees.find(
    (employee) => employee && employee.isActive !== false && typeof employee.id === "string"
  );

  return activeEmployee?.id ?? null;
}

async function inspectPublicTenant(baseUrl, tenant, reporter) {
  reporter.section(`Javni tenant: ${tenant.slug}`);

  const catalogUrl = new URL("/api/catalog", baseUrl);
  catalogUrl.searchParams.set("businessSlug", tenant.slug);

  const catalogResult = await fetchJson(catalogUrl);

  if (!catalogResult.response.ok || !catalogResult.payload?.ok) {
    reporter.fail(
      `${tenant.slug}: /api/catalog nije uspeo (${catalogResult.response.status}).`
    );
    return null;
  }

  const catalog = catalogResult.payload.catalog;
  const business = catalog?.business;

  if (business?.slug === tenant.slug) {
    reporter.pass(`${tenant.slug}: katalog pripada traženom tenant-u.`);
  } else {
    reporter.fail(
      `${tenant.slug}: katalog je vratio pogrešan slug (${business?.slug ?? "missing"}).`
    );
  }

  if (typeof business?.id === "string" && business.id) {
    reporter.pass(`${tenant.slug}: katalog sadrži stabilan business ID.`);
  } else {
    reporter.fail(`${tenant.slug}: katalog nema business ID potreban za audit.`);
  }

  const salonResult = await fetchText(`${baseUrl}/salon/${tenant.slug}`);

  if (salonResult.response.ok) {
    reporter.pass(`${tenant.slug}: javna salon ruta vraća 200.`);
  } else {
    reporter.fail(
      `${tenant.slug}: javna salon ruta vraća ${salonResult.response.status}.`
    );
  }

  const expectedName = typeof business?.name === "string" ? business.name.trim() : "";
  const titleMatch = salonResult.text.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch?.[1]?.trim() ?? "";

  if (expectedName && title.includes(expectedName)) {
    reporter.pass(`${tenant.slug}: HTML title sadrži naziv salona.`);
  } else {
    reporter.fail(
      `${tenant.slug}: HTML title ne sadrži očekivani naziv (${expectedName || "missing name"}).`
    );
  }

  return {
    ...tenant,
    businessId: business?.id ?? null,
    businessName: expectedName,
    catalog,
    serviceId: getCatalogServiceId(catalog),
    employeeId: getCatalogEmployeeId(catalog),
  };
}

async function inspectRobotsAndSitemap(baseUrl, reporter) {
  reporter.section("Robots i sitemap");

  const robotsResult = await fetchText(`${baseUrl}/robots.txt`);

  if (!robotsResult.response.ok) {
    reporter.fail(`/robots.txt vraća ${robotsResult.response.status}.`);
  } else {
    const required = ["/admin/", "/staff/", "/platform-admin/", "/api/"];

    for (const value of required) {
      if (robotsResult.text.includes(value)) {
        reporter.pass(`robots.txt blokira ${value}`);
      } else {
        reporter.fail(`robots.txt ne blokira ${value}`);
      }
    }
  }

  const sitemapResult = await fetchText(`${baseUrl}/sitemap.xml`);

  if (!sitemapResult.response.ok) {
    reporter.fail(`/sitemap.xml vraća ${sitemapResult.response.status}.`);
    return;
  }

  const privateFragments = ["/admin", "/staff", "/platform-admin", "/api/"];
  const leakedFragment = privateFragments.find((fragment) =>
    sitemapResult.text.includes(fragment)
  );

  if (leakedFragment) {
    reporter.fail(`sitemap.xml sadrži privatnu putanju: ${leakedFragment}`);
  } else {
    reporter.pass("sitemap.xml ne sadrži privatne rute.");
  }
}

async function inspectCrossTenantAvailability(
  baseUrl,
  firstTenant,
  secondTenant,
  reporter
) {
  reporter.section("Cross-tenant public API pokušaji");

  if (!firstTenant?.serviceId || !secondTenant?.serviceId) {
    reporter.skip("Cross-tenant availability test: oba tenant-a nemaju dostupnu uslugu.");
    return;
  }

  const testDate = getFutureDate(7);

  for (const [target, foreign] of [
    [firstTenant, secondTenant],
    [secondTenant, firstTenant],
  ]) {
    const url = new URL("/api/availability", baseUrl);
    url.searchParams.set("businessSlug", target.slug);
    url.searchParams.set("serviceId", foreign.serviceId);
    url.searchParams.set("date", testDate);

    const result = await fetchJson(url);
    const slotCount = Array.isArray(result.payload?.slots)
      ? result.payload.slots.length
      : Number(result.payload?.count ?? 0);

    if (result.response.ok && slotCount > 0) {
      reporter.fail(
        `${target.slug}: prihvaćena je usluga drugog tenant-a (${foreign.slug}) i vraćeni su slotovi.`
      );
      continue;
    }

    if (result.response.ok && slotCount === 0) {
      reporter.pass(
        `${target.slug}: usluga tenant-a ${foreign.slug} nije vratila nijedan termin.`
      );
      continue;
    }

    if ([400, 404, 409, 422].includes(result.response.status)) {
      reporter.pass(
        `${target.slug}: strana usluga je odbijena statusom ${result.response.status}.`
      );
      continue;
    }

    reporter.warn(
      `${target.slug}: strana usluga nije procurila, ali API je vratio ${result.response.status}; proveriti error contract.`
    );
  }
}

function buildActors(tenants) {
  const actors = [];

  for (const tenant of tenants) {
    for (const role of ["OWNER", "MANAGER", "STAFF"]) {
      const email = getEnv(`TENANT_QA_${tenant.key}_${role}_EMAIL`);
      const password = getEnv(`TENANT_QA_${tenant.key}_${role}_PASSWORD`);

      if (!email && !password) {
        continue;
      }

      actors.push({
        tenantKey: tenant.key,
        tenantSlug: tenant.slug,
        role: role.toLowerCase(),
        email,
        password,
      });
    }
  }

  return actors;
}

function createSupabaseClient(url, anonKey) {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function inspectActorRls(
  actor,
  expectedTenant,
  otherTenant,
  supabaseUrl,
  anonKey,
  reporter
) {
  reporter.section(
    `RLS: ${actor.tenantSlug} / ${actor.role} / ${actor.email ?? "missing email"}`
  );

  if (!actor.email || !actor.password) {
    reporter.fail(`${actor.tenantSlug} ${actor.role}: email i password moraju biti uneti zajedno.`);
    return;
  }

  if (!expectedTenant?.businessId || !otherTenant?.businessId) {
    reporter.skip(`${actor.tenantSlug} ${actor.role}: nedostaju business ID vrednosti.`);
    return;
  }

  const client = createSupabaseClient(supabaseUrl, anonKey);
  const { data: authData, error: authError } = await client.auth.signInWithPassword({
    email: actor.email,
    password: actor.password,
  });

  if (authError || !authData.user) {
    reporter.fail(
      `${actor.tenantSlug} ${actor.role}: prijava nije uspela (${authError?.message ?? "no user"}).`
    );
    return;
  }

  reporter.pass(`${actor.tenantSlug} ${actor.role}: Supabase prijava uspešna.`);

  const membershipResult = await client
    .from("business_members")
    .select("id,business_id,user_id,role,is_active,employee_id")
    .eq("user_id", authData.user.id)
    .eq("is_active", true);

  if (membershipResult.error) {
    reporter.fail(
      `${actor.tenantSlug} ${actor.role}: aktivno članstvo nije moguće pročitati (${membershipResult.error.message}).`
    );
    await client.auth.signOut();
    return;
  }

  const memberships = membershipResult.data ?? [];
  const expectedMembership = memberships.find(
    (membership) => membership.business_id === expectedTenant.businessId
  );
  const foreignMembership = memberships.find(
    (membership) => membership.business_id === otherTenant.businessId
  );

  if (!expectedMembership) {
    reporter.fail(`${actor.tenantSlug} ${actor.role}: nema aktivno članstvo očekivanog tenant-a.`);
  } else if (expectedMembership.role !== actor.role) {
    reporter.fail(
      `${actor.tenantSlug}: očekivana uloga ${actor.role}, dobijena ${expectedMembership.role}.`
    );
  } else {
    reporter.pass(`${actor.tenantSlug} ${actor.role}: uloga i business ID su ispravni.`);
  }

  if (foreignMembership) {
    reporter.fail(
      `${actor.tenantSlug} ${actor.role}: nalog ima aktivno članstvo i za strani tenant ${otherTenant.slug}.`
    );
  } else {
    reporter.pass(`${actor.tenantSlug} ${actor.role}: nema aktivno članstvo drugog test tenant-a.`);
  }

  if (actor.role === "staff") {
    if (expectedMembership?.employee_id) {
      reporter.pass(`${actor.tenantSlug} staff: članstvo je povezano sa zaposlenim.`);
    } else {
      reporter.fail(`${actor.tenantSlug} staff: članstvo nema employee_id.`);
    }
  }

  for (const table of PRIVATE_TABLES) {
    const ownResult = await client
      .from(table)
      .select("business_id")
      .eq("business_id", expectedTenant.businessId)
      .limit(5);

    if (ownResult.error) {
      if (isMissingRelationError(ownResult.error)) {
        reporter.skip(`${table}: tabela ne postoji u ovoj verziji šeme.`);
        continue;
      }

      if (isPermissionError(ownResult.error)) {
        reporter.skip(`${table}: direktan SELECT nije dozvoljen ovoj ulozi.`);
        continue;
      }

      reporter.warn(`${table}: own-tenant query greška (${ownResult.error.message}).`);
      continue;
    }

    const ownLeak = (ownResult.data ?? []).some(
      (row) => row.business_id !== expectedTenant.businessId
    );

    if (ownLeak) {
      reporter.fail(`${table}: own query je vratio red drugog tenant-a.`);
    }

    const foreignResult = await client
      .from(table)
      .select("business_id")
      .eq("business_id", otherTenant.businessId)
      .limit(5);

    if (foreignResult.error) {
      if (isPermissionError(foreignResult.error)) {
        reporter.pass(`${table}: cross-tenant SELECT je odbijen dozvolama.`);
        continue;
      }

      if (isMissingRelationError(foreignResult.error)) {
        reporter.skip(`${table}: tabela ne postoji u ovoj verziji šeme.`);
        continue;
      }

      reporter.warn(`${table}: cross-tenant query greška (${foreignResult.error.message}).`);
      continue;
    }

    const foreignRows = foreignResult.data ?? [];

    if (foreignRows.length > 0) {
      reporter.fail(
        `${table}: ${actor.tenantSlug} ${actor.role} može da pročita ${foreignRows.length} red(ova) tenant-a ${otherTenant.slug}.`
      );
    } else {
      reporter.pass(`${table}: nema cross-tenant redova za ${actor.role}.`);
    }
  }

  await client.auth.signOut();
}

async function main() {
  loadEnvFiles();

  const reporter = new Reporter();
  const baseUrl = normalizeBaseUrl(
    getEnv("TENANT_QA_BASE_URL") ?? "http://localhost:3000"
  );
  const supabaseUrl = getEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const anonKey = getEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY"
  );

  const tenants = [
    {
      key: "MIKA",
      slug: getEnv("TENANT_QA_MIKA_SLUG") ?? "mika-berberin",
    },
    {
      key: "LUMIERE",
      slug: getEnv("TENANT_QA_LUMIERE_SLUG") ?? "lumiere-studio",
    },
  ];

  console.log("TENANT-ISOLATION-QA-01");
  console.log(`Base URL: ${baseUrl}`);

  const resolvedTenants = [];

  for (const tenant of tenants) {
    try {
      resolvedTenants.push(
        await inspectPublicTenant(baseUrl, tenant, reporter)
      );
    } catch (error) {
      reporter.fail(
        `${tenant.slug}: javni audit je prekinut (${error instanceof Error ? error.message : String(error)}).`
      );
      resolvedTenants.push(null);
    }
  }

  try {
    await inspectRobotsAndSitemap(baseUrl, reporter);
  } catch (error) {
    reporter.fail(
      `Robots/sitemap audit je prekinut (${error instanceof Error ? error.message : String(error)}).`
    );
  }

  if (resolvedTenants[0] && resolvedTenants[1]) {
    try {
      await inspectCrossTenantAvailability(
        baseUrl,
        resolvedTenants[0],
        resolvedTenants[1],
        reporter
      );
    } catch (error) {
      reporter.fail(
        `Cross-tenant availability audit je prekinut (${error instanceof Error ? error.message : String(error)}).`
      );
    }
  }

  const actors = buildActors(tenants);

  if (actors.length === 0) {
    reporter.skip(
      "RLS login audit nije pokrenut: nisu uneti TENANT_QA_* kredencijali. Javni testovi su ipak izvršeni."
    );
  } else if (!supabaseUrl || !anonKey) {
    reporter.fail(
      "RLS audit zahteva NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (ili legacy ANON_KEY)."
    );
  } else if (!resolvedTenants[0] || !resolvedTenants[1]) {
    reporter.fail("RLS audit zahteva uspešno učitana oba test tenant-a.");
  } else {
    for (const actor of actors) {
      const expectedTenant = resolvedTenants.find(
        (tenant) => tenant?.key === actor.tenantKey
      );
      const otherTenant = resolvedTenants.find(
        (tenant) => tenant && tenant.key !== actor.tenantKey
      );

      try {
        await inspectActorRls(
          actor,
          expectedTenant,
          otherTenant,
          supabaseUrl,
          anonKey,
          reporter
        );
      } catch (error) {
        reporter.fail(
          `${actor.tenantSlug} ${actor.role}: RLS audit je prekinut (${error instanceof Error ? error.message : String(error)}).`
        );
      }
    }
  }

  reporter.finish();
}

await main();
