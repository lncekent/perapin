"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { QrCode, ChevronRight, History, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { mockStorage } from "@/lib/services/mockStorage";
import { CustomerAccount, Transaction } from "@/lib/types";

function maskEmail(email?: string): string {
  if (!email || !email.includes("@")) return "ken•••@perapin.com";
  const [local, domain] = email.split("@");
  if (local.length <= 3) {
    return `${local}•••@${domain}`;
  }
  return `${local.slice(0, 3)}•••@${domain}`;
}

function formatXlmBalance(val: string | null): string {
  if (!val) return "0.00";
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ConsumerDashboard() {
  const [activeCustomer, setActiveCustomer] = useState<CustomerAccount | null>(null);
  const [txs, setTxs] = useState<Transaction[]>([]);

  const [liveBalanceXlm, setLiveBalanceXlm] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    const customer = mockStorage.getActiveCustomer();
    const activePublicKey = localStorage.getItem("perapin_active_public_key") || customer?.stellarPublicKey;
    const activeEmail = localStorage.getItem("perapin_user_email");

    if (customer) {
      setActiveCustomer(customer);
    }

    if (activePublicKey || activeEmail) {
      const query = activePublicKey ? `publicKey=${activePublicKey}` : `email=${activeEmail}`;
      fetch(`/api/user/me?${query}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            if (!customer) {
              setActiveCustomer({
                customerId: data.user.stellarPublicKey,
                name: data.user.email.split("@")[0],
                phone: data.user.email,
                kycType: "UMID",
                kycId: "Registered",
                pin: "****",
                stellarPublicKey: data.user.stellarPublicKey,
                balance: parseFloat(data.balanceXlm || "0"),
                registeredAt: data.user.createdAt,
              });
            }
          }
          if (data.balanceXlm) setLiveBalanceXlm(data.balanceXlm);
          if (data.isLocked !== undefined) setIsLocked(data.isLocked);
        })
        .catch(() => {
          if (customer) setLiveBalanceXlm(customer.balance.toFixed(2));
        });
    }

    if (customer) {
      const allTxs = mockStorage.getTransactions();
      const filtered = allTxs.filter(
        (tx) =>
          tx.partnerId === customer.customerId || 
          tx.id.includes(customer.customerId) || 
          tx.type === "signup_bonus"
      );
      setTxs(filtered);
    }
  }, []);

  if (!activeCustomer) {
    return (
      <div className="py-12 text-center text-slate-500">
        Loading customer data...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 py-4"
    >
      {/* Balance Card */}
      <div
        className="bg-white border border-slate-200 shadow-md rounded-3xl p-5 flex flex-col justify-between space-y-4 overflow-hidden"
        id="wallet-balance-card"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-2">
            <span className="text-[10px] text-slate-400 block uppercase font-mono tracking-wider">
              PeraPin XLM Balance
            </span>
            {liveBalanceXlm === null ? (
              <div className="h-9 w-44 bg-slate-100 rounded-xl animate-pulse mt-1" />
            ) : (
              <h2 className="text-3xl font-bold font-mono text-slate-800 tracking-tight truncate" title={`${liveBalanceXlm} XLM`}>
                {formatXlmBalance(liveBalanceXlm)} <span className="text-lg font-semibold text-slate-500">XLM</span>
              </h2>
            )}
          </div>
          <div className="flex-shrink-0">
            <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 py-1 px-2.5 rounded-lg font-mono font-medium whitespace-nowrap shadow-xs inline-block">
              Stellar Wallet
            </span>
          </div>
        </div>

        <div
          className="border-t border-slate-100 pt-3 flex justify-between items-center text-[11px]"
          id="wallet-metadata"
        >
          <div>
            <span className="text-slate-400">Consumer:</span>
            <p className="text-slate-800 font-bold">{activeCustomer.name}</p>
            <p className="text-[10px] text-slate-500 font-mono">
              {maskEmail(localStorage.getItem("perapin_user_email") || activeCustomer.phone)}
            </p>
          </div>
          <div className="text-right max-w-[55%]">
            <span className="text-slate-400 text-right block font-sans">
              Stellar Key:
            </span>
            <p className="text-slate-800 font-mono font-bold text-[10px] truncate" title={activeCustomer.customerId}>
              {activeCustomer.customerId.length > 16
                ? `${activeCustomer.customerId.slice(0, 8)}...${activeCustomer.customerId.slice(-6)}`
                : activeCustomer.customerId}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action to view Sticker QR */}
      <Link
        href="/consumer/qr"
        className="w-full flex items-center justify-between p-3.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-2xl transition-all shadow-xs"
        id="btn-show-qr"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl" id="dashboard-qr-icon">
            <QrCode className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-slate-800">
              Display Static Payment Sticker
            </p>
            <p className="text-[10px] text-slate-500">
              Open QR sticker to show, print, or download
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </Link>

      {/* Transaction History List */}
      <div className="space-y-3 flex flex-col" id="customer-tx-history">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider font-mono">
            <History className="w-4 h-4 text-blue-600" />
            On-Chain Ledger History
          </h3>
          <span className="text-[9px] text-slate-400 font-mono">
            Real-time updates
          </span>
        </div>

        {txs.length === 0 ? (
          <div className="text-center p-8 bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs">
            No transactions registered yet.
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[280px]" id="tx-log-scroll">
            {txs.map((tx) => (
              <div
                key={tx.id}
                className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg ${
                      tx.type === "signup_bonus"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {tx.type === "signup_bonus" ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{tx.partnerName}</p>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {new Date(tx.timestamp).toLocaleString("en-US", {
                        hour12: false,
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`font-mono font-bold ${
                      tx.type === "signup_bonus" ? "text-emerald-650" : "text-slate-800"
                    }`}
                  >
                    {tx.type === "signup_bonus" ? "+" : "-"}₱{tx.amount.toFixed(2)}
                  </p>
                  <span
                    className={`text-[8px] font-mono font-bold px-1 py-0.2 rounded ${
                      tx.status === "success"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-500"
                    }`}
                  >
                    {tx.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
