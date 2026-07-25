"use client";

import React from "react";
import Link from "next/link";
import { Store, User, ChevronRight, ShieldCheck, WifiOff, Zap } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const steps = [
  { n: "1", title: "Get your pass", copy: "Generate and print your QR sticker." },
  { n: "2", title: "Merchant scans", copy: "They scan your sticker in-browser." },
  { n: "3", title: "Enter PIN", copy: "Type your PIN to settle on-chain." },
];

export default function LandingPage() {
  return (
    <div className="bg-brand-wash flex min-h-screen flex-col justify-between font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg className="h-9 w-9 flex-shrink-0" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="landing-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b6af5" />
                  <stop offset="100%" stopColor="#1e40af" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="9" fill="url(#landing-logo-grad)" />
              <rect
                x="0.5"
                y="0.5"
                width="31"
                height="31"
                rx="8.5"
                stroke="white"
                strokeOpacity="0.2"
              />
              <text
                x="50%"
                y="50%"
                dominantBaseline="central"
                textAnchor="middle"
                fill="white"
                fontSize="18"
                fontWeight="bold"
              >
                ₱
              </text>
            </svg>
            <div>
              <span className="block text-lg font-bold tracking-tight text-slate-900">PeraPin</span>
              <span className="-mt-0.5 block font-mono text-[10px] tracking-[0.2em] text-slate-400">
                SOROBAN PAY
              </span>
            </div>
          </div>

          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center space-y-8 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Brand block */}
          <div className="space-y-4 pt-2 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
              Live on Stellar Testnet
            </div>
            <h1 className="text-[2.5rem] leading-[1.05] font-extrabold tracking-tight text-slate-900">
              Pay and get paid,
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                even offline.
              </span>
            </h1>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">
              No phone, mobile data, or battery needed at checkout. A static QR sticker is all a
              consumer carries.
            </p>

            {/* Trust chips */}
            <div className="flex items-center justify-center gap-4 pt-1 text-[11px] font-medium text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <WifiOff className="h-3.5 w-3.5 text-brand-500" /> Offline-first
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-500" /> PIN-secured
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-brand-500" /> Instant
              </span>
            </div>
          </div>

          {/* Role CTAs */}
          <div className="space-y-3.5">
            <Link href="/register/merchant" className="group block">
              <Card variant="money" padding="none" interactive className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">I&apos;m a merchant</h3>
                      <p className="text-xs leading-tight text-brand-100">
                        Accept payments with just your phone browser
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-brand-200 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
              </Card>
            </Link>

            <Link href="/register/consumer" className="group block">
              <Card variant="surface" padding="none" interactive className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="rounded-2xl bg-brand-50 p-3 text-brand-600 ring-1 ring-brand-100">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">I&apos;m a customer</h3>
                      <p className="text-xs leading-tight text-slate-500">
                        Get a static QR sticker for checkout
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                </div>
              </Card>
            </Link>
          </div>

          {/* How it works */}
          <Card variant="surface" className="space-y-4">
            <div className="text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
              How PeraPin works
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {steps.map((s) => (
                <div key={s.n} className="space-y-1.5">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 font-mono text-xs font-bold text-brand-700 ring-1 ring-brand-100">
                    {s.n}
                  </div>
                  <p className="text-[11px] font-bold text-slate-800">{s.title}</p>
                  <p className="text-[9px] leading-normal text-slate-400">{s.copy}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 py-6 text-center">
        <p className="mx-auto max-w-xs text-[10px] leading-normal text-slate-400">
          Built by Lance Kent Geoffrey B. Magollado <br />
          Need help? Submit our{" "}
          <Link href="/feedback" className="font-semibold text-brand-600 hover:underline">
            Feedback Form
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
