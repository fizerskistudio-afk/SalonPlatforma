"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  Clock,
  LoaderCircle,
} from "lucide-react";

import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
  translations,
} from "@/lib/translations";
import type { Locale } from "@/lib/types";

import EmptyState from "../shared/EmptyState";
import SectionHeader from "../shared/SectionHeader";

type TimeStepProps = {
  locale: Locale;
  selectedServiceId:
    | string
    | null;
  selectedDate: string | null;
  selectedEmployeePreference:
    | "any"
    | string
    | null;
  selectedTime: string | null;
  onSelectTime: (
    time: string,
    employeeId: string,
    startsAt: string
  ) => void;
};

type AvailableSlotRow = {
  employeeId: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
};

type AvailabilitySuccessResponse = {
  ok: true;

  business: {
    id: string;
    slug: string;
    timezone: string;
  };

  count: number;
  slots: AvailableSlotRow[];
};

type AvailabilityErrorResponse = {
  ok: false;
  message: string;
  error?: string;
};

type AvailabilityResponse =
  | AvailabilitySuccessResponse
  | AvailabilityErrorResponse;

type DisplaySlot = {
  time: string;
  employeeId: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
};

type AvailabilityState = {
  requestKey: string | null;

  status:
    | "idle"
    | "loading"
    | "success"
    | "error";

  slots: DisplaySlot[];
};

function formatTimeInTimezone(
  isoValue: string,
  timezone: string
): string | null {
  const date = new Date(isoValue);

  if (
    Number.isNaN(date.getTime())
  ) {
    return null;
  }

  const formatter =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      }
    );

  const parts =
    formatter.formatToParts(date);

  const hour = parts.find(
    (part) =>
      part.type === "hour"
  )?.value;

  const minute = parts.find(
    (part) =>
      part.type === "minute"
  )?.value;

  if (!hour || !minute) {
    return null;
  }

  return `${hour}:${minute}`;
}

function createDisplaySlots(
  rows: AvailableSlotRow[],
  timezone: string
): DisplaySlot[] {
  const sortedRows = [
    ...rows,
  ].sort(
    (first, second) => {
      const timeComparison =
        first.startsAt.localeCompare(
          second.startsAt
        );

      if (
        timeComparison !== 0
      ) {
        return timeComparison;
      }

      return first.employeeName.localeCompare(
        second.employeeName
      );
    }
  );

  const usedTimes =
    new Set<string>();

  const result: DisplaySlot[] =
    [];

  for (const row of sortedRows) {
    const time =
      formatTimeInTimezone(
        row.startsAt,
        timezone
      );

    if (
      !time ||
      usedTimes.has(time)
    ) {
      continue;
    }

    usedTimes.add(time);

    result.push({
      time,
      employeeId:
        row.employeeId,
      employeeName:
        row.employeeName,
      startsAt:
        row.startsAt,
      endsAt:
        row.endsAt,
    });
  }

  return result;
}

