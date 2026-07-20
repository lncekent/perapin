"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeyRound, AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import VirtualPinPad from "@/components/shared/VirtualPinPad";
import { CustomerAccount, MerchantAccount, Transaction } from "@/lib/types";

export default function MerchantHandoffPage() {
  const router = useRouter();

  // Entities
  const [customer, setCustomer] = useState<CustomerAccount | null>(null);
  const [merchant, setMerchant] = useState<MerchantAccount | null>(null);
  const [amount, setAmount] = useState<number>(0);

  // States
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"pin" | "processing" | "error">("pin");
  const [errorMsg, setErrorMsg] = useState("");
  const [processingStage, setProcessingStage] = useState("");
  const [timeLeft, setTimeLeft] = useState(60); // 60s security countdown

  useEffect(() => {
    const scannedId = localStorage.getItem("perapin_scanned_customer_id");
    const paymentAmount = localStorage.getItem("perapin_payment_amount");
    const activeMerchId = localStorage.getItem("perapin_active_merchant_id");

    if (!scannedId || !paymentAmount) {
      router.push("/merchant/scan");
      return;
    }

    const customers = mockStorage.getCustomers();
    const customerMatch = customers.find((c) => c.customerId === scannedId);

    const merchants = mockStorage.getMerchants();
    const customList = localStorage.getItem("perapin_custom_merchants");
    const parsedCustom = customList ? JSON.parse(customList) : [];
    const merchantMatch = parsedCustom.find((m: MerchantAccount) => m.id === activeMerchId) || merchants[0];

    if (customerMatch && merchantMatch) {
      setCustomer(customerMatch);
      setMerchant(merchantMatch);
      setAmount(parseFloat(paymentAmount));
    } else {
      router.push("/merchant/scan");
    }
  }, [router]);

  // Security Countdown
  useEffect(() => {
    if (step !== "pin" || timeLeft <= 0) return;
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, step]);

  useEffect(() => {
    if (timeLeft === 0 && step === "pin") {
      setErrorMsg("Session expired for security. Please restart scan.");
      setStep("error");
      mockStorage.logToInspector(
        "warning",
        "Payment Session Timeout",
        "PIN entry session timed out after 60 seconds."
      );
    }
  }, [timeLeft, step]);

  // Execute payment flow
  const handlePinSubmit = async (submittedPin: string) => {
    if (!customer || !merchant) return;

    setStep("processing");
    setProcessingStage("Computing client-side SHA-256 PIN hash...");
    mockStorage.logToInspector(
      "info",
      "Payment Authorized",
      "PIN entered. Commencing on-chain cryptographic settlement pipeline."
    );

    try {
      // 1. Compute Client-side SHA-256 Hash using native Web Crypto API
      const { computePinHash } = await import("@/lib/client-crypto");
      
      const consumerPublicKey = customer.stellarPublicKey || customer.customerId;
      const merchantPublicKey = merchant.id.startsWith("G") ? merchant.id : "GDGARS7VJIWEW3E4ODPXJY53SLEFV3CWBVEMEOO7X6HH5E4BWQZVYR7W";
      const salt = localStorage.getItem("perapin_user_email") || consumerPublicKey;
      const clientHash = await computePinHash(submittedPin, salt);

      mockStorage.logToInspector(
        "blockchain",
        "Client-Side PIN Hash Computed",
        `Web Crypto API SHA-256 Hash: ${clientHash}\n(Raw PIN never leaves the merchant browser!)`
      );

      setProcessingStage("Submitting transaction payload to Soroban Testnet...");

      // 2. Call live PeraPin Payment Initiation API
      const payRes = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerPublicKey,
          merchantPublicKey,
          amountXlm: amount,
          pinHash: clientHash,
        }),
      });

      const payData = await payRes.json();

      if (!payRes.ok || !payData.success) {
        if (payData.error === "WALLET_LOCKED" || payRes.status === 423) {
          throw new Error("WALLET_LOCKED");
        }
        if (payData.error === "INVALID_PIN" || payData.message?.includes("PIN")) {
          throw new Error("INVALID_PIN");
        }
        throw new Error(payData.message || payData.error || "Transaction settlement failed.");
      }

      setProcessingStage("Committing ledger changes on Stellar Testnet...");

      // 3. Update customer local cache
      const customers = mockStorage.getCustomers();
      const updatedCustomers = customers.map((c) => {
        if (c.customerId === customer.customerId) {
          return { ...c, balance: Math.max(0, c.balance - amount) };
        }
        return c;
      });
      mockStorage.saveCustomers(updatedCustomers);

      // Save transaction record to local history
      const newTx: Transaction = {
        id: payData.txHash || `tx_${Date.now()}`,
        type: "payment",
        amount,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        partnerName: customer.name,
        partnerId: customer.customerId,
        status: "success",
        ledgerIndex: 0,
        txHash: payData.txHash || "",
      };

      const allTxs = mockStorage.getTransactions();
      mockStorage.saveTransactions([newTx, ...allTxs]);
      localStorage.setItem("perapin_last_transaction", JSON.stringify(newTx));

      mockStorage.logToInspector(
        "success",
        "Soroban Transaction Settled",
        `Ledger tx: ${payData.txHash || "confirmed"}. Transferred ${amount} XLM from ${customer.name} to ${merchant.name}.`
      );

      // Redirect to results screen
      router.push("/merchant/result");
    } catch (err: any) {
      console.error(err);
      let errMsg = "Stellar Horizon node timed out. Please try again.";
      if (err.message === "WALLET_LOCKED") {
        errMsg = "WALLET_LOCKED: Wallet is locked out for 15 minutes due to 3 failed PIN attempts.";
      } else if (err.message === "INVALID_PIN") {
        errMsg = "Authentication failed: Invalid PIN code.";
      } else if (err.message) {
        errMsg = err.message;
      }
      setErrorMsg(errMsg);
      setStep("error");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 text-white z-50 flex flex-col justify-between py-8 px-6 font-sans">
      <AnimatePresence mode="wait">
        {step === "pin" && (
          <motion.div
            key="pin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col justify-between"
          >
            {/* Header info */}
            <div className="text-center space-y-2 mt-4">
              <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 py-1 px-3 rounded-full font-mono font-medium inline-block">
                🔒 Secure PIN Handoff Window ({timeLeft}s)
              </span>
              <h2 className="text-xl font-bold">Customer Entry PIN</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Merchant: Please hand your phone to the customer. <br />
                Customer: Type your 4-digit PIN to pay <span className="font-bold text-white">₱{amount.toFixed(2)}</span>.
              </p>
            </div>

            {/* PIN indicators */}
            <div className="flex justify-center gap-5 py-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    index < pin.length
                      ? "bg-blue-500 border-blue-500 scale-110 shadow-lg"
                      : "border-slate-700 bg-slate-800/40"
                  }`}
                />
              ))}
            </div>

            {/* Keypad */}
            <VirtualPinPad
              value={pin}
              onChange={setPin}
              onCancel={() => router.push("/merchant/amount")}
              onSubmit={handlePinSubmit}
            />

            {/* Shield warning footer */}
            <div className="text-center text-[10px] text-slate-500 max-w-xs mx-auto leading-normal">
              PIN is encrypted client-side using SHA-256 before transmission.
              The merchant never sees your PIN.
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col justify-center items-center space-y-6 text-center"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/10 border-t-blue-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-mono text-blue-400 text-xs font-bold">
                Pass
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block animate-pulse">
                Stellar testnet ledger validation
              </span>
              <h3 className="text-lg font-bold">Processing Soroban Payment</h3>
              <p className="text-xs text-slate-400 max-w-xs font-mono">
                {processingStage}
              </p>
            </div>
          </motion.div>
        )}

        {step === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col justify-center items-center space-y-6 text-center max-w-xs mx-auto"
          >
            <div className="p-4 bg-red-500/10 text-red-500 rounded-full border border-red-500/20">
              <AlertCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-red-400">Payment Rejected</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {errorMsg}
              </p>
            </div>

            <div className="space-y-2.5 w-full pt-4">
              <button
                onClick={() => {
                  setPin("");
                  setStep("pin");
                  setTimeLeft(60);
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/merchant/amount")}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Back to Amount Entry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
