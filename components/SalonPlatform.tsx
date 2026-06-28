"use client";

import { useState } from "react";

import type { Locale } from "@/lib/types";
import { businessConfig } from "@/lib/config";

import DesktopBookingModal from "./desktop/DesktopBookingModal";
import DesktopLanding from "./desktop/DesktopLanding";

export default function SalonPlatform() {
  const [locale, setLocale] = useState<Locale>(
    businessConfig.defaultLocale
  );

  const [isBookingOpen, setIsBookingOpen] =
    useState(false);

  const [
    initialServiceId,
    setInitialServiceId,
  ] = useState<string | null>(null);

  const [
    initialEmployeeId,
    setInitialEmployeeId,
  ] = useState<string | null>(null);

  const openBooking = () => {
    setInitialServiceId(null);
    setInitialEmployeeId(null);
    setIsBookingOpen(true);
  };

  const openBookingWithService = (
    serviceId: string
  ) => {
    setInitialServiceId(serviceId);
    setInitialEmployeeId(null);
    setIsBookingOpen(true);
  };

  const openBookingWithEmployee = (
    employeeId: string
  ) => {
    setInitialServiceId(null);
    setInitialEmployeeId(employeeId);
    setIsBookingOpen(true);
  };

  const closeBooking = () => {
    setIsBookingOpen(false);
  };

  return (
    <>
      <DesktopLanding
        locale={locale}
        onLocaleChange={setLocale}
        onBook={openBooking}
        onBookService={
          openBookingWithService
        }
        onBookEmployee={
          openBookingWithEmployee
        }
      />

      <DesktopBookingModal
        isOpen={isBookingOpen}
        locale={locale}
        initialServiceId={
          initialServiceId
        }
        initialEmployeeId={
          initialEmployeeId
        }
        onClose={closeBooking}
      />
    </>
  );
}