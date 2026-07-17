"use client";

import React from "react";
import Link from "next/link";
import { Store, User, ChevronRight, Info, LogIn } from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 justify-between">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 py-4 px-6 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="w-8 h-8 flex-shrink-0"
              viewBox="0 0 32 32"
              fill="none"
            >
              <defs>
                <linearGradient
                  id="landing-logo-grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <rect
                width="32"
                height="32"
                rx="8"
                fill="url(#landing-logo-grad)"
              />
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
              <span className="font-bold text-lg text-slate-800 tracking-tight block">
                PeraPin
              </span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-mono tracking-widest">
                SOROBAN PAY
              </span>
            </div>
          </div>

          <Link
            href="/login"
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Hero Body */}
      <main className="flex-1 max-w-md w-full mx-auto py-8 px-6 flex flex-col justify-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-grow flex flex-col justify-between space-y-8"
        >
          {/* Brand block */}
          <div className="text-center space-y-4 pt-4">
            <div className="inline-flex items-center justify-center bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium mb-4">
              ⛓️ Deployed on Stellar Testnet
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              PeraPin
            </h1>
            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
              Pay and get paid, even offline. No phone, internet data, or
              battery needed for students and consumers.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="space-y-4">
            <Link
              href="/register/merchant"
              className="w-full flex items-center justify-between p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all duration-200 group shadow-sm border border-blue-500"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="bg-white/20 text-white p-3 rounded-xl">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    I'm a merchant
                  </h3>
                  <p className="text-xs text-blue-100 leading-tight">
                    Scan stickers & accept payments with your mobile browser
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-blue-200 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
            </Link>

            <Link
              href="/register/consumer"
              className="w-full flex items-center justify-between p-5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl transition-all duration-200 group shadow-xs"
            >
              <div className="flex items-center gap-4 text-left">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    I'm a customer
                  </h3>
                  <p className="text-xs text-slate-500 leading-tight">
                    Register and generate a static payment sticker for checkout
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* How it works info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Info className="w-4 h-4 text-blue-600" />
              <span>How does PeraPin work?</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-xs font-bold mx-auto border border-slate-200 font-mono">
                  1
                </div>
                <p className="text-[10px] font-bold text-slate-850">Get Pass</p>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Generate and print your QR sticker pass.
                </p>
              </div>
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-xs font-bold mx-auto border border-slate-200 font-mono">
                  2
                </div>
                <p className="text-[10px] font-bold text-slate-850">Scan QR</p>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Merchant scans your sticker on their browser.
                </p>
              </div>
              <div className="space-y-1">
                <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-xs font-bold mx-auto border border-slate-200 font-mono">
                  3
                </div>
                <p className="text-[10px] font-bold text-slate-850">
                  Enter PIN
                </p>
                <p className="text-[9px] text-slate-400 leading-normal">
                  Type PIN on merchant phone to settle on-chain.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center border-t border-slate-200 bg-white">
        <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
          Built by Lance Kent Geoffrey B. Magollado <br />
          Need help? Submit our{" "}
          <Link
            href="/feedback"
            className="text-blue-600 hover:underline font-semibold"
          >
            Feedback Form
          </Link>
          .
        </p>
      </footer>
    </div>
  );
}
