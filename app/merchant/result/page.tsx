"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
interface Receipt {
  txHash: string;
  amountXlm: number;
  consumerPublicKey: string;
  timestamp: string;
}
export default function MerchantResultPage() {
  const router = useRouter();
  const receipt = useSessionStorageValue<Receipt>("perapin_recent_receipt");
  useEffect(() => {
    if (!receipt) router.replace("/merchant/scan");
  }, [receipt, router]);
  if (!receipt) return <p className="py-12 text-center">Loading receipt…</p>;
  function finish() {
    sessionStorage.removeItem("perapin_recent_receipt");
    sessionStorage.removeItem("perapin_payment_context");
    router.replace("/merchant/scan");
  }
  return (
    <div className="space-y-5 text-center">
      <div>
        <p className="text-5xl">✓</p>
        <h1 className="mt-2 text-2xl font-bold">Payment settled</h1>
        <p className="text-sm text-slate-500">Confirmed on Stellar Testnet.</p>
      </div>
      <section className="rounded-3xl border bg-white p-5 text-left">
        <p className="text-sm text-slate-500">Received</p>
        <p className="text-3xl font-bold">{Number(receipt.amountXlm).toFixed(2)} XLM</p>
        <p className="mt-4 font-mono text-xs break-all text-slate-500">{receipt.txHash}</p>
        <a
          className="mt-3 block text-sm font-semibold text-blue-700"
          target="_blank"
          rel="noreferrer"
          href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`}
        >
          View in Stellar Explorer
        </a>
      </section>
      <button onClick={finish} className="w-full rounded-2xl bg-blue-600 p-4 font-bold text-white">
        Accept another payment
      </button>
      <Link href="/merchant/dashboard" className="block text-sm text-slate-600">
        Back to dashboard
      </Link>
    </div>
  );
}
