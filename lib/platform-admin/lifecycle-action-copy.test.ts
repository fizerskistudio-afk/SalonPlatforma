import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getLifecycleActionLabel,
  getLifecycleConfirmationMessage,
} from "./lifecycle-action-copy";

describe(
  "platform lifecycle action copy",
  () => {
    it(
      "uses reactivation copy for suspended and archived tenants",
      () => {
        expect(
          getLifecycleActionLabel(
            "suspended",
            "draft"
          )
        ).toBe(
          "Reaktiviraj kao draft"
        );

        expect(
          getLifecycleActionLabel(
            "archived",
            "draft"
          )
        ).toBe(
          "Reaktiviraj kao draft"
        );

        expect(
          getLifecycleActionLabel(
            "published",
            "draft"
          )
        ).toBe(
          "Povuci u draft"
        );
      }
    );

    it(
      "makes the publish server readiness recheck explicit",
      () => {
        expect(
          getLifecycleConfirmationMessage(
            "published"
          )
        ).toContain(
          "Server će ponovo proveriti production readiness"
        );
      }
    );

    it.each([
      [
        "draft",
        "Javni sajt i booking neće biti dostupni",
      ],
      [
        "suspended",
        "privremeno isključeni",
      ],
      [
        "archived",
        "povratak ide prvo kroz draft",
      ],
    ] as const)(
      "describes the consequence of %s",
      (
        status,
        expected
      ) => {
        expect(
          getLifecycleConfirmationMessage(
            status
          )
        ).toContain(
          expected
        );
      }
    );
  }
);
