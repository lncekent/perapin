"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import { InspectorLog } from "@/lib/types";

export default function InspectorConsole() {
  const [showConsole, setShowConsole] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<InspectorLog[]>([]);

  useEffect(() => {
    // Check if URL search has dev=true or dev=false
    const searchParams = new URLSearchParams(window.location.search);
    const devParam = searchParams.get("dev");

    if (devParam === "true") {
      localStorage.setItem("perapin_debug", "true");
      setShowConsole(true);
    } else if (devParam === "false") {
      localStorage.removeItem("perapin_debug");
      setShowConsole(false);
    } else {
      // Default to localStorage persistence
      const isDevSaved = localStorage.getItem("perapin_debug") === "true";
      setShowConsole(isDevSaved);
    }

    // Load historical logs on mount
    setLogs(mockStorage.getInspectorLogs());

    // Listen for any new logs dispatched globally
    const handleLogEvent = (e: Event) => {
      const customEvent = e as CustomEvent<InspectorLog>;
      setLogs((prev) => [customEvent.detail, ...prev].slice(0, 50));
    };

    window.addEventListener("perapin_log", handleLogEvent);
    return () => {
      window.removeEventListener("perapin_log", handleLogEvent);
    };
  }, []);

  const handleReset = () => {
    if (
      confirm(
        "Are you sure you want to reset all local transaction ledgers and customer balances? This will reload the page.",
      )
    ) {
      localStorage.removeItem("perapin_customers");
      localStorage.removeItem("perapin_transactions");
      localStorage.removeItem("perapin_visited");
      localStorage.removeItem("perapin_inspector_logs");
      localStorage.removeItem("perapin_debug");
      window.location.reload();
    }
  };

  if (!showConsole) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-4 bottom-4 z-50 flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 p-2.5 font-mono text-xs text-white shadow-lg transition-all hover:scale-105 hover:bg-slate-800 active:scale-95"
        id="inspector-toggle"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
        <span>Soroban Console</span>
      </button>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[380px] flex-col border-t border-slate-200 bg-white shadow-2xl"
            id="inspector-drawer"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-600" />
                <span className="font-mono text-xs font-bold tracking-wider text-slate-700 uppercase">
                  Soroban Smart Contract Audit Console (Live)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="text-red-650 flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 font-mono text-[10px] transition-all hover:bg-red-50 active:scale-95"
                  id="btn-reset-ledger"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset Database</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-slate-700"
                  id="btn-close-inspector"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Logs Scroll List */}
            <div
              className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 font-mono text-[11px] text-slate-700"
              id="inspector-logs-scroll"
            >
              {logs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  No execution logs recorded. Initiate a sign-up or merchant payment to audit
                  Soroban state changes.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="space-y-1 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">[{log.time}]</span>
                        <span
                          className={`font-bold uppercase ${
                            log.type === "blockchain"
                              ? "text-blue-650 text-blue-600"
                              : log.type === "success"
                                ? "text-emerald-600"
                                : log.type === "warning"
                                  ? "text-amber-600"
                                  : "text-slate-500"
                          }`}
                        >
                          {log.type === "blockchain" ? "⚡ SOROBAN_CONTRACT" : `● ${log.type}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">PeraPin Core V1</span>
                    </div>

                    <p className="font-bold text-slate-800">{log.title}</p>
                    <p className="leading-normal whitespace-pre-wrap text-slate-500">
                      {log.message}
                    </p>

                    {log.details && (
                      <pre className="mt-1 overflow-x-auto rounded border border-slate-200 bg-white p-2 text-[10px] text-slate-600">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Network Info Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-100 px-4 py-1.5 font-mono text-[10px] text-slate-500">
              <span>Stellar Protocol: v21 (Soroban Mainnet)</span>
              <span>Ledger Sequence: #6421096</span>
              <span>Gas Limit: 100,000,000 CPU instructions</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
