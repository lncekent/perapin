"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  user: { email: string; stellarPublicKey: string };
  balanceXlm: string;
  isLocked: boolean;
  pinSetupRequired: boolean;
}
export default function ConsumerDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch("/api/user/me")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setProfile(data);
      })
      .catch((cause) =>
        setError(cause instanceof Error ? cause.message : "Unable to load wallet."),
      );
  }, []);
  if (error) return <p className="rounded-xl bg-red-50 p-3 text-red-700">{error}</p>;
  if (!profile) return <p className="py-12 text-center text-slate-500">Loading wallet…</p>;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Hello, {profile.user.email.split("@")[0]}</h1>
        <p className="text-sm text-slate-500">Your Testnet PeraPin wallet</p>
      </div>
      {profile.pinSetupRequired && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Finish PIN setup before using your payment sticker.{" "}
          <Link href="/register/consumer" className="font-bold underline">
            Continue setup
          </Link>
        </div>
      )}
      <section className="rounded-3xl bg-blue-700 p-6 text-white">
        <p className="text-sm text-blue-100">Available XLM</p>
        <p className="mt-2 text-4xl font-bold">
          {Number(profile.balanceXlm).toFixed(2)} <span className="text-lg">XLM</span>
        </p>
        {profile.isLocked && (
          <p className="mt-3 rounded-xl bg-red-500/30 p-2 text-sm">
            Wallet temporarily locked after failed PIN attempts.
          </p>
        )}
      </section>
      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/consumer/qr"
          className="min-h-24 rounded-2xl border bg-white p-4 font-semibold"
        >
          Your QR sticker
        </Link>
        <Link
          href="/consumer/topup"
          className="min-h-24 rounded-2xl border bg-white p-4 font-semibold"
        >
          Fund wallet
        </Link>
        <Link
          href="/consumer/history"
          className="min-h-24 rounded-2xl border bg-white p-4 font-semibold"
        >
          Payment history
        </Link>
        <Link
          href="/consumer/settings"
          className="min-h-24 rounded-2xl border bg-white p-4 font-semibold"
        >
          Change PIN
        </Link>
      </section>
    </div>
  );
}
