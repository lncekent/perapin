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
      <div className="relative inline-block bg-slate-900 text-white rounded-3xl p-5 shadow-lg border border-slate-800">
        <div className="font-bold text-xs tracking-wider uppercase mb-3 opacity-80 text-center font-mono">
          ₱ PeraPin Payment Pass
        </div>
        
        <div className="bg-white p-2 rounded-2xl inline-block mb-3">
          <canvas ref={qrCanvasRef} className="mx-auto" />
        </div>

        <div className="text-[11px] font-mono opacity-60 uppercase">
          ID: {activeCustomer.customerId}
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
