# PeraPin — AI Agent Context File

> **READ THIS FIRST.** This file is loaded automatically by AI coding assistants at the start
> of every session. It defines the project's architecture, conventions, and hard constraints.
> Never skip this file. Never contradict the rules below without explicit user approval.

---

## 📌 Project Overview

**PeraPin** is a blockchain-based micropayment system built on the **Stellar Network** using
**Soroban smart contracts**. It enables consumers to pay for goods and services using a static
**QR code sticker** — even when their smartphone is dead, offline, or left at home.

**Full PRD:** [`docs/perapin-prd.md`](./docs/perapin-prd.md)  
> ⚠️ Read the PRD before implementing any feature. It is the single source of truth.

---

## 🏗️ Payment Model — CRITICAL

PeraPin uses a **Merchant-Pull** model. This is a hard constraint that must never be violated.

| Rule | Detail |
|---|---|
| ✅ Merchant scans consumer's QR | The merchant's phone does all the active work |
| ✅ Consumer enters PIN on merchant's phone | PIN entry happens on the merchant's device |
| ❌ Consumer-Pull is OUT OF SCOPE | The consumer's phone is NEVER active during payment |
| ❌ Consumer app is NOT needed | No app on the consumer's side for payment |

---

## 🔐 PIN Security — CRITICAL CONVENTIONS

These conventions are locked. Do not deviate.

### Hashing Algorithm
```
pin_hash = SHA-256(raw_4_digit_pin + consumer_stellar_public_key)
```
- The **Stellar public key is used as a per-user salt** (prevents rainbow table attacks)
- Hashing happens **client-side in the browser** using the native **Web Crypto API**
- The raw PIN **never leaves the browser** — only the hex-encoded hash is sent to the server
- The server **never sees** nor logs the raw PIN

### Brute Force Lockout (enforced ON-CHAIN)
- 3 consecutive failed attempts → 15-minute lockout
- Lockout state is stored in the **Soroban smart contract** (tamper-proof)
- A successful payment resets the failed attempt counter to 0
- Lockout uses **Stellar ledger timestamp** for timing (not server time)

---

## ⛓️ Blockchain Layer

| Setting | Value |
|---|---|
| **Network** | Stellar Testnet (Horizon + Soroban RPC) |
| **Contract ID** | `CBJZXQKOAVURMAJXOBUNHOXCYEULO33OJATYKSXAMTPGL22WPHBIH7ND` |
| **WASM Hash** | `d36c137634649aedd8eadf98960ffc36d2f960e1e948c08297cc7e28ed493a9e` |
| **Contract Language** | Rust (Soroban SDK v27) |
| **Token** | XLM only (no custom tokens in MVP) |
| **Model** | Custodial wallets (backend holds encrypted private keys) |
| **Key Encryption** | AES-256-GCM, encrypted before Supabase storage |
| **Encryption Key** | Stored in Vercel environment variables only, never in DB |

### Smart Contract Storage Layout
```rust
enum DataKey {
    PinHash(Address),        // SHA-256 pin hash per wallet
    FailedAttempts(Address), // Counter: 0–3 (3 = locked)
    LockTimestamp(Address),  // Ledger timestamp when lockout started
}
```

### Smart Contract Functions
| Function | Description |
|---|---|
| `register(wallet_address, pin_hash)` | One-time setup: store pin_hash on-chain |
| `pay(from, to, amount, submitted_hash)` | Verify hash → check balance → transfer XLM |
| `record_failed_attempt(wallet)` | Increment failed attempt counter |
| `is_locked(wallet)` | Return true if in 15-min lockout |
| `unlock(wallet)` | Reset lockout after 15 minutes (uses ledger time) |
| `change_pin(wallet, old_hash, new_hash)` | Update PIN if old hash is correct |
| `get_balance(wallet)` | Return XLM balance |

