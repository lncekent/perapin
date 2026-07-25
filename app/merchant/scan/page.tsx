"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, ScanLine, CircleAlert, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

export default function MerchantScanPage() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const reader = useRef<BrowserQRCodeReader | null>(null);
  const controls = useRef<IScannerControls | null>(null);
  const [wallet, setWallet] = useState("");
  const [camera, setCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => controls.current?.stop(), []);

  async function validate(candidate: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/consumer/lookup?wallet=${encodeURIComponent(candidate.trim())}`,
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error === "CONSUMER_NOT_FOUND"
            ? "This QR code is not an active PeraPin consumer sticker."
            : data.error,
        );
      sessionStorage.setItem(
        "perapin_payment_context",
        JSON.stringify({ consumerPublicKey: data.consumerPublicKey }),
      );
      controls.current?.stop();
      router.push("/merchant/amount");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to validate sticker.");
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    setError("");
    try {
      if (!video.current) return;
      reader.current = new BrowserQRCodeReader();
      setCamera(true);
      controls.current = await reader.current.decodeFromVideoDevice(
        undefined,
        video.current,
        (result) => {
          if (result) void validate(result.getText());
        },
      );
    } catch {
      setCamera(false);
      setError("Camera could not start. Enter the sticker address manually instead.");
    }
  }

  return (
    <div className="animate-fade-up space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scan consumer sticker</h1>
        <p className="mt-1 text-sm text-slate-500">
          You scan — the customer just enters their PIN. Their phone is never needed.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Can&apos;t use this sticker</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Camera viewport */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-950 shadow-card">
        {camera ? (
          <video ref={video} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <button
            onClick={startCamera}
            className="flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center text-white transition-colors hover:bg-slate-900"
          >
            <span className="flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
              <Camera className="size-8" aria-hidden="true" />
            </span>
            <span className="text-base font-bold">Enable camera scanner</span>
            <span className="max-w-[16rem] text-xs text-slate-400">
              Point your camera at the customer&apos;s QR sticker to begin.
            </span>
          </button>
        )}

        {/* Scan guide overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="relative size-52">
            <span className="absolute top-0 left-0 size-8 rounded-tl-xl border-t-2 border-l-2 border-white/80" />
            <span className="absolute top-0 right-0 size-8 rounded-tr-xl border-t-2 border-r-2 border-white/80" />
            <span className="absolute bottom-0 left-0 size-8 rounded-bl-xl border-b-2 border-l-2 border-white/80" />
            <span className="absolute right-0 bottom-0 size-8 rounded-br-xl border-r-2 border-b-2 border-white/80" />
            {camera && (
              <span className="animate-laser absolute inset-x-2 top-0 h-0.5 rounded-full bg-brand-400 shadow-[0_0_12px_2px_rgba(96,144,250,0.7)]" />
            )}
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-sm font-medium text-white">
            <Spinner className="mr-2 size-5" /> Checking sticker…
          </div>
        )}
      </div>

      {/* Manual fallback */}
      <Card variant="surface" padding="md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void validate(wallet);
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="manual">Enter sticker address manually</FieldLabel>
              <Input
                id="manual"
                name="wallet"
                autoComplete="off"
                spellCheck={false}
                required
                value={wallet}
                onChange={(e) => setWallet(e.target.value.toUpperCase())}
                placeholder="G…"
                className="h-12 font-mono text-sm"
              />
              <FieldDescription>Use this if the camera can&apos;t read the sticker.</FieldDescription>
            </Field>
            <Button type="submit" variant="secondary" size="lg" block disabled={loading}>
              {loading ? (
                <>
                  <Spinner /> Checking…
                </>
              ) : (
                "Continue with this sticker"
              )}
            </Button>
          </FieldGroup>
        </form>
      </Card>

      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <KeyRound className="mt-0.5 size-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          After scanning, you&apos;ll enter the amount and hand your phone to the customer to type
          their 4-digit PIN.
        </p>
      </Card>
    </div>
  );
}
