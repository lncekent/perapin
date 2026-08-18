"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import {
  Camera,
  CircleAlert,
  ScanLine,
  Send,
  ShieldCheck,
  Users,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { SendFlowSteps } from "@/components/shared/SendFlowSteps";
import Link from "next/link";

export default function ConsumerSendPage() {
  const router = useRouter();
  const video = useRef<HTMLVideoElement>(null);
  const reader = useRef<BrowserQRCodeReader | null>(null);
  const controls = useRef<IScannerControls | null>(null);
  const myWallet = useRef<string>("");
  const [wallet, setWallet] = useState("");
  const [camera, setCamera] = useState(false);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Cache the sender's own public key so we can block self-sends.
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((d) => {
        if (d?.user?.stellarPublicKey) myWallet.current = d.user.stellarPublicKey;
      })
      .catch(() => {});
    return () => controls.current?.stop();
  }, []);

  async function validate(candidate: string) {
    const trimmed = candidate.trim().toUpperCase();
    setLoading(true);
    setError("");
    try {
      if (!/^G[A-Z2-7]{55}$/.test(trimmed)) {
        throw new Error("That doesn't look like a valid PeraPin wallet address.");
      }
      if (myWallet.current && trimmed === myWallet.current) {
        throw new Error("You can't send money to your own wallet.");
      }
      const response = await fetch(`/api/consumer/lookup?wallet=${encodeURIComponent(trimmed)}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error === "CONSUMER_NOT_FOUND"
            ? "This QR code isn't linked to an active PeraPin consumer."
            : data.error || "Unable to verify this recipient.",
        );
      }
      sessionStorage.setItem(
        "perapin_send_context",
        JSON.stringify({ recipientPublicKey: data.consumerPublicKey }),
      );
      controls.current?.stop();
      router.push("/consumer/send/amount");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to verify this recipient.");
    } finally {
      setLoading(false);
    }
  }

  async function startCamera() {
    setError("");
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setError(
        "Camera needs a secure (HTTPS) connection and a supported browser. Enter the address manually below.",
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
            ? "No camera was found on this device. Enter the address manually instead."
            : "Camera could not start. Enter the address manually instead.",
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="animate-fade-up space-y-5">
      {/* Back button */}
      <Link
        href="/consumer/dashboard"
        className="mt-3 flex items-center gap-2 text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
        <span>Back to dashboard</span>
      </Link>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Send Money</h1>
          <p className="mt-1 text-sm text-slate-500">
            Scan a friend&apos;s QR sticker to send them XLM instantly.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Users className="size-3" aria-hidden="true" />
          P2P
        </Badge>
      </div>

      {/* Flow steps */}
      <SendFlowSteps current={1} />

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Can&apos;t use this recipient</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Camera viewport */}
      <div className="shadow-card relative aspect-square overflow-hidden rounded-3xl bg-slate-950">
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
                  : "Point at your friend's QR sticker to read their wallet address."}
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
              <span className="animate-laser bg-brand-400 absolute inset-x-2 top-0 h-0.5 rounded-full shadow-[0_0_12px_2px_rgba(96,144,250,0.7)]" />
            )}
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/70 text-white">
            <Spinner className="size-8" />
            <span className="text-sm font-medium">Verifying recipient…</span>
          </div>
        )}
      </div>

      {/* Manual fallback */}
      <Card variant="surface" padding="md" className="space-y-3">
        <div className="flex items-center gap-2">
          <ScanLine className="size-4 text-slate-500" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-800">Enter address manually</p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void validate(wallet);
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="manual">Recipient Stellar public key</FieldLabel>
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
                Paste the recipient&apos;s wallet address if you can&apos;t scan their sticker.
              </FieldDescription>
            </Field>
            <Button type="submit" variant="secondary" size="lg" block disabled={loading}>
              {loading ? (
                <>
                  <Spinner /> Checking…
                </>
              ) : (
                <>
                  <Send data-icon="inline-start" /> Continue
                </>
              )}
            </Button>
          </FieldGroup>
        </form>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card variant="ghost" padding="sm" className="flex items-start gap-2">
          <ShieldCheck className="text-brand-500 mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            You&apos;ll authorize the transfer with your own 4-digit PIN.
          </p>
        </Card>
        <Card variant="ghost" padding="sm" className="flex items-start gap-2">
          <Users className="text-brand-500 mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Money moves consumer-to-consumer, settled on-chain in ~5s.
          </p>
        </Card>
      </div>

      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5">
        <Info className="text-brand-500 mt-0.5 size-4 flex-shrink-0" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-semibold text-slate-700">Send flow:</span> Scan recipient → Enter
          amount → Confirm with your PIN → XLM settles on Stellar Testnet.
        </p>
      </Card>
    </div>
  );
}
