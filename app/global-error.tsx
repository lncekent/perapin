"use client";

import { useEffect } from "react";

/**
 * Last-resort error boundary (Next.js App Router). This replaces the ENTIRE
 * document (including the root layout) when the root layout itself throws, so
 * it must render its own <html>/<body> and cannot rely on the app's global
 * CSS. Styles are inlined so it is guaranteed to render.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("PeraPin global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "28rem",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "24px",
            padding: "28px",
            textAlign: "center",
            boxShadow: "0 6px 16px -6px rgba(15,23,42,0.1)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              margin: "0 auto 14px",
              height: 56,
              width: 56,
              borderRadius: 16,
              background: "#fef2f2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            !
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>
            PeraPin hit an unexpected error. Your wallet and funds are safe.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 22,
              width: "100%",
              minHeight: 48,
              borderRadius: 16,
              border: "none",
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
