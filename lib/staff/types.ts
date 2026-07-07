export type StaffBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type StaffBooking = {
  id: string;
  referenceCode: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;

  serviceName: string;

  startsAt: string;
  endsAt: string;
  durationMinutes: number;

  status: StaffBookingStatus;
};

export type StaffScheduleDay = {
  dayOfWeek: number;
  label: string;
  shortLabel: string;

  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;

  source:
    | "employee"
    | "business"
    | "missing";
};

export type StaffApprovedTimeOff = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
};

export type StaffTimeOffRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export type StaffTimeOffRequest = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string;
  status: StaffTimeOffRequestStatus;
  reviewNote: string | null;
  createdAt: string;
};

export type StaffDashboardData = {
  business: {
    id: string;
    name: string;
    slug: string;
    timezone: string;
    currency: string;
  };

  employee: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  };

  bookings: StaffBooking[];
  schedule: StaffScheduleDay[];
  approvedTimeOff: StaffApprovedTimeOff[];
  timeOffRequests: StaffTimeOffRequest[];
};
