"use client";

import { ArrowDownLeft, ReceiptText, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCachedFetch } from "@/lib/use-cached-fetch";

interface Tx {
  id: string;
  stellar_tx_hash: string;
  amount_xlm: number;
  created_at: string;
}

export default function MerchantHistoryPage() {
  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("transactions", async () => {
    const r = await fetch("/api/transactions");
    return r.json();
  });
  const transactions = txData?.transactions ?? [];
  const loading = !txData;
  const total = transactions.reduce((sum, tx) => sum + Number(tx.amount_xlm), 0);

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Incoming payments</h1>
        <p className="text-sm text-slate-500">Your confirmed Testnet settlements.</p>
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
          <p className="mt-4 font-semibold text-slate-700">No payments received yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Accept a payment to see your settlements appear here.
          </p>
        </Card>
      ) : (
        <>
          <Card variant="surface" padding="sm" className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {transactions.length} payment{transactions.length === 1 ? "" : "s"}
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {total.toFixed(2)} XLM total
            </span>
          </Card>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <Card key={tx.id} variant="surface" padding="sm">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                    <ArrowDownLeft className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Received</Badge>
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
                  <p className="flex-shrink-0 text-sm font-bold text-brand-700 tabular-nums">
                    +{Number(tx.amount_xlm).toFixed(2)} XLM
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
