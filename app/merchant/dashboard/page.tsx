"use client";

import Link from "next/link";
import { ScanLine, ReceiptText, ArrowUpRight, MessageSquareText, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCachedFetch } from "@/lib/use-cached-fetch";

interface Profile {
  user: { businessName?: string; stellarPublicKey: string };
  balanceXlm: string;
}

const actions = [
  { href: "/merchant/scan", label: "Accept payment", sub: "Scan a sticker", icon: ScanLine },
  {
    href: "/merchant/history",
    label: "Payment history",
    sub: "Incoming payments",
    icon: ReceiptText,
  },
] as const;

export default function MerchantDashboard() {
  const { data: profile, error } = useCachedFetch<Profile>("me", async () => {
    const r = await fetch("/api/user/me");
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Unable to load wallet.");
    return data;
  });

  if (error && !profile)
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
        {error}
      </p>
    );

  if (!profile)
    return (
      <div className="space-y-5">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-40 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {profile.user.businessName || "Merchant dashboard"}
        </h1>
        <p className="text-sm text-slate-500">Ready to accept merchant-pull payments.</p>
      </div>

      {/* Money hero */}
      <Card variant="money" padding="lg" className="animate-shimmer relative overflow-hidden">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-brand-100">Received balance</p>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white ring-1 ring-white/20">
              TESTNET
            </span>
          </div>
          <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums">
            {Number(profile.balanceXlm).toFixed(2)}
            <span className="ml-2 text-xl font-semibold text-brand-200">XLM</span>
          </p>
          <p className="mt-3 truncate font-mono text-[11px] text-brand-200/80">
            {profile.user.stellarPublicKey}
          </p>
        </div>
      </Card>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        {actions.map(({ href, label, sub, icon: Icon }) => (
          <Link key={href} href={href} className="group">
            <Card variant="surface" padding="sm" interactive className="h-full">
              <div className="flex items-start justify-between">
                <div className="rounded-xl bg-brand-50 p-2 text-brand-600 ring-1 ring-brand-100">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-500" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-bold text-slate-900">{label}</p>
              <p className="text-[11px] text-slate-400">{sub}</p>
            </Card>
          </Link>
        ))}
      </section>

      <Link href="/feedback" className="group block">
        <Card variant="surface" padding="sm" interactive>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 p-2 text-brand-600 ring-1 ring-brand-100">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Send feedback</p>
              <p className="text-[11px] text-slate-400">Tell us about your payment experience</p>
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300 transition-colors group-hover:text-brand-500" aria-hidden="true" />
          </div>
        </Card>
      </Link>
    </div>
  );
}
