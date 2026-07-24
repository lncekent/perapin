"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  user: { businessName?: string; stellarPublicKey: string };
  balanceXlm: string;
}
export default function MerchantDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  useEffect(() => {
    fetch("/api/user/me")
      .then((r) => r.json())
      .then(setProfile);
  }, []);
  if (!profile) return <p className="py-12 text-center text-slate-500">Loading merchant wallet…</p>;
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{profile.user.businessName || "Merchant dashboard"}</h1>
        <p className="text-sm text-slate-500">Ready to accept merchant-pull payments.</p>
      </div>
      <section className="rounded-3xl bg-emerald-600 p-6 text-white">
        <p className="text-sm text-emerald-100">Received wallet balance</p>
        <p className="mt-2 text-4xl font-bold">
          {Number(profile.balanceXlm).toFixed(2)} <span className="text-lg">XLM</span>
        </p>
      </section>
      <Link
        href="/merchant/scan"
        className="flex min-h-14 items-center justify-center rounded-2xl bg-blue-600 px-4 font-bold text-white"
      >
        Accept a payment
      </Link>
      <Link
        href="/merchant/history"
        className="flex min-h-14 items-center justify-center rounded-2xl border bg-white px-4 font-bold"
      >
        Incoming payment history
      </Link>
    </div>
  );
}
