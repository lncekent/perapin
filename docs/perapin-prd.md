# PeraPin — Product Requirements Document

**Version:** 1.0  
**Last Updated:** July 2026  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [Target Users & Personas](#4-target-users--personas)
5. [System Architecture Overview](#5-system-architecture-overview)
6. [User Flows](#6-user-flows)
7. [Feature Requirements (MVP Scope)](#7-feature-requirements-mvp-scope)
8. [Smart Contract Specification](#8-smart-contract-specification)
9. [Frontend Screens & Pages](#9-frontend-screens--pages)
10. [Database Schema](#10-database-schema)
11. [API Endpoints](#11-api-endpoints)
12. [Security Model](#12-security-model)
13. [Non-Functional Requirements](#13-non-functional-requirements)
14. [Tech Stack](#14-tech-stack)
15. [Level 4 Compliance Checklist](#15-level-4-compliance-checklist)
16. [Out of Scope (MVP)](#16-out-of-scope-mvp)
17. [Future Roadmap](#17-future-roadmap)

---

## 1. Executive Summary

**PeraPin** is a blockchain-based micro-payment system built on the Stellar network that enables consumers to pay for goods and services even when their smartphone is completely dead, offline, or left at home.

Instead of requiring the consumer's phone to be active, PeraPin flips the payment model into a **Merchant-Pull** system. The consumer carries a cheap, permanent, static QR code sticker (attached to their school ID, notebook, or keychain). The merchant uses their own phone to scan the sticker, enters the amount, then hands their phone to the consumer who types a private 4-digit PIN. A Soroban smart contract on the Stellar blockchain validates the PIN hash and executes the XLM transfer — all without the consumer's phone ever being turned on.

**Core Value Proposition:** Pay for anything with just a sticker and a PIN. No phone. No data. No battery needed.

---

## 2. Problem Statement

Traditional digital wallets (GCash, Maya, etc.) share a critical dependency: the consumer's phone must be powered on, charged, and connected to the internet at the moment of purchase.

This creates real-world failure points that cause anxiety and slow down high-traffic queues:

- Student's phone battery dies between classes before lunch
- No mobile signal inside a crowded university building or provincial area
- Consumer forgot their phone at home or in a dorm
- Mobile data has run out at the end of the month

These scenarios lock users out of their money entirely, forcing a scramble for exact coins or borrowing cash — creating friction at university canteens, print shops, sari-sari stores, and public transport.

**There is currently no digital payment option that works when the consumer has zero phone connectivity or power.**

---

## 3. Proposed Solution

PeraPin solves this by removing the consumer's phone from the payment equation entirely.

**How it works at a glance:**

1. The consumer registers once on the web app, sets a 4-digit PIN, and receives a downloadable static QR code sticker they can print and attach to any physical object they carry daily.
2. At the point of sale, the **merchant** opens PeraPin on their own phone, scans the consumer's QR sticker, and enters the purchase amount.
3. The merchant hands their phone to the consumer, who types their 4-digit PIN on the merchant's phone.
4. A Soroban smart contract on the Stellar Testnet validates the hashed PIN and instantly transfers XLM from the consumer's wallet to the merchant's wallet.
5. Both parties see a confirmation screen. Done.

The consumer's phone is never involved. No app needed. No internet needed on the consumer's side.

---

## 4. Target Users & Personas

### Persona A — The Consumer (Primary)

**Name:** Student / Daily Commuter  
**Age:** 16–30  
**Location:** University campus, urban/semi-rural Philippines  
**Tech Level:** Comfortable with smartphones, uses GCash/Maya casually  
**Pain Point:** Phone frequently dies or runs out of data during the school day. Hates carrying exact change. Wants a backup payment method that just works.  
**Goal:** Pay for lunch, photocopies, or a jeepney ride even when their phone is dead.

**Key behavior:** Registers once, prints their QR sticker, sticks it on their school ID or notebook, and never thinks about it again until they need to pay.

### Persona B — The Merchant (Secondary, but the active user)

**Name:** Canteen Operator / Print Shop Owner  
**Age:** 25–55  
**Location:** University campus, public market, roadside sari-sari store  
**Tech Level:** Basic smartphone user, uses the phone browser daily  
**Pain Point:** Customers don't have exact change. Accepting digital payment currently requires the customer to have working internet and an active app.  
**Goal:** Accept cashless micro-payments (₱5–₱500) quickly without requiring the customer to have a working phone.

**Key behavior:** Opens PeraPin in their mobile browser each morning, keeps it open. Scans, enters amount, hands phone over. Done in under 10 seconds.

---

## 5. System Architecture Overview

```
[Consumer QR Sticker]
        |
        | (Merchant scans with phone camera)
        v
[Next.js Web App — Merchant View]
        |
        | (Consumer enters PIN → app hashes it)
        v
[Next.js API Route — Backend]
        |
        | (Signs Stellar transaction with consumer's private key)
        v
[Soroban Smart Contract on Stellar Testnet]
        |
        | (Verifies hash → executes XLM transfer)
        v
[Consumer Stellar Wallet] ——XLM——> [Merchant Stellar Wallet]
```

### Component Roles

| Component | Role |
|---|---|
| Static QR Sticker | Contains consumer's Stellar public key. Permanent, printable, costs nothing. |
| Next.js Frontend | Mobile-responsive web app serving both consumer and merchant views. |
| Next.js API Routes | Backend logic: wallet management, key encryption/decryption, transaction signing. |
| Supabase (PostgreSQL) | Stores user accounts, merchant profiles, encrypted wallet keys. |
| Soroban Smart Contract | On-chain PIN hash verification, XLM transfer execution, brute-force lockout. |
| Stellar Testnet | Blockchain infrastructure for development and Level 4 submission. |
| Vercel | Hosting for the frontend and API routes. |

---

## 6. User Flows

### 6.1 Consumer Registration Flow

```
1.  Consumer visits PeraPin web app (mobile or desktop browser)
2.  Clicks "Create Account" → enters email address
3.  Receives OTP (one-time password) via email
4.  Enters OTP → account created
5.  App generates a Stellar keypair (custodial — backend holds the private key, encrypted)
6.  Consumer sets a 4-digit PIN
7.  App hashes PIN client-side: SHA-256(PIN + wallet_public_key) = pin_hash
8.  App calls Soroban contract: register(wallet_public_key, pin_hash)
9.  Contract stores pin_hash on-chain
10. Consumer is taken to their dashboard
11. Consumer downloads/prints their QR sticker (PNG or PDF)
12. Consumer physically attaches QR sticker to their ID card, notebook, or keychain
```

**What the QR sticker contains:** Only the consumer's Stellar public key (e.g., `GABC...XYZ`). Nothing else. No name. No phone number. No personal data.

### 6.2 Merchant Registration Flow

```
1.  Merchant visits PeraPin web app on their phone
2.  Clicks "Register as Merchant" → enters email + business name
3.  Receives OTP via email → verifies
4.  App generates a Stellar keypair for the merchant (custodial)
5.  Merchant is taken to their dashboard showing their QR code for receiving funds
6.  Merchant bookmarks the app or adds it to their phone's home screen
```

### 6.3 Payment Transaction Flow (Happy Path)

```
1.  Merchant opens PeraPin in their mobile browser
2.  Merchant taps "Accept Payment"
3.  Camera opens → Merchant scans consumer's QR sticker
4.  App reads the consumer's wallet public key from QR
5.  App displays: "Paying from: [wallet short ID] — Enter amount:"
6.  Merchant enters amount (e.g., ₱15.00)
7.  Merchant taps "Next" and hands phone to consumer
8.  Consumer sees a full-screen PIN entry pad (dots, not digits)
9.  Consumer enters their 4-digit PIN
10. App hashes PIN client-side: SHA-256(PIN + consumer_wallet_public_key) = pin_hash
11. App sends request to Next.js API: { consumer_wallet, merchant_wallet, amount, pin_hash }
12. API retrieves consumer's encrypted private key from Supabase, decrypts it in memory
13. API builds Soroban transaction: pay(consumer_wallet, merchant_wallet, amount, pin_hash)
14. API signs transaction with consumer's private key and submits to Stellar Testnet
15. Soroban contract verifies: SHA-256(pin_hash stored) == submitted pin_hash
16. If match → contract transfers XLM from consumer wallet to merchant wallet
17. API returns success → frontend shows confirmation screen
18. Merchant sees: "₱15.00 received from [short ID]" ✓
19. Consumer sees: "₱15.00 sent to [merchant name]" ✓
20. Phone is returned to merchant. Transaction complete.
```

### 6.4 Error Flows

**Wrong PIN (1st or 2nd attempt):**
- Contract returns error
- Frontend shows: "Incorrect PIN. X attempts remaining."
- Consumer can try again

**Wrong PIN (3rd attempt):**
- Contract triggers lockout for the consumer wallet
- Frontend shows: "Too many incorrect attempts. Account locked for 15 minutes."
- Consumer must wait or contact support to reset

**Insufficient Balance:**
- Contract checks balance before transfer
- Frontend shows: "Insufficient XLM balance. Please top up your wallet."
- Transaction cancelled, no funds moved

**Consumer wallet not registered:**
- Contract returns error (no pin_hash found for this wallet)
- Frontend shows: "This QR code is not linked to a PeraPin account."

**Network/RPC error:**
- API returns timeout/failure
- Frontend shows: "Payment could not be processed. Please try again."
- No funds are moved (transaction was not submitted or failed atomically)

---

## 7. Feature Requirements (MVP Scope)

### 7.1 Consumer Features

| Feature | Priority | Description |
|---|---|---|
| Email registration + OTP | Must Have | Sign up with email, verify via one-time code |
| Custodial Stellar wallet creation | Must Have | Auto-generated wallet, private key stored encrypted |
| 4-digit PIN setup | Must Have | Set PIN, hashed client-side before storage |
| PIN change | Should Have | Allow consumer to update PIN from dashboard |
| QR sticker download | Must Have | PNG download of their static QR code |
| Consumer dashboard | Must Have | Shows XLM balance, recent transactions |
| Transaction history | Must Have | List of past payments with timestamp and merchant name |
| Wallet top-up info | Must Have | Display public key so user can receive XLM (testnet faucet link for MVP) |
| Feedback submission | Must Have | Simple satisfaction form (required for Level 4) |

### 7.2 Merchant Features

| Feature | Priority | Description |
|---|---|---|
| Email registration + OTP | Must Have | Same auth system as consumer |
| Custodial receiving wallet | Must Have | Merchant wallet for receiving XLM |
| QR scanner page | Must Have | Camera-based QR scanner for consumer stickers |
| Amount entry | Must Have | Numeric input after scanning |
| PIN entry handoff screen | Must Have | Full-screen PIN pad for consumer to use |
| Payment confirmation screen | Must Have | Clear success/failure result with amount |
| Merchant dashboard | Must Have | Shows XLM balance, incoming transaction history |
| Business name display | Should Have | Show merchant name on consumer's confirmation |

### 7.3 Smart Contract Functions

| Function | Description |
|---|---|
| `register(wallet_address, pin_hash)` | Stores pin_hash for a wallet address. One-time setup per wallet. |
| `pay(from_wallet, to_wallet, amount, submitted_hash)` | Verifies hash, checks balance, executes XLM transfer, resets attempt counter on success |
| `record_failed_attempt(wallet_address)` | Increments failed attempt counter for a wallet |
| `is_locked(wallet_address)` | Returns true if wallet is in lockout state |
| `unlock(wallet_address)` | Resets lockout after 15-minute cooldown (checked via Stellar ledger timestamp) |
| `change_pin(wallet_address, old_hash, new_hash)` | Updates PIN hash if old hash is correct |
| `get_balance(wallet_address)` | Returns XLM balance for a wallet |

---

## 8. Smart Contract Specification

**Language:** Rust (Soroban SDK)  
**Network:** Stellar Testnet  
**Contract Storage Layout:**

```rust
// Persistent storage keys
enum DataKey {
    PinHash(Address),        // Stores SHA-256 pin hash per wallet
    FailedAttempts(Address), // Counter: 0, 1, 2, 3 (3 = locked)
    LockTimestamp(Address),  // Ledger timestamp when lockout started
}
```

**PIN Hashing Convention:**

The PIN hash is always computed as:
```
pin_hash = SHA-256(raw_4_digit_pin + consumer_stellar_public_key)
```

The public key is used as a salt to prevent rainbow table attacks across users. This computation happens **client-side in the browser** using the Web Crypto API. The raw PIN never leaves the consumer's device.

**Lockout Logic:**

- After 3 consecutive failed attempts: wallet is locked for 15 minutes (measured in Stellar ledger time)
- A successful payment resets the failed attempt counter to 0
- Lockout state and timestamp are stored on-chain, making them tamper-proof

**Transaction Flow Inside Contract:**

```
pay(from, to, amount, submitted_hash) {
    1. Check is_locked(from) → if true, reject
    2. Retrieve stored_hash = get(PinHash(from))
    3. If submitted_hash != stored_hash:
          increment FailedAttempts(from)
          if FailedAttempts >= 3: set LockTimestamp(from) = now
          return error "INVALID_PIN"
    4. Check XLM balance of 'from' >= amount + transaction fee
       if insufficient: return error "INSUFFICIENT_BALANCE"
    5. Transfer amount XLM from 'from' to 'to'
    6. Reset FailedAttempts(from) = 0
    7. Emit payment event: { from, to, amount, timestamp }
    8. Return success
}
```

---

## 9. Frontend Screens & Pages

All pages must be mobile-responsive (320px–1200px). The primary use case is the merchant on a phone (375px viewport).

### Page List

| Route | User | Description |
|---|---|---|
| `/` | Public | Landing page — explains PeraPin, CTAs for consumer and merchant signup |
| `/register/consumer` | Consumer | Email + OTP registration form |
| `/register/merchant` | Merchant | Email + business name + OTP form |
| `/login` | Both | Email + OTP login |
| `/consumer/dashboard` | Consumer | Balance, recent transactions, QR sticker download |
| `/consumer/qr` | Consumer | Full-screen QR code view + download button |
| `/consumer/topup` | Consumer | Shows public key + testnet faucet link |
| `/consumer/history` | Consumer | Full transaction history |
| `/consumer/settings` | Consumer | Change PIN, account info |
| `/merchant/dashboard` | Merchant | Balance, incoming transactions, "Accept Payment" button |
| `/merchant/scan` | Merchant | Camera QR scanner page |
| `/merchant/amount` | Merchant | Amount entry after QR scanned |
| `/merchant/handoff` | Merchant | Full-screen PIN pad for consumer to enter PIN |
| `/merchant/result` | Merchant | Success or failure confirmation |
| `/merchant/history` | Merchant | Full incoming transaction history |
| `/feedback` | Both | Short satisfaction form (Level 4 requirement) |

### Key UI States to Handle

**`/merchant/handoff` (most critical screen):**
- Must fill the entire screen (no UI chrome visible)
- Large PIN dot indicators (not digits)
- "Cancel" button accessible to merchant (bottom corner, small)
- Countdown timer showing "waiting for PIN..." state
- No back-navigation visible to consumer (prevents confusion)

**`/merchant/scan`:**
- Must request camera permission gracefully
- Fallback: manual wallet address entry for devices where camera fails
- Show last scanned QR with option to re-scan

**Loading states required on:**
- All form submissions
- QR scan processing
- Payment processing (show "Processing payment..." spinner with estimated time)
- Dashboard data loading

---

## 10. Database Schema

### `users` table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `email` | VARCHAR UNIQUE | User's email address |
| `role` | ENUM ('consumer', 'merchant') | Determines routing after login |
| `business_name` | VARCHAR NULLABLE | Merchant only |
| `stellar_public_key` | VARCHAR | The wallet's public address |
| `stellar_private_key_enc` | TEXT | AES-256 encrypted private key |
| `created_at` | TIMESTAMP | Account creation time |
| `last_login` | TIMESTAMP | Last successful login |

### `transactions` table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `stellar_tx_hash` | VARCHAR UNIQUE | On-chain transaction hash |
| `from_user_id` | UUID (FK → users) | Consumer |
| `to_user_id` | UUID (FK → users) | Merchant |
| `amount_xlm` | DECIMAL | Amount transferred |
| `amount_php_approx` | DECIMAL NULLABLE | Approximate PHP value at time of transaction |
| `status` | ENUM ('success', 'failed') | Result |
| `created_at` | TIMESTAMP | When transaction was processed |

### `otp_codes` table

| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `email` | VARCHAR | Target email |
| `code` | VARCHAR(6) | 6-digit OTP |
| `expires_at` | TIMESTAMP | 10 minutes from creation |
| `used` | BOOLEAN | Prevent replay |

---

## 11. API Endpoints

All endpoints are Next.js API Routes under `/api/`.

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/request-otp` | Send OTP to email |
| POST | `/api/auth/verify-otp` | Verify OTP, return session token |
| POST | `/api/user/register` | Create user + generate Stellar wallet |
| GET | `/api/user/me` | Get current user profile + balance |
| GET | `/api/user/qr` | Return QR code image for consumer wallet |
| POST | `/api/payment/initiate` | Process payment: verify hash, sign tx, submit |
| GET | `/api/transactions` | Get transaction history for current user |
| POST | `/api/feedback` | Submit user feedback |
| GET | `/api/wallet/balance` | Get current XLM balance from Stellar |

### `/api/payment/initiate` — Detail

**Request body:**
```json
{
  "consumer_wallet": "GABC...XYZ",
  "merchant_wallet": "GDEF...ABC",
  "amount_xlm": "10.5",
  "pin_hash": "abc123...sha256hex"
}
```

**Server-side process:**
1. Authenticate merchant (session check)
2. Retrieve consumer's encrypted private key from Supabase
3. Decrypt private key in memory (never log or persist decrypted key)
4. Build Soroban transaction calling `pay(consumer_wallet, merchant_wallet, amount, pin_hash)`
5. Sign transaction with consumer's private key
6. Submit to Stellar Testnet via Horizon RPC
7. On success: save transaction record to `transactions` table
8. Return `{ success: true, tx_hash: "...", amount: "..." }`
9. Scrub decrypted private key from memory

**Response codes:**
- `200` — Payment successful
- `400` — Invalid PIN / Wallet locked / Insufficient balance (error code in body)
- `401` — Merchant not authenticated
- `500` — Stellar network or server error

---

## 12. Security Model

### What's in the QR sticker?

Only the consumer's **Stellar public key**. This is public information by design in blockchain systems — knowing someone's public key lets you send them money, but not take it. Displaying or sharing your public key carries zero security risk.

### PIN Security

| Stage | What happens |
|---|---|
| Consumer enters PIN | Raw digits typed on screen, masked with dots |
| Client-side hashing | `SHA-256(raw_pin + stellar_public_key)` computed in browser |
| Transmission | Only the hash is sent to the server — raw PIN never transmitted |
| Server-side | Hash is included in the Soroban transaction — server never sees raw PIN |
| On-chain storage | Only the hash stored in contract storage — irreversible |

**The raw PIN never leaves the browser.** Even if the API server is compromised, no PINs are exposed.

### Brute Force Protection

- 3 failed attempts → 15-minute lockout enforced on-chain
- Lockout is on the **smart contract level** — cannot be bypassed by calling the API
- After lockout: automatic unlock after 15 minutes (no admin action required)
- Failed attempts reset to 0 on any successful payment

### Custodial Key Security

- Consumer private keys are encrypted with AES-256-GCM before storage in Supabase
- Encryption key is stored in environment variables (Vercel secrets), never in the database
- Decryption happens in-memory only during a payment request, then immediately discarded
- No private key is ever returned to the frontend

### What if someone steals your QR sticker?

They have your public key. Without your 4-digit PIN, they cannot initiate any payment from your wallet. The QR sticker alone is completely useless for attacking you.

### PIN entry on merchant's phone — social risk

The consumer types their PIN on the merchant's device. Mitigations:
- PIN digits are masked (dots only), making shoulder-surfing harder
- Large PIN pad fills the full screen to minimize viewing angles
- The merchant is physically present — same trust level as entering an ATM PIN at a terminal

This is an accepted UX trade-off for the offline-phone use case. Future versions may explore NFC or on-device biometrics.

---

## 13. Non-Functional Requirements

### Performance
- Payment flow (from PIN entry to confirmation) must complete in under 5 seconds on average
- Page load time under 3 seconds on a 4G mobile connection
- QR scanner must initialize within 2 seconds of entering scan page

### Availability
- Target: 99% uptime (Vercel + Supabase free tier SLAs)
- Graceful degradation: show clear error screens when Stellar network is slow, not blank pages

### Mobile-First Design
- All screens designed at 375px width first
- Touch targets minimum 44×44px
- No horizontal scrolling on any screen
- Fonts minimum 16px on form inputs (prevents iOS auto-zoom)
- Camera permission handled gracefully with fallback input

### Error Handling (all cases must be handled explicitly)
- Wrong PIN (1st/2nd attempt) — show remaining attempts
- Wrong PIN (3rd attempt) — show lockout with timer
- Insufficient XLM balance — show balance + top-up link
- Unregistered QR code — show helpful message
- Camera permission denied — show manual input fallback
- Network timeout — show retry button (no double-submit)
- Stellar network degraded — show status message

### Monitoring & Analytics
- Vercel Analytics enabled for page views and web vitals
- Custom analytics events to track:
  - Successful payments (count + total volume)
  - Failed payment reasons (wrong PIN / insufficient balance / network)
  - Merchant scan-to-pay funnel drop-offs
  - QR sticker downloads

---

## 14. Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | SSR, file-based routing, API routes in one codebase |
| Styling | Tailwind CSS | Mobile-first, rapid development |
| UI Components | shadcn/ui | Accessible, unstyled base components |
| QR Scanner | `@zxing/browser` | Best-in-class browser camera QR scanning |
| QR Generator | `qrcode.react` | Simple, reliable QR image generation |
| Authentication | Supabase Auth (email OTP) | Free, simple, no password management needed |
| Database | Supabase (PostgreSQL) | Free tier, real-time, integrates with auth |
| Blockchain | Stellar Testnet | Level 4 requirement; fast, low-fee transactions |
| Smart Contracts | Rust + Soroban SDK | Stellar's native smart contract platform |
| Stellar SDK | `@stellar/stellar-sdk` (JS) | Official SDK for transaction building and submission |
| Key Encryption | Node.js `crypto` (AES-256-GCM) | Built-in, no extra dependencies |
| PIN Hashing | Web Crypto API (SHA-256) | Client-side, browser-native, no library needed |
| Hosting | Vercel (free tier) | Auto-deploys from GitHub, free SSL |
| Analytics | Vercel Analytics | Zero-config, privacy-friendly |
| Version Control | GitHub (public repo) | Level 4 requirement |

---

## 15. Level 4 Compliance Checklist

Use this checklist before your Level 4 submission.

### Production MVP
- [ ] Web app is deployed and publicly accessible via a live URL
- [ ] Consumer registration flow works end-to-end
- [ ] Merchant registration flow works end-to-end
- [ ] Full payment flow (scan → amount → PIN → contract → confirmation) works
- [ ] Soroban smart contract deployed on Stellar Testnet
- [ ] Smart contract handles: successful payment, wrong PIN, lockout, insufficient balance

### Stable Architecture
- [ ] Frontend and smart contract code are separated cleanly in the repo
- [ ] Environment variables used for all secrets (no hardcoded keys)
- [ ] Error boundaries in place — no uncaught exceptions visible to users

### Mobile Responsive UI
- [ ] Tested on 375px (iPhone SE), 390px (iPhone 14), 412px (Pixel)
- [ ] All touch targets are at least 44×44px
- [ ] Merchant scan page works on mobile browser camera
- [ ] No horizontal scroll on any page

### Loading States & Error Handling
- [ ] Payment processing shows spinner (prevents double-tap)
- [ ] Wrong PIN shows remaining attempts
- [ ] Wallet lockout shows clear message + countdown
- [ ] Network errors show retry option
- [ ] Camera permission denial shows fallback input

### User Onboarding (minimum 10 real users)
- [ ] At least 10 unique users have created accounts
- [ ] At least 10 real on-chain wallet interactions (visible on Stellar testnet explorer)
- [ ] User feedback collected (link to feedback form shared with all users)

### Product Quality
- [ ] Vercel Analytics enabled and showing data
- [ ] Feedback form responses saved (Google Form or Supabase)
- [ ] README.md in GitHub repo explains the project clearly
- [ ] Code is organized: `/app`, `/components`, `/lib`, `/contracts` folders
- [ ] No console errors in production

### Technical Standards
- [ ] Soroban contract deployed to Stellar Testnet (contract address documented in README)
- [ ] At least 15 meaningful commits in the public GitHub repo
- [ ] Commits follow a pattern: `feat:`, `fix:`, `contract:`, `docs:` prefixes

### Demo & Review
- [ ] Live demo video recorded (screen record the full payment flow)
- [ ] Video shows: consumer QR sticker, merchant scan, PIN entry, confirmation
- [ ] README includes link to live app + contract address on testnet explorer

---

## 16. Out of Scope (MVP)

The following are explicitly excluded from the Level 4 MVP and should not be built now:

- **Mainnet deployment** — Testnet only for Level 4
- **PHP/fiat currency conversion** — Show XLM amounts only for now
- **KYC / Government ID verification** — Not needed for testnet MVP
- **Multi-currency support** — XLM only
- **Merchant withdrawal to bank / GCash** — Out of scope until mainnet
- **Push notifications** — Email or in-app only
- **NFC payments** — QR sticker only for now
- **Merchant QR-on-display payments** — Consumer-pull model is explicitly out of scope; PeraPin is Merchant-Pull only
- **Admin dashboard** — No backend admin panel for MVP
- **Mobile app (iOS/Android)** — Web only (PWA-ready but no native app)

---

## 17. Future Roadmap

### Level 5 (Blue Belt) — Scale & Feedback
- Onboard 50 real users (from campus pilot)
- Professional pitch deck for PeraPin
- In-app feedback system with ratings
- Transaction speed optimizations
- Merchant analytics (peak hours, top items)
- Basic KYC (email + school ID photo) for higher limits

### Level 6 (Black Belt) — Mainnet Launch
- Deploy smart contract to Stellar Mainnet
- At least 20 real mainnet users
- Security audit of smart contract before mainnet
- PHP/XLM conversion display using real-time rates
- PHP off-ramp research (integration with local Stellar anchors)
- Twitter/X project account with regular updates
- 30+ total users with proof of on-chain activity

### Post-Level 6 Vision
- NFC sticker variant (upgrade from QR)
- Merchant API for integration with existing POS systems
- "PeraPin Business" tier with merchant analytics and bulk management
- Potential Stellar Community Fund (SCF) grant application (up to $150,000)
- Partnership with Philippine universities for official campus digital payment pilot

---

*This PRD covers the complete Level 4 (Green Belt) MVP scope. Refer to this document before implementing each feature. Update this document when scope changes are agreed upon.*

*Built for the Stellar Journey to Mastery — Monthly Builder Challenges (Rise In × Stellar Foundation)*