"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  KeyRound,
  CircleAlert,
  MessageSquareText,
  ChevronRight,
  User,
  Wallet,
  Calendar,
  ShieldCheck,
  Mail,
  Shield,
  Check,
  X,
} from "lucide-react";
import { computePinHash } from "@/lib/client-crypto";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusDialog, type OperationStatus } from "@/components/shared/StatusDialog";
import { cn } from "@/lib/utils";
import { useCachedFetch, setCachedValue } from "@/lib/use-cached-fetch";
import { toast } from "@/components/ui/toast";

interface Profile {
  user: {
    email: string;
    stellarPublicKey: string;
    createdAt?: string;
    role?: string;
    fullName?: string | null;
  };
  balanceXlm: string;
  isLocked: boolean;
  pinSetupRequired: boolean;
}

export default function ConsumerSettingsPage() {
  const { data: profile, refetch } = useCachedFetch<Profile>("me", async () => {
    const r = await fetch("/api/user/me");
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Unable to load profile.");
    return d;
  });

  const wallet = profile?.user.stellarPublicKey ?? "";
  const email = profile?.user.email ?? "";
  const role = profile?.user.role ?? "consumer";
  const fullName = profile?.user.fullName ?? "";
  const memberSince = profile?.user.createdAt
    ? new Date(profile.user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "—";

  const [editFullName, setEditFullName] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState<OperationStatus>("idle");
  const [statusError, setStatusError] = useState("");

  const nameValue = editFullName ?? fullName;

  async function saveFullName() {
    const trimmed = nameValue.trim();
    if (trimmed === fullName) {
      setEditFullName(null);
      return;
    }
    if (trimmed.length > 100) {
      toast.add({
        title: "Too long",
        description: "Full name must be 100 characters or less.",
        type: "error",
      });
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch("/api/user/full-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update.");
      if (profile) {
        setCachedValue("me", { ...profile, user: { ...profile.user, fullName: data.fullName } });
      }
      await refetch();
      setEditFullName(null);
      toast.add({
        title: "Name updated",
        description: "Your full name has been saved.",
        type: "success",
      });
    } catch (err: any) {
      toast.add({ title: "Update failed", description: err.message, type: "error" });
    } finally {
      setSavingName(false);
    }
  }

  // Step 1: validate locally, then ask for confirmation.
  function review(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (oldPin.length !== 4 || newPin.length !== 4 || confirm.length !== 4)
      return setError("Each PIN must be exactly 4 digits.");
    if (newPin !== confirm) return setError("New PIN entries do not match.");
    if (newPin === oldPin) return setError("Your new PIN must be different from the current one.");
    setConfirmOpen(true);
  }

  // Step 2: run the on-chain change, reporting loading → success/error.
  async function changePin() {
    setConfirmOpen(false);
    setStatus("loading");
    setStatusOpen(true);
    try {
      const response = await fetch("/api/user/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPinHash: await computePinHash(oldPin, wallet),
          newPinHash: await computePinHash(newPin, wallet),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      setOldPin("");
      setNewPin("");
      setConfirm("");
      setStatus("success");
    } catch (cause) {
      setStatusError(cause instanceof Error ? cause.message : "Unable to change PIN.");
      setStatus("error");
    }
  }

  const fields = [
    { id: "oldPin", label: "Current PIN", value: oldPin, set: setOldPin },
    { id: "newPin", label: "New PIN", value: newPin, set: setNewPin },
    { id: "confirmPin", label: "Confirm new PIN", value: confirm, set: setConfirm },
  ] as const;

  return (
    <div className="animate-fade-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your account and security preferences.</p>
      </div>

      {/* Account Info Card */}
      <Card variant="surface" padding="lg" className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="text-brand-600 size-4" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">Account Info</h2>
          <Badge variant="secondary" className="ml-auto capitalize">
            {role}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <User className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Full Name
              </p>
              {editFullName !== null ? (
                <div className="mt-1 flex items-center gap-1.5">
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    maxLength={100}
                    autoFocus
                    placeholder="Enter your full name"
                    className="focus:border-brand-400 focus:ring-brand-200 h-8 min-w-0 flex-1 rounded-lg border border-slate-200 px-2.5 text-sm text-slate-800 outline-none focus:ring-1"
                  />
                  <button
                    onClick={saveFullName}
                    disabled={savingName}
                    className="bg-brand-600 hover:bg-brand-700 flex size-8 flex-shrink-0 items-center justify-center rounded-lg text-white transition-colors disabled:opacity-50"
                    aria-label="Save name"
                  >
                    {savingName ? (
                      <span className="size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <Check className="size-4" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditFullName(null)}
                    className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Cancel"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {fullName || <span className="text-slate-400 italic">Not set</span>}
                  </p>
                  <button
                    onClick={() => setEditFullName(fullName)}
                    className="text-brand-600 flex-shrink-0 text-[11px] font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Mail className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Email
              </p>
              <p className="truncate text-sm font-medium text-slate-800">{email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Wallet className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Wallet Address
              </p>
              <p className="font-mono text-xs text-slate-600">
                {wallet ? `${wallet.slice(0, 8)}…${wallet.slice(-8)}` : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 ring-1 ring-slate-200">
              <Calendar className="size-3.5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Member Since
              </p>
              <p className="text-sm font-medium text-slate-800">{memberSince}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Security Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Shield className="text-brand-600 size-4" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900">Security</h2>
        </div>

        <Card variant="surface" padding="lg">
          <form onSubmit={review}>
            <FieldGroup>
              <div className="flex items-center gap-2 pb-1">
                <KeyRound className="size-4 text-slate-500" aria-hidden="true" />
                <p className="text-sm font-semibold text-slate-800">Change PIN</p>
              </div>
              <FieldDescription className="!mt-0 pb-2">
                Update your 4-digit payment PIN. This registers a new hash on the Stellar Testnet.
              </FieldDescription>

              {error && (
                <Alert variant="destructive">
                  <CircleAlert aria-hidden="true" />
                  <AlertTitle>Check your PINs</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {fields.map((f) => (
                <Field key={f.id}>
                  <FieldLabel htmlFor={f.id}>{f.label}</FieldLabel>
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={4}
                      value={f.value}
                      onChange={(val: string) => {
                        f.set(val.replace(/\D/g, ""));
                        if (error) setError("");
                      }}
                      inputMode="numeric"
                      containerClassName="gap-3"
                    >
                      <InputOTPGroup className="gap-3">
                        <InputOTPSlot
                          index={0}
                          className="size-12 rounded-xl border-2 border-slate-200 text-xl font-bold"
                        />
                        <InputOTPSlot
                          index={1}
                          className="size-12 rounded-xl border-2 border-slate-200 text-xl font-bold"
                        />
                        <InputOTPSlot
                          index={2}
                          className="size-12 rounded-xl border-2 border-slate-200 text-xl font-bold"
                        />
                        <InputOTPSlot
                          index={3}
                          className="size-12 rounded-xl border-2 border-slate-200 text-xl font-bold"
                        />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </Field>
              ))}
              <Button type="submit" block size="lg" disabled={!wallet}>
                <KeyRound className="size-4" aria-hidden="true" /> Change PIN
              </Button>
            </FieldGroup>
          </form>
        </Card>

        {/* Lockout Info */}
        <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
          <ShieldCheck className="text-brand-500 mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
          <p className="text-xs leading-relaxed text-slate-500">
            For your security, 3 incorrect PIN attempts triggers a{" "}
            <strong>15-minute lockout</strong> enforced by the on-chain smart contract.
          </p>
        </Card>
      </div>

      {/* Feedback Link */}
      <Link href="/feedback" className="group block">
        <Card variant="surface" padding="sm" interactive>
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 text-brand-600 ring-brand-100 rounded-xl p-2 ring-1">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Send feedback</p>
              <p className="text-[11px] text-slate-400">Tell us about your payment experience</p>
            </div>
            <ChevronRight
              className="group-hover:text-brand-500 h-5 w-5 flex-shrink-0 text-slate-300 transition-colors"
              aria-hidden="true"
            />
          </div>
        </Card>
      </Link>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        tone="primary"
        icon={<KeyRound className="size-5" />}
        title="Change your PIN?"
        description="Your new PIN will be registered on the Stellar Testnet and required for every future payment."
        confirmLabel="Change PIN"
        loadingLabel="Updating…"
        onConfirm={changePin}
      />

      <StatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        status={status}
        loadingTitle="Updating your PIN…"
        loadingDescription="Registering the change on the Stellar Testnet."
        successTitle="PIN changed!"
        successDescription="Your new PIN is now active for all future payments."
        successActionLabel="Done"
        onSuccessAction={() => setStatusOpen(false)}
        errorTitle="Couldn't change PIN"
        errorDescription={statusError}
        errorActionLabel="Close"
        onErrorAction={() => setStatusOpen(false)}
      />
    </div>
  );
}
