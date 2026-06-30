"use client";

import {
  AtSign,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  ExternalLink,
  FileText,
  Globe2,
  ImageIcon,
  Languages,
  Mail,
  MapPin,
  Phone,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type {
  AdminDefaultLocale,
  AdminSettingsResult,
} from "@/lib/admin/settings";

type AdminSettingsViewProps = {
  data: AdminSettingsResult;
};

type LocalizedValue = {
  mk?: string;
  sq?: string;
  en?: string;
};

const localeLabels: Record<
  AdminDefaultLocale,
  string
> = {
  mk: "Makedonski",
  sq: "Albanski",
  en: "Engleski",
};

const localeShortLabels: Record<
  AdminDefaultLocale,
  string
> = {
  mk: "MK",
  sq: "SQ",
  en: "EN",
};

const locales: AdminDefaultLocale[] = [
  "mk",
  "sq",
  "en",
];

function getLocalizedValue(
  value: LocalizedValue,
  locale: AdminDefaultLocale
): string {
  return value[locale]?.trim() ?? "";
}

function getPrimaryLocalizedValue(
  value: LocalizedValue,
  preferredLocale: AdminDefaultLocale
): string {
  return (
    getLocalizedValue(
      value,
      preferredLocale
    ) ||
    getLocalizedValue(value, "mk") ||
    getLocalizedValue(value, "sq") ||
    getLocalizedValue(value, "en")
  );
}

function formatMinutes(
  value: number
): string {
  if (value === 0) {
    return "Bez ograničenja";
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(
    value / 60
  );

  const minutes = value % 60;

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}

function BooleanStatus({
  enabled,
  enabledLabel,
  disabledLabel,
}: {
  enabled: boolean;
  enabledLabel: string;
  disabledLabel: string;
}) {
  if (enabled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
        <CheckCircle2
          className="h-3 w-3"
          aria-hidden="true"
        />

        {enabledLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-500/20 bg-zinc-500/[0.08] px-2.5 py-1 text-[10px] font-semibold text-zinc-500">
      <XCircle
        className="h-3 w-3"
        aria-hidden="true"
      />

      {disabledLabel}
    </span>
  );
}

function ContactValue({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  href?: string;
}) {
  return (
    <article className="rounded-2xl border border-white/[0.07] bg-black/10 p-4">
      <div className="flex items-center gap-2 text-xs text-zinc-600">
        <Icon
          className="h-4 w-4"
          aria-hidden="true"
        />

        {label}
      </div>

      {value ? (
        href ? (
          <a
            href={href}
            target={
              href.startsWith("http")
                ? "_blank"
                : undefined
            }
            rel={
              href.startsWith("http")
                ? "noreferrer"
                : undefined
            }
            className="mt-2 flex items-center gap-2 break-all text-sm font-medium text-zinc-300 transition hover:text-amber-200"
          >
            {value}

            {href.startsWith("http") && (
              <ExternalLink
                className="h-3.5 w-3.5 flex-shrink-0"
                aria-hidden="true"
              />
            )}
          </a>
        ) : (
          <div className="mt-2 break-all text-sm font-medium text-zinc-300">
            {value}
          </div>
        )
      ) : (
        <div className="mt-2 text-sm text-zinc-700">
          Nije uneto
        </div>
      )}
    </article>
  );
}

export default function AdminSettingsView({
  data,
}: AdminSettingsViewProps) {
  const {
    business,
    booking,
    summary,
  } = data;

  const primaryTagline =
    getPrimaryLocalizedValue(
      business.tagline,
      business.defaultLocale
    );

  const primaryDescription =
    getPrimaryLocalizedValue(
      business.description,
      business.defaultLocale
    );

  const primaryAddress =
    getPrimaryLocalizedValue(
      business.address,
      business.defaultLocale
    );

  const primaryCity =
    getPrimaryLocalizedValue(
      business.city,
      business.defaultLocale
    );

  const primaryCountry =
    getPrimaryLocalizedValue(
      business.country,
      business.defaultLocale
    );

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <section className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-600">
          {business.name}
        </div>

        <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Podešavanja
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
              Identitet salona, javni sadržaj,
              kontakt, lokalizacija i pravila
              online zakazivanja.
            </p>
          </div>

          <BooleanStatus
            enabled={business.isActive}
            enabledLabel="Salon je aktivan"
            disabledLabel="Salon je deaktiviran"
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-zinc-500">
              Podrazumevani jezik
            </div>

            <Languages
              className="h-5 w-5 text-zinc-600"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-2xl font-semibold text-white">
            {
              localeLabels[
                business.defaultLocale
              ]
            }
          </div>

          <div className="mt-2 text-xs text-zinc-600">
            početna lokalizacija sajta
          </div>
        </article>

        <article className="rounded-3xl border border-blue-400/15 bg-blue-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-200/70">
              Booking period
            </div>

            <CalendarDays
              className="h-5 w-5 text-blue-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-blue-100">
            {booking.bookingWindowDays}
          </div>

          <div className="mt-2 text-xs text-blue-300/50">
            dana unapred
          </div>
        </article>

        <article className="rounded-3xl border border-amber-300/15 bg-amber-300/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-amber-200/70">
              Interval termina
            </div>

            <Clock3
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-amber-100">
            {booking.slotIntervalMinutes}
          </div>

          <div className="mt-2 text-xs text-amber-300/50">
            minuta između početaka
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-400/15 bg-emerald-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-emerald-200/70">
              Minimalno unapred
            </div>

            <ShieldCheck
              className="h-5 w-5 text-emerald-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-2xl font-semibold text-emerald-100">
            {formatMinutes(
              booking.minAdvanceMinutes
            )}
          </div>

          <div className="mt-2 text-xs text-emerald-300/50">
            pre početka termina
          </div>
        </article>

        <article className="rounded-3xl border border-purple-400/15 bg-purple-400/[0.055] p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-200/70">
              Valuta
            </div>

            <Coins
              className="h-5 w-5 text-purple-300"
              aria-hidden="true"
            />
          </div>

          <div className="mt-3 text-3xl font-semibold text-purple-100">
            {business.currency}
          </div>

          <div className="mt-2 text-xs text-purple-300/50">
            prikaz cena
          </div>
        </article>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <Sparkles
                className="h-4 w-4"
                aria-hidden="true"
              />

              Brend salona
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Identitet i javni prikaz
            </h3>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs text-zinc-500">
            Slug:{" "}
            <strong className="text-zinc-300">
              {business.slug}
            </strong>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
          <article className="rounded-3xl border border-white/[0.07] bg-black/10 p-5 sm:p-6">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-700">
              Naziv salona
            </div>

            <h4 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              {business.name}
            </h4>

            <p className="mt-3 text-lg text-amber-200/80">
              {primaryTagline ||
                "Tagline nije unet."}
            </p>

            <p className="mt-5 max-w-3xl whitespace-pre-wrap text-sm leading-7 text-zinc-500">
              {primaryDescription ||
                "Opis salona nije unet."}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {locales.map((locale) => {
                const hasTagline =
                  getLocalizedValue(
                    business.tagline,
                    locale
                  ).length > 0;

                const hasDescription =
                  getLocalizedValue(
                    business.description,
                    locale
                  ).length > 0;

                const isComplete =
                  hasTagline &&
                  hasDescription;

                return (
                  <span
                    key={locale}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      isComplete
                        ? "border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300"
                        : "border-amber-300/15 bg-amber-300/[0.06] text-amber-200/70"
                    }`}
                  >
                    {
                      localeShortLabels[
                        locale
                      ]
                    }
                    {" · "}
                    {isComplete
                      ? "popunjeno"
                      : "nepotpuno"}
                  </span>
                );
              })}
            </div>
          </article>

          <article className="overflow-hidden rounded-3xl border border-white/[0.07] bg-black/10">
            <div
              className="flex min-h-72 items-end bg-cover bg-center"
              style={
                business.heroImageUrl
                  ? {
                      backgroundImage: `linear-gradient(to top, rgba(9,9,11,0.95), rgba(9,9,11,0.08)), url(${JSON.stringify(
                        business.heroImageUrl
                      )})`,
                    }
                  : undefined
              }
            >
              <div className="w-full p-5">
                {business.heroImageUrl ? (
                  <>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
                      Hero fotografija
                    </div>

                    <div className="mt-2 text-lg font-semibold text-white">
                      Aktivna fotografija
                    </div>
                  </>
                ) : (
                  <div className="flex min-h-52 flex-col items-center justify-center text-center">
                    <ImageIcon
                      className="h-7 w-7 text-zinc-700"
                      aria-hidden="true"
                    />

                    <div className="mt-3 text-sm font-medium text-zinc-500">
                      Hero fotografija nije
                      postavljena
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/[0.07] p-4">
              <div className="text-xs text-zinc-700">
                Logo
              </div>

              <div className="mt-1 break-all text-sm text-zinc-500">
                {business.logoUrl ??
                  "Logo nije postavljen."}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="mt-8 grid gap-5 xl:grid-cols-2">
        <article className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
          <div className="border-b border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <MapPin
                className="h-4 w-4"
                aria-hidden="true"
              />

              Lokacija
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Adresa salona
            </h3>
          </div>

          <div className="p-5 sm:p-6">
            <div className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">
              <div className="text-lg font-semibold text-white">
                {primaryAddress ||
                  "Adresa nije uneta"}
              </div>

              <div className="mt-2 text-sm text-zinc-500">
                {[
                  primaryCity,
                  primaryCountry,
                ]
                  .filter(Boolean)
                  .join(", ") ||
                  "Grad i država nisu uneti"}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {locales.map((locale) => (
                <div
                  key={locale}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                    {
                      localeLabels[
                        locale
                      ]
                    }
                  </div>

                  <div className="mt-2 text-sm text-zinc-400">
                    {[
                      getLocalizedValue(
                        business.address,
                        locale
                      ),
                      getLocalizedValue(
                        business.city,
                        locale
                      ),
                      getLocalizedValue(
                        business.country,
                        locale
                      ),
                    ]
                      .filter(Boolean)
                      .join(", ") ||
                      "Lokacija nije uneta."}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
          <div className="border-b border-white/[0.07] p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <Phone
                className="h-4 w-4"
                aria-hidden="true"
              />

              Kontakt
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Kontakt i društvene mreže
            </h3>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
            <ContactValue
              icon={Phone}
              label="Telefon"
              value={business.phone}
              href={
                business.phone
                  ? `tel:${business.phone.replace(
                      /[^\d+]/g,
                      ""
                    )}`
                  : undefined
              }
            />

            <ContactValue
              icon={Mail}
              label="Email"
              value={business.email}
              href={
                business.email
                  ? `mailto:${business.email}`
                  : undefined
              }
            />

            <ContactValue
              icon={AtSign}
              label="Instagram nalog"
              value={
                business.instagramHandle
              }
            />

            <ContactValue
              icon={ExternalLink}
              label="Instagram URL"
              value={business.instagramUrl}
              href={
                business.instagramUrl ??
                undefined
              }
            />
          </div>
        </article>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
              <Globe2
                className="h-4 w-4"
                aria-hidden="true"
              />

              Lokalizacija
            </div>

            <h3 className="mt-2 text-xl font-semibold text-white">
              Jezici, valuta i vremenska zona
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-500">
              Jezik:{" "}
              <strong className="text-zinc-300">
                {
                  localeShortLabels[
                    business.defaultLocale
                  ]
                }
              </strong>
            </span>

            <span className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-xs text-zinc-500">
              Valuta:{" "}
              <strong className="text-zinc-300">
                {business.currency}
              </strong>
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-3 sm:p-6">
          <article className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">
            <Languages
              className="h-5 w-5 text-blue-300"
              aria-hidden="true"
            />

            <div className="mt-4 text-xs text-zinc-600">
              Podrazumevani jezik
            </div>

            <div className="mt-1 text-lg font-semibold text-white">
              {
                localeLabels[
                  business.defaultLocale
                ]
              }
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">
            <Coins
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />

            <div className="mt-4 text-xs text-zinc-600">
              Valuta
            </div>

            <div className="mt-1 text-lg font-semibold text-white">
              {business.currency}
            </div>
          </article>

          <article className="rounded-2xl border border-white/[0.07] bg-black/10 p-5">
            <Clock3
              className="h-5 w-5 text-emerald-300"
              aria-hidden="true"
            />

            <div className="mt-4 text-xs text-zinc-600">
              Vremenska zona
            </div>

            <div className="mt-1 break-all text-lg font-semibold text-white">
              {business.timezone}
            </div>
          </article>
        </div>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.025]">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-600">
            <Settings2
              className="h-4 w-4"
              aria-hidden="true"
            />

            Online booking
          </div>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Pravila zakazivanja
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Ova pravila određuju koje
            termine javni booking prikazuje
            i koje podatke klijent mora da
            unese.
          </p>
        </div>

        <div className="grid gap-4 border-b border-white/[0.07] p-5 sm:grid-cols-2 sm:p-6 xl:grid-cols-4">
          <article className="rounded-2xl border border-blue-400/10 bg-blue-400/[0.04] p-5">
            <CalendarDays
              className="h-5 w-5 text-blue-300"
              aria-hidden="true"
            />

            <div className="mt-4 text-xs text-blue-300/60">
              Period zakazivanja
            </div>

            <div className="mt-1 text-2xl font-semibold text-blue-100">
              {booking.bookingWindowDays} dana
            </div>

            <div className="mt-2 text-xs text-blue-300/40">
              {summary.bookingWindowHours} sati
            </div>
          </article>

          <article className="rounded-2xl border border-amber-300/10 bg-amber-300/[0.04] p-5">
            <Clock3
              className="h-5 w-5 text-amber-300"
              aria-hidden="true"
            />

            <div className="mt-4 text-xs text-amber-300/60">
              Interval termina
            </div>

            <div className="mt-1 text-2xl font-semibold text-amber-100">
              {booking.slotIntervalMinutes} min
            </div>

            <div className="mt-2 text-xs text-amber-300/40">
              približno{" "}
              {
                summary.estimatedDailySlotStarts
              }{" "}
              početaka za 8 h rada
            </div>
          </article>

          <article className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
            <ShieldCheck
              className="h-5 w-5 text-emerald-300"
              aria-hidden="true"
            />

            <div className="mt-4 text-xs text-emerald-300/60">
              Minimalno unapred
            </div>

            <div className="mt-1 text-2xl font-semibold text-emerald-100">
              {formatMinutes(
                booking.minAdvanceMinutes
              )}
            </div>

            <div className="mt-2 text-xs text-emerald-300/40">
              {summary.minimumAdvanceHours} h
            </div>
          </article>

          <article className="rounded-2xl border border-purple-400/10 bg-purple-400/[0.04] p-5">
            <UserRoundCheck
              className="h-5 w-5 text-purple-300"
              aria-hidden="true"
            />

            <div className="mt-4 text-xs text-purple-300/60">
              Bilo koji zaposleni
            </div>

            <div className="mt-2">
              <BooleanStatus
                enabled={
                  booking.allowAnyEmployee
                }
                enabledLabel="Dozvoljeno"
                disabledLabel="Isključeno"
              />
            </div>
          </article>
        </div>

        <div className="divide-y divide-white/[0.06]">
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <div className="font-medium text-white">
                Telefon klijenta
              </div>

              <p className="mt-1 text-sm text-zinc-600">
                Određuje da li klijent mora
                da unese broj telefona.
              </p>
            </div>

            <BooleanStatus
              enabled={
                booking.requirePhone
              }
              enabledLabel="Obavezan"
              disabledLabel="Opcionalan"
            />
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <div className="font-medium text-white">
                Email klijenta
              </div>

              <p className="mt-1 text-sm text-zinc-600">
                Određuje da li klijent mora
                da unese email adresu.
              </p>
            </div>

            <BooleanStatus
              enabled={
                booking.requireEmail
              }
              enabledLabel="Obavezan"
              disabledLabel="Opcionalan"
            />
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <div className="font-medium text-white">
                Napomena klijenta
              </div>

              <p className="mt-1 text-sm text-zinc-600">
                Dozvoljava dodatnu poruku
                tokom zakazivanja.
              </p>
            </div>

            <BooleanStatus
              enabled={
                booking.allowNotes
              }
              enabledLabel="Dozvoljena"
              disabledLabel="Isključena"
            />
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div>
              <div className="font-medium text-white">
                Automatska potvrda
              </div>

              <p className="mt-1 text-sm text-zinc-600">
                Postavka određuje da li bi
                nova rezervacija trebalo
                odmah da bude potvrđena.
              </p>
            </div>

            <BooleanStatus
              enabled={
                booking.autoConfirm
              }
              enabledLabel="Uključena"
              disabledLabel="Ručna potvrda"
            />
          </div>
        </div>

        <div className="m-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.05] p-4 sm:m-6">
          <div className="flex items-start gap-3">
            <BadgeCheck
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-300"
              aria-hidden="true"
            />

            <div>
              <div className="text-sm font-semibold text-amber-100">
                Napomena za automatsku potvrdu
              </div>

              <p className="mt-1 text-xs leading-relaxed text-amber-200/55">
                Trenutna javna booking funkcija
                kreira rezervacije direktno sa
                statusom confirmed. Pre nego što
                omogućimo ručnu potvrdu,
                prilagodićemo i baznu funkciju da
                poštuje ovo podešavanje.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[2rem] border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
            <FileText
              className="h-5 w-5"
              aria-hidden="true"
            />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Podešavanja su trenutno samo
              za pregled
            </h3>

            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">
              U sledećem koraku dodajemo forme
              za uređivanje identiteta salona,
              prevoda, kontakta, vizuala,
              lokalizacije i booking pravila.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}