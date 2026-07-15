import {
  readFileSync,
} from "node:fs";
import {
  join,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

function readSource(
  ...segments:
    string[]
): string {
  return readFileSync(
    join(
      process.cwd(),
      ...segments
    ),
    "utf8"
  ).replace(
    /\r\n/g,
    "\n"
  );
}

function functionSlice(
  source: string,
  functionName: string,
  nextFunctionName?: string
): string {
  const startMarker =
    `export async function ${functionName}`;

  const start =
    source.indexOf(
      startMarker
    );

  expect(
    start
  ).toBeGreaterThanOrEqual(
    0
  );

  if (!nextFunctionName) {
    return source.slice(
      start
    );
  }

  const end =
    source.indexOf(
      `export async function ${nextFunctionName}`,
      start +
        startMarker.length
    );

  expect(
    end
  ).toBeGreaterThan(
    start
  );

  return source.slice(
    start,
    end
  );
}

const STAFF_GATE_SOURCE =
  readSource(
    "lib",
    "product-packages",
    "staff-gates-server.ts"
  );

const STAFF_ACTION_SOURCE =
  readSource(
    "app",
    "staff",
    "(protected)",
    "calendar",
    "actions.ts"
  );

const CONNECT_ROUTE_SOURCE =
  readSource(
    "app",
    "api",
    "staff",
    "google-calendar",
    "connect",
    "route.ts"
  );

const CALLBACK_ROUTE_SOURCE =
  readSource(
    "app",
    "api",
    "admin",
    "google-calendar",
    "callback",
    "route.ts"
  );

const EMPLOYEE_SYNC_SOURCE =
  readSource(
    "lib",
    "google-calendar",
    "employee-sync.ts"
  );

describe(
  "staff calendar server package gates",
  () => {
    it(
      "exposes shared business-id package access without replacing authentication",
      () => {
        expect(
          STAFF_GATE_SOURCE
        ).toContain(
          "loadStaffProductFeatureServerAccessForBusinessId"
        );

        expect(
          STAFF_GATE_SOURCE
        ).toContain(
          '"PRODUCT_PACKAGE_REQUIRED"'
        );

        expect(
          STAFF_GATE_SOURCE
        ).toContain(
          "await requireStaff()"
        );

        expect(
          STAFF_GATE_SOURCE
        ).toMatch(
          /decision\s*\.entitled/
        );
      }
    );

    it(
      "guards disconnect after staff authentication and before deleting the connection",
      () => {
        const slice =
          functionSlice(
            STAFF_ACTION_SOURCE,
            "disconnectStaffGoogleCalendarAction",
            "syncUpcomingStaffBookingsAction"
          );

        const authIndex =
          slice.indexOf(
            "await requireStaff()"
          );

        const gateIndex =
          slice.indexOf(
            "await loadStaffProductFeatureServerAccessForBusinessId("
          );

        const deleteIndex =
          slice.indexOf(
            ".delete()"
          );

        expect(
          authIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          gateIndex
        ).toBeGreaterThan(
          authIndex
        );

        expect(
          deleteIndex
        ).toBeGreaterThan(
          gateIndex
        );

        expect(
          slice
        ).toContain(
          '"staff.calendar_connection"'
        );
      }
    );

    it(
      "guards manual upcoming sync before booking reads and employee sync imports",
      () => {
        const slice =
          functionSlice(
            STAFF_ACTION_SOURCE,
            "syncUpcomingStaffBookingsAction"
          );

        const authIndex =
          slice.indexOf(
            "await requireStaff()"
          );

        const gateIndex =
          slice.indexOf(
            "await loadStaffProductFeatureServerAccessForBusinessId("
          );

        expect(
          gateIndex
        ).toBeGreaterThan(
          authIndex
        );

        expect(
          gateIndex
        ).toBeLessThan(
          slice.indexOf(
            '.from("bookings")'
          )
        );

        expect(
          gateIndex
        ).toBeLessThan(
          slice.indexOf(
            '"@/lib/google-calendar/employee-sync"'
          )
        );

        expect(
          slice
        ).toContain(
          '"staff.employee_calendar_sync"'
        );
      }
    );

    it(
      "guards staff OAuth connect after membership verification and before state creation",
      () => {
        const membershipIndex =
          CONNECT_ROUTE_SOURCE.indexOf(
            "!employee"
          );

        const gateIndex =
          CONNECT_ROUTE_SOURCE.indexOf(
            "await loadStaffProductFeatureServerAccessForBusinessId("
          );

        const stateIndex =
          CONNECT_ROUTE_SOURCE.indexOf(
            "createGoogleOAuthState({"
          );

        expect(
          gateIndex
        ).toBeGreaterThan(
          membershipIndex
        );

        expect(
          stateIndex
        ).toBeGreaterThan(
          gateIndex
        );

        expect(
          CONNECT_ROUTE_SOURCE
        ).toContain(
          '"staff.calendar_connection"'
        );

        expect(
          CONNECT_ROUTE_SOURCE
        ).toContain(
          '"package_required"'
        );
      }
    );

    it(
      "rechecks employee package access in the OAuth callback before exchanging tokens",
      () => {
        const gateIndex =
          CALLBACK_ROUTE_SOURCE.indexOf(
            "await loadStaffProductFeatureServerAccessForBusinessId("
          );

        const exchangeIndex =
          CALLBACK_ROUTE_SOURCE.indexOf(
            "await exchangeGoogleAuthorizationCode("
          );

        const upsertIndex =
          CALLBACK_ROUTE_SOURCE.indexOf(
            ".upsert("
          );

        expect(
          gateIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          exchangeIndex
        ).toBeGreaterThan(
          gateIndex
        );

        expect(
          upsertIndex
        ).toBeGreaterThan(
          gateIndex
        );

        expect(
          CALLBACK_ROUTE_SOURCE
        ).toMatch(
          /stateTarget\s*===\s*"employee"/
        );

        expect(
          CALLBACK_ROUTE_SOURCE
        ).toContain(
          '"package_required"'
        );
      }
    );

    it(
      "uses the booking business assignment to skip automatic employee sync before calendar work",
      () => {
        expect(
          EMPLOYEE_SYNC_SOURCE
        ).toContain(
          "package_key"
        );

        expect(
          EMPLOYEE_SYNC_SOURCE
        ).toContain(
          "package_contract_version"
        );

        expect(
          EMPLOYEE_SYNC_SOURCE
        ).toContain(
          '"staff.employee_calendar_sync"'
        );

        const syncFunction =
          functionSlice(
            EMPLOYEE_SYNC_SOURCE,
            "syncBookingToEmployeeGoogleCalendar"
          );

        const gateIndex =
          syncFunction.indexOf(
            "const packageDecision ="
          );

        const statusIndex =
          syncFunction.indexOf(
            'booking.status ==='
          );

        const syncIndex =
          syncFunction.indexOf(
            "synchronizeCurrentEmployeeEvent("
          );

        expect(
          gateIndex
        ).toBeGreaterThanOrEqual(
          0
        );

        expect(
          statusIndex
        ).toBeGreaterThan(
          gateIndex
        );

        expect(
          syncIndex
        ).toBeGreaterThan(
          gateIndex
        );

        expect(
          syncFunction
        ).toContain(
          'action: "skipped"'
        );
      }
    );

    it(
      "does not gate base staff dashboard capabilities",
      () => {
        for (
          const featureKey of [
            "staff.portal",
            "staff.reservations",
            "staff.notes",
            "staff.time_off",
            "staff.schedule",
          ]
        ) {
          expect(
            STAFF_ACTION_SOURCE
          ).not.toContain(
            `"${featureKey}"`
          );

          expect(
            CONNECT_ROUTE_SOURCE
          ).not.toContain(
            `"${featureKey}"`
          );
        }
      }
    );
  }
);
