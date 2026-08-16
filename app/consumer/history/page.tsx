"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ReceiptText,
  ExternalLink,
  TrendingDown,
  TrendingUp,
  Activity,
  Hash,
  CalendarDays,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatBalance } from "@/lib/utils";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { toast } from "@/components/ui/toast";

interface Tx {
  id: string;
  stellar_tx_hash: string;
  from_public_key: string;
  to_public_key: string;
  amount_xlm: number;
  status: string;
  created_at: string;
}

type FilterType = "all" | "sent" | "received" | "archived";

function getDateGroup(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return "Earlier";
}

export default function ConsumerHistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("perapin_consumer_archived_txs");
      if (stored) setArchivedIds(JSON.parse(stored));
    } catch {}
  }, []);

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

  // Archive / Restore functions
  function archiveTx(txId: string) {
    const updated = [...archivedIds, txId];
    setArchivedIds(updated);
    localStorage.setItem("perapin_consumer_archived_txs", JSON.stringify(updated));
    toast.add({ title: "Archived", description: "Transaction moved to archive.", type: "success" });
  }

  function restoreTx(txId: string) {
    const updated = archivedIds.filter((id) => id !== txId);
    setArchivedIds(updated);
    localStorage.setItem("perapin_consumer_archived_txs", JSON.stringify(updated));
    toast.add({ title: "Restored", description: "Transaction restored to history.", type: "success" });
  }

  // Compute stats
  const stats = useMemo(() => {
    let totalSent = 0;
    let totalReceived = 0;
    let sentCount = 0;
    let receivedCount = 0;

    transactions.forEach((tx) => {
      if (tx.from_public_key === wallet) {
        totalSent += Number(tx.amount_xlm);
        sentCount++;
      } else {
        totalReceived += Number(tx.amount_xlm);
        receivedCount++;
      }
    });

    return {
      totalSent,
      totalReceived,
      netChange: totalReceived - totalSent,
      txCount: transactions.length,
      sentCount,
      receivedCount,
    };
  }, [transactions, wallet]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (filter === "archived") return transactions.filter((tx) => archivedIds.includes(tx.id));
    const nonArchived = transactions.filter((tx) => !archivedIds.includes(tx.id));
    if (filter === "all") return nonArchived;
    if (filter === "sent") return nonArchived.filter((tx) => tx.from_public_key === wallet);
    return nonArchived.filter((tx) => tx.from_public_key !== wallet);
  }, [transactions, wallet, filter, archivedIds]);

  // Group by date
  const groupedTransactions = useMemo(() => {
    const groups: { label: string; txs: Tx[] }[] = [];
    let currentGroup = "";

    filteredTransactions.forEach((tx) => {
      const group = getDateGroup(tx.created_at);
      if (group !== currentGroup) {
        groups.push({ label: group, txs: [] });
        currentGroup = group;
      }
      groups[groups.length - 1].txs.push(tx);
    });

    return groups;
  }, [filteredTransactions]);

  const archivedCount = transactions.filter((tx) => archivedIds.includes(tx.id)).length;
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.txCount - archivedCount },
    { key: "sent", label: "Sent", count: stats.sentCount },
    { key: "received", label: "Received", count: stats.receivedCount },
    { key: "archived", label: "Archived", count: archivedCount },
  ];

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Payment history</h1>
        <p className="text-sm text-slate-500">Your confirmed PeraPin payments.</p>
      </div>

      {/* Summary Stats */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-2 gap-2.5">
          <Card variant="ghost" padding="sm">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                <TrendingDown className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                  Total Spent
                </p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">
                  {formatBalance(stats.totalSent)} XLM
                </p>
              </div>
            </div>
          </Card>
          <Card variant="ghost" padding="sm">
            <div className="flex items-center gap-2">
              <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-8 items-center justify-center rounded-lg ring-1">
                <TrendingUp className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                  Total Received
                </p>
                <p className="text-brand-700 text-sm font-bold tabular-nums">
                  {formatBalance(stats.totalReceived)} XLM
                </p>
              </div>
            </div>
          </Card>
          <Card variant="ghost" padding="sm">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg ring-1",
                  stats.netChange >= 0
                    ? "bg-green-50 text-green-600 ring-green-100"
                    : "bg-red-50 text-red-500 ring-red-100",
                )}
              >
                <Activity className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                  Net Change
                </p>
                <p
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    stats.netChange >= 0 ? "text-green-700" : "text-red-600",
                  )}
                >
                  {stats.netChange >= 0 ? "+" : ""}
                  {formatBalance(stats.netChange)} XLM
                </p>
              </div>
            </div>
          </Card>
          <Card variant="ghost" padding="sm">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                <Hash className="size-3.5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                  Transactions
                </p>
                <p className="text-sm font-bold text-slate-900 tabular-nums">{stats.txCount}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filter Badges */}
      {!loading && transactions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                filter === f.key
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {f.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  filter === f.key ? "bg-white/20 text-white" : "bg-slate-200 text-slate-500",
                )}
              >
                {f.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Transaction List */}
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
      ) : filteredTransactions.length === 0 ? (
        filter === "archived" ? (
          <Card variant="ghost" padding="lg" className="flex flex-col items-center py-8 text-center">
            <Archive className="size-8 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-500">No archived transactions</p>
            <p className="mt-1 text-xs text-slate-400">Transactions you archive will appear here.</p>
          </Card>
        ) : (
          <Card variant="ghost" padding="lg" className="flex flex-col items-center py-8 text-center">
            <p className="text-sm font-medium text-slate-500">
              No {filter === "sent" ? "sent" : "received"} transactions found.
            </p>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div key={group.label} className="space-y-2.5">
              <div className="flex items-center gap-2 px-1">
                <CalendarDays className="size-3.5 text-slate-400" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {group.label}
                </p>
              </div>
              {group.txs.map((tx) => {
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
                          className="hover:text-brand-600 mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-slate-400"
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
                        {formatBalance(tx.amount_xlm)} XLM
                      </p>
                      {filter === "archived" ? (
                        <button
                          onClick={() => restoreTx(tx.id)}
                          className="ml-2 flex size-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          aria-label="Restore transaction"
                        >
                          <ArchiveRestore className="size-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => archiveTx(tx.id)}
                          className="ml-2 flex size-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Archive transaction"
                        >
                          <Archive className="size-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
