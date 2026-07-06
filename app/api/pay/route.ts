import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Helper to compute SHA-256 on the server to verify client hashes
function computeSha256(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      customerId, 
      merchantId, 
      amount, 
      nonce, 
      clientHash, 
      expectedPin // In a simulated server, we pass the PIN or fetch from simulated database (localStorage) to verify
    } = body;

    if (!customerId || !merchantId || !amount || !nonce || !clientHash || !expectedPin) {
      return NextResponse.json(
        { error: "Missing required transaction parameters" },
        { status: 400 }
      );
    }

    if (parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: "Transaction amount must be greater than zero" },
        { status: 400 }
      );
    }

    // Cryptographic validation:
    // Construct the expected preimage: customerId + expectedPin + nonce + amount
    const preimage = `${customerId}:${expectedPin}:${nonce}:${amount}`;
    const computedHash = computeSha256(preimage);

    // Verify if the client-submitted hash matches the contract-computed hash
    const isValid = computedHash === clientHash;

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: "AUTHENTICATION_FAILED",
        message: "Invalid customer PIN. Transaction signatures do not match.",
        debug: {
          submittedHash: clientHash,
          preimageAttempt: `${customerId}:****:${nonce}:${amount}`
        }
      }, { status: 401 });
    }

    // Prepare simulated Stellar transaction success details
    const txId = crypto.randomBytes(32).toString("hex");
    const ledgerIndex = Math.floor(6420000 + Math.random() * 500);
    const feeChargedXlm = "0.0001"; // Soroban standard minimum fee

    return NextResponse.json({
      success: true,
      transactionId: `tx_${txId.slice(0, 24)}`,
      ledgerSequence: ledgerIndex,
      stellarFeePaidXlm: feeChargedXlm,
      settlementTime: new Date().toISOString(),
      sorobanEventEmitted: "PeraPinSettlementEvent",
      paymentProof: {
        preimageHash: computedHash,
        nonceVerified: nonce,
        contractAddress: "CCPERAPIN777...SOROBAN"
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Soroban execution error: " + error.message },
      { status: 500 }
    );
  }
}
