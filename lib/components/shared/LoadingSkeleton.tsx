type LoadingSkeletonProps = {
  variant?: "text" | "card" | "image" | "circle";
  count?: number;
  className?: string;
};

const variantClasses: Record<
  NonNullable<LoadingSkeletonProps["variant"]>,
  string
> = {
  text: "h-4 w-full",
  card: "h-32 w-full rounded-2xl",
  image: "aspect-[4/5] w-full rounded-2xl",
  circle: "h-16 w-16 rounded-full",
};

export default function LoadingSkeleton({
  variant = "text",
  count = 1,
  className = "",
}: LoadingSkeletonProps) {
  const safeCount = Math.max(1, count);

  const classes = [
    "animate-pulse rounded-xl bg-[var(--brand-secondary)] motion-reduce:animate-none",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (safeCount === 1) {
    return <div className={classes} aria-hidden="true" />;
  }

  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: safeCount }, (_, index) => (
        <div key={index} className={classes} />
      ))}
    </div>
  );
}