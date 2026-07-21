import { describe, expect, it } from "vitest";

import { validateContactRequest } from "./contact-validation";

const validRequest = {
  name: "Ana Petrović",
  studio: "Studio Ana",
  email: "ana@example.com",
  phone: "+381 60 123 456",
  studioType: "nails",
  message: "Želim bolji sajt i online zakazivanje za studio.",
  website: "",
};

describe("validateContactRequest", () => {
  it("normalizuje ispravan javni kontakt zahtev", () => {
    expect(validateContactRequest({ ...validRequest, email: " ANA@EXAMPLE.COM " })).toEqual({
      ok: true,
      value: { ...validRequest, email: "ana@example.com" },
    });
  });

  it("odbija neispravan email i prekratku poruku", () => {
    expect(validateContactRequest({ ...validRequest, email: "ana", message: "kratko" })).toEqual({
      ok: false,
      message: "Unesite ispravnu email adresu.",
    });
  });

  it("zadržava honeypot vrednost za route guard", () => {
    const result = validateContactRequest({ ...validRequest, website: "https://spam.example" });
    expect(result.ok && result.value.website).toBe("https://spam.example");
  });
});
