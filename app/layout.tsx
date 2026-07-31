import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://perapin.vercel.app";

const siteName = "PeraPin";
const siteTitle = "PeraPin — Zero-Connectivity Digital Payments";
const siteDescription =
  "Pay with a static QR sticker — even when your phone is dead, offline, or left at home. Merchant-pull micropayments for the Philippines, built on Stellar/Soroban.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s — PeraPin",
  },
  description: siteDescription,
  applicationName: siteName,
  manifest: "/manifest.json",
  keywords: [
    "PeraPin",
    "Stellar",
    "Soroban",
    "micropayments",
    "QR payments",
    "offline payments",
    "blockchain",
    "Philippines",
    "sari-sari store",
    "digital wallet",
    "XLM",
  ],
  authors: [{ name: "PeraPin" }],
  creator: siteName,
  publisher: siteName,
  category: "finance",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: siteUrl,
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PeraPin",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import InspectorConsole from "@/components/shared/InspectorConsole";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("antialiased", jetbrainsMono.variable, "font-sans", geist.variable)}
    >
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {children}
        <Toaster />
        {process.env.NODE_ENV !== "production" && <InspectorConsole />}
        <Analytics />
      </body>
    </html>
  );
}
