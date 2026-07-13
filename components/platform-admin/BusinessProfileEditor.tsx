"use client";

import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  AlertCircle,
  Globe2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  Save,
} from "lucide-react";

type BusinessProfile = {
  name: string;
  phone: string;
  email: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  country: string;
};

type BusinessProfileEditorProps = {
  businessSlug: string;
  defaultLocale: string;
  expectedUpdatedAt: string;
  initialProfile: BusinessProfile;
};

type UpdateBusinessProfileResponse = {
  ok?: boolean;
  message?: string;
  code?: string;

  business?: {
    slug?: string;
    updated_at?: string;
  };
};

const EMAIL_PATTERN =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BusinessProfileEditor({
  businessSlug,
  defaultLocale,
  expectedUpdatedAt,
  initialProfile,
}: BusinessProfileEditorProps) {
  const router =
    useRouter();

  const [
    profile,
    setProfile,
  ] =
    useState<BusinessProfile>(
      initialProfile
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    );

  const [
    errorCode,
    setErrorCode,
  ] =
    useState<string | null>(
      null
    );

  function updateField<
    Key extends keyof BusinessProfile,
  >(
    key: Key,
    value: BusinessProfile[Key]
  ) {
    setProfile(
      (currentProfile) => ({
        ...currentProfile,
        [key]: value,
      })
    );

    setError(
      null
    );

    setErrorCode(
      null
    );
  }

  function validateProfile(): string | null {
    const normalizedName =
      profile.name.trim();

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 120
    ) {
      return "Naziv salona mora imati između 2 i 120 karaktera.";
    }

    const normalizedPhone =
      profile.phone.trim();

    if (
      normalizedPhone.length > 40
    ) {
      return "Telefon salona može imati najviše 40 karaktera.";
    }

    const normalizedEmail =
      profile.email.trim();

    if (
      normalizedEmail &&
      (
        normalizedEmail.length > 254 ||
        !EMAIL_PATTERN.test(
          normalizedEmail
        )
      )
    ) {
      return "Unesi ispravnu email adresu salona.";
    }

    if (
      profile.tagline.trim().length > 240
    ) {
      return "Slogan salona može imati najviše 240 karaktera.";
    }

    if (
      profile.description.trim().length > 3000
    ) {
      return "Opis salona može imati najviše 3000 karaktera.";
    }

    if (
      profile.address.trim().length > 240
    ) {
      return "Adresa salona može imati najviše 240 karaktera.";
    }

    if (
      profile.city.trim().length > 120
    ) {
      return "Grad može imati najviše 120 karaktera.";
    }

    if (
      profile.country.trim().length > 120
    ) {
      return "Država može imati najviše 120 karaktera.";
    }

    return null;
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError(
      null
    );

    setErrorCode(
      null
    );

    const validationError =
      validateProfile();

    if (validationError) {
      setError(
        validationError
      );

      return;
    }

    setIsSubmitting(
      true
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/profile",
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",

            body:
              JSON.stringify({
                businessSlug,
                expectedUpdatedAt,

                profile: {
                  name:
                    profile.name.trim(),

                  phone:
                    profile.phone.trim(),

                  email:
                    profile.email.trim(),

                  tagline:
                    profile.tagline.trim(),

                  description:
                    profile.description.trim(),

                  address:
                    profile.address.trim(),

                  city:
                    profile.city.trim(),

                  country:
                    profile.country.trim(),
                },
              }),
          }
        );

      const payload =
        (await response.json()) as
          UpdateBusinessProfileResponse;

      if (
        !response.ok ||
        !payload.ok
      ) {
        setError(
          payload.message ??
            "Izmene salona nisu mogle da se sačuvaju."
        );

        setErrorCode(
          payload.code ??
            null
        );

        return;
      }

      router.push(
        `/platform-admin/businesses/${businessSlug}`
      );

      router.refresh();
    } catch (submitError) {
      console.error(
        "Failed to update business profile:",
        submitError
      );

      setError(
        "Došlo je do greške pri povezivanju sa serverom."
      );

      setErrorCode(
        "NETWORK_ERROR"
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6"
    >
      <section
        className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
      >
        <div
          className="border-b border-white/10 px-5 py-5 md:px-6"
        >
          <div
            className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
          >
            <div>
              <h3
                className="text-lg font-semibold"
              >
                Identitet salona
              </h3>

              <p
                className="mt-1 text-sm leading-6 text-zinc-500"
              >
                Naziv je zajednički za sve jezike, dok se slogan i opis menjaju samo za glavni jezik.
              </p>
            </div>

            <div
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200"
            >
              <Globe2
                size={15}
              />

              Jezik: {defaultLocale}
            </div>
          </div>
        </div>

        <div
          className="grid gap-5 p-5 md:p-6"
        >
          <Field
            label="Naziv salona"
            htmlFor="business-name"
            required
            helper="Prikazuje se na javnom profilu i u platform adminu."
          >
            <input
              id="business-name"
              type="text"
              value={
                profile.name
              }
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField(
                  "name",
                  event.target.value
                )
              }
              minLength={2}
              maxLength={120}
              required
              disabled={
                isSubmitting
              }
              className={inputClassName}
            />
          </Field>

          <Field
            label="Slogan"
            htmlFor="business-tagline"
            helper={`${profile.tagline.length}/240 karaktera`}
          >
            <input
              id="business-tagline"
              type="text"
              value={
                profile.tagline
              }
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                updateField(
                  "tagline",
                  event.target.value
                )
              }
              maxLength={240}
              disabled={
                isSubmitting
              }
              className={inputClassName}
            />
          </Field>

          <Field
            label="Opis"
            htmlFor="business-description"
            helper={`${profile.description.length}/3000 karaktera`}
          >
            <textarea
              id="business-description"
              value={
                profile.description
              }
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              maxLength={3000}
              rows={6}
              disabled={
                isSubmitting
              }
              className={`${inputClassName} resize-y`}
            />
          </Field>
        </div>
      </section>

      <div
        className="grid gap-6 xl:grid-cols-2"
      >
        <section
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          <div
            className="border-b border-white/10 px-5 py-5 md:px-6"
          >
            <div
              className="flex items-center gap-2"
            >
              <Phone
                size={18}
                className="text-amber-300"
              />

              <h3
                className="text-lg font-semibold"
              >
                Kontakt
              </h3>
            </div>

            <p
              className="mt-1 text-sm leading-6 text-zinc-500"
            >
              Podaci koje klijent vidi na javnom profilu.
            </p>
          </div>

          <div
            className="grid gap-5 p-5 md:p-6"
          >
            <Field
              label="Telefon"
              htmlFor="business-phone"
            >
              <div
                className="relative"
              >
                <Phone
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  id="business-phone"
                  type="tel"
                  value={
                    profile.phone
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField(
                      "phone",
                      event.target.value
                    )
                  }
                  maxLength={40}
                  disabled={
                    isSubmitting
                  }
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </Field>

            <Field
              label="Email"
              htmlFor="business-email"
            >
              <div
                className="relative"
              >
                <Mail
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600"
                />

                <input
                  id="business-email"
                  type="email"
                  value={
                    profile.email
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField(
                      "email",
                      event.target.value
                    )
                  }
                  maxLength={254}
                  disabled={
                    isSubmitting
                  }
                  className={`${inputClassName} pl-10`}
                />
              </div>
            </Field>
          </div>
        </section>

        <section
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
        >
          <div
            className="border-b border-white/10 px-5 py-5 md:px-6"
          >
            <div
              className="flex items-center gap-2"
            >
              <MapPin
                size={18}
                className="text-amber-300"
              />

              <h3
                className="text-lg font-semibold"
              >
                Lokacija
              </h3>
            </div>

            <p
              className="mt-1 text-sm leading-6 text-zinc-500"
            >
              Adresa se čuva za glavni jezik sadržaja.
            </p>
          </div>

          <div
            className="grid gap-5 p-5 md:p-6"
          >
            <Field
              label="Adresa"
              htmlFor="business-address"
            >
              <input
                id="business-address"
                type="text"
                value={
                  profile.address
                }
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                maxLength={240}
                disabled={
                  isSubmitting
                }
                className={inputClassName}
              />
            </Field>

            <div
              className="grid gap-5 sm:grid-cols-2"
            >
              <Field
                label="Grad"
                htmlFor="business-city"
              >
                <input
                  id="business-city"
                  type="text"
                  value={
                    profile.city
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField(
                      "city",
                      event.target.value
                    )
                  }
                  maxLength={120}
                  disabled={
                    isSubmitting
                  }
                  className={inputClassName}
                />
              </Field>

              <Field
                label="Država"
                htmlFor="business-country"
              >
                <input
                  id="business-country"
                  type="text"
                  value={
                    profile.country
                  }
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    updateField(
                      "country",
                      event.target.value
                    )
                  }
                  maxLength={120}
                  disabled={
                    isSubmitting
                  }
                  className={inputClassName}
                />
              </Field>
            </div>
          </div>
        </section>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4"
        >
          <div
            className="flex items-start gap-3"
          >
            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0 text-red-300"
            />

            <div>
              <p
                className="font-semibold text-red-200"
              >
                Izmene nisu sačuvane
              </p>

              <p
                className="mt-1 text-sm leading-6 text-red-100/80"
              >
                {error}
              </p>

              {errorCode ? (
                <p
                  className="mt-2 text-xs text-red-200/50"
                >
                  Kod: {errorCode}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end"
      >
        <Link
          href={
            `/platform-admin/businesses/${businessSlug}`
          }
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white"
        >
          Otkaži
        </Link>

        <button
          type="submit"
          disabled={
            isSubmitting
          }
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle
              size={18}
              className="animate-spin motion-reduce:animate-none"
            />
          ) : (
            <Save
              size={18}
            />
          )}

          {isSubmitting
            ? "Čuvanje..."
            : "Sačuvaj izmene"}
        </button>
      </div>
    </form>
  );
}

const inputClassName =
  "min-h-12 w-full rounded-xl border border-white/10 bg-zinc-950/70 px-3.5 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-amber-300/50 focus:ring-2 focus:ring-amber-300/15 disabled:cursor-not-allowed disabled:opacity-60";

type FieldProps = {
  label: string;
  htmlFor: string;
  helper?: string;
  required?: boolean;
  children: ReactNode;
};

function Field({
  label,
  htmlFor,
  helper,
  required = false,
  children,
}: FieldProps) {
  return (
    <div>
      <div
        className="mb-2 flex items-center justify-between gap-3"
      >
        <label
          htmlFor={
            htmlFor
          }
          className="text-sm font-semibold text-zinc-300"
        >
          {label}

          {required ? (
            <span
              className="ml-1 text-amber-300"
            >
              *
            </span>
          ) : null}
        </label>

        {helper ? (
          <span
            className="text-xs text-zinc-600"
          >
            {helper}
          </span>
        ) : null}
      </div>

      {children}
    </div>
  );
}
