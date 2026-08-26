"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  User,
  Wallet,
  Coins,
  ShieldCheck,
  Info,
} from "lucide-react";
import { useSessionStorageValue } from "@/hooks/use-session-storage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { maskName, maskEmail, maskWallet } from "@/lib/mask";
import { formatBalance } from "@/lib/utils";
import Link from "next/link";

interface PaymentContext {
  consumerPublicKey: string;
  consumerName?: string | null;
  consumerEmail?: string;
  amountXlm: number;
}

export default function MerchantConfirmPage() {
  const router = useRouter();
  const paymentContext = useSessionStorageValue<PaymentContext>("perapin_payment_context");
  const [merchantName, setMerchantName] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentContext || !paymentContext.amountXlm) {
      router.replace("/merchant/scan");
      return;
    }
    // Fetch merchant's business name for display
    fetch("/api/user/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setMerchantName(data.user.businessName || data.user.fullName || null);
        }
      })
      .catch(() => {});
  }, [paymentContext, router]);

  if (!paymentContext || !paymentContext.amountXlm) {
    return <p className="py-12 text-center text-slate-500">Loading payment details…</p>;
  }

  const consumerDisplay = paymentContext.consumerName
    ? maskName(paymentContext.consumerName)
    : paymentContext.consumerEmail
      ? maskEmail(paymentContext.consumerEmail)
      : "Unknown consumer";

  const maskedWallet = maskWallet(paymentContext.consumerPublicKey);

  function handleProceed() {
    router.push("/merchant/handoff");
  }

  return (
    <div className="animate-fade-up space-y-5">
      {/* Back */}
      <Link
        href="/merchant/amount"
        className="mt-3 flex items-center gap-2 text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
        <span>Back to amount</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Confirm Payment</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review the details below before proceeding to PIN entry.
        </p>
      </div>

      {/* Flow step indicator — 5 steps, step 3 active */}
      <Card variant="ghost" padding="sm">
        <div className="flex items-center justify-between text-center">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="bg-brand-100 text-brand-700 ring-brand-200 flex size-7 items-center justify-center rounded-full ring-1">
              <CheckCircle2 className="size-3.5" />
            </span>
            <span className="text-brand-700 text-[10px] font-medium">Scan</span>
          </div>
          <div className="bg-brand-300 h-px flex-1" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="bg-brand-100 text-brand-700 ring-brand-200 flex size-7 items-center justify-center rounded-full ring-1">
              <CheckCircle2 className="size-3.5" />
            </span>
            <span className="text-brand-700 text-[10px] font-medium">Amount</span>
          </div>
          <div className="bg-brand-300 h-px flex-1" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="bg-brand-600 ring-brand-600 flex size-7 items-center justify-center rounded-full text-[10px] font-bold text-white ring-1">
              3
            </span>
            <span className="text-brand-700 text-[10px] font-semibold">Confirm</span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
              4
            </span>
            <span className="text-[10px] font-medium text-slate-400">PIN</span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
              5
            </span>
            <span className="text-[10px] font-medium text-slate-400">Done</span>
          </div>
        </div>
      </Card>

      {/* Amount hero */}
      <Card variant="raised" padding="lg" className="text-center">
        <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">Payment Amount</p>
        <p className="mt-2 text-5xl font-extrabold text-slate-900 tabular-nums">
          {formatBalance(paymentContext.amountXlm)}
        </p>
        <p className="text-brand-600 mt-1 text-lg font-semibold">XLM</p>
      </Card>

      {/* Payment details card */}
      <Card variant="surface" padding="md" className="space-y-4">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          Transaction Details
        </p>

        {/* Consumer info */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
            <User className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">Paying from (Consumer)</p>
            <p className="text-sm font-semibold text-slate-800">{consumerDisplay}</p>
          </div>
        </div>

        {/* Wallet */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-100">
            <Wallet className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">Consumer Wallet</p>
            <p className="font-mono text-sm font-medium text-slate-700">{maskedWallet}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-green-50 text-green-600 ring-1 ring-green-100">
            <Coins className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-slate-500">Amount</p>
            <p className="text-sm font-semibold text-slate-800">
              {formatBalance(paymentContext.amountXlm)} XLM
            </p>
          </div>
        </div>

        {/* Receiving merchant */}
        {merchantName && (
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-500">Receiving (You)</p>
              <p className="text-sm font-semibold text-slate-800">{merchantName}</p>
            </div>
          </div>
        )}
      </Card>

      {/* Network badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-[10px]">
          Stellar Testnet · On-chain settlement
        </Badge>
      </div>

      {/* Action buttons */}
      <div className="space-y-3">
        <Button onClick={handleProceed} block size="lg">
          Proceed to PIN Entry
          <ArrowRight className="ml-1 size-4" aria-hidden="true" />
        </Button>
        <Button variant="ghost" block size="lg" onClick={() => router.push("/merchant/amount")}>
          Go Back
        </Button>
      </div>

      {/* Info note */}
      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <Info className="text-brand-500 mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">Next: </span> Hand your phone to the
          consumer. They will enter their 4-digit PIN to authorize this payment. The PIN is hashed
          in the browser and never stored.
        </p>
      </Card>
    </div>
  );
}
