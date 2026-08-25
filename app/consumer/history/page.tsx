"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Activity,
  Hash,
  CalendarDays,
  Archive,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatBalance } from "@/lib/utils";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { getCounterpartyDisplay, formatTransactionDate } from "@/lib/mask";

interface Tx {
  id: string;
  stellar_tx_hash: string;
  from_public_key: string;
  to_public_key: string;
  amount_xlm: number;
  status: string;
  created_at: string;
  direction: "sent" | "received";
  counterparty: {
    name: string | null;
    email: string | null;
    wallet: string;
  };
}

type FilterType = "all" | "sent" | "received" | "archived";

const STORAGE_KEY = "perapin_consumer_archived_txs";

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
  const [archivedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("transactions", async () => {
    const r = await fetch("/api/transactions");
    return r.json();
  });

  const transactions = useMemo(() => txData?.transactions ?? [], [txData]);
  const loading = !txData;

  // Compute stats
  const stats = useMemo(() => {
    let totalSent = 0;
    let totalReceived = 0;
    let sentCount = 0;
    let receivedCount = 0;

    transactions.forEach((tx) => {
      if (tx.direction === "sent") {
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
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (filter === "archived") return transactions.filter((tx) => archivedIds.includes(tx.id));
    const nonArchived = transactions.filter((tx) => !archivedIds.includes(tx.id));
    if (filter === "all") return nonArchived;
    if (filter === "sent") return nonArchived.filter((tx) => tx.direction === "sent");
    return nonArchived.filter((tx) => tx.direction === "received");
  }, [transactions, filter, archivedIds]);

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
        <p className="text-sm text-slate-500">Tap a payment to view full details.</p>
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
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-200" />
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
          <Card
            variant="ghost"
            padding="lg"
            className="flex flex-col items-center py-8 text-center"
          >
            <Archive className="size-8 text-slate-300" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-slate-500">No archived transactions</p>
            <p className="mt-1 text-xs text-slate-400">
              Transactions you archive will appear here.
            </p>
          </Card>
        ) : (
          <Card
            variant="ghost"
            padding="lg"
            className="flex flex-col items-center py-8 text-center"
          >
            <p className="text-sm font-medium text-slate-500">
              No {filter === "sent" ? "sent" : "received"} transactions found.
            </p>
          </Card>
        )
      ) : (
        <div className="space-y-4">
          {groupedTransactions.map((group) => (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <CalendarDays className="size-3.5 text-slate-400" aria-hidden="true" />
                <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
                  {group.label}
                </p>
              </div>
              <Card variant="surface" padding="none" className="divide-y divide-slate-100">
                {group.txs.map((tx) => {
                  const sent = tx.direction === "sent";
                  const { displayName, maskedWallet } = getCounterpartyDisplay(tx.counterparty);

                  return (
                    <Link
                      key={tx.id}
                      href={`/consumer/history/${tx.id}`}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100"
                    >
                      <div
                        className={cn(
                          "flex size-9 flex-shrink-0 items-center justify-center rounded-xl ring-1",
                          sent
                            ? "bg-slate-50 text-slate-600 ring-slate-200"
                            : "bg-green-50 text-green-600 ring-green-100",
                        )}
                      >
                        {sent ? (
                          <ArrowUpRight className="size-4" aria-hidden="true" />
                        ) : (
                          <ArrowDownLeft className="size-4" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {displayName}
                          </p>
                          <Badge variant={sent ? "outline" : "secondary"} className="shrink-0">
                            {sent ? "Sent" : "Received"}
                          </Badge>
                        </div>
                        <p className="truncate text-[11px] text-slate-400">
                          {maskedWallet} • {formatTransactionDate(tx.created_at)}
                        </p>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <p
                          className={cn(
                            "text-sm font-bold tabular-nums",
                            sent ? "text-slate-700" : "text-green-600",
                          )}
                        >
                          {sent ? "−" : "+"}
                          {formatBalance(tx.amount_xlm)}
                        </p>
                        <ChevronRight className="size-4 text-slate-300" aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
