import type {
  AvailabilitySlot,
  DayOfWeek,
  MockAvailabilityParams,
  MockBusyPeriod,
  WorkingHours,
} from "./types";
import { employees, services } from "./mockData";
import { bookingConfig, businessConfig } from "./config";

/**
 * Mock busy periods - simulira zauzete termine zaposlenih.
 * Kada se poveže backend, ovo će se zameniti stvarnim booking podacima.
 */
export const MOCK_BUSY_PERIODS: MockBusyPeriod[] = [
  // Arben (e1) - Monday
  {
    employeeId: "e1",
    dayOfWeek: 1,
    startTime: "10:00",
    endTime: "11:00",
  },
  {
    employeeId: "e1",
    dayOfWeek: 1,
    startTime: "14:00",
    endTime: "15:00",
  },

  // Arben (e1) - Wednesday
  {
    employeeId: "e1",
    dayOfWeek: 3,
    startTime: "09:00",
    endTime: "10:30",
  },

  // Elira (e2) - Tuesday
  {
    employeeId: "e2",
    dayOfWeek: 2,
    startTime: "11:00",
    endTime: "12:30",
  },
  {
    employeeId: "e2",
    dayOfWeek: 2,
    startTime: "15:00",
    endTime: "16:00",
  },

  // Elira (e2) - Thursday
  {
    employeeId: "e2",
    dayOfWeek: 4,
    startTime: "13:00",
    endTime: "14:30",
  },
];

/**
 * Konvertuje "HH:MM" u minute od ponoći.
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);

  return hours * 60 + minutes;
}

/**
 * Konvertuje minute od ponoći u "HH:MM".
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours.toString().padStart(2, "0")}:${remainingMinutes
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Proverava da li se dva vremenska intervala preklapaju.
 */
function doIntervalsOverlap(
  firstStart: number,
  firstEnd: number,
  secondStart: number,
  secondEnd: number
): boolean {
  return firstStart < secondEnd && firstEnd > secondStart;
}

/**
 * Parsira YYYY-MM-DD kao lokalni datum.
 * Ne koristi UTC parsiranje, pa nema timezone pomeranja.
 */
function parseLocalDate(date: string): Date | null {
  const [year, month, day] = date.split("-").map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }

  const localDate = new Date(year, month - 1, day);

  const isValid =
    localDate.getFullYear() === year &&
    localDate.getMonth() === month - 1 &&
    localDate.getDate() === day;

  return isValid ? localDate : null;
}

/**
 * Vraća dan u nedelji za dati datum.
 */
function getDayOfWeek(date: string): DayOfWeek | null {
  const localDate = parseLocalDate(date);

  if (!localDate) {
    return null;
  }

  return localDate.getDay() as DayOfWeek;
}

/**
 * Kreira lokalni Date objekat za određeni datum i vreme.
 */
