"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Info,
  Clock,
  Wallet,
  Globe,
  Zap,
  CircleHelp,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useCachedFetch } from "@/lib/use-cached-fetch";

interface Profile {
  user: { stellarPublicKey: string };
  balanceXlm: string;
}

const STEPS = [
  {
    icon: Copy,
    title: "Copy your address",
    description: "Tap the copy button below to get your Stellar public key.",
  },
  {
    icon: Globe,
    title: "Open Friendbot",
    description: "Click the Friendbot button to open the Stellar faucet page.",
  },
  {
    icon: Zap,
    title: "Receive 10,000 XLM",
    description: "Friendbot instantly funds your Testnet wallet for free.",
  },
  {
    icon: RefreshCw,
    title: "Refresh balance",
    description: "Come back here and tap Refresh to see your updated balance.",
  },
];

export default function ConsumerTopupPage() {
  const { data, refetch } = useCachedFetch<Profile>("me", async () => {
    const r = await fetch("/api/user/me");
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Unable to load wallet.");
    return d;
  });
  const wallet = data?.user.stellarPublicKey ?? "";
  const balance = data?.balanceXlm ?? "";
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  async function refresh() {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(wallet);
    setCopied(true);
    toast.add({
      title: "Address copied",
      description: "Your public key is on the clipboard.",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fund your wallet</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add Testnet XLM so you can pay at PeraPin merchants.
        </p>
      </div>

      {/* Balance */}
      <Card variant="money" padding="lg" className="relative overflow-hidden">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-brand-100 text-sm font-medium">Current balance</p>
            <Badge className="bg-white/15 text-white ring-1 ring-white/20">TESTNET</Badge>
          </div>
          <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums">
            {balance ? Number(balance).toFixed(2) : "…"}
            <span className="text-brand-200 ml-2 text-lg font-semibold">XLM</span>
          </p>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="text-brand-100 mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-white disabled:opacity-60"
          >
            <RefreshCw
              className={refreshing ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            {refreshing ? "Refreshing…" : "Refresh balance"}
          </button>
        </div>
      </Card>

      {/* Estimated Time */}
      <Card variant="ghost" padding="sm" className="flex items-center gap-3">
        <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-9 items-center justify-center rounded-xl ring-1">
          <Clock className="size-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Estimated time</p>
          <p className="text-xs text-slate-500">~5 seconds — Testnet funding is instant</p>
        </div>
      </Card>

      {/* How to Fund Guide */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CircleHelp className="text-brand-600 size-4" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">How to fund your wallet</h2>
        </div>
        <div className="grid gap-2.5">
          {STEPS.map((step, i) => (
            <Card key={i} variant="ghost" padding="sm">
              <div className="flex items-start gap-3">
                <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-8 flex-shrink-0 items-center justify-center rounded-lg ring-1">
                  <span className="text-xs font-bold">{i + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                </div>
                <step.icon
                  className="mt-0.5 size-4 flex-shrink-0 text-slate-300"
                  aria-hidden="true"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Address */}
      <Card variant="surface" padding="md" className="space-y-3">
        <div className="flex items-center gap-2">
          <Wallet className="text-brand-600 size-4" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-800">Your Stellar public key</p>
        </div>
        <p className="selectable rounded-xl bg-slate-50 p-3 font-mono text-xs break-all text-slate-600">
          {wallet || "…"}
        </p>
        <Button variant="secondary" size="md" onClick={copy} disabled={!wallet}>
          {copied ? (
            <>
              <Check className="size-4" aria-hidden="true" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-4" aria-hidden="true" /> Copy address
            </>
          )}
        </Button>
      </Card>

      {/* Friendbot */}
      {wallet && (
        <a
          href={`https://friendbot.stellar.org?addr=${encodeURIComponent(wallet)}`}
          target="_blank"
          rel="noreferrer"
          className="block"
        >
          <Button variant="primary" size="lg" block>
            <ExternalLink className="size-5" aria-hidden="true" /> Open Testnet Friendbot
          </Button>
        </a>
      )}

      {/* Info note */}
      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <Info className="text-brand-500 mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          Friendbot funds Testnet wallets for free with 10,000 XLM. After funding, tap Refresh to
          see your new balance. You can request funding multiple times.
        </p>
      </Card>

      {/* Stellar Docs Link */}
      <a
        href="https://developers.stellar.org/docs/learn/networks"
        target="_blank"
        rel="noreferrer"
        className="group block"
      >
        <Card variant="ghost" padding="sm" interactive>
          <div className="flex items-center gap-3">
            <div className="group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:ring-brand-100 flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 ring-1 ring-slate-200 transition-colors">
              <BookOpen className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">Stellar Documentation</p>
              <p className="text-[11px] text-slate-400">
                Learn more about Testnet, Friendbot, and Stellar networks
              </p>
            </div>
            <ArrowRight
              className="group-hover:text-brand-500 size-4 flex-shrink-0 text-slate-300 transition-colors"
              aria-hidden="true"
            />
          </div>
        </Card>
      </a>
    </div>
  );
}
