"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Info, ArrowRight, Wallet, UserCheck } from "lucide-react";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { formatBalance } from "@/lib/utils";
import { SendFlowSteps } from "@/components/shared/SendFlowSteps";

interface SendContext {
  recipientPublicKey: string;
  amountXlm?: number;
}

export default function ConsumerSendAmountPage() {
  const router = useRouter();
  const sendContext = useSessionStorageValue<SendContext>("perapin_send_context");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sendContext === null) router.replace("/consumer/send");
  }, [sendContext, router]);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d?.balanceXlm === "string") setBalance(d.balanceXlm);
      })
      .catch(() => {});
  }, []);

  const recipient = sendContext?.recipientPublicKey ?? "";
  const numericBalance = balance ? parseFloat(balance) : null;

  function submit(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount);
    if (
      !Number.isFinite(value) ||
      value <= 0 ||
      Math.round(value * 10_000_000) !== value * 10_000_000
    ) {
      return setError("Enter a positive XLM amount with up to 7 decimal places.");
    }
    // Leave a small buffer for the network fee so the transfer can settle.
    if (numericBalance !== null && value > numericBalance) {
      return setError(
        `You only have ${formatBalance(numericBalance)} XLM available. Enter a smaller amount.`,
      );
    }
    sessionStorage.setItem(
      "perapin_send_context",
      JSON.stringify({ recipientPublicKey: recipient, amountXlm: value }),
    );
    router.push("/consumer/send/confirm");
  }

  if (!sendContext)
    return <p className="py-12 text-center text-slate-500">Loading recipient…</p>;

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">How much to send?</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the amount of XLM you want to transfer.</p>
      </div>

      {/* Flow steps */}
      <SendFlowSteps current={2} />

      {/* Recipient info */}
      <Card variant="surface" padding="sm" className="flex items-center gap-3">
        <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-10 items-center justify-center rounded-xl ring-1">
          <UserCheck className="size-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500">Sending to</p>
          <p className="truncate font-mono text-[11px] text-slate-700">
            {recipient ? `${recipient.slice(0, 8)}…${recipient.slice(-6)}` : "…"}
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px]">
          Verified
        </Badge>
      </Card>

      {/* Available balance */}
      <Card variant="ghost" padding="sm" className="flex items-center gap-2.5">
        <Wallet className="text-brand-500 size-4 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs text-slate-500">
          Available balance:{" "}
          <span className="font-semibold text-slate-800">
            {balance !== null ? `${formatBalance(balance)} XLM` : "…"}
          </span>
        </p>
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
              <FieldLabel htmlFor="amount">Amount to send</FieldLabel>
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
                <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg font-semibold text-slate-400">
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
                  className="hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
                >
                  {val} XLM
                </button>
              ))}
            </div>

            <Button type="submit" block size="lg">
              Continue
              <ArrowRight className="ml-1 size-4" aria-hidden="true" />
            </Button>
          </FieldGroup>
        </form>
      </Card>

      {/* Info note */}
      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <Info className="text-brand-500 mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">Next step: </span> You&apos;ll enter your
          own 4-digit PIN to authorize this transfer. Your PIN never leaves your browser.
        </p>
      </Card>
    </div>
  );
}
