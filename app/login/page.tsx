"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Mail, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      // Generate a mock 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setStep("otp");
      setLoading(false);

      // Log to Soroban/Dev console so the developer knows the code!
      mockStorage.logToInspector(
        "info",
        "OTP Generated (Simulation)",
        `A temporary login code of [${code}] was dispatched to ${email}.`,
        { email, otpCode: code }
      );
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== generatedOtp && otp !== "123456") {
      setError("Invalid verification code. Please check the Dev Console or try again.");
      return;
    }

    setLoading(true);
    setError("");

    setTimeout(() => {
      // Find the user role by checking registered customers
      const customers = mockStorage.getCustomers();
      const customerUser = customers.find(
        (c) => c.phone === email || c.kycId === email || c.name.toLowerCase() === email.toLowerCase() || email.includes("student") || email.includes("customer")
      );

      // Simple mock logic for demonstration:
      // If email has "merchant" or matches a demo merchant name, redirect to merchant.
      const isMerchant = email.toLowerCase().includes("merchant") || email.includes("nena") || email.includes("berto") || email.includes("tomas");

      setLoading(false);
      
      if (isMerchant) {
        // Save mock session
        localStorage.setItem("perapin_user_role", "merchant");
        localStorage.setItem("perapin_user_email", email);
        mockStorage.logToInspector(
          "success",
          "Merchant Login Success",
          `Logged in successfully as merchant: ${email}. Redirecting to /merchant/dashboard.`
        );
        router.push("/merchant/dashboard");
      } else {
        // Save mock session
        localStorage.setItem("perapin_user_role", "consumer");
        localStorage.setItem("perapin_user_email", email);
        
        // Pick an active customer matching this
        const activeCust = customerUser || customers[0];
        if (activeCust) {
          localStorage.setItem("perapin_active_customer_id", activeCust.customerId);
        }

        mockStorage.logToInspector(
          "success",
          "Customer Login Success",
          `Logged in successfully as customer: ${email}. Redirecting to /consumer/dashboard.`
        );
        router.push("/consumer/dashboard");
      }
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 justify-center py-12 px-6">
      <div className="max-w-md w-full mx-auto space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Welcome to PeraPin
          </h2>
          <p className="text-sm text-slate-500">
            Sign in securely using email verification code
          </p>
        </div>

        {/* Card wrapper */}
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

          {step === "email" ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. maria@student.edu.ph"
                    className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 leading-normal block">
                  💡 Hint: Enter <span className="font-semibold">customer@test.com</span> for customer view, or <span className="font-semibold">merchant@test.com</span> for merchant view.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? "Requesting code..." : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-full text-blue-600 mb-2">
                  <KeyRound className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-bold text-slate-800">Enter Verification Code</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We simulated sending a 6-digit code to <br />
                  <span className="font-semibold text-slate-800">{email}</span>.
                </p>
                <div className="text-[11px] bg-blue-50 text-blue-800 p-2 rounded-lg font-mono mt-1 border border-blue-100">
                  Dev Tip: Check the <span className="font-bold">Soroban Console</span> button in the bottom right for the code! Or use bypass <span className="font-bold">123456</span>.
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="0 0 0 0 0 0"
                  className="w-full text-center tracking-widest py-3 rounded-xl border border-slate-200 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Change Email Address
              </button>
            </form>
          )}
        </motion.div>

        {/* Signup CTAs */}
        <div className="text-center text-xs text-slate-500">
          {"Don't have an account? "}
          <div className="mt-2 flex justify-center gap-4 font-semibold text-blue-600">
            <Link href="/register/consumer" className="hover:underline">
              Register as Customer
            </Link>
            <span>•</span>
            <Link href="/register/merchant" className="hover:underline">
              Register as Merchant
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
