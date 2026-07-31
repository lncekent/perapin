"use client";

import Link from "next/link";
import {
  QrCode,
  Wallet,
  ReceiptText,
  KeyRound,
  AlertTriangle,
  Lock,
  ArrowUpRight,
  ShieldCheck,
  ShieldAlert,
  Activity,
  TrendingDown,
  Hash,
  CalendarDays,
  Lightbulb,
  Globe,
  CheckCircle2,
  XCircle,
  ArrowDownLeft,
  ArrowUpLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCachedFetch } from "@/lib/use-cached-fetch";

interface Profile {
  user: { email: string; stellarPublicKey: string };
  balanceXlm: string;
  isLocked: boolean;
  pinSetupRequired: boolean;
}

interface Tx {
  id: string;
  stellar_tx_hash: string;
  from_public_key: string;
  to_public_key: string;
  amount_xlm: number;
  status: string;
  created_at: string;
}

const actions = [
  {
    href: "/consumer/qr",
    label: "QR Sticker",
    sub: "Show, download & print your payment sticker",
    icon: QrCode,
  },
  {
    href: "/consumer/topup",
    label: "Fund Wallet",
    sub: "Add testnet XLM via Friendbot faucet",
    icon: Wallet,
  },
  {
    href: "/consumer/history",
    label: "Transaction History",
    sub: "View all past payments and details",
    icon: ReceiptText,
  },
  {
    href: "/consumer/settings",
    label: "Change PIN",
    sub: "Update your 4-digit security PIN",
    icon: KeyRound,
  },
] as const;

const tips = [
  "Print your QR sticker and attach it to your ID, wallet, or phone case.",
  "Never share your 4-digit PIN with anyone — not even store owners.",
  "After 3 wrong PIN attempts, your wallet locks for 15 minutes automatically.",
  "Fund your wallet with testnet XLM before making your first payment.",
];

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function truncateKey(key: string): string {
  if (!key || key.length < 12) return key;
  return `${key.slice(0, 6)}…${key.slice(-4)}`;
}

