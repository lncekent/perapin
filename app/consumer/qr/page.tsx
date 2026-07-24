"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

export default function ConsumerQrPage() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [wallet, setWallet] = useState("");
  const [image, setImage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/user/me")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setWallet(data.user.stellarPublicKey);
        return QRCode.toDataURL(data.user.stellarPublicKey, { width: 720, margin: 2 });
      })
      .then(setImage)
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load sticker."),
      );
  }, []);
  useEffect(() => {
    if (canvas.current && wallet)
      QRCode.toCanvas(canvas.current, wallet, { width: 320, margin: 2 });
  }, [wallet]);
  if (error) return <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>;
  return (
    <div className="space-y-5 text-center">
      <div>
        <h1 className="text-2xl font-bold">Your payment sticker</h1>
        <p className="mt-1 text-sm text-slate-500">
          Contains only your public Stellar wallet address.
        </p>
      </div>
      <section className="rounded-3xl bg-slate-900 p-6 text-white">
        <canvas ref={canvas} className="mx-auto rounded-2xl bg-white p-3" />
        <p className="mt-4 rounded-xl bg-slate-800 p-3 font-mono text-xs break-all text-blue-200">
          {wallet}
        </p>
      </section>
      {image && (
        <a
          href={image}
          download={`perapin-${wallet.slice(0, 8)}.png`}
          className="flex min-h-14 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white"
        >
          Download PNG sticker
        </a>
      )}
    </div>
  );
}
