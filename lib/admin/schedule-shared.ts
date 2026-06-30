export type ScheduleDayOfWeek =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6;

export const SCHEDULE_DAYS = [
  {
    value: 1,
    label: "Ponedeljak",
    shortLabel: "Pon",
  },
  {
    value: 2,
    label: "Utorak",
    shortLabel: "Uto",
  },
  {
    value: 3,
    label: "Sreda",
    shortLabel: "Sre",
  },
  {
    value: 4,
    label: "Četvrtak",
    shortLabel: "Čet",
  },
  {
    value: 5,
    label: "Petak",
    shortLabel: "Pet",
  },
  {
    value: 6,
    label: "Subota",
    shortLabel: "Sub",
  },
  {
    value: 0,
    label: "Nedelja",
    shortLabel: "Ned",
  },
] as const satisfies readonly {
  value: ScheduleDayOfWeek;
  label: string;
  shortLabel: string;
}[];