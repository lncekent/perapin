"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const navLinks = [
  { href: "/#use-cases", label: "Use Cases", sectionId: "use-cases" },
  { href: "/#features", label: "Features", sectionId: "features" },
  { href: "/#how-it-works", label: "How it Works", sectionId: "how-it-works" },
  { href: "/#security", label: "Security", sectionId: "security" },
  { href: "/#testimonials", label: "Feedback", sectionId: "testimonials" },
];

export function Navigation() {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const [activeSection, setActiveSection] = useState<string>("");

  // Track which section is visible using IntersectionObserver
  useEffect(() => {
    if (!isLandingPage) return;

    const sectionIds = navLinks.map((link) => link.sectionId);
    const observers: IntersectionObserver[] = [];

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      }
    };

    // Observe each section with a rootMargin that triggers when section enters top portion
    for (const id of sectionIds) {
      const element = document.getElementById(id);
      if (!element) continue;

      const observer = new IntersectionObserver(handleIntersect, {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      });

      observer.observe(element);
      observers.push(observer);
    }

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [isLandingPage]);

  // Also sync with hash on initial load / hash change
  useEffect(() => {
    if (!isLandingPage) return;

    const syncHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && navLinks.some((link) => link.sectionId === hash)) {
        setActiveSection(hash);
      }
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [isLandingPage]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <svg className="h-9 w-9 flex-shrink-0" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="landing-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b6af5" />
                <stop offset="100%" stopColor="#1e40af" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="9" fill="url(#landing-logo-grad)" />
            <rect
              x="0.5"
              y="0.5"
              width="31"
              height="31"
              rx="8.5"
              stroke="white"
              strokeOpacity="0.2"
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="central"
              textAnchor="middle"
              fill="white"
              fontSize="18"
              fontWeight="bold"
            >
              ₱
            </text>
          </svg>
          <div>
            <span className="block text-lg font-bold tracking-tight text-slate-900">PeraPin</span>
            <span className="-mt-0.5 block font-mono text-[10px] tracking-[0.2em] text-slate-400">
              SOROBAN PAY
            </span>
          </div>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => {
            const isActive = isLandingPage && activeSection === link.sectionId;
            return (
              <a
                key={link.sectionId}
                href={link.href}
                className={cn(
                  "transition-colors",
                  isActive ? "text-brand-600" : "hover:text-brand-600",
                )}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        <Link href="/login">
          <Button variant="secondary" size="sm">
            Sign in
          </Button>
        </Link>
      </div>
    </header>
  );
}
