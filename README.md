# 📍 PeraPin ₱ 

> **Merchant-Pull Micropayments for Zero-Connectivity Consumers on Stellar/Soroban**

[![Stellar Testnet](https://img.shields.io/badge/Stellar-Testnet-blue.svg)](https://stellar.expert/explorer/testnet/contract/CBEASRMFLJOTK6PVM6276THY26GVNYUXKDWF3JVPKGYEC63MUSQV5P3D)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Framework-Next.js%2016-black)](https://nextjs.org/)
[![Soroban SDK](https://img.shields.io/badge/Smart%20Contract-Soroban%20SDK%20v27-orange)](https://soroban.stellar.org/)

PeraPin enables consumers in informal micro-economies (sari-sari stores, school canteens, PUVs) to pay for goods using a static **QR code sticker** — even when their smartphone is dead, offline, or left at home.

---

## 🚀 Quick Links & Submission Info

| Item | Details / Link |
|---|---|
| **Live Production MVP** | [https://perapin.vercel.app](https://perapin.vercel.app) |
| **GitHub Repository** | [https://github.com/lncekent/perapin](https://github.com/lncekent/perapin) |
| **Soroban Contract ID** | `CBEASRMFLJOTK6PVM6276THY26GVNYUXKDWF3JVPKGYEC63MUSQV5P3D` |
| **Stellar Expert Explorer** | [View Contract on Explorer](https://stellar.expert/explorer/testnet/contract/CBEASRMFLJOTK6PVM6276THY26GVNYUXKDWF3JVPKGYEC63MUSQV5P3D) |
| **Demo Video** | [Video Link]() |

---

## 📸 Media & Evidence

### 1. Product Screenshots

| Consumer Dashboard | Merchant QR Scan | PIN Handoff Pad |
|:---:|:---:|:---:|
| ![Consummer Screenshot](https://res.cloudinary.com/dxatb3m2q/image/upload/v1784980678/Screenshot_2026-07-25_195744_pmsfqg.png) | ![Merchant Screenshot](https://res.cloudinary.com/dxatb3m2q/image/upload/v1784981755/Screenshot_2026-07-25_201536_syhylx.png) | ![PIN Handoff Pad](https://res.cloudinary.com/dxatb3m2q/image/upload/v1784982300/7f549c47-eee4-42cb-a19b-aedc3f758ec0_1_zreuqt.png) |

### 2. Mobile Responsive Design (375px Viewport)

| Mobile Navigation | Merchant Payment Confirmation |
|:---:|:---:|
| ![Mobile Navigation](https://res.cloudinary.com/dxatb3m2q/image/upload/v1784981870/Screenshot_2026-07-25_201713_w8pnze.png) | ![Merchant Payment Confirmation](https://res.cloudinary.com/dxatb3m2q/image/upload/v1784982299/d0c9c3be-b653-45de-a0c6-d200f1176559_1_pdquqc.png) |

### 3. Analytics & Monitoring Setup

| Vercel Analytics Dashboard | Inspector Console |
|:---:|:---:|
| *[PLACEHOLDER: Add Screenshot]* | *[PLACEHOLDER: Add Screenshot]* |

---

## 👥 Proof of 10+ Real User Wallet Interactions

Once users test PeraPin, their on-chain testnet settlements are logged on the Stellar Explorer:

| # | User Email / Identifier | Role | Stellar Public Key | On-Chain Tx Hash |
|---|---|---|---|---|
| 1 | *[User 1]* | Consumer | `G...` | `[Explorer Link]` |
| 2 | *[User 2]* | Consumer | `G...` | `[Explorer Link]` |
| 3 | *[User 3]* | Consumer | `G...` | `[Explorer Link]` |
| 4 | *[User 4]* | Consumer | `G...` | `[Explorer Link]` |
| 5 | *[User 5]* | Consumer | `G...` | `[Explorer Link]` |
| 6 | *[User 6]* | Consumer | `G...` | `[Explorer Link]` |
| 7 | *[User 7]* | Consumer | `G...` | `[Explorer Link]` |
| 8 | *[User 8]* | Consumer | `G...` | `[Explorer Link]` |
| 9 | *[User 9]* | Merchant | `G...` | `[Explorer Link]` |
| 10 | *[User 10]* | Merchant | `G...` | `[Explorer Link]` |

---

## 💬 User Feedback Summary

Feedback collected securely via `/feedback` into Supabase:

| User | Role | Rating | Comment / Feedback |
|---|---|---|---|
| *[User 1]* | Consumer | ⭐⭐⭐⭐⭐ | *"Payment was fast even without signal!"* |
| *[User 2]* | Merchant | ⭐⭐⭐⭐⭐ | *"Scanning QR was seamless on mobile."* |
| *[User 3]* | Consumer | ⭐⭐⭐⭐☆ | *"PIN overlay felt safe and easy."* |

---

## 💡 The Merchant-Pull Model

Digital payment systems assume consumers have working smartphones, active data, and battery. PeraPin flips this paradigm:

```
┌─────────────────┐       Scans QR Sticker      ┌──────────────────┐
│  Consumer QR    │ ──────────────────────────> │ Merchant Phone   │
│ (Zero Power/Data)│                             │ (Active Device)  │
└─────────────────┘                             └─────────┬────────┘
         │                                                │
         │ Hands phone to consumer for 4-digit PIN        │
         └────────────────────────────────────────────────┘
                                  │
                                  ▼
               ┌──────────────────────────────────────┐
               │ SHA-256 (PIN + Public Key) in Browser │
               └──────────────────┬───────────────────┘
                                  │
                                  ▼
               ┌──────────────────────────────────────┐
               │ Soroban Contract `pay()` on Testnet  │
               └──────────────────────────────────────┘
```

1. **Merchant scans consumer sticker** using their phone camera (or manual public key).
2. **Merchant inputs transaction amount** in XLM.
3. **Merchant hands phone to consumer** to enter a 4-digit PIN on a secure dark overlay.
4. **Browser computes SHA-256 hash** client-side: `SHA-256(PIN + Public_Key)`.
5. **API submits transaction** to Soroban smart contract, moving XLM on Stellar Testnet upon verification.

---

## 🔐 PIN Security & Key Management

* **Client-Side Hashing:** Raw 4-digit PINs **never leave the browser**. Hashing uses native `window.crypto.subtle.digest("SHA-256")` with the user's public key as salt.
* **On-Chain Brute Force Lockout:** 3 consecutive failed PIN entries trigger an automated **15-minute on-chain lockout** enforced by the Soroban smart contract.
* **Custodial Key Encryption:** Merchant & Consumer private keys are encrypted using **AES-256-GCM** before database storage in Supabase. Keys are decrypted in-memory only during payload construction and scrubbed immediately in a `finally` block.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router, React 19, TypeScript) |
| **Styling** | Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Smart Contract** | Rust, Soroban SDK v27 |
| **Blockchain SDK** | `@stellar/stellar-sdk` |
| **Authentication** | Supabase Auth (Email OTP, Gmail SMTP, `@supabase/ssr`) |
| **Database** | Supabase PostgreSQL |
| **QR Scanner / Generator** | `@zxing/browser`, `qrcode` |
| **Hosting & Analytics** | Vercel, `@vercel/analytics` |

---

## ⚙️ Local Development Setup

### Prerequisites
* **Node.js**: v20.x or later
* **Rust & Stellar CLI**: Rust 2021 toolchain (`stellar-cli` / `soroban-cli`)
* **WASM Target**: `rustup target add wasm32v1-none`

### Environment Variables
Copy `.env.example` to `.env.local` and populate:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SOROBAN_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_SOROBAN_CONTRACT_ID="CBEASRMFLJOTK6PVM6276THY26GVNYUXKDWF3JVPKGYEC63MUSQV5P3D"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
ENCRYPTION_SECRET="your-32byte-aes-encryption-secret"
```

### Installation & Run

```bash
# Install dependencies
npm install

# Run Next.js local server
npm run dev

# Run Prettier code formatting
npm run format

# Run production build check
npm run build
```

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
