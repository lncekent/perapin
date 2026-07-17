"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, ChevronRight, Coins } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import { CustomerAccount } from "@/lib/types";

export default function MerchantAmountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [amount, setAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const scannedId = localStorage.getItem("perapin_scanned_customer_id");
    if (!scannedId) {
      router.push("/merchant/scan");
      return;
    }

    const customers = mockStorage.getCustomers();
    const match = customers.find((c) => c.customerId === scannedId);
    if (match) {
      setCustomer(match);
    } else {
      router.push("/merchant/scan");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg("Amount must be greater than zero.");
      return;
    }
    if (customer && parseFloat(amount) > customer.balance) {
      setErrorMsg(`Insufficient customer balance. Available: ₱${customer.balance.toFixed(2)}`);
      return;
    }

    // Save and continue
    localStorage.setItem("perapin_payment_amount", amount);
    mockStorage.logToInspector(
      "info",
      "Amount Locked",
      `Payment amount of ₱${parseFloat(amount).toFixed(2)} set. Handoff to consumer for PIN authentication.`
    );
    router.push("/merchant/handoff");
  };

  if (!customer) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading scanned customer...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4 max-w-sm mx-auto"
    >
      <div className="text-left">
        <Link
          href="/merchant/scan"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Customer</span>
        </Link>
      </div>

      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-850">Enter Sale Amount</h2>
        <p className="text-xs text-slate-500">
          Enter the checkout price to request from customer sticker
        </p>
      </div>

      {/* Customer Short Info Card */}
      <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200/60 flex items-center gap-3">
        <div className="bg-blue-100 text-blue-600 p-2.5 rounded-2xl">
          <User className="w-5 h-5" />
        </div>
        <div className="text-left flex-1">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block font-mono">
            Scanned Customer
          </span>
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {customer.name}
          </p>
          <span className="text-[10px] text-slate-500 font-mono">
            ID: {customer.customerId}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-slate-400 block font-mono">
            Max Charge:
          </span>
          <span className="text-xs font-mono font-bold text-slate-700">
            ₱{customer.balance.toFixed(2)}
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Amount Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Amount (PHP ₱)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400 font-mono">
              ₱
            </span>
            <input
              type="number"
              step="0.01"
              required
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-4 rounded-2xl border border-slate-200 text-2xl font-bold font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-98 group border border-blue-500"
        >
          <span>Continue to PIN Entry</span>
          <ChevronRight className="w-4 h-4 text-blue-200 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </button>
      </form>
    </motion.div>
  );
}
