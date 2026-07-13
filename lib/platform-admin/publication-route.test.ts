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
  PATCH,
} from "@/app/api/platform-admin/businesses/publication/route";

function createRequest(
  status: string
) {
  return new NextRequest(
    "http://localhost:3000/api/platform-admin/businesses/publication",
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        businessSlug:
          "demo-salon",
        status,
      }),
    }
  );
}

function authorize(
  role:
    | "super_admin"
    | "sales"
    | "launch_manager"
    | "it"
) {
  mocks.getPlatformAdminAccess
    .mockResolvedValue({
      status:
        "authorized",
      context: {
        userId:
          "user-id",
        email:
          "platform@example.com",
        role,
      },
    });
}

afterEach(
  () => {
    vi.clearAllMocks();
  }
);

describe(
  "platform-admin publication authorization",
  () => {
    it.each([
      "published",
      "draft",
      "suspended",
      "archived",
    ])(
      "rejects Sales before database access when requesting %s",
      async (
        status
      ) => {
        authorize(
          "sales"
        );

        const response =
          await PATCH(
            createRequest(
              status
            )
          );

        const payload =
          await response.json();

        expect(
          response.status
        ).toBe(403);

        expect(
          payload.code
        ).toBe(
          "PLATFORM_ADMIN_PERMISSION_DENIED"
        );

        expect(
          mocks.createAdminClient
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "allows a launch manager to publish and persists the operational state",
      async () => {
        authorize(
          "launch_manager"
        );

        const maybeSingle =
          vi.fn()
            .mockResolvedValue({
              data: {
                slug:
                  "demo-salon",
                publication_status:
                  "published",
                is_active:
                  true,
              },
              error: null,
            });

        const select =
          vi.fn(
            () => ({
              maybeSingle,
            })
          );

        const eq =
          vi.fn(
            () => ({
              select,
            })
          );

        const update =
          vi.fn(
            () => ({
              eq,
            })
          );

        const from =
          vi.fn(
            () => ({
              update,
            })
          );

        mocks.createAdminClient
          .mockReturnValue({
            from,
          });

        const response =
          await PATCH(
            createRequest(
              "published"
            )
          );

        expect(
          response.status
        ).toBe(200);

        expect(
          update
        ).toHaveBeenCalledWith({
          publication_status:
            "published",
          is_active:
            true,
        });
      }
    );
  }
);
