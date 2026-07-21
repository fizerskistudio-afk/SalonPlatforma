import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const page = readFileSync("app/page.tsx", "utf8");
const landing = readFileSync("components/marketing/ordum/OrdumLandingPage.tsx", "utf8");
const route = readFileSync("app/api/contact/route.ts", "utf8");

describe("PLATFORM-LANDING-ORDUM-01A acceptance", () => {
  it("koristi potvrđene live tenant linkove kroz shared hostname boundary", () => {
    expect(page).toContain('buildTenantPublicUrl("heritage-barber-demo")');
    expect(page).toContain('buildTenantPublicUrl("atelier-luna-nails")');
  });

  it("ostavlja landing sekcije modularnim i kontakt client granicu izdvojenom", () => {
    expect(landing).toContain("<OrdumContactForm />");
    expect(landing).toContain('id="platforma"');
    expect(landing).toContain('id="demo"');
    expect(landing).toContain('id="paketi"');
  });

  it("kontakt route koristi request limit, validaciju, honeypot i rate limit", () => {
    expect(route).toContain("readJsonBodyWithLimit");
    expect(route).toContain("validateContactRequest");
    expect(route).toContain("validation.value.website");
    expect(route).toContain("consumeRateLimit");
    expect(route).toContain('failureMode: "closed"');
  });
});
