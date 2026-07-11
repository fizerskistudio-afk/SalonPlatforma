"use client";

import Image from "next/image";
import {
  Scissors,
  MapPin,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { useCatalogData } from "@/lib/catalogContext";
import {
  t,
} from "@/lib/translations";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import InstagramIcon from "@/components/shared/icons/InstagramIcon";
import type { PublicTemplateProps } from "../template-props";
import {
  barberLabels,
  formatServicePrice,
  getCategoryLabel,
  getLocationLine,
} from "./barber-utils";

export default function BarberHeritageMobileTemplate({
  locale,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
  onSwitchToDesktop,
}: PublicTemplateProps) {
  const { business, categories, services, employees, gallery } =
    useCatalogData();

  const displayServices = services.slice(0, 8);
  const displayEmployees = employees.slice(0, 4);
  const displayGallery = gallery.slice(0, 6);

  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const locationLine = getLocationLine(
    business.address,
    business.city,
    business.country,
    locale
  );

  const scrollToCarousel = (direction: "left" | "right") => {
    if (!carouselRef.current) return;
    const newIndex =
      direction === "left"
        ? Math.max(0, carouselIndex - 1)
        : Math.min(displayEmployees.length - 1, carouselIndex + 1);
    setCarouselIndex(newIndex);
    carouselRef.current.scrollTo({
      left: newIndex * carouselRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  return (
    <div
      className="min-h-screen pb-32"
      style={{
        backgroundColor: "var(--brand-background)",
        color: "var(--brand-text)",
      }}
    >
      {/* Mobile Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "var(--brand-background)",
          borderColor: "var(--brand-border)",
        }}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={`${business.name} logo`}
                width={28}
                height={28}
                className="h-7 w-7 flex-shrink-0 object-contain"
              />
            ) : (
              <Scissors
                className="h-5 w-5 flex-shrink-0"
                style={{ color: "var(--brand-primary)" }}
              />
            )}
            <span
              className="truncate text-base font-semibold tracking-wide"
              style={{ fontFamily: "serif" }}
            >
              {business.name}
            </span>
          </div>
          <LanguageSwitcher
            currentLocale={locale}
            onLocaleChange={onLocaleChange}
          />
        </div>
      </header>

      {/* Mobile Hero */}
      <section className="relative">
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
          {business.heroImageUrl ? (
            <>
              <Image
                src={business.heroImageUrl}
                alt={business.name}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
            </>
          ) : (
            <div
              className="flex h-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, var(--brand-surface) 0%, var(--brand-background) 100%)",
              }}
            >
              <Scissors
                className="h-20 w-20 opacity-20"
                style={{ color: "var(--brand-primary)" }}
              />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p
              className="mb-2 text-xs uppercase tracking-widest"
              style={{ color: "var(--brand-primary)" }}
            >
              {t(barberLabels.heroEyebrow, locale)}
            </p>
            <h1
              className="mb-3 text-4xl font-bold leading-tight"
              style={{ fontFamily: "serif", color: "var(--brand-text)" }}
            >
              {t(barberLabels.heroHeadline1, locale)}
              <br />
              {t(barberLabels.heroHeadline2, locale)}
            </h1>
            {business.tagline && (
              <p className="mb-4 text-sm" style={{ color: "var(--brand-muted)" }}>
                {t(business.tagline, locale)}
              </p>
            )}
            <button
              type="button"
              onClick={onBook}
              className="w-full rounded-sm py-4 text-base font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "var(--brand-background)",
              }}
            >
              {t(barberLabels.bookAppointment, locale)}
            </button>
          </div>
        </div>
        {locationLine && (
          <div
            className="flex items-center gap-2 border-b px-4 py-3"
            style={{
              borderColor: "var(--brand-border)",
              backgroundColor: "var(--brand-surface)",
            }}
          >
            <MapPin
              className="h-4 w-4 flex-shrink-0"
              style={{ color: "var(--brand-primary)" }}
            />
            <span className="text-xs" style={{ color: "var(--brand-muted)" }}>
              {locationLine}
            </span>
          </div>
        )}
      </section>

      {/* Mobile Services */}
      <section
        className="py-12"
        style={{ backgroundColor: "var(--brand-surface)" }}
      >
        <div className="px-4">
          <h2
            className="mb-6 text-center text-2xl font-bold"
            style={{ fontFamily: "serif", color: "var(--brand-text)" }}
          >
            {t(barberLabels.servicesTitle, locale)}
          </h2>
          <div className="space-y-3">
            {displayServices.map((service) => (
              <div
                key={service.id}
                className="rounded-sm border p-4"
                style={{
                  borderColor: "var(--brand-border)",
                  backgroundColor: "var(--brand-background)",
                }}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div className="flex-grow">
                    <span
                      className="mb-1 block text-xs uppercase tracking-wider"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {getCategoryLabel(service, categories, locale)}
                    </span>
                    <h3
                      className="text-base font-semibold"
                      style={{ color: "var(--brand-text)" }}
                    >
                      {t(service.name, locale)}
                    </h3>
                  </div>
                  <div className="ml-4 text-right">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "var(--brand-text)" }}
                    >
                      {formatServicePrice(service, business.currency, locale)}
                    </div>
                    {service.durationMinutes && (
                      <div className="text-xs" style={{ color: "var(--brand-muted)" }}>
                        {service.durationMinutes}{" "}
                        {t(barberLabels.minutes, locale)}
                      </div>
                    )}
                  </div>
                </div>
                {service.description && (
                  <p className="mb-3 text-sm" style={{ color: "var(--brand-muted)" }}>
                    {t(service.description, locale)}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onBookService(service.id)}
                  className="w-full rounded-sm py-3 text-sm font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)]"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-background)",
                  }}
                >
                  {t(barberLabels.bookService, locale)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Employees Carousel */}
      <section className="py-12">
        <div className="px-4">
          <h2
            className="mb-6 text-center text-2xl font-bold"
            style={{ fontFamily: "serif", color: "var(--brand-text)" }}
          >
            {t(barberLabels.barbersTitle, locale)}
          </h2>
          <div className="relative">
            <div
              ref={carouselRef}
              className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className="w-full flex-shrink-0 snap-start px-2"
                >
                  <div
                    className="overflow-hidden rounded-sm border"
                    style={{
                      borderColor: "var(--brand-border)",
                      backgroundColor: "var(--brand-surface)",
                    }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {employee.image ? (
                        <Image
                          src={employee.image}
                          alt={employee.name}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="flex h-full items-center justify-center"
                          style={{ backgroundColor: "var(--brand-background)" }}
                        >
                          <span
                            className="text-3xl font-bold"
                            style={{ color: "var(--brand-primary)" }}
                          >
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3
                        className="mb-1 text-base font-semibold"
                        style={{ color: "var(--brand-text)" }}
                      >
                        {employee.name}
                      </h3>
                      {employee.role && (
                        <p
                          className="mb-2 text-xs"
                          style={{ color: "var(--brand-primary)" }}
                        >
                          {t(employee.role, locale)}
                        </p>
                      )}
                      {employee.bio && (
                        <p className="mb-3 text-xs" style={{ color: "var(--brand-muted)" }}>
                          {t(employee.bio, locale)}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => onBookEmployee(employee.id)}
                        className="w-full rounded-sm border-2 py-3 text-sm font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-surface)]"
                        style={{
                          borderColor: "var(--brand-primary)",
                          color: "var(--brand-primary)",
                        }}
                      >
                        {t(barberLabels.bookBarber, locale)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {displayEmployees.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollToCarousel("left")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                  style={{
                    backgroundColor: "var(--brand-surface)",
                    color: "var(--brand-text)",
                  }}
                  disabled={carouselIndex === 0}
                  aria-label={t(barberLabels.previousBarber, locale)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToCarousel("right")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
                  style={{
                    backgroundColor: "var(--brand-surface)",
                    color: "var(--brand-text)",
                  }}
                  disabled={carouselIndex === displayEmployees.length - 1}
                  aria-label={t(barberLabels.nextBarber, locale)}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile Gallery */}
      <section
        className="py-12"
        style={{ backgroundColor: "var(--brand-surface)" }}
      >
        <div className="px-4">
          <h2
            className="mb-6 text-center text-2xl font-bold"
            style={{ fontFamily: "serif", color: "var(--brand-text)" }}
          >
            {t(barberLabels.galleryTitle, locale)}
          </h2>
          {displayGallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {displayGallery.map((item, index) => (
                <div
                  key={item.id}
                  className={`relative overflow-hidden rounded-sm ${
                    index === 0 ? "col-span-2 h-48" : "h-32"
                  }`}
                >
                  <Image
                    src={item.url}
                    alt={
                      t(item.alt, locale) ||
                      `${business.name} galerija`
                    }
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex h-48 items-center justify-center rounded-sm border-2 border-dashed"
              style={{
                borderColor: "var(--brand-border)",
                color: "var(--brand-muted)",
              }}
            >
              <p className="text-sm">
                {t(barberLabels.galleryEmpty, locale)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Mobile Contact */}
      <section
        className="py-12"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        <div className="px-4 text-center">
          <h2
            className="mb-6 text-2xl font-bold lg:text-3xl"
            style={{ fontFamily: "serif", color: "var(--brand-background)" }}
          >
            {t(barberLabels.contactTitle, locale)}
          </h2>
          <div className="mb-6 space-y-3">
            {locationLine && (
              <div className="flex items-center justify-center gap-2">
                <MapPin
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: "var(--brand-background)" }}
                />
                <span className="text-sm" style={{ color: "var(--brand-background)" }}>
                  {locationLine}
                </span>
              </div>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center justify-center gap-2 hover:opacity-80"
              >
                <Phone
                  className="h-4 w-4"
                  style={{ color: "var(--brand-background)" }}
                />
                <span className="text-sm" style={{ color: "var(--brand-background)" }}>
                  {business.phone}
                </span>
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center justify-center gap-2 hover:opacity-80"
              >
                <Mail
                  className="h-4 w-4"
                  style={{ color: "var(--brand-background)" }}
                />
                <span className="text-sm" style={{ color: "var(--brand-background)" }}>
                  {business.email}
                </span>
              </a>
            )}
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 hover:opacity-80"
              >
                <InstagramIcon
                  className="h-4 w-4"
                  style={{ color: "var(--brand-background)" }}
                />
                <span className="text-sm" style={{ color: "var(--brand-background)" }}>
                  {business.instagramHandle || "Instagram"}
                </span>
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={onBook}
            className="w-full rounded-sm py-4 text-base font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-background)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]"
            style={{
              backgroundColor: "var(--brand-background)",
              color: "var(--brand-primary)",
            }}
          >
            {t(barberLabels.bookAppointment, locale)}
          </button>
          <button
            type="button"
            onClick={onSwitchToDesktop}
            className="mt-4 text-xs underline hover:opacity-80"
            style={{ color: "var(--brand-background)" }}
          >
            {t(barberLabels.openDesktop, locale)}
          </button>
        </div>
      </section>

      {/* Mobile Footer */}
      <footer
        className="border-t py-6"
        style={{
          borderColor: "var(--brand-border)",
          backgroundColor: "var(--brand-background)",
        }}
      >
        <div className="px-4 text-center">
          <p className="mb-1 text-sm font-semibold" style={{ color: "var(--brand-text)" }}>
            {business.name}
          </p>
          <p className="mb-2 text-xs" style={{ color: "var(--brand-muted)" }}>
            © {new Date().getFullYear()} {business.name}.{" "}
            {t(barberLabels.allRightsReserved, locale)}
          </p>
          <p className="text-xs" style={{ color: "var(--brand-muted)" }}>
            {t(barberLabels.footerTheme, locale)}
          </p>
        </div>
      </footer>

      {/* Sticky Mobile Booking Button */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 border-t p-4"
        style={{
          backgroundColor: "var(--brand-background)",
          borderColor: "var(--brand-border)",
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={onBook}
          className="w-full rounded-sm py-4 text-base font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)]"
          style={{
            backgroundColor: "var(--brand-primary)",
            color: "var(--brand-background)",
          }}
        >
          {t(barberLabels.bookAppointment, locale)}
        </button>
      </div>
    </div>
  );
}
