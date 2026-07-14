import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

const mocks =
  vi.hoisted(
    () => ({
      createAdminClient:
        vi.fn(),
      getUserById:
        vi.fn(),
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
  loadTenantLifecycleContext,
} from "./tenant-lifecycle-server";

type QueryResult = {
  data: unknown;
  error: unknown;
  count?: number | null;
};

function queryBuilder(
  result: QueryResult
) {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle:
      vi.fn(
        () =>
          Promise.resolve(
            result
          )
      ),
    then: (
      resolve: (
        value: QueryResult
      ) => unknown,
      reject: (
        reason: unknown
      ) => unknown
    ) =>
      Promise.resolve(
        result
      ).then(
        resolve,
        reject
      ),
  };

  query.select.mockReturnValue(
    query
  );
  query.eq.mockReturnValue(
    query
  );

  return query;
}

afterEach(
  () => {
    vi.clearAllMocks();
  }
);

describe(
  "tenant lifecycle server loader",
  () => {
    it(
      "derives production readiness only from active and connected records",
      async () => {
        const results: Record<
          string,
          QueryResult
        > = {
          businesses: {
            data: {
              id: "business-id",
              slug: "demo-salon",
              name: "Demo salon",
              phone: "+38970000000",
              email: null,
              default_locale: "sr-Latn",
              supported_locales: [
                "sr-Latn",
                "en",
              ],
              template_key: "lumiere",
              publication_status: "draft",
              is_active: true,
              updated_at: "2026-07-13T20:00:00.000Z",
            },
            error: null,
          },
          booking_settings: {
            data: {
              business_id: "business-id",
            },
            error: null,
          },
          service_categories: {
            data: [
              {
                id: "category-id",
              },
            ],
            error: null,
          },
          services: {
            data: [
              {
                id: "service-id",
                category_id: "category-id",
              },
            ],
            error: null,
          },
          employees: {
            data: [
              {
                id: "employee-id",
              },
            ],
            error: null,
          },
          employee_services: {
            data: [
              {
                employee_id: "employee-id",
                service_id: "service-id",
              },
            ],
            error: null,
          },
          working_hours: {
            data: [
              {
                employee_id: null,
                open_time: "09:00:00",
                close_time: "17:00:00",
                is_closed: false,
              },
            ],
            error: null,
          },
          business_members: {
            data: [
              {
                id: "owner-membership-id",
                user_id: "owner-user-id",
                is_active: true,
              },
            ],
            error: null,
          },
        };

        mocks.getUserById
          .mockResolvedValue({
            data: {
              user: {
                invited_at: null,
                email_confirmed_at:
                  "2026-07-13T19:00:00.000Z",
                last_sign_in_at:
                  "2026-07-13T19:05:00.000Z",
                app_metadata: {
                  must_change_password:
                    false,
                },
              },
            },
            error: null,
          });

        mocks.createAdminClient
          .mockReturnValue({
            from: vi.fn(
              (table: string) =>
                queryBuilder(
                  results[table]
                )
            ),
            auth: {
              admin: {
                getUserById:
                  mocks.getUserById,
              },
            },
          });

        const lifecycle =
          await loadTenantLifecycleContext(
            "demo-salon"
          );

        expect(lifecycle).not.toBeNull();
        expect(
          lifecycle?.readiness
            .previewReady
        ).toBe(true);
        expect(
          lifecycle?.readiness
            .productionReady
        ).toBe(true);
        expect(
          lifecycle?.readiness
            .blockers
        ).toEqual([]);

        mocks.getUserById
          .mockResolvedValue({
            data: {
              user: {
                invited_at: null,
                email_confirmed_at:
                  "2026-07-13T19:00:00.000Z",
                last_sign_in_at:
                  "2026-07-13T19:05:00.000Z",
                app_metadata: {
                  must_change_password:
                    true,
                },
              },
            },
            error: null,
          });

        const pendingLifecycle =
          await loadTenantLifecycleContext(
            "demo-salon"
          );

        expect(
          pendingLifecycle?.readiness
            .ownerAccessReady
        ).toBe(false);
        expect(
          pendingLifecycle?.readiness
            .productionReady
        ).toBe(false);
        expect(
          pendingLifecycle?.readiness
            .blockers
        ).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              key: "owner",
            }),
          ])
        );
      }
    );
  }
);
