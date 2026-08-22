import Link from "next/link";
import { Button } from "../ui/button";

export function Navigation() {
  return (
    <>
      {/* ===== HEADER ===== */}
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
            <a href="/#use-cases" className="hover:text-brand-600 transition-colors">
              Use Cases
            </a>
            <a href="/#features" className="hover:text-brand-600 transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-brand-600 transition-colors">
              How it Works
            </a>
            <a href="/#security" className="hover:text-brand-600 transition-colors">
              Security
            </a>
            <a href="/#testimonials" className="hover:text-brand-600 transition-colors">
              Feedback
            </a>
          </nav>

          <Link href="/login">
            <Button variant="secondary" size="sm">
              Sign in
            </Button>
          </Link>
        </div>
      </header>
    </>
  );
}
