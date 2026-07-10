import Link from "next/link";

import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleOff,
  Coins,
  Globe2,
  LayoutTemplate,
  MapPin,
  PlusCircle,
} from "lucide-react";

import BusinessPublicationBadge from "@/components/platform-admin/BusinessPublicationBadge";

import {
  resolveBusinessPublicationStatus,
  type BusinessPublicationStatus,
} from "@/lib/publishing/status";

import {
  createAdminClient,
} from "@/lib/supabase/admin";

import {
  resolveTemplateKey,
} from "@/lib/templates/registry";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

type BusinessRow = {
  id: string;
  slug: string;
  name: string;

  city: unknown;
  country: unknown;

  phone: string | null;
  email: string | null;

  default_locale: string;

  supported_locales:
    | string[]
    | null;

  currency: string;
  timezone: string;

  template_key:
    | string
    | null;

  is_active: boolean;
  publication_status:
    | string
    | null;

  created_at: string;
  updated_at: string;
};

type BusinessListItem = {
  id: string;
  slug: string;
  name: string;

  location: string;

  phone: string | null;
  email: string | null;

  defaultLocale: string;

  supportedLocales:
    string[];

  currency: string;
  timezone: string;

  templateKey: string;

  isActive: boolean;
  publicationStatus:
    BusinessPublicationStatus;

  createdAt: string;
  updatedAt: string;
};

type BusinessLoadResult = {
  businesses:
    BusinessListItem[];

  error:
    string | null;
};