### Payment Transaction Logic (contract internal)
```
pay(from, to, amount, submitted_hash):
  1. Check is_locked(from) → reject if true
  2. Retrieve stored_hash = storage.get(PinHash(from))
  3. If submitted_hash != stored_hash:
       increment FailedAttempts(from)
       if FailedAttempts >= 3: set LockTimestamp(from) = now
       return error "INVALID_PIN"
  4. Check XLM balance of 'from' >= amount + fee
       if insufficient: return error "INSUFFICIENT_BALANCE"
  5. Transfer amount XLM from 'from' to 'to'
  6. Reset FailedAttempts(from) = 0
  7. Emit event: { from, to, amount, timestamp }
  8. Return success
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | **Next.js 14 (App Router)** |
| Styling | **Tailwind CSS + shadcn/ui** |
| QR Scanner | `@zxing/browser` |
| QR Generator | `qrcode.react` |
| Auth | **Supabase Auth (email OTP)** — no passwords |
| Database | **Supabase (PostgreSQL)** |
| Smart Contracts | **Rust + Soroban SDK** |
| Stellar JS SDK | `@stellar/stellar-sdk` |
| Key Encryption | Node.js `crypto` (AES-256-GCM) |
| PIN Hashing | **Web Crypto API** (browser-native, no library) |
| Hosting | **Vercel** |

---

## 📁 Repository Structure

```
perapin/
├── AGENTS.md                  ← This file (AI agent context)
├── docs/
│   └── perapin-prd.md         ← Full PRD — read before implementing any feature
├── app/                       ← Next.js App Router pages
│   ├── (auth)/                ← login, register/consumer, register/merchant
│   ├── consumer/              ← dashboard, qr, topup, history, settings
│   ├── merchant/              ← dashboard, scan, amount, handoff, result, history
│   ├── feedback/
│   └── api/                   ← Next.js API routes
│       ├── auth/
│       ├── user/
│       ├── payment/
│       ├── transactions/
│       └── wallet/
├── components/                ← Reusable UI components
├── lib/                       ← Utility functions
│   ├── stellar.ts             ← Stellar SDK helpers
│   ├── crypto.ts              ← AES-256-GCM key encryption/decryption
│   └── supabase.ts            ← Supabase client
├── contracts/                 ← Soroban smart contract (Rust)
│   └── perapin/
│       ├── src/
│       │   └── lib.rs
│       └── Cargo.toml
└── hooks/                     ← Custom React hooks
```

---

## 🗄️ Database Schema Summary

### `users` table
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `email` | VARCHAR UNIQUE | |
| `role` | ENUM ('consumer', 'merchant') | |
| `business_name` | VARCHAR NULLABLE | Merchant only |
| `stellar_public_key` | VARCHAR | Wallet public address |
| `stellar_private_key_enc` | TEXT | AES-256 encrypted private key |
| `created_at` | TIMESTAMP | |
| `last_login` | TIMESTAMP | |

### `transactions` table
| Column | Type | Notes |
|---|---|---|
| `stellar_tx_hash` | VARCHAR UNIQUE | On-chain tx hash |
| `from_user_id` | UUID (FK) | Consumer |
| `to_user_id` | UUID (FK) | Merchant |
| `amount_xlm` | DECIMAL | |
| `status` | ENUM ('success', 'failed') | |

---

## 🌐 API Routes

All routes live under `/api/` (Next.js API Routes).

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/request-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP, return session |
| POST | `/api/user/register` | Create user + generate Stellar wallet |
| GET | `/api/user/me` | Get current user profile + balance |
| GET | `/api/user/qr` | Return QR code image |
| POST | `/api/payment/initiate` | Core payment: verify → sign → submit |
| GET | `/api/transactions` | Transaction history |
| POST | `/api/feedback` | Submit feedback |
| GET | `/api/wallet/balance` | Get XLM balance from Stellar |

### `/api/payment/initiate` — Server-Side Process
1. Authenticate merchant session
2. Retrieve consumer's encrypted private key from Supabase
3. Decrypt in-memory (never log, never persist decrypted)
4. Build Soroban tx: `pay(consumer_wallet, merchant_wallet, amount, pin_hash)`
5. Sign with consumer's private key → submit to Stellar Testnet
6. On success: save to `transactions` table
7. Scrub decrypted key from memory
8. Return `{ success, tx_hash, amount }`

---

## 🚦 Hard Rules for AI Agents

These rules must be followed in every code generation session. Violating them requires
explicit user approval before proceeding.

### Architecture Rules
1. **Merchant-Pull ONLY** — never generate consumer-initiated payment flows
2. **Testnet ONLY** — all Stellar interactions use Testnet/Horizon testnet endpoints
3. **Custodial wallets** — private keys are always encrypted with AES-256-GCM before DB storage
4. **PIN hashing is client-side** — SHA-256(pin + public_key) using Web Crypto API; never server-side raw PIN handling
5. **Brute force lockout is on-chain** — enforce in Soroban contract, not just in the API layer

### Code Style Rules
6. Use **TypeScript** for all frontend and API route files
7. Use **Rust** for all Soroban contract code
8. Follow the folder structure defined above — do not create new top-level folders without approval
9. All environment variables must be prefixed: `NEXT_PUBLIC_` for client-safe, no prefix for server-only
10. Use `@stellar/stellar-sdk` — not `stellar-base` or any unofficial SDK

### Commit Convention
11. Use semantic commit prefixes: `feat:`, `fix:`, `contract:`, `docs:`, `style:`, `refactor:`, `test:`

### What's Out of Scope (MVP) — Never Build These
- Mainnet deployment
- PHP/fiat conversion
- KYC or ID verification
- Multi-currency support
- Merchant bank/GCash withdrawal
- Push notifications
- NFC payments
- Native iOS/Android apps
- Admin dashboard
- Consumer-pull payment model

---

## ✅ MVP Completion Checklist Reference

See [`docs/perapin-prd.md` Section 15](./docs/perapin-prd.md) for the full Level 4 compliance
checklist. Key milestones:
- [ ] Soroban contract deployed on Stellar Testnet (contract ID documented in README)
- [ ] Full payment flow: scan → amount → PIN → contract → confirmation
- [ ] At least 10 real on-chain wallet interactions
- [ ] Mobile responsive: tested at 375px, 390px, 412px viewports
- [ ] Feedback form live and collecting responses

---

*Last updated: July 2026 | PeraPin v1.0 MVP*
