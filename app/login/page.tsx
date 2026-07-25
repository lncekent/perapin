"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, ShieldCheck } from "lucide-react";
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
    <main className="bg-brand-wash flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>

        <Card variant="raised" padding="lg" className="space-y-6">
          {/* Brand mark */}
          <div className="space-y-3">
            <div className="bg-money-gradient shadow-money flex size-12 items-center justify-center rounded-2xl text-2xl font-bold text-white">
              ₱
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Sign in to PeraPin
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {step === "email"
                  ? "We’ll email you a one-time code — no password needed."
                  : "Enter the 6-digit code we just emailed you."}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <ShieldCheck aria-hidden="true" />
              <AlertTitle>Couldn’t sign in</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "email" ? (
            <form onSubmit={requestOtp}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
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
                    className="h-12"
                  />
                  <FieldDescription>Use the email linked to your PeraPin account.</FieldDescription>
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
                    Code sent to <span className="font-semibold text-slate-700">{email}</span>
                  </FieldDescription>
                </Field>
                <Button type="submit" disabled={loading || token.length !== 6} block size="lg">
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
                  Use another email
                </Button>
              </FieldGroup>
            </form>
          )}

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <ShieldCheck className="text-brand-500 size-3.5" aria-hidden="true" />
            Passwordless sign-in secured by email OTP
          </p>
        </Card>

        <p className="text-center text-sm text-slate-500">
          New here?{" "}
          <Link className="text-brand-700 font-semibold hover:underline" href="/register/consumer">
            Consumer
          </Link>{" "}
          or{" "}
          <Link className="text-brand-700 font-semibold hover:underline" href="/register/merchant">
            merchant
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
