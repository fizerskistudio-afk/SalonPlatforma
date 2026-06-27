import type { BookingConfig } from "../types";

/**
 * Booking konfiguracija - definiše pravila za booking sistem.
 * Ove vrednosti kontrolisu kako booking flow funkcioniše.
 */
export const bookingConfig: BookingConfig = {
  slotIntervalMinutes: 30, // Interval između termina (30 min)
  bookingWindowDays: 14, // Koliko dana unapred može da se rezerviše
  minimumAdvanceMinutes: 60, // Minimalno vremena pre termina (1 sat)
  allowAnyEmployee: true, // Da li korisnik može izabrati "Any stylist"
  requireEmail: false, // Da li je email obavezan
  requirePhone: true, // Da li je telefon obavezan
  allowNotes: true, // Da li korisnik može dodati napomenu
};