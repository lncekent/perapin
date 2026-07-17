"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, Store, ShieldAlert, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import { MerchantAccount } from "@/lib/types";

export default function MerchantRegisterPage() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  
  // App flow states
  const [step, setStep] = useState<"form" | "creating">("form");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Owner name is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!businessName.trim()) {
      setError("Business Name is required.");
      return;
    }

    setError("");
    setStep("creating");
    
    mockStorage.logToInspector(
      "info",
      "Stellar Merchant Wallet",
      `Creating Stellar account for merchant business [${businessName}] owned by ${name}.`
    );

    setTimeout(() => {
      // Create new merchant
      const randomId = Math.floor(10 + Math.random() * 89);
      const merchantId = `PP-MERCH-${randomId}`;

      // Generate simulated key
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
      let simulatedPubKey = "GBMERCHANT";
      for (let i = 0; i < 46; i++) {
        simulatedPubKey += chars[Math.floor(Math.random() * chars.length)];
      }

      const newMerch: MerchantAccount = {
        id: merchantId,
        name: businessName,
        owner: name,
        stellarPublicKey: simulatedPubKey,
        balance: 100.0, // initial simulated balance
      };

      // Add to simulated storage
      const existing = mockStorage.getMerchants();
      // Since demo merchants are hardcoded, we will store custom merchants in localStorage
      const savedMerchants = localStorage.getItem("perapin_custom_merchants");
      const list = savedMerchants ? JSON.parse(savedMerchants) : [];
      list.push(newMerch);
      localStorage.setItem("perapin_custom_merchants", JSON.stringify(list));

      // Save session
      localStorage.setItem("perapin_user_role", "merchant");
      localStorage.setItem("perapin_user_email", email);
      localStorage.setItem("perapin_active_merchant_id", merchantId);

      mockStorage.logToInspector(
        "success",
        "Merchant Registered",
        `Created merchant account ${merchantId} with public key: ${simulatedPubKey.slice(0, 10)}...`
      );

      router.push("/merchant/dashboard");
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 justify-center py-12 px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header */}
        <div className=" space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Register as Merchant
          </h2>
          <p className="text-sm text-slate-500">
            Accept PeraPin static passes at your business
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md"
        >
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 font-medium">
              <ShieldAlert className="w-4 h-4 text-red-650 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Business / Store Name
                  </label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Aling Nena's Sari-Sari Store"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Owner Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Elena Santos"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. nena@gmail.com"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-98"
                >
                  Create Merchant Account
                </button>
              </form>
            ) : (
              <div className="py-12 flex flex-col items-center space-y-6 text-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest block animate-pulse">
                    Soroban Execution Live
                  </span>
                  <h3 className="text-lg font-bold text-slate-850">Creating Merchant Wallet</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-normal">
                    Setting up your store's Stellar wallet keypair on testnet and establishing secure database indexing...
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
