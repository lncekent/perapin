"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, ChevronRight, History, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import { MerchantAccount, Transaction } from "@/lib/types";

export default function MerchantDashboard() {
  const [activeMerchant, setActiveMerchant] = useState<MerchantAccount | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    const activeId = localStorage.getItem("perapin_active_merchant_id");
    const customList = localStorage.getItem("perapin_custom_merchants");
    const parsedCustom = customList ? JSON.parse(customList) : [];
    
    const match = parsedCustom.find((m: MerchantAccount) => m.id === activeId) || mockStorage.getMerchants()[0];
    if (match) {
      setActiveMerchant(match);

      // Load & filter payments received by this merchant
      const allTxs = mockStorage.getTransactions();
      const filtered = allTxs.filter(
        (tx) =>
          tx.partnerId === match.id || 
          tx.partnerName.toLowerCase().includes(match.name.toLowerCase()) || 
          tx.type === "receive" // simple mockup fallback
      );
      setTxs(filtered);
    }
  }, []);

  if (!activeMerchant) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading merchant profile...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4"
    >
      {/* Merchant Balance Card */}
      <div
        className="bg-white border border-slate-200 shadow-md rounded-3xl p-5 flex flex-col justify-between space-y-4"
        id="merchant-balance-card"
      >
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
              Store Sales Balance
            </span>
            <h2 className="text-3xl font-bold font-mono text-slate-800 tracking-tight">
              ₱{activeMerchant.balance.toFixed(2)}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded font-mono font-medium">
              Stellar Merchant Wallet
            </span>
          </div>
        </div>

        <div
          className="border-t border-slate-100 pt-3 flex justify-between items-center text-[11px]"
          id="merchant-metadata"
        >
          <div>
            <span className="text-slate-400">Owner:</span>
            <p className="text-slate-800 font-bold">{activeMerchant.owner}</p>
          </div>
          <div>
            <span className="text-slate-400 text-right block font-sans">
              Merchant ID:
            </span>
            <p className="text-slate-800 font-mono font-bold">{activeMerchant.id}</p>
          </div>
        </div>
      </div>

      {/* Accept Payment CTA Button */}
      <Link
        href="/merchant/scan"
        className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md group border border-blue-500"
        id="btn-merchant-scan"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 text-white p-2.5 rounded-xl">
            <Camera className="w-6 h-6 animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold text-white">Accept Payment Pass</p>
            <p className="text-xs text-blue-100 leading-normal">
              Scan consumer QR code sticker to collect funds
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-blue-200 group-hover:text-white transition-colors" />
      </Link>

      {/* Payments Received History */}
      <div className="space-y-3 flex flex-col" id="merchant-payments-received">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <History className="w-4 h-4 text-blue-600" />
            Recent Incoming Payments
          </h3>
          <span className="text-[9px] text-slate-400 font-mono">
            On-Chain Ledger
          </span>
        </div>

        {txs.length === 0 ? (
          <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
            No payments received yet. Tap "Accept Payment Pass" above to start.
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[280px]" id="tx-log-scroll">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">
                      From User ID: {tx.partnerId.slice(0, 12)}...
                    </p>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {new Date(tx.timestamp).toLocaleString("en-US", {
                        hour12: false,
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-bold text-emerald-650">
                    +₱{tx.amount.toFixed(2)}
                  </p>
                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1 py-0.2 rounded font-mono font-bold">
                    {tx.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
