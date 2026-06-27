import type {
  AvailabilitySlot,
  MockAvailabilityParams,
  MockBusyPeriod,
  DayOfWeek,
  WorkingHours,
} from "./types";
import { services, employees } from "./mockData";
import { businessConfig, bookingConfig } from "./config";

/**
 * Mock busy periods - simulira zauzete termine zaposlenih.
 * Kada se poveže backend, ovo će se zameniti stvarnim booking podacima.
 */
export const MOCK_BUSY_PERIODS: MockBusyPeriod[] = [
  // Arben (e1) - Monday
  { employeeId: "e1", dayOfWeek: 1, startTime: "10:00", endTime: "11:00" },
  { employeeId: "e1", dayOfWeek: 1, startTime: "14:00", endTime: "15:00" },
  // Arben (e1) - Wednesday
  { employeeId: "e1", dayOfWeek: 3, startTime: "09:00", endTime: "10:30" },
  // Elira (e2) - Tuesday
  { employeeId: "e2", dayOfWeek: 2, startTime: "11:00", endTime: "12:30" },
  { employeeId: "e2", dayOfWeek: 2, startTime: "15:00", endTime: "16:00" },
  // Elira (e2) - Thursday
  { employeeId: "e2", dayOfWeek: 4, startTime: "13:00", endTime: "14:30" },
];

/**
 * Helper: Konvertuj "HH:MM" u minute od ponoći
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Helper: Konvertuj minute od ponoći u "HH:MM"
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
}

/**
 * Helper: Proveri da li se dva vremenska intervala preklapaju
 */
function doIntervalsOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && end1 > start2;
}

/**
 * Helper: Vrati dan u nedelji za dati datum (0-6)
 * Koristi lokalno parsiranje da izbegne timezone probleme
 */
function getDayOfWeek(date: string): DayOfWeek {
  const [year, month, day] = date.split("-").map(Number);
  const localDate = new Date(year, month - 1, day);
  return localDate.getDay() as DayOfWeek;
}

/**
 * Helper: Vrati radno vreme za zaposlenog na određeni dan
 * Ako zaposleni nema workingHours, koristi businessConfig.workingHours
 */
function getEmployeeWorkingHours(
  employeeId: string,
  dayOfWeek: DayOfWeek
): WorkingHours | null {
  const employee = employees.find((emp) => emp.id === employeeId);
  
  // Ako zaposleni ima svoje workingHours, koristi ih
  if (employee?.workingHours) {
    return employee.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek) || null;
  }
  
  // Fallback na businessConfig.workingHours
  return businessConfig.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek) || null;
}

/**
 * Helper: Proveri da li zaposleni ima dovoljno slobodnog vremena za uslugu
 */
function employeeHasAvailability(
  employeeId: string,
  dayOfWeek: DayOfWeek,
  slotStartMinutes: number,
  durationMinutes: number
): boolean {
  const slotEndMinutes = slotStartMinutes + durationMinutes;

  // Proveri radno vreme zaposlenog
  const workingHours = getEmployeeWorkingHours(employeeId, dayOfWeek);
  if (!workingHours || workingHours.isClosed || !workingHours.openTime || !workingHours.closeTime) {
    return false; // Zaposleni ne radi tog dana
  }

  const openMinutes = timeToMinutes(workingHours.openTime);
  const closeMinutes = timeToMinutes(workingHours.closeTime);

  // Proveri da li cela usluga može da stane u smenu
  if (slotStartMinutes < openMinutes || slotEndMinutes > closeMinutes) {
    return false;
  }

  // Proveri sve busy periode za ovog zaposlenog na ovaj dan
  const busyPeriods = MOCK_BUSY_PERIODS.filter(
    (period) => period.employeeId === employeeId && period.dayOfWeek === dayOfWeek
  );

  for (const busy of busyPeriods) {
    const busyStart = timeToMinutes(busy.startTime);
    const busyEnd = timeToMinutes(busy.endTime);

    // Ako se slot preklapa sa busy periodom, nema dostupnosti
    if (doIntervalsOverlap(slotStartMinutes, slotEndMinutes, busyStart, busyEnd)) {
      return false;
    }
  }

  return true;
}

