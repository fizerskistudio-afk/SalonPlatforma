import {
  describe,
  expect,
  it,
} from "vitest";

import {
  jsonError,
} from "@/lib/api/http";

describe("jsonError", () => {
  it("returns the stable API error contract", async () => {
    const response = jsonError(
      400,
      "Invalid request.",
      "INVALID_REQUEST"
    );

    expect(response.status).toBe(
      400
    );
    expect(
      response.headers.get(
        "cache-control"
      )
    ).toBe("no-store");
    expect(
      await response.json()
    ).toEqual({
      ok: false,
      message:
        "Invalid request.",
      code:
        "INVALID_REQUEST",
    });
  });

  it("preserves additional response headers", () => {
    const response = jsonError(
      429,
      "Too many requests.",
      "RATE_LIMITED",
      {
        headers: {
          "Retry-After":
            "60",
          "X-RateLimit-Limit":
            "90",
        },
      }
    );

    expect(
      response.headers.get(
        "retry-after"
      )
    ).toBe("60");
    expect(
      response.headers.get(
        "x-ratelimit-limit"
      )
    ).toBe("90");
    expect(
      response.headers.get(
        "cache-control"
      )
    ).toBe("no-store");
  });

  it("allows an explicit cache policy", () => {
    const response = jsonError(
      404,
      "Not found.",
      "NOT_FOUND",
      {
        cacheControl:
          "no-store, max-age=0",
      }
    );

    expect(
      response.headers.get(
        "cache-control"
      )
    ).toBe(
      "no-store, max-age=0"
    );
  });
});
