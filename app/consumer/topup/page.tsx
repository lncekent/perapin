"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, ExternalLink, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { useCachedFetch } from "@/lib/use-cached-fetch";

interface Profile {
  user: { stellarPublicKey: string };
  balanceXlm: string;
}

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
    <div className="animate-fade-up space-y-5">
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
            <p className="text-sm font-medium text-brand-100">Current balance</p>
            <Badge className="bg-white/15 text-white ring-1 ring-white/20">TESTNET</Badge>
          </div>
          <p className="mt-3 text-4xl font-bold tracking-tight tabular-nums">
            {balance ? Number(balance).toFixed(2) : "…"}
            <span className="ml-2 text-lg font-semibold text-brand-200">XLM</span>
          </p>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-100 transition-colors hover:text-white disabled:opacity-60"
          >
            <RefreshCw
              className={refreshing ? "size-4 animate-spin" : "size-4"}
              aria-hidden="true"
            />
            {refreshing ? "Refreshing…" : "Refresh balance"}
          </button>
        </div>
      </Card>

      {/* Address */}
      <Card variant="surface" padding="md" className="space-y-3">
        <p className="text-sm font-semibold text-slate-800">Your Stellar public key</p>
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

      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <Info className="mt-0.5 size-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          Friendbot funds Testnet wallets for free. After funding, tap Refresh to see your new
          balance.
        </p>
      </Card>
    </div>
  );
}
