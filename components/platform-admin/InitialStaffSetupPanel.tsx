"use client";

import {
  type FormEvent,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  Phone,
  Scissors,
  UserRound,
} from "lucide-react";

type BusinessOption = {
  id: string;
  slug: string;
  name: string;
  employeeCount: number;
  serviceCount: number;
};

type InitialStaffSetupPanelProps = {
  businesses:
    readonly BusinessOption[];

  loadError:
    string | null;
};

type WorkingHour = {
  dayOfWeek: number;
  label: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
};

type SetupApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;

  result?: {
    businessId?: string;
    businessSlug?: string;
    employeeId?: string;
    employeeName?: string;
    employeeSlug?: string;
    servicesAssigned?: number;
    businessHoursCreated?: number;
    employeeHoursCreated?: number;
  };
};

const DEFAULT_WORKING_HOURS:
  WorkingHour[] = [
    {
      dayOfWeek: 0,
      label: "Nedelja",
      isClosed: true,
      openTime: "09:00",
      closeTime: "17:00",
    },
    {
      dayOfWeek: 1,
      label: "Ponedeljak",
      isClosed: false,
      openTime: "09:00",
      closeTime: "17:00",
    },
    {
      dayOfWeek: 2,
      label: "Utorak",
      isClosed: false,
      openTime: "09:00",
      closeTime: "17:00",
    },
    {
      dayOfWeek: 3,
      label: "Sreda",
      isClosed: false,
      openTime: "09:00",
      closeTime: "17:00",
    },
    {
      dayOfWeek: 4,
      label: "Četvrtak",
      isClosed: false,
      openTime: "09:00",
      closeTime: "17:00",
    },
    {
      dayOfWeek: 5,
      label: "Petak",
      isClosed: false,
      openTime: "09:00",
      closeTime: "17:00",
    },
    {
      dayOfWeek: 6,
      label: "Subota",
      isClosed: false,
      openTime: "09:00",
      closeTime: "14:00",
    },
  ];

function normalizeSlug(
  value: string
): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .normalize(
      "NFD"
    )
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /đ/g,
      "dj"
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .replace(
      /-{2,}/g,
      "-"
    );
}

