"use client";

import { useEffect, useState } from "react";

export default function ConsumerTopupPage() {
  const [wallet, setWallet] = useState("");
  const [balance, setBalance] = useState("");
  const [copied, setCopied] = useState(false);
  const load = () =>
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => {
        setWallet(data.user.stellarPublicKey);
        setBalance(data.balanceXlm);
      });
  useEffect(() => {
    load();
  }, []);
  async function copy() {
    await navigator.clipboard.writeText(wallet);
    setCopied(true);
  }
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Fund your Testnet wallet</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use Friendbot or send Testnet XLM to this public address.
        </p>
      </div>
      <section className="rounded-3xl border bg-white p-5">
        <p className="text-sm text-slate-500">Current balance</p>
        <p className="mt-1 text-3xl font-bold">{balance ? Number(balance).toFixed(2) : "…"} XLM</p>
        <button onClick={load} className="mt-3 text-sm font-semibold text-blue-700">
          Refresh balance
        </button>
      </section>
      <section className="rounded-3xl border bg-white p-5">
        <p className="text-sm font-semibold">Stellar public key</p>
        <p className="mt-2 rounded-xl bg-slate-50 p-3 font-mono text-xs break-all">{wallet}</p>
        <button onClick={copy} className="mt-3 min-h-11 rounded-xl border px-4 text-sm font-bold">
          {copied ? "Copied" : "Copy address"}
        </button>
      </section>
      {wallet && (
        <a
          href={`https://friendbot.stellar.org?addr=${encodeURIComponent(wallet)}`}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-14 items-center justify-center rounded-2xl bg-blue-600 font-bold text-white"
        >
          Open Stellar Testnet Friendbot
        </a>
      )}
    </div>
  );
}
