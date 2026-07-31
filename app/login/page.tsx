"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  Zap,
  WifiOff,
  Globe,
  CheckCircle2,
} from "lucide-react";
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
import { toast } from "@/components/ui/toast";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"email" | "token">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestOtp(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, createUser: false }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to send code.");
      setStep("token");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to send code.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event?: FormEvent) {
    event?.preventDefault();
    if (token.length !== 6 || loading) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to verify code.");
      const profileResponse = await fetch("/api/user/me");
      const profile = await profileResponse.json();
      if (!profileResponse.ok || !profile.user)
        throw new Error("No PeraPin account exists for this email. Register first.");
      toast.add({
        title: "Signed in",
        description: "Welcome to PeraPin.",
        type: "success",
      });
      router.replace(
        profile.user.role === "merchant" ? "/merchant/dashboard" : "/consumer/dashboard",
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify code.");
      setLoading(false);
    }
  }

  return (
    <main className="bg-brand-wash flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Back nav */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to home
        </Link>

        {/* Main login card */}
        <Card variant="raised" padding="lg" className="space-y-6">
          {/* Brand header */}
          <div className="space-y-3">
            <div className="bg-money-gradient shadow-money flex size-14 items-center justify-center rounded-2xl text-3xl font-bold text-white">
              ₱
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {step === "email"
                  ? "Sign in to access your PeraPin wallet. We'll send a one-time code to your email — no password needed."
                  : "Enter the 6-digit code we just sent to your inbox."}
              </p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${
                  step === "email"
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-brand-100 text-brand-700 ring-brand-200"
                }`}
              >
                {step === "token" ? <CheckCircle2 className="size-3.5" /> : "1"}
              </span>
              <span className="text-[11px] font-medium text-slate-700">Email</span>
            </div>
            <div className="h-px flex-1 bg-slate-200" />
            <div className="flex items-center gap-2">
              <span
                className={`flex size-6 items-center justify-center rounded-full text-[11px] font-bold ring-1 ${
                  step === "token"
                    ? "bg-brand-600 text-white ring-brand-600"
                    : "bg-white text-slate-400 ring-slate-200"
                }`}
              >
                2
              </span>
              <span
                className={`text-[11px] font-medium ${step === "token" ? "text-slate-700" : "text-slate-400"}`}
              >
                Verify
              </span>
            </div>
          </div>

          {/* Error alert */}
          {error && (
            <Alert variant="destructive">
              <ShieldCheck aria-hidden="true" />
              <AlertTitle>Couldn&apos;t sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Email step */}
          {step === "email" ? (
            <form onSubmit={requestOtp}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
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
                    Use the email linked to your PeraPin account.
                  </FieldDescription>
                </Field>
                <Button type="submit" disabled={loading} block size="lg">
                  {loading ? (
                    <>
                      <Spinner /> Sending code…
                    </>
                  ) : (
                    "Send verification code"
                  )}
                </Button>
              </FieldGroup>
            </form>
          ) : (
            <form onSubmit={verifyOtp}>
              <FieldGroup>
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
                    onComplete={() => verifyOtp()}
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
                    Code sent to{" "}
                    <span className="font-semibold text-slate-700">{email}</span>
                  </FieldDescription>
                </Field>
                <Button
                  type="submit"
                  disabled={loading || token.length !== 6}
                  block
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Spinner /> Verifying…
                    </>
                  ) : (
                    "Verify and sign in"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  block
                  size="sm"
                  onClick={() => {
                    setStep("email");
                    setToken("");
                    setError("");
                  }}
                >
                  ← Use another email
                </Button>
              </FieldGroup>
            </form>
          )}

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
            <Lock className="size-3.5 text-brand-500" aria-hidden="true" />
            <p className="text-[11px] font-medium text-slate-500">
              Passwordless sign-in secured by email OTP — no credentials stored
            </p>
          </div>
        </Card>

        {/* Registration CTAs */}
        <Card variant="surface" padding="md" className="space-y-3">
          <p className="text-center text-sm font-semibold text-slate-700">
            New to PeraPin?
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/register/consumer">
              <Button variant="secondary" size="md" block>
                Consumer signup
              </Button>
            </Link>
            <Link href="/register/merchant">
              <Button variant="secondary" size="md" block>
                Merchant signup
              </Button>
            </Link>
          </div>
        </Card>

        {/* Trust indicators */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-3 text-center">
            <Zap className="size-4 text-brand-500" aria-hidden="true" />
            <span className="text-[10px] font-medium text-slate-500">Instant settle</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-3 text-center">
            <WifiOff className="size-4 text-brand-500" aria-hidden="true" />
            <span className="text-[10px] font-medium text-slate-500">Offline-first</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-3 text-center">
            <Globe className="size-4 text-brand-500" aria-hidden="true" />
            <span className="text-[10px] font-medium text-slate-500">Stellar powered</span>
          </div>
        </div>

        {/* Testnet badge */}
        <div className="flex justify-center">
          <Badge variant="outline" className="text-[10px]">
            Running on Stellar Testnet
          </Badge>
        </div>
      </div>
    </main>
  );
}