function getSlotDateTime(
  date: string,
  time: string
): Date | null {
  const localDate = parseLocalDate(date);
  const [hours, minutes] = time.split(":").map(Number);

  if (
    !localDate ||
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return new Date(
    localDate.getFullYear(),
    localDate.getMonth(),
    localDate.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

/**
 * Proverava minimalni period unapred za rezervaciju.
 *
 * Na primer, ako je minimumAdvanceMinutes 60,
 * termin mora početi najmanje 60 minuta od trenutnog vremena.
 */
function meetsMinimumAdvance(
  date: string,
  time: string
): boolean {
  const slotDateTime = getSlotDateTime(date, time);

  if (!slotDateTime) {
    return false;
  }

  const earliestAllowedTime =
    Date.now() +
    bookingConfig.minimumAdvanceMinutes * 60 * 1000;

  return slotDateTime.getTime() >= earliestAllowedTime;
}

/**
 * Vraća radno vreme zaposlenog za određeni dan.
 *
 * Ako zaposleni nema posebno radno vreme,
 * koristi glavno radno vreme salona.
 */
function getEmployeeWorkingHours(
  employeeId: string,
  dayOfWeek: DayOfWeek
): WorkingHours | null {
  const employee = employees.find(
    (item) => item.id === employeeId && item.isActive
  );

  if (!employee) {
    return null;
  }

  if (employee.workingHours) {
    return (
      employee.workingHours.find(
        (hours) => hours.dayOfWeek === dayOfWeek
      ) ?? null
    );
  }

  return (
    businessConfig.workingHours.find(
      (hours) => hours.dayOfWeek === dayOfWeek
    ) ?? null
  );
}

/**
 * Proverava da li zaposleni ima dovoljno slobodnog vremena
 * za celu izabranu uslugu.
 */
function employeeHasAvailability(
  employeeId: string,
  dayOfWeek: DayOfWeek,
  slotStartMinutes: number,
  durationMinutes: number
): boolean {
  const slotEndMinutes =
    slotStartMinutes + durationMinutes;

  const workingHours = getEmployeeWorkingHours(
    employeeId,
    dayOfWeek
  );

  if (
    !workingHours ||
    workingHours.isClosed ||
    !workingHours.openTime ||
    !workingHours.closeTime
  ) {
    return false;
  }

  const employeeOpenMinutes = timeToMinutes(
    workingHours.openTime
  );

  const employeeCloseMinutes = timeToMinutes(
    workingHours.closeTime
  );

  if (
    slotStartMinutes < employeeOpenMinutes ||
    slotEndMinutes > employeeCloseMinutes
  ) {
    return false;
  }

  const busyPeriods = MOCK_BUSY_PERIODS.filter(
    (period) =>
      period.employeeId === employeeId &&
      period.dayOfWeek === dayOfWeek
  );

  for (const busyPeriod of busyPeriods) {
    const busyStartMinutes = timeToMinutes(
      busyPeriod.startTime
    );

    const busyEndMinutes = timeToMinutes(
      busyPeriod.endTime
    );

    if (
      doIntervalsOverlap(
        slotStartMinutes,
        slotEndMinutes,
        busyStartMinutes,
        busyEndMinutes
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Vraća listu slotova sa statusom dostupnosti.
 */
export function getMockAvailability(
  params: MockAvailabilityParams
): AvailabilitySlot[] {
  const {
    employeePreference,
    serviceId,
    date,
  } = params;

  if (!serviceId || !date || !employeePreference) {
    return [];
  }

  const service = services.find(
    (item) =>
      item.id === serviceId && item.isActive
  );

  if (!service) {
    return [];
  }

  const dayOfWeek = getDayOfWeek(date);

  if (dayOfWeek === null) {
    return [];
  }

  let employeeIdsToCheck: string[];

  if (employeePreference === "any") {
    employeeIdsToCheck = employees
      .filter(
        (employee) =>
          employee.isActive &&
          employee.serviceIds.includes(serviceId)
      )
      .map((employee) => employee.id);
  } else {
    const selectedEmployee = employees.find(
      (employee) =>
        employee.id === employeePreference &&
        employee.isActive
    );

    if (
      !selectedEmployee ||
      !selectedEmployee.serviceIds.includes(serviceId)
    ) {
      return [];
    }

    employeeIdsToCheck = [selectedEmployee.id];
  }

  if (employeeIdsToCheck.length === 0) {
    return [];
  }

  const salonWorkingHours =
    businessConfig.workingHours.find(
      (hours) => hours.dayOfWeek === dayOfWeek
    );

  if (
    !salonWorkingHours ||
    salonWorkingHours.isClosed ||
    !salonWorkingHours.openTime ||
    !salonWorkingHours.closeTime
  ) {
    return [];
  }

  const salonOpenMinutes = timeToMinutes(
    salonWorkingHours.openTime
  );

  const salonCloseMinutes = timeToMinutes(
    salonWorkingHours.closeTime
  );

  const allSlots: string[] = [];

  for (
    let minutes = salonOpenMinutes;
    minutes < salonCloseMinutes;
    minutes += bookingConfig.slotIntervalMinutes
  ) {
    allSlots.push(minutesToTime(minutes));
  }

  return allSlots.map((time) => {
    const slotStartMinutes = timeToMinutes(time);

    const slotEndMinutes =
      slotStartMinutes + service.durationMinutes;

    if (!meetsMinimumAdvance(date, time)) {
      return {
        time,
        available: false,
      };
    }

    if (slotEndMinutes > salonCloseMinutes) {
      return {
        time,
        available: false,
      };
    }

    const hasAvailableEmployee =
      employeeIdsToCheck.some((employeeId) =>
        employeeHasAvailability(
          employeeId,
          dayOfWeek,
          slotStartMinutes,
          service.durationMinutes
        )
      );

    return {
      time,
      available: hasAvailableEmployee,
    };
  });
}

/**
 * Vraća samo dostupna vremena.
 */
export function getAvailableSlots(
  params: MockAvailabilityParams
): string[] {
  return getMockAvailability(params)
    .filter((slot) => slot.available)
    .map((slot) => slot.time);
}

/**
 * Proverava da li je određeni termin dostupan.
 */
export function isSlotAvailable(
  params: MockAvailabilityParams,
  time: string
): boolean {
  const slot = getMockAvailability(params).find(
    (item) => item.time === time
  );

  return slot?.available ?? false;
}