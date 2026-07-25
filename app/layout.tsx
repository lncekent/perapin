import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PeraPin — Zero-Connectivity Digital Payments",
  description:
    "Offline-first payments system for the Philippines designed for zero-connectivity consumers and zero-hardware micro-merchants, built on Stellar/Soroban.",
  manifest: "/manifest.json",
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
    <html lang="en" className={cn("antialiased", jetbrainsMono.variable, "font-sans", geist.variable)}>
      <body suppressHydrationWarning className="min-h-screen bg-slate-50 font-sans text-slate-900">
        {children}
        <Toaster />
        {process.env.NODE_ENV !== "production" && <InspectorConsole />}
        <Analytics />
      </body>
    </html>
  );
}
