"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert, RotateCcw, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary (Next.js App Router). Catches unexpected render
 * errors in any page under app/ so users get a friendly, recoverable screen
 * instead of a blank/crash. Rendered inside the root layout, so the brand
 * tokens are available.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console (and any monitoring/analytics) for debugging.
    console.error("PeraPin app error:", error);
  }, [error]);

  return (
    <main className="bg-brand-wash flex min-h-screen items-center justify-center px-6 py-12">
      <Card variant="raised" padding="lg" className="w-full max-w-md space-y-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-red-100">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Something went wrong
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            An unexpected error interrupted this page. Your wallet and funds are safe.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="primary" size="lg" block onClick={reset}>
            <RotateCcw className="size-5" aria-hidden="true" /> Try again
          </Button>
          <Link href="/" className="block">
            <Button variant="secondary" size="lg" block>
              <Home className="size-5" aria-hidden="true" /> Back to home
            </Button>
          </Link>
        </div>
        {error?.digest && (
          <p className="text-[11px] text-slate-400">Error reference: {error.digest}</p>
        )}
      </Card>
    </main>
  );
}
