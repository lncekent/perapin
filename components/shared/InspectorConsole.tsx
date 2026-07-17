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
        "Are you sure you want to reset all local transaction ledgers and customer balances? This will reload the page."
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
        className="fixed bottom-4 right-4 z-50 p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg border border-slate-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-mono"
        id="inspector-toggle"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
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
            className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-50 h-[380px] flex flex-col shadow-2xl"
            id="inspector-drawer"
          >
            {/* Drawer Header */}
            <div className="bg-slate-50 px-4 py-2 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Soroban Smart Contract Audit Console (Live)
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1 bg-white hover:bg-red-50 border border-slate-200 rounded text-[10px] text-red-650 font-mono flex items-center gap-1 active:scale-95 transition-all"
                  id="btn-reset-ledger"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset Database</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-bold rounded hover:bg-slate-700"
                  id="btn-close-inspector"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Logs Scroll List */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] bg-slate-50 text-slate-700"
              id="inspector-logs-scroll"
            >
              {logs.length === 0 ? (
                <div className="text-center text-slate-400 py-12">
                  No execution logs recorded. Initiate a sign-up or merchant
                  payment to audit Soroban state changes.
                </div>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className="border-b border-slate-200/60 pb-2.5 space-y-1"
                  >
                    <div className="flex justify-between items-center">
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
                          {log.type === "blockchain"
                            ? "⚡ SOROBAN_CONTRACT"
                            : `● ${log.type}`}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        PeraPin Core V1
                      </span>
                    </div>

                    <p className="text-slate-800 font-bold">{log.title}</p>
                    <p className="text-slate-500 leading-normal whitespace-pre-wrap">
                      {log.message}
                    </p>

                    {log.details && (
                      <pre className="mt-1 bg-white p-2 rounded border border-slate-200 text-[10px] overflow-x-auto text-slate-600">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Network Info Footer */}
            <div className="bg-slate-100 py-1.5 px-4 flex justify-between items-center text-[10px] font-mono border-t border-slate-200 text-slate-500">
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
