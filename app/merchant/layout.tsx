"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ScanLine, ReceiptText, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { toast } from "@/components/ui/toast";
import { setCachedValue, clearCachedValues } from "@/lib/use-cached-fetch";

const links = [
  { href: "/merchant/dashboard", label: "Home", icon: Home },
  { href: "/merchant/scan", label: "Accept", icon: ScanLine },
  { href: "/merchant/history", label: "History", icon: ReceiptText },
  { href: "/merchant/settings", label: "Settings", icon: Settings },
] as const;

export default function MerchantLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  useEffect(() => {
    fetch("/api/user/me")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || data.user?.role !== "merchant") {
          router.replace("/login");
          return;
        }
        setCachedValue("me", data);
        setReady(true);
      })
      .catch(() => router.replace("/login"));
  }, [router]);
  async function confirmLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    clearCachedValues();
    toast.add({
      title: "Logged out",
      description: "You’ve been signed out safely.",
      type: "success",
    });
    router.replace("/login");
  }
  if (!ready)
    return (
      <div className="bg-brand-wash flex min-h-screen items-center justify-center">
        <div className="border-brand-100 border-t-brand-600 h-10 w-10 animate-spin rounded-full border-4" />
      </div>
    );
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-5 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link href="/merchant/dashboard" className="flex items-center gap-2">
            <span className="bg-money-gradient flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-white">
              ₱
            </span>
            <div>
              <span className="block font-bold text-slate-900">
                PeraPin
                <span className="-mt-0.5 block text-xs font-medium text-slate-400">Merchant</span>
              </span>
            </div>
          </Link>
          <button
            onClick={() => setLogoutOpen(true)}
            className="inline-flex min-h-11 flex-shrink-0 items-center gap-1.5 rounded-xl px-3 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 py-5 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                  active ? "text-brand-700" : "text-slate-400 hover:text-slate-600",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        tone="danger"
        icon={<LogOut className="size-5" />}
        title="Log out?"
        description="You’ll need to sign in again with an email code to accept payments."
        confirmLabel="Log out"
        loadingLabel="Logging out…"
        loading={loggingOut}
        onConfirm={confirmLogout}
      />
    </div>
  );
}
