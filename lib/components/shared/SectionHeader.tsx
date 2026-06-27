import type {
  Locale,
  LocalizedText,
} from "@/lib/types";
import { t } from "@/lib/translations";

type SectionHeaderProps = {
  title: LocalizedText;
  subtitle?: LocalizedText;
  label?: LocalizedText;
  locale: Locale;
  align?: "left" | "center";
};

export default function SectionHeader({
  title,
  subtitle,
  label,
  locale,
  align = "center",
}: SectionHeaderProps) {
  const isCentered = align === "center";

  const alignmentClasses = isCentered
    ? "text-center"
    : "text-left";

  const subtitleAlignmentClasses = isCentered
    ? "mx-auto"
    : "mx-0";

  return (
    <header
      className={`mb-12 ${alignmentClasses}`}
    >
      {label && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-[var(--brand-primary)]">
          {t(label, locale)}
        </p>
      )}

      <h2 className="font-display mb-4 text-4xl font-semibold leading-tight text-[var(--brand-text)] lg:text-5xl">
        {t(title, locale)}
      </h2>

      {subtitle && (
        <p
          className={`max-w-xl leading-relaxed text-[var(--brand-muted)] ${subtitleAlignmentClasses}`}
        >
          {t(subtitle, locale)}
        </p>
      )}
    </header>
  );
}