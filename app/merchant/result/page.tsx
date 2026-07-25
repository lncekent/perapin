"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { StatusDialog } from "@/components/shared/StatusDialog";

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
      <div className="animate-fade-up py-20 text-center text-sm text-slate-400">
        Payment complete — see your receipt.
      </div>

      <StatusDialog
        open={open}
        onOpenChange={(next) => {
          if (!next) finish();
        }}
        status="success"
        successTitle="Payment settled!"
        successDescription="Confirmed on the Stellar Testnet."
        successActionLabel="Accept another payment"
        onSuccessAction={finish}
      >
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">Received</p>
          <p className="text-3xl font-bold text-slate-900 tabular-nums">
            {Number(receipt.amountXlm).toFixed(2)} <span className="text-lg">XLM</span>
          </p>
          <p className="selectable mt-3 font-mono text-[11px] break-all text-slate-400">
            {receipt.txHash}
          </p>
          <a
            target="_blank"
            rel="noreferrer"
            href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`}
            className="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline"
          >
            View in Stellar Explorer
          </a>
        </div>
        <Link
          href="/merchant/dashboard"
          onClick={() => {
            sessionStorage.removeItem("perapin_recent_receipt");
            sessionStorage.removeItem("perapin_payment_context");
          }}
          className="mt-1 block text-center text-sm font-medium text-slate-500 hover:text-slate-800"
        >
          Back to dashboard
        </Link>
      </StatusDialog>
    </>
  );
}
