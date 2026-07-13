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

import {
  buildTenantReadiness,
  type TenantReadinessInput,
} from "@/lib/platform-admin/tenant-lifecycle";

const mocks =
  vi.hoisted(
    () => ({
      getPlatformAdminAccess:
        vi.fn(),
      createAdminClient:
        vi.fn(),
      loadTenantLifecycleContext:
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

vi.mock(
  "@/lib/platform-admin/tenant-lifecycle-server",
  () => ({
    loadTenantLifecycleContext:
      mocks.loadTenantLifecycleContext,
    TenantLifecycleLoadError:
      class TenantLifecycleLoadError extends Error {},
  })
);

import {
  PATCH,
} from "@/app/api/platform-admin/businesses/publication/route";

const UPDATED_AT =
  "2026-07-13T20:00:00.000Z";

function createRequest(
  status: string,
  expectedUpdatedAt = UPDATED_AT
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
        expectedUpdatedAt,
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
      status: "authorized",
      context: {
        userId: "user-id",
        email: "platform@example.com",
        role,
      },
    });
}

function readinessInput(
  overrides: Partial<TenantReadinessInput> = {}
): TenantReadinessInput {
  return {
    businessSlug: "demo-salon",
    templateReady: true,
    localesReady: true,
    contactReady: true,
    categoriesReady: true,
    servicesReady: true,
    bookingSettingsReady: true,
    employeesReady: true,
    serviceAssignmentsReady: true,
    workingHoursReady: true,
    ownerReady: true,
    ...overrides,
  };
}

function loadLifecycle(
  overrides: {
    publicationStatus?:
      "draft" |
      "published" |
      "suspended" |
      "archived";
    updatedAt?: string;
    readiness?: Partial<TenantReadinessInput>;
  } = {}
) {
  mocks.loadTenantLifecycleContext
    .mockResolvedValue({
      business: {
        id: "business-id",
        slug: "demo-salon",
        name: "Demo salon",
        publicationStatus:
          overrides.publicationStatus ??
          "draft",
        isActive:
          overrides.publicationStatus ===
            "suspended" ||
          overrides.publicationStatus ===
            "archived"
            ? false
            : true,
        updatedAt:
          overrides.updatedAt ??
          UPDATED_AT,
      },
      readiness:
        buildTenantReadiness(
          readinessInput(
            overrides.readiness
          )
        ),
    });
}

afterEach(
  () => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  }
);

describe(
  "platform-admin publication lifecycle",
  () => {
    it.each([
      "published",
      "draft",
      "suspended",
      "archived",
    ])(
      "rejects Sales before lifecycle data access when requesting %s",
      async (status) => {
        authorize("sales");

        const response =
          await PATCH(
            createRequest(status)
          );
        const payload =
          await response.json();

        expect(response.status).toBe(403);
        expect(payload.code).toBe(
          "PLATFORM_ADMIN_PERMISSION_DENIED"
        );
        expect(
          mocks.loadTenantLifecycleContext
        ).not.toHaveBeenCalled();
        expect(
          mocks.createAdminClient
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "blocks publish server-side and returns direct readiness CTAs",
      async () => {
        authorize("launch_manager");
        loadLifecycle({
          readiness: {
            ownerReady: false,
          },
        });

        const response =
          await PATCH(
            createRequest(
              "published"
            )
          );
        const payload =
          await response.json();

        expect(response.status).toBe(409);
        expect(payload.code).toBe(
          "TENANT_NOT_READY"
        );
        expect(payload.blockers).toEqual([
          expect.objectContaining({
            key: "owner",
            href: "/platform-admin/businesses/demo-salon/access",
          }),
        ]);
        expect(
          mocks.createAdminClient
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "rejects a stale lifecycle version before mutation",
      async () => {
        authorize("launch_manager");
        loadLifecycle({
          updatedAt:
            "2026-07-13T21:00:00.000Z",
        });

        const response =
          await PATCH(
            createRequest(
              "published"
            )
          );
        const payload =
          await response.json();

        expect(response.status).toBe(409);
        expect(payload.code).toBe(
          "LIFECYCLE_CHANGED"
        );
        expect(
          mocks.createAdminClient
        ).not.toHaveBeenCalled();
      }
    );

    it(
      "requires an archived tenant to reactivate through draft",
      async () => {
        authorize("launch_manager");
        loadLifecycle({
          publicationStatus:
            "archived",
        });

        const response =
          await PATCH(
            createRequest(
              "published"
            )
          );
        const payload =
          await response.json();

        expect(response.status).toBe(409);
        expect(payload.code).toBe(
          "INVALID_LIFECYCLE_TRANSITION"
        );
      }
    );

    it(
      "publishes atomically with optimistic concurrency and emits an audit event",
      async () => {
        authorize("launch_manager");
        loadLifecycle();

        const maybeSingle =
          vi.fn()
            .mockResolvedValue({
              data: {
                id: "business-id",
                slug: "demo-salon",
                publication_status:
                  "published",
                is_active: true,
                updated_at:
                  "2026-07-13T20:01:00.000Z",
              },
              error: null,
            });
        const query = {
          eq: vi.fn(),
          select: vi.fn(),
          maybeSingle,
        };
        query.eq.mockReturnValue(
          query
        );
        query.select.mockReturnValue(
          query
        );

        const update =
          vi.fn(
            () => query
          );
        mocks.createAdminClient
          .mockReturnValue({
            from: vi.fn(
              () => ({
                update,
              })
            ),
          });

        const info =
          vi.spyOn(
            console,
            "info"
          )
            .mockImplementation(
              () => undefined
            );

        const response =
          await PATCH(
            createRequest(
              "published"
            )
          );

        expect(response.status).toBe(200);
        expect(update).toHaveBeenCalledWith({
          publication_status:
            "published",
          is_active: true,
        });
        expect(query.eq).toHaveBeenNthCalledWith(
          1,
          "id",
          "business-id"
        );
        expect(query.eq).toHaveBeenNthCalledWith(
          2,
          "updated_at",
          UPDATED_AT
        );
        expect(info).toHaveBeenCalledWith(
          "Platform admin lifecycle event:",
          expect.objectContaining({
            event:
              "tenant.lifecycle.changed",
            previousStatus:
              "draft",
            nextStatus:
              "published",
          })
        );
      }
    );
  }
);
