"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Phone, ShieldAlert, KeyRound, CheckCircle2, QrCode, Download, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import QRCode from "qrcode";
import { mockStorage } from "@/lib/services/mockStorage";
import VirtualPinPad from "@/components/shared/VirtualPinPad";
import { CustomerAccount } from "@/lib/types";

export default function ConsumerRegisterPage() {
  const router = useRouter();
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Flow State
  const [step, setStep] = useState<"form" | "pin" | "confirm_pin" | "creating" | "qr">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [kycType, setKycType] = useState("UMID");
  const [kycId, setKycId] = useState("");

  // PIN fields
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  // Result state
  const [newCustomer, setNewCustomer] = useState<CustomerAccount | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  // Step 1: Validate Registration Fields
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      setError("Please enter a valid phone number (min 10 digits).");
      return;
    }
    if (!kycId.trim()) {
      setError("KYC ID Document Number is required.");
      return;
    }

    setError("");
    setStep("pin");
    mockStorage.logToInspector(
      "info",
      "Registration Form Complete",
      `Customer inputs checked. Entering 4-digit PIN setup phase for ${name}.`
    );
  };

  // Step 2: Set PIN
  const handlePinSubmit = (val: string) => {
    setStep("confirm_pin");
  };

  // Step 3: Confirm PIN and Call API
  const handleConfirmPinSubmit = async (val: string) => {
    if (val !== pin) {
      setError("PINs do not match. Please re-enter your PIN.");
      setPin("");
      setConfirmPin("");
      setStep("pin");
      return;
    }

    setError("");
    setStep("creating");
    mockStorage.logToInspector(
      "info",
      "Stellar Ledger Generation",
      `Initiating secure keypair generation and account indexing on Stellar testnet.`
    );

    try {
      // Call mock signup API
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, kycType, kycId }),
      });

      if (!res.ok) {
        throw new Error("Failed to register account via Soroban API.");
      }

      const data = await res.json();

      const newCustAccount: CustomerAccount = {
        customerId: data.customerId,
        name,
        phone,
        kycType,
        kycId,
        pin, // Client-side hashed in production, simulated raw check for mockup
        stellarPublicKey: data.stellarPublicKey,
        balance: data.initialBalance,
        registeredAt: data.timestamp,
      };

      // Add to mock storage
      const customers = mockStorage.getCustomers();
      mockStorage.saveCustomers([...customers, newCustAccount]);

      // Set active customer
      localStorage.setItem("perapin_active_customer_id", newCustAccount.customerId);
      localStorage.setItem("perapin_user_role", "consumer");
      localStorage.setItem("perapin_user_email", phone);
      setNewCustomer(newCustAccount);

      mockStorage.logToInspector(
        "success",
        "Soroban Registration Success",
        `Stellar Account deployed on testnet. Allocated ₱${data.initialBalance} signup bonus. ID: ${data.customerId}`
      );

      setStep("qr");
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
      setStep("form");
    }
  };

  // Step 4: Render QR Sticker once account is ready
  useEffect(() => {
    if (step === "qr" && newCustomer && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        newCustomer.customerId,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: "#0f172a", // Slate 900
            light: "#ffffff", // White
          },
        },
        (err) => {
          if (err) {
            console.error("QR Code rendering error", err);
          } else if (qrCanvasRef.current) {
            const dataUrl = qrCanvasRef.current.toDataURL("image/png");
            setQrDataUrl(dataUrl);
          }
        }
      );
    }
  }, [step, newCustomer]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 justify-center py-12 px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Register as Customer
          </h2>
          <p className="text-sm text-slate-500">
            Generate your permanent, offline payment sticker
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
            {step === "form" && (
              <motion.form
                key="form"
                onSubmit={handleFormSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name (As shown on ID)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maria Dela Cruz"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone / Email
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 09175551234"
                      className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      ID Type
                    </label>
                    <select
                      value={kycType}
                      onChange={(e) => setKycType(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option>UMID</option>
                      <option>Postal ID</option>
                      <option>Driver's License</option>
                      <option>Student ID</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Document No.
                    </label>
                    <input
                      type="text"
                      required
                      value={kycId}
                      onChange={(e) => setKycId(e.target.value)}
                      placeholder="e.g. 8219-B"
                      className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-98"
                >
                  Continue to Set PIN
                </button>
              </motion.form>
            )}

            {step === "pin" && (
              <motion.div
                key="pin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-center"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full text-blue-600 mb-2">
                    <KeyRound className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-800">Set 4-Digit Security PIN</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    You will type this PIN on the merchant's phone to verify and authorize payments. Keep it private.
                  </p>
                </div>

                {/* PIN dots display */}
                <div className="flex justify-center gap-4 py-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        index < pin.length
                          ? "bg-blue-600 border-blue-600 scale-110"
                          : "border-slate-300"
                      }`}
                    />
                  ))}
                </div>

                <VirtualPinPad
                  value={pin}
                  onChange={setPin}
                  onCancel={() => setStep("form")}
                  onSubmit={handlePinSubmit}
                />
              </motion.div>
            )}

            {step === "confirm_pin" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4 text-center"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full text-blue-600 mb-2">
                    <KeyRound className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="font-bold text-slate-800">Confirm Your PIN</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Please re-type your 4-digit PIN to ensure it's correct.
                  </p>
                </div>

                {/* PIN dots display */}
                <div className="flex justify-center gap-4 py-2">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        index < confirmPin.length
                          ? "bg-blue-600 border-blue-600 scale-110"
                          : "border-slate-300"
                      }`}
                    />
                  ))}
                </div>

                <VirtualPinPad
                  value={confirmPin}
                  onChange={setConfirmPin}
                  onCancel={() => {
                    setPin("");
                    setConfirmPin("");
                    setStep("pin");
                  }}
                  onSubmit={handleConfirmPinSubmit}
                />
              </motion.div>
            )}

            {step === "creating" && (
              <motion.div
                key="creating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center space-y-6 text-center"
              >
                <div className="w-16 h-16 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-blue-600 uppercase tracking-widest block animate-pulse">
                    Soroban Execution Live
                  </span>
                  <h3 className="text-lg font-bold text-slate-850">Creating Stellar Wallet</h3>
                  <p className="text-xs text-slate-500 max-w-xs leading-normal">
                    Setting up your custodial account keypair, requesting Friendbot testnet XLM activation, and indexing your PIN on-chain...
                  </p>
                </div>
              </motion.div>
            )}

            {step === "qr" && newCustomer && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                  <h3 className="font-bold text-slate-850">Sticker Generated Successfully!</h3>
                  <p className="text-xs text-slate-500 leading-normal max-w-xs">
                    Print this QR sticker and attach it to your school ID or keychain. You can now make payments without your phone.
                  </p>
                </div>

                {/* QR Code Canvas Sticker Design */}
                <div className="relative inline-block bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
                  <div className="font-bold text-xs tracking-wider uppercase mb-3 opacity-80 text-center font-mono">
                    ₱ PeraPin Payment Pass
                  </div>
                  
                  {/* Invisible canvas used for generation */}
                  <div className="bg-white p-2 rounded-2xl inline-block mb-3">
                    <canvas ref={qrCanvasRef} className="mx-auto" />
                  </div>

                  <div className="text-[10px] font-mono opacity-60 uppercase">
                    ID: {newCustomer.customerId}
                  </div>
                </div>

                {/* CTA Action Buttons */}
                <div className="space-y-3 pt-2">
                  {qrDataUrl && (
                    <a
                      href={qrDataUrl}
                      download={`perapin-sticker-${newCustomer.customerId}.png`}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-98"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download QR Sticker</span>
                    </a>
                  )}

                  <button
                    onClick={() => router.push("/consumer/dashboard")}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-98"
                  >
                    Go to Account Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Support note */}
        <div className="text-center text-[10px] text-slate-400">
          Your private key is secured using AES-256 and will only be decrypted in server memory to sign Soroban smart contract transactions.
        </div>
      </div>
    </div>
  );
}
