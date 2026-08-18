"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { StatusDialog } from "@/components/shared/StatusDialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Clock, Shield } from "lucide-react";
import { formatBalance } from "@/lib/utils";

interface Receipt {
  txHash: string;
  amountXlm: number;
  consumerPublicKey: string;
  timestamp: string;
}

export default function MerchantResultPage() {
  const router = useRouter();
  const receipt = useSessionStorageValue<Receipt>("perapin_recent_receipt");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!receipt) router.replace("/merchant/scan");
  }, [receipt, router]);

  if (!receipt) return <p className="py-12 text-center text-slate-500">Loading receipt…</p>;

  function finish() {
    sessionStorage.removeItem("perapin_recent_receipt");
    sessionStorage.removeItem("perapin_payment_context");
    setOpen(false);
    router.replace("/merchant/scan");
  }

  const truncatedHash = receipt.txHash
    ? `${receipt.txHash.slice(0, 8)}…${receipt.txHash.slice(-8)}`
    : "";
  const truncatedWallet = receipt.consumerPublicKey
    ? `${receipt.consumerPublicKey.slice(0, 6)}…${receipt.consumerPublicKey.slice(-6)}`
    : "";

  return (
    <>
      <div className="animate-fade-up flex flex-col items-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 ring-1 ring-green-200">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Payment Settled!</h1>
        <p className="mt-1 text-sm text-slate-500">Transaction confirmed on the Stellar Testnet.</p>
      </div>

      <StatusDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) finish();
        }}
        status="success"
        successTitle="Payment settled!"
        successDescription="Funds have been transferred on the Stellar Testnet."
        successActionLabel="Accept another payment"
        onSuccessAction={finish}
      >
        {/* Compact receipt */}
        <div className="space-y-4">
          {/* Amount — hero element */}
          <div className="text-center">
            <p className="text-xs font-medium text-slate-500">Amount received</p>
            <p className="mt-1 text-4xl font-bold text-slate-900 tabular-nums">
              {formatBalance(receipt.amountXlm)}{" "}
              <span className="text-lg font-semibold text-slate-500">XLM</span>
            </p>
          </div>

          {/* Compact details */}
          <div className="space-y-2 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <Badge variant="secondary" className="bg-green-50 text-green-700 ring-green-200">
                Confirmed
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Time</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Clock className="size-3" aria-hidden="true" />
                {receipt.timestamp ? new Date(receipt.timestamp).toLocaleTimeString() : "Just now"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Consumer</span>
              <span className="font-mono text-[11px] font-medium text-slate-700">
                {truncatedWallet}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Security</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Shield className="size-3" aria-hidden="true" />
                On-chain verified
              </span>
            </div>
          </div>

          {/* Explorer link — compact inline */}
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`}
            className="text-brand-700 flex items-center justify-center gap-1.5 text-xs font-semibold hover:underline"
          >
            View on Stellar Explorer
            <ExternalLink className="size-3" aria-hidden="true" />
          </a>
        </div>

        {/* Back to dashboard */}
        <Link
          href="/merchant/dashboard"
          onClick={() => {
            sessionStorage.removeItem("perapin_recent_receipt");
            sessionStorage.removeItem("perapin_payment_context");
          }}
          className="mt-2 block text-center text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Back to dashboard
        </Link>
      </StatusDialog>
    </>
  );
}
