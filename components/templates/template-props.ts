import type {
  Locale,
} from "@/lib/types";

export type PublicTemplateProps = {
  locale: Locale;
  previewMode: boolean;

  onLocaleChange: (
    locale: Locale
  ) => void;

  onBook: () => void;

  onBookService: (
    serviceId: string
  ) => void;

  onBookEmployee: (
    employeeId: string
  ) => void;

  onSwitchToDesktop:
    () => void;
};
