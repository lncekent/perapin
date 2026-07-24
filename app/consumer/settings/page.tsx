"use client";

import { FormEvent, useEffect, useState } from "react";
import { computePinHash } from "@/lib/client-crypto";
export default function ConsumerSettingsPage() {
  const [wallet, setWallet] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then((data) => setWallet(data.user.stellarPublicKey));
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (newPin !== confirm) return setMessage("New PIN entries do not match.");
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/user/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPinHash: await computePinHash(oldPin, wallet),
          newPinHash: await computePinHash(newPin, wallet),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      setMessage("PIN changed successfully on Stellar Testnet.");
      setOldPin("");
      setNewPin("");
      setConfirm("");
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to change PIN.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Security settings</h1>
        <p className="text-sm text-slate-500">Change your four-digit PeraPin PIN.</p>
      </div>
      {message && <p className="rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
      {[
        [oldPin, setOldPin, "Current PIN"],
        [newPin, setNewPin, "New PIN"],
        [confirm, setConfirm, "Confirm new PIN"],
      ].map(([value, setter, label]) => (
        <label key={String(label)} className="block text-sm font-semibold">
          {String(label)}
          <input
            required
            type="password"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            value={String(value)}
            onChange={(e) => (setter as (v: string) => void)(e.target.value.replace(/\D/g, ""))}
            className="mt-1 w-full rounded-xl border p-3 text-center text-xl tracking-[0.3em]"
          />
        </label>
      ))}
      <button
        disabled={loading || !wallet}
        className="w-full rounded-xl bg-blue-600 p-3 font-bold text-white"
      >
        {loading ? "Updating…" : "Change PIN"}
      </button>
    </form>
  );
}
