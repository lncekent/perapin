"use client";

import React from "react";
import Link from "next/link";
import {
  Store,
  User,
  ChevronRight,
  ShieldCheck,
  WifiOff,
  Zap,
  Shield,
  Clock,
  Smartphone,
  CreditCard,
  Globe,
  Star,
  CheckCircle2,
  QrCode,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: WifiOff,
    title: "Offline Payments",
    description:
      "Consumer needs zero connectivity. No phone, no data, no battery required at checkout.",
  },
  {
    icon: Shield,
    title: "PIN Security",
    description: "4-digit PIN hashed client-side with SHA-256. Raw PIN never leaves the browser.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Transactions settle on Stellar in ~5 seconds. No waiting, no pending states.",
  },
  {
    icon: QrCode,
    title: "QR Stickers",
    description: "Print once, use forever. A static QR sticker is all the consumer carries.",
  },
  {
    icon: CheckCircle2,
    title: "On-Chain Verification",
    description: "Every payment verified by Soroban smart contract. Tamper-proof and auditable.",
  },
  {
    icon: Smartphone,
    title: "Zero Hardware",
    description: "Merchants use any phone browser. No POS terminal, no card reader needed.",
  },
];

const merchantSteps = [
  {
    n: "1",
    title: "Scan QR sticker",
    description: "Point your phone camera at the consumer's QR sticker.",
  },
  {
    n: "2",
    title: "Enter amount",
    description: "Key in the payment amount in XLM (₱5–₱500 equivalent).",
  },
  {
    n: "3",
    title: "Hand phone over",
    description: "Consumer enters their 4-digit PIN on your device.",
  },
  {
    n: "4",
    title: "Done!",
    description: "Payment settles on-chain in ~5 seconds. Both get confirmation.",
  },
];

const consumerSteps = [
  { n: "1", title: "Register online", description: "Sign up with email OTP. No passwords needed." },
  {
    n: "2",
    title: "Get your QR",
    description: "Print or save your unique QR sticker. Stick it anywhere.",
  },
  {
    n: "3",
    title: "Top up wallet",
    description: "Fund your Stellar wallet with XLM via the dashboard.",
  },
  {
    n: "4",
    title: "Pay anywhere",
    description: "Merchant scans your sticker. Enter PIN. Payment complete.",
  },
];

const testimonials = [
  {
    name: "Student 1",
    role: "Consumer",
    rating: 5,
    comment: "Nice, smooth sending money. The potential is great!",
  },
  {
    name: "Student 2",
    role: "Consumer",
    rating: 5,
    comment:
      "The concept is really nice, the transactions were smooth with no delays. The core functions are met and working.",
  },
  {
    name: "Merchant 1",
    role: "Merchant",
    rating: 3,
    comment: "Must reload fast, but overall good.",
  },
  {
    name: "Student 3",
    role: "Consumer",
    rating: 5,
    comment: "Excellent!! Fast reload.",
  },
];

const stats = [
  { value: "~5s", label: "Settlement time" },
  { value: "₱5–₱500", label: "Micro-payments" },
  { value: "10+", label: "Real users tested" },
  { value: "0", label: "Hardware needed" },
];

