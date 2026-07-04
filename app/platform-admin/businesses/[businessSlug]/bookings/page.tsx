import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarCheck2,
} from "lucide-react";

import BusinessBookingsManager from "@/components/platform-admin/BusinessBookingsManager";
import { loadBusinessBookingManagementData } from "@/lib/platform-admin/business-bookings-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type BusinessBookingsPageProps = {
  params: Promise<{
    businessSlug: string;
  }>;
};

export default async function BusinessBookingsPage({
  params,
}: BusinessBookingsPageProps) {
  const { businessSlug: rawBusinessSlug } = await params;
  const data = await loadBusinessBookingManagementData(
    rawBusinessSlug
  );

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href={`/platform-admin/businesses/${data.business.slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
      >
        <ArrowLeft size={17} />
        Nazad na kontrolni centar
      </Link>

      <div className="mt-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <CalendarCheck2 size={18} />
          Upravljanje rezervacijama
        </div>

        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Rezervacije
        </h2>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 md:text-base">
          {data.business.name} · pregled, filteri, statusi,
          interne napomene i pomeranje termina uz Google Calendar
          sinhronizaciju.
        </p>
      </div>

      <BusinessBookingsManager
        businessSlug={data.business.slug}
        businessName={data.business.name}
        timezone={data.business.timezone}
        generatedAt={data.generatedAt}
        employees={data.employees}
        bookings={data.bookings}
      />
    </div>
  );
}
