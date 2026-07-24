"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessionStorageValue } from "@/hooks/use-session-storage";

interface PaymentContext {
  consumerPublicKey: string;
  amountXlm?: number;
}

export default function MerchantAmountPage() {
  const router = useRouter();
  const paymentContext = useSessionStorageValue<PaymentContext>("perapin_payment_context");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!paymentContext) router.replace("/merchant/scan");
  }, [paymentContext, router]);

  const consumer = paymentContext?.consumerPublicKey ?? "";
  function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      Math.round(value * 10_000_000) !== value * 10_000_000
    )
      return setError("Enter a positive XLM amount with up to 7 decimal places.");
    sessionStorage.setItem(
      "perapin_payment_context",
      JSON.stringify({ consumerPublicKey: consumer, amountXlm: value }),
    );
    router.push("/merchant/handoff");
  }
  if (!paymentContext) return <p className="py-12 text-center text-slate-500">Loading scanned sticker…</p>;

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Enter sale amount</h1>
        <p className="mt-1 text-sm text-slate-500">
          Charging sticker {consumer ? `${consumer.slice(0, 8)}…${consumer.slice(-6)}` : "…"}
        </p>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <label className="block text-sm font-semibold">
        Amount in XLM
        <input
          required
          autoFocus
          inputMode="decimal"
          type="number"
          min="0.0000001"
          step="0.0000001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="mt-1 w-full rounded-2xl border p-4 text-3xl font-bold"
        />
      </label>
      <button className="w-full rounded-2xl bg-blue-600 p-4 font-bold text-white">
        Hand phone to consumer
      </button>
    </form>
  );
}