export default function LandingPage() {
  return (
    <div className="bg-brand-wash min-h-screen font-sans text-slate-900">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
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

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
              How it Works
            </a>
            <a href="#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="#security" className="hover:text-brand-600 transition-colors">
              Security
            </a>
            <a href="#testimonials" className="hover:text-brand-600 transition-colors">
              Feedback
            </a>
          </nav>

          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden px-6 py-16 md:py-24">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-40" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative mx-auto max-w-md space-y-6 text-center md:max-w-2xl"
        >
          <div className="border-brand-100 bg-brand-50 text-brand-700 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
            <span className="relative flex h-1.5 w-1.5">
              <span className="bg-brand-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
              <span className="bg-brand-500 relative inline-flex h-1.5 w-1.5 rounded-full" />
            </span>
            Live on Stellar Testnet
          </div>

          <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight text-slate-900 md:text-5xl">
            Micropayments that work
            <br />
            <span className="from-brand-600 to-brand-800 bg-gradient-to-r bg-clip-text text-transparent">
              even when your phone is dead.
            </span>
          </h1>

          <p className="mx-auto max-w-md text-base leading-relaxed text-slate-500 md:text-lg">
            PeraPin enables sari-sari stores, canteens, and PUVs to accept blockchain payments using
            a simple QR sticker. No smartphone needed at checkout.
          </p>

          {/* Trust chips */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="text-brand-500 h-3.5 w-3.5" /> Built on Stellar
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="text-brand-500 h-3.5 w-3.5" /> ~5s settlement
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="text-brand-500 h-3.5 w-3.5" /> On-chain security
            </span>
            <span className="inline-flex items-center gap-1.5">
              <WifiOff className="text-brand-500 h-3.5 w-3.5" /> Zero connectivity
            </span>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-center">
            <Link href="/register/merchant">
              <Button variant="money" size="lg">
                <Store className="h-5 w-5" />
                Start accepting payments
              </Button>
            </Link>
            <Link href="/register/consumer">
              <Button variant="secondary" size="lg">
                <User className="h-5 w-5" />
                Get my QR sticker
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mx-auto mt-12 max-w-md md:max-w-2xl"
        >
          <Card variant="raised" padding="md">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-brand-700 text-xl font-bold md:text-2xl">{stat.value}</div>
                  <div className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="border-t border-slate-200/70 bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-md md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <div className="text-brand-600 mb-3 text-xs font-semibold tracking-wide uppercase">
              Why PeraPin
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Everything you need for micro-payments
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
              Purpose-built for informal economies where traditional digital wallets fail.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <Card variant="ghost" padding="lg" className="h-full space-y-3">
                  <div className="bg-brand-50 text-brand-600 ring-brand-100 inline-flex rounded-2xl p-3 ring-1">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{feature.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-500">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="border-t border-slate-200/70 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-md md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <div className="text-brand-600 mb-3 text-xs font-semibold tracking-wide uppercase">
              How it works
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Simple for both sides
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
              The merchant&apos;s phone does all the active work. The consumer just enters a PIN.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Merchant flow */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
            >
              <Card variant="surface" padding="lg" className="h-full space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-2xl p-2.5 ring-1">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">For Merchants</h3>
                    <p className="text-[11px] text-slate-400">
                      Accept payments with your phone browser
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {merchantSteps.map((step) => (
                    <div key={step.n} className="flex items-start gap-3">
                      <div className="bg-brand-50 text-brand-700 ring-brand-100 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ring-1">
                        {step.n}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{step.title}</p>
                        <p className="text-[11px] leading-relaxed text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Consumer flow */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4 }}
            >
              <Card variant="surface" padding="lg" className="h-full space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-2xl p-2.5 ring-1">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">For Consumers</h3>
                    <p className="text-[11px] text-slate-400">
                      Pay anywhere with just a QR sticker
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {consumerSteps.map((step) => (
                    <div key={step.n} className="flex items-start gap-3">
                      <div className="bg-brand-50 text-brand-700 ring-brand-100 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ring-1">
                        {step.n}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{step.title}</p>
                        <p className="text-[11px] leading-relaxed text-slate-400">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== SECURITY & TRUST ===== */}
      <section id="security" className="border-t border-slate-200/70 bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-md md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <div className="text-brand-600 mb-3 text-xs font-semibold tracking-wide uppercase">
              Security & Trust
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              Built on proven infrastructure
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
              Every layer is designed to protect your money and privacy.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35 }}
            >
              <Card variant="raised" padding="lg" className="h-full space-y-3 text-center">
                <div className="bg-brand-50 text-brand-600 ring-brand-100 mx-auto inline-flex rounded-2xl p-3 ring-1">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Powered by Stellar</h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Stellar network processes 1000+ TPS with minimal fees. Battle-tested blockchain
                  infrastructure since 2014.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: 0.08 }}
            >
              <Card variant="raised" padding="lg" className="h-full space-y-3 text-center">
                <div className="bg-brand-50 text-brand-600 ring-brand-100 mx-auto inline-flex rounded-2xl p-3 ring-1">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Soroban Smart Contracts</h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  PIN verification, brute-force lockout, and payment logic all enforced on-chain. No
                  server can be compromised.
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.35, delay: 0.16 }}
            >
              <Card variant="raised" padding="lg" className="h-full space-y-3 text-center">
                <div className="bg-brand-50 text-brand-600 ring-brand-100 mx-auto inline-flex rounded-2xl p-3 ring-1">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">AES-256 Key Encryption</h3>
                <p className="text-xs leading-relaxed text-slate-500">
                  Private keys encrypted at rest with military-grade AES-256-GCM. Decrypted
                  in-memory only during transactions.
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Additional security details */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-8"
          >
            <Card variant="ghost" padding="lg">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Client-side PIN hashing</p>
                    <p className="text-[11px] text-slate-400">
                      SHA-256 with public key salt — raw PIN never touches the server
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      On-chain brute force lockout
                    </p>
                    <p className="text-[11px] text-slate-400">
                      3 failed PINs = 15-minute lockout enforced by smart contract
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Open source & auditable</p>
                    <p className="text-[11px] text-slate-400">
                      Full source code on GitHub. Contract verified on Stellar Explorer.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-brand-500 mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      No password authentication
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Email OTP only — no password database to leak or breach
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="border-t border-slate-200/70 px-6 py-16 md:py-20">
        <div className="mx-auto max-w-md md:max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mb-10 text-center"
          >
            <div className="text-brand-600 mb-3 text-xs font-semibold tracking-wide uppercase">
              Real Feedback
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
              What testers are saying
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
              Feedback from real students and merchants who tested PeraPin on Stellar Testnet.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
              >
                <Card variant="surface" padding="lg" className="h-full space-y-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`h-3.5 w-3.5 ${si < t.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 italic">
                    &ldquo;{t.comment}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="bg-brand-50 text-brand-700 ring-brand-100 flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold ring-1">
                      {t.role === "Merchant" ? (
                        <Store className="h-3.5 w-3.5" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-800">{t.name}</p>
                      <p className="text-[10px] text-slate-400">{t.role}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GET STARTED CTAs ===== */}
      <section className="border-t border-slate-200/70 bg-white px-6 py-16 md:py-20">
        <div className="mx-auto max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.4 }}
            className="mb-8 text-center"
          >
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Ready to get started?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose your role and set up in under 2 minutes.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3.5"
          >
            <Link href="/register/merchant" className="group block">
              <Card variant="money" padding="none" interactive className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="rounded-2xl bg-white/15 p-3 ring-1 ring-white/20">
                      <Store className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold">I&apos;m a merchant</h3>
                      <p className="text-brand-100 text-xs leading-tight">
                        Accept payments with just your phone browser
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-brand-200 h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
              </Card>
            </Link>

            <Link href="/register/consumer" className="group block">
              <Card variant="surface" padding="none" interactive className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-2xl p-3 ring-1">
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
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-slate-200/70 bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-md md:max-w-4xl">
          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3 md:items-start">
            {/* Brand */}
            <div className="flex flex-col items-center justify-center space-y-3 md:items-start">
              <div className="flex items-center gap-2">
                <svg className="h-7 w-7 flex-shrink-0" viewBox="0 0 32 32" fill="none">
                  <defs>
                    <linearGradient id="footer-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b6af5" />
                      <stop offset="100%" stopColor="#1e40af" />
                    </linearGradient>
                  </defs>
                  <rect width="32" height="32" rx="9" fill="url(#footer-logo-grad)" />
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
                <span className="text-sm font-bold text-slate-900">PeraPin</span>
              </div>
              <p className="text-center text-[11px] leading-relaxed text-slate-400 md:text-left">
                Blockchain micropayments for informal economies. Built on Stellar/Soroban.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Product
              </h4>
              <nav className="flex flex-col gap-1.5 text-xs text-slate-500">
                <a href="#how-it-works" className="hover:text-brand-600 transition-colors">
                  How it Works
                </a>
                <a href="#features" className="hover:text-brand-600 transition-colors">
                  Features
                </a>
                <a href="#security" className="hover:text-brand-600 transition-colors">
                  Security
                </a>
                <Link href="/feedback" className="hover:text-brand-600 transition-colors">
                  Submit Feedback
                </Link>
              </nav>
            </div>

            {/* Resources */}
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Resources
              </h4>
              <nav className="flex flex-col gap-1.5 text-xs text-slate-500">
                <a
                  href="https://github.com/lncekent/perapin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  GitHub Repository
                </a>
                <a
                  href="https://stellar.expert/explorer/testnet/contract/CBEASRMFLJOTK6PVM6276THY26GVNYUXKDWF3JVPKGYEC63MUSQV5P3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  Stellar Explorer
                </a>
                <a
                  href="https://soroban.stellar.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  Soroban Docs
                </a>
              </nav>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 border-t border-slate-200/70 pt-6 text-center">
            <p className="text-[10px] leading-relaxed text-slate-400">
              Built by{" "}
              <span className="font-semibold text-slate-600">Lance Kent Geoffrey B. Magollado</span>{" "}
              · MIT License · 2026
            </p>
            <p className="mt-1 text-[10px] text-slate-300">
              Stellar Testnet · Contract: CBEAS...V5P3D
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
