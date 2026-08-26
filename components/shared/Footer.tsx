"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState<string>("");

  // Sync hash for product section links
  useEffect(() => {
    const syncHash = () => {
      setActiveHash(window.location.hash);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  const isActiveRoute = (href: string) => {
    // For hash links (e.g. /#use-cases)
    if (href.startsWith("/#")) {
      const hash = href.replace("/", "");
      return pathname === "/" && activeHash === hash;
    }
    // For page links (e.g. /about, /faq)
    return pathname === href;
  };

  return (
    <footer className="border-t border-slate-200/70 bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-md md:max-w-4xl">
        <div className="grid grid-cols-2 items-start gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col items-center justify-center space-y-3 md:items-start">
            <div className="flex items-center gap-2">
              <span className="bg-money-gradient flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white">
                ₱
              </span>
              <span className="text-sm font-bold text-slate-900">PeraPin</span>
            </div>
            <p className="text-center text-[11px] leading-relaxed text-slate-400 md:text-left">
              Blockchain micropayments for informal economies. Built on Stellar/Soroban.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Product
            </h4>
            <nav className="flex flex-col gap-1.5 text-xs text-slate-500">
              <Link
                href="/#use-cases"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/#use-cases")
                    ? "text-brand-600 font-semibold"
                    : "hover:text-brand-600",
                )}
              >
                Use Cases
              </Link>
              <Link
                href="/#how-it-works"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/#how-it-works")
                    ? "text-brand-600 font-semibold"
                    : "hover:text-brand-600",
                )}
              >
                How it Works
              </Link>
              <Link
                href="/#features"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/#features")
                    ? "text-brand-600 font-semibold"
                    : "hover:text-brand-600",
                )}
              >
                Features
              </Link>
              <Link
                href="/#security"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/#security")
                    ? "text-brand-600 font-semibold"
                    : "hover:text-brand-600",
                )}
              >
                Security
              </Link>
              <Link
                href="/feedback"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/feedback")
                    ? "text-brand-600 font-semibold"
                    : "hover:text-brand-600",
                )}
              >
                Submit Feedback
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Resources
            </h4>
            <nav className="flex flex-col gap-1.5 text-xs text-slate-500">
              <a
                href="https://github.com/lncekent/perapin"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600 transition-colors"
              >
                GitHub Repository
              </a>
              <a
                href="https://stellar.expert/explorer/testnet/contract/CBEASRMFLJOTK6PVM6276THY26GVNYUXKDWF3JVPKGYEC63MUSQV5P3D"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600 transition-colors"
              >
                Stellar Explorer
              </a>
              <a
                href="https://soroban.stellar.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-600 transition-colors"
              >
                Soroban Docs
              </a>
            </nav>
          </div>

          {/* Company / Legal */}
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Company
            </h4>
            <nav className="flex flex-col gap-1.5 text-xs text-slate-500">
              <Link
                href="/about"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/about") ? "text-brand-600 font-semibold" : "hover:text-brand-600",
                )}
              >
                About PeraPin
              </Link>
              <Link
                href="/faq"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/faq") ? "text-brand-600 font-semibold" : "hover:text-brand-600",
                )}
              >
                FAQ / Help
              </Link>
              <Link
                href="/privacy"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/privacy")
                    ? "text-brand-600 font-semibold"
                    : "hover:text-brand-600",
                )}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className={cn(
                  "transition-colors",
                  isActiveRoute("/terms") ? "text-brand-600 font-semibold" : "hover:text-brand-600",
                )}
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-slate-200/70 pt-6 text-center">
          <p className="text-[10px] leading-relaxed text-slate-400">
            Built by{" "}
            <span className="font-semibold text-slate-600">Lance Kent Geoffrey B. Magollado</span> ·
            MIT License · 2026
          </p>
          <p className="mt-1 text-[10px] text-slate-300">
            Stellar Testnet · Contract: CBEAS...V5P3D
          </p>
        </div>
      </div>
    </footer>
  );
}
