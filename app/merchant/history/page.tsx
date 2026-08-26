"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownLeft, ReceiptText, Archive, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { cn, formatBalance } from "@/lib/utils";
import { getCounterpartyDisplay, formatTransactionDate } from "@/lib/mask";

interface Tx {
  id: string;
  stellar_tx_hash: string;
  amount_xlm: number;
  status: string;
  created_at: string;
  from_public_key: string;
  to_public_key: string;
  direction: "sent" | "received";
  counterparty: {
    name: string | null;
    email: string | null;
    wallet: string;
  };
}

type FilterTab = "all" | "received" | "archived";

const STORAGE_KEY = "perapin_archived_txs";

function getArchivedIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function MerchantHistoryPage() {
  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("transactions", async () => {
    const r = await fetch("/api/transactions");
    return r.json();
  });
  const transactions = txData?.transactions ?? [];
  const loading = !txData;

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const archivedIds = getArchivedIds();

  const filteredTransactions = transactions.filter((tx) => {
    const isArchived = archivedIds.includes(tx.id);
    if (activeTab === "archived") return isArchived;
    return !isArchived;
  });

  const total = filteredTransactions.reduce((sum, tx) => sum + Number(tx.amount_xlm), 0);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "received", label: "Received" },
    { key: "archived", label: "Archived" },
  ];

  return (
    <div className="animate-fade-up space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment History</h1>
        <p className="text-sm text-slate-500">Tap a payment to view full details.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card variant="ghost" padding="lg" className="flex flex-col items-center py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-slate-400 ring-1 ring-slate-200">
            {activeTab === "archived" ? (
              <Archive className="size-7" aria-hidden="true" />
            ) : (
              <ReceiptText className="size-7" aria-hidden="true" />
            )}
          </div>
          <p className="mt-4 font-semibold text-slate-700">
            {activeTab === "archived" ? "No archived payments" : "No payments received yet"}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            {activeTab === "archived"
              ? "Archived transactions will appear here."
              : "Accept a payment to see your settlements here."}
          </p>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <Card variant="surface" padding="sm" className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {filteredTransactions.length} payment{filteredTransactions.length === 1 ? "" : "s"}
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {formatBalance(total)} XLM
            </span>
          </Card>

          {/* Compact Transaction List */}
          <Card variant="surface" padding="none" className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const { displayName, maskedWallet } = getCounterpartyDisplay(tx.counterparty);

              return (
                <Link
                  key={tx.id}
                  href={`/merchant/history/${tx.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="flex size-9 flex-shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 ring-1 ring-green-100">
                    <ArrowDownLeft className="size-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    <p className="truncate text-[11px] text-slate-400">
                      {maskedWallet} • {formatTransactionDate(tx.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <p className="text-sm font-bold text-green-600 tabular-nums">
                      +{formatBalance(tx.amount_xlm)}
                    </p>
                    <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
                  </div>
                </Link>
              );
            })}
          </Card>
        </>
      )}
    </div>
  );
}