export default function ConsumerDashboard() {
  const { data: profile, error } = useCachedFetch<Profile>("me", async () => {
    const r = await fetch("/api/user/me");
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Unable to load wallet.");
    return data;
  });

  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("consumer-txs", async () => {
    const r = await fetch("/api/transactions");
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Unable to load transactions.");
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
        <div className="h-20 animate-pulse rounded-3xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );

  const transactions = txData?.transactions ?? [];
  const recentTxs = transactions.slice(0, 3);
  const totalSpent = transactions
    .filter((tx) => tx.from_public_key === profile.user.stellarPublicKey && tx.status === "success")
    .reduce((sum, tx) => sum + tx.amount_xlm, 0);
  const txCount = transactions.length;
  const memberSince = profile.user.email
    ? new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";

  return (
    <div className="animate-fade-up space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Hello, {profile.user.email.split("@")[0]}
        </h1>
        <p className="text-sm text-slate-500">Your Testnet PeraPin wallet</p>
      </div>

      {/* PIN Setup Warning */}
      {profile.pinSetupRequired && (
        <Card
          variant="surface"
          padding="sm"
          className="flex items-start gap-3 border-amber-200 bg-amber-50"
        >
          <AlertTriangle
            className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
            aria-hidden="true"
          />
          <p className="text-sm text-amber-900">
            Finish PIN setup before using your sticker.{" "}
            <Link href="/register/consumer" className="font-bold underline">
              Continue setup
            </Link>
          </p>
        </Card>
      )}

      {/* Money Hero Card */}
      <Card variant="money" padding="lg" className="animate-shimmer relative overflow-hidden">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-brand-100 text-sm font-medium">Available balance</p>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white ring-1 ring-white/20">
              TESTNET
            </span>
          </div>
          <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums">
            {Number(profile.balanceXlm).toFixed(2)}
            <span className="text-brand-200 ml-2 text-xl font-semibold">XLM</span>
          </p>
          <p className="text-brand-200/80 mt-3 truncate font-mono text-[11px]">
            {profile.user.stellarPublicKey}
          </p>
          {profile.isLocked && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-500/25 px-3 py-2 text-sm font-medium text-red-50 ring-1 ring-red-300/30">
              <Lock className="h-4 w-4" aria-hidden="true" />
              Wallet temporarily locked after failed PIN attempts
            </p>
          )}
        </div>
      </Card>

      {/* Quick Stats Row */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Quick Stats
        </h2>
        <div className="grid grid-cols-3 gap-3">
          <Card variant="ghost" padding="sm" className="text-center">
            <TrendingDown className="mx-auto h-4 w-4 text-slate-400" aria-hidden="true" />
            <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">
              {totalSpent.toFixed(1)}
            </p>
            <p className="text-[10px] text-slate-500">XLM Spent</p>
          </Card>
          <Card variant="ghost" padding="sm" className="text-center">
            <Hash className="mx-auto h-4 w-4 text-slate-400" aria-hidden="true" />
            <p className="mt-1.5 text-lg font-bold text-slate-900 tabular-nums">{txCount}</p>
            <p className="text-[10px] text-slate-500">Transactions</p>
          </Card>
          <Card variant="ghost" padding="sm" className="text-center">
            <CalendarDays className="mx-auto h-4 w-4 text-slate-400" aria-hidden="true" />
            <p className="mt-1.5 text-sm font-bold text-slate-900">{memberSince}</p>
            <p className="text-[10px] text-slate-500">Member Since</p>
          </Card>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Recent Activity
          </h2>
          {transactions.length > 0 && (
            <Link
              href="/consumer/history"
              className="text-brand-600 text-xs font-medium hover:underline"
            >
              View all
            </Link>
          )}
        </div>
        <Card variant="surface" padding="sm">
          {recentTxs.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Activity className="h-8 w-8 text-slate-300" aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-slate-500">No transactions yet</p>
              <p className="text-xs text-slate-400">Your payment history will appear here</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentTxs.map((tx) => {
                const isSender = tx.from_public_key === profile.user.stellarPublicKey;
                return (
                  <li key={tx.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isSender ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"
                      }`}
                    >
                      {isSender ? (
                        <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {isSender ? "Sent to" : "Received from"}{" "}
                        <span className="font-mono text-xs text-slate-500">
                          {truncateKey(isSender ? tx.to_public_key : tx.from_public_key)}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatRelativeDate(tx.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          isSender ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isSender ? "−" : "+"}
                        {tx.amount_xlm.toFixed(2)}
                      </p>
                      <Badge
                        variant={tx.status === "success" ? "default" : "destructive"}
                        className="mt-0.5 text-[9px]"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(({ href, label, sub, icon: Icon }) => (
            <Link key={href} href={href} className="group">
              <Card variant="surface" padding="sm" interactive className="h-full">
                <div className="flex items-start justify-between">
                  <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-xl p-2 ring-1">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <ArrowUpRight
                    className="group-hover:text-brand-500 h-4 w-4 text-slate-300 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">{label}</p>
                <p className="mt-0.5 text-[11px] leading-tight text-slate-400">{sub}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Security Status */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          Security Status
        </h2>
        <Card variant="surface" padding="sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* PIN Status */}
            <div className="flex items-center gap-2.5">
              {profile.pinSetupRequired ? (
                <ShieldAlert className="h-5 w-5 text-amber-500" aria-hidden="true" />
              ) : (
                <ShieldCheck className="h-5 w-5 text-green-500" aria-hidden="true" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-700">PIN Status</p>
                <p
                  className={`text-[11px] font-medium ${
                    profile.pinSetupRequired ? "text-amber-600" : "text-green-600"
                  }`}
                >
                  {profile.pinSetupRequired ? "Needs Setup" : "Active"}
                </p>
              </div>
            </div>

            {/* Lock Status */}
            <div className="flex items-center gap-2.5">
              {profile.isLocked ? (
                <XCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-500" aria-hidden="true" />
              )}
              <div>
                <p className="text-xs font-semibold text-slate-700">Wallet Lock</p>
                <p
                  className={`text-[11px] font-medium ${
                    profile.isLocked ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {profile.isLocked ? "Locked (15 min)" : "Unlocked"}
                </p>
              </div>
            </div>

            {/* Network Status */}
            <div className="flex items-center gap-2.5">
              <Globe className="h-5 w-5 text-blue-500" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold text-slate-700">Network</p>
                <p className="text-[11px] font-medium text-blue-600">Stellar Testnet</p>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Getting Started Tips */}
      <section>
        <h2 className="mb-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
          <Lightbulb className="mr-1 inline-block h-3.5 w-3.5" aria-hidden="true" />
          Getting Started
        </h2>
        <Card variant="ghost" padding="sm">
          <ul className="space-y-2">
            {tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <span className="bg-brand-100 text-brand-700 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
