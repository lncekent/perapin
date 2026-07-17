"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Wallet, Landmark, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import { CustomerAccount, Transaction } from "@/lib/types";

export default function ConsumerTopupPage() {
  const [activeCustomer, setActiveCustomer] = useState<CustomerAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const customer = mockStorage.getActiveCustomer();
    if (customer) {
      setActiveCustomer(customer);
    }
  }, []);

  const handleFaucetTopup = () => {
    if (!activeCustomer) return;
    setLoading(true);
    setSuccessMsg("");

    mockStorage.logToInspector(
      "blockchain",
      "Stellar Horizon Call",
      `Querying testnet Friendbot faucet for public key: ${activeCustomer.stellarPublicKey}`
    );

    setTimeout(() => {
      // Update customer balance in storage
      const customers = mockStorage.getCustomers();
      const updated = customers.map((c) => {
        if (c.customerId === activeCustomer.customerId) {
          const newBal = c.balance + 500.00;
          return { ...c, balance: newBal };
        }
        return c;
      });
      mockStorage.saveCustomers(updated);

      // Record a new transaction
      const newTx: Transaction = {
        id: `tx_topup_${Date.now()}`,
        type: "signup_bonus", // Treated as incoming deposit
        amount: 500.00,
        partnerName: "Stellar Friendbot Faucet",
        partnerId: "FRIENDBOT",
        timestamp: new Date().toISOString(),
        status: "success",
        ledgerIndex: Math.floor(6421500 + Math.random() * 200),
        txHash: "0x" + Math.random().toString(16).slice(2) + "faucet",
      };

      const allTxs = mockStorage.getTransactions();
      mockStorage.saveTransactions([newTx, ...allTxs]);

      // Update active customer state
      setActiveCustomer({
        ...activeCustomer,
        balance: activeCustomer.balance + 500.00,
      });

      mockStorage.logToInspector(
        "success",
        "Faucet Funding Success",
        `Received 500.00 testnet tokens. New balance: ₱${(activeCustomer.balance + 500.00).toFixed(2)}`
      );

      setLoading(false);
      setSuccessMsg("₱500.00 loaded from Stellar Testnet Friendbot!");
    }, 1200);
  };

  if (!activeCustomer) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading customer data...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4 max-w-sm mx-auto"
    >
      <div className="flex flex-col items-center text-center">
        <div className="bg-emerald-50 text-emerald-600 p-3 rounded-full mb-3">
          <Wallet className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 font-sans">Top Up Wallet</h2>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">
          Receive XLM tokens into your PeraPin account from other wallets or
          Stellar testnet services.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-2xl flex items-start gap-2 text-xs text-emerald-800 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-650 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Account Address Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 space-y-4">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
            Stellar Public Key
          </span>
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 font-mono text-[10px] break-all text-slate-600 select-all leading-normal">
            {activeCustomer.stellarPublicKey}
          </div>
          <span className="text-[9px] text-slate-400 mt-1 block">
            📋 Double-tap inside the box to copy your public address.
          </span>
        </div>
      </div>

      {/* Faucet action */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-3xl p-5 space-y-4 text-center">
        <div className="space-y-1.5">
          <Landmark className="w-6 h-6 text-blue-650 mx-auto" />
          <h4 className="font-bold text-sm text-slate-800">Testnet Friendbot Faucet</h4>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xs mx-auto">
            Since we are on Stellar Testnet, you can fund your wallet with test tokens for free to simulate payments.
          </p>
        </div>

        <button
          onClick={handleFaucetTopup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-98 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Fetching from Testnet...</span>
            </>
          ) : (
            <span>Load ₱500.00 Testnet XLM</span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