/**
 * Glavna funkcija: Vrati listu slotova sa statusom dostupnosti
 */
export function getMockAvailability(params: MockAvailabilityParams): AvailabilitySlot[] {
  const { employeePreference, serviceId, date } = params;

  // Ako nedostaju osnovni podaci, vrati praznu listu
  if (!serviceId || !date || !employeePreference) {
    return [];
  }

  // Pronađi izabranu uslugu
  const service = services.find((s) => s.id === serviceId);
  if (!service) {
    return [];
  }

  // Odredi dan u nedelji
  const dayOfWeek = getDayOfWeek(date);

  // Odredi koje zaposlene da proverimo
  let employeesToCheck: string[];

  if (employeePreference === "any") {
    // Svi zaposleni koji rade ovu uslugu
    employeesToCheck = employees
      .filter((emp) => emp.serviceIds.includes(serviceId))
      .map((emp) => emp.id);
  } else {
    // Specifičan zaposleni - validiraj
    const employee = employees.find((emp) => emp.id === employeePreference);
    if (!employee) {
      return []; // Zaposleni ne postoji
    }
    if (!employee.serviceIds.includes(serviceId)) {
      return []; // Zaposleni ne radi ovu uslugu
    }
    employeesToCheck = [employeePreference];
  }

  if (employeesToCheck.length === 0) {
    return []; // Nema zaposlenih za ovu uslugu
  }

  // Proveri radno vreme salona za ovaj dan (kao krajnja granica)
  const salonWorkingHours = businessConfig.workingHours.find((wh) => wh.dayOfWeek === dayOfWeek);
  if (!salonWorkingHours || salonWorkingHours.isClosed || !salonWorkingHours.openTime || !salonWorkingHours.closeTime) {
    return []; // Salon je zatvoren
  }

  const salonOpenMinutes = timeToMinutes(salonWorkingHours.openTime);
  const salonCloseMinutes = timeToMinutes(salonWorkingHours.closeTime);

  // Generiši sve moguće slotove unutar radnog vremena salona
  const intervalMinutes = bookingConfig.slotIntervalMinutes;
  const allSlots: string[] = [];

  for (let minutes = salonOpenMinutes; minutes < salonCloseMinutes; minutes += intervalMinutes) {
    allSlots.push(minutesToTime(minutes));
  }

  // Proveri dostupnost za svaki slot
  const slots: AvailabilitySlot[] = allSlots.map((time) => {
    const slotStartMinutes = timeToMinutes(time);
    const slotEndMinutes = slotStartMinutes + service.durationMinutes;

    // Proveri da li usluga može da se završi pre zatvaranja salona
    if (slotEndMinutes > salonCloseMinutes) {
      return { time, available: false };
    }

    // Proveri da li bar jedan zaposleni ima dostupnosti
    const hasAvailability = employeesToCheck.some((empId) =>
      employeeHasAvailability(empId, dayOfWeek, slotStartMinutes, service.durationMinutes)
    );

    return { time, available: hasAvailability };
  });

  return slots;
}

/**
 * Helper: Vrati samo dostupne slotove
 */
export function getAvailableSlots(params: MockAvailabilityParams): string[] {
  return getMockAvailability(params)
    .filter((slot) => slot.available)
    .map((slot) => slot.time);
}

/**
 * Helper: Proveri da li je specifičan slot dostupan
 */
export function isSlotAvailable(
  params: MockAvailabilityParams,
  time: string
): boolean {
  const slots = getMockAvailability(params);
  const slot = slots.find((s) => s.time === time);
  return slot?.available ?? false;
}