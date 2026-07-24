"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { computePinHash } from "@/lib/client-crypto";

export default function ConsumerRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"email" | "token" | "pin">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function send(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, createUser: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStep("token");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send code.");
    } finally {
      setLoading(false);
    }
  }
  async function verify(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const profile = await fetch("/api/user/me");
      if (profile.ok) {
        const profileData = await profile.json();
        router.replace(
          profileData.user.role === "merchant" ? "/merchant/dashboard" : "/consumer/dashboard",
        );
        return;
      }
      const setup = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "consumer" }),
      });
      const setupData = await setup.json();
      if (!setup.ok) throw new Error(setupData.error || "Unable to create wallet.");
      sessionStorage.setItem("perapin_setup_public_key", setupData.user.stellarPublicKey);
      setStep("pin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify code.");
    } finally {
      setLoading(false);
    }
  }
  async function complete(event: FormEvent) {
    event.preventDefault();
    if (pin !== confirmPin) return setError("PIN entries do not match.");
    setLoading(true);
    setError("");
    try {
      const publicKey = sessionStorage.getItem("perapin_setup_public_key");
      if (!publicKey) throw new Error("Wallet setup expired. Please register again.");
      const pinHash = await computePinHash(pin, publicKey);
      const response = await fetch("/api/user/register/pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinHash }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      sessionStorage.removeItem("perapin_setup_public_key");
      router.replace("/consumer/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to register PIN.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
        <div>
          <Link href="/" className="text-sm text-blue-700">
            ← Back
          </Link>
          <h1 className="mt-4 text-3xl font-extrabold">Create consumer account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your wallet and PIN hash are secured without sending your raw PIN to PeraPin.
          </p>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {step === "email" && (
          <form onSubmit={send} className="space-y-4">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border p-3 text-base"
            />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white"
            >
              {loading ? "Sending…" : "Send verification code"}
            </button>
          </form>
        )}
        {step === "token" && (
          <form onSubmit={verify} className="space-y-4">
            <input
              required
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit code"
              className="w-full rounded-xl border p-3 text-center text-xl tracking-[0.3em]"
            />
            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white"
            >
              {loading ? "Verifying…" : "Verify and create wallet"}
            </button>
          </form>
        )}
        {step === "pin" && (
          <form onSubmit={complete} className="space-y-4">
            <label className="block text-sm font-semibold">
              Create a 4-digit PIN
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-xl border p-3 text-center text-xl tracking-[0.3em]"
              />
            </label>
            <label className="block text-sm font-semibold">
              Confirm PIN
              <input
                required
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                className="mt-1 w-full rounded-xl border p-3 text-center text-xl tracking-[0.3em]"
              />
            </label>
            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white"
            >
              {loading ? "Registering on Stellar…" : "Finish secure setup"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
