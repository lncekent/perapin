"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

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
    <form onSubmit={submit} className="animate-fade-up space-y-5">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">Enter sale amount</h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Charging sticker</span>
          <Badge variant="secondary" className="font-mono">
            {consumer ? `${consumer.slice(0, 6)}…${consumer.slice(-4)}` : "…"}
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Invalid amount</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="amount">Amount in XLM</FieldLabel>
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
            className="h-16 text-3xl font-bold"
          />
          <FieldDescription>Testnet XLM · up to 7 decimal places.</FieldDescription>
        </Field>
        <Button type="submit" block size="lg">
          Hand phone to consumer
        </Button>
      </FieldGroup>
    </form>
  );
}
