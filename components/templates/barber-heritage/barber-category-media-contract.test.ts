import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const source = (path: string) =>
  readFileSync(join(ROOT, path), "utf8").replace(/\r\n/g, "\n");

describe("Barber category media contract", () => {
  it("adds media to categories but not services", () => {
    const types = source("lib/types.ts");
    expect(types).toContain("imageUrl?: string;");
    expect(types).toContain("imagePosition?: string;");
    const service = types.slice(
      types.indexOf("export type Service ="),
      types.indexOf("export type Employee =")
    );
    expect(service).not.toContain("imageUrl");
  });

  it("maps media through public and admin catalogs", () => {
    for (const path of ["lib/catalog/server.ts", "lib/admin/services.ts"]) {
      const value = source(path);
      for (const marker of ["image_url", "image_position", "imageUrl:", "imagePosition:"]) {
        expect(value).toContain(marker);
      }
    }
  });

  it("validates and tenant-scopes category media writes", () => {
    const actions = source("app/admin/(protected)/services/actions.ts");
    for (const marker of [
      "imageUrl?: string;",
      "imagePosition?: string;",
      "isValidPublicImageUrl",
      "isValidImagePosition",
      "image_url: imageUrl",
      "image_position:",
      '.eq("business_id", admin.business.id)',
    ]) expect(actions).toContain(marker);
  });

  it("exposes URL, crop and preview in salon admin", () => {
    const admin = source("components/admin/services/ServiceCatalogActions.tsx");
    for (const marker of [
      "imageUrl: string;",
      "imagePosition: string;",
      "URL slike kategorije",
      "Fokus slike",
      "Pregled slike kategorije",
    ]) expect(admin).toContain(marker);
  });

  it("uses preloaded Unsplash fallback layers and reduced motion", () => {
    const backdrop = source(
      "components/templates/barber-heritage/desktop/BarberDesktopServicesBackdrop.tsx"
    );
    for (const marker of [
      "CATEGORY_FALLBACK_MEDIA",
      "images.unsplash.com",
      "activeCategoryId",
      "category.imageUrl",
      "category.imagePosition",
      "duration-500",
      "motion-reduce:duration-150",
    ]) expect(backdrop).toContain(marker);
  });

  it("keeps migration category-only and non-destructive", () => {
    const sql = source(
      "supabase/migrations/031_service_category_media.sql"
    );
    expect(sql).toContain("alter table public.service_categories");
    expect(sql).toContain("add column if not exists image_url text");
    expect(sql).toContain("add column if not exists image_position text");
    expect(sql).not.toContain("alter table public.services");
    expect(sql).not.toContain("drop column");
  });
});
