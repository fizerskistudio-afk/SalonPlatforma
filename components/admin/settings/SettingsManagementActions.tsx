"use client";

import type {
  FormEvent,
  ReactNode,
} from "react";
import {
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AtSign,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Globe2,
  ImageIcon,
  Info,
  Languages,
  Link2,
  LoaderCircle,
  Mail,
  Phone,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  X,
} from "lucide-react";

import {
  saveBookingSettingsAction,
  saveBusinessSettingsAction,
} from "@/app/admin/(protected)/settings/actions";
import type {
  AdminDefaultLocale,
  AdminSettingsResult,
} from "@/lib/admin/settings";

type SettingsManagementActionsProps = {
  data: AdminSettingsResult;
};

type ActionMessage = {
  type: "success" | "error";
  text: string;
};

type LocalizedTextState = {
  mk: string;
  sq: string;
  en: string;
};

type LocaleFieldName =
  | "tagline"
  | "description"
  | "address"
  | "city"
  | "country";

type LocaleFieldValues = {
  tagline: LocalizedTextState;
  description: LocalizedTextState;
  address: LocalizedTextState;
  city: LocalizedTextState;
  country: LocalizedTextState;
};

const localeOptions: Array<{
  value: AdminDefaultLocale;
  label: string;
  shortLabel: string;
}> = [
  {
    value: "mk",
    label: "Makedonski",
    shortLabel: "MK",
  },
  {
    value: "sq",
    label: "Albanski",
    shortLabel: "SQ",
  },
  {
    value: "en",
    label: "Engleski",
    shortLabel: "EN",
  },
];

function SettingsMessage({
  message,
  onClose,
}: {
  message: ActionMessage;
  onClose: () => void;
}) {
  const isSuccess =
    message.type === "success";

  return (
    <div
      aria-live="polite"
      className={`flex items-start justify-between gap-4 rounded-2xl border p-4 ${
        isSuccess
          ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
          : "border-red-400/20 bg-red-400/[0.07] text-red-200"
      }`}
    >
      <div className="flex items-start gap-3">
        {isSuccess ? (
          <CheckCircle2
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            aria-hidden="true"
          />
        ) : (
          <AlertCircle
            className="mt-0.5 h-5 w-5 flex-shrink-0"
            aria-hidden="true"
          />
        )}

        <span className="text-sm leading-relaxed">
          {message.text}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Zatvori poruku"
        className="flex-shrink-0"
      >
        <X
          className="h-4 w-4"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-white/[0.07] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
        {icon}
        {eyebrow}
      </div>

      <h3 className="mt-2 text-xl font-semibold text-white">
        {title}
      </h3>

      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
        {description}
      </p>
    </div>
  );
}

function FieldLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <span className="block">
      <span className="text-sm font-medium text-zinc-300">
        {title}
      </span>

      {description && (
        <span className="mt-1 block text-xs leading-relaxed text-zinc-700">
          {description}
        </span>
      )}
    </span>
  );
}

