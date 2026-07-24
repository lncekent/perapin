"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"form" | "token">("form");
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
      const verified = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const verifiedData = await verified.json();
      if (!verified.ok) throw new Error(verifiedData.error);
      const profile = await fetch("/api/user/me");
      if (profile.ok) {
        const data = await profile.json();
        router.replace(
          data.user.role === "merchant" ? "/merchant/dashboard" : "/consumer/dashboard",
        );
        return;
      }
      const registered = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "merchant", businessName }),
      });
      const data = await registered.json();
      if (!registered.ok) throw new Error(data.error || "Unable to create merchant wallet.");
      router.replace("/merchant/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify code.");
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
          <h1 className="mt-4 text-3xl font-extrabold">Create merchant account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Receive real Testnet XLM payments with your PeraPin wallet.
          </p>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {step === "form" ? (
          <form onSubmit={send} className="space-y-4">
            <input
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Business name"
              className="w-full rounded-xl border p-3 text-base"
            />
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
        ) : (
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
              {loading ? "Creating wallet…" : "Verify and create merchant wallet"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
