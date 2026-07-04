export const BUSINESS_BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
] as const;

export type BusinessBookingStatus =
  (typeof BUSINESS_BOOKING_STATUSES)[number];

export const BUSINESS_BOOKING_SOURCES = [
  "web",
  "admin",
  "phone",
  "walk_in",
] as const;

export type BusinessBookingSource =
  (typeof BUSINESS_BOOKING_SOURCES)[number];

export type BusinessBookingListItem = {
  id: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerNote: string | null;
  serviceId: string;
  serviceName: string;
  employeeId: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  priceAmount: number;
  currency: string;
  status: BusinessBookingStatus;
  source: BusinessBookingSource;
  internalNote: string | null;
  cancellationReason: string | null;
  cancelledAt: string | null;
  googleEventId: string | null;
  googleSyncStatus: string | null;
  googleSyncError: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BusinessBookingEmployeeOption = {
  id: string;
  name: string;
};

export type BusinessBookingManagementData = {
  business: {
    id: string;
    slug: string;
    name: string;
    timezone: string;
    defaultLocale: string;
  };
  generatedAt: string;
  employees: BusinessBookingEmployeeOption[];
  bookings: BusinessBookingListItem[];
};

export type BusinessBookingSlot = {
  employeeId: string;
  employeeName: string;
  startsAt: string;
  endsAt: string;
};

export type BusinessBookingApiResponse = {
  ok?: boolean;
  message?: string;
  code?: string;
  status?: BusinessBookingStatus;
  updatedAt?: string;
  slots?: BusinessBookingSlot[];
};

export const BUSINESS_BOOKING_STATUS_LABELS: Record<
  BusinessBookingStatus,
  string
> = {
  pending: "Na čekanju",
  confirmed: "Potvrđena",
  completed: "Završena",
  cancelled: "Otkazana",
  no_show: "Nije došao",
};

export const BUSINESS_BOOKING_SOURCE_LABELS: Record<
  BusinessBookingSource,
  string
> = {
  web: "Web",
  admin: "Admin",
  phone: "Telefon",
  walk_in: "Bez najave",
};

export function getAllowedBusinessBookingStatuses(
  status: BusinessBookingStatus
): readonly BusinessBookingStatus[] {
  switch (status) {
    case "pending":
      return ["confirmed", "cancelled"];
    case "confirmed":
      return ["completed", "cancelled", "no_show"];
    default:
      return [];
  }
}

export function formatBusinessBookingPrice(
  amount: number,
  currency: string
): string {
  try {
    return new Intl.NumberFormat("sr-Latn-RS", {
      style: "currency",
      currency: currency.trim().toUpperCase(),
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function getBusinessBookingDateKey(
  value: string,
  timezone: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const getPart = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${getPart("year")}-${getPart("month")}-${getPart("day")}`;
}

export function formatBusinessBookingDateTime(
  value: string,
  timezone: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatBusinessBookingTime(
  value: string,
  timezone: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sr-Latn-RS", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
}
