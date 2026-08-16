"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footer } from "@/components/shared/Footer";
import {
  QrCode,
  Smartphone,
  Shield,
  Zap,
  Globe,
  Code,
  Database,
  ArrowLeft,
  Users,
  ShoppingBag,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function AboutPage() {
  const steps = [
    {
      icon: QrCode,
      title: "Merchant Scans",
      description: "Merchant scans the consumer's static QR code sticker using their phone camera.",
    },
    {
      icon: Smartphone,
      title: "Enters Amount",
      description: "Merchant inputs the payment amount in XLM on their device.",
    },
    {
      icon: Shield,
      title: "Consumer PINs",
      description:
        "Consumer enters their 4-digit PIN on the merchant's phone (hashed client-side).",
    },
    {
      icon: Zap,
      title: "On-Chain Settlement",
      description:
        "Smart contract verifies PIN hash and transfers XLM on Stellar Testnet instantly.",
    },
  ];

  const techStack = [
    { name: "Stellar", description: "Blockchain network for fast, low-cost payments" },
    { name: "Soroban", description: "Smart contract platform (Rust SDK v27)" },
    { name: "Next.js 16", description: "React framework with App Router" },
    { name: "Supabase", description: "Auth, database, and real-time backend" },
    { name: "Tailwind CSS", description: "Utility-first styling framework" },
    { name: "TypeScript", description: "Type-safe frontend and API code" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-5 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
        </Link>

        {/* Hero Section */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-slate-900">About PeraPin</h1>
          <p className="mt-3 text-sm text-slate-500">
            Merchant-Pull Micropayments for Zero-Connectivity Consumers on Stellar/Soroban
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="secondary">Stellar Testnet</Badge>
            <Badge variant="secondary">Soroban Smart Contracts</Badge>
            <Badge variant="secondary">QR Sticker Payments</Badge>
          </div>
        </div>

        {/* The Problem */}
        <Card className="mt-10 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-red-50 p-3">
              <WifiOff className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">The Problem</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                In Philippine micro-economies — sari-sari stores, school canteens, public utility
                vehicles — digital payment systems assume consumers always have a working smartphone
                with active data and battery. But reality is different: phones die, data runs out,
                devices get left at home. This excludes millions from digital payments precisely
                where they need them most.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Wifi className="h-4 w-4 text-red-500" />
                  <span>No data connection</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Smartphone className="h-4 w-4 text-red-500" />
                  <span>Dead battery</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Users className="h-4 w-4 text-red-500" />
                  <span>Phone left at home</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* The Solution */}
        <Card className="mt-4 p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-green-50 p-3">
              <QrCode className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">The Solution</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                PeraPin flips the payment paradigm with a{" "}
                <strong className="text-slate-900">merchant-pull model</strong>. Consumers carry a
                simple, static QR code sticker — on their school ID, notebook, or wallet. The
                merchant&apos;s phone does all the active work: scanning, amount entry, and
                transaction submission. The consumer only needs to enter a 4-digit PIN on the
                merchant&apos;s device to authorize payment.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <ShoppingBag className="h-4 w-4 text-green-600" />
                  <span>Sari-sari stores</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Users className="h-4 w-4 text-green-600" />
                  <span>School canteens</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <Globe className="h-4 w-4 text-green-600" />
                  <span>PUV transport</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* How it Works */}
        <div className="mt-10">
          <h2 className="mb-6 text-center text-lg font-bold text-slate-900">How It Works</h2>
          <div className="grid gap-3">
            {steps.map((step, index) => (
              <Card key={step.title} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-50 text-brand-700 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex flex-1 items-center gap-3">
                    <step.icon className="text-brand-600 h-5 w-5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">{step.title}</h3>
                      <p className="text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-10">
          <h2 className="mb-6 text-center text-lg font-bold text-slate-900">Technology Stack</h2>
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {techStack.map((tech) => (
                <div key={tech.name} className="flex items-start gap-3">
                  <div className="rounded bg-purple-50 p-1.5">
                    <Code className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{tech.name}</p>
                    <p className="text-xs text-slate-500">{tech.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-2 border-t border-slate-200 pt-4 text-sm text-slate-500">
              <Database className="h-4 w-4" />
              <span>
                Custodial wallets with AES-256-GCM encryption • On-chain PIN verification via
                Soroban
              </span>
            </div>
          </Card>
        </div>

        {/* Built By */}
        <div className="mt-10 text-center">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Built By</h2>
          <Card className="inline-block w-full p-6">
            <p className="text-base font-semibold text-slate-900">
              Lance Kent Geoffrey B. Magollado
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Built with Stellar, Soroban, and the Filipino micro-economy in mind. 🇵🇭
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <Badge variant="outline">Stellar Developer</Badge>
              <Badge variant="outline">Philippines</Badge>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
