import type {
  Metadata,
  Viewport,
} from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import {
  getSiteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_SHORT_NAME,
} from "@/lib/seo/site";

import "./globals.css";

const geistSans = Geist({
  variable:
    "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable:
    "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  getSiteUrl();

export const metadata: Metadata = {
  metadataBase:
    siteUrl,

  title: {
    default:
      `${SITE_NAME} | Online zakazivanje`,

    template:
      `%s | ${SITE_NAME}`,
  },

  description:
    SITE_DESCRIPTION,

  applicationName:
    SITE_NAME,

  keywords: [
    "frizerski salon",
    "beauty salon",
    "online zakazivanje",
    "termin",
    "hair salon",
    "Lumière Studio",
  ],

  creator:
    SITE_NAME,

  publisher:
    SITE_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: "/",
    siteName:
      SITE_NAME,

    title:
      `${SITE_NAME} | Online zakazivanje`,

    description:
      SITE_DESCRIPTION,

    images: [
      {
        url:
          "/opengraph-image.png",

        width: 1200,
        height: 630,

        alt:
          `${SITE_NAME} — online zakazivanje`,
      },
    ],
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      `${SITE_NAME} | Online zakazivanje`,

    description:
      SITE_DESCRIPTION,

    images: [
      "/twitter-image.png",
    ],
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,

      "max-image-preview":
        "large",

      "max-snippet":
        -1,

      "max-video-preview":
        -1,
    },
  },

  manifest:
    "/manifest.webmanifest",

  appleWebApp: {
    capable: true,

    title:
      SITE_SHORT_NAME,

    statusBarStyle:
      "black-translucent",
  },

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  category:
    "beauty",
};

export const viewport: Viewport = {
  width:
    "device-width",

  initialScale: 1,
  maximumScale: 5,

  viewportFit:
    "cover",

  themeColor:
    "#09090a",

  colorScheme:
    "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="sr-Latn"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  );
}