export default function InitialStaffSetupPanel({
  businesses,
  loadError,
}: InitialStaffSetupPanelProps) {
  const availableBusinesses =
    useMemo(
      () =>
        businesses.filter(
          (business) =>
            business.employeeCount ===
              0 &&
            business.serviceCount >
              0
        ),
      [
        businesses,
      ]
    );

  const [
    businessSlug,
    setBusinessSlug,
  ] =
    useState(
      availableBusinesses[0]
        ?.slug ??
        ""
    );

  const [
    employeeName,
    setEmployeeName,
  ] =
    useState("");

  const [
    employeeSlug,
    setEmployeeSlug,
  ] =
    useState("");

  const [
    slugWasEdited,
    setSlugWasEdited,
  ] =
    useState(false);

  const [
    employeeTitle,
    setEmployeeTitle,
  ] =
    useState("Berberin");

  const [
    employeeBio,
    setEmployeeBio,
  ] =
    useState("");

  const [
    employeeEmail,
    setEmployeeEmail,
  ] =
    useState("");

  const [
    employeePhone,
    setEmployeePhone,
  ] =
    useState("");

  const [
    workingHours,
    setWorkingHours,
  ] =
    useState<WorkingHour[]>(
      DEFAULT_WORKING_HOURS
        .map(
          (hour) => ({
            ...hour,
          })
        )
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

  const [
    result,
    setResult,
  ] =
    useState<
      SetupApiResponse["result"] |
      null
    >(null);

  const selectedBusiness =
    useMemo(
      () =>
        businesses.find(
          (business) =>
            business.slug ===
            businessSlug
        ) ??
        null,
      [
        businessSlug,
        businesses,
      ]
    );

  function handleEmployeeNameChange(
    value: string
  ) {
    setEmployeeName(
      value
    );

    if (
      !slugWasEdited
    ) {
      setEmployeeSlug(
        normalizeSlug(
          value
        )
      );
    }

    setError(
      null
    );

    setResult(
      null
    );
  }

  function updateWorkingHour(
    dayOfWeek: number,
    update:
      Partial<WorkingHour>
  ) {
    setWorkingHours(
      (currentHours) =>
        currentHours.map(
          (hour) =>
            hour.dayOfWeek ===
              dayOfWeek
              ? {
                  ...hour,
                  ...update,
                }
              : hour
        )
    );

    setError(
      null
    );

    setResult(
      null
    );
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

    setResult(
      null
    );

    if (!businessSlug) {
      setError(
        "Izaberi salon."
      );

      return;
    }

    if (
      employeeName
        .trim()
        .length < 2
    ) {
      setError(
        "Unesi ime zaposlenog."
      );

      return;
    }

    if (
      !employeeSlug
    ) {
      setError(
        "Slug zaposlenog nije ispravan."
      );

      return;
    }

    if (
      employeeTitle
        .trim()
        .length < 2
    ) {
      setError(
        "Unesi poziciju zaposlenog."
      );

      return;
    }

    setIsSubmitting(
      true
    );

    try {
      const response =
        await fetch(
          "/api/platform-admin/businesses/initial-staff",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                businessSlug,

                employee: {
                  name:
                    employeeName
                      .trim(),

                  slug:
                    employeeSlug,

                  title:
                    employeeTitle
                      .trim(),

                  bio:
                    employeeBio
                      .trim(),

                  email:
                    employeeEmail
                      .trim() ||
                    null,

                  phone:
                    employeePhone
                      .trim() ||
                    null,
                },

                workingHours:
                  workingHours.map(
                    (hour) => ({
                      dayOfWeek:
                        hour.dayOfWeek,

                      isClosed:
                        hour.isClosed,

                      openTime:
                        hour.isClosed
                          ? null
                          : hour.openTime,

                      closeTime:
                        hour.isClosed
                          ? null
                          : hour.closeTime,
                    })
                  ),
              }),
          }
        );

      let responseBody:
        SetupApiResponse;

      try {
        responseBody =
          (await response.json()) as
            SetupApiResponse;
      } catch {
        throw new Error(
          "API nije vratio validan JSON odgovor."
        );
      }

      if (
        !response.ok ||
        responseBody.ok !==
          true
      ) {
        setErrorCode(
          responseBody.code ??
            null
        );

        throw new Error(
          responseBody.message ??
            "Početna postavka nije uspela."
        );
      }

      setResult(
        responseBody.result ??
          null
      );
    } catch (requestError) {
      setError(
        requestError instanceof
          Error
          ? requestError.message
          : "Došlo je do neočekivane greške."
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  if (loadError) {
    return (
      <MessageCard
        type="error"
        title="Saloni nisu učitani"
        message={
          loadError
        }
      />
    );
  }

  if (
    businesses.length ===
      0
  ) {
    return (
      <MessageCard
        type="error"
        title="Nema aktivnih salona"
        message="Prvo kreiraj salon kroz onboarding."
      />
    );
  }

  if (
    availableBusinesses
      .length === 0
  ) {
    return (
      <MessageCard
        type="success"
        title="Nema salona za početnu postavku"
        message="Svi aktivni saloni već imaju zaposlenog ili nemaju aktivne usluge."
      />
    );
  }

  if (result) {
    return (
      <section
        className="
          mx-auto
          max-w-4xl
          rounded-3xl
          border
          border-emerald-400/20
          bg-emerald-400/[0.06]
          p-6
          md:p-8
        "
      >
        <CheckCircle2
          size={34}
          className="
            text-emerald-300
          "
        />

        <h2
          className="
            mt-5
            text-3xl
            font-semibold
          "
        >
          Početna postavka je završena
        </h2>

        <p
          className="
            mt-3
            text-sm
            leading-6
            text-zinc-400
          "
        >
          Zaposleni je kreiran, povezan sa
          uslugama i dobio je početno radno
          vreme.
        </p>

        <div
          className="
            mt-7
            grid
            gap-4
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <ResultCard
            label="Zaposleni"
            value={
              result.employeeName ??
              employeeName
            }
          />

          <ResultCard
            label="Slug"
            value={
              result.employeeSlug ??
              employeeSlug
            }
          />

          <ResultCard
            label="Usluge"
            value={String(
              result.servicesAssigned ??
                0
            )}
          />

          <ResultCard
            label="Radni dani"
            value={String(
              result.businessHoursCreated ??
                0
            )}
          />
        </div>
      </section>
    );
  }

  return (
    <div
      className="
        mx-auto
        max-w-7xl
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
          <UserRound
            size={17}
          />

          Početna postavka tima
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
          Prvi zaposleni i radno vreme
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
          Kreiramo prvog zaposlenog,
          povezujemo ga sa svim aktivnim
          uslugama i postavljamo početno
          radno vreme salona.
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
        className="
          mt-8
          grid
          gap-6
          xl:grid-cols-[minmax(0,1fr)_360px]
        "
      >
        <div
          className="
            space-y-6
          "
        >
          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
              md:p-7
            "
          >
            <SectionTitle
              icon={
                Building2
              }
              title="Salon"
              description="Biramo tenant koji još nema zaposlenog."
            />

            <label
              className="
                mt-6
                block
              "
            >
              <span
                className={
                  labelClassName
                }
              >
                Izabrani salon
              </span>

              <select
                value={
                  businessSlug
                }
                onChange={(
                  event
                ) => {
                  setBusinessSlug(
                    event.target
                      .value
                  );

                  setError(
                    null
                  );
                }}
                className={
                  inputClassName
                }
              >
                {availableBusinesses.map(
                  (business) => (
                    <option
                      key={
                        business.id
                      }
                      value={
                        business.slug
                      }
                    >
                      {business.name}
                      {" — "}
                      {business.serviceCount}
                      {" usluga"}
                    </option>
                  )
                )}
              </select>
            </label>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
              md:p-7
            "
          >
            <SectionTitle
              icon={
                UserRound
              }
              title="Zaposleni"
              description="Osnovni profil prvog člana tima."
            />

            <div
              className="
                mt-6
                grid
                gap-5
                md:grid-cols-2
              "
            >
              <FormField
                label="Ime i prezime"
                icon={
                  UserRound
                }
              >
                <input
                  value={
                    employeeName
                  }
                  onChange={(
                    event
                  ) =>
                    handleEmployeeNameChange(
                      event.target
                        .value
                    )
                  }
                  placeholder="Mika Berberin"
                  className={
                    inputClassName
                  }
                />
              </FormField>

              <FormField
                label="Slug"
                icon={
                  UserRound
                }
              >
                <input
                  value={
                    employeeSlug
                  }
                  onChange={(
                    event
                  ) => {
                    setSlugWasEdited(
                      true
                    );

                    setEmployeeSlug(
                      normalizeSlug(
                        event.target
                          .value
                      )
                    );
                  }}
                  placeholder="mika-berberin"
                  className={
                    inputClassName
                  }
                />
              </FormField>

              <FormField
                label="Pozicija"
                icon={
                  Scissors
                }
              >
                <input
                  value={
                    employeeTitle
                  }
                  onChange={(
                    event
                  ) =>
                    setEmployeeTitle(
                      event.target
                        .value
                    )
                  }
                  placeholder="Berberin"
                  className={
                    inputClassName
                  }
                />
              </FormField>

              <FormField
                label="Telefon"
                icon={
                  Phone
                }
              >
                <input
                  value={
                    employeePhone
                  }
                  onChange={(
                    event
                  ) =>
                    setEmployeePhone(
                      event.target
                        .value
                    )
                  }
                  placeholder="+381 60 123 4567"
                  className={
                    inputClassName
                  }
                />
              </FormField>

              <FormField
                label="Email"
                icon={
                  Mail
                }
              >
                <input
                  type="email"
                  value={
                    employeeEmail
                  }
                  onChange={(
                    event
                  ) =>
                    setEmployeeEmail(
                      event.target
                        .value
                    )
                  }
                  placeholder="mika@example.com"
                  className={
                    inputClassName
                  }
                />
              </FormField>

              <FormField
                label="Kratka biografija"
                icon={
                  UserRound
                }
              >
                <input
                  value={
                    employeeBio
                  }
                  onChange={(
                    event
                  ) =>
                    setEmployeeBio(
                      event.target
                        .value
                    )
                  }
                  placeholder="Iskusni berberin..."
                  className={
                    inputClassName
                  }
                />
              </FormField>
            </div>
          </section>

          <section
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-5
              md:p-7
            "
          >
            <SectionTitle
              icon={
                Clock3
              }
              title="Radno vreme"
              description="Početno radno vreme važi i za salon i za zaposlenog."
            />

            <div
              className="
                mt-6
                space-y-3
              "
            >
              {workingHours.map(
                (hour) => (
                  <div
                    key={
                      hour.dayOfWeek
                    }
                    className="
                      grid
                      gap-3
                      rounded-2xl
                      border
                      border-white/10
                      bg-zinc-950/50
                      p-4
                      sm:grid-cols-[150px_110px_1fr_1fr]
                      sm:items-center
                    "
                  >
                    <p
                      className="
                        text-sm
                        font-semibold
                        text-zinc-300
                      "
                    >
                      {hour.label}
                    </p>

                    <label
                      className="
                        flex
                        items-center
                        gap-2
                        text-sm
                        text-zinc-500
                      "
                    >
                      <input
                        type="checkbox"
                        checked={
                          hour.isClosed
                        }
                        onChange={(
                          event
                        ) =>
                          updateWorkingHour(
                            hour.dayOfWeek,
                            {
                              isClosed:
                                event
                                  .target
                                  .checked,
                            }
                          )
                        }
                        className="
                          h-4
                          w-4
                          accent-white
                        "
                      />

                      Neradni dan
                    </label>

                    <input
                      type="time"
                      value={
                        hour.openTime
                      }
                      disabled={
                        hour.isClosed
                      }
                      onChange={(
                        event
                      ) =>
                        updateWorkingHour(
                          hour.dayOfWeek,
                          {
                            openTime:
                              event
                                .target
                                .value,
                          }
                        )
                      }
                      className={
                        inputClassName
                      }
                    />

                    <input
                      type="time"
                      value={
                        hour.closeTime
                      }
                      disabled={
                        hour.isClosed
                      }
                      onChange={(
                        event
                      ) =>
                        updateWorkingHour(
                          hour.dayOfWeek,
                          {
                            closeTime:
                              event
                                .target
                                .value,
                          }
                        )
                      }
                      className={
                        inputClassName
                      }
                    />
                  </div>
                )
              )}
            </div>
          </section>

          {error ? (
            <MessageCard
              type="error"
              title="Postavka nije završena"
              message={
                errorCode
                  ? `${error} (${errorCode})`
                  : error
              }
            />
          ) : null}
        </div>

        <aside
          className="
            h-fit
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            p-5
            xl:sticky
            xl:top-6
          "
        >
          <UserRound
            size={25}
          />

          <h3
            className="
              mt-5
              text-xl
              font-semibold
            "
          >
            Početni tim
          </h3>

          <div
            className="
              mt-6
              space-y-3
            "
          >
            <SummaryLine
              label="Salon"
              value={
                selectedBusiness
                  ?.name ??
                "Nije izabran"
              }
            />

            <SummaryLine
              label="Zaposleni"
              value={
                employeeName ||
                "Nije unet"
              }
            />

            <SummaryLine
              label="Pozicija"
              value={
                employeeTitle ||
                "Nije uneta"
              }
            />

            <SummaryLine
              label="Usluge"
              value={String(
                selectedBusiness
                  ?.serviceCount ??
                  0
              )}
            />

            <SummaryLine
              label="Radni dani"
              value={String(
                workingHours.filter(
                  (hour) =>
                    !hour.isClosed
                ).length
              )}
            />
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
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
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? (
              <>
                <LoaderCircle
                  size={17}
                  className="
                    animate-spin
                  "
                />

                Podešavam salon
              </>
            ) : (
              <>
                <UserRound
                  size={17}
                />

                Kreiraj zaposlenog
              </>
            )}
          </button>
        </aside>
      </form>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon:
    typeof Building2;

  title: string;
  description: string;
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3
      "
    >
      <Icon
        size={20}
        className="
          mt-0.5
          text-zinc-400
        "
      />

      <div>
        <h3
          className="
            text-lg
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
  );
}

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;

  icon:
    typeof Building2;

  children:
    React.ReactNode;
}) {
  return (
    <label>
      <span
        className={
          labelClassName
        }
      >
        <Icon
          size={14}
        />

        {label}
      </span>

      {children}
    </label>
  );
}

