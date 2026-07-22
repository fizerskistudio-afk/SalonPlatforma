import type { Metadata } from "next";

import { OrdumLandingPage } from "@/components/marketing/ordum/OrdumLandingPage";
import { buildTenantPublicUrl } from "@/lib/tenancy/hostname";

const HOME_TITLE = "Ordum Studios | Digitalna platforma za beauty biznise";
const HOME_DESCRIPTION =
  "Profesionalni sajt, online zakazivanje i operativni alati za beauty i wellness studije — u jednoj povezanoj platformi.";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <OrdumLandingPage
      demos={{
        barber: buildTenantPublicUrl("heritage-barber-demo"),
        lumiere: buildTenantPublicUrl("lumiere-studio"),
      }}
    />
  );
}
