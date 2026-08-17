import { NextRequest, NextResponse } from "next/server";
import { dbGetUserByPublicKey, dbGetUserById, dbRecordTransaction } from "@/lib/supabase";
import { decryptPrivateKey } from "@/lib/crypto";
import { invokePayOnChain, checkIsLockedOnChain, getFailedAttemptsOnChain } from "@/lib/stellar";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * POST /api/payment/transfer
 * Consumer-to-Consumer (P2P) "Send Money" Handler
 *
 * How this differs from /api/payment/initiate (Merchant-Pull):
 * ─────────────────────────────────────────────────────────────
 * • Merchant-Pull  → the MERCHANT is authenticated and submits on behalf of an
 *   offline consumer who taps their PIN on the merchant's device.
 * • P2P Send (this) → the SENDING CONSUMER is authenticated on their OWN device
 *   and authorizes the transfer with their own PIN. Both parties have phones.
 *
 * Both flows reuse the SAME on-chain Soroban pay(from, to, amount, pin_hash)
 * function — only the actor initiating and the PIN owner differ. The PIN hash
 * is therefore computed client-side against the SENDER's public key.
 *
 * Security invariants (mirrors AGENTS.md):
 * 1. PIN hash arrives pre-computed from the browser: SHA-256(pin + sender_public_key).
 * 2. Sender's AES-256 key is decrypted in memory only, never persisted or logged.
 * 3. Soroban enforces on-chain PIN verification + 15-minute brute-force lockout.
 * 4. Decrypted key is scrubbed in a finally block.
 */
export async function POST(req: NextRequest) {
  let decryptedSenderKey: string | null = null;

  try {
    // ── Authenticate the SENDING consumer (their own session) ──────
    const senderAuth = await getAuthenticatedUser();
    if (!senderAuth) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

    const sender = await dbGetUserById(senderAuth.id);
    if (!sender || sender.role !== "consumer") {
      return NextResponse.json({ error: "CONSUMER_AUTH_REQUIRED" }, { status: 403 });
    }

    const body = await req.json();
    const { recipientPublicKey, amountXlm, pinHash } = body;

    // ── Input Validation ──────────────────────────────────────────
    if (!recipientPublicKey || !amountXlm || !pinHash) {
      return NextResponse.json(
        { error: "Missing required parameters: recipientPublicKey, amountXlm, pinHash" },
        { status: 400 },
      );
    }

    if (!/^G[A-Z2-7]{55}$/.test(recipientPublicKey)) {
      return NextResponse.json(
        { error: "Invalid recipient Stellar public key." },
        { status: 400 },
      );
    }

    // Block sending to yourself.
    if (recipientPublicKey === sender.stellar_public_key) {
      return NextResponse.json(
        { error: "CANNOT_SEND_TO_SELF", message: "You can't send money to your own wallet." },
        { status: 400 },
      );
    }

    const numericAmount = parseFloat(amountXlm);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: "Transfer amount must be greater than 0 XLM" },
        { status: 400 },
      );
    }

    if (typeof pinHash !== "string" || !/^[a-f0-9]{64}$/i.test(pinHash)) {
      return NextResponse.json(
        { error: "Invalid pinHash format. Expected 64-character hex SHA-256 hash" },
        { status: 400 },
      );
    }

    // ── Step 1: Ensure the SENDER's wallet is not locked on-chain ──
    const isLocked = await checkIsLockedOnChain(sender.stellar_public_key);
    if (isLocked) {
      return NextResponse.json(
        {
          error: "WALLET_LOCKED",
          message:
            "Your wallet is locked for 15 minutes after 3 consecutive failed PIN attempts.",
        },
        { status: 423 },
      );
    }

    // ── Step 2: Resolve the recipient (must be a registered consumer) ──
    const recipient = await dbGetUserByPublicKey(recipientPublicKey);
    if (!recipient || recipient.role !== "consumer" || !recipient.pin_registered_at) {
      return NextResponse.json(
        {
          error: "RECIPIENT_NOT_FOUND",
          message: "This QR code is not linked to an active PeraPin consumer.",
        },
        { status: 404 },
      );
    }

    // ── Step 3: Decrypt the sender's custodial key in memory ───────
    decryptedSenderKey = decryptPrivateKey(sender.stellar_private_key_enc);

    // ── Step 4: Invoke the same Soroban pay() — sender authorizes ──
    const payResult = await invokePayOnChain(
      decryptedSenderKey,
      recipientPublicKey,
      numericAmount,
      pinHash,
    );

    // ── Step 5: Scrub decrypted key immediately ────────────────────
    decryptedSenderKey = null;

    if (!payResult.success) {
      if (payResult.error === "INVALID_PIN") {
        const failedAttempts = await getFailedAttemptsOnChain(sender.stellar_public_key);
        if (failedAttempts >= 3) {
          return NextResponse.json(
            {
              error: "WALLET_LOCKED",
              message: "Too many incorrect PIN attempts. Your wallet is locked for 15 minutes.",
            },
            { status: 423 },
          );
        }
        return NextResponse.json(
          {
            error: "INVALID_PIN",
            message: "Incorrect PIN.",
            remainingAttempts: Math.max(0, 3 - failedAttempts),
          },
          { status: 400 },
        );
      }
      return NextResponse.json(
        {
          error: "TRANSFER_FAILED",
          message: payResult.error || "PIN verification failed or insufficient balance.",
        },
        { status: 400 },
      );
    }

    // ── Step 6: Record the transaction ─────────────────────────────
    const txRecord = await dbRecordTransaction({
      stellar_tx_hash: payResult.txHash || `tx_${Date.now()}`,
      from_user_id: sender.id,
      from_public_key: sender.stellar_public_key,
      to_user_id: recipient.id,
      to_public_key: recipientPublicKey,
      amount_xlm: numericAmount,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      txHash: payResult.txHash,
      amountXlm: numericAmount,
      senderPublicKey: sender.stellar_public_key,
      recipientPublicKey,
      timestamp: txRecord.created_at,
    });
  } catch (error: any) {
    decryptedSenderKey = null;
    return NextResponse.json(
      { error: "Internal transfer handler error: " + error.message },
      { status: 500 },
    );
  } finally {
    decryptedSenderKey = null;
  }
}
