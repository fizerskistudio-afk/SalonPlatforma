"use client";

import dynamic from "next/dynamic";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  LoaderCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";

import {
  CatalogProvider,
  useCatalog,
} from "@/lib/catalogContext";
import { DEFAULT_BUSINESS_SLUG } from "@/lib/business/defaults";
import {
  getLocaleDirection,
  isLocaleCode,
} from "@/lib/i18n/locales";
import {
  EMPTY_TEMPLATE_CONFIG,
  DEFAULT_TEMPLATE_KEY,
  getTemplateManifest,
  type TemplateConfig,
  type TemplateKey,
} from "@/lib/templates/registry";
import {
  t,
  translations,
} from "@/lib/translations";
import type {
  CatalogData,
  Locale,
  LocalizedText,
  ThemeColors,
} from "@/lib/types";

import TemplateRenderer from "./templates/TemplateRenderer";

const DesktopBookingModal =
  dynamic(
    () =>
      import(
        "./desktop/DesktopBookingModal"
      ),
    {
      ssr: false,
      loading: () => null,
    }
  );

const MobileBookingModal =
  dynamic(
    () =>
      import(
        "./mobile/MobileBookingModal"
      ),
    {
      ssr: false,
      loading: () => null,
    }
  );

type ViewPreference =
  | "auto"
  | "desktop"
  | "mobile";

type ResolvedViewport =
  Exclude<ViewPreference, "auto">;

type SalonPlatformProps = {
  businessSlug?: string;
  initialCatalog?:
    CatalogData | null;
  initialLocale?: Locale;
  initialViewport?:
    ResolvedViewport;
  previewMode?: boolean;
  templateKey?: TemplateKey;
  templateConfig?: TemplateConfig;
};

type SalonPlatformContentProps = {
  initialLocale: Locale;
  initialViewport:
    ResolvedViewport;
  previewMode: boolean;
  templateKey: TemplateKey;
  templateConfig: TemplateConfig;
};

type BrandStyle =
  CSSProperties & {
    "--brand-primary": string;
    "--brand-secondary": string;
    "--brand-background": string;
    "--brand-surface": string;
    "--brand-text": string;
    "--brand-muted": string;
    "--brand-border": string;
  };

const MOBILE_MEDIA_QUERY =
  "(max-width: 767px)";

const LOCALE_STORAGE_PREFIX =
  "salon-platform-locale";

const loadingMessages: LocalizedText = {
  "sr-Latn": "Učitavanje salona...",
  mk: "Се вчитува салонот...",
  sq: "Duke ngarkuar sallonin...",
  en: "Loading salon...",
};

const catalogErrorMessages:
  LocalizedText = {
  "sr-Latn": "Podaci salona nisu mogli da se učitaju.",
  mk: "Податоците за салонот не можеа да се вчитаат.",
  sq: "Të dhënat e sallonit nuk mund të ngarkoheshin.",
  en: "The salon data could not be loaded.",
};

const retryMessages: LocalizedText = {
  "sr-Latn": "Pokušaj ponovo",
  mk: "Обиди се повторно",
  sq: "Provo përsëri",
  en: "Try again",
};

function createBrandStyle(
  colors: ThemeColors
): BrandStyle {
  return {
    "--brand-primary":
      colors.primary,

    "--brand-secondary":
      colors.secondary,

    "--brand-background":
      colors.background,

    "--brand-surface":
      colors.surface,

    "--brand-text":
      colors.text,

    "--brand-muted":
      colors.muted,

    "--brand-border":
      colors.border,
  };
}

function getLocaleStorageKey(
  businessSlug: string
): string {
  return `${LOCALE_STORAGE_PREFIX}:${businessSlug}`;
}

function subscribeToMobileViewport(
  onStoreChange: () => void
): () => void {
  const mediaQuery =
    window.matchMedia(
      MOBILE_MEDIA_QUERY
    );

  mediaQuery.addEventListener(
    "change",
    onStoreChange
  );

  return () => {
    mediaQuery.removeEventListener(
      "change",
      onStoreChange
    );
  };
}

function getMobileViewportSnapshot(): boolean {
  return window.matchMedia(
    MOBILE_MEDIA_QUERY
  ).matches;
}

function CatalogLoadingScreen({
  locale,
}: {
  locale: Locale;
}) {
  return (
    <main
      className="flex min-h-[100dvh] items-center justify-center bg-[var(--brand-background)] px-6 text-[var(--brand-text)]"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-4 text-center">
        <LoaderCircle
          className="h-8 w-8 animate-spin text-[var(--brand-primary)] motion-reduce:animate-none"
          aria-hidden="true"
        />

        <p className="text-sm text-[var(--brand-muted)]">
          {t(
            loadingMessages,
            locale
          )}
        </p>
      </div>
    </main>
  );
}

