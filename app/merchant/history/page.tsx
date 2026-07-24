"use client";

import { useEffect, useState } from "react";
interface Tx {
  id: string;
  stellar_tx_hash: string;
  amount_xlm: number;
  created_at: string;
}
export default function MerchantHistoryPage() {
  const [transactions, setTransactions] = useState<Tx[]>([]);
  useEffect(() => {
    fetch("/api/transactions")
      .then((r) => r.json())
      .then((data) => setTransactions(data.transactions || []));
  }, []);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Incoming payments</h1>
        <p className="text-sm text-slate-500">Confirmed Testnet settlements.</p>
      </div>
      {transactions.length === 0 ? (
        <p className="rounded-2xl border bg-white p-5 text-slate-500">No payments received yet.</p>
      ) : (
        transactions.map((tx) => (
          <article key={tx.id} className="rounded-2xl border bg-white p-4">
            <div className="flex justify-between">
              <strong>Received</strong>
              <strong>{Number(tx.amount_xlm).toFixed(2)} XLM</strong>
            </div>
            <p className="mt-1 font-mono text-xs break-all text-slate-500">{tx.stellar_tx_hash}</p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(tx.created_at).toLocaleString()}
            </p>
          </article>
        ))
      )}
    </div>
  );
}
