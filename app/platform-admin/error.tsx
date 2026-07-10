"use client";

import RouteErrorState from "@/components/system/RouteErrorState";

type PlatformAdminErrorProps = {
  error: Error & {
    digest?: string;
  };
  unstable_retry: () => void;
};

export default function PlatformAdminError({
  error,
  unstable_retry,
}: PlatformAdminErrorProps) {
  return (
    <RouteErrorState
      eyebrow="Platform admin problem"
      title="Operativni ekran nije učitan"
      description="Došlo je do privremenog problema pri učitavanju platformskih podataka. Pokušaj ponovo ili se vrati na platform-admin početnu stranicu."
      digest={error.digest}
      retry={unstable_retry}
      homeHref="/platform-admin"
      homeLabel="Platform admin početna"
    />
  );
}
