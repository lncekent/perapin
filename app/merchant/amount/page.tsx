"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Info, ArrowRight, CheckCircle2 } from "lucide-react";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

  if (!paymentContext)
    return <p className="py-12 text-center text-slate-500">Loading scanned sticker…</p>;

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Enter sale amount</h1>
        <p className="mt-1 text-sm text-slate-500">
          How much is the consumer paying for this transaction?
        </p>
      </div>

      {/* Flow step indicator */}
      <Card variant="ghost" padding="sm">
        <div className="flex items-center justify-between text-center">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 ring-1 ring-brand-200">
              <CheckCircle2 className="size-3.5" />
            </span>
            <span className="text-[10px] font-medium text-brand-700">Scan</span>
          </div>
          <div className="h-px flex-1 bg-brand-300" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-1 ring-brand-600">
              2
            </span>
            <span className="text-[10px] font-semibold text-brand-700">Amount</span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
              3
            </span>
            <span className="text-[10px] font-medium text-slate-400">PIN</span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
              4
            </span>
            <span className="text-[10px] font-medium text-slate-400">Done</span>
          </div>
        </div>
      </Card>

      {/* Consumer sticker info */}
      <Card variant="surface" padding="sm" className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
          <CheckCircle2 className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">Consumer sticker verified</p>
          <p className="truncate font-mono text-[11px] text-slate-700">
            {consumer ? `${consumer.slice(0, 8)}…${consumer.slice(-6)}` : "…"}
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px]">Active</Badge>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Invalid amount</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Amount form */}
      <Card variant="raised" padding="lg">
        <form onSubmit={submit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="amount">Payment amount</FieldLabel>
              <div className="relative">
                <Input
                  id="amount"
                  name="amount"
                  required
                  autoComplete="off"
                  inputMode="decimal"
                  type="number"
                  min="0.0000001"
                  step="0.0000001"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="0.00"
                  className="h-20 pr-16 text-4xl font-bold"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-400">
                  XLM
                </span>
              </div>
              <FieldDescription>
                Testnet XLM · supports up to 7 decimal places. Network fee is negligible.
              </FieldDescription>
            </Field>

            {/* Quick amount buttons */}
            <div className="flex flex-wrap gap-2">
              {["1", "5", "10", "25", "50", "100"].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setAmount(val);
                    if (error) setError("");
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  {val} XLM
                </button>
              ))}
            </div>

            <Button type="submit" block size="lg">
              Continue — hand phone to consumer
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Button>
          </FieldGroup>
        </form>
      </Card>

      {/* Info note */}
      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <Info className="mt-0.5 size-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">Next step:</span> You&apos;ll hand your phone
          to the consumer. They&apos;ll enter their 4-digit PIN to authorize this payment. The PIN
          never leaves the browser.
        </p>
      </Card>
    </div>
  );
}
