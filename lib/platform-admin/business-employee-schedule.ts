export const DAY_LABELS = [
  "Nedelja",
  "Ponedeljak",
  "Utorak",
  "Sreda",
  "Četvrtak",
  "Petak",
  "Subota",
] as const;

export type EmployeeScheduleHour = {
  dayOfWeek: number;
  label: string;
  isClosed: boolean;
  openTime: string;
  closeTime: string;
};

export function normalizeTimeValue(
  value: string | null
): string {
  if (!value) {
    return "09:00";
  }

  const match =
    /^(\d{2}):(\d{2})/.exec(
      value.trim()
    );

  return match
    ? `${match[1]}:${match[2]}`
    : "09:00";
}

export function createDefaultSchedule():
  EmployeeScheduleHour[] {
  return DAY_LABELS.map(
    (label, dayOfWeek) => ({
      dayOfWeek,
      label,
      isClosed: true,
      openTime: "09:00",
      closeTime: "17:00",
    })
  );
}
