"use client";

import React from "react";
import Link from "next/link";
import { Store, User, ChevronRight, Info, LogIn } from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-slate-50 font-sans text-slate-900">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-6 py-4 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="h-8 w-8 flex-shrink-0" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="landing-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#landing-logo-grad)" />
              <rect
                x="0.5"
                y="0.5"
                width="31"
                height="31"
                rx="7.5"
                stroke="white"
                strokeOpacity="0.15"
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
              <span className="block text-lg font-bold tracking-tight text-slate-800">PeraPin</span>
              <span className="-mt-1 block font-mono text-[10px] tracking-widest text-slate-500">
                SOROBAN PAY
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors hover:bg-slate-50"
          >
            <LogIn className="h-3.5 w-3.5 text-slate-500" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center space-y-8 px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-grow flex-col justify-between space-y-8"
        >
          {/* Brand block */}
          <div className="space-y-4 pt-4 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              ⛓️ Deployed on Stellar Testnet
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">PeraPin</h1>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-500">
              Pay and get paid, even offline. No phone, internet data, or battery needed for
              students and consumers.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-4">
            <Link
              href="/register/merchant"
              className="group flex w-full items-center justify-between rounded-2xl border border-blue-500 bg-blue-600 p-5 text-white shadow-sm transition-all duration-200 hover:bg-blue-700"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="rounded-xl bg-white/20 p-3 text-white">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">I&apos;m a merchant</h3>
                  <p className="text-xs leading-tight text-blue-100">
                    Scan stickers & accept payments with your mobile browser
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-blue-200 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
            </Link>

            <Link
              href="/register/consumer"
              className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-slate-700 shadow-xs transition-all duration-200 hover:bg-slate-50"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">I&apos;m a customer</h3>
                  <p className="text-xs leading-tight text-slate-500">
                    Register and generate a static payment sticker for checkout
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-600" />
            </Link>
          </div>

          {/* How it works info */}
          <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Info className="h-4 w-4 text-blue-600" />
              <span>How does PeraPin work?</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-600">
                  1
                </div>
                <p className="text-slate-850 text-[10px] font-bold">Get Pass</p>
                <p className="text-[9px] leading-normal text-slate-400">
                  Generate and print your QR sticker pass.
                </p>
              </div>
              <div className="space-y-1">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-600">
                  2
                </div>
                <p className="text-slate-850 text-[10px] font-bold">Scan QR</p>
                <p className="text-[9px] leading-normal text-slate-400">
                  Merchant scans your sticker on their browser.
                </p>
              </div>
              <div className="space-y-1">
                <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 font-mono text-xs font-bold text-slate-600">
                  3
                </div>
                <p className="text-slate-850 text-[10px] font-bold">Enter PIN</p>
                <p className="text-[9px] leading-normal text-slate-400">
                  Type PIN on merchant phone to settle on-chain.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center">
        <p className="mx-auto max-w-xs text-[10px] leading-normal text-slate-400">
          Built by Lance Kent Geoffrey B. Magollado <br />
          Need help? Submit our{" "}
          <Link href="/feedback" className="font-semibold text-blue-600 hover:underline">
            Feedback Form
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
