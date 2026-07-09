"use client";

import Image from "next/image";
import {
  Scissors,
  MapPin,
  Phone,
  Mail,
  CalendarCheck,
  Award,
} from "lucide-react";
import { useCatalogData } from "@/lib/catalogContext";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import InstagramIcon from "@/components/shared/icons/InstagramIcon";
import type { PublicTemplateProps } from "../template-props";
import {
  translate,
  barberLabels,
  formatServicePrice,
  getCategoryLabel,
  getLocationLine,
} from "./barber-utils";

export default function BarberHeritageDesktopTemplate({
  locale,
  onLocaleChange,
  onBook,
  onBookService,
  onBookEmployee,
}: PublicTemplateProps) {
  const { business, categories, services, employees, gallery } =
    useCatalogData();

  const displayServices = services.slice(0, 8);
  const displayEmployees = employees.slice(0, 4);
  const displayGallery = gallery.slice(0, 6);

  const locationLine = getLocationLine(
    business.address,
    business.city,
    business.country,
    locale
  );

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: "var(--brand-background)",
        color: "var(--brand-text)",
      }}
    >
      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: "var(--brand-background)",
          borderColor: "var(--brand-border)",
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={`${business.name} logo`}
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Scissors
                className="h-6 w-6"
                style={{ color: "var(--brand-primary)" }}
              />
            )}
            <span
              className="text-lg font-semibold tracking-wide"
              style={{ fontFamily: "serif" }}
            >
              {business.name}
            </span>
          </div>

          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#services"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--brand-text)" }}
            >
              {translate(barberLabels.navServices, locale)}
            </a>
            <a
              href="#barbers"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--brand-text)" }}
            >
              {translate(barberLabels.navBarbers, locale)}
            </a>
            <a
              href="#gallery"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--brand-text)" }}
            >
              {translate(barberLabels.navGallery, locale)}
            </a>
            <a
              href="#contact"
              className="text-sm transition-colors hover:opacity-80"
              style={{ color: "var(--brand-text)" }}
            >
              {translate(barberLabels.navContact, locale)}
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <LanguageSwitcher
              currentLocale={locale}
              onLocaleChange={onLocaleChange}
            />
            <button
              type="button"
              onClick={onBook}
              className="rounded-sm px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)]"
              style={{
                backgroundColor: "var(--brand-primary)",
                color: "var(--brand-background)",
              }}
            >
              {translate(barberLabels.bookAppointment, locale)}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-20 lg:grid-cols-2 lg:py-32">
          <div className="flex flex-col justify-center">
            <p
              className="mb-4 text-sm uppercase tracking-widest"
              style={{ color: "var(--brand-primary)" }}
            >
              {translate(barberLabels.heroEyebrow, locale)}
            </p>
            <h1
              className="mb-6 text-6xl font-bold leading-tight lg:text-7xl"
              style={{ fontFamily: "serif", color: "var(--brand-text)" }}
            >
              {translate(barberLabels.heroHeadline1, locale)}
              <br />
              {translate(barberLabels.heroHeadline2, locale)}
            </h1>
            {business.description && (
              <p
                className="mb-8 max-w-lg text-lg"
                style={{ color: "var(--brand-muted)" }}
              >
                {translate(business.description, locale)}
              </p>
            )}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onBook}
                className="rounded-sm px-8 py-4 text-base font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)]"
                style={{
                  backgroundColor: "var(--brand-primary)",
                  color: "var(--brand-background)",
                }}
              >
                {translate(barberLabels.bookAppointment, locale)}
              </button>
              <a
                href="#services"
                className="rounded-sm border-2 px-8 py-4 text-base font-medium transition-all hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)]"
                style={{
                  borderColor: "var(--brand-border)",
                  color: "var(--brand-text)",
                }}
              >
                {translate(barberLabels.viewServices, locale)}
              </a>
            </div>
            <div className="mt-12 flex gap-8">
              <div className="flex items-center gap-2">
                <CalendarCheck
                  className="h-5 w-5"
                  style={{ color: "var(--brand-primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--brand-muted)" }}>
                  {translate(barberLabels.heroTrust1, locale)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award
                  className="h-5 w-5"
                  style={{ color: "var(--brand-primary)" }}
                />
                <span className="text-sm" style={{ color: "var(--brand-muted)" }}>
                  {translate(barberLabels.heroTrust2, locale)}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            {business.heroImageUrl ? (
              <div className="relative h-[600px] overflow-hidden rounded-sm">
                <Image
                  src={business.heroImageUrl}
                  alt={business.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
              </div>
            ) : (
              <div
                className="flex h-[600px] items-center justify-center rounded-sm"
                style={{
                  background:
                    "linear-gradient(135deg, var(--brand-surface) 0%, var(--brand-background) 100%)",
                }}
              >
                <Scissors
                  className="h-24 w-24 opacity-20"
                  style={{ color: "var(--brand-primary)" }}
                />
              </div>
            )}
            {locationLine && (
              <div
                className="absolute bottom-6 left-6 rounded-sm p-4 shadow-lg"
                style={{ backgroundColor: "var(--brand-surface)" }}
              >
                <div className="flex items-center gap-2">
                  <MapPin
                    className="h-5 w-5"
                    style={{ color: "var(--brand-primary)" }}
                  />
                  <span className="text-sm">{locationLine}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-20"
        style={{ backgroundColor: "var(--brand-surface)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{ fontFamily: "serif", color: "var(--brand-text)" }}
          >
            {translate(barberLabels.servicesTitle, locale)}
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {displayServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col rounded-sm border p-6 transition-all hover:shadow-lg"
                style={{
                  borderColor: "var(--brand-border)",
                  backgroundColor: "var(--brand-background)",
                }}
              >
                <span
                  className="mb-2 text-xs uppercase tracking-wider"
                  style={{ color: "var(--brand-primary)" }}
                >
                  {getCategoryLabel(service, categories, locale)}
                </span>
                <h3
                  className="mb-2 text-xl font-semibold"
                  style={{ color: "var(--brand-text)" }}
                >
                  {translate(service.name, locale)}
                </h3>
                {service.description && (
                  <p
                    className="mb-4 flex-grow text-sm"
                    style={{ color: "var(--brand-muted)" }}
                  >
                    {translate(service.description, locale)}
                  </p>
                )}
                <div className="mb-4 flex items-baseline gap-2">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "var(--brand-text)" }}
                  >
                    {formatServicePrice(service, business.currency, locale)}
                  </span>
                  {service.durationMinutes && (
                    <span className="text-sm" style={{ color: "var(--brand-muted)" }}>
                      {service.durationMinutes}{" "}
                      {translate(barberLabels.minutes, locale)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onBookService(service.id)}
                  className="w-full rounded-sm py-3 text-sm font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-background)]"
                  style={{
                    backgroundColor: "var(--brand-primary)",
                    color: "var(--brand-background)",
                  }}
                >
                  {translate(barberLabels.bookService, locale)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Barbers Section */}
      <section id="barbers" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{ fontFamily: "serif", color: "var(--brand-text)" }}
          >
            {translate(barberLabels.barbersTitle, locale)}
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {displayEmployees.map((employee) => (
              <div
                key={employee.id}
                className="group flex flex-col overflow-hidden rounded-sm border transition-all hover:shadow-lg"
                style={{
                  borderColor: "var(--brand-border)",
                  backgroundColor: "var(--brand-surface)",
                }}
              >
                <div className="relative h-64 overflow-hidden">
                  {employee.image ? (
                    <Image
                      src={employee.image}
                      alt={employee.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center"
                      style={{ backgroundColor: "var(--brand-background)" }}
                    >
                      <span
                        className="text-4xl font-bold"
                        style={{ color: "var(--brand-primary)" }}
                      >
                        {employee.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-grow flex-col p-6">
                  <h3
                    className="mb-1 text-lg font-semibold"
                    style={{ color: "var(--brand-text)" }}
                  >
                    {employee.name}
                  </h3>
                  {employee.role && (
                    <p
                      className="mb-3 text-sm"
                      style={{ color: "var(--brand-primary)" }}
                    >
                      {translate(employee.role, locale)}
                    </p>
                  )}
                  {employee.bio && (
                    <p
                      className="mb-4 flex-grow text-sm"
                      style={{ color: "var(--brand-muted)" }}
                    >
                      {translate(employee.bio, locale)}
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
                    {translate(barberLabels.bookBarber, locale)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section
        id="gallery"
        className="py-20"
        style={{ backgroundColor: "var(--brand-surface)" }}
      >
        <div className="mx-auto max-w-7xl px-6">
          <h2
            className="mb-12 text-center text-4xl font-bold"
            style={{ fontFamily: "serif", color: "var(--brand-text)" }}
          >
            {translate(barberLabels.galleryTitle, locale)}
          </h2>
          {displayGallery.length > 0 ? (
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
              {displayGallery.map((item, index) => (
                <div key={item.id} className="mb-4 break-inside-avoid">
                  <div
                    className="relative overflow-hidden rounded-sm"
                    style={{ height: `${200 + (index % 3) * 100}px` }}
                  >
                    <Image
                      src={item.url}
                      alt={
                        translate(item.alt, locale) ||
                        `${business.name} galerija`
                      }
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="flex h-64 items-center justify-center rounded-sm border-2 border-dashed"
              style={{
                borderColor: "var(--brand-border)",
                color: "var(--brand-muted)",
              }}
            >
              <p className="text-lg">
                {translate(barberLabels.galleryEmpty, locale)}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section
        id="contact"
        className="py-20"
        style={{ backgroundColor: "var(--brand-primary)" }}
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2
            className="mb-8 text-4xl font-bold lg:text-5xl"
            style={{ fontFamily: "serif", color: "var(--brand-background)" }}
          >
            {translate(barberLabels.contactTitle, locale)}
          </h2>
          <div className="mb-8 flex flex-col items-center justify-center gap-4 md:flex-row">
            {locationLine && (
              <div className="flex items-center gap-2">
                <MapPin
                  className="h-5 w-5"
                  style={{ color: "var(--brand-background)" }}
                />
                <span style={{ color: "var(--brand-background)" }}>
                  {locationLine}
                </span>
              </div>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Phone
                  className="h-5 w-5"
                  style={{ color: "var(--brand-background)" }}
                />
                <span style={{ color: "var(--brand-background)" }}>
                  {business.phone}
                </span>
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Mail
                  className="h-5 w-5"
                  style={{ color: "var(--brand-background)" }}
                />
                <span style={{ color: "var(--brand-background)" }}>
                  {business.email}
                </span>
              </a>
            )}
            {business.instagramUrl && (
              <a
                href={business.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:opacity-80"
              >
                <InstagramIcon
                  className="h-5 w-5"
                  style={{ color: "var(--brand-background)" }}
                />
                <span style={{ color: "var(--brand-background)" }}>
                  {business.instagramHandle || "Instagram"}
                </span>
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={onBook}
            className="rounded-sm px-10 py-4 text-lg font-medium transition-all hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-background)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--brand-primary)]"
            style={{
              backgroundColor: "var(--brand-background)",
              color: "var(--brand-primary)",
            }}
          >
            {translate(barberLabels.bookAppointment, locale)}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{
          borderColor: "var(--brand-border)",
          backgroundColor: "var(--brand-background)",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="text-center md:text-left">
            <p className="font-semibold" style={{ color: "var(--brand-text)" }}>
              {business.name}
            </p>
            <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
              © {new Date().getFullYear()} {business.name}.{" "}
              {translate(barberLabels.allRightsReserved, locale)}
            </p>
          </div>
          <p className="text-sm" style={{ color: "var(--brand-muted)" }}>
            {translate(barberLabels.footerTheme, locale)}
          </p>
        </div>
      </footer>
    </div>
  );
}
