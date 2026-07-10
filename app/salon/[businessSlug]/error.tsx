"use client";

import RouteErrorState from "@/components/system/RouteErrorState";

type TenantErrorProps = {
  error: Error & {
    digest?: string;
  };
  unstable_retry: () => void;
};

export default function TenantError({
  error,
  unstable_retry,
}: TenantErrorProps) {
  return (
    <RouteErrorState
      fullScreen
      eyebrow="Salon trenutno nije dostupan"
      title="Nismo uspeli da učitamo salon"
      description="Problem može biti privremen. Pokušaj ponovo ili se vrati na početnu stranicu platforme."
      digest={error.digest}
      retry={unstable_retry}
      homeHref="/"
      homeLabel="Nazad na platformu"
    />
  );
}
