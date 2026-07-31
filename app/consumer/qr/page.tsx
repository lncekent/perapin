"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import {
  Download,
  ShieldCheck,
  Copy,
  Check,
  Printer,
  Smartphone,
  StickyNote,
  Info,
  AlertTriangle,
  Share2,
  Scissors,
  Layers,
  QrCode,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { toast } from "@/components/ui/toast";

interface Profile {
  user: { stellarPublicKey: string };
}

const HOW_TO_USE_STEPS = [
  {
    icon: Printer,
    title: "Print your QR sticker",
    description: "Download the PNG and print it on sticker paper or cardstock.",
  },
  {
    icon: StickyNote,
    title: "Stick it somewhere accessible",
    description: "Attach to your ID lanyard, wallet, phone case, or notebook.",
  },
  {
    icon: Smartphone,
    title: "Merchant scans your sticker",
    description: "The merchant uses their phone camera to scan your QR code.",
  },
  {
    icon: ShieldCheck,
    title: "Enter your PIN to pay",
    description: "Type your 4-digit PIN on the merchant's phone to confirm payment.",
  },
];

const PRINTING_TIPS = [
  { icon: Scissors, text: "Print at minimum 3×3 cm for reliable scanning" },
  { icon: Layers, text: "Use matte finish — glossy paper causes glare issues" },
  { icon: QrCode, text: "Laminate the sticker to protect it from wear and water" },
];

export default function ConsumerQrPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: profile, error } = useCachedFetch<Profile>("me", async () => {
    const r = await fetch("/api/user/me");
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Unable to load sticker.");
    return d;
  });
  const wallet = profile?.user.stellarPublicKey ?? "";

  useEffect(() => {
    if (!wallet) return;
    if (canvas.current)
      QRCode.toCanvas(canvas.current, wallet, { width: 320, margin: 2 }).then(() => {
        if (canvas.current) {
          canvas.current.style.width = "100%";
          canvas.current.style.height = "auto";
        }
      });
    QRCode.toDataURL(wallet, { width: 720, margin: 2 })
      .then(setImage)
      .catch(() => {});
  }, [wallet]);

  async function copyPublicKey() {
    await navigator.clipboard.writeText(wallet);
    setCopied(true);
    toast.add({
      title: "Public key copied",
      description: "Share it with anyone who needs to send you XLM.",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  }

  if (error && !profile)
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
        {error}
      </p>
    );

  return (
    <div className="animate-fade-up space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your payment sticker</h1>
        <p className="mt-1 text-sm text-slate-500">
          Print it, carry it, get paid — no phone required.
        </p>
      </div>

      {/* Sticker card */}
      <Card variant="money" padding="lg" className="relative overflow-hidden">
        <div className="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.15]" />
        <div className="relative space-y-4">
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-sm font-bold ring-1 ring-white/20">
                ₱
              </span>
              <span className="text-sm font-bold">PeraPin</span>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide ring-1 ring-white/20">
              SCAN TO PAY
            </span>
          </div>
          <div className="mx-auto w-full max-w-[260px] rounded-2xl bg-white p-3 shadow-lg">
            {wallet ? (
              <canvas ref={canvas} className="block h-auto w-full" />
            ) : (
              <div className="aspect-square w-full animate-pulse rounded bg-slate-200" />
            )}
          </div>
          <p className="selectable rounded-xl bg-black/20 p-3 font-mono text-xs break-all text-brand-100">
            {wallet || "…"}
          </p>
        </div>
      </Card>

      {/* Security note */}
      <Card variant="ghost" padding="sm" className="flex items-start gap-2.5 text-left">
        <ShieldCheck className="mt-0.5 size-4 flex-shrink-0 text-brand-500" aria-hidden="true" />
        <div>
          <p className="text-xs font-semibold text-slate-700">Safe to share publicly</p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
            This QR code contains <strong>only</strong> your Stellar public address — like a bank
            account number. It cannot be used to withdraw funds without your 4-digit PIN.
          </p>
        </div>
      </Card>

      {/* Download & Share Buttons */}
      <div className="space-y-2.5">
        {image && (
          <a href={image} download={`perapin-${wallet.slice(0, 8)}.png`} className="block">
            <Button variant="primary" size="lg" block>
              <Download className="h-5 w-5" aria-hidden="true" /> Download PNG sticker
            </Button>
          </a>
        )}
        <Button
          variant="secondary"
          size="lg"
          block
          onClick={copyPublicKey}
          disabled={!wallet}
        >
          {copied ? (
            <>
              <Check className="size-5" aria-hidden="true" /> Copied!
            </>
          ) : (
            <>
              <Share2 className="size-5" aria-hidden="true" /> Share public key
            </>
          )}
        </Button>
      </div>

      {/* How to Use */}
      <div className="space-y-3 text-left">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Info className="size-4 text-brand-600" aria-hidden="true" />
          How to use your sticker
        </h2>
        <div className="grid gap-2.5">
          {HOW_TO_USE_STEPS.map((step, i) => (
            <Card key={i} variant="ghost" padding="sm">
              <div className="flex items-start gap-3">
                <div className="flex size-8 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                  <step.icon className="size-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{step.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{step.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Printing Tips */}
      <div className="space-y-3 text-left">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Printer className="size-4 text-slate-500" aria-hidden="true" />
          Printing tips
        </h2>
        <Card variant="surface" padding="md" className="space-y-2.5">
          {PRINTING_TIPS.map((tip, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <tip.icon className="size-3.5 flex-shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-xs text-slate-600">{tip.text}</p>
            </div>
          ))}
        </Card>
      </div>

      {/* Security Warning */}
      <Alert variant="default" className="text-left">
        <AlertTriangle aria-hidden="true" />
        <AlertTitle>Keep your PIN secret</AlertTitle>
        <AlertDescription>
          Your QR code is safe to share, but never tell anyone your 4-digit PIN. The merchant should
          hand you their phone to enter it privately.
        </AlertDescription>
      </Alert>
    </div>
  );
}
