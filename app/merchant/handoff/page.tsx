"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { computePinHash } from "@/lib/client-crypto";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { ShieldCheck, Lock } from "lucide-react";
import { formatBalance } from "@/lib/utils";

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
          throw new Error(
            `Incorrect PIN. ${data.remainingAttempts} attempt${data.remainingAttempts === 1 ? "" : "s"} remaining.`,
          );
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
    <main className="fixed inset-0 z-50 flex min-h-screen flex-col bg-slate-950 px-6 pt-8 pb-6 text-white">
      {/* Top secure indicator */}
      <div className="flex items-center justify-center gap-2 pb-4">
        <Lock className="text-brand-300 size-3.5" aria-hidden="true" />
        <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
          Secure PIN Entry
        </p>
        <Lock className="text-brand-300 size-3.5" aria-hidden="true" />
      </div>

      {/* Header */}
      <header className="text-center">
        <div className="mx-auto mb-3 flex items-center justify-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-white/10">
          <span className="relative flex size-2">
            <span className="bg-brand-400 absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
            <span className="bg-brand-500 relative inline-flex size-2 rounded-full" />
          </span>
          Waiting for consumer PIN
        </div>

        <p className="text-sm text-slate-400">Amount to pay</p>
        <h1 className="mt-1 text-5xl font-extrabold tracking-tight">
          {formatBalance(amount)} <span className="text-brand-300 text-2xl font-semibold">XLM</span>
        </h1>

        {/* Timer */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold ${
              seconds <= 10
                ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30"
                : "bg-white/10 text-slate-300 ring-1 ring-white/10"
            }`}
          >
            <span className="font-mono tabular-nums">{seconds}s</span>
            <span className="text-xs font-normal opacity-70">remaining</span>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">Enter your 4-digit PIN to authorize</p>
      </header>

      {/* PIN display and keypad */}
      <section className="mx-auto flex w-full max-w-xs flex-1 flex-col justify-center">
        {/* PIN dots */}
        <div
          aria-label={`${pin.length} of ${PIN_LENGTH} PIN digits entered`}
          className="mb-8 flex justify-center gap-6"
        >
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <span
              key={index}
              className={`flex size-5 items-center justify-center rounded-full transition-all duration-150 ${
                index < pin.length
                  ? "scale-110 bg-white shadow-[0_0_12px_2px_rgba(255,255,255,0.3)]"
                  : "border-2 border-slate-600 bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="mb-5 rounded-2xl border border-red-800 bg-red-950/70 px-4 py-3 text-center text-sm font-medium text-red-100"
          >
            {error}
          </p>
        )}

        {/* Timeout */}
        {seconds === 0 && (
          <p
            role="alert"
            className="mb-5 rounded-2xl border border-amber-800 bg-amber-950/70 px-4 py-3 text-center text-sm text-amber-100"
          >
            PIN entry timed out. Ask the merchant to start again.
          </p>
        )}

        {/* Keypad */}
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
                className={`min-h-[4rem] rounded-2xl text-2xl font-bold transition-all active:scale-95 disabled:opacity-40 ${
                  isDelete
                    ? "bg-slate-800 text-sm font-semibold text-slate-300"
                    : "border border-slate-700 bg-slate-900 hover:border-slate-600 hover:bg-slate-800"
                }`}
              >
                {isDelete ? "Delete" : key}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-6 flex flex-col items-center gap-2 text-center">
            <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-800">
              <div className="bg-brand-500 h-full w-full animate-pulse rounded-full" />
            </div>
            <p className="text-brand-200 text-sm font-medium">
              Verifying PIN & settling on Stellar…
            </p>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          <span>PIN hashed client-side · never transmitted raw · on-chain verification</span>
        </div>
        <button
          type="button"
          onClick={() => router.replace("/merchant/scan")}
          disabled={loading}
          className="mx-auto block min-h-11 px-5 text-sm font-semibold text-slate-400 transition-colors hover:text-white disabled:opacity-40"
        >
          Cancel and return phone to merchant
        </button>
      </div>
    </main>
  );
}
