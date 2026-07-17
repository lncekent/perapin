"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, RefreshCw, AlertCircle, Sparkles, Check, Play } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import { CustomerAccount } from "@/lib/types";

export default function MerchantScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // States
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [manualId, setManualId] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Load customers list for simulation scan buttons
    setCustomers(mockStorage.getCustomers());
  }, []);

  const startCamera = async () => {
    setErrorMsg("");
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 640, height: 480 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        mockStorage.logToInspector(
          "info",
          "Camera Feed Activated",
          "Initialized device back camera for QR scanner overlay."
        );
      }
    } catch (err) {
      console.warn("Camera access failed", err);
      setCameraError(true);
      setCameraActive(false);
      mockStorage.logToInspector(
        "warning",
        "Camera Feed Failed",
        "Unable to access camera. Reverting to manual scanner controls."
      );
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleScanSuccess = (customerId: string) => {
    const list = mockStorage.getCustomers();
    const customer = list.find((c) => c.customerId === customerId);
    
    if (!customer) {
      setErrorMsg("QR Sticker rejected: Account ID not found on-chain.");
      mockStorage.logToInspector(
        "warning",
        "Payment Scan Rejected",
        `Scanned ID: ${customerId} was not found in registered ledger.`
      );
      return;
    }

    // Success! Save scanned user & navigate to amount entry
    localStorage.setItem("perapin_scanned_customer_id", customerId);
    mockStorage.logToInspector(
      "success",
      "Payment Sticker Scanned",
      `Sticker for ${customer.name} (${customer.customerId}) successfully decoded. Redirecting to Amount Entry.`
    );
    stopCamera();
    router.push("/merchant/amount");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    handleScanSuccess(manualId.trim());
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 py-4 max-w-sm mx-auto"
    >

      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold text-slate-850">Scan Payment Pass</h2>
        <p className="text-xs text-slate-500">
          Position the customer's static QR code pass inside the camera frame
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 font-medium">
          <AlertCircle className="w-4 h-4 text-red-650 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Camera Viewport Frame */}
      <div className="relative aspect-square w-full max-w-[280px] mx-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-inner overflow-hidden flex flex-col justify-center items-center">
        {cameraActive ? (
          <video
            ref={videoRef}
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="p-6 text-center text-slate-400 space-y-4">
            <Camera className="w-12 h-12 mx-auto text-slate-650" />
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Enable Browser Camera
            </button>
            {cameraError && (
              <p className="text-[10px] text-amber-500 max-w-[200px] leading-normal">
                ⚠️ Camera blocked or unavailable. Use the manual simulation list below.
              </p>
            )}
          </div>
        )}

        {/* Scan Frame Overlay HUD */}
        {cameraActive && (
          <div className="absolute inset-4 border-2 border-dashed border-blue-500/50 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-t-2 border-l-2 border-blue-500 absolute top-0 left-0" />
            <div className="w-6 h-6 border-t-2 border-r-2 border-blue-500 absolute top-0 right-0" />
            <div className="w-6 h-6 border-b-2 border-l-2 border-blue-500 absolute bottom-0 left-0" />
            <div className="w-6 h-6 border-b-2 border-r-2 border-blue-500 absolute bottom-0 right-0" />
          </div>
        )}
      </div>

      {/* Manual Input Fallback */}
      <form onSubmit={handleManualSubmit} className="space-y-2">
        <label className="block text-center text-xs font-bold uppercase tracking-wider text-slate-400">
          Or Enter ID Manually
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="e.g. PP-1234-567890"
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Simulated Scanner Tap Panel */}
      <div className="bg-slate-100 p-4 rounded-3xl space-y-3 border border-slate-200/60">
        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          QA Test Simulator (Tap to Scan)
        </span>
        <div className="space-y-1.5">
          {customers.map((c) => (
            <button
              key={c.customerId}
              onClick={() => handleScanSuccess(c.customerId)}
              className="w-full flex items-center justify-between p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-left transition-all active:scale-[0.99] text-xs hover:border-slate-350"
            >
              <div>
                <p className="font-bold text-slate-850">{c.name}</p>
                <p className="text-[9px] text-slate-400 font-mono">{c.customerId}</p>
              </div>
              <span className="text-[9px] bg-blue-50 text-blue-650 px-2 py-0.5 rounded-full font-mono font-medium">
                ₱{c.balance.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
