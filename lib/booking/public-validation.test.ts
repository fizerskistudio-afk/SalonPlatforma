import {
  describe,
  expect,
  it,
} from "vitest";

import {
  validatePublicBookingRequest,
} from "./public-validation";

const SERVICE_ID =
  "8b98f1a4-d8d5-4cc8-97bb-3b1295942f43";

const EMPLOYEE_ID =
  "3b4d94c8-6e3a-4d4f-a06a-d69e2b66f860";

function validPayload() {
  return {
    businessSlug:
      "mika-berberin",
    serviceId:
      SERVICE_ID,
    employeeId:
      EMPLOYEE_ID,
    startsAt:
      "2026-07-15T10:00:00+02:00",
    customer: {
      name:
        "  Petar Petrović  ",
      phone:
        "  +381 64 123 4567  ",
      email:
        "  PETAR@EXAMPLE.COM  ",
      note:
        "  Molim bez čekanja.  ",
    },
  };
}

function expectCode(
  input: unknown,
  code: string
) {
  const result =
    validatePublicBookingRequest(
      input
    );

  expect(
    result.ok
  ).toBe(false);

  if (result.ok) {
    throw new Error(
      "Expected validation error."
    );
  }

  expect(
    result.error.code
  ).toBe(code);

  expect(
    result.error.status
  ).toBe(400);
}

describe(
  "validatePublicBookingRequest",
  () => {
    it(
      "normalizes a valid payload",
      () => {
        const result =
          validatePublicBookingRequest(
            validPayload()
          );

        expect(
          result.ok
        ).toBe(true);

        if (!result.ok) {
          throw new Error(
            result.error.code
          );
        }

        expect(
          result.value
        ).toEqual({
          businessSlug:
            "mika-berberin",
          serviceId:
            SERVICE_ID,
          employeeId:
            EMPLOYEE_ID,
          startsAt:
            "2026-07-15T10:00:00+02:00",
          customerName:
            "Petar Petrović",
          customerPhone:
            "+381 64 123 4567",
          customerEmail:
            "petar@example.com",
          customerNote:
            "Molim bez čekanja.",
        });
      }
    );

    it(
      "accepts phone-only contact",
      () => {
        const payload =
          validPayload();

        payload.customer.email =
          " ";

        const result =
          validatePublicBookingRequest(
            payload
          );

        expect(
          result.ok
        ).toBe(true);

        if (result.ok) {
          expect(
            result.value
              .customerEmail
          ).toBeNull();
        }
      }
    );

    it(
      "accepts email-only contact",
      () => {
        const payload =
          validPayload();

        payload.customer.phone =
          " ";

        const result =
          validatePublicBookingRequest(
            payload
          );

        expect(
          result.ok
        ).toBe(true);

        if (result.ok) {
          expect(
            result.value
              .customerPhone
          ).toBeNull();
        }
      }
    );

    it(
      "rejects non-object input",
      () => {
        expectCode(
          [],
          "INVALID_REQUEST"
        );
      }
    );

    it(
      "requires business slug",
      () => {
        const payload =
          validPayload();

        payload.businessSlug =
          " ";

        expectCode(
          payload,
          "MISSING_BUSINESS_SLUG"
        );
      }
    );

    it(
      "rejects invalid business slug",
      () => {
        const payload =
          validPayload();

        payload.businessSlug =
          "Mika Berberin";

        expectCode(
          payload,
          "INVALID_BUSINESS_SLUG"
        );
      }
    );

    it(
      "rejects invalid service UUID",
      () => {
        const payload =
          validPayload();

        payload.serviceId =
          "service-1";

        expectCode(
          payload,
          "INVALID_SERVICE_ID"
        );
      }
    );

    it(
      "rejects invalid employee UUID",
      () => {
        const payload =
          validPayload();

        payload.employeeId =
          "employee-1";

        expectCode(
          payload,
          "INVALID_EMPLOYEE_ID"
        );
      }
    );

    it(
      "rejects invalid start time",
      () => {
        const payload =
          validPayload();

        payload.startsAt =
          "not-a-date";

        expectCode(
          payload,
          "INVALID_START_TIME"
        );
      }
    );

    it(
      "rejects short customer name",
      () => {
        const payload =
          validPayload();

        payload.customer.name =
          "P";

        expectCode(
          payload,
          "INVALID_CUSTOMER_NAME"
        );
      }
    );

    it(
      "requires phone or email",
      () => {
        const payload =
          validPayload();

        payload.customer.phone =
          " ";

        payload.customer.email =
          " ";

        expectCode(
          payload,
          "CUSTOMER_CONTACT_REQUIRED"
        );
      }
    );

    it(
      "rejects phone with fewer than six digits",
      () => {
        const payload =
          validPayload();

        payload.customer.phone =
          "+381 12";

        payload.customer.email =
          " ";

        expectCode(
          payload,
          "INVALID_CUSTOMER_PHONE"
        );
      }
    );

    it(
      "rejects invalid email",
      () => {
        const payload =
          validPayload();

        payload.customer.phone =
          " ";

        payload.customer.email =
          "invalid-email";

        expectCode(
          payload,
          "INVALID_CUSTOMER_EMAIL"
        );
      }
    );

    it(
      "rejects customer note over 2000 characters",
      () => {
        const payload =
          validPayload();

        payload.customer.note =
          "x".repeat(
            2001
          );

        expectCode(
          payload,
          "CUSTOMER_NOTE_TOO_LONG"
        );
      }
    );
  }
);
