"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, QrCode } from "lucide-react";
import { motion } from "motion/react";
import QRCode from "qrcode";
import { mockStorage } from "@/lib/services/mockStorage";
import { CustomerAccount } from "@/lib/types";

export default function ConsumerQrPage() {
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeCustomer, setActiveCustomer] = useState<CustomerAccount | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const customer = mockStorage.getActiveCustomer();
    if (customer) {
      setActiveCustomer(customer);
    }
  }, []);

  useEffect(() => {
    if (activeCustomer && qrCanvasRef.current) {
      QRCode.toCanvas(
        qrCanvasRef.current,
        activeCustomer.customerId,
        {
          width: 220,
          margin: 1.5,
          color: {
            dark: "#0f172a", // Slate 900
            light: "#ffffff", // White
          },
        },
        (err) => {
          if (err) {
            console.error("QR Code rendering error", err);
          } else if (qrCanvasRef.current) {
            const dataUrl = qrCanvasRef.current.toDataURL("image/png");
            setQrDataUrl(dataUrl);
          }
        }
      );
    }
  }, [activeCustomer]);

  if (!activeCustomer) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading customer data...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 py-4 text-center max-w-sm mx-auto"
    >

      <div className="flex flex-col items-center">
        <div className="bg-blue-50 text-blue-600 p-3 rounded-full mb-3">
          <QrCode className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Payment Sticker</h2>
        <p className="text-xs text-slate-500 leading-relaxed mt-1">
          This QR code carries only your public wallet ID. It is completely safe
          to print and display publicly.
        </p>
      </div>

      {/* QR Sticker Container */}
      <div className="relative w-full max-w-xs mx-auto bg-slate-900 text-white rounded-3xl p-5 shadow-xl border border-slate-800 flex flex-col items-center">
        <div className="font-bold text-xs tracking-wider uppercase mb-3 text-center font-mono flex items-center justify-center gap-1.5 text-blue-400">
          <span>₱ PeraPin Payment Pass</span>
        </div>
        
        <div className="bg-white p-3 rounded-2xl shadow-inner mb-3 flex items-center justify-center">
          <canvas ref={qrCanvasRef} className="max-w-full h-auto" />
        </div>

        <div className="w-full text-center space-y-1">
          <span className="text-[9px] font-mono uppercase text-slate-400 tracking-wider block">
            Stellar Public Key
          </span>
          <div className="text-[10px] font-mono text-blue-300 font-semibold break-all bg-slate-950/80 py-1.5 px-3 rounded-xl border border-slate-800/80">
            {activeCustomer.customerId.slice(0, 14)}...{activeCustomer.customerId.slice(-14)}
          </div>
        </div>
      </div>

      {/* Download action button */}
      <div className="pt-2">
        {qrDataUrl && (
          <a
            href={qrDataUrl}
            download={`perapin-sticker-${activeCustomer.customerId}.png`}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all hover:scale-[1.01] active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>Download PNG Image</span>
          </a>
        )}
      </div>
    </motion.div>
  );
}
