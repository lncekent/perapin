import { NextRequest, NextResponse } from "next/server";
import { dbGetUserByPublicKey, dbGetUserById, dbRecordTransaction } from "@/lib/supabase";
import { decryptPrivateKey } from "@/lib/crypto";
import { invokePayOnChain, checkIsLockedOnChain, getWalletBalanceXlm } from "@/lib/stellar";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * POST /api/payment/initiate
 * Core PeraPin Merchant-Pull Payment Handler
 *
 * Requirements from AGENTS.md:
 * 1. Merchant-Pull ONLY — merchant device submits payload on behalf of consumer.
 * 2. PIN hash arrives pre-computed from browser: SHA-256(pin + consumer_public_key).
 * 3. Server decrypts consumer's AES-256 key in memory (never persisted or logged).
 * 4. Soroban smart contract enforces on-chain PIN verification & 15-minute brute-force lockout.
 * 5. Private key is scrubbed from memory immediately after execution.
 */
export async function POST(req: NextRequest) {
  let decryptedConsumerKey: string | null = null;

  try {
    const merchantAuth = await getAuthenticatedUser();
    if (!merchantAuth) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
    const authenticatedMerchant = await dbGetUserById(merchantAuth.id);
    if (!authenticatedMerchant || authenticatedMerchant.role !== "merchant") {
      return NextResponse.json({ error: "MERCHANT_AUTH_REQUIRED" }, { status: 403 });
    }

    const body = await req.json();
    const { consumerPublicKey, merchantPublicKey, amountXlm, pinHash } = body;

    // ── Input Validation ──────────────────────────────────────────
    if (!consumerPublicKey || !merchantPublicKey || !amountXlm || !pinHash) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: consumerPublicKey, merchantPublicKey, amountXlm, pinHash",
        },
        { status: 400 },
      );
    }

    const numericAmount = parseFloat(amountXlm);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than 0 XLM" },
        { status: 400 },
      );
    }

    if (typeof pinHash !== "string" || !/^[a-f0-9]{64}$/i.test(pinHash)) {
      return NextResponse.json(
        { error: "Invalid pinHash format. Expected 64-character hex SHA-256 hash" },
        { status: 400 },
      );
    }
    if (merchantPublicKey !== authenticatedMerchant.stellar_public_key) {
      return NextResponse.json({ error: "MERCHANT_WALLET_MISMATCH" }, { status: 403 });
    }

    // ── Step 1: Check if Consumer Wallet is Locked On-Chain ───────
    const isLocked = await checkIsLockedOnChain(consumerPublicKey);
    if (isLocked) {
      return NextResponse.json(
        {
          error: "WALLET_LOCKED",
          message:
            "Consumer wallet is currently locked out for 15 minutes due to 3 consecutive failed PIN attempts.",
        },
        { status: 423 },
      );
    }

    // ── Step 2: Fetch Consumer Record & Decrypt Custodial Key ──────
    const consumerUser = await dbGetUserByPublicKey(consumerPublicKey);
    if (!consumerUser) {
      return NextResponse.json(
        { error: "CONSUMER_NOT_FOUND", message: "No registered wallet found for this QR code." },
        { status: 404 },
      );
    }

    const merchantUser = authenticatedMerchant;

    // Decrypt consumer private key in-memory
    decryptedConsumerKey = decryptPrivateKey(consumerUser.stellar_private_key_enc);

    // ── Step 3: Invoke Soroban Smart Contract `pay()` ─────────────
    const payResult = await invokePayOnChain(
      decryptedConsumerKey,
      merchantPublicKey,
      numericAmount,
      pinHash,
    );

    // ── Step 4: Scrub Decrypted Key from Memory Immediately ────────
    decryptedConsumerKey = null;

    if (!payResult.success) {
      return NextResponse.json(
        {
          error: "PAYMENT_FAILED",
          message: payResult.error || "PIN verification failed or insufficient balance.",
        },
        { status: 400 },
      );
    }

    // ── Step 5: Save Transaction to Database ───────────────────────
    const txRecord = await dbRecordTransaction({
      stellar_tx_hash: payResult.txHash || `tx_${Date.now()}`,
      from_user_id: consumerUser.id,
      from_public_key: consumerPublicKey,
      to_user_id: merchantUser.id,
      to_public_key: merchantPublicKey,
      amount_xlm: numericAmount,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      txHash: payResult.txHash,
      amountXlm: numericAmount,
      consumerPublicKey,
      merchantPublicKey,
      timestamp: txRecord.created_at,
    });
  } catch (error: any) {
    // Ensure scrubbing even on unexpected exceptions
    decryptedConsumerKey = null;
    return NextResponse.json(
      { error: "Internal payment handler error: " + error.message },
      { status: 500 },
    );
  } finally {
    decryptedConsumerKey = null;
  }
}
