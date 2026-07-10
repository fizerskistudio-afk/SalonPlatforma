"use client";

import RouteErrorState from "@/components/system/RouteErrorState";

type StaffErrorProps = {
  error: Error & {
    digest?: string;
  };
  unstable_retry: () => void;
};

export default function StaffError({
  error,
  unstable_retry,
}: StaffErrorProps) {
  return (
    <RouteErrorState
      eyebrow="Staff problem"
      title="Staff ekran nije učitan"
      description="Došlo je do privremenog problema pri učitavanju podataka. Pokušaj ponovo ili se vrati na staff početnu stranicu."
      digest={error.digest}
      retry={unstable_retry}
      homeHref="/staff"
      homeLabel="Staff početna"
    />
  );
}
