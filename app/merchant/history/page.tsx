"use client";

import { useState } from "react";
import { ArrowDownLeft, ReceiptText, ExternalLink, Archive, ArchiveRestore } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { cn, formatBalance } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

interface Tx {
  id: string;
  stellar_tx_hash: string;
  amount_xlm: number;
  created_at: string;
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

function setArchivedIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export default function MerchantHistoryPage() {
  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("transactions", async () => {
    const r = await fetch("/api/transactions");
    return r.json();
  });
  const transactions = txData?.transactions ?? [];
  const loading = !txData;

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [archivedIds, setArchivedIdsState] = useState<string[]>(() => getArchivedIds());

  function archiveTx(txId: string) {
    const updated = [...archivedIds, txId];
    setArchivedIdsState(updated);
    setArchivedIds(updated);
    toast.add({
      title: "Transaction archived",
      description: "You can find it in the Archived tab.",
      type: "success",
    });
  }

  function unarchiveTx(txId: string) {
    const updated = archivedIds.filter((id) => id !== txId);
    setArchivedIdsState(updated);
    setArchivedIds(updated);
    toast.add({
      title: "Transaction restored",
      description: "Moved back to your active payments.",
      type: "success",
    });
  }

  const filteredTransactions = transactions.filter((tx) => {
    const isArchived = archivedIds.includes(tx.id);
    if (activeTab === "archived") return isArchived;
    return !isArchived; // "all" and "received" both show non-archived
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
        <h1 className="text-2xl font-bold text-slate-900">Incoming payments</h1>
        <p className="text-sm text-slate-500">Your confirmed Testnet settlements.</p>
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
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-3xl bg-slate-200" />
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
              : "Accept a payment to see your settlements appear here."}
          </p>
        </Card>
      ) : (
        <>
          <Card variant="surface" padding="sm" className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {filteredTransactions.length} payment{filteredTransactions.length === 1 ? "" : "s"}
            </span>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {formatBalance(total)} XLM total
            </span>
          </Card>
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const isArchived = archivedIds.includes(tx.id);
              return (
                <Card key={tx.id} variant="surface" padding="sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-10 flex-shrink-0 items-center justify-center rounded-xl ring-1">
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
                        className="hover:text-brand-600 mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-slate-400"
                      >
                        {tx.stellar_tx_hash.slice(0, 10)}…{tx.stellar_tx_hash.slice(-6)}
                        <ExternalLink className="size-3" aria-hidden="true" />
                      </a>
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <p className="text-brand-700 text-sm font-bold tabular-nums">
                        +{formatBalance(tx.amount_xlm)} XLM
                      </p>
                      <button
                        onClick={() => (isArchived ? unarchiveTx(tx.id) : archiveTx(tx.id))}
                        className={cn(
                          "flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors",
                          isArchived
                            ? "text-brand-600 hover:bg-brand-50"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600",
                        )}
                        aria-label={isArchived ? "Restore transaction" : "Archive transaction"}
                      >
                        {isArchived ? (
                          <>
                            <ArchiveRestore className="size-3" />
                            Restore
                          </>
                        ) : (
                          <>
                            <Archive className="size-3" />
                            Archive
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
