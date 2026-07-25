"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Download, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCachedFetch } from "@/lib/use-cached-fetch";

interface Profile {
  user: { stellarPublicKey: string };
}

export default function ConsumerQrPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState("");
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

  if (error && !profile)
    return (
      <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
        {error}
      </p>
    );

  return (
    <div className="animate-fade-up space-y-5 text-center">
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

      <p className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-brand-500" aria-hidden="true" />
        Contains only your public Stellar address — safe to share.
      </p>

      {image && (
        <a href={image} download={`perapin-${wallet.slice(0, 8)}.png`} className="block">
          <Button variant="primary" size="lg" block>
            <Download className="h-5 w-5" aria-hidden="true" /> Download PNG sticker
          </Button>
        </a>
      )}
    </div>
  );
}
