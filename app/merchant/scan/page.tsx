"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";

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
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Scan consumer sticker</h1>
        <p className="text-sm text-slate-500">
          The consumer’s phone is not used during this payment.
        </p>
      </div>
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <div className="aspect-square overflow-hidden rounded-3xl bg-slate-900">
        {camera ? (
          <video ref={video} className="h-full w-full object-cover" muted playsInline />
        ) : (
          <button
            onClick={startCamera}
            className="h-full w-full p-6 text-center font-bold text-white"
          >
            Enable camera scanner
          </button>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void validate(wallet);
        }}
        className="space-y-3"
      >
        <label className="block text-sm font-semibold">
          Manual Stellar public key
          <input
            required
            value={wallet}
            onChange={(e) => setWallet(e.target.value.toUpperCase())}
            placeholder="G…"
            className="mt-1 w-full rounded-xl border p-3 font-mono text-sm"
          />
        </label>
        <button disabled={loading} className="w-full rounded-xl border bg-white p-3 font-bold">
          {loading ? "Checking…" : "Continue with this sticker"}
        </button>
      </form>
    </div>
  );
}
