import type {
  ReactNode,
} from "react";

import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleOff,
  Clock3,
  Coins,
  Globe2,
  LayoutTemplate,
  Mail,
  MapPin,
  Phone,
  Scissors,
  Settings2,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import BusinessPublicationBadge from "@/components/platform-admin/BusinessPublicationBadge";
import BusinessPublicationControls from "@/components/platform-admin/BusinessPublicationControls";
import TenantReadinessCard from "@/components/platform-admin/TenantReadinessCard";
import BusinessPublicLinkActions from "@/components/platform-admin/BusinessPublicLinkActions";

import {
  BUSINESS_PUBLICATION_LABELS,
  isBusinessPubliclyAvailable,
  resolveBusinessPublicationStatus,
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

const BUSINESS_SLUG_PATTERN =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const DAY_NAMES = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
] as const;

const DAY_SHORT_NAMES = [
  "Ned",
  "Pon",
  "Uto",
  "Sre",
  "Čet",
  "Pet",
  "Sub",
] as const;

type BusinessManagementPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

type BusinessRow = {
  id: string;
  slug: string;
  name: string;
  tagline: unknown;
  description: unknown;
  address: unknown;
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

type BookingSettingsRow = {
  slot_interval_minutes: number;
  booking_window_days: number;
  min_advance_minutes: number;
  allow_any_employee: boolean;
  require_email: boolean;
  require_phone: boolean;
  allow_notes: boolean;
  auto_confirm: boolean;
};

type ServiceCategoryRow = {
  id: string;
  slug: string;
  name: unknown;
  sort_order: number;
  is_active: boolean;
};

type ServiceRow = {
  id: string;
  category_id: string;
  slug: string;
  name: unknown;
  duration_minutes: number;
  price_type: string;
  price_from:
    | number
    | string;
  price_to:
    | number
    | string
    | null;
  sort_order: number;
  is_active: boolean;
};

type EmployeeRow = {
  id: string;
  slug: string;
  name: string;
  title: unknown;
  email: string | null;
  phone: string | null;
  sort_order: number;
  is_active: boolean;
};

type EmployeeServiceRow = {
  employee_id: string;
  service_id: string;
  custom_duration_minutes:
    | number
    | null;
  custom_price_from:
    | number
    | string
    | null;
  is_active: boolean;
};

type WorkingHoursRow = {
  employee_id:
    | string
    | null;
  day_of_week: number;
  open_time:
    | string
    | null;
  close_time:
    | string
    | null;
  is_closed: boolean;
};

type BusinessManagementData = {
  business: BusinessRow;
  bookingSettings:
    | BookingSettingsRow
    | null;
  categories:
    ServiceCategoryRow[];
  services:
    ServiceRow[];
  employees:
    EmployeeRow[];
  employeeServices:
    EmployeeServiceRow[];
  workingHours:
    WorkingHoursRow[];
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
    "sr-Latn",
    "en",
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

function normalizeSupportedLocales(
  business: BusinessRow
): string[] {
  const supportedLocales =
    Array.isArray(
      business.supported_locales
    )
      ? business
          .supported_locales
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
    !supportedLocales.includes(
      business.default_locale
    )
  ) {
    supportedLocales.unshift(
      business.default_locale
    );
  }

  return Array.from(
    new Set(
      supportedLocales
    )
  );
}

function toNumber(
  value:
    | number
    | string
    | null
): number | null {
  if (value === null) {
    return null;
  }

  const parsedValue =
    typeof value ===
      "number"
      ? value
      : Number(
          value
        );

  return Number.isFinite(
    parsedValue
  )
    ? parsedValue
    : null;
}

function formatDateTime(
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
    return "—";
  }

  return new Intl.DateTimeFormat(
    "sr-Latn-RS",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    }
  ).format(
    date
  );
}

function formatTime(
  value:
    | string
    | null
): string {
  if (!value) {
    return "—";
  }

  return value.slice(
    0,
    5
  );
}

