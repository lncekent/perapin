"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, CircleAlert, MessageSquareText, ChevronRight } from "lucide-react";
import { computePinHash } from "@/lib/client-crypto";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusDialog, type OperationStatus } from "@/components/shared/StatusDialog";

export default function ConsumerSettingsPage() {
  const [wallet, setWallet] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [status, setStatus] = useState<OperationStatus>("idle");
  const [statusError, setStatusError] = useState("");

  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => setWallet(data.user.stellarPublicKey));
  }, []);

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
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security settings</h1>
        <p className="text-sm text-slate-500">Change your four-digit PeraPin PIN.</p>
      </div>

      <Card variant="surface" padding="lg">
        <form onSubmit={review}>
          <FieldGroup>
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
                <Input
                  id={f.id}
                  name={f.id}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  required
                  value={f.value}
                  onChange={(e) => {
                    f.set(e.target.value.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                  placeholder="••••"
                  className="h-12 text-center text-xl tracking-[0.4em]"
                />
              </Field>
            ))}
            <Button type="submit" block size="lg" disabled={!wallet}>
              Change PIN
            </Button>
          </FieldGroup>
        </form>
      </Card>

      <Link href="/feedback" className="group block">
        <Card variant="surface" padding="sm" interactive>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-50 p-2 text-brand-600 ring-1 ring-brand-100">
              <MessageSquareText className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Send feedback</p>
              <p className="text-[11px] text-slate-400">Tell us about your payment experience</p>
            </div>
            <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-300 transition-colors group-hover:text-brand-500" aria-hidden="true" />
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
        errorTitle="Couldn’t change PIN"
        errorDescription={statusError}
        errorActionLabel="Close"
        onErrorAction={() => setStatusOpen(false)}
      />
    </div>
  );
}
