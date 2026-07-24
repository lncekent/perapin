"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computePinHash } from "@/lib/client-crypto";
export default function MerchantHandoffPage() {
  const router = useRouter();
  const [consumer, setConsumer] = useState("");
  const [amount, setAmount] = useState(0);
  const [pin, setPin] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const raw = sessionStorage.getItem("perapin_payment_context");
    if (!raw) return router.replace("/merchant/scan");
    const context = JSON.parse(raw);
    setConsumer(context.consumerPublicKey);
    setAmount(context.amountXlm);
    const interval = setInterval(() => setSeconds((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [router]);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (seconds === 0) throw new Error("PIN entry timed out. Start the payment again.");
      const merchant = await fetch("/api/user/me").then((r) => r.json());
      const pinHash = await computePinHash(pin, consumer);
      const response = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerPublicKey: consumer,
          merchantPublicKey: merchant.user.stellarPublicKey,
          amountXlm: amount,
          pinHash,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      sessionStorage.setItem("perapin_recent_receipt", JSON.stringify(data));
      router.replace("/merchant/result");
    } catch (cause) {
      setPin("");
      setError(cause instanceof Error ? cause.message : "Payment failed.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <main className="fixed inset-0 z-50 flex min-h-screen flex-col justify-between bg-slate-950 px-6 py-8 text-white">
      <div className="text-center">
        <p className="text-sm text-slate-400">Hand this phone to the consumer</p>
        <h1 className="mt-2 text-4xl font-bold">{amount.toFixed(2)} XLM</h1>
        <p className="mt-2 text-sm text-slate-400">Enter PIN · {seconds}s</p>
      </div>
      <form onSubmit={submit} className="mx-auto w-full max-w-sm space-y-6">
        {error && (
          <p role="alert" className="rounded-xl bg-red-950 p-3 text-sm text-red-200">
            {error}
          </p>
        )}
        <input
          autoFocus
          required
          type="password"
          inputMode="numeric"
          pattern="[0-9]{4}"
          maxLength={4}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="••••"
          className="w-full rounded-2xl border border-slate-600 bg-slate-900 p-5 text-center text-4xl tracking-[0.5em]"
        />
        <button
          disabled={loading || pin.length !== 4 || seconds === 0}
          className="w-full rounded-2xl bg-blue-600 p-4 font-bold disabled:opacity-50"
        >
          {loading ? "Processing payment…" : "Confirm payment"}
        </button>
        <button
          type="button"
          onClick={() => router.replace("/merchant/scan")}
          className="w-full p-3 text-sm text-slate-400"
        >
          Cancel
        </button>
      </form>
    </main>
  );
}