function formatPrice(
  service: ServiceRow,
  currency: string
): string {
  const priceFrom =
    toNumber(
      service.price_from
    ) ?? 0;

  const priceTo =
    toNumber(
      service.price_to
    );

  const formatter =
    new Intl.NumberFormat(
      "sr-Latn-RS",
      {
        style:
          "currency",
        currency,
        minimumFractionDigits:
          Number.isInteger(
            priceFrom
          )
            ? 0
            : 2,
        maximumFractionDigits:
          2,
      }
    );

  if (
    service.price_type ===
      "range" &&
    priceTo !== null
  ) {
    return `${formatter.format(
      priceFrom
    )} – ${formatter.format(
      priceTo
    )}`;
  }

  if (
    service.price_type ===
    "from"
  ) {
    return `od ${formatter.format(
      priceFrom
    )}`;
  }

  return formatter.format(
    priceFrom
  );
}

function getOpenDayCount(
  rows:
    WorkingHoursRow[]
): number {
  return rows.filter(
    (row) =>
      !row.is_closed &&
      Boolean(
        row.open_time
      ) &&
      Boolean(
        row.close_time
      )
  ).length;
}

async function loadBusinessManagementData(
  businessSlug: string
): Promise<
  BusinessManagementData | null
> {
  const supabase =
    createAdminClient();

  const {
    data: businessData,
    error: businessError,
  } = await supabase
    .from(
      "businesses"
    )
    .select(
      `
        id,
        slug,
        name,
        tagline,
        description,
        address,
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
    .eq(
      "slug",
      businessSlug
    )
    .maybeSingle();

  if (businessError) {
    console.error(
      "Failed to load platform business:",
      businessError
    );

    throw new Error(
      "Salon nije moguće učitati iz baze."
    );
  }

  if (!businessData) {
    return null;
  }

  const business =
    businessData as unknown as
      BusinessRow;

  const [
    bookingSettingsResult,
    categoriesResult,
    servicesResult,
    employeesResult,
    employeeServicesResult,
    workingHoursResult,
  ] = await Promise.all([
    supabase
      .from(
        "booking_settings"
      )
      .select(
        `
          slot_interval_minutes,
          booking_window_days,
          min_advance_minutes,
          allow_any_employee,
          require_email,
          require_phone,
          allow_notes,
          auto_confirm
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .maybeSingle(),

    supabase
      .from(
        "service_categories"
      )
      .select(
        `
          id,
          slug,
          name,
          sort_order,
          is_active
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      ),

    supabase
      .from(
        "services"
      )
      .select(
        `
          id,
          category_id,
          slug,
          name,
          duration_minutes,
          price_type,
          price_from,
          price_to,
          sort_order,
          is_active
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      ),

    supabase
      .from(
        "employees"
      )
      .select(
        `
          id,
          slug,
          name,
          title,
          email,
          phone,
          sort_order,
          is_active
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .order(
        "sort_order",
        {
          ascending:
            true,
        }
      ),

    supabase
      .from(
        "employee_services"
      )
      .select(
        `
          employee_id,
          service_id,
          custom_duration_minutes,
          custom_price_from,
          is_active
        `
      )
      .eq(
        "business_id",
        business.id
      ),

    supabase
      .from(
        "working_hours"
      )
      .select(
        `
          employee_id,
          day_of_week,
          open_time,
          close_time,
          is_closed
        `
      )
      .eq(
        "business_id",
        business.id
      )
      .order(
        "day_of_week",
        {
          ascending:
            true,
        }
      ),
  ]);

  const queryErrors = [
    bookingSettingsResult.error,
    categoriesResult.error,
    servicesResult.error,
    employeesResult.error,
    employeeServicesResult.error,
    workingHoursResult.error,
  ].filter(
    Boolean
  );

  if (
    queryErrors.length > 0
  ) {
    console.error(
      "Failed to load business management data:",
      queryErrors
    );

    throw new Error(
      "Detalji salona nisu mogli da se učitaju."
    );
  }

  return {
    business,

    bookingSettings:
      bookingSettingsResult.data
        ? bookingSettingsResult.data as unknown as
            BookingSettingsRow
        : null,

    categories:
      (
        categoriesResult.data ??
        []
      ) as unknown as
        ServiceCategoryRow[],

    services:
      (
        servicesResult.data ??
        []
      ) as unknown as
        ServiceRow[],

    employees:
      (
        employeesResult.data ??
        []
      ) as unknown as
        EmployeeRow[],

    employeeServices:
      (
        employeeServicesResult.data ??
        []
      ) as unknown as
        EmployeeServiceRow[],

    workingHours:
      (
        workingHoursResult.data ??
        []
      ) as unknown as
        WorkingHoursRow[],
  };
}

export default async function BusinessManagementPage({
  params,
}: BusinessManagementPageProps) {
  const {
    businessSlug:
      rawBusinessSlug,
  } =
    await params;

  const businessSlug =
    rawBusinessSlug
      .trim()
      .toLowerCase();

  if (
    !BUSINESS_SLUG_PATTERN.test(
      businessSlug
    )
  ) {
    notFound();
  }

  const data =
    await loadBusinessManagementData(
      businessSlug
    );

  if (!data) {
    notFound();
  }

  const {
    business,
    bookingSettings,
    categories,
    services,
    employees,
    employeeServices,
    workingHours,
  } = data;

  const publicationStatus =
    resolveBusinessPublicationStatus(
      business.publication_status,
      business.is_active
    );

  const publiclyAvailable =
    isBusinessPubliclyAvailable(
      publicationStatus,
      business.is_active
    );

  const supportedLocales =
    normalizeSupportedLocales(
      business
    );

  const city =
    getLocalizedValue(
      business.city,
      business.default_locale
    );

  const country =
    getLocalizedValue(
      business.country,
      business.default_locale
    );

  const address =
    getLocalizedValue(
      business.address,
      business.default_locale
    );

  const tagline =
    getLocalizedValue(
      business.tagline,
      business.default_locale
    );

  const description =
    getLocalizedValue(
      business.description,
      business.default_locale
    );

  const location = [
    address,
    city,
    country,
  ]
    .filter(
      Boolean
    )
    .join(
      ", "
    );

  const salonHours =
    workingHours.filter(
      (row) =>
        row.employee_id ===
        null
    );

  const employeeHoursById =
    new Map<
      string,
      WorkingHoursRow[]
    >();

  for (
    const row of
    workingHours
  ) {
    if (
      !row.employee_id
    ) {
      continue;
    }

    const currentRows =
      employeeHoursById.get(
        row.employee_id
      ) ?? [];

    currentRows.push(
      row
    );

    employeeHoursById.set(
      row.employee_id,
      currentRows
    );
  }

  const activeRelations =
    employeeServices.filter(
      (relation) =>
        relation.is_active
    );

  const serviceById =
    new Map(
      services.map(
        (service) => [
          service.id,
          service,
        ] as const
      )
    );

  const relationsByEmployee =
    new Map<
      string,
      EmployeeServiceRow[]
    >();

  const employeeCountByService =
    new Map<
      string,
      number
    >();

  for (
    const relation of
    activeRelations
  ) {
    const employeeRelations =
      relationsByEmployee.get(
        relation.employee_id
      ) ?? [];

    employeeRelations.push(
      relation
    );

    relationsByEmployee.set(
      relation.employee_id,
      employeeRelations
    );

    employeeCountByService.set(
      relation.service_id,
      (
        employeeCountByService.get(
          relation.service_id
        ) ?? 0
      ) + 1
    );
  }

  const servicesByCategory =
    new Map<
      string,
      ServiceRow[]
    >();

  for (
    const service of
    services
  ) {
    const categoryServices =
      servicesByCategory.get(
        service.category_id
      ) ?? [];

    categoryServices.push(
      service
    );

    servicesByCategory.set(
      service.category_id,
      categoryServices
    );
  }

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.is_active
    ).length;

  const activeServices =
    services.filter(
      (service) =>
        service.is_active
    ).length;

  const activeCategories =
    categories.filter(
      (category) =>
        category.is_active
    ).length;

  return (
    <div
      className="
        mx-auto
        max-w-7xl
      "
    >
      <Link
        href="/platform-admin/businesses"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-zinc-400
          transition
          hover:text-white
        "
      >
        <ArrowLeft
          size={17}
        />

        Nazad na salone
      </Link>

      <div
        className="
          mt-6
          flex
          flex-col
          gap-6
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
            <p
              className="
                text-sm
                font-semibold
                text-amber-300
              "
            >
              Tenant kontrolni centar
            </p>

            <StatusBadge
              isActive={
                business.is_active
              }
            />

            <BusinessPublicationBadge
              status={
                publicationStatus
              }
            />
          </div>

          <h2
            className="
              mt-3
              break-words
              text-3xl
              font-semibold
              tracking-tight
              md:text-4xl
            "
          >
            {business.name}
          </h2>

          <p
            className="
              mt-2
              break-all
              text-sm
              text-zinc-500
            "
          >
            /{business.slug}
          </p>

          {tagline ? (
            <p
              className="
                mt-4
                max-w-3xl
                text-base
                leading-7
                text-zinc-300
              "
            >
              {tagline}
            </p>
          ) : null}

          {description ? (
            <p
              className="
                mt-3
                max-w-4xl
                text-sm
                leading-6
                text-zinc-500
              "
            >
              {description}
            </p>
          ) : null}
        </div>

        <BusinessPublicLinkActions
          publicPath={
            `/salon/${business.slug}`
          }
          isActive={
            publiclyAvailable
          }
        />
      </div>

      <BusinessPublicationControls
        businessSlug={
          business.slug
        }
        initialStatus={
          publicationStatus
        }
      />

      <TenantReadinessCard
        businessId={
          business.id
        }
        businessSlug={
          business.slug
        }
        publicationStatus={
          publicationStatus
        }
        contactReady={
          Boolean(
            business.phone
              ?.trim() ||
            business.email
              ?.trim()
          )
        }
        bookingSettingsReady={
          Boolean(
            bookingSettings
          )
        }
        categoriesReady={
          activeCategories >
          0
        }
        servicesReady={
          activeServices >
          0
        }
        employeesReady={
          activeEmployees >
          0
        }
        workingHoursReady={
          getOpenDayCount(
            salonHours
          ) >
          0
        }
      />

      {!publiclyAvailable ? (
        <section
          className="
            mt-7
            rounded-2xl
            border
            border-amber-400/20
            bg-amber-400/10
            px-5
            py-4
          "
        >
          <p
            className="
              font-semibold
              text-amber-200
            "
          >
            Javni profil nije objavljen
          </p>

          <p
            className="
              mt-1
              text-sm
              leading-6
              text-amber-100/70
            "
          >
            Trenutni lifecycle status je „{
              BUSINESS_PUBLICATION_LABELS[
                publicationStatus
              ]
            }“. Javna ruta, availability i booking
            rade samo kada je tenant objavljen.
          </p>
        </section>
      ) : null}

      <section
        className="
          mt-8
          grid
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <MetricCard
          label="Zaposleni"
          value={`${activeEmployees}/${employees.length}`}
          helper="aktivni / ukupno"
          icon={UsersRound}
        />

        <MetricCard
          label="Usluge"
          value={`${activeServices}/${services.length}`}
          helper="aktivne / ukupno"
          icon={Scissors}
        />

        <MetricCard
          label="Kategorije"
          value={`${activeCategories}/${categories.length}`}
          helper="aktivne / ukupno"
          icon={Building2}
        />

        <MetricCard
          label="Radni dani"
          value={`${getOpenDayCount(
            salonHours
          )}/7`}
          helper="salonski raspored"
          icon={CalendarClock}
        />
      </section>

      <div
        className="
          mt-8
          grid
          gap-6
          xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]
        "
      >
        <SectionCard
          title="Osnovni podaci"
          description="Identitet, kontakt i lokalizacija tenanta."
          icon={Building2}
        >
          <div
            className="
              grid
              gap-4
              md:grid-cols-2
            "
          >
            <DetailBox
              label="Lokacija"
              value={
                location ||
                "Nije uneta"
              }
              icon={MapPin}
            />

            <DetailBox
              label="Telefon"
              value={
                business.phone ||
                "Nije unet"
              }
              icon={Phone}
            />

            <DetailBox
              label="Email"
              value={
                business.email ||
                "Nije unet"
              }
              icon={Mail}
            />

            <DetailBox
              label="Template"
              value={
                resolveTemplateKey(
                  business.template_key
                )
              }
              icon={LayoutTemplate}
            />

            <DetailBox
              label="Valuta"
              value={
                business.currency
              }
              icon={Coins}
            />

            <DetailBox
              label="Vremenska zona"
              value={
                business.timezone
              }
              icon={Clock3}
            />
          </div>

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-white/10
              bg-zinc-950/50
              p-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-semibold
                uppercase
                tracking-wider
                text-zinc-500
              "
            >
              <Globe2
                size={15}
              />

              Jezici sadržaja
            </div>

            <div
              className="
                mt-3
                flex
                flex-wrap
                gap-2
              "
            >
              {supportedLocales.map(
                (locale) => (
                  <span
                    key={
                      locale
                    }
                    className={[
                      "rounded-lg",
                      "border",
                      "px-2.5",
                      "py-1",
                      "text-xs",
                      "font-semibold",
                      locale ===
                      business.default_locale
                        ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
                        : "border-white/10 bg-white/[0.03] text-zinc-400",
                    ].join(
                      " "
                    )}
                  >
                    {locale}

                    {locale ===
                    business.default_locale
                      ? " · glavni"
                      : ""}
                  </span>
                )
              )}
            </div>
          </div>

          <div
            className="
              mt-5
              grid
              gap-4
              sm:grid-cols-2
            "
          >
            <MetaBox
              label="Kreiran"
              value={
                formatDateTime(
                  business.created_at
                )
              }
            />

            <MetaBox
              label="Poslednja izmena"
              value={
                formatDateTime(
                  business.updated_at
                )
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Booking pravila"
          description="Aktivna podešavanja javne rezervacije."
          icon={Settings2}
        >
          {bookingSettings ? (
            <div
              className="
                space-y-3
              "
            >
              <RuleRow
                label="Interval termina"
                value={`${bookingSettings.slot_interval_minutes} min`}
              />

              <RuleRow
                label="Prozor rezervacije"
                value={`${bookingSettings.booking_window_days} dana`}
              />

              <RuleRow
                label="Minimalna najava"
                value={`${bookingSettings.min_advance_minutes} min`}
              />

              <RuleRow
                label="Prvi slobodan zaposleni"
                value={
                  bookingSettings.allow_any_employee
                    ? "Dozvoljeno"
                    : "Isključeno"
                }
              />

              <RuleRow
                label="Telefon"
                value={
                  bookingSettings.require_phone
                    ? "Obavezan"
                    : "Opcioni"
                }
              />

              <RuleRow
                label="Email"
                value={
                  bookingSettings.require_email
                    ? "Obavezan"
                    : "Opcioni"
                }
              />

              <RuleRow
                label="Napomena klijenta"
                value={
                  bookingSettings.allow_notes
                    ? "Dozvoljena"
                    : "Isključena"
                }
              />

              <RuleRow
                label="Potvrda rezervacije"
                value={
                  bookingSettings.auto_confirm
                    ? "Automatska"
                    : "Ručna"
                }
              />
            </div>
          ) : (
            <MissingState
              title="Booking podešavanja nisu pronađena"
              description="Tenant nema red u booking_settings tabeli."
            />
          )}
        </SectionCard>
      </div>

      <section
        className="
          mt-8
        "
      >
        <SectionHeading
          title="Zaposleni"
          description="Usluge i individualni raspored svakog člana tima."
          count={
            employees.length
          }
        />

        {employees.length >
        0 ? (
          <div
            className="
              mt-4
              grid
              gap-4
              xl:grid-cols-2
            "
          >
            {employees.map(
              (employee) => {
                const relations =
                  relationsByEmployee.get(
                    employee.id
                  ) ?? [];

                const assignedServices =
                  relations
                    .map(
                      (relation) =>
                        serviceById.get(
                          relation.service_id
                        )
                    )
                    .filter(
                      (
                        service
                      ): service is ServiceRow =>
                        Boolean(
                          service
                        )
                    );

                const employeeHours =
                  employeeHoursById.get(
                    employee.id
                  ) ?? [];

                return (
                  <article
                    key={
                      employee.id
                    }
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-white/10
                      bg-white/[0.03]
                    "
                  >
                    <div
                      className="
                        p-5
                        md:p-6
                      "
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-start
                          justify-between
                          gap-4
                        "
                      >
                        <div>
                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <h4
                              className="
                                text-lg
                                font-semibold
                              "
                            >
                              {employee.name}
                            </h4>

                            <SmallStatusBadge
                              isActive={
                                employee.is_active
                              }
                            />
                          </div>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-zinc-400
                            "
                          >
                            {getLocalizedValue(
                              employee.title,
                              business.default_locale
                            ) ||
                              "Pozicija nije uneta"}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-zinc-600
                            "
                          >
                            /{employee.slug}
                          </p>
                        </div>

                        <div
                          className="
                            rounded-xl
                            border
                            border-white/10
                            bg-zinc-950/60
                            px-3
                            py-2
                            text-right
                          "
                        >
                          <p
                            className="
                              text-lg
                              font-semibold
                              text-amber-200
                            "
                          >
                            {
                              assignedServices.length
                            }
                          </p>

                          <p
                            className="
                              text-[11px]
                              uppercase
                              tracking-wider
                              text-zinc-600
                            "
                          >
                            usluga
                          </p>
                        </div>
                      </div>

                      {employee.phone ||
                      employee.email ? (
                        <div
                          className="
                            mt-4
                            flex
                            flex-wrap
                            gap-x-5
                            gap-y-2
                            text-sm
                            text-zinc-500
                          "
                        >
                          {employee.phone ? (
                            <span
                              className="
                                flex
                                items-center
                                gap-1.5
                              "
                            >
                              <Phone
                                size={14}
                              />

                              {employee.phone}
                            </span>
                          ) : null}

                          {employee.email ? (
                            <span
                              className="
                                flex
                                items-center
                                gap-1.5
                              "
                            >
                              <Mail
                                size={14}
                              />

                              {employee.email}
                            </span>
                          ) : null}
                        </div>
                      ) : null}

                      <div
                        className="
                          mt-5
                        "
                      >
                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-wider
                            text-zinc-600
                          "
                        >
                          Dodeljene usluge
                        </p>

                        {assignedServices.length >
                        0 ? (
                          <div
                            className="
                              mt-2
                              flex
                              flex-wrap
                              gap-2
                            "
                          >
                            {assignedServices.map(
                              (service) => (
                                <span
                                  key={
                                    service.id
                                  }
                                  className="
                                    rounded-lg
                                    border
                                    border-white/10
                                    bg-zinc-950/60
                                    px-2.5
                                    py-1
                                    text-xs
                                    text-zinc-400
                                  "
                                >
                                  {getLocalizedValue(
                                    service.name,
                                    business.default_locale
                                  )}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          <p
                            className="
                              mt-2
                              text-sm
                              text-amber-300
                            "
                          >
                            Nema aktivnih dodeljenih usluga.
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className="
                        border-t
                        border-white/10
                        bg-zinc-950/30
                        p-5
                        md:p-6
                      "
                    >
                      <p
                        className="
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          text-zinc-600
                        "
                      >
                        Individualni raspored
                      </p>

                      {employeeHours.length >
                      0 ? (
                        <MiniSchedule
                          rows={
                            employeeHours
                          }
                        />
                      ) : (
                        <p
                          className="
                            mt-2
                            text-sm
                            text-zinc-500
                          "
                        >
                          Nema posebnog rasporeda — koristi
                          radno vreme salona.
                        </p>
                      )}
                    </div>
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <MissingState
            title="Nema zaposlenih"
            description="Početna postavka zaposlenih još nije završena."
          />
        )}
      </section>

      <section
        className="
          mt-8
        "
      >
        <SectionHeading
          title="Usluge"
          description="Katalog usluga organizovan po kategorijama."
          count={
            services.length
          }
        />

        {categories.length >
        0 ? (
          <div
            className="
              mt-4
              space-y-4
            "
          >
            {categories.map(
              (category) => {
                const categoryServices =
                  servicesByCategory.get(
                    category.id
                  ) ?? [];

                return (
                  <article
                    key={
                      category.id
                    }
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-white/10
                      bg-white/[0.03]
                    "
                  >
                    <div
                      className="
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                        border-b
                        border-white/10
                        px-5
                        py-4
                        md:px-6
                      "
                    >
                      <div>
                        <div
                          className="
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >
                          <h4
                            className="
                              font-semibold
                            "
                          >
                            {getLocalizedValue(
                              category.name,
                              business.default_locale
                            ) ||
                              category.slug}
                          </h4>

                          <SmallStatusBadge
                            isActive={
                              category.is_active
                            }
                          />
                        </div>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-zinc-600
                          "
                        >
                          /{category.slug}
                        </p>
                      </div>

                      <span
                        className="
                          rounded-full
                          border
                          border-white/10
                          px-3
                          py-1
                          text-xs
                          text-zinc-500
                        "
                      >
                        {
                          categoryServices.length
                        }{" "}
                        usluga
                      </span>
                    </div>

                    {categoryServices.length >
                    0 ? (
                      <div
                        className="
                          divide-y
                          divide-white/10
                        "
                      >
                        {categoryServices.map(
                          (service) => (
                            <ServiceRowCard
                              key={
                                service.id
                              }
                              service={
                                service
                              }
                              locale={
                                business.default_locale
                              }
                              currency={
                                business.currency
                              }
                              employeeCount={
                                employeeCountByService.get(
                                  service.id
                                ) ?? 0
                              }
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <div
                        className="
                          px-5
                          py-6
                          text-sm
                          text-zinc-500
                          md:px-6
                        "
                      >
                        Kategorija trenutno nema usluge.
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </div>
        ) : (
          <MissingState
            title="Nema kategorija usluga"
            description="Tenant još nema formiran katalog."
          />
        )}
      </section>

      <section
        className="
          mt-8
        "
      >
        <SectionHeading
          title="Radno vreme salona"
          description="Osnovni raspored koji availability sistem koristi kao granicu."
          count={
            salonHours.length
          }
        />

        <div
          className="
            mt-4
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
          "
        >
          {salonHours.length >
          0 ? (
            <ScheduleTable
              rows={
                salonHours
              }
            />
          ) : (
            <div
              className="
                p-6
              "
            >
              <MissingState
                title="Radno vreme nije podešeno"
                description="Bez salonskog rasporeda availability neće ponuditi termine."
                compact
              />
            </div>
          )}
        </div>
      </section>
    </div>
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
      ].join(
        " "
      )}
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

function SmallStatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full",
        "border",
        "px-2",
        "py-0.5",
        "text-[10px]",
        "font-semibold",
        "uppercase",
        "tracking-wider",
        isActive
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
          : "border-zinc-400/20 bg-zinc-400/10 text-zinc-500",
      ].join(
        " "
      )}
    >
      {isActive
        ? "Aktivno"
        : "Neaktivno"}
    </span>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
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
              font-medium
              text-zinc-500
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-3xl
              font-semibold
              tracking-tight
            "
          >
            {value}
          </p>

          <p
            className="
              mt-1
              text-xs
              text-zinc-600
            "
          >
            {helper}
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
            border
            border-white/10
            bg-zinc-950
            text-amber-300
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

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children:
    ReactNode;
}) {
  return (
    <section
      className="
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-white/[0.03]
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
          border-b
          border-white/10
          px-5
          py-4
          md:px-6
        "
      >
        <div
          className="
            mt-0.5
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-zinc-950
            text-amber-300
          "
        >
          <Icon
            size={17}
          />
        </div>

        <div>
          <h3
            className="
              font-semibold
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-1
              text-sm
              text-zinc-500
            "
          >
            {description}
          </p>
        </div>
      </div>

      <div
        className="
          p-5
          md:p-6
        "
      >
        {children}
      </div>
    </section>
  );
}

function DetailBox({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-zinc-950/50
        p-4
      "
    >
      <div
        className="
          flex
          items-center
          gap-2
          text-xs
          font-semibold
          uppercase
          tracking-wider
          text-zinc-600
        "
      >
        <Icon
          size={14}
        />

        {label}
      </div>

      <p
        className="
          mt-2
          break-words
          text-sm
          font-medium
          leading-6
          text-zinc-300
        "
      >
        {value}
      </p>
    </div>
  );
}

function MetaBox({
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
          text-sm
          text-zinc-300
        "
      >
        {value}
      </p>
    </div>
  );
}

function RuleRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-4
        rounded-xl
        border
        border-white/10
        bg-zinc-950/50
        px-4
        py-3
      "
    >
      <span
        className="
          text-sm
          text-zinc-500
        "
      >
        {label}
      </span>

      <span
        className="
          text-right
          text-sm
          font-semibold
          text-zinc-200
        "
      >
        {value}
      </span>
    </div>
  );
}

function SectionHeading({
  title,
  description,
  count,
}: {
  title: string;
  description: string;
  count: number;
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        sm:flex-row
        sm:items-end
        sm:justify-between
      "
    >
      <div>
        <h3
          className="
            text-xl
            font-semibold
          "
        >
          {title}
        </h3>

        <p
          className="
            mt-1
            text-sm
            text-zinc-500
          "
        >
          {description}
        </p>
      </div>

      <span
        className="
          w-fit
          rounded-full
          border
          border-white/10
          px-3
          py-1
          text-xs
          font-semibold
          text-zinc-500
        "
      >
        Ukupno: {count}
      </span>
    </div>
  );
}

function MiniSchedule({
  rows,
}: {
  rows:
    WorkingHoursRow[];
}) {
  const rowByDay =
    new Map(
      rows.map(
        (row) => [
          row.day_of_week,
          row,
        ] as const
      )
    );

  return (
    <div
      className="
        mt-3
        grid
        grid-cols-2
        gap-2
        sm:grid-cols-4
      "
    >
      {DAY_SHORT_NAMES.map(
        (
          dayName,
          dayOfWeek
        ) => {
          const row =
            rowByDay.get(
              dayOfWeek
            );

          const isClosed =
            !row ||
            row.is_closed ||
            !row.open_time ||
            !row.close_time;

          return (
            <div
              key={
                dayName
              }
              className="
                rounded-xl
                border
                border-white/10
                bg-zinc-950/50
                px-3
                py-2
              "
            >
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-zinc-600
                "
              >
                {dayName}
              </p>

              <p
                className={[
                  "mt-1",
                  "text-xs",
                  "font-medium",
                  isClosed
                    ? "text-zinc-600"
                    : "text-zinc-300",
                ].join(
                  " "
                )}
              >
                {isClosed
                  ? "Zatvoreno"
                  : `${formatTime(
                      row.open_time
                    )}–${formatTime(
                      row.close_time
                    )}`}
              </p>
            </div>
          );
        }
      )}
    </div>
  );
}

function ServiceRowCard({
  service,
  locale,
  currency,
  employeeCount,
}: {
  service:
    ServiceRow;
  locale: string;
  currency: string;
  employeeCount: number;
}) {
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        px-5
        py-4
        md:flex-row
        md:items-center
        md:justify-between
        md:px-6
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
            gap-2
          "
        >
          <p
            className="
              font-medium
              text-zinc-200
            "
          >
            {getLocalizedValue(
              service.name,
              locale
            ) ||
              service.slug}
          </p>

          <SmallStatusBadge
            isActive={
              service.is_active
            }
          />
        </div>

        <p
          className="
            mt-1
            text-xs
            text-zinc-600
          "
        >
          /{service.slug}
        </p>
      </div>

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-x-5
          gap-y-2
          text-sm
          text-zinc-400
        "
      >
        <span>
          {service.duration_minutes} min
        </span>

        <span
          className="
            font-semibold
            text-amber-200
          "
        >
          {formatPrice(
            service,
            currency
          )}
        </span>

        <span>
          {employeeCount} zaposlenih
        </span>
      </div>
    </div>
  );
}

function ScheduleTable({
  rows,
}: {
  rows:
    WorkingHoursRow[];
}) {
  const rowByDay =
    new Map(
      rows.map(
        (row) => [
          row.day_of_week,
          row,
        ] as const
      )
    );

  return (
    <div
      className="
        divide-y
        divide-white/10
      "
    >
      {DAY_NAMES.map(
        (
          dayName,
          dayOfWeek
        ) => {
          const row =
            rowByDay.get(
              dayOfWeek
            );

          const isClosed =
            !row ||
            row.is_closed ||
            !row.open_time ||
            !row.close_time;

          return (
            <div
              key={
                dayName
              }
              className="
                flex
                items-center
                justify-between
                gap-4
                px-5
                py-4
                md:px-6
              "
            >
              <span
                className="
                  text-sm
                  font-medium
                  text-zinc-300
                "
              >
                {dayName}
              </span>

              <span
                className={[
                  "text-sm",
                  "font-semibold",
                  isClosed
                    ? "text-zinc-600"
                    : "text-emerald-300",
                ].join(
                  " "
                )}
              >
                {isClosed
                  ? "Zatvoreno"
                  : `${formatTime(
                      row.open_time
                    )} – ${formatTime(
                      row.close_time
                    )}`}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
}

function MissingState({
  title,
  description,
  compact = false,
}: {
  title: string;
  description: string;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-2xl",
        "border",
        "border-amber-400/20",
        "bg-amber-400/10",
        compact
          ? "p-4"
          : "mt-4 p-5",
      ].join(
        " "
      )}
    >
      <p
        className="
          font-semibold
          text-amber-200
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-sm
          leading-6
          text-amber-100/70
        "
      >
        {description}
      </p>
    </div>
  );
}
