"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { StatusDialog } from "@/components/shared/StatusDialog";
import { Card } from "@/components/ui/card";
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
        {/* Receipt card */}
        <Card variant="surface" padding="md" className="space-y-4">
          {/* Amount */}
          <div className="text-center">
            <p className="text-xs font-medium text-slate-500">Amount received</p>
            <p className="mt-1 text-4xl font-bold text-slate-900 tabular-nums">
              {formatBalance(receipt.amountXlm)}{" "}
              <span className="text-lg font-semibold text-slate-500">XLM</span>
            </p>
          </div>

          {/* Details grid */}
          <div className="space-y-2 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Status</span>
              <Badge variant="secondary" className="bg-green-50 text-green-700 ring-green-200">
                Confirmed
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Network</span>
              <span className="font-medium text-slate-700">Stellar Testnet</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Time</span>
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Clock className="size-3" aria-hidden="true" />
                {receipt.timestamp ? new Date(receipt.timestamp).toLocaleTimeString() : "Just now"}
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

          {/* Tx hash */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500">Transaction hash</p>
            <p className="selectable rounded-lg bg-slate-50 p-2 font-mono text-[10px] break-all text-slate-600">
              {receipt.txHash}
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`}
              className="text-brand-700 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              View in Stellar Explorer
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          </div>

          {/* Consumer */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-slate-500">Consumer wallet</p>
            <p className="selectable rounded-lg bg-slate-50 p-2 font-mono text-[10px] break-all text-slate-600">
              {receipt.consumerPublicKey}
            </p>
          </div>
        </Card>

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
