"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computePinHash } from "@/lib/client-crypto";
import { useSessionStorageValue } from "@/hooks/use-session-storage";

const PIN_LENGTH = 4;
const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];
interface PaymentContext {
  consumerPublicKey: string;
  amountXlm: number;
}

export default function MerchantHandoffPage() {
  const router = useRouter();
  const paymentContext = useSessionStorageValue<PaymentContext>("perapin_payment_context");
  const [pin, setPin] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!paymentContext) {
      router.replace("/merchant/scan");
    }
  }, [paymentContext, router]);

  useEffect(() => {
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const consumer = paymentContext?.consumerPublicKey ?? "";
  const amount = paymentContext?.amountXlm ?? 0;

  async function submit(currentPin = pin) {
    if (loading || currentPin.length !== PIN_LENGTH || seconds === 0) return;
    setLoading(true);
    setError("");
    try {
      const merchantResponse = await fetch("/api/user/me");
      const merchant = await merchantResponse.json();
      if (!merchantResponse.ok) throw new Error(merchant.error || "Merchant session expired.");
      const pinHash = await computePinHash(currentPin, consumer);
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
      if (!response.ok) {
        if (data.error === "INVALID_PIN") {
          throw new Error(`Incorrect PIN. ${data.remainingAttempts} attempt${data.remainingAttempts === 1 ? "" : "s"} remaining.`);
        }
        if (data.error === "WALLET_LOCKED") {
          throw new Error("Too many incorrect attempts. Wallet locked for 15 minutes.");
        }
        throw new Error(data.message || data.error || "Payment failed.");
      }
      sessionStorage.setItem("perapin_recent_receipt", JSON.stringify(data));
      router.replace("/merchant/result");
    } catch (cause) {
      setPin("");
      setError(cause instanceof Error ? cause.message : "Payment failed.");
    } finally {
      setLoading(false);
    }
  }

  function pressKey(key: string) {
    if (loading || seconds === 0) return;
    setError("");
    if (key === "delete") {
      setPin((value) => value.slice(0, -1));
      return;
    }
    if (!key) return;
    if (pin.length >= PIN_LENGTH) return;
    const next = `${pin}${key}`;
    setPin(next);
    if (next.length === PIN_LENGTH) void submit(next);
  }

  if (!paymentContext) return null;

  return (
    <main className="fixed inset-0 z-50 flex min-h-screen flex-col bg-slate-950 px-6 pb-7 pt-10 text-white">
      <header className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">PeraPin secure handoff</p>
        <p className="mt-4 text-sm text-slate-400">Hand this phone to the consumer</p>
        <h1 className="mt-1 text-4xl font-extrabold tracking-tight">{amount.toFixed(2)} XLM</h1>
        <p className={`mt-3 text-sm font-medium ${seconds <= 10 ? "text-amber-300" : "text-slate-400"}`}>
          Enter your 4-digit PIN · {seconds}s
        </p>
      </header>

      <section className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <div aria-label={`${pin.length} of ${PIN_LENGTH} PIN digits entered`} className="mb-8 flex justify-center gap-5">
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <span
              key={index}
              className={`h-4 w-4 rounded-full transition-all ${index < pin.length ? "scale-110 bg-white" : "border-2 border-slate-600 bg-transparent"}`}
            />
          ))}
        </div>

        {error && <p role="alert" className="mb-5 rounded-2xl border border-red-800 bg-red-950/70 px-4 py-3 text-center text-sm text-red-100">{error}</p>}
        {seconds === 0 && <p role="alert" className="mb-5 rounded-2xl border border-amber-800 bg-amber-950/70 px-4 py-3 text-center text-sm text-amber-100">PIN entry timed out. Ask the merchant to start again.</p>}

        <div className="grid grid-cols-3 gap-3" aria-label="PIN keypad">
          {keypad.map((key, index) => {
            if (!key) return <div key={`spacer-${index}`} aria-hidden="true" />;
            const isDelete = key === "delete";
            return (
              <button
                key={key}
                type="button"
                aria-label={isDelete ? "Delete last PIN digit" : key}
                disabled={loading || seconds === 0}
                onClick={() => pressKey(key)}
                className={`min-h-16 rounded-2xl text-2xl font-bold transition active:scale-95 disabled:opacity-40 ${isDelete ? "bg-slate-800 text-slate-200 text-base" : "border border-slate-700 bg-slate-900 hover:bg-slate-800"}`}
              >
                {isDelete ? "Delete" : key}
              </button>
            );
          })}
        </div>
        {loading && <p className="mt-6 text-center text-sm text-blue-200">Processing payment securely…</p>}
      </section>

      <button type="button" onClick={() => router.replace("/merchant/scan")} disabled={loading} className="mx-auto min-h-11 px-5 text-sm font-semibold text-slate-400 hover:text-white disabled:opacity-40">
        Cancel and return phone to merchant
      </button>
    </main>
  );
}
