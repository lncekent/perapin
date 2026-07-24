"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, createUser: false }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send code.");
      setStep("token");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
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
      if (!response.ok) throw new Error(data.error || "Unable to verify code.");
      const profileResponse = await fetch("/api/user/me");
      const profile = await profileResponse.json();
      if (!profileResponse.ok || !profile.user)
        throw new Error("No PeraPin account exists for this email. Register first.");
      router.replace(
        profile.user.role === "merchant" ? "/merchant/dashboard" : "/consumer/dashboard",
      );
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
          <h1 className="mt-4 text-3xl font-extrabold">Sign in to PeraPin</h1>
          <p className="mt-2 text-sm text-slate-500">Use the one-time code sent to your email.</p>
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {step === "email" ? (
          <form onSubmit={requestOtp} className="space-y-4">
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
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send verification code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <p className="text-sm text-slate-500">Code sent to {email}</p>
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
              className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white disabled:opacity-50"
            >
              {loading ? "Verifying…" : "Verify and sign in"}
            </button>
            <button
              type="button"
              onClick={() => setStep("email")}
              className="w-full text-sm text-slate-600"
            >
              Use another email
            </button>
          </form>
        )}
        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link className="font-semibold text-blue-700" href="/register/consumer">
            Consumer
          </Link>{" "}
          or{" "}
          <Link className="font-semibold text-blue-700" href="/register/merchant">
            merchant
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
