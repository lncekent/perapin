"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowLeft,
  ShieldCheck,
  CircleAlert,
  Store,
  Mail,
  CheckCircle2,
  ScanLine,
  CreditCard,
  Clock,
} from "lucide-react";
import { StatusDialog } from "@/components/shared/StatusDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const stepList = [
  { label: "Business", icon: Store },
  { label: "Verify", icon: Mail },
] as const;

export default function MerchantRegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"form" | "token">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const stepIndex = step === "form" ? 0 : 1;

  async function send(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, createUser: true }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStep("token");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send code.");
    } finally {
      setLoading(false);
    }
  }

  async function verify(event?: FormEvent) {
    event?.preventDefault();
    if (token.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const verified = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const verifiedData = await verified.json();
      if (!verified.ok) throw new Error(verifiedData.error);
      const profile = await fetch("/api/user/me");
      if (profile.ok) {
        const data = await profile.json();
        router.replace(
          data.user.role === "merchant" ? "/merchant/dashboard" : "/consumer/dashboard",
        );
        return;
      }
      const registered = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "merchant", businessName }),
      });
      const data = await registered.json();
      if (!registered.ok) throw new Error(data.error || "Unable to create merchant wallet.");
      setSignupDone(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="bg-brand-wash flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
        </Link>

        <Card variant="raised" padding="lg" className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="bg-money-gradient shadow-money flex size-14 items-center justify-center rounded-2xl text-white">
                <Store className="size-7" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Create merchant account
                </h1>
                <p className="text-sm text-slate-500">Start accepting payments in 2 minutes</p>
              </div>
            </div>
          </div>

          {/* Step progress */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
            <ol className="flex items-center justify-between">
              {stepList.map((s, i) => {
                const Icon = s.icon;
                const completed = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li key={s.label} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full text-xs font-bold ring-1 transition-all",
                          completed
                            ? "bg-brand-600 ring-brand-600 text-white"
                            : active
                              ? "bg-brand-100 text-brand-700 ring-brand-300"
                              : "bg-white text-slate-400 ring-slate-200",
                        )}
                      >
                        {completed ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Icon className="size-3.5" />
                        )}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          active || completed ? "text-slate-700" : "text-slate-400",
                        )}
                      >
                        {s.label}
                      </span>
                    </div>
                    {i < stepList.length - 1 && (
                      <div
                        className={cn(
                          "mx-4 h-px flex-1",
                          i < stepIndex ? "bg-brand-400" : "bg-slate-200",
                        )}
                      />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* What you get - shown on first step */}
          {step === "form" && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-brand-50 flex flex-col items-center gap-1 rounded-xl p-2.5 text-center">
                <ScanLine className="text-brand-600 size-4" aria-hidden="true" />
                <span className="text-brand-700 text-[9px] font-medium">QR Scanner</span>
              </div>
              <div className="bg-brand-50 flex flex-col items-center gap-1 rounded-xl p-2.5 text-center">
                <CreditCard className="text-brand-600 size-4" aria-hidden="true" />
                <span className="text-brand-700 text-[9px] font-medium">No Hardware</span>
              </div>
              <div className="bg-brand-50 flex flex-col items-center gap-1 rounded-xl p-2.5 text-center">
                <Clock className="text-brand-600 size-4" aria-hidden="true" />
                <span className="text-brand-700 text-[9px] font-medium">~5s Settle</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step: Business form */}
          {step === "form" ? (
            <form onSubmit={send}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="business">Business name</FieldLabel>
                  <div className="relative">
                    <Store className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="business"
                      name="organization"
                      autoComplete="organization"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Aling Nena's Store"
                      className="h-12 pl-10"
                    />
                  </div>
                  <FieldDescription>
                    Shown to customers on their payment confirmation screen.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      spellCheck={false}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-12 pl-10"
                    />
                  </div>
                  <FieldDescription>
                    We&apos;ll send a one-time code to verify ownership.
                  </FieldDescription>
                </Field>
                <Button type="submit" disabled={loading} block size="lg">
                  {loading ? (
                    <>
                      <Spinner /> Sending…
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </Button>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={verify}>
              <FieldGroup>
                <div className="bg-brand-50 rounded-xl p-3 text-center">
                  <p className="text-brand-700 text-xs font-medium">
                    ✓ Business: <span className="font-bold">{businessName}</span>
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="otp">Verification code</FieldLabel>
                  <InputOTP
                    id="otp"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={token}
                    onChange={setToken}
                    onComplete={() => verify()}
                    containerClassName="justify-center"
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="size-12 text-lg" />
                      <InputOTPSlot index={1} className="size-12 text-lg" />
                      <InputOTPSlot index={2} className="size-12 text-lg" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="size-12 text-lg" />
                      <InputOTPSlot index={4} className="size-12 text-lg" />
                      <InputOTPSlot index={5} className="size-12 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                  <FieldDescription className="text-center">
                    Check your inbox at{" "}
                    <span className="font-semibold text-slate-700">{email}</span>
                  </FieldDescription>
                </Field>
                <Button type="submit" disabled={loading || token.length !== 6} block size="lg">
                  {loading ? (
                    <>
                      <Spinner /> Creating wallet…
                    </>
                  ) : (
                    "Verify & create receiving wallet"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  block
                  size="sm"
                  onClick={() => {
                    setStep("form");
                    setToken("");
                    setError("");
                  }}
                >
                  ← Go back
                </Button>
              </FieldGroup>
            </form>
          )}

          {/* Trust footer */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <ShieldCheck className="text-brand-500 size-3.5" aria-hidden="true" />
            <p className="text-[11px] font-medium text-slate-500">
              Custodial Testnet receiving wallet — no card network or hardware required
            </p>
          </div>
        </Card>

        {/* Bottom */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Already registered?{" "}
            <Link className="text-brand-700 font-semibold hover:underline" href="/login">
              Sign in
            </Link>
          </p>
          <Badge variant="outline" className="text-[10px]">
            Testnet
          </Badge>
        </div>
      </div>

      <StatusDialog
        open={signupDone}
        onOpenChange={setSignupDone}
        status="success"
        successTitle="Merchant account ready!"
        successDescription="Your receiving wallet is set up. You can start accepting QR payments from consumers right away."
        successActionLabel="Go to dashboard"
        onSuccessAction={() => router.replace("/merchant/dashboard")}
      />
    </main>
  );
}
