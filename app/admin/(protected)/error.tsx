"use client";

import RouteErrorState from "@/components/system/RouteErrorState";

type AdminErrorProps = {
  error: Error & {
    digest?: string;
  };
  unstable_retry: () => void;
};

export default function AdminError({
  error,
  unstable_retry,
}: AdminErrorProps) {
  return (
    <RouteErrorState
      eyebrow="Admin problem"
      title="Administratorski ekran nije učitan"
      description="Sačuvani podaci nisu promenjeni. Pokušaj ponovo ili se vrati na početni admin ekran."
      digest={error.digest}
      retry={unstable_retry}
      homeHref="/admin"
      homeLabel="Admin početna"
    />
  );
}
