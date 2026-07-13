import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  NextRequest,
} from "next/server";

const mocks =
  vi.hoisted(
    () => ({
      getPlatformAdminAccess:
        vi.fn(),
      createAdminClient:
        vi.fn(),
    })
  );

vi.mock(
  "@/lib/auth/platform-admin",
  () => ({
    getPlatformAdminAccess:
      mocks.getPlatformAdminAccess,
  })
);

vi.mock(
  "@/lib/supabase/admin",
  () => ({
    createAdminClient:
      mocks.createAdminClient,
  })
);

import {
  PUT,
} from "@/app/api/platform-admin/businesses/profile/route";

afterEach(
  () => {
    vi.clearAllMocks();
  }
);

describe(
  "platform-admin profile lifecycle boundary",
  () => {
    it(
      "rejects legacy isActive writes before database access",
      async () => {
        mocks.getPlatformAdminAccess
          .mockResolvedValue({
            status: "authorized",
            context: {
              userId: "user-id",
              email: "platform@example.com",
              role: "super_admin",
            },
          });

        const request =
          new NextRequest(
            "http://localhost:3000/api/platform-admin/businesses/profile",
            {
              method: "PUT",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                businessSlug:
                  "lumiere-studio",
                expectedUpdatedAt:
                  "2026-07-13T20:00:00.000Z",
                profile: {
                  name: "Lumière Studio",
                  phone: "+38970000000",
                  email: "hello@example.com",
                  tagline: "Hair studio",
                  description: "Opis",
                  address: "Adresa 1",
                  city: "Skopje",
                  country: "North Macedonia",
                  isActive: false,
                },
              }),
            }
          );

        const response =
          await PUT(request);
        const payload =
          await response.json();

        expect(response.status).toBe(400);
        expect(payload.code).toBe(
          "LIFECYCLE_FIELD_NOT_ALLOWED"
        );
        expect(
          mocks.createAdminClient
        ).not.toHaveBeenCalled();
      }
    );
  }
);
