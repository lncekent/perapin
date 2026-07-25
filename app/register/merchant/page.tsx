"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, ShieldCheck, CircleAlert, Store } from "lucide-react";
import { StatusDialog } from "@/components/shared/StatusDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const stepList = ["Business", "Verify"] as const;

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
    <main className="bg-brand-wash flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Back
        </Link>

        <Card variant="raised" padding="lg" className="space-y-6">
          <div className="space-y-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-money-gradient text-white shadow-money">
              <Store className="size-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Create merchant account
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Accept payments with just your phone browser — no card reader, no hardware.
              </p>
            </div>

            <ol className="flex items-center gap-2 pt-1">
              {stepList.map((label, i) => (
                <li key={label} className="flex flex-1 items-center gap-2">
                  <span
                    className={cn(
                      "flex size-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-1 transition-colors",
                      i <= stepIndex
                        ? "bg-brand-600 text-white ring-brand-600"
                        : "bg-white text-slate-400 ring-slate-200",
                    )}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium",
                      i <= stepIndex ? "text-slate-700" : "text-slate-400",
                    )}
                  >
                    {label}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          {error && (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "form" ? (
            <form onSubmit={send}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="business">Business name</FieldLabel>
                  <Input
                    id="business"
                    name="organization"
                    autoComplete="organization"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Aling Nena's Store"
                    className="h-12"
                  />
                  <FieldDescription>Shown to customers on their payment confirmation.</FieldDescription>
                </Field>
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
                    Code sent to <span className="font-semibold text-slate-700">{email}</span>
                  </FieldDescription>
                </Field>
                <Button type="submit" disabled={loading || token.length !== 6} block size="lg">
                  {loading ? (
                    <>
                      <Spinner /> Creating wallet…
                    </>
                  ) : (
                    "Verify & create wallet"
                  )}
                </Button>
              </FieldGroup>
            </form>
          )}

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <ShieldCheck className="size-3.5 text-brand-500" aria-hidden="true" />
            Custodial Testnet receiving wallet — no card network required
          </p>
        </Card>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-brand-700 hover:underline" href="/login">
            Sign in
          </Link>
        </p>
      </div>

      <StatusDialog
        open={signupDone}
        onOpenChange={setSignupDone}
        status="success"
        successTitle="Merchant account ready!"
        successDescription="Your PeraPin receiving wallet is set up. You can start accepting payments now."
        successActionLabel="Go to my dashboard"
        onSuccessAction={() => router.replace("/merchant/dashboard")}
      />
    </main>
  );
}
