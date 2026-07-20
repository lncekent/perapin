"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Wifi, WifiOff, QrCode, Home, Info } from "lucide-react";
import { mockStorage } from "@/lib/services/mockStorage";
import { CustomerAccount } from "@/lib/types";

export default function ConsumerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCustomer, setActiveCustomer] = useState<CustomerAccount | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const role = localStorage.getItem("perapin_user_role");
    if (role !== "consumer") {
      mockStorage.logToInspector(
        "warning",
        "Access Denied",
        "Attempted to access /consumer path without active customer session. Redirecting to /login."
      );
      router.push("/login");
      return;
    }

    const customer = mockStorage.getActiveCustomer();
    if (customer) {
      setActiveCustomer(customer);
    }
    setLoading(false);

    // Watch offline simulation changes
    const checkOffline = () => {
      // Toggle from storage or dev inspector
    };
    
    // Simple custom handler to sync connection indicator
    const handleStorageChange = () => {
      const offline = localStorage.getItem("perapin_offline_sim") === "true";
      setIsOffline(offline);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("perapin_user_role");
    localStorage.removeItem("perapin_user_email");
    localStorage.removeItem("perapin_active_customer_id");
    
    mockStorage.logToInspector(
      "info",
      "User Logged Out",
      "Terminated customer session and cleared local session keys."
    );
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-4 border-blue-600/20 border-t-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 py-4 px-6 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/consumer/dashboard" className="flex items-center gap-2">
              <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 32 32" fill="none">
                <defs>
                  <linearGradient id="logo-grad-cust" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#logo-grad-cust)" />
                <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" stroke="white" strokeOpacity="0.15" />
                <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                  ₱
                </text>
              </svg>
              <div>
                <span className="font-bold text-base text-slate-800 tracking-tight block">PeraPin</span>
                <span className="text-[9px] text-slate-400 block -mt-1 font-mono tracking-wider">CONSUMER</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
              isOffline ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              {isOffline ? <WifiOff className="w-3 h-3" /> : <Wifi className="w-3 h-3 animate-pulse" />}
              <span>{isOffline ? "Offline" : "Live"}</span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-650 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto py-4 px-6 pb-20 relative">
        {children}
      </main>

      {/* Customer Mobile Footer Nav */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 py-2 z-40 shadow-lg">
        <div className="max-w-md mx-auto grid grid-cols-4 text-center">
          <Link
            href="/consumer/dashboard"
            className={`flex flex-col items-center gap-0.5 transition-all ${
              pathname === "/consumer/dashboard"
                ? "text-blue-600 font-bold scale-105"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </Link>
          <Link
            href="/consumer/qr"
            className={`flex flex-col items-center gap-0.5 transition-all ${
              pathname === "/consumer/qr"
                ? "text-blue-600 font-bold scale-105"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <QrCode className="w-5 h-5" />
            <span className="text-[10px]">Sticker</span>
          </Link>
          <Link
            href="/consumer/topup"
            className={`flex flex-col items-center gap-0.5 transition-all ${
              pathname === "/consumer/topup"
                ? "text-blue-600 font-bold scale-105"
                : "text-slate-400 hover:text-slate-600 font-medium"
            }`}
          >
            <Info className="w-5 h-5" />
            <span className="text-[10px]">Topup</span>
          </Link>
          <Link
            href="/feedback"
            className={`flex flex-col items-center gap-0.5 transition-all ${
              pathname === "/feedback"
                ? "text-blue-600 font-bold scale-105"
                : "text-slate-400 hover:text-slate-400 font-medium"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-[10px]">Feedback</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