function CatalogErrorScreen({
  locale,
  error,
  onRetry,
}: {
  locale: Locale;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[var(--brand-background)] px-6 text-[var(--brand-text)]">
      <div className="w-full max-w-md rounded-3xl border border-[var(--brand-border)] bg-[var(--brand-surface)] p-8 text-center shadow-xl">
        <h1 className="font-display mb-3 text-2xl font-semibold">
          {t(
            catalogErrorMessages,
            locale
          )}
        </h1>

        {process.env.NODE_ENV === "development" &&
        error && (
          <p className="mb-6 break-words text-sm text-[var(--brand-muted)]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--brand-primary)] px-5 py-2.5 font-medium text-[var(--brand-background)] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none"
        >
          <RefreshCw
            className="h-4 w-4"
            aria-hidden="true"
          />

          {t(
            retryMessages,
            locale
          )}
        </button>
      </div>
    </main>
  );
}

function SalonPlatformContent({
  initialLocale,
  initialViewport,
  previewMode,
  templateKey,
  templateConfig,
}: SalonPlatformContentProps) {
  const {
    catalog,
    status,
    error,
    reload,
  } = useCatalog();

  const [
    locale,
    setLocale,
  ] = useState<Locale>(
    initialLocale
  );

  const [
    viewPreference,
    setViewPreference,
  ] =
    useState<ViewPreference>(
      "auto"
    );

  const getInitialMobileViewportSnapshot =
    useCallback(
      () =>
        initialViewport ===
        "mobile",
      [
        initialViewport,
      ]
    );

  const isMobileViewport =
    useSyncExternalStore(
      subscribeToMobileViewport,
      getMobileViewportSnapshot,
      getInitialMobileViewportSnapshot
    );

  const [
    isBookingOpen,
    setIsBookingOpen,
  ] =
    useState(false);

  const [
    initialServiceId,
    setInitialServiceId,
  ] =
    useState<
      string | null
    >(null);

  const [
    initialEmployeeId,
    setInitialEmployeeId,
  ] =
    useState<
      string | null
    >(null);

  const localeInitializedRef =
    useRef(false);

  useEffect(() => {
    if (
      !catalog ||
      localeInitializedRef.current
    ) {
      return;
    }

    localeInitializedRef.current =
      true;

    const {
      business,
    } =
      catalog;

    let initialBusinessLocale:
      Locale =
        business
          .defaultContentLocale;

    try {
      const storedLocale =
        localStorage.getItem(
          getLocaleStorageKey(
            business.slug
          )
        );

      if (
        isLocaleCode(
          storedLocale
        ) &&
        business.supportedContentLocales.includes(
          storedLocale
        )
      ) {
        initialBusinessLocale =
          storedLocale;
      }
    } catch {
      // localStorage nije dostupan.
    }

    setLocale(
      initialBusinessLocale
    );
  }, [
    catalog,
  ]);

  useEffect(() => {
    if (
      !catalog ||
      !isLocaleCode(
        locale
      )
    ) {
      return;
    }

    if (
      !catalog.business.supportedContentLocales.includes(
        locale
      )
    ) {
      return;
    }

    document.documentElement.lang =
      locale;

    document.documentElement.dir =
      getLocaleDirection(
        locale
      );
  }, [
    catalog,
    locale,
  ]);

  const effectiveView:
    ResolvedViewport =
      viewPreference ===
      "auto"
        ? isMobileViewport
          ? "mobile"
          : "desktop"
        : viewPreference;

  const handleLocaleChange = (
    nextLocale:
      Locale
  ) => {
    if (
      !catalog ||
      !isLocaleCode(
        nextLocale
      ) ||
      !catalog.business.supportedContentLocales.includes(
        nextLocale
      )
    ) {
      return;
    }

    setLocale(
      nextLocale
    );

    try {
      localStorage.setItem(
        getLocaleStorageKey(
          catalog
            .business
            .slug
        ),
        nextLocale
      );
    } catch {
      // localStorage nije dostupan.
    }
  };

  const openBooking = () => {
    if (
      previewMode
    ) {
      return;
    }

    setInitialServiceId(
      null
    );

    setInitialEmployeeId(
      null
    );

    setIsBookingOpen(
      true
    );
  };

  const openBookingWithService = (
    serviceId:
      string
  ) => {
    if (
      previewMode
    ) {
      return;
    }

    setInitialServiceId(
      serviceId
    );

    setInitialEmployeeId(
      null
    );

    setIsBookingOpen(
      true
    );
  };

  const openBookingWithEmployee = (
    employeeId:
      string
  ) => {
    if (
      previewMode
    ) {
      return;
    }

    setInitialEmployeeId(
      employeeId
    );

    setInitialServiceId(
      null
    );

    setIsBookingOpen(
      true
    );
  };

  const closeBooking = () => {
    setIsBookingOpen(
      false
    );
  };

  const switchToDesktop = () => {
    setViewPreference(
      "desktop"
    );
  };

  const switchToMobile = () => {
    setViewPreference(
      "mobile"
    );
  };

  if (
    status ===
      "loading" ||
    !catalog
  ) {
    if (
      status ===
      "error"
    ) {
      return (
        <CatalogErrorScreen
          locale={
            locale
          }
          error={
            error
          }
          onRetry={
            reload
          }
        />
      );
    }

    return (
      <CatalogLoadingScreen
        locale={
          locale
        }
      />
    );
  }

  const templateManifest =
    getTemplateManifest(
      templateKey
    );

  const themeColors =
    templateManifest
      .defaultPalette ??
    catalog.business.theme;

  const brandStyle =
    createBrandStyle(
      themeColors
    );

  const direction =
    isLocaleCode(
      locale
    )
      ? getLocaleDirection(
          locale
        )
      : "ltr";

  const templateProps = {
    locale,

    onLocaleChange:
      handleLocaleChange,

    onBook:
      openBooking,

    onBookService:
      openBookingWithService,

    onBookEmployee:
      openBookingWithEmployee,

    onSwitchToDesktop:
      switchToDesktop,
  };

  return (
    <div
      className="min-h-[100dvh] bg-[var(--brand-background)] text-[var(--brand-text)]"
      style={
        brandStyle
      }
      lang={
        locale
      }
      dir={
        direction
      }
      data-active-template={
        templateKey
      }
      data-preview-mode={
        previewMode
          ? "true"
          : "false"
      }
    >
      {previewMode ? (
        <div className="fixed left-1/2 top-3 z-[80] -translate-x-1/2 rounded-full border border-sky-300/30 bg-zinc-950/95 px-4 py-2 text-center text-xs font-semibold text-sky-200 shadow-xl backdrop-blur">
          Platform admin preview · booking je isključen
        </div>
      ) : null}

      <TemplateRenderer
        templateKey={
          templateKey
        }
        templateConfig={
          templateConfig
        }
        viewport={
          effectiveView
        }
        {...templateProps}
      />

      {viewPreference ===
        "desktop" && (
        <button
          type="button"
          onClick={
            switchToMobile
          }
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--brand-border)] bg-[var(--brand-surface)] text-[var(--brand-primary)] shadow-lg transition-colors hover:bg-[var(--brand-primary)] hover:text-[var(--brand-background)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-[var(--brand-background)] motion-reduce:transition-none md:hidden"
          style={{
            marginBottom:
              "env(safe-area-inset-bottom)",
          }}
          aria-label={t(
            translations
              .common
              .mobileNavigation,
            locale
          )}
        >
          <Smartphone
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>
      )}

      {!previewMode &&
      isBookingOpen &&
        (effectiveView ===
        "mobile" ? (
          <MobileBookingModal
            isOpen
            locale={
              locale
            }
            initialServiceId={
              initialServiceId
            }
            initialEmployeeId={
              initialEmployeeId
            }
            onClose={
              closeBooking
            }
          />
        ) : (
          <DesktopBookingModal
            isOpen
            locale={
              locale
            }
            initialServiceId={
              initialServiceId
            }
            initialEmployeeId={
              initialEmployeeId
            }
            onClose={
              closeBooking
            }
          />
        ))}
    </div>
  );
}

export default function SalonPlatform({
  businessSlug =
    DEFAULT_BUSINESS_SLUG,
  initialCatalog = null,
  initialLocale =
    "mk",
  initialViewport =
    "desktop",
  previewMode =
    false,
  templateKey =
    DEFAULT_TEMPLATE_KEY,
  templateConfig =
    EMPTY_TEMPLATE_CONFIG,
}: SalonPlatformProps) {
  return (
    <CatalogProvider
      key={
        businessSlug
      }
      businessSlug={
        businessSlug
      }
      initialCatalog={
        initialCatalog
      }
    >
      <SalonPlatformContent
        initialLocale={
          initialLocale
        }
        initialViewport={
          initialViewport
        }
        previewMode={
          previewMode
        }
        templateKey={
          templateKey
        }
        templateConfig={
          templateConfig
        }
      />
    </CatalogProvider>
  );
}