function isRecord(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function getLocalizedValue(
  value: unknown,
  preferredLocale: string
): string {
  if (
    typeof value ===
      "string"
  ) {
    return value.trim();
  }

  if (
    !isRecord(
      value
    )
  ) {
    return "";
  }

  const preferredValue =
    value[
      preferredLocale
    ];

  if (
    typeof preferredValue ===
      "string" &&
    preferredValue
      .trim()
      .length > 0
  ) {
    return preferredValue.trim();
  }

  const fallbackLocales = [
    "en",
    "sr-Latn",
    "de",
    "mk",
    "sq",
  ];

  for (
    const fallbackLocale of
    fallbackLocales
  ) {
    const fallbackValue =
      value[
        fallbackLocale
      ];

    if (
      typeof fallbackValue ===
        "string" &&
      fallbackValue
        .trim()
        .length > 0
    ) {
      return fallbackValue.trim();
    }
  }

  for (
    const candidateValue of
    Object.values(
      value
    )
  ) {
    if (
      typeof candidateValue ===
        "string" &&
      candidateValue
        .trim()
        .length > 0
    ) {
      return candidateValue.trim();
    }
  }

  return "";
}

function createLocation(
  row: BusinessRow
): string {
  const city =
    getLocalizedValue(
      row.city,
      row.default_locale
    );

  const country =
    getLocalizedValue(
      row.country,
      row.default_locale
    );

  return [
    city,
    country,
  ]
    .filter(
      (value) =>
        value.length > 0
    )
    .join(", ");
}

function normalizeSupportedLocales(
  row: BusinessRow
): string[] {
  const locales =
    Array.isArray(
      row.supported_locales
    )
      ? row.supported_locales
          .filter(
            (
              locale
            ): locale is string =>
              typeof locale ===
                "string" &&
              locale.trim()
                .length > 0
          )
          .map(
            (locale) =>
              locale.trim()
          )
      : [];

  if (
    !locales.includes(
      row.default_locale
    )
  ) {
    locales.unshift(
      row.default_locale
    );
  }

  return Array.from(
    new Set(
      locales
    )
  );
}

function mapBusinessRow(
  row: BusinessRow
): BusinessListItem {
  return {
    id:
      row.id,

    slug:
      row.slug,

    name:
      row.name,

    location:
      createLocation(
        row
      ),

    phone:
      row.phone,

    email:
      row.email,

    defaultLocale:
      row.default_locale,

    supportedLocales:
      normalizeSupportedLocales(
        row
      ),

    currency:
      row.currency.trim(),

    timezone:
      row.timezone,

    templateKey:
      resolveTemplateKey(
        row.template_key
      ),

    isActive:
      row.is_active,

    publicationStatus:
      resolveBusinessPublicationStatus(
        row.publication_status,
        row.is_active
      ),

    createdAt:
      row.created_at,

    updatedAt:
      row.updated_at,
  };
}

async function loadBusinesses():
  Promise<BusinessLoadResult> {
  const supabase =
    createAdminClient();

  const {
    data,
    error,
  } = await supabase
    .from(
      "businesses"
    )
    .select(
      `
        id,
        slug,
        name,
        city,
        country,
        phone,
        email,
        default_locale,
        supported_locales,
        currency,
        timezone,
        template_key,
        is_active,
        publication_status,
        created_at,
        updated_at
      `
    )
    .order(
      "created_at",
      {
        ascending:
          false,
      }
    );

  if (error) {
    console.error(
      "Failed to load platform businesses:",
      error
    );

    return {
      businesses:
        [],

      error:
        "Nije moguće učitati salone iz baze.",
    };
  }

  const rows =
    (
      data ??
      []
    ) as unknown as
      BusinessRow[];

  return {
    businesses:
      rows.map(
        mapBusinessRow
      ),

    error:
      null,
  };
}

export default async function PlatformBusinessesPage() {
  const {
    businesses,
    error,
  } =
    await loadBusinesses();

  const activeCount =
    businesses.filter(
      (business) =>
        business.isActive
    ).length;

  const inactiveCount =
    businesses.length -
    activeCount;

  const localeCount =
    new Set(
      businesses.flatMap(
        (business) =>
          business
            .supportedLocales
      )
    ).size;

  return (
    <div
      className="
        mx-auto
        max-w-7xl
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          md:flex-row
          md:items-end
          md:justify-between
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-amber-300
            "
          >
            <Building2
              size={17}
            />

            Tenant centar
          </div>

          <h2
            className="
              mt-3
              text-3xl
              font-semibold
              tracking-tight
              md:text-4xl
            "
          >
            Saloni
          </h2>

          <p
            className="
              mt-3
              max-w-3xl
              text-sm
              leading-6
              text-zinc-400
              md:text-base
            "
          >
            Centralni pregled svih
            poslovnih tenant-a,
            njihovih jezika,
            template-a i aktivnog
            statusa.
          </p>
        </div>

        <Link
          href="/platform-admin/businesses/new"
          className="
            flex
            w-fit
            items-center
            gap-2
            rounded-xl
            bg-white
            px-4
            py-3
            text-sm
            font-semibold
            text-zinc-950
            transition
            hover:bg-zinc-200
          "
        >
          <PlusCircle
            size={18}
          />

          Novi salon
        </Link>
      </div>

      <section
        className="
          mt-8
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatCard
          label="Ukupno salona"
          value={
            businesses.length
          }
          icon={
            Building2
          }
        />

        <StatCard
          label="Aktivni"
          value={
            activeCount
          }
          icon={
            CheckCircle2
          }
        />

        <StatCard
          label="Neaktivni"
          value={
            inactiveCount
          }
          icon={
            CircleOff
          }
        />

        <StatCard
          label="Aktivni jezici"
          value={
            localeCount
          }
          icon={
            Globe2
          }
        />
      </section>

      {error ? (
        <section
          className="
            mt-8
            rounded-2xl
            border
            border-red-400/20
            bg-red-400/10
            p-5
          "
        >
          <p
            className="
              font-semibold
              text-red-200
            "
          >
            Greška pri učitavanju
          </p>

          <p
            className="
              mt-1
              text-sm
              text-red-200/80
            "
          >
            {error}
          </p>
        </section>
      ) : null}

      {!error &&
      businesses.length ===
        0 ? (
        <EmptyBusinesses />
      ) : null}

      {!error &&
      businesses.length >
        0 ? (
        <section
          className="
            mt-8
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
          "
        >
          <div
            className="
              border-b
              border-white/10
              px-5
              py-4
              md:px-6
            "
          >
            <h3
              className="
                text-lg
                font-semibold
              "
            >
              Registrovani saloni
            </h3>

            <p
              className="
                mt-1
                text-sm
                text-zinc-500
              "
            >
              Najnoviji tenant-i su
              prikazani prvi.
            </p>
          </div>

          <div
            className="
              divide-y
              divide-white/10
            "
          >
            {businesses.map(
              (business) => (
                <BusinessCard
                  key={
                    business.id
                  }
                  business={
                    business
                  }
                />
              )
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function BusinessCard({
  business,
}: {
  business:
    BusinessListItem;
}) {
  return (
    <article
      className="
        p-5
        transition
        hover:bg-white/[0.025]
        md:p-6
      "
    >
      <div
        className="
          flex
          flex-col
          gap-5
          xl:flex-row
          xl:items-start
          xl:justify-between
        "
      >
        <div
          className="
            min-w-0
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-3
            "
          >
            <h4
              className="
                break-words
                text-lg
                font-semibold
              "
            >
              <Link
  href={`/platform-admin/businesses/${business.slug}`}
  className="transition hover:text-amber-200"
>
  {business.name}
</Link>
            </h4>

            <StatusBadge
              isActive={
                business.isActive
              }
            />

            <BusinessPublicationBadge
              status={
                business
                  .publicationStatus
              }
            />
          </div>

          <p
            className="
              mt-1
              break-all
              text-sm
              text-zinc-500
            "
          >
            /{business.slug}
          </p>

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-x-5
              gap-y-2
              text-sm
              text-zinc-400
            "
          >
            <InfoItem
              icon={
                MapPin
              }
              value={
                business.location ||
                "Lokacija nije uneta"
              }
            />

            <InfoItem
              icon={
                LayoutTemplate
              }
              value={
                business.templateKey
              }
            />

            <InfoItem
              icon={
                Coins
              }
              value={
                business.currency
              }
            />

            <InfoItem
              icon={
                CalendarDays
              }
              value={
                formatDate(
                  business.createdAt
                )
              }
            />
          </div>

          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >
            {business
              .supportedLocales
              .map(
                (locale) => (
                  <span
                    key={
                      locale
                    }
                    className="
                      rounded-lg
                      border
                      border-white/10
                      bg-zinc-950
                      px-2.5
                      py-1
                      text-xs
                      font-medium
                      text-zinc-400
                    "
                  >
                    {locale}
                  </span>
                )
              )}
          </div>
        </div>

        <div
          className="
            grid
            shrink-0
            gap-3
            sm:grid-cols-2
            xl:w-[330px]
            xl:grid-cols-1
          "
        >
          <DetailBox
            label="Glavni jezik"
            value={
              business.defaultLocale
            }
          />

          <DetailBox
            label="Vremenska zona"
            value={
              business.timezone
            }
          />
        </div>
      </div>
    </article>
  );
}

function StatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex",
        "items-center",
        "gap-1.5",
        "rounded-full",
        "border",
        "px-3",
        "py-1",
        "text-xs",
        "font-semibold",
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-zinc-400/20 bg-zinc-400/10 text-zinc-400",
      ].join(" ")}
    >
      {isActive ? (
        <CheckCircle2
          size={13}
        />
      ) : (
        <CircleOff
          size={13}
        />
      )}

      {isActive
        ? "Aktivan"
        : "Neaktivan"}
    </span>
  );
}

function InfoItem({
  icon: Icon,
  value,
}: {
  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;

  value: string;
}) {
  return (
    <span
      className="
        flex
        items-center
        gap-1.5
      "
    >
      <Icon
        size={15}
        className="
          shrink-0
          text-zinc-600
        "
      />

      {value}
    </span>
  );
}

function DetailBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/10
        bg-zinc-950/60
        px-4
        py-3
      "
    >
      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-zinc-600
        "
      >
        {label}
      </p>

      <p
        className="
          mt-1
          break-words
          text-sm
          font-medium
          text-zinc-300
        "
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;

  icon:
    React.ComponentType<{
      size?: number;
      className?: string;
    }>;
}) {
  return (
    <article
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-5
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <div>
          <p
            className="
              text-sm
              text-zinc-500
            "
          >
            {label}
          </p>

          <p
            className="
              mt-3
              text-3xl
              font-semibold
            "
          >
            {value}
          </p>
        </div>

        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-white/5
            text-zinc-400
          "
        >
          <Icon
            size={19}
          />
        </div>
      </div>
    </article>
  );
}

function EmptyBusinesses() {
  return (
    <section
      className="
        mt-8
        flex
        min-h-[360px]
        items-center
        justify-center
        rounded-3xl
        border
        border-dashed
        border-white/10
        bg-white/[0.02]
        p-8
        text-center
      "
    >
      <div
        className="
          max-w-md
        "
      >
        <div
          className="
            mx-auto
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-2xl
            bg-white/5
            text-zinc-400
          "
        >
          <Building2
            size={26}
          />
        </div>

        <h3
          className="
            mt-5
            text-xl
            font-semibold
          "
        >
          Nema registrovanih salona
        </h3>

        <p
          className="
            mt-2
            text-sm
            leading-6
            text-zinc-500
          "
        >
          Kada uključimo provisioning,
          ovde će se pojaviti svi
          kreirani tenant-i.
        </p>

        <Link
          href="/platform-admin/businesses/new"
          className="
            mt-5
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-white
            px-4
            py-3
            text-sm
            font-semibold
            text-zinc-950
          "
        >
          <PlusCircle
            size={17}
          />

          Pripremi novi salon
        </Link>
      </div>
    </section>
  );
}

function formatDate(
  value: string
): string {
  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Datum nije poznat";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
    }
  ).format(
    date
  );
}