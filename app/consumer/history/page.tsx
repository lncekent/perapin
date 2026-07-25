"use client";

import { ArrowUpRight, ArrowDownLeft, ReceiptText, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCachedFetch } from "@/lib/use-cached-fetch";

interface Tx {
  id: string;
  stellar_tx_hash: string;
  from_public_key: string;
  to_public_key: string;
  amount_xlm: number;
  status: string;
  created_at: string;
}

export default function ConsumerHistoryPage() {
  const { data: profile } = useCachedFetch<{ user: { stellarPublicKey: string } }>(
    "me",
    async () => {
      const r = await fetch("/api/user/me");
      return r.json();
    },
  );
  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("transactions", async () => {
    const r = await fetch("/api/transactions");
    return r.json();
  });

  const wallet = profile?.user.stellarPublicKey ?? "";
  const transactions = txData?.transactions ?? [];
  const loading = !txData;

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment history</h1>
        <p className="text-sm text-slate-500">Your confirmed PeraPin payments.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <Card variant="ghost" padding="lg" className="flex flex-col items-center py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
            <ReceiptText className="size-7" aria-hidden="true" />
          </div>
          <p className="mt-4 font-semibold text-slate-700">No payments yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Your payments will appear here once you pay at a PeraPin merchant.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const sent = tx.from_public_key === wallet;
            return (
              <Card key={tx.id} variant="surface" padding="sm">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-10 flex-shrink-0 items-center justify-center rounded-xl ring-1",
                      sent
                        ? "bg-slate-50 text-slate-500 ring-slate-100"
                        : "bg-brand-50 text-brand-600 ring-brand-100",
                    )}
                  >
                    {sent ? (
                      <ArrowUpRight className="size-5" aria-hidden="true" />
                    ) : (
                      <ArrowDownLeft className="size-5" aria-hidden="true" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={sent ? "outline" : "secondary"}>
                        {sent ? "Sent" : "Received"}
                      </Badge>
                      <span className="truncate text-[11px] text-slate-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </span>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-brand-600"
                    >
                      {tx.stellar_tx_hash.slice(0, 10)}…{tx.stellar_tx_hash.slice(-6)}
                      <ExternalLink className="size-3" aria-hidden="true" />
                    </a>
                  </div>
                  <p
                    className={cn(
                      "flex-shrink-0 text-sm font-bold tabular-nums",
                      sent ? "text-slate-900" : "text-brand-700",
                    )}
                  >
                    {sent ? "−" : "+"}
                    {Number(tx.amount_xlm).toFixed(2)} XLM
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
