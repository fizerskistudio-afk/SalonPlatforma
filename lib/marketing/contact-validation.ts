export type ContactRequest = {
  name: string;
  studio: string;
  email: string;
  phone: string;
  studioType: string;
  message: string;
  website: string;
};

export type ContactValidationResult =
  | { ok: true; value: ContactRequest }
  | { ok: false; message: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STUDIO_TYPES = new Set(["beauty-salon", "hair-salon", "barbershop", "nails", "spa-wellness", "other"]);

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\r\n/g, "\n");
  return normalized.length <= max ? normalized : null;
}

export function validateContactRequest(input: unknown): ContactValidationResult {
  const source = record(input);
  if (!source) return { ok: false, message: "Podaci forme nisu ispravni." };

  const name = text(source.name, 80);
  const studio = text(source.studio, 100);
  const email = text(source.email, 160)?.toLowerCase() ?? null;
  const phone = text(source.phone, 40);
  const studioType = text(source.studioType, 40);
  const message = text(source.message, 1200);
  const website = text(source.website, 200);

  if (!name || name.length < 2 || !studio || studio.length < 2) {
    return { ok: false, message: "Unesite ime i naziv studija." };
  }
  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, message: "Unesite ispravnu email adresu." };
  }
  if (!studioType || !STUDIO_TYPES.has(studioType)) {
    return { ok: false, message: "Izaberite tip studija." };
  }
  if (!message || message.length < 10) {
    return { ok: false, message: "Poruka mora imati najmanje 10 karaktera." };
  }
  if (phone === null || website === null) {
    return { ok: false, message: "Podaci forme nisu ispravni." };
  }

  return { ok: true, value: { name, studio, email, phone, studioType, message, website } };
}
