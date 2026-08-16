"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ScanLine,
  ReceiptText,
  ArrowUpRight,
  MessageSquareText,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
  Wifi,
  ArrowDownLeft,
  ExternalLink,
  Copy,
  Check,
  Store,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { formatBalance, copyToClipboard } from "@/lib/utils";
import { OnboardingOverlay } from "@/components/shared/OnboardingOverlay";
import { toast } from "@/components/ui/toast";

interface Profile {
  user: { businessName?: string; stellarPublicKey: string };
  balanceXlm: string;
}

interface Tx {
  id: string;
  stellar_tx_hash: string;
  amount_xlm: number;
  created_at: string;
}

export default function MerchantDashboard() {
  const [walletCopied, setWalletCopied] = useState(false);
  const [balanceHidden, setBalanceHidden] = useState(false);

  useEffect(() => {
    setBalanceHidden(localStorage.getItem("perapin_hide_balance") === "true");
  }, []);

  const { data: profile, error } = useCachedFetch<Profile>("me", async () => {
    const r = await fetch("/api/user/me");
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Unable to load wallet.");
    return data;
  });

  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("merchant-tx", async () => {
    const r = await fetch("/api/transactions");
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Unable to load transactions.");
    return data;
  });

  const transactions = txData?.transactions ?? [];

  // Compute stats
  const totalReceived = transactions.reduce((sum, tx) => sum + tx.amount_xlm, 0);
  const paymentCount = transactions.length;
  const averagePayment = paymentCount > 0 ? totalReceived / paymentCount : 0;

  // Today's revenue
  const today = new Date().toISOString().slice(0, 10);
  const todayRevenue = transactions
    .filter((tx) => tx.created_at.slice(0, 10) === today)
    .reduce((sum, tx) => sum + tx.amount_xlm, 0);

  // Recent 5 transactions
  const recentTx = transactions.slice(0, 5);

  if (error && !profile)
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
        {error}
      </p>
    );

  if (!profile)
    return (
      <div className="space-y-5">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-44 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-14 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header with status indicator */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile.user.businessName || "Merchant dashboard"}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
            </span>
            <p className="text-sm text-slate-500">Ready to accept payments</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-[10px] font-semibold tracking-wide uppercase">
          Merchant
        </Badge>
      </div>

      {/* Money hero card */}
      <Card variant="money" padding="lg" className="animate-shimmer relative overflow-hidden">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="text-brand-100 text-sm font-medium">Received balance</p>
              <button
                type="button"
                onClick={() => {
                  const next = !balanceHidden;
                  setBalanceHidden(next);
                  localStorage.setItem("perapin_hide_balance", String(next));
                }}
                className="text-brand-200 rounded-lg p-1 transition-colors hover:text-white"
                aria-label={balanceHidden ? "Show balance" : "Hide balance"}
              >
                {balanceHidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white ring-1 ring-white/20">
              TESTNET
            </span>
          </div>
          <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums">
            {balanceHidden ? "••••••" : formatBalance(profile.balanceXlm)}
            <span className="text-brand-200 ml-2 text-xl font-semibold">XLM</span>
          </p>
          {todayRevenue > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-green-300" aria-hidden="true" />
              <p className="text-xs font-medium text-green-200">
                +{balanceHidden ? "•••" : formatBalance(todayRevenue)} XLM today
              </p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <p className="text-brand-200/80 font-mono text-[11px]">
              {profile.user.stellarPublicKey.slice(0, 6)}····{profile.user.stellarPublicKey.slice(-6)}
            </p>
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                await copyToClipboard(profile.user.stellarPublicKey);
                setWalletCopied(true);
                toast.add({ title: "Address copied", description: "Wallet address copied to clipboard.", type: "success" });
                setTimeout(() => setWalletCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-[10px] font-medium text-brand-100 hover:bg-white/20 transition-colors"
              aria-label="Copy wallet address"
            >
              {walletCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {walletCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </Card>

      {/* Stats row */}
      <section className="grid grid-cols-3 gap-3">
        <Card variant="ghost" padding="sm" className="text-center">
          <TrendingUp className="text-brand-500 mx-auto h-4 w-4" aria-hidden="true" />
          <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">
            {totalReceived.toFixed(1)}
          </p>
          <p className="text-[10px] font-medium text-slate-400">Total XLM</p>
        </Card>
        <Card variant="ghost" padding="sm" className="text-center">
          <Users className="text-brand-500 mx-auto h-4 w-4" aria-hidden="true" />
          <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">{paymentCount}</p>
          <p className="text-[10px] font-medium text-slate-400">Payments</p>
        </Card>
        <Card variant="ghost" padding="sm" className="text-center">
          <Clock className="text-brand-500 mx-auto h-4 w-4" aria-hidden="true" />
          <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">
            {averagePayment.toFixed(1)}
          </p>
          <p className="text-[10px] font-medium text-slate-400">Avg XLM</p>
        </Card>
      </section>

      {/* Primary CTA — Accept Payment */}
      <Link href="/merchant/scan" className="group block">
        <Card
          variant="surface"
          padding="md"
          interactive
          className="border-brand-200 bg-brand-50/50 ring-brand-100 ring-1"
        >
          <div className="flex items-center gap-4">
            <div className="bg-brand-600 rounded-2xl p-3 text-white shadow-md">
              <ScanLine className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-slate-900">Accept Payment</p>
              <p className="text-xs text-slate-500">Scan consumer QR sticker to begin</p>
            </div>
            <ArrowUpRight
              className="text-brand-400 group-hover:text-brand-600 h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </div>
        </Card>
      </Link>

      {/* Recent Payments */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Recent Payments</h2>
          {recentTx.length > 0 && (
            <Link
              href="/merchant/history"
              className="text-brand-600 hover:text-brand-700 flex items-center gap-0.5 text-xs font-medium"
            >
              View all <ChevronRight className="h-3 w-3" aria-hidden="true" />
            </Link>
          )}
        </div>
        {recentTx.length === 0 ? (
          <Card variant="ghost" padding="md">
            <p className="text-center text-sm text-slate-400">
              No payments yet. Accept your first payment!
            </p>
          </Card>
        ) : (
          <Card variant="surface" padding="none" className="divide-y divide-slate-100">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div className="rounded-xl bg-green-50 p-2 text-green-600 ring-1 ring-green-100">
                  <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    +{tx.amount_xlm.toFixed(2)} XLM
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {new Date(tx.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-500 text-slate-300"
                  aria-label="View on Stellar Explorer"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            ))}
          </Card>
        )}
      </section>

      {/* Business Tools */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Business Tools</h2>
        <div className="space-y-2">
          <Link href="/merchant/history" className="group block">
            <Card variant="surface" padding="sm" interactive>
              <div className="flex items-center gap-3">
                <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-xl p-2 ring-1">
                  <ReceiptText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Payment History</p>
                  <p className="text-[11px] text-slate-400">View all incoming payments</p>
                </div>
                <ChevronRight
                  className="group-hover:text-brand-500 h-5 w-5 flex-shrink-0 text-slate-300 transition-colors"
                  aria-hidden="true"
                />
              </div>
            </Card>
          </Link>

          <Link href="/feedback" className="group block">
            <Card variant="surface" padding="sm" interactive>
              <div className="flex items-center gap-3">
                <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-xl p-2 ring-1">
                  <MessageSquareText className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Send Feedback</p>
                  <p className="text-[11px] text-slate-400">Tell us about your experience</p>
                </div>
                <ChevronRight
                  className="group-hover:text-brand-500 h-5 w-5 flex-shrink-0 text-slate-300 transition-colors"
                  aria-hidden="true"
                />
              </div>
            </Card>
          </Link>

          <Link href="/merchant/scan" className="group block">
            <Card variant="surface" padding="sm" interactive>
              <div className="flex items-center gap-3">
                <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-xl p-2 ring-1">
                  <ScanLine className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900">Help / Guide</p>
                  <p className="text-[11px] text-slate-400">How to accept merchant-pull payments</p>
                </div>
                <ChevronRight
                  className="group-hover:text-brand-500 h-5 w-5 flex-shrink-0 text-slate-300 transition-colors"
                  aria-hidden="true"
                />
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Network Status */}
      <Card variant="ghost" padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-green-500" aria-hidden="true" />
            <p className="text-xs font-medium text-slate-600">Stellar Testnet</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            <p className="text-[10px] font-medium text-green-600">Connected</p>
          </div>
        </div>
      </Card>

      {/* Onboarding Tour */}
      <OnboardingOverlay
        storageKey="perapin_onboarding_merchant_done"
        steps={[
          {
            title: "Welcome, Merchant!",
            description: "You're ready to accept QR sticker payments. Here's how the flow works.",
            icon: <Store className="size-7" />,
          },
          {
            title: "Scan Consumer's QR",
            description: "Tap 'Accept Payment' and scan the consumer's QR sticker using your phone camera.",
            icon: <ScanLine className="size-7" />,
          },
          {
            title: "Enter Amount & Handoff",
            description: "Type the payment amount, then hand your phone to the consumer to enter their PIN.",
            icon: <ReceiptText className="size-7" />,
          },
          {
            title: "Instant Settlement",
            description: "Once the PIN is verified, funds settle on the Stellar blockchain in seconds. Check your history anytime.",
            icon: <TrendingUp className="size-7" />,
          },
        ]}
      />
    </div>
  );
}
