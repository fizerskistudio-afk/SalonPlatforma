"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { DEFAULT_BUSINESS_SLUG } from "@/lib/business/defaults";
import type {
  CatalogData,
} from "@/lib/types";

export { DEFAULT_BUSINESS_SLUG };

type CatalogStatus =
  | "loading"
  | "success"
  | "error";

type CatalogContextValue = {
  catalog: CatalogData | null;
  status: CatalogStatus;
  error: string | null;
  reload: () => void;
};

type CatalogProviderProps = {
  children: ReactNode;
  businessSlug?: string;
};

type CatalogSuccessResponse = {
  ok: true;
  source: "supabase";
  catalog: CatalogData;
  counts: {
    categories: number;
    services: number;
    employees: number;
    employeeServices: number;
    workingHours: number;
    galleryItems: number;
  };
};

type CatalogErrorResponse = {
  ok: false;
  message: string;
  code: string;
};

type CatalogResponse =
  | CatalogSuccessResponse
  | CatalogErrorResponse;

const CatalogContext =
  createContext<CatalogContextValue | null>(
    null
  );

export function CatalogProvider({
  children,
  businessSlug =
    DEFAULT_BUSINESS_SLUG,
}: CatalogProviderProps) {
  const [catalog, setCatalog] =
    useState<CatalogData | null>(null);

  const [status, setStatus] =
    useState<CatalogStatus>("loading");

  const [error, setError] =
    useState<string | null>(null);

  const [
    reloadVersion,
    setReloadVersion,
  ] = useState(0);

  useEffect(() => {
    const abortController =
      new AbortController();

    async function loadCatalog() {
      setStatus("loading");
      setError(null);

      try {
        const searchParams =
          new URLSearchParams({
            businessSlug,
          });

        const response = await fetch(
          `/api/catalog?${searchParams.toString()}`,
          {
            method: "GET",
            cache: "no-store",
            signal:
              abortController.signal,
          }
        );

        const payload =
          (await response.json()) as CatalogResponse;

        if (
          !response.ok ||
          !payload.ok
        ) {
          const message =
            payload.ok
              ? "Catalog request failed."
              : payload.message;

          throw new Error(message);
        }

        setCatalog(payload.catalog);
        setStatus("success");
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Failed to load salon catalog:",
          loadError
        );

        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unknown catalog error.";

        setCatalog(null);
        setError(message);
        setStatus("error");
      }
    }

    void loadCatalog();

    return () => {
      abortController.abort();
    };
  }, [
    businessSlug,
    reloadVersion,
  ]);

  const reload = () => {
    setReloadVersion(
      (currentVersion) =>
        currentVersion + 1
    );
  };

  return (
    <CatalogContext.Provider
      value={{
        catalog,
        status,
        error,
        reload,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const context =
    useContext(CatalogContext);

  if (!context) {
    throw new Error(
      "useCatalog must be used inside CatalogProvider."
    );
  }

  return context;
}

export function useCatalogData(): CatalogData {
  const {
    catalog,
    status,
  } = useCatalog();

  if (
    status !== "success" ||
    !catalog
  ) {
    throw new Error(
      "Catalog data is not ready."
    );
  }

  return catalog;
}
