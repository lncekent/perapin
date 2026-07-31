"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import {
  Camera,
  CircleAlert,
  KeyRound,
  ScanLine,
  Info,
  CheckCircle2,
  Wifi,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export default function MerchantScanPage() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const reader = useRef<BrowserQRCodeReader | null>(null);
  const controls = useRef<IScannerControls | null>(null);
  const [wallet, setWallet] = useState("");
  const [camera, setCamera] = useState(false);
  const [starting, setStarting] = useState(false);
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
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera needs a secure (HTTPS) connection and a supported browser. Enter the sticker address manually below.",
      );
      return;
    }
    setStarting(true);
    try {
      reader.current = new BrowserQRCodeReader();
      controls.current = await reader.current.decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        video.current!,
        (result) => {
          if (result) void validate(result.getText());
        },
      );
      setCamera(true);
    } catch (cause) {
      setCamera(false);
      const name = cause instanceof Error ? cause.name : "";
      setError(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Camera permission was denied. Allow camera access in your browser settings, or enter the address manually."
          : name === "NotFoundError"
            ? "No camera was found on this device. Enter the sticker address manually instead."
            : "Camera could not start. Enter the sticker address manually instead.",
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accept Payment</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scan the consumer&apos;s QR sticker to begin a payment.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Wifi className="size-3" aria-hidden="true" />
          Live
        </Badge>
      </div>

      {/* Payment flow steps indicator */}
      <Card variant="ghost" padding="sm">
        <div className="flex items-center justify-between text-center">
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white ring-1 ring-brand-600">
              1
            </span>
            <span className="text-[10px] font-semibold text-brand-700">Scan</span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
              2
            </span>
            <span className="text-[10px] font-medium text-slate-400">Amount</span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
              3
            </span>
            <span className="text-[10px] font-medium text-slate-400">PIN</span>
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex flex-1 flex-col items-center gap-1">
            <span className="flex size-7 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
              4
            </span>
            <span className="text-[10px] font-medium text-slate-400">Done</span>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Can&apos;t use this sticker</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Camera viewport */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-950 shadow-card">
        <video
          ref={video}
          className={cn("h-full w-full object-cover", !camera && "opacity-0")}
          muted
          playsInline
        />

        {!camera && (
          <button
            onClick={startCamera}
            disabled={starting}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white transition-colors hover:bg-slate-900 disabled:opacity-80"
          >
            <span className="flex size-20 items-center justify-center rounded-3xl bg-white/10 ring-1 ring-white/15">
              {starting ? (
                <Spinner className="size-10" />
              ) : (
                <Camera className="size-10" aria-hidden="true" />
              )}
            </span>
            <div>
              <span className="block text-lg font-bold">
                {starting ? "Starting camera…" : "Tap to enable scanner"}
              </span>
              <span className="mt-1 block max-w-[16rem] text-xs text-slate-400">
                {starting
                  ? "Allow camera access when your browser asks."
                  : "Point at the consumer's QR sticker to scan their wallet address."}
              </span>
            </div>
          </button>
        )}

        {/* Camera active indicator */}
        {camera && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
            Scanning
          </div>
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

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/70 text-white">
            <Spinner className="size-8" />
            <span className="text-sm font-medium">Verifying sticker…</span>
          </div>
        )}
      </div>

      {/* Manual fallback */}
      <Card variant="surface" padding="md" className="space-y-3">
        <div className="flex items-center gap-2">
          <ScanLine className="size-4 text-slate-500" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-800">Manual entry</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void validate(wallet);
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="manual">Stellar public key</FieldLabel>
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
              <FieldDescription>
                Use this if the camera can&apos;t read the sticker or you have the address saved.
              </FieldDescription>
            </Field>
            <Button type="submit" variant="secondary" size="lg" block disabled={loading}>
              {loading ? (
                <>
                  <Spinner /> Checking…
                </>
              ) : (
                "Continue with this address"
              )}
            </Button>
          </FieldGroup>
        </form>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card variant="ghost" padding="sm" className="flex items-start gap-2">
          <KeyRound className="mt-0.5 size-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Consumer enters their PIN on your phone — their device isn&apos;t needed.
          </p>
        </Card>
        <Card variant="ghost" padding="sm" className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 size-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Settlement confirms on-chain in ~5 seconds via Soroban.
          </p>
        </Card>
      </div>

      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <Info className="mt-0.5 size-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">Payment flow:</span> Scan sticker → Enter amount →
          Hand phone to consumer → They type PIN → Payment settles on Stellar Testnet → Both see confirmation.
        </p>
      </Card>
    </div>
  );
}
