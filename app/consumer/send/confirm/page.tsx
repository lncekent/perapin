"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { computePinHash } from "@/lib/client-crypto";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import {
  ShieldCheck,
  Lock,
  UserCheck,
  Delete,
  CheckCircle2,
  ExternalLink,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { StatusDialog, type OperationStatus } from "@/components/shared/StatusDialog";
import { formatBalance } from "@/lib/utils";
import { SendFlowSteps } from "@/components/shared/SendFlowSteps";

const PIN_LENGTH = 4;
const keypad = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "delete"];

interface SendContext {
  recipientPublicKey: string;
  amountXlm: number;
}

interface Receipt {
  txHash: string;
  amountXlm: number;
  recipientPublicKey: string;
  timestamp: string;
}

export default function ConsumerSendConfirmPage() {
  const router = useRouter();
  const sendContext = useSessionStorageValue<SendContext>("perapin_send_context");
  const [senderKey, setSenderKey] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<OperationStatus>("idle");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (sendContext === null || (sendContext && !sendContext.amountXlm)) {
      router.replace("/consumer/send");
    }
  }, [sendContext, router]);

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.stellarPublicKey) setSenderKey(d.user.stellarPublicKey);
      })
      .catch(() => {});
  }, []);

  const recipient = sendContext?.recipientPublicKey ?? "";
  const amount = sendContext?.amountXlm ?? 0;
  const loading = status === "loading";

  async function submit(currentPin = pin) {
    if (loading || currentPin.length !== PIN_LENGTH || !senderKey) return;
    setStatus("loading");
    setError("");
    try {
      // PIN hash is salted with the SENDER's own public key — they authorize
      // spending from their own wallet.
      const pinHash = await computePinHash(currentPin, senderKey);
      const response = await fetch("/api/payment/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientPublicKey: recipient,
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
          throw new Error("Too many incorrect attempts. Your wallet is locked for 15 minutes.");
        }
        throw new Error(data.message || data.error || "Transfer failed.");
      }
      setReceipt(data);
      setStatus("success");
    } catch (cause) {
      setPin("");
      setStatus("idle");
      setError(cause instanceof Error ? cause.message : "Transfer failed.");
    }
  }

  function pressKey(key: string) {
    if (loading) return;
    setError("");
    if (key === "delete") {
      setPin((value) => value.slice(0, -1));
      return;
    }
    if (!key || pin.length >= PIN_LENGTH) return;
    const next = `${pin}${key}`;
    setPin(next);
    if (next.length === PIN_LENGTH) void submit(next);
  }

  function finish() {
    sessionStorage.removeItem("perapin_send_context");
    router.replace("/consumer/dashboard");
  }

  if (!sendContext || !sendContext.amountXlm)
    return <p className="py-12 text-center text-slate-500">Loading transfer…</p>;

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Confirm transfer</h1>
        <p className="mt-1 text-sm text-slate-500">Enter your PIN to authorize this transfer.</p>
      </div>

      {/* Flow steps */}
      <SendFlowSteps current={3} />

      {/* Transfer summary */}
      <Card variant="raised" padding="lg" className="space-y-4">
        <div className="text-center">
          <p className="text-xs font-medium text-slate-500">You are sending</p>
          <p className="mt-1 text-4xl font-bold text-slate-900 tabular-nums">
            {formatBalance(amount)} <span className="text-lg font-semibold text-slate-500">XLM</span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="bg-brand-50 text-brand-600 ring-brand-100 flex size-9 items-center justify-center rounded-lg ring-1">
            <UserCheck className="size-4.5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-500">To recipient</p>
            <p className="truncate font-mono text-[11px] text-slate-700">
              {recipient ? `${recipient.slice(0, 8)}…${recipient.slice(-6)}` : "…"}
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            Verified
          </Badge>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <Lock aria-hidden="true" />
          <AlertTitle>Couldn&apos;t authorize</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* PIN entry */}
      <Card variant="surface" padding="lg" className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Lock className="text-brand-500 size-3.5" aria-hidden="true" />
          <p className="text-[11px] font-semibold tracking-[0.15em] text-slate-500 uppercase">
            Enter your 4-digit PIN
          </p>
        </div>

        {/* PIN boxes */}
        <div
          aria-label={`${pin.length} of ${PIN_LENGTH} PIN digits entered`}
          className="flex justify-center gap-3"
        >
          {Array.from({ length: PIN_LENGTH }, (_, index) => (
            <span
              key={index}
              className={`flex size-12 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-all ${
                index < pin.length
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-300"
              }`}
            >
              {index < pin.length ? "•" : ""}
            </span>
          ))}
        </div>

        {/* Keypad */}
        <div className="mx-auto grid max-w-xs grid-cols-3 gap-3" aria-label="PIN keypad">
          {keypad.map((key, index) => {
            if (!key) return <div key={`spacer-${index}`} aria-hidden="true" />;
            const isDelete = key === "delete";
            return (
              <button
                key={key}
                type="button"
                aria-label={isDelete ? "Delete last PIN digit" : key}
                disabled={loading}
                onClick={() => pressKey(key)}
                className={`flex min-h-[3.5rem] items-center justify-center rounded-2xl text-2xl font-bold transition-all active:scale-95 disabled:opacity-40 ${
                  isDelete
                    ? "bg-slate-100 text-slate-500"
                    : "border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {isDelete ? <Delete className="size-5" aria-hidden="true" /> : key}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Security footer */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
        <ShieldCheck className="size-3.5" aria-hidden="true" />
        <span>PIN hashed client-side · never transmitted raw · verified on-chain</span>
      </div>

      {/* Cancel */}
      <Link
        href="/consumer/send"
        className="block text-center text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        Cancel transfer
      </Link>

      {/* Result dialog */}
      <StatusDialog
        open={status === "success"}
        onOpenChange={(next) => {
          if (!next) finish();
        }}
        status="success"
        successTitle="Money sent!"
        successDescription="Your transfer settled on the Stellar Testnet."
        successActionLabel="Back to dashboard"
        onSuccessAction={finish}
      >
        {receipt && (
          <Card variant="surface" padding="md" className="space-y-4">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 ring-1 ring-green-200">
                <CheckCircle2 className="size-6" aria-hidden="true" />
              </div>
              <p className="mt-3 text-xs font-medium text-slate-500">Amount sent</p>
              <p className="mt-1 text-3xl font-bold text-slate-900 tabular-nums">
                {formatBalance(receipt.amountXlm)}{" "}
                <span className="text-base font-semibold text-slate-500">XLM</span>
              </p>
            </div>

            <div className="space-y-2 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Status</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700 ring-green-200">
                  Confirmed
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Network</span>
                <span className="font-medium text-slate-700">Stellar Testnet</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Time</span>
                <span className="flex items-center gap-1 font-medium text-slate-700">
                  <Clock className="size-3" aria-hidden="true" />
                  {receipt.timestamp
                    ? new Date(receipt.timestamp).toLocaleTimeString()
                    : "Just now"}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-medium text-slate-500">Transaction hash</p>
              <p className="selectable rounded-lg bg-slate-50 p-2 font-mono text-[10px] break-all text-slate-600">
                {receipt.txHash}
              </p>
              <a
                target="_blank"
                rel="noreferrer"
                href={`https://stellar.expert/explorer/testnet/tx/${receipt.txHash}`}
                className="text-brand-700 inline-flex items-center gap-1 text-xs font-semibold hover:underline"
              >
                View in Stellar Explorer
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            </div>
          </Card>
        )}
      </StatusDialog>
    </div>
  );
}
