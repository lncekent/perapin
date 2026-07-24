# PeraPin

Merchant-pull micro-payments for consumers with zero phone, battery, or signal.

## Problem

Digital wallets assume either the consumer has a working phone, or the merchant
has invested in card-reading hardware. Neither holds for the Philippines'
informal micro-economy: consumers regularly lose access to their money when
their phone dies, runs out of data, or loses signal, and micro-merchants
(sari-sari stores, school canteens, PUV drivers) can rarely afford or qualify
for a POS terminal or card-network merchant agreement.

## Solution

PeraPin flips the payment flow into a merchant-pull model. Consumers carry a
static QR sticker linked to their account at signup — no phone or power needed
at the moment of purchase. The merchant scans the QR with their own phone's
browser (no dedicated hardware) and hands the phone to the consumer to enter a
4-digit PIN. The PIN is combined with a one-time transaction nonce and hashed
client-side before being sent to this Soroban contract, which validates the
challenge, enforces spending limits, and settles the payment.

## Timeline

Built for the Stellar APAC Hackathon (Payment & Consumer Applications track),
submission window closing July 15, 2026.

## Stellar features used

- **Soroban smart contract** holds each consumer's PIN hash and validates the
  hash-plus-nonce challenge at the point of sale, enforcing per-transaction and
  daily spending limits on-chain.
- **Low fees and fast settlement** make it viable to process small-value
  micro-payments (₱5–₱150) that would be uneconomical on higher-fee chains.
- Future direction: Stellar anchors for real cash-in/cash-out, replacing the
  current demo-only `initial_balance` parameter with an actual funding flow.

## Vision and purpose

Give any smartphone-owning micro-merchant in the Philippines a zero-hardware,
zero-card-network way to accept digital payments — and give any consumer,
even with a dead or absent phone, a reliable way to pay.

## Prerequisites

- Rust (edition 2021 toolchain; a recent stable release, e.g. 1.85+, is
  recommended since current `soroban-sdk` releases pull in dependencies that
  require newer Rust editions)
- Stellar CLI (formerly distributed as `soroban-cli`; the command prefix is
  now `stellar`, e.g. `stellar contract build`, `stellar contract deploy`.
  If your environment still ships the older `soroban` binary, the same
  subcommands apply — just swap the prefix.)
- `wasm32v1-none` (or `wasm32-unknown-unknown`, depending on your CLI version)
  compilation target added via `rustup target add`

## How to build

```
stellar contract build
```

## How to test

```
cargo test
```

## How to deploy to testnet

```
stellar contract deploy \
  --wasm target/wasm32v1-none/release/perapin.wasm \
  --source-account <your-testnet-identity> \
  --network testnet \
  --alias perapin
```

## Production MVP setup

The app uses Supabase Auth email OTP, Supabase Postgres, and encrypted
custodial Testnet wallets. Before deploying, run
[`docs/supabase-schema.sql`](docs/supabase-schema.sql) in the Supabase SQL
editor, configure the Supabase email template to include the six-digit OTP
token, and populate every variable in `.env.example`.

The current production contract source now settles XLM through Stellar's
native asset contract inside `pay`; it must be redeployed before use. After
deployment, initialize it once with an operator address and the Testnet native
XLM Stellar Asset Contract address, then set `NEXT_PUBLIC_SOROBAN_CONTRACT_ID`
to the new contract ID. Do not use the previous contract ID: it only validated
PINs and did not move XLM.

For Level 4 evidence, document the deployed URL and contract explorer URL here,
then onboard ten real Testnet users, save their feedback through `/feedback`,
and record the scan → amount → PIN → confirmation flow.

## Sample CLI invocation

Register a consumer (dummy address and PIN hash — replace with real values):

```
stellar contract invoke \
  --id perapin \
  --source-account <your-testnet-identity> \
  --network testnet \
  -- \
  register_consumer \
  --consumer GDUMMYCONSUMERADDRESS... \
  --pin_hash 0000000000000000000000000000000000000000000000000000000000dead \
  --initial_balance 20000
```

## License

MIT
