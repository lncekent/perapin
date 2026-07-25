import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * 404 page (Next.js App Router). Rendered inside the root layout.
 */
export default function NotFound() {
  return (
    <main className="bg-brand-wash flex min-h-screen items-center justify-center px-6 py-12">
      <Card variant="raised" padding="lg" className="w-full max-w-md space-y-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-money-gradient text-white shadow-money">
          <Compass className="size-7" aria-hidden="true" />
        </div>
        <div>
          <p className="font-mono text-sm font-bold text-brand-600">404</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Page not found
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
        </div>
        <Link href="/" className="block">
          <Button variant="primary" size="lg" block>
            <Home className="size-5" aria-hidden="true" /> Back to home
          </Button>
        </Link>
      </Card>
    </main>
  );
}
