"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Download, Receipt, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";

interface ReceiptDetails {
  success: boolean;
  txId: string;
  ledgerSequence: number;
  amount: number;
  customerName: string;
  customerId: string;
  stellarFeeXlm: string;
}

export default function MerchantResultPage() {
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("perapin_recent_receipt");
    if (data) {
      setReceipt(JSON.parse(data));
    } else {
      router.push("/merchant/scan");
    }
  }, [router]);

  const handleFinish = () => {
    localStorage.removeItem("perapin_recent_receipt");
    localStorage.removeItem("perapin_scanned_customer_id");
    localStorage.removeItem("perapin_payment_amount");
    router.push("/merchant/scan");
  };

  if (!receipt) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading receipt details...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 py-4 max-w-sm mx-auto text-center"
    >
      <div className="flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-850">Payment Settled</h2>
        <p className="text-xs text-slate-500">
          Soroban smart contract executed transfer successfully
        </p>
      </div>

      {/* Virtual Receipt Ticket Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-md text-left relative overflow-hidden">
        {/* Receipt aesthetic dots */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-blue-600" />

        <div className="flex justify-between items-center pb-4 border-b border-slate-100 mt-2">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              On-Chain Receipt
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Ledger Index: #{receipt.ledgerSequence}
          </span>
        </div>

        <div className="py-4 space-y-3.5 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Charged Customer:</span>
            <span className="font-bold text-slate-800">{receipt.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Customer ID:</span>
            <span className="font-mono text-slate-750 font-bold">
              {receipt.customerId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Transaction ID:</span>
            <span className="font-mono text-slate-500 text-[10px] break-all">
              {receipt.txId}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3">
            <span className="text-slate-400">Stellar gas fee:</span>
            <span className="font-mono text-slate-500">
              {receipt.stellarFeeXlm} XLM
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100 pt-3">
            <span className="text-sm font-bold text-slate-800">Total Transferred:</span>
            <span className="text-xl font-bold font-mono text-emerald-600">
              ₱{receipt.amount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <button
          onClick={handleFinish}
          className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md group border border-blue-500"
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">Accept Another Payment</span>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-200 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </button>

        <button
          onClick={() => router.push("/merchant/dashboard")}
          className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-98"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-center gap-1">
        <span>Verified on Stellar Testnet</span>
        <ExternalLink className="w-3 h-3" />
      </div>
    </motion.div>
  );
}
