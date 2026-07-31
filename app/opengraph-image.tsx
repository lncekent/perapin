import { ImageResponse } from "next/og";

// Route segment config
export const alt = "PeraPin — Zero-Connectivity Digital Payments on Stellar/Soroban";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Image generation
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #2563eb 100%)",
        padding: "72px",
        fontFamily: "sans-serif",
        color: "white",
      }}
    >
      {/* Top: logo mark + wordmark */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "96px",
            height: "96px",
            borderRadius: "24px",
            background: "#2563eb",
            boxShadow: "0 8px 32px rgba(37, 99, 235, 0.55)",
            fontSize: "60px",
            fontWeight: 700,
          }}
        >
          ₱
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
          }}
        >
          PeraPin
        </div>
      </div>

      {/* Middle: headline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: "68px",
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            maxWidth: "1000px",
          }}
        >
          Pay with a QR sticker — even when your phone is dead.
        </div>
        <div
          style={{
            fontSize: "30px",
            fontWeight: 400,
            color: "#cbd5e1",
            maxWidth: "940px",
          }}
        >
          Merchant-pull micropayments for zero-connectivity consumers, built on Stellar / Soroban.
        </div>
      </div>

      {/* Bottom: tags */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {["Stellar Testnet", "Soroban", "Offline-first", "🇵🇭 Philippines"].map((tag) => (
          <div
            key={tag}
            style={{
              display: "flex",
              fontSize: "24px",
              fontWeight: 600,
              color: "#e2e8f0",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "999px",
              padding: "10px 24px",
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