export default function TimeStep({
  locale,
  selectedServiceId,
  selectedDate,
  selectedEmployeePreference,
  selectedTime,
  onSelectTime,
}: TimeStepProps) {
  const {
    business,
  } = useCatalogData();

  const [
    availability,
    setAvailability,
  ] =
    useState<AvailabilityState>({
      requestKey: null,
      status: "idle",
      slots: [],
    });

  const hasRequiredSelection =
    Boolean(
      selectedServiceId &&
        selectedDate &&
        selectedEmployeePreference
    );

  const employeeId =
    selectedEmployeePreference &&
    selectedEmployeePreference !==
      "any"
      ? selectedEmployeePreference
      : null;

  const requestKey =
    hasRequiredSelection &&
    selectedServiceId &&
    selectedDate
      ? [
          selectedServiceId,
          selectedDate,
          employeeId ?? "any",
        ].join(":")
      : null;

  useEffect(() => {
    if (
      !hasRequiredSelection
    ) {
      setAvailability({
        requestKey: null,
        status: "idle",
        slots: [],
      });

      return;
    }

    if (
      !requestKey ||
      !selectedServiceId ||
      !selectedDate
    ) {
      setAvailability({
        requestKey,
        status: "error",
        slots: [],
      });

      return;
    }

    const abortController =
      new AbortController();

    setAvailability({
      requestKey,
      status: "loading",
      slots: [],
    });

    async function loadAvailability(
      serviceIdForRequest: string,
      dateForRequest: string,
      employeeIdForRequest:
        | string
        | null,
      activeRequestKey: string,
      signal: AbortSignal
    ) {
      try {
        const searchParams =
          new URLSearchParams([
            [
              "businessSlug",
              business.slug,
            ],
            [
              "serviceId",
              serviceIdForRequest,
            ],
            [
              "date",
              dateForRequest,
            ],
          ]);

        if (
          employeeIdForRequest
        ) {
          searchParams.set(
            "employeeId",
            employeeIdForRequest
          );
        }

        const response =
          await fetch(
            `/api/availability?${searchParams.toString()}`,
            {
              method: "GET",
              cache: "no-store",
              signal,
            }
          );

        const payload =
          (await response.json()) as AvailabilityResponse;

        if (
          !response.ok ||
          !payload.ok
        ) {
          const message =
            payload.ok
              ? "Availability request failed."
              : payload.message;

          throw new Error(
            message
          );
        }

        const slots =
          createDisplaySlots(
            payload.slots,
            payload.business
              .timezone
          );

        setAvailability({
          requestKey:
            activeRequestKey,
          status: "success",
          slots,
        });
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(
          "Failed to load availability:",
          error
        );

        setAvailability({
          requestKey:
            activeRequestKey,
          status: "error",
          slots: [],
        });
      }
    }

    void loadAvailability(
      selectedServiceId,
      selectedDate,
      employeeId,
      requestKey,
      abortController.signal
    );

    return () => {
      abortController.abort();
    };
  }, [
    business.slug,
    employeeId,
    hasRequiredSelection,
    requestKey,
    selectedDate,
    selectedServiceId,
  ]);

  if (
    !hasRequiredSelection
  ) {
    return (
      <EmptyState
        title={
          translations.booking
            .completePreviousSteps
        }
        description={
          translations.booking
            .completePreviousStepsDescription
        }
        icon={Clock}
        locale={locale}
      />
    );
  }

  const isLoading =
    availability.requestKey !==
      requestKey ||
    availability.status ===
      "idle" ||
    availability.status ===
      "loading";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title={
            translations.booking
              .selectTime
          }
          subtitle={
            translations.booking
              .selectTimeDescription
          }
          locale={locale}
          align="left"
        />

        <div
          role="status"
          aria-live="polite"
          className="flex min-h-36 items-center justify-center gap-3 rounded-2xl border border-[var(--brand-border)] bg-[var(--brand-surface)] px-5 py-8 text-sm text-[var(--brand-muted)]"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin text-[var(--brand-primary)] motion-reduce:animate-none"
            aria-hidden="true"
          />

          <span>
            {t(
              translations.common
                .loading,
              locale
            )}
          </span>
        </div>
      </div>
    );
  }

  if (
    availability.status ===
    "error" ||
    availability.slots.length ===
      0
  ) {
    return (
      <EmptyState
        title={
          translations.common
            .noTimes
        }
        description={
          translations.common
            .noTimesDescription
        }
        icon={Clock}
        locale={locale}
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title={
          translations.booking
            .selectTime
        }
        subtitle={
          translations.booking
            .selectTimeDescription
        }
        locale={locale}
        align="left"
      />

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {availability.slots.map(
          (slot) => {
            const isSelected =
              selectedTime ===
              slot.time;

            return (
              <button
                key={slot.time}
                type="button"
                onClick={() =>
                  onSelectTime(
                    slot.time,
                    slot.employeeId,
                    slot.startsAt
                  )
                }
                aria-pressed={
                  isSelected
                }
                aria-label={`${t(
                  translations.common
                    .time,
                  locale
                )} ${slot.time}`}
                className={`rounded-2xl border-2 py-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none ${
                  isSelected
                    ? "border-[var(--brand-primary)] bg-[var(--brand-primary)] text-[var(--brand-background)]"
                    : "border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-text)] hover:border-[var(--brand-primary)]"
                }`}
              >
                {slot.time}
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}