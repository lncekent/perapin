"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function MerchantLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [businessName, setBusinessName] = useState("PeraPin Merchant");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    fetch("/api/user/me")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data.user?.role !== "merchant") {
          router.replace("/login");
          return;
        }
        setBusinessName(data.user.businessName || "PeraPin Merchant");
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }
  if (!ready)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  const links = [
    ["/merchant/dashboard", "Home"],
    ["/merchant/scan", "Accept"],
    ["/merchant/history", "History"],
  ] as const;
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b bg-white px-5 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/merchant/dashboard" className="truncate pr-2 font-bold text-blue-700">
            {businessName}
          </Link>
          <button
            onClick={logout}
            className="min-h-11 rounded-lg px-3 text-sm text-red-700 hover:bg-red-50"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-5 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`min-h-14 py-4 text-center text-xs ${pathname === href ? "font-bold text-blue-700" : "text-slate-500"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
