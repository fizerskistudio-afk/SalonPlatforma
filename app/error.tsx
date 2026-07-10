"use client";

import RouteErrorState from "@/components/system/RouteErrorState";

type RootErrorProps = {
  error: Error & {
    digest?: string;
  };
  unstable_retry: () => void;
};

export default function RootError({
  error,
  unstable_retry,
}: RootErrorProps) {
  return (
    <RouteErrorState
      fullScreen
      title="Platforma trenutno nije dostupna"
      description="Došlo je do neočekivanog problema pri učitavanju stranice. Pokušaj ponovo ili se vrati na početnu stranicu."
      digest={error.digest}
      retry={unstable_retry}
      homeHref="/"
      homeLabel="Početna stranica"
    />
  );
}
