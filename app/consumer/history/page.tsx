"use client";

import { useEffect, useState } from "react";
interface Tx {
  id: string;
  stellar_tx_hash: string;
  from_public_key: string;
  to_public_key: string;
  amount_xlm: number;
  status: string;
  created_at: string;
}
export default function ConsumerHistoryPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [wallet, setWallet] = useState("");
  useEffect(() => {
    Promise.all([
      fetch("/api/user/me").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
    ]).then(([profile, tx]) => {
      setWallet(profile.user.stellarPublicKey);
      setTransactions(tx.transactions || []);
    });
  }, []);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Payment history</h1>
        <p className="text-sm text-slate-500">Confirmed PeraPin payments.</p>
      </div>
      {transactions.length === 0 ? (
        <p className="rounded-2xl border bg-white p-5 text-slate-500">No payments yet.</p>
      ) : (
        transactions.map((tx) => (
          <article key={tx.id} className="rounded-2xl border bg-white p-4">
            <div className="flex justify-between gap-3">
              <strong>{tx.from_public_key === wallet ? "Sent" : "Received"}</strong>
              <strong>{Number(tx.amount_xlm).toFixed(2)} XLM</strong>
            </div>
            <p className="mt-1 font-mono text-xs text-slate-500">{tx.stellar_tx_hash}</p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(tx.created_at).toLocaleString()}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