function ToggleField({
  checked,
  onChange,
  title,
  description,
  icon,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  icon: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() =>
        onChange(!checked)
      }
      className={`flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-emerald-400/20 bg-emerald-400/[0.065]"
          : "border-white/[0.07] bg-black/10 hover:border-white/15"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <span
          className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
            checked
              ? "bg-emerald-400/10 text-emerald-300"
              : "bg-white/[0.04] text-zinc-600"
          }`}
        >
          {icon}
        </span>

        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white">
            {title}
          </span>

          <span className="mt-1 block text-xs leading-relaxed text-zinc-600">
            {description}
          </span>
        </span>
      </span>

      <span
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition ${
          checked
            ? "bg-emerald-400"
            : "bg-zinc-800"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked
              ? "left-6"
              : "left-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsManagementActions({
  data,
}: SettingsManagementActionsProps) {
  const router = useRouter();

  const [
    businessPending,
    startBusinessTransition,
  ] = useTransition();

  const [
    bookingPending,
    startBookingTransition,
  ] = useTransition();

  const [
    businessMessage,
    setBusinessMessage,
  ] =
    useState<ActionMessage | null>(null);

  const [
    bookingMessage,
    setBookingMessage,
  ] =
    useState<ActionMessage | null>(null);

  const [
    activeLocale,
    setActiveLocale,
  ] =
    useState<AdminDefaultLocale>(
      data.business.defaultLocale
    );

  const [
    businessName,
    setBusinessName,
  ] = useState(data.business.name);

  const [
    businessSlug,
    setBusinessSlug,
  ] = useState(data.business.slug);

  const [
    defaultLocale,
    setDefaultLocale,
  ] =
    useState<AdminDefaultLocale>(
      data.business.defaultLocale
    );

  const [
    currency,
    setCurrency,
  ] = useState(data.business.currency);

  const [
    timezone,
    setTimezone,
  ] = useState(data.business.timezone);

  const [phone, setPhone] = useState(
    data.business.phone ?? ""
  );

  const [email, setEmail] = useState(
    data.business.email ?? ""
  );

  const [
    instagramHandle,
    setInstagramHandle,
  ] = useState(
    data.business.instagramHandle ?? ""
  );

  const [
    instagramUrl,
    setInstagramUrl,
  ] = useState(
    data.business.instagramUrl ?? ""
  );

  const [
    heroImageUrl,
    setHeroImageUrl,
  ] = useState(
    data.business.heroImageUrl ?? ""
  );

  const [logoUrl, setLogoUrl] =
    useState(
      data.business.logoUrl ?? ""
    );

  const [
    localizedFields,
    setLocalizedFields,
  ] = useState<LocaleFieldValues>({
    tagline: {
      mk: data.business.tagline.mk,
      sq: data.business.tagline.sq,
      en: data.business.tagline.en,
    },

    description: {
      mk: data.business.description.mk,
      sq: data.business.description.sq,
      en: data.business.description.en,
    },

    address: {
      mk: data.business.address.mk,
      sq: data.business.address.sq,
      en: data.business.address.en,
    },

    city: {
      mk: data.business.city.mk,
      sq: data.business.city.sq,
      en: data.business.city.en,
    },

    country: {
      mk: data.business.country.mk,
      sq: data.business.country.sq,
      en: data.business.country.en,
    },
  });

  const [
    slotIntervalMinutes,
    setSlotIntervalMinutes,
  ] = useState(
    String(
      data.booking.slotIntervalMinutes
    )
  );

  const [
    bookingWindowDays,
    setBookingWindowDays,
  ] = useState(
    String(
      data.booking.bookingWindowDays
    )
  );

  const [
    minAdvanceMinutes,
    setMinAdvanceMinutes,
  ] = useState(
    String(
      data.booking.minAdvanceMinutes
    )
  );

  const [
    allowAnyEmployee,
    setAllowAnyEmployee,
  ] = useState(
    data.booking.allowAnyEmployee
  );

  const [
    requireEmail,
    setRequireEmail,
  ] = useState(
    data.booking.requireEmail
  );

  const [
    requirePhone,
    setRequirePhone,
  ] = useState(
    data.booking.requirePhone
  );

  const [
    allowNotes,
    setAllowNotes,
  ] = useState(
    data.booking.allowNotes
  );

  const [
    autoConfirm,
    setAutoConfirm,
  ] = useState(
    data.booking.autoConfirm
  );

  useEffect(() => {
    setBusinessName(
      data.business.name
    );

    setBusinessSlug(
      data.business.slug
    );

    setDefaultLocale(
      data.business.defaultLocale
    );

    setCurrency(
      data.business.currency
    );

    setTimezone(
      data.business.timezone
    );

    setPhone(
      data.business.phone ?? ""
    );

    setEmail(
      data.business.email ?? ""
    );

    setInstagramHandle(
      data.business.instagramHandle ??
        ""
    );

    setInstagramUrl(
      data.business.instagramUrl ?? ""
    );

    setHeroImageUrl(
      data.business.heroImageUrl ?? ""
    );

    setLogoUrl(
      data.business.logoUrl ?? ""
    );

    setLocalizedFields({
      tagline: {
        mk: data.business.tagline.mk,
        sq: data.business.tagline.sq,
        en: data.business.tagline.en,
      },

      description: {
        mk:
          data.business.description.mk,

        sq:
          data.business.description.sq,

        en:
          data.business.description.en,
      },

      address: {
        mk: data.business.address.mk,
        sq: data.business.address.sq,
        en: data.business.address.en,
      },

      city: {
        mk: data.business.city.mk,
        sq: data.business.city.sq,
        en: data.business.city.en,
      },

      country: {
        mk: data.business.country.mk,
        sq: data.business.country.sq,
        en: data.business.country.en,
      },
    });

    setSlotIntervalMinutes(
      String(
        data.booking
          .slotIntervalMinutes
      )
    );

    setBookingWindowDays(
      String(
        data.booking.bookingWindowDays
      )
    );

    setMinAdvanceMinutes(
      String(
        data.booking.minAdvanceMinutes
      )
    );

    setAllowAnyEmployee(
      data.booking.allowAnyEmployee
    );

    setRequireEmail(
      data.booking.requireEmail
    );

    setRequirePhone(
      data.booking.requirePhone
    );

    setAllowNotes(
      data.booking.allowNotes
    );

    setAutoConfirm(
      data.booking.autoConfirm
    );
  }, [
    data.business.updatedAt,
    data.booking.updatedAt,
    data.business,
    data.booking,
  ]);

  const updateLocalizedField = (
    field: LocaleFieldName,
    locale: AdminDefaultLocale,
    value: string
  ) => {
    setLocalizedFields(
      (current) => ({
        ...current,

        [field]: {
          ...current[field],
          [locale]: value,
        },
      })
    );
  };

  const handleBusinessSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (businessPending) {
      return;
    }

    setBusinessMessage(null);

    startBusinessTransition(
      async () => {
        try {
          const result =
            await saveBusinessSettingsAction(
              {
                name: businessName,
                slug: businessSlug,

                tagline:
                  localizedFields.tagline,

                description:
                  localizedFields.description,

                address:
                  localizedFields.address,

                city:
                  localizedFields.city,

                country:
                  localizedFields.country,

                phone,
                email,

                instagramHandle,
                instagramUrl,

                heroImageUrl,
                logoUrl,

                defaultLocale,
                currency,
                timezone,
              }
            );

          setBusinessMessage({
            type: result.ok
              ? "success"
              : "error",

            text: result.message,
          });

          if (result.ok) {
            router.refresh();
          }
        } catch {
          setBusinessMessage({
            type: "error",
            text: "Došlo je do greške prilikom čuvanja podataka salona.",
          });
        }
      }
    );
  };

  const handleBookingSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (bookingPending) {
      return;
    }

    const parsedSlotInterval =
      Number(slotIntervalMinutes);

    const parsedBookingWindow =
      Number(bookingWindowDays);

    const parsedMinAdvance =
      Number(minAdvanceMinutes);

    if (
      !Number.isInteger(
        parsedSlotInterval
      ) ||
      !Number.isInteger(
        parsedBookingWindow
      ) ||
      !Number.isInteger(
        parsedMinAdvance
      )
    ) {
      setBookingMessage({
        type: "error",
        text: "Vremenska podešavanja moraju biti celi brojevi.",
      });

      return;
    }

    if (
      !requirePhone &&
      !requireEmail
    ) {
      setBookingMessage({
        type: "error",
        text: "Najmanje telefon ili email moraju biti obavezni.",
      });

      return;
    }

    setBookingMessage(null);

    startBookingTransition(
      async () => {
        try {
          const result =
            await saveBookingSettingsAction(
              {
                slotIntervalMinutes:
                  parsedSlotInterval,

                bookingWindowDays:
                  parsedBookingWindow,

                minAdvanceMinutes:
                  parsedMinAdvance,

                allowAnyEmployee,

                requireEmail,
                requirePhone,

                allowNotes,
                autoConfirm,
              }
            );

          setBookingMessage({
            type: result.ok
              ? "success"
              : "error",

            text: result.message,
          });

          if (result.ok) {
            router.refresh();
          }
        } catch {
          setBookingMessage({
            type: "error",
            text: "Došlo je do greške prilikom čuvanja booking pravila.",
          });
        }
      }
    );
  };

  return (
    <div className="px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
      <section className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <SectionHeader
          icon={
            <Building2
              className="h-4 w-4"
              aria-hidden="true"
            />
          }
          eyebrow="Upravljanje salonom"
          title="Podaci i identitet salona"
          description="Izmeni naziv, javni sadržaj, prevode, kontakt, lokaciju, slike i lokalizaciju salona."
        />

        <form
          onSubmit={
            handleBusinessSubmit
          }
          className="space-y-6 p-5 sm:p-6"
        >
          {businessMessage && (
            <SettingsMessage
              message={businessMessage}
              onClose={() =>
                setBusinessMessage(null)
              }
            />
          )}

          <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-black/10 p-5 md:grid-cols-2">
            <label>
              <FieldLabel
                title="Naziv salona"
                description="Prikazuje se na javnom sajtu i u admin panelu."
              />

              <input
                type="text"
                required
                minLength={2}
                maxLength={160}
                value={businessName}
                onChange={(event) =>
                  setBusinessName(
                    event.target.value
                  )
                }
                className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
              />
            </label>

            <label>
              <FieldLabel
                title="Slug"
                description="Koristi se u URL adresi i mora biti jedinstven."
              />

              <div className="relative mt-3">
                <Link2
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                  aria-hidden="true"
                />

                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={120}
                  value={businessSlug}
                  onChange={(event) =>
                    setBusinessSlug(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                />
              </div>
            </label>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
            <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 lg:flex-row lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  <Languages
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Prevedeni sadržaj
                </div>

                <p className="mt-2 text-sm text-zinc-600">
                  Izaberi jezik i unesi
                  tekst koji će biti
                  prikazan posetiocima.
                </p>
              </div>

              <div className="flex rounded-xl border border-white/[0.08] bg-zinc-950 p-1">
                {localeOptions.map(
                  (locale) => (
                    <button
                      key={locale.value}
                      type="button"
                      onClick={() =>
                        setActiveLocale(
                          locale.value
                        )
                      }
                      className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                        activeLocale ===
                        locale.value
                          ? "bg-amber-300 text-zinc-950"
                          : "text-zinc-500 hover:text-white"
                      }`}
                    >
                      {locale.shortLabel}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="rounded-xl border border-blue-400/10 bg-blue-400/[0.04] px-4 py-3 text-xs text-blue-200/60">
                Trenutno uređuješ:{" "}
                <strong className="text-blue-100">
                  {
                    localeOptions.find(
                      (locale) =>
                        locale.value ===
                        activeLocale
                    )?.label
                  }
                </strong>
              </div>

              <label className="block">
                <FieldLabel
                  title="Tagline"
                  description="Kratka poruka ili slogan ispod naziva salona."
                />

                <input
                  type="text"
                  maxLength={300}
                  value={
                    localizedFields
                      .tagline[
                      activeLocale
                    ]
                  }
                  onChange={(event) =>
                    updateLocalizedField(
                      "tagline",
                      activeLocale,
                      event.target.value
                    )
                  }
                  className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                />
              </label>

              <label className="block">
                <FieldLabel
                  title="Opis salona"
                  description="Glavni javni opis salona."
                />

                <textarea
                  rows={6}
                  maxLength={5000}
                  value={
                    localizedFields
                      .description[
                      activeLocale
                    ]
                  }
                  onChange={(event) =>
                    updateLocalizedField(
                      "description",
                      activeLocale,
                      event.target.value
                    )
                  }
                  className="mt-3 w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                />
              </label>

              <div className="grid gap-4 md:grid-cols-3">
                <label>
                  <FieldLabel title="Adresa" />

                  <input
                    type="text"
                    maxLength={500}
                    value={
                      localizedFields
                        .address[
                        activeLocale
                      ]
                    }
                    onChange={(event) =>
                      updateLocalizedField(
                        "address",
                        activeLocale,
                        event.target.value
                      )
                    }
                    className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label>
                  <FieldLabel title="Grad" />

                  <input
                    type="text"
                    maxLength={200}
                    value={
                      localizedFields.city[
                        activeLocale
                      ]
                    }
                    onChange={(event) =>
                      updateLocalizedField(
                        "city",
                        activeLocale,
                        event.target.value
                      )
                    }
                    className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label>
                  <FieldLabel title="Država" />

                  <input
                    type="text"
                    maxLength={200}
                    value={
                      localizedFields
                        .country[
                        activeLocale
                      ]
                    }
                    onChange={(event) =>
                      updateLocalizedField(
                        "country",
                        activeLocale,
                        event.target.value
                      )
                    }
                    className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-black/10 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                <Phone
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Kontakt
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label>
                  <FieldLabel title="Telefon salona" />

                  <div className="relative mt-3">
                    <Phone
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                      aria-hidden="true"
                    />

                    <input
                      type="tel"
                      maxLength={80}
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />
                  </div>
                </label>

                <label>
                  <FieldLabel title="Email salona" />

                  <div className="relative mt-3">
                    <Mail
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                      aria-hidden="true"
                    />

                    <input
                      type="email"
                      maxLength={320}
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />
                  </div>
                </label>

                <label>
                  <FieldLabel title="Instagram nalog" />

                  <div className="relative mt-3">
                    <AtSign
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                      aria-hidden="true"
                    />

                    <input
                      type="text"
                      maxLength={120}
                      value={
                        instagramHandle
                      }
                      onChange={(event) =>
                        setInstagramHandle(
                          event.target.value
                        )
                      }
                      placeholder="@salon"
                      className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                    />
                  </div>
                </label>

                <label>
                  <FieldLabel title="Instagram URL" />

                  <input
                    type="url"
                    maxLength={2000}
                    value={instagramUrl}
                    onChange={(event) =>
                      setInstagramUrl(
                        event.target.value
                      )
                    }
                    placeholder="https://instagram.com/..."
                    className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-black/10 p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                <ImageIcon
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                Vizuelni identitet
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <FieldLabel
                    title="Hero fotografija"
                    description="Direktan HTTP ili HTTPS link do velike naslovne fotografije."
                  />

                  <input
                    type="url"
                    maxLength={2000}
                    value={heroImageUrl}
                    onChange={(event) =>
                      setHeroImageUrl(
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                <label className="block">
                  <FieldLabel
                    title="Logo"
                    description="Direktan HTTP ili HTTPS link do logotipa."
                  />

                  <input
                    type="url"
                    maxLength={2000}
                    value={logoUrl}
                    onChange={(event) =>
                      setLogoUrl(
                        event.target.value
                      )
                    }
                    placeholder="https://..."
                    className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </label>

                {heroImageUrl && (
                  <div
                    className="min-h-40 rounded-2xl border border-white/[0.08] bg-cover bg-center"
                    style={{
                      backgroundImage: `linear-gradient(to top, rgba(9,9,11,0.8), rgba(9,9,11,0.05)), url(${JSON.stringify(
                        heroImageUrl
                      )})`,
                    }}
                  />
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-black/10 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
              <Globe2
                className="h-4 w-4"
                aria-hidden="true"
              />

              Lokalizacija
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label>
                <FieldLabel
                  title="Podrazumevani jezik"
                  description="Jezik koji se prvi prikazuje posetiocima."
                />

                <select
                  value={defaultLocale}
                  onChange={(event) =>
                    setDefaultLocale(
                      event.target
                        .value as AdminDefaultLocale
                    )
                  }
                  className="mt-3 h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                >
                  {localeOptions.map(
                    (locale) => (
                      <option
                        key={locale.value}
                        value={locale.value}
                      >
                        {locale.label}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <FieldLabel
                  title="Valuta"
                  description="ISO oznaka od tri slova."
                />

                <div className="relative mt-3">
                  <Coins
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                    aria-hidden="true"
                  />

                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={3}
                    value={currency}
                    onChange={(event) =>
                      setCurrency(
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="EUR"
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm uppercase text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </div>
              </label>

              <label>
                <FieldLabel
                  title="Vremenska zona"
                  description="IANA naziv vremenske zone."
                />

                <div className="relative mt-3">
                  <Clock3
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                    aria-hidden="true"
                  />

                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={timezone}
                    onChange={(event) =>
                      setTimezone(
                        event.target.value
                      )
                    }
                    placeholder="Europe/Skopje"
                    className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                  />
                </div>
              </label>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300/10 bg-amber-300/[0.04] p-4">
              <Info
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-300"
                aria-hidden="true"
              />

              <p className="text-xs leading-relaxed text-amber-200/55">
                Promena vremenske zone utiče
                na prikaz rasporeda, blokada
                i dostupnih termina. Menjaj
                je samo kada salon stvarno
                posluje u drugoj vremenskoj
                zoni.
              </p>
            </div>
          </section>

          <div className="flex justify-end border-t border-white/[0.08] pt-6">
            <button
              type="submit"
              disabled={businessPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-wait disabled:opacity-50"
            >
              {businessPending ? (
                <LoaderCircle
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}

              {businessPending
                ? "Čuvanje..."
                : "Sačuvaj podatke salona"}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <SectionHeader
          icon={
            <Settings2
              className="h-4 w-4"
              aria-hidden="true"
            />
          }
          eyebrow="Online booking"
          title="Booking pravila"
          description="Podešavanja dostupnih termina, potvrđivanja rezervacija i podataka koje klijent unosi."
        />

        <form
          onSubmit={
            handleBookingSubmit
          }
          className="space-y-6 p-5 sm:p-6"
        >
          {bookingMessage && (
            <SettingsMessage
              message={bookingMessage}
              onClose={() =>
                setBookingMessage(null)
              }
            />
          )}

          <section className="grid gap-4 rounded-2xl border border-white/[0.08] bg-black/10 p-5 md:grid-cols-3">
            <label>
              <FieldLabel
                title="Interval termina"
                description="Razmak između ponuđenih početaka termina, od 5 do 240 minuta."
              />

              <div className="relative mt-3">
                <Clock3
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                  aria-hidden="true"
                />

                <input
                  type="number"
                  required
                  min={5}
                  max={240}
                  step={1}
                  value={
                    slotIntervalMinutes
                  }
                  onChange={(event) =>
                    setSlotIntervalMinutes(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-14 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                  min
                </span>
              </div>
            </label>

            <label>
              <FieldLabel
                title="Period zakazivanja"
                description="Koliko dana unapred klijent može da izabere termin."
              />

              <div className="relative mt-3">
                <CalendarDays
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                  aria-hidden="true"
                />

                <input
                  type="number"
                  required
                  min={1}
                  max={365}
                  step={1}
                  value={bookingWindowDays}
                  onChange={(event) =>
                    setBookingWindowDays(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-14 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                  dana
                </span>
              </div>
            </label>

            <label>
              <FieldLabel
                title="Minimalno unapred"
                description="Najmanje vreme između trenutka rezervacije i početka termina."
              />

              <div className="relative mt-3">
                <ShieldCheck
                  className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-700"
                  aria-hidden="true"
                />

                <input
                  type="number"
                  required
                  min={0}
                  max={10080}
                  step={1}
                  value={
                    minAdvanceMinutes
                  }
                  onChange={(event) =>
                    setMinAdvanceMinutes(
                      event.target.value
                    )
                  }
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-14 text-sm text-white outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/15"
                />

                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-600">
                  min
                </span>
              </div>
            </label>
          </section>

          <section>
            <div className="mb-4">
              <div className="text-sm font-semibold text-white">
                Opcije rezervacije
              </div>

              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Klikom uključi ili isključi
                pojedinačno pravilo.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <ToggleField
                checked={autoConfirm}
                onChange={setAutoConfirm}
                title="Automatska potvrda"
                description="Kada je uključeno, nova rezervacija odmah dobija status potvrđena. Kada je isključeno, dobija status na čekanju."
                icon={
                  <CheckCircle2
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                }
              />

              <ToggleField
                checked={
                  allowAnyEmployee
                }
                onChange={
                  setAllowAnyEmployee
                }
                title="Bilo koji zaposleni"
                description="Klijent može prepustiti sistemu da pronađe dostupnog zaposlenog."
                icon={
                  <UserRoundCheck
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                }
              />

              <ToggleField
                checked={allowNotes}
                onChange={setAllowNotes}
                title="Napomena klijenta"
                description="Klijent može dodati poruku uz rezervaciju."
                icon={
                  <Sparkles
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                }
              />

              <ToggleField
                checked={requirePhone}
                onChange={
                  setRequirePhone
                }
                title="Obavezan telefon"
                description="Klijent mora uneti broj telefona."
                icon={
                  <Phone
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                }
              />

              <ToggleField
                checked={requireEmail}
                onChange={
                  setRequireEmail
                }
                title="Obavezan email"
                description="Klijent mora uneti ispravnu email adresu."
                icon={
                  <Mail
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                }
              />
            </div>
          </section>

          {!requirePhone &&
            !requireEmail && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-red-200">
                <AlertCircle
                  className="mt-0.5 h-5 w-5 flex-shrink-0"
                  aria-hidden="true"
                />

                <p className="text-sm leading-relaxed">
                  Telefon i email ne mogu
                  istovremeno biti opcioni.
                  Potreban je najmanje jedan
                  obavezan kontakt podatak.
                </p>
              </div>
            )}

          {!autoConfirm && (
            <div className="flex items-start gap-3 rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-4">
              <Info
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-300"
                aria-hidden="true"
              />

              <div>
                <div className="text-sm font-semibold text-blue-100">
                  Ručna potvrda je aktivna
                </div>

                <p className="mt-1 text-xs leading-relaxed text-blue-200/55">
                  Nove javne rezervacije će
                  dobiti status na čekanju.
                  Termin je i dalje zauzet dok
                  admin ne potvrdi ili otkaže
                  rezervaciju.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end border-t border-white/[0.08] pt-6">
            <button
              type="submit"
              disabled={
                bookingPending ||
                (!requirePhone &&
                  !requireEmail)
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-300 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingPending ? (
                <LoaderCircle
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}

              {bookingPending
                ? "Čuvanje..."
                : "Sačuvaj booking pravila"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}