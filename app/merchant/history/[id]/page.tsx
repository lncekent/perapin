"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Archive,
  ArchiveRestore,
  Copy,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { formatBalance, copyToClipboard } from "@/lib/utils";
import { getCounterpartyDisplay, formatTransactionDate, maskWallet } from "@/lib/mask";
import { toast } from "@/components/ui/toast";

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

export default function MerchantHistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const txId = params.id as string;

  const [copiedWallet, setCopiedWallet] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [archivedIds, setArchivedIdsState] = useState<string[]>(() => getArchivedIds());

  const { data: txData } = useCachedFetch<{ transactions: Tx[] }>("transactions", async () => {
    const r = await fetch("/api/transactions");
    return r.json();
  });

  const tx = txData?.transactions?.find((t) => t.id === txId);
  const isArchived = archivedIds.includes(txId);

  function toggleArchive() {
    if (isArchived) {
      const updated = archivedIds.filter((id) => id !== txId);
      setArchivedIdsState(updated);
      setArchivedIds(updated);
      toast.add({
        title: "Transaction restored",
        description: "Moved back to your active payments.",
        type: "success",
      });
    } else {
      const updated = [...archivedIds, txId];
      setArchivedIdsState(updated);
      setArchivedIds(updated);
      toast.add({
        title: "Transaction archived",
        description: "You can find it in the Archived tab.",
        type: "success",
      });
    }
  }

  async function handleCopyWallet() {
    if (!tx) return;
    await copyToClipboard(tx.counterparty.wallet);
    setCopiedWallet(true);
    toast.add({ title: "Copied", description: "Wallet address copied.", type: "success" });
    setTimeout(() => setCopiedWallet(false), 2000);
  }

  async function handleCopyHash() {
    if (!tx) return;
    await copyToClipboard(tx.stellar_tx_hash);
    setCopiedHash(true);
    toast.add({ title: "Copied", description: "Transaction hash copied.", type: "success" });
    setTimeout(() => setCopiedHash(false), 2000);
  }

  // Loading state
  if (!txData) {
    return (
      <div className="animate-fade-up space-y-4">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-48 animate-pulse rounded-3xl bg-slate-200" />
        <div className="h-32 animate-pulse rounded-3xl bg-slate-200" />
      </div>
    );
  }

  // Not found
  if (!tx) {
    return (
      <div className="animate-fade-up space-y-4">
        <button
          onClick={() => router.push("/merchant/history")}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft className="size-4" /> Back to History
        </button>
        <Card variant="ghost" padding="lg" className="text-center">
          <p className="font-semibold text-slate-700">Transaction not found</p>
          <p className="mt-1 text-sm text-slate-400">
            This transaction may have been removed or doesn&apos;t exist.
          </p>
        </Card>
      </div>
    );
  }

  const { displayName, maskedWallet } = getCounterpartyDisplay(tx.counterparty);
  const formattedDate = formatTransactionDate(tx.created_at);
  const formattedAmount = formatBalance(tx.amount_xlm);

  return (
    <div className="animate-fade-up space-y-5">
      {/* Back Button */}
      <button
        onClick={() => router.push("/merchant/history")}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
      >
        <ArrowLeft className="size-4" /> Back to History
      </button>

      {/* Success Header */}
      <div className="flex flex-col items-center pt-2 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-green-50 text-green-600 ring-4 ring-green-100/50">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>
        <p className="mt-3 text-lg font-bold text-slate-900">Payment Received</p>
        <p className="mt-1 text-3xl font-bold text-green-600 tabular-nums">
          +{formattedAmount} XLM
        </p>
      </div>

      {/* GCash-style paragraph receipt */}
      <Card variant="surface" padding="md">
        <p className="text-sm leading-relaxed text-slate-700">
          You have received{" "}
          <span className="font-bold text-slate-900">{formattedAmount} XLM</span> from{" "}
          <span className="font-bold text-slate-900">{displayName}</span> on{" "}
          <span className="font-medium text-slate-800">{formattedDate}</span>.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Sender wallet:{" "}
          <span className="font-mono text-xs font-medium text-slate-600">{maskedWallet}</span>
          <button
            onClick={handleCopyWallet}
            className="ml-1.5 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {copiedWallet ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
            {copiedWallet ? "Copied" : "Copy"}
          </button>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Transaction hash:{" "}
          <span className="font-mono text-xs font-medium text-slate-600">
            {tx.stellar_tx_hash.slice(0, 10)}…{tx.stellar_tx_hash.slice(-6)}
          </span>
          <button
            onClick={handleCopyHash}
            className="ml-1.5 inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {copiedHash ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
            {copiedHash ? "Copied" : "Copy"}
          </button>
        </p>
      </Card>

      {/* View on Explorer */}
      <a
        href={`https://stellar.expert/explorer/testnet/tx/${tx.stellar_tx_hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-800"
      >
        <ExternalLink className="size-4" />
        View on Stellar Explorer
      </a>

      {/* Archive / Restore Button */}
      <div className="flex justify-center pb-4">
        <button
          onClick={toggleArchive}
          className={
            isArchived
              ? "text-brand-600 hover:text-brand-700 flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-colors hover:bg-green-50"
              : "flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          }
        >
          {isArchived ? (
            <>
              <ArchiveRestore className="size-4" />
              Restore from Archive
            </>
          ) : (
            <>
              <Archive className="size-4" />
              Archive this transaction
            </>
          )}
        </button>
      </div>
    </div>
  );
}