function SummaryLine({
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
        items-start
        justify-between
        gap-4
        border-b
        border-white/5
        pb-3
        text-sm
        last:border-0
      "
    >
      <span
        className="
          text-zinc-500
        "
      >
        {label}
      </span>

      <span
        className="
          text-right
          font-medium
          text-zinc-300
        "
      >
        {value}
      </span>
    </div>
  );
}

function ResultCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        rounded-2xl
        border
        border-white/10
        bg-zinc-950/40
        p-4
      "
    >
      <p
        className="
          text-xs
          uppercase
          tracking-wider
          text-zinc-500
        "
      >
        {label}
      </p>

      <p
        className="
          mt-2
          text-sm
          font-semibold
          text-zinc-200
        "
      >
        {value}
      </p>
    </div>
  );
}

function MessageCard({
  type,
  title,
  message,
}: {
  type:
    | "success"
    | "error";

  title: string;
  message: string;
}) {
  const Icon =
    type ===
      "success"
      ? CheckCircle2
      : AlertCircle;

  return (
    <section
      className={[
        "mx-auto",
        "max-w-4xl",
        "rounded-2xl",
        "border",
        "p-5",
        type ===
          "success"
          ? "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200"
          : "border-red-400/20 bg-red-400/[0.06] text-red-200",
      ].join(" ")}
    >
      <Icon
        size={21}
      />

      <h3
        className="
          mt-3
          font-semibold
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-1
          text-sm
          leading-6
          opacity-80
        "
      >
        {message}
      </p>
    </section>
  );
}

const labelClassName = `
  mb-2
  flex
  items-center
  gap-2
  text-xs
  font-semibold
  uppercase
  tracking-wider
  text-zinc-500
`;

const inputClassName = `
  w-full
  rounded-xl
  border
  border-white/10
  bg-zinc-950
  px-4
  py-3
  text-sm
  text-zinc-200
  outline-none
  transition
  focus:border-amber-300/50
  disabled:cursor-not-allowed
  disabled:opacity-40
`;